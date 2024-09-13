package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/efficientIO/efficientIO/api/pkg/resource/rule"
	"github.com/efficientIO/efficientIO/api/pkg/utils"
	"github.com/procyon-projects/chrono"
	"github.com/samber/lo"
	"k8s.io/apimachinery/pkg/util/sets"

	"github.com/gomodule/redigo/redis"

	_ "github.com/lib/pq"
)

const (
	// KeyConnectivityStatus is set in redis with the possible values of ONLINE and OFFLINE
	KeyConnectivityStatus = "connectivity_status"
	ONLINE                = "online"
	OFFLINE               = "offline"

	// HeartbeatInterval these constants are used to check if an SPS is currently working
	HeartbeatInterval      = 60_000 * time.Millisecond
	HeartbeatGracePeriod   = 10_000 * time.Millisecond
	HeartbeatCheckInterval = 10_000 * time.Millisecond
	HeartbeatMissAmount    = 15
	HeartbeatReviveAmount  = 3
)

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

	// the notification address
	envNotificationAddr = os.Getenv("NOTIFICATION_ADDR")

	// map to collect the last few heartbeat messages of projects that are OFFLINE
	lastHeartbeatTimestampsMap     = make(map[string][]int64)
	lastHeartbeatTimestampsMapLock sync.RWMutex
)

type ConnectivityCheckProject struct {
	Name    string
	ID      string
	Actions []rule.Action
}

// queryProjectsWithConnectivity is used to periodically query project connectivity data for projects with that feature enabled
func queryProjectsWithConnectivity(db *sql.DB) (map[string]*ConnectivityCheckProject, error) {
	// create a result slice
	res := make(map[string]*ConnectivityCheckProject)

	// query the database
	rows, err := db.Query("SELECT id, connectivity_actions, name FROM project WHERE connectivity = TRUE")
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	// create a result object from each database row
	for rows.Next() {
		var (
			id      string
			js      []byte
			actions []rule.Action
			name    string
		)

		if err := rows.Scan(&id, &js, &name); err != nil {
			return nil, err
		}

		if err := json.Unmarshal(js, &actions); err != nil {
			return nil, err
		}

		if len(actions) == 0 {
			continue
		}

		// push the actions to the map
		res[id] = &ConnectivityCheckProject{
			Name:    name,
			ID:      id,
			Actions: actions,
		}
	}

	// return the resulting map
	return res, nil
}

// main method that runs the connectivity check periodically
func main() {
	var err error
	var wg sync.WaitGroup

	// setup logging
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

	// create a new task scheduler
	taskScheduler := chrono.NewDefaultTaskScheduler()

	// schedule the connectivity task periodically
	_, err = taskScheduler.ScheduleAtFixedRate(func(ctx context.Context) {
		connectivityCheck()
	}, HeartbeatCheckInterval)
	if err != nil {
		l.Fatal().Err(err).Msg("Schedule Heartbeat Check")
		return
	}

	l.Info().Msg("Starting Connectivity Service")

	// start the web server with the metrics endpoint
	if err := http.ListenAndServe(":8000", http.HandlerFunc(handleMetrics)); err != nil {
		l.Fatal().Err(err).Msg("Starting metrics handler failed")
	}

	// keep the main thread running
	wg.Add(1)
	wg.Wait()
}

// connectivityCheck this function runs the connectivity check once for all projects
func connectivityCheck() {
	// for synchronization
	var wg sync.WaitGroup

	// get all relevant projects together with their connectivity actions
	projects, err := queryProjectsWithConnectivity(postgresDatabase)
	if err != nil {
		utils.LogError(err, "")
	}

	// start the connectivity check for each individual project
	for _, conCheck := range projects {
		wg.Add(1)

		// https://eli.thegreenplace.net/2019/go-internals-capturing-loop-variables-in-closures/
		go func(project_id, project_name string, actions []rule.Action) {
			defer wg.Done()
			connectivityCheckForOneProject(project_id, project_name, actions)
		}((*conCheck).ID, (*conCheck).Name, (*conCheck).Actions)
	}

	// wait for all threads to finish
	wg.Wait()
}

// handleMetrics endpoint for the prometheus metrics
func handleMetrics(w http.ResponseWriter, _ *http.Request) {
	resp := utils.GetRedisPoolStatsFormatted(redisPool, "connectivity")
	resp += utils.GetPostgresStatsFormatted(postgresDatabase, "connectivity")
	_, _ = w.Write([]byte(resp))
}

// addHeartbeatTimestampToLastHeartbeatTimestamps ensures that only the last unique HeartbeatReviveAmount heartbeat timestamps are kept
func addHeartbeatTimestampToLastHeartbeatTimestamps(lastHeartbeatTimestamps []int64, lastHeartbeat int64) []int64 {
	newTimestampsSlice := append(lastHeartbeatTimestamps, lastHeartbeat)
	newTimestampsSet := sets.NewInt64(newTimestampsSlice...)
	newTimestampsSliceWithoutDuplicates := newTimestampsSet.List()
	sort.SliceStable(newTimestampsSliceWithoutDuplicates,
		func(i, j int) bool {
			return newTimestampsSliceWithoutDuplicates[i] > newTimestampsSliceWithoutDuplicates[j]
		})
	if len(newTimestampsSliceWithoutDuplicates) < HeartbeatReviveAmount {
		return newTimestampsSliceWithoutDuplicates
	} else {
		mostRecentHeartbeats := newTimestampsSliceWithoutDuplicates[0:HeartbeatReviveAmount]
		return mostRecentHeartbeats
	}
}

// connectivityCheckForOneProject this function runs the connectivity check once for the passed project
func connectivityCheckForOneProject(projectID string, projectName string, actions []rule.Action) {
	// get a redis connection
	conn := redisPool.Get()
	defer func(conn redis.Conn) {
		err := conn.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(conn)

	// get a unix timestamp in milliseconds
	now := time.Now().UnixNano() / 1_000_000

	// get the last heartbeat as unix timestamp in milliseconds from redis
	lastHeartbeat, err := redis.Int64(conn.Do("HGET", fmt.Sprintf("lynus:projects:%s", projectID), "heartbeat"))
	if err != nil {
		// ... the project has never received a heartbeat message
		l := utils.GetLogger()
		l.Error().Err(err).Str("project", projectID).Msg("never received heartbeat")
		return
	}

	// get the connectivity state from redis
	connectivityStatus, err := redis.String(conn.Do("HGET", fmt.Sprintf("lynus:projects:%s", projectID), KeyConnectivityStatus))
	if err != nil {
		if err == redis.ErrNil {
			// if key is not there, set the project to ONLINE
			_, err := conn.Do("HSET", fmt.Sprintf("lynus:projects:%s", projectID), KeyConnectivityStatus, ONLINE)
			if err != nil {
				utils.LogError(err, "")
				return
			} else {
				connectivityStatus = ONLINE
			}
		} else {
			// some other error happened, log the error
			utils.LogError(err, "")
			return
		}
	}

	// trigger change from ONLINE to OFFLINE
	if connectivityStatus == ONLINE && now > lastHeartbeat+(HeartbeatMissAmount*HeartbeatInterval+HeartbeatGracePeriod).Milliseconds() {
		// execute the actions when going OFFLINE
		for _, a := range actions {
			if err := sendNotification(projectID, projectName, a, OFFLINE); err != nil {
				utils.LogError(err, "")
			}
		}

		// set state to OFFLINE
		_, err := conn.Do("HSET", fmt.Sprintf("lynus:projects:%s", projectID), KeyConnectivityStatus, OFFLINE)
		if err != nil {
			utils.LogError(err, "")
			return
		}
	}

	// trigger change from OFFLINE to ONLINE
	if connectivityStatus == OFFLINE {
		// get the last heartbeat timestamps or initialize them
		lastHeartbeatTimestampsMapLock.RLock()
		lastHeartbeatTimestamps, ok := lastHeartbeatTimestampsMap[projectID]
		lastHeartbeatTimestampsMapLock.RUnlock()
		if !ok {
			lastHeartbeatTimestampsMapLock.Lock()
			lastHeartbeatTimestampsMap[projectID] = []int64{}
			lastHeartbeatTimestampsMapLock.Unlock()
			lastHeartbeatTimestamps = []int64{}
		}

		// add the most recent heartbeat to this slice
		lastHeartbeatTimestamps = addHeartbeatTimestampToLastHeartbeatTimestamps(lastHeartbeatTimestamps, lastHeartbeat)

		// save the new slice to the map
		lastHeartbeatTimestampsMapLock.Lock()
		lastHeartbeatTimestampsMap[projectID] = lastHeartbeatTimestamps
		lastHeartbeatTimestampsMapLock.Unlock()

		if len(lastHeartbeatTimestamps) == HeartbeatReviveAmount && now <= lo.Min(lastHeartbeatTimestamps)+(HeartbeatReviveAmount*HeartbeatInterval+HeartbeatGracePeriod).Milliseconds() {
			// execute the actions when going ONLINE
			for _, a := range actions {
				if err := sendNotification(projectID, projectName, a, ONLINE); err != nil {
					utils.LogError(err, "")
				}
			}

			// set state to ONLINE
			_, err := conn.Do("HSET", fmt.Sprintf("lynus:projects:%s", projectID), KeyConnectivityStatus, ONLINE)
			if err != nil {
				utils.LogError(err, "")
				return
			}

			// reset last heartbeat map
			lastHeartbeatTimestampsMapLock.Lock()
			lastHeartbeatTimestampsMap[projectID] = []int64{}
			lastHeartbeatTimestampsMapLock.Unlock()
		}
	}
}

// getReplacedText replaces known placeholders in the passed text
func getReplacedText(text string, projectID string, projectName string, connectivityStatus string) string {
	// fill in the project id
	text = strings.ReplaceAll(text, "{{project}}", projectID)
	// fill in the connectivity status
	text = strings.ReplaceAll(text, "{{status}}", connectivityStatus)
	// fill in the project name
	text = strings.ReplaceAll(text, "{{projectName}}", projectName)
	// return the replaced text
	return text
}

// sendNotification sends each marshalled notification to the backend
func sendNotification(projectID string, projectName string, action rule.Action, connectivityStatus string) error {
	// set the project id
	action.Params.ProjectID = projectID

	// apply replacements to subject and body
	action.Params.Subject = getReplacedText(action.Params.Subject, projectID, projectName, connectivityStatus)
	action.Params.Body = getReplacedText(action.Params.Body, projectID, projectName, connectivityStatus)

	// set alert type to info when project goes back online
	if connectivityStatus == ONLINE && action.Type == rule.TypeAlert && action.Params.Type != 0 {
		action.Params.Type = 0
	}

	// send object to the backend
	_, err := utils.MakeHttpRequest[string]("POST", envNotificationAddr, action, nil, true)
	if err != nil {
		return err
	}

	return nil
}
