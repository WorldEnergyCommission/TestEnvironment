package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"reflect"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/gomodule/redigo/redis"
	_ "github.com/lib/pq"
	"github.com/puzpuzpuz/xsync/v3"
	"github.com/samber/lo"
	"k8s.io/apimachinery/pkg/util/sets"

	"github.com/eneries/eneries/api/pkg/resource/measurement"
	"github.com/eneries/eneries/api/pkg/resource/rule"
	"github.com/eneries/eneries/api/pkg/utils"
)

const refreshActiveRulesPerProjectInterval = 10 * time.Second
const handleRulesTimeoutInterval = 1 * time.Second

type MonitoredRule struct {
	Rule           rule.Rule
	Triggered      bool
	ExpirationTime utils.Optional[int64]
}

var (
	// database environment variables
	envDbAddr        = os.Getenv("DB_ADDR")
	envDbPort        = os.Getenv("DB_PORT")
	envDbName        = os.Getenv("DB_NAME")
	envDbUser        = os.Getenv("DB_USER")
	envDbPass        = os.Getenv("DB_PASS")
	envDbMode        = os.Getenv("DB_MODE")
	postgresDatabase *sql.DB

	// redis environment variables
	envRedisAddr = os.Getenv("REDIS_ADDR")
	redisPool    *redis.Pool

	// mqtt environment variables
	envMqttAddr = os.Getenv("MQTT_ADDR")
	mqttTopic   = "projects/+/+"
	mqttClient  mqtt.Client

	// endpoint to trigger notifications
	envNotificationAddr = os.Getenv("NOTIFICATION_ADDR")

	// this map stores the currently active rules per project and their state (triggered and expiration time)
	activeRulesPerProjectMap = xsync.NewMapOf[string, *xsync.MapOf[string, MonitoredRule]]()

	// synchronization wait group
	syncMutex = sync.RWMutex{}

	// prometheus metric variables
	metricTotalRules, metricTotalTriggers int64
)

func getAppliedActiveRuleIds() sets.Set[string] {
	// create a string set
	appliedActiveRuleIds := sets.New[string]()

	// iterate over the whole map
	activeRulesPerProjectMap.Range(func(_ string, activeRulesMap *xsync.MapOf[string, MonitoredRule]) bool {
		activeRulesMap.Range(func(ruleId string, _ MonitoredRule) bool {
			appliedActiveRuleIds.Insert(ruleId)
			return true
		})
		return true
	})

	// return the set
	return appliedActiveRuleIds
}

// updateActiveRulesPerProjectMap gets all active rules and puts them into the activeRulesPerProjectMap
func updateActiveRulesPerProjectMap(db *sql.DB) {
	// ensure that this function is only executing once
	syncMutex.Lock()
	defer syncMutex.Unlock()

	// construct a rule repository
	ruleRepo := rule.Repository{Database: db}

	// fetch all active rules
	fetchedActiveRules, err := ruleRepo.ListActive()
	if err != nil {
		l := utils.GetLogger()
		l.Fatal().Err(err).Msg("")
	}

	// create a map of the fetched rules
	fetchedActiveRuleMap := make(map[string]rule.Rule)
	for _, fetchedActiveRule := range fetchedActiveRules {
		fetchedActiveRuleMap[fetchedActiveRule.ID] = fetchedActiveRule
	}

	// get the fetched active rule identifiers
	fetchedActiveRuleIds := sets.New[string](lo.Map(fetchedActiveRules, func(rule rule.Rule, _ int) string {
		return rule.ID
	})...)

	// get all applied active rule identifiers
	appliedActiveRuleIds := getAppliedActiveRuleIds()

	// compute deleted rules, new rules and common rules
	deletedRuleIds := appliedActiveRuleIds.Difference(fetchedActiveRuleIds)
	newRuleIds := fetchedActiveRuleIds.Difference(appliedActiveRuleIds)
	commonRuleIds := appliedActiveRuleIds.Intersection(fetchedActiveRuleIds)

	// split common rule ids into changed and unchanged
	changedCommonRuleIds := sets.New[string]()
	unchangedCommonRuleIds := sets.New[string]()
	for commonRuleId := range commonRuleIds {
		// get the fetched rule, the key must be present
		fetchedActiveRule, _ := fetchedActiveRuleMap[commonRuleId]

		// fetch the currently applied rule, both keys must be present
		activeRulesMap, _ := activeRulesPerProjectMap.Load(fetchedActiveRule.ProjectID)
		appliedActiveRule, _ := activeRulesMap.Load(commonRuleId)

		// compare the entries and fill the slices
		if reflect.DeepEqual(fetchedActiveRule, appliedActiveRule.Rule) {
			unchangedCommonRuleIds.Insert(commonRuleId)
		} else {
			changedCommonRuleIds.Insert(commonRuleId)
		}
	}

	// delete old active rules
	projectIdsToDelete := sets.New[string]()
	activeRulesPerProjectMap.Range(func(projectId string, activeRulesMap *xsync.MapOf[string, MonitoredRule]) bool {
		ruleIdsToDelete := sets.New[string]()
		activeRulesMap.Range(func(ruleId string, _ MonitoredRule) bool {
			if deletedRuleIds.Has(ruleId) {
				ruleIdsToDelete.Insert(ruleId)
			}
			return true
		})
		// remove deleted rules
		for ruleIdToDelete := range ruleIdsToDelete {
			activeRulesMap.Delete(ruleIdToDelete)
		}
		if activeRulesMap.Size() == 0 {
			projectIdsToDelete.Insert(projectId)
		}
		return true
	})
	// remove projects with no rules
	for projectIdToDelete := range projectIdsToDelete {
		activeRulesPerProjectMap.Delete(projectIdToDelete)
	}

	// create new rules
	for newRuleId := range newRuleIds {
		// get the new rule
		newFetchedActiveRule := fetchedActiveRuleMap[newRuleId]
		// create the new rule in the map
		_, isProjectPresent := activeRulesPerProjectMap.Load(newFetchedActiveRule.ProjectID)
		if !isProjectPresent {
			activeRulesPerProjectMap.Store(newFetchedActiveRule.ProjectID, xsync.NewMapOf[string, MonitoredRule]())
		}
		// create the new rule entry, the key must be present
		activeRulesMap, _ := activeRulesPerProjectMap.Load(newFetchedActiveRule.ProjectID)
		activeRulesMap.Store(newFetchedActiveRule.ID, MonitoredRule{Rule: newFetchedActiveRule, Triggered: false, ExpirationTime: utils.EmptyOptional[int64]()})
	}

	// modify the changed rules
	for changedCommonRuleId := range changedCommonRuleIds {
		// get the changed rule
		changedFetchedActiveRule := fetchedActiveRuleMap[changedCommonRuleId]
		// update the entry, the key must be present
		activeRulesMap, _ := activeRulesPerProjectMap.Load(changedFetchedActiveRule.ProjectID)
		activeRulesMap.Store(changedFetchedActiveRule.ID, MonitoredRule{Rule: changedFetchedActiveRule, Triggered: false, ExpirationTime: utils.EmptyOptional[int64]()})
	}

	// log the stats
	l := utils.GetLogger()
	l.Debug().Msg(fmt.Sprintf("applied rules were updated: %v rules created, %v rules deleted, %v rules changed, %v rules unchanged", newRuleIds.Len(), deletedRuleIds.Len(), changedCommonRuleIds.Len(), unchangedCommonRuleIds.Len()))

	// update metrics
	atomic.StoreInt64(&metricTotalRules, int64(len(fetchedActiveRules)))
}

// handleMetrics endpoint for prometheus
func handleMetrics(w http.ResponseWriter, _ *http.Request) {
	resp := "# HELP rule_triggers_total Total rule triggers\n"
	resp += "# TYPE rule_triggers_total counter\n"
	resp += fmt.Sprintf("rule_triggers_total %v\n", metricTotalTriggers)
	resp += "# HELP rule_rules_total Total active rules\n"
	resp += "# TYPE rule_rules_total gauge\n"
	resp += fmt.Sprintf("rule_rules_total %v\n", metricTotalRules)
	resp += utils.GetRedisPoolStatsFormatted(redisPool, "rule")
	resp += utils.GetPostgresStatsFormatted(postgresDatabase, "rule")
	_, _ = w.Write([]byte(resp))
}

// main function
func main() {
	var err error

	// Setup logging
	l := utils.GetLogger()

	// create a postgres database connection
	postgresDatabase, err = utils.OpenPostgresDatabase(envDbAddr, envDbPort, envDbName, envDbUser, envDbPass, envDbMode, utils.DefaultMaxOpenConnsLight, utils.DefaultMaxIdleConns, utils.DefaultConnMaxLifetime, utils.DefaultConnMaxIdleTime)
	if err != nil {
		l.Fatal().Err(err).Msg("Cannot open Postgres connection")
		return
	}
	defer func(postgresDatabase *sql.DB) {
		err := utils.ClosePostgresDatabase(postgresDatabase)
		if err != nil {
			utils.LogError(err, "Cannot close Postgres connection")
		}
	}(postgresDatabase)

	// create a redis connection pool
	redisPool = utils.OpenRedisPool(envRedisAddr)
	defer func(redisPool *redis.Pool) {
		err := utils.CloseRedisPool(redisPool)
		if err != nil {
			utils.LogError(err, "Cannot close Redis pool")
		}
	}(redisPool)

	// connect a client to the mqtt broker
	mqttClient, err = utils.CreateMqttClient(envMqttAddr, []string{mqttTopic}, mqttMessageHandler)
	if err != nil {
		l.Fatal().Err(err).Msg("Cannot open MQTT connection")
		return
	}
	defer func(mqttClient mqtt.Client) {
		err := utils.DestroyMqttClient(mqttClient)
		if err != nil {
			utils.LogError(err, "Cannot close MQTT connection")
		}
	}(mqttClient)

	// start the http metrics server in a goroutine
	go func() {
		if err := http.ListenAndServe(":8000", http.HandlerFunc(handleMetrics)); err != nil {
			l.Fatal().Err(err).Msg("HTTP Metrics Server failed")
		}
	}()

	// initially fill the active rules
	updateActiveRulesPerProjectMap(postgresDatabase)

	// construct two timers for the rule refresh and timeout check
	refreshRulesTimer := time.Tick(refreshActiveRulesPerProjectInterval)
	evaluateRulesTimer := time.Tick(handleRulesTimeoutInterval)

	// infinite loop to keep the process running, will only execute if either case is able to run
	for {
		select {
		case <-refreshRulesTimer:
			// refresh active rules in the background as a goroutine
			go updateActiveRulesPerProjectMap(postgresDatabase)
		case <-evaluateRulesTimer:
			// handle rule timeouts in the main thread
			handleTimeouts()
		}
	}
}

// handleTimeouts checks the expiration times and sends notifications where the time passes the expiration.
func handleTimeouts() {
	// get the current timestamp
	now := time.Now().Unix()

	// iterate over all rules and add them to the set
	activeRulesPerProjectMap.Range(func(projectId string, activeRulesMap *xsync.MapOf[string, MonitoredRule]) bool {
		activeRulesMap.Range(func(activeRuleId string, activeRule MonitoredRule) bool {
			if utils.HasOptionalValue(activeRule.ExpirationTime) {
				expirationTime := utils.GetOptionalValue(activeRule.ExpirationTime)
				if now > expirationTime {
					// reset the expiration time
					wasExpirationTimeResetBefore := false
					wasRuleDeleted := false
					activeRulesMap.Compute(activeRuleId, func(oldRule MonitoredRule, loaded bool) (MonitoredRule, bool) {
						if !loaded {
							// do not add an already deleted entry
							wasRuleDeleted = true
							return MonitoredRule{}, true
						}
						if !utils.HasOptionalValue(oldRule.ExpirationTime) {
							// do not reset the expiration time twice
							wasExpirationTimeResetBefore = true
							return oldRule, false
						}
						// only update the expiration time
						newRule := MonitoredRule{Rule: oldRule.Rule, Triggered: oldRule.Triggered, ExpirationTime: utils.EmptyOptional[int64]()}
						return newRule, false
					})
					if wasExpirationTimeResetBefore || wasRuleDeleted {
						// do not reset the expiration time twice
						return true
					}

					// log that the timeout expired for the specific rule
					activeRule.Log("timeout expired")

					// check if the rule still applies
					applies, values, err := activeRule.Evaluate(redisPool, nil)
					if err != nil {
						utils.LogError(err, "")
						return true
					}

					// if the value does not apply, do not fire the notifications ...
					if !applies {
						return true
					}

					// ... if it applies the notifications should be triggered
					activeRule.Log("notifications triggered for timeout rule")
					if err := activeRule.sendNotifications(values); err != nil {
						utils.LogError(err, "")
					}
				}
			}
			return true
		})
		return true
	})
}

// mqttMessageHandler gets triggered when a new mqtt message comes in and it handles the appropriate rules
func mqttMessageHandler(_ mqtt.Client, m mqtt.Message) {
	// get the measurements from the payload
	var measurements []measurement.Measurement
	if err := json.Unmarshal(m.Payload(), &measurements); err != nil {
		return
	}
	if len(measurements) == 0 {
		return
	}

	// get the project id from the topic
	projectId := strings.Split(m.Topic(), "/")[1]

	// execute the logic for each
	for _, mqttMeasurement := range measurements {
		// heartbeat messages can be ignored
		if mqttMeasurement.Name == "" {
			continue
		}

		// get the affected rules
		affectedRules, err := filterRulesForProjectByVariable(projectId, mqttMeasurement.Name)
		if err != nil {
			return
		}

		for _, affectedRule := range affectedRules {
			// if the rule is not active, it can be ignored
			if !affectedRule.Rule.Active {
				continue
			}

			// check if the rule is in timeout right now
			if utils.HasOptionalValue(affectedRule.ExpirationTime) {
				affectedRule.Log("currently in timeout")
				continue
			}

			// compute if the rule applies
			measurements := make(map[string]float64)
			measurements[mqttMeasurement.Name] = mqttMeasurement.Value
			applies, values, err := affectedRule.Evaluate(redisPool, measurements)
			if err != nil {
				utils.LogError(err, "")
				continue
			}

			// get the rules for the project
			activeRulesMap, ok := activeRulesPerProjectMap.Load(affectedRule.Rule.ProjectID)
			if !ok {
				continue
			}

			// if it does not apply, reset the triggered state to false
			if !applies {
				activeRulesMap.Compute(affectedRule.Rule.ID, func(oldRule MonitoredRule, loaded bool) (MonitoredRule, bool) {
					if !loaded {
						// do not add an already deleted entry
						return MonitoredRule{}, true
					}
					// only update the triggered state
					newRule := MonitoredRule{Rule: oldRule.Rule, Triggered: false, ExpirationTime: oldRule.ExpirationTime}
					return newRule, false
				})
				continue
			}

			if !affectedRule.Triggered {
				// trigger affected rule once
				wasRuleTriggeredBefore := false
				wasRuleDeleted := false
				activeRulesMap.Compute(affectedRule.Rule.ID, func(oldRule MonitoredRule, loaded bool) (MonitoredRule, bool) {
					if !loaded {
						// do not add an already deleted entry
						wasRuleDeleted = true
						return MonitoredRule{}, true
					}
					if oldRule.Triggered {
						// do not trigger twice
						wasRuleTriggeredBefore = true
						return oldRule, false
					}
					// only update the triggered state
					newRule := MonitoredRule{Rule: oldRule.Rule, Triggered: true, ExpirationTime: oldRule.ExpirationTime}
					return newRule, false
				})
				if wasRuleTriggeredBefore || wasRuleDeleted {
					continue
				}

				// add a timeout for the triggered rule
				if affectedRule.Rule.Timeout > 0 {
					activeRulesMap.Compute(affectedRule.Rule.ID, func(oldRule MonitoredRule, loaded bool) (MonitoredRule, bool) {
						if !loaded {
							// do not add an already deleted entry
							return MonitoredRule{}, true
						}
						if utils.HasOptionalValue(oldRule.ExpirationTime) {
							// do not set expiration time twice
							return oldRule, false
						}
						// only update the expiration time
						affectedRule.Log("start timeout")
						newRule := MonitoredRule{Rule: oldRule.Rule, Triggered: oldRule.Triggered, ExpirationTime: utils.FilledOptional(time.Now().Unix() + oldRule.Rule.Timeout)}
						return newRule, false
					})
					continue
				}

				// atomically increment counter
				atomic.AddInt64(&metricTotalTriggers, 1)

				// print that a rule has triggered
				affectedRule.Log("has triggered")

				// send notifications
				affectedRule.Log("notifications triggered for trigger rule")
				if err := affectedRule.sendNotifications(values); err != nil {
					utils.LogError(err, "")
				}
			}
		}
	}
}

// filterRulesForProjectByVariable returns a list of rules that contain this variable
func filterRulesForProjectByVariable(projectId string, variable string) (map[string]MonitoredRule, error) {
	// the result slice
	result := make(map[string]MonitoredRule)

	// iterate over all rules and add them to the set if the variable matches
	activeRulesMap, ok := activeRulesPerProjectMap.Load(projectId)
	if !ok {
		return nil, errors.New("project id was not present in the map")
	}
	activeRulesMap.Range(func(activeRuleId string, activeRule MonitoredRule) bool {
		for _, condition := range activeRule.Rule.Conditions {
			if condition.Variable == variable {
				result[activeRuleId] = activeRule
			}
		}
		return true
	})

	// return the result
	return result, nil
}

// getLatestRedisValues returns all latest values from redis if they are present, otherwise returns an empty optional for each missing variable
func getLatestRedisValues(pool *redis.Pool, projectId string, variables []string) (map[string]utils.Optional[float64], error) {
	// construct the result map and get a redis connection
	result := make(map[string]utils.Optional[float64])

	// get a redis connection
	conn := pool.Get()
	defer func(conn redis.Conn) {
		err := conn.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(conn)

	// construct the redis variables
	var args []any
	args = append(args, fmt.Sprintf("lynus:projects:%v:measurements", projectId))
	for _, variable := range variables {
		args = append(args, variable)
	}

	// get the items that are returned by redis
	items, err := redis.Strings(conn.Do("HMGET", args...))
	if err != nil {
		return nil, err
	}

	// the lengths should match
	if len(items) != len(variables) {
		return nil, errors.New("variables and redis result mismatch")
	}

	// parse the redis result and add value to the result map
	for index, stringValue := range items {
		key := variables[index]
		var optionalValue utils.Optional[float64]
		if len(stringValue) > 0 {
			// the non-empty string is tried to be converted to a float
			floatValue, err := strconv.ParseFloat(stringValue, 64)
			if err != nil {
				return nil, err
			}
			optionalValue = utils.FilledOptional[float64](floatValue)
		} else {
			// the empty string is mapped to an empty optional
			optionalValue = utils.EmptyOptional[float64]()
		}
		result[key] = optionalValue
	}

	// return the result
	return result, nil
}

// Log logs the message with the rule info
func (r MonitoredRule) Log(message string) {
	l := utils.GetLogger()
	l.Debug().Msg(fmt.Sprintf("[rule{%v,%v}] %v", r.Rule.ID, r.Rule.Name, message))
}

// Evaluate checks whether the rule's conditions are met
func (r MonitoredRule) Evaluate(pool *redis.Pool, passedVariableValues map[string]float64) (bool, map[string]utils.Optional[float64], error) {
	// check if the rule schedule is currently active
	isScheduleActive, err := r.isScheduledActiveNow()
	if err != nil {
		return false, nil, err
	}
	if !isScheduleActive {
		return false, nil, nil
	}

	// construct the variables that must be fetched from redis
	var redisVariables []string
	for _, condition := range r.Rule.Conditions {
		// remove the initialVar from the values to get from redis
		_, isVariablePassed := passedVariableValues[condition.Variable]
		if isVariablePassed {
			// passed variables must not be fetched from redis
			continue
		}
		// add the variable to the values fetched from redis
		redisVariables = append(redisVariables, condition.Variable)
	}

	// only fetch variables from redis if necessary
	variableValues := make(map[string]utils.Optional[float64])
	if len(redisVariables) > 0 {
		variableValues, err = getLatestRedisValues(pool, r.Rule.ProjectID, redisVariables)
		if err != nil {
			return false, nil, err
		}
	}

	// add the passed variables to the map
	for variable, value := range passedVariableValues {
		variableValues[variable] = utils.FilledOptional(value)
	}

	// compute the applies result
	ruleApplies, err := r.Applies(variableValues)
	if err != nil {
		return false, nil, err
	}

	// return the applies result and the map
	return ruleApplies, variableValues, nil
}

func (r MonitoredRule) isScheduledActiveNow() (bool, error) {
	// the empty schedule means it is always active
	if len(r.Rule.Schedule) == 0 {
		return true, nil
	}

	// get the now timestamp
	now := time.Now().UTC()

	// find at least one schedule item that is active now ...
	for _, item := range r.Rule.Schedule {
		// get the now timestamp in the correct timezone
		loc, err := time.LoadLocation(item.Timezone)
		if err != nil {
			return false, err
		}
		nowInLoc := now.In(loc)

		// check if the passed day is matching
		if !item.ActiveDays[nowInLoc.Weekday()] {
			continue
		}

		// minor adjustments to the end hour
		if item.TimeTo.Hours == 0 && item.TimeTo.Minutes == 0 {
			item.TimeTo.Hours = 24
		}

		// the default time such that the schedule item is active the whole day is 00:00-24:00
		if item.TimeFrom.Hours == 0 &&
			item.TimeFrom.Minutes == 0 &&
			item.TimeTo.Hours == 24 &&
			item.TimeTo.Minutes == 0 {
			return true, nil
		}

		// otherwise check if the timeframe matches
		if nowInLoc.Hour() >= item.TimeFrom.Hours &&
			nowInLoc.Minute() >= item.TimeFrom.Minutes &&
			nowInLoc.Hour() <= item.TimeTo.Hours &&
			nowInLoc.Minute() <= item.TimeTo.Minutes {
			return true, nil
		}
	}

	// ... if no item was found false can be returned
	return false, nil
}

// Applies uses simple boolean algebra to check whether the rule evaluates to true or false
func (r MonitoredRule) Applies(variables map[string]utils.Optional[float64]) (bool, error) {
	// applies is the global result and valid is the result per condition
	applies := false
	valid := false

	for index, condition := range r.Rule.Conditions {
		// the initial state for each condition is false
		valid = false

		// get the currently needed variable value
		optionalVariableValue, ok := variables[condition.Variable]
		if !ok {
			return false, errors.New("variable value was not passed in the map")
		}
		if !utils.HasOptionalValue(optionalVariableValue) {
			return false, errors.New("optional had no value")
		}
		variableValue := utils.GetOptionalValue(optionalVariableValue)

		// check the condition
		switch condition.Condition {
		case rule.ConditionLess:
			valid = variableValue < condition.Target
		case rule.ConditionLessEquals:
			valid = variableValue <= condition.Target
		case rule.ConditionEquals:
			valid = variableValue == condition.Target
		case rule.ConditionNotEquals:
			valid = variableValue != condition.Target
		case rule.ConditionGreaterEquals:
			valid = variableValue >= condition.Target
		case rule.ConditionGreater:
			valid = variableValue > condition.Target
		}

		// the first iteration has no previous result ...
		if index == 0 {
			applies = valid
			continue
		}

		// ... otherwise apply the logic
		if condition.AndOr {
			applies = valid && applies
		} else {
			applies = valid || applies
		}
	}

	// return the result
	return applies, nil
}

// sendNotifications sends notifications to the api
func (r MonitoredRule) sendNotifications(measurements map[string]utils.Optional[float64]) error {
	// execute all specified actions
	for _, a := range r.Rule.Actions {
		// create the initial body
		body := a.Params.Body

		// replace placeholders with dynamic content
		body = strings.ReplaceAll(body, "{{rule}}", r.Rule.Name)
		body = strings.ReplaceAll(body, "{{project}}", r.Rule.ProjectID)
		body = strings.ReplaceAll(body, "{{time}}", time.Now().Format("2006-01-02 15:04:05 MST"))

		// replace variable names part of the rule with their values in the rule body
		for variableName, variableValue := range measurements {
			if utils.HasOptionalValue(variableValue) {
				body = strings.ReplaceAll(body, fmt.Sprintf("{{%v}}", variableName), fmt.Sprintf("%.2f", utils.GetOptionalValue(variableValue)))
			}
		}

		// replace variable names not part of the rule with their values in the rule body, find other variables
		regex := regexp.MustCompile("{{\\S+}}")
		matches := regex.FindAllString(body, -1)
		// construct a list of other variables
		var otherVariableNames []string
		for _, match := range matches {
			otherVariableNames = append(otherVariableNames, match[2:len(match)-2])
		}
		if len(otherVariableNames) > 0 {
			// fetch the other values
			otherVariableMap, err := getLatestRedisValues(redisPool, r.Rule.ProjectID, otherVariableNames)
			if err != nil {
				return err
			}
			// apply the other values
			for variableName, variableValue := range otherVariableMap {
				if utils.HasOptionalValue(variableValue) {
					body = strings.ReplaceAll(body, fmt.Sprintf("{{%v}}", variableName), fmt.Sprintf("%.2f", utils.GetOptionalValue(variableValue)))
				}
			}
		}

		// replace the modified body and set the project id
		a.Params.Body = body
		a.Params.ProjectID = r.Rule.ProjectID

		// call the notification api
		response, err := utils.MakeHttpRequest[string]("POST", envNotificationAddr, a, nil, true)
		if err != nil {
			return fmt.Errorf("the call to the notifications api failed and returned the following body: %v",
				response)
		}
	}

	// no error happened
	return nil
}
