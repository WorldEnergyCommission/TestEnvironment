package measurement

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"strconv"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/eneries/eneries/api/pkg/resource/project"
	"github.com/eneries/eneries/api/pkg/utils"
	"github.com/lib/pq"
	"github.com/samber/lo"
	"golang.org/x/exp/maps"
	"golang.org/x/exp/slices"
	"k8s.io/apimachinery/pkg/util/sets"

	"github.com/gomodule/redigo/redis"
)

// all allowed aggregation methods for charts
const (
	AVG      = "avg"
	AVGTW    = "avgtw"
	INTEGRAL = "integral"
	COUNT    = "count"
	MAX      = "max"
	MIN      = "min"
	RANGE    = "range"
	SUM      = "sum"
	FIRST    = "first"
	LAST     = "last"
	STDDEV   = "stddev"
	VAR      = "var"
	DIFF     = "diff"
	DERIVATE = "derivate"
)

var allowedValues = []string{AVG, AVGTW, INTEGRAL, COUNT, MAX, MIN, RANGE, SUM, FIRST, LAST, STDDEV, VAR, DIFF, DERIVATE}

// all allowed missing value strategies for charts
const (
	NONE = "none"
	LOCF = "locf"
)

// all sql queries needed to insert measurements into the database
const (
	queryCreateMeasurementWithoutTime = "INSERT INTO measurements(variable, value, unit) VALUES ($1, $2, $3)"
	queryVariablesAndTimesInRegion    = "SELECT variable, time FROM measurements WHERE time >= (TO_TIMESTAMP($1) AT TIME ZONE 'UTC') AND time <= (TO_TIMESTAMP($2) AT TIME ZONE 'UTC') AND variable = any($3)"
	queryCreateMeasurementWithTime    = "INSERT INTO measurements(time, variable, value, unit) VALUES ((TO_TIMESTAMP($1) AT TIME ZONE 'UTC'), $2, $3, $4)"
	queryCreateProjectVariable        = "INSERT INTO measurements_meta(project, variable) VALUES ($1, $2) RETURNING id"
	queryLastMeasurement              = "SELECT value, time FROM measurements WHERE variable = $1 ORDER BY time DESC LIMIT 1"
	queryLastMeasurementBeforeLimited = `SELECT value, time FROM measurements WHERE 
	time < $2 AND time > now() - interval '10 days' AND variable=$1 ORDER BY 
	time DESC LIMIT 1`
	queryFirstMeasurement          = "SELECT value FROM measurements WHERE variable = $1 ORDER BY time ASC LIMIT 1"
	queryAllowedMeasurementsFilter = " WHERE pfu.permission_id in ('readAI', 'readDevice', 'readModule', 'readDataMapping') AND (pfu.project_id = cast( $2 as uuid) OR pfu.project_id is null) AND pfu.user_id = cast( $1 as uuid) "
	queryAllowedMeasurments        = `SELECT mdm.measurement FROM permissions_for_user pfu JOIN measurements_mapping mdm ON 
		(pfu.device_id = mdm.device_id 
		OR pfu.model_id = mdm.device_id 
		OR pfu.data_mapping_id = mdm.device_id 
		OR pfu.module_id = mdm.device_id OR pfu.wildcard = true) ` + queryAllowedMeasurementsFilter
	queryHasWildcardForMeasurements = "SELECT pfu.wildcard FROM permissions_for_user pfu" + queryAllowedMeasurementsFilter
	queryCreateShellyMeasurement    = "INSERT INTO shelly_measurements(id, name, generation, username, category, manufacturer, model, phase, property, value, unit, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, (TO_TIMESTAMP($12) AT TIME ZONE 'UTC'))"
)

const (
	variableLimit = 8192
)

// all continous aggregate names
var europeViennaCaggsMap = map[string]string{
	"15m":    "measurements_15_min",
	"1h":     "measurements_1_hour_europe_vienna",
	"1d":     "measurements_1_day_europe_vienna",
	"1w":     "measurements_1_week_europe_vienna",
	"1month": "measurements_1_month_europe_vienna",
	"1y":     "measurements_1_year_europe_vienna",
}

// intervals is a map of defined intervals with their
// max time, e.g.:
// the interval of "5s" is only valid if time <= 3 hours
// the interval of "1h" is only valid if time <= 90 days
var intervals = map[time.Duration][]string{
	time.Hour * 24 * 45:       {"5s", "10s", "5m", "6h"}, // legacy intervals used in the app
	time.Hour * 3:             {"1s"},
	time.Hour * 6:             {"15s"},
	time.Hour * 24 * 2:        {"1m"},
	time.Hour * 24 * 7:        {"15m"},
	time.Hour * 24 * 90:       {"1h"},
	time.Hour * 24 * 365 * 10: {"1d", "1w", "1month", "1y"},
}

type (
	Repository struct {
		Pool     *redis.Pool
		Database *sql.DB
	}
	Measurement struct {
		Name  string  `json:"n"`
		Unit  string  `json:"u"`
		Value float64 `json:"v"`
		Time  float64 `json:"t"`
	}
	CreateOptions struct {
		ProjectID    string        `json:"project_id"`
		Measurements []Measurement `json:"measurements"`
	}
	ListOptions struct {
		ProjectID string `json:"project_id"`
		UserID    string `json:"user_id"`
	}
	GetOptions struct {
		ProjectID string                    `json:"project_id"`
		Variable  string                    `json:"variable"`
		Time      utils.Optional[time.Time] `json:"time"`
	}
	HistoryOptions struct {
		ProjectID            string    `json:"project_id"`
		Variable             string    `json:"variable"`
		Start                time.Time `json:"start"`
		End                  time.Time `json:"end"`
		Interval             string    `json:"interval"`
		Aggregation          string    `json:"aggregation"`
		MissingValueStrategy string    `json:"missing_value_strategy"`
		Timezone             string    `json:"timezone"`
	}
	DataPoint struct {
		Time  time.Time               `json:"time"`
		Value utils.Optional[float64] `json:"value"`
	}
	MetricResult struct {
		VariablesCreated    int64
		MeasurementsCreated int64
	}
	ShellyMeasurement struct {
		Id           string
		Name         string
		Generation   int
		User         string
		Category     string
		Manufacturer string
		Model        string
		Phase        int
		Property     string
		Value        float64
		Unit         string
		Timestamp    time.Time
	}
)

// get variableID from redis which is needed for database lookup
func (r Repository) GetVariableID(project, variable string) (int, error) {
	return GetVariableID(project, variable, r.Pool)
}

func GetVariableID(project, variable string, redisPool *redis.Pool) (int, error) {
	// get a redis connection
	conn := redisPool.Get()
	defer func(conn redis.Conn) {
		err := conn.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(conn)

	// get the variable id
	key := fmt.Sprintf("lynus:projects:%s:variables", project)
	val, err := redis.Int(conn.Do("HGET", key, variable))

	// TODO: try to get it from database
	// fetch variableID from measurements_meta table
	if err != nil {
		return 0, err
	}

	return val, nil
}

// RemoveDuplicatesFromCreateOptionsMap removes measurements that have duplicates in the database for the same timestamp
func (r Repository) RemoveDuplicatesFromCreateOptionsMap(createOptionsMap map[string][]Measurement) (map[string][]Measurement, error) {
	createOptionsMapWithoutDuplicates := make(map[string][]Measurement)
	for projectId, measurements := range createOptionsMap {

		// put data in proper data structures
		timesMap := make(map[string]map[float64]bool)
		var timesSlice []float64
		for _, measurement := range measurements {
			_, ok := timesMap[measurement.Name]
			if !ok {
				timesMap[measurement.Name] = make(map[float64]bool)
			}
			timesMap[measurement.Name][measurement.Time] = true
			timesSlice = append(timesSlice, measurement.Time)
		}

		// when only measurements with no timestamps are present, no filtering is needed
		if lo.Min(timesSlice) == 0 && lo.Max(timesSlice) == 0 {
			createOptionsMapWithoutDuplicates[projectId] = measurements
			continue
		}

		// compute minimum and maximum timestamp, ignoring no timestamps
		filteredTimesSlice := lo.Filter(timesSlice, func(elem float64, _ int) bool { return elem != 0 })
		minimumTimestamp := lo.Min(filteredTimesSlice)
		maximumTimestamp := lo.Max(filteredTimesSlice)

		// get all variables and their mappings
		variables := maps.Keys(timesMap)
		var newVariables []string
		variableToIdMap := make(map[string]int)
		idToVariableMap := make(map[int]string)
		for _, variable := range variables {
			id, err := r.GetVariableID(projectId, variable)
			if err == redis.ErrNil {
				// new variable, there are no measurements in the database
				newVariables = append(newVariables, variable)
				continue
			} else if err != nil {
				return nil, err
			}
			variableToIdMap[variable] = id
			idToVariableMap[id] = variable
		}

		// ask the database for measurements in the database
		rows, err := r.Database.Query(queryVariablesAndTimesInRegion, minimumTimestamp, maximumTimestamp,
			pq.Array(lo.Map(
				lo.Filter(variables, func(elem string, _ int) bool { return !slices.Contains(newVariables, elem) }),
				func(elem string, _ int) int { return variableToIdMap[elem] })))
		if err != nil {
			utils.LogError(err, "")
			return nil, err
		}
		// rows will be freed later in the loop to avoid leaking resources
		defer func(rows *sql.Rows) {
			err := rows.Close()
			if err != nil {
				utils.LogError(err, "")
			}
		}(rows)
		// get the map that represents measurements currently in the database
		presentMeasurementsMap := make(map[string]map[float64]bool)
		for rows.Next() {
			var currentVariable int
			var currentTime time.Time
			if err = rows.Scan(&currentVariable, &currentTime); err != nil {
				utils.LogError(err, "freaking Error in scanning, did not close rows before here...")
				return nil, err
			}
			currentVariableString := idToVariableMap[currentVariable]
			_, ok := presentMeasurementsMap[currentVariableString]
			if !ok {
				presentMeasurementsMap[currentVariableString] = make(map[float64]bool)
			}
			presentMeasurementsMap[currentVariableString][utils.GetFloatUnixTimestampFromTime(currentTime)] = true
		}

		// filter according to the database return value
		filteredMeasurements := lo.Filter(measurements, func(elem Measurement, _ int) bool {
			return presentMeasurementsMap[elem.Name][elem.Time] != true
		})

		// only append result to output if it contains at least one measurement
		if len(filteredMeasurements) > 0 {
			createOptionsMapWithoutDuplicates[projectId] = filteredMeasurements
		}
	}

	return createOptionsMapWithoutDuplicates, nil
}

// CreateMeasurements creates the measurements specified in the arguments in the database
func (r Repository) CreateMeasurements(optionsSlice []CreateOptions, projectRepo project.Repository, ignoreDuplicates bool) (map[string][]string, MetricResult, error) {
	// validate the passed project names
	optionsSliceWithValidProjects := lo.Filter(optionsSlice, func(elem CreateOptions, _ int) bool {
		exists, err := projectRepo.Exists(elem.ProjectID)
		if !exists {
			l := utils.GetLogger()
			l.Debug().Str("projectID", elem.ProjectID).Msg("Could not find project to add measurement")
		}
		return err == nil && exists
	})
	// validate the passed variable names
	optionsSliceWithValidVariables := lo.Map(optionsSliceWithValidProjects, func(elem CreateOptions, _ int) CreateOptions {
		return CreateOptions{ProjectID: elem.ProjectID,
			Measurements: lo.Filter(elem.Measurements, func(elem Measurement, _ int) bool {
				err := utils.ValidateVariableName(elem.Name)
				return err == nil
			})}
	})
	// filter out options with no measurements
	filteredOptionsSlice := lo.Filter(optionsSliceWithValidVariables, func(elem CreateOptions, _ int) bool {
		return len(elem.Measurements) > 0
	})
	// merge same project ids into a single list of measurements
	createOptionsMap := make(map[string][]Measurement)
	for _, options := range filteredOptionsSlice {
		_, ok := createOptionsMap[options.ProjectID]
		if !ok {
			createOptionsMap[options.ProjectID] = []Measurement{}
		}
		createOptionsMap[options.ProjectID] = append(createOptionsMap[options.ProjectID], options.Measurements...)
	}
	// remove duplicated measurements
	var createOptionsMapProcessed map[string][]Measurement
	var err error
	if ignoreDuplicates {
		createOptionsMapProcessed = createOptionsMap
	} else {
		createOptionsMapProcessed, err = r.RemoveDuplicatesFromCreateOptionsMap(createOptionsMap)
		if err != nil {
			utils.LogError(err, "Remove Duplicates From CreateOptions Map failed")
			return nil, MetricResult{}, err
		}
	}
	// process the remaining valid create options
	var metricResults []MetricResult

	for projectId, measurements := range createOptionsMapProcessed {
		// create the project last write timestamp for each project in redis
		if err := projectRepo.CreateProjectLastWrite(projectId); err != nil {
			utils.LogError(err, "CreateProjectLastWrite failed")
			return nil, MetricResult{}, err
		}
		// create the passed measurements in the database
		metricResult, err := r.Create(
			CreateOptions{ProjectID: projectId, Measurements: measurements}, projectRepo)
		if err != nil {
			utils.LogError(err, "Create (measurement) failed")
			return nil, MetricResult{}, err
		}
		metricResults = append(metricResults, metricResult)
	}
	// accumulate the metric results
	globalMetricResult := MergeMetricResults(metricResults)
	// create a list of updated projects that is returned via the api
	updatedProjects := sets.NewString(lo.Map(filteredOptionsSlice, func(elem CreateOptions, _ int) string {
		return elem.ProjectID
	})...)

	return map[string][]string{"updated_projects": updatedProjects.List()}, globalMetricResult, nil
}

// MergeMetricResults this function merges metric result objects to an accumulated one
func MergeMetricResults(metricResultSlice []MetricResult) MetricResult {
	var accumulatedMetricResult MetricResult
	for _, metricResult := range metricResultSlice {
		accumulatedMetricResult.VariablesCreated += metricResult.VariablesCreated
		accumulatedMetricResult.MeasurementsCreated += metricResult.MeasurementsCreated
	}
	return accumulatedMetricResult
}

// UpdateLastValuesInRedisForVariablesWithTimestamp updates the redis value of variables with timestamp
func (r Repository) UpdateLastValuesInRedisForVariablesWithTimestamp(o CreateOptions) error {
	// build the correct key
	key := fmt.Sprintf("lynus:projects:%s:measurements", o.ProjectID)
	key_timestamps := fmt.Sprintf("lynus:projects:%s:measurements:timestamps", o.ProjectID)

	// build the variable set out of all historic import variables
	measurementSet := lo.Filter(o.Measurements, func(elem Measurement, _ int) bool {
		return elem.Time != 0
	})

	// set the last value for each variable that was processed
	for _, measurement := range measurementSet {
		var lastValue float64
		var lastTimeStamp time.Time

		variableId, err := r.GetVariableID(o.ProjectID, measurement.Name)
		if err != nil {
			utils.LogError(err, "Could not get Variable ID")
			return err
		}

		// new implementation: fetch last update timestamp from redis
		// if there is none fall back to database
		// also save last update timestamp to redis

		conn := r.Pool.Get()
		timestampUnix, err_r := redis.Int64(conn.Do("HGET", key_timestamps, measurement.Name))

		// close redis connection since it might not be use anymore
		// & log on fail to close
		err_c := conn.Close()

		if err_c != nil {
			utils.LogError(err_c, "Closing redis connection did not work")
		}

		// either did not find anything or had another error
		if err_r != nil || timestampUnix == 0 {

			// some other redis error happened
			if err_r != redis.ErrNil {
				utils.LogError(err_r, "Some Redis error (getting ts) occured")
			}

			// in that case fall back to database
			if err := r.Database.QueryRow(queryLastMeasurement, variableId).Scan(&lastValue, &lastTimeStamp); err != nil {
				utils.LogError(err_r, "queryLastMeasurement failed")
				return err
			}

			timestampUnix = lastTimeStamp.Unix()
		}

		// if new measurment is newer than last one set last value & time stamp to measurment vals
		if measurement.Time >= float64(timestampUnix) {
			lastValue = measurement.Value
			timestampUnix = int64(measurement.Time)
		}

		// get a redis connection
		// open pool here otherwise EOF might happen
		// no defere since were in a loop and in every condition connection should get closed
		conn = r.Pool.Get()

		// update last value
		if _, err := conn.Do("HSET", key, measurement.Name, lastValue); err != nil {
			utils.LogError(err_r, "Setting last measurement in Redis failed ")
			err_c = nil
			err_c = conn.Close()

			if err_c != nil {
				utils.LogError(err_c, "Closing redis connection did not work")
			}
			return err
		}

		// set last timestamp in redis
		if _, err := conn.Do("HSET", key_timestamps, measurement.Name, timestampUnix); err != nil {
			utils.LogError(err, "Setting last measurement timestamp in Redis failed ")
			err_c = nil
			err_c = conn.Close()
			if err_c != nil {
				utils.LogError(err_c, "Closing redis connection did not work")
			}
			return err
		}

		err_c = nil
		err_c = conn.Close()
		if err_c != nil {
			utils.LogError(err_c, "Closing redis connection did not work")
		}
	}

	// no error occurred
	return nil
}

// Create returns a map of all variables with their latest measurement
func (r Repository) Create(o CreateOptions, projectRepo project.Repository) (MetricResult, error) {
	var metricResults []MetricResult
	for _, measurement := range o.Measurements {
		if measurement.Name == "" {
			if err := projectRepo.CreateProjectLastHeartbeat(o.ProjectID); err != nil {
				utils.LogError(err, "Create Project Last Heartbeat did not work")
				return MetricResult{}, err
			}
		} else {
			metricResult, err := r.CreateMeasurement(o.ProjectID, measurement)
			if err != nil {
				utils.LogError(err, "CreateMeasurement did not work")
				return MetricResult{}, err
			}
			metricResults = append(metricResults, metricResult)
		}
	}
	// fill out the last value in redis for variables with timestamps
	err := r.UpdateLastValuesInRedisForVariablesWithTimestamp(o)
	if err != nil {
		utils.LogError(err, "Update Last Values In Redis For Variables With Timestamp did not work")
		return MetricResult{}, err
	}
	globalMetricResult := MergeMetricResults(metricResults)

	return globalMetricResult, nil
}

// List returns a map of all variables with their latest measurement
func (r Repository) List(o ListOptions) (map[string]float64, error) {
	allowed := make([]string, 0)
	wildcard := false

	// get a redis connection
	conn := r.Pool.Get()
	defer func(conn redis.Conn) {
		err := conn.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(conn)

	// get the variable list
	key := fmt.Sprintf("lynus:projects:%s:measurements", o.ProjectID)
	measurements := map[string]float64{}
	res, err := redis.StringMap(conn.Do("HGETALL", key))
	if err != nil {
		return nil, err
	}

	rows, err := r.Database.Query(queryHasWildcardForMeasurements, o.UserID, o.ProjectID)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	if rows.Next() {
		wildcard = true
	}

	if !wildcard {
		rows, err := r.Database.Query(queryAllowedMeasurments, o.UserID, o.ProjectID)
		if err != nil {
			return nil, err
		}
		defer func(rows *sql.Rows) {
			err := rows.Close()
			if err != nil {
				utils.LogError(err, "")
			}
		}(rows)

		for rows.Next() {
			var measure string
			if err := rows.Scan(&measure); err != nil {
				return nil, err
			}
			allowed = append(allowed, measure)
		}
	}

	for k, v := range res {
		if wildcard || utils.StringArrayContains(allowed, k) {
			value, _ := strconv.ParseFloat(v, 64)
			measurements[k] = value
		}
	}

	return measurements, nil
}

// Get returns the optionally present latest measurement before the specified time, if this time is not supplied,
// the latest measurement of the variable will be returned from redis
func (r Repository) Get(o GetOptions) (utils.Optional[DataPoint], error) {
	var (
		variableId int
		dataPoint  = utils.EmptyOptional[DataPoint]()
		err        error
	)

	variableId, err = r.GetVariableID(o.ProjectID, o.Variable)
	if err != nil {
		return dataPoint, err
	}

	if !utils.HasOptionalValue(o.Time) {
		// get a redis connection
		conn := r.Pool.Get()
		defer func(conn redis.Conn) {
			err := conn.Close()
			if err != nil {
				utils.LogError(err, "")
			}
		}(conn)

		key := fmt.Sprintf("lynus:projects:%s:measurements", o.ProjectID)
		var redisValue float64
		redisValue, err = redis.Float64(conn.Do("HGET", key, o.Variable))
		if err == nil {
			dataPoint = utils.FilledOptional(DataPoint{Time: time.Now(), Value: utils.FilledOptional(redisValue)})
		}
	} else {
		// save database value into the return variable
		dataPoint, err = r.GetLastValueBefore(variableId, utils.GetOptionalValue(o.Time))
	}

	return dataPoint, err
}

// Get last value before timestamp for variable with id
func (r Repository) GetLastValueBefore(variable int, before time.Time) (utils.Optional[DataPoint], error) {

	var (
		dataPoint          = utils.EmptyOptional[DataPoint]()
		timescaleValue     float64
		timescaleTimestamp time.Time
	)

	query := queryLastMeasurementBeforeLimited

	// use cagg for old data
	if utils.IsOlderThanDays(before, 10) {
		query = GetLastValueFromContinousAggregateBefore("last", "15m")
	}

	err := r.Database.QueryRow(query, variable, before).Scan(&timescaleValue, &timescaleTimestamp)
	if err == nil {
		dataPoint = utils.FilledOptional(DataPoint{Time: timescaleTimestamp, Value: utils.FilledOptional(timescaleValue)})
	} else {
		// ignore error when no rows are returned, the optional type is used for optional values
		if err == sql.ErrNoRows {
			err = nil
		}
	}

	return dataPoint, err
}

// GetSuitableOriginDate returns a proper origin date for the graph aggregation
func GetSuitableOriginDate(interval string) string {
	if interval == "1w" {
		// weekly aggregations should start on monday, this date is a monday ...
		return "1900-01-01"
	} else {
		// all other aggregations should start at the beginning of a year/month/day/hour/minute/second
		return "1900-01-01"
	}
}

// GetDefaultAggregateQuery returns a simple aggregation function result per time bucket
// available variables are value and time
func GetDefaultAggregateQuery(aggregate string) string {
	var query string
	switch aggregate {
	case AVG:
		query = "avg(value)"
	case INTEGRAL:
		query = "integral(time_weight('LOCF', time, value), 'hour')"
	case AVGTW:
		query = "average(time_weight('LOCF', time, value))"
	case COUNT:
		query = "count(value)"
	case MAX:
		query = "max(value)"
	case MIN:
		query = "min(value)"
	case RANGE:
		query = "max(value) - min(value)"
	case SUM:
		query = "sum(value)"
	case FIRST:
		query = "first(value, time)"
	case LAST:
		query = "last(value, time)"
	case STDDEV:
		query = "stddev_samp(value)"
	case VAR:
		query = "var_samp(value)"
	default:
		query = "avg(value)"
	}

	return `SELECT time_bucket($1, time, $5) AS bucket, ` + query + ` 
		FROM measurements WHERE variable = $2 AND time >= $3 AND time <= $4 GROUP BY bucket ORDER BY bucket;`
}

// GetContinousAggreagteQuery returns the query for a given aggreagte and given interval
func GetContinuousAggreagteQuery(interval string, aggregate string) string {
	return `SELECT bucket, ` + aggregate + ` as value 
	FROM ` + europeViennaCaggsMap[interval] + ` WHERE variable = $1 AND bucket >= $2 AND bucket <= $3 ORDER BY bucket;`
}

func GetLastValueFromContinousAggregateBefore(aggregate, interval string) string {
	return `SELECT ` + aggregate + ` as value, bucket 
	FROM ` + europeViennaCaggsMap[interval] + ` WHERE variable = $1 AND bucket <= $2 ORDER BY bucket DESC LIMIT 1;`

}

// GetAggregatedValues returns the chart data specified by the passed history options
func (r Repository) GetAggregatedValues(o HistoryOptions) ([]DataPoint, error) {
	// get the variable id for the variable name
	id, err := r.GetVariableID(o.ProjectID, o.Variable)
	if err != nil {
		return nil, err
	}

	// read out the aggregated values from the database
	var (
		rows   *sql.Rows
		sqlErr error
	)

	// aggregation for raw time_bucket queries
	_, exist := europeViennaCaggsMap[o.Interval]

	isEqualTimezone, errTz := utils.CompareTimezones(o.Timezone, "Europe/Vienna")

	if errTz == nil && exist && isEqualTimezone {
		rows, sqlErr = r.Database.Query(GetContinuousAggreagteQuery(o.Interval, o.Aggregation), id, o.Start, o.End)
	} else {
		rows, sqlErr = r.Database.Query(GetDefaultAggregateQuery(o.Aggregation),
			o.Interval, id, o.Start, o.End, o.Timezone)
	}
	if sqlErr != nil && sqlErr != sql.ErrNoRows {
		return nil, sqlErr
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	var (
		measurements     = map[int64]utils.Optional[float64]{}
		timestamp        time.Time
		aggregationValue sql.NullFloat64
	)
	for rows.Next() {
		if err := rows.Scan(&timestamp, &aggregationValue); err != nil {
			return nil, err
		}
		// add an optionally present measurement to the map
		var measurementValue utils.Optional[float64]
		if aggregationValue.Valid {
			measurementValue = utils.FilledOptional(aggregationValue.Float64)
		} else {
			measurementValue = utils.EmptyOptional[float64]()
		}
		measurements[timestamp.Unix()] = measurementValue
	}

	// merge the sql data with all timestamps that should be present using the GenerateInterval function
	result := make([]DataPoint, 0)
	buckets, err := GenerateInterval(o)

	if err != nil {
		return nil, err
	}
	for _, intervalStart := range buckets {
		measurement, found := measurements[intervalStart]
		var measurementValue utils.Optional[float64]

		if !found {
			measurementValue = utils.EmptyOptional[float64]()
		} else {
			measurementValue = measurement
		}
		result = append(result, DataPoint{Time: time.Unix(intervalStart, 0), Value: measurementValue})
	}

	if slices.Contains([]string{LOCF}, o.MissingValueStrategy) {
		// fill up values to the right using LOCF (last observation carried forward)
		for i := 1; i < len(result); i++ {
			if !utils.HasOptionalValue(result[i].Value) && utils.HasOptionalValue(result[i-1].Value) {
				// fill up missing values to the right
				result[i].Value = utils.FilledOptional(utils.GetOptionalValue(result[i-1].Value))
			}
		}
	}

	return result, nil
}

// ConvertChartDataPointsToJson converts the data point slice to valid JSON in the format: [[int64, float64], ...]
func ConvertChartDataPointsToJson(points []DataPoint, o HistoryOptions) [][]any {
	// set the correct starting and ending timestamp
	if len(points) > 0 {
		points[0].Time = o.Start
	}

	// TODO: is this needed?? for what?? -JP 28/2/2024
	// adds unnecessary datapoint to charts
	// if len(points) > 0 {
	// 	points = append(points, DataPoint{Time: o.End.Add(time.Second), Value: utils.EmptyOptional[float64]()})
	// }

	// convert to a JSON representation
	result := make([][]any, 0)
	for _, point := range points {
		var value float64
		if utils.HasOptionalValue(point.Value) {
			value = utils.GetOptionalValue(point.Value)
		}
		result = append(result, []any{point.Time.Unix(), value})
	}
	return result
}

// History returns measurement data for an interval with the specified aggregation method in the
// following format: [[int64, float64], ...], where the int64 number is a unix timestamp
func (r Repository) History(o HistoryOptions) ([][]any, error) {
	// validate interval and aggregator and missing value strategy
	if err := validateInterval(o.Interval, o.End.Sub(o.Start)); err != nil {
		return nil, err
	}
	if err := validateAggregator(o.Aggregation); err != nil {
		return nil, err
	}
	if err := validateMissingValueStrategy(o.MissingValueStrategy); err != nil {
		return nil, err
	}
	if err := utils.ValidateTimezone(o.Timezone); err != nil {
		return nil, err
	}

	// the difference aggregation method is handled differently
	if o.Aggregation == DIFF {
		return r.handleIncrease(o)
	}

	if o.Aggregation == DERIVATE {
		result, err := r.handleIncrease(o)
		return DivideValuesByIntervalLength(result), err
	}

	// for all other method the standard retrieval way works
	dataPoints, err := r.GetAggregatedValues(o)
	if err != nil {
		return nil, err
	}

	// convert the chart data points to a serializable map
	result := ConvertChartDataPointsToJson(dataPoints, o)

	return result, nil
}

// MultiplyValuesWithIntervalLength this function uses the time-weighted average to compute the integral
func MultiplyValuesWithIntervalLength(result [][]any) [][]any {
	for index, point := range result {
		if index == len(result)-1 {
			continue
		}
		currentTimestamp := point[0].(int64)
		nextTimestamp := result[index+1][0].(int64)
		intervalLengthInHours := (time.Duration(nextTimestamp-currentTimestamp) * time.Second).Hours()
		if point[1] != nil {
			result[index][1] = point[1].(float64) * intervalLengthInHours
		}
	}
	return result
}

// This function uses the time-weighted average to compute the time derivation
func DivideValuesByIntervalLength(result [][]any) [][]any {
	for index, point := range result {
		if index == len(result)-1 {
			continue
		}
		currentTimestamp := point[0].(int64)
		nextTimestamp := result[index+1][0].(int64)
		intervalLengthInHours := (time.Duration(nextTimestamp-currentTimestamp) * time.Second).Hours()
		if point[1] != nil {
			result[index][1] = point[1].(float64) / intervalLengthInHours
		}
	}
	return result
}

// handleIncrease computes the difference between the specified intervals for counter values
// it also does some error handling as the series should be monotonically increasing
func (r Repository) handleIncrease(o HistoryOptions) ([][]any, error) {
	// this endpoint only works with the LOCF missing value strategy
	o.MissingValueStrategy = LOCF

	// change the aggregation method to last as the last value of each interval is used to compute the difference
	o.Aggregation = LAST

	var err error

	// if cagg exists, subtract one interval from start
	_, exist := europeViennaCaggsMap[o.Interval]
	if exist {
		o.Start, err = AddIntervalToTime(o.Start, o.Interval, -1)
		if err != nil {
			return nil, err
		}
	}

	// use the GetAggregatedValues function to retrieve the values from the database
	dataPoints, err := r.GetAggregatedValues(o)
	if err != nil {
		return nil, err
	}

	// apply increase
	dataPoints = increase(dataPoints)

	// convert the chart data points to a serializable map
	result := ConvertChartDataPointsToJson(dataPoints, o)

	return result, nil
}

// validateInterval checks if the interval is in the specified period in the intervals map
func validateInterval(interval string, period time.Duration) error {
	for duration, ints := range intervals {
		for _, i := range ints {
			if interval == i {
				if period > duration {
					return errors.New("interval too big for period")
				}
				return nil
			}
		}
	}
	return errors.New("interval not found")
}

// validateAggregator validates aggregation methods
func validateAggregator(agg string) error {
	if !slices.Contains(allowedValues, agg) {
		return errors.New("invalid aggregation")
	}
	return nil
}

// validateMissingValueStrategy validates missing value strategies
func validateMissingValueStrategy(missingValueStrategy string) error {
	allowedValues := []string{LOCF, NONE}
	if !slices.Contains(allowedValues, missingValueStrategy) {
		return errors.New("invalid missing value strategy")
	}
	return nil
}

// increase returns the difference between the previous and current value,
// it corrects the series to be monotonically increasing and fills up empty start values,
// the returned slice length is one smaller than the passed slice length
func increase(points []DataPoint) []DataPoint {
	pointsLength := len(points)
	differenceValues := make([]DataPoint, 0)

	// at least two points are needed for a difference calculation
	if pointsLength < 2 {
		return differenceValues
	}

	// correct values to the right by making the series monotonically increasing and fill up values to the right
	previousValue := utils.EmptyOptional[float64]()
	for i := 0; i < pointsLength; i++ {
		// check the current value
		currentValue := points[i].Value
		// apply the check logic
		if utils.HasOptionalValue(previousValue) && utils.HasOptionalValue(currentValue) {
			if utils.GetOptionalValue(currentValue) < utils.GetOptionalValue(previousValue) {
				// if the series goes down and breaks monotonicity, overwrite the current value with the previous one
				points[i].Value = previousValue
			}
		}
		// apply the fill up logic
		if utils.HasOptionalValue(previousValue) && !utils.HasOptionalValue(currentValue) {
			// fill up values to the right
			points[i].Value = previousValue
		}
		// the current value of the current iteration becomes the previous value for the next iteration
		previousValue = points[i].Value
	}

	// compute the differences
	for i := 1; i < pointsLength; i++ {
		currentValue := points[i].Value
		previousValue := points[i-1].Value
		currentTimestamp := points[i].Time
		var valueDifference = utils.EmptyOptional[float64]()
		if utils.HasOptionalValue(previousValue) && utils.HasOptionalValue(currentValue) {
			valueDifference = utils.FilledOptional(utils.GetOptionalValue(currentValue) - utils.GetOptionalValue(previousValue))
		}

		// compute the difference values
		differenceValues = append(differenceValues, DataPoint{Time: currentTimestamp, Value: valueDifference})
	}

	return differenceValues
}

// AddIntervalToTime adds the interval specified by the passed string to the passed time
func AddIntervalToTime(start time.Time, interval string, factor int) (time.Time, error) {
	var result time.Time
	switch interval {
	case "1s":
		result = start.Add(time.Duration(factor) * 1 * time.Second)
	case "5s":
		result = start.Add(time.Duration(factor) * 5 * time.Second)
	case "10s":
		result = start.Add(time.Duration(factor) * 10 * time.Second)
	case "15s":
		result = start.Add(time.Duration(factor) * 15 * time.Second)
	case "30s":
		result = start.Add(time.Duration(factor) * 30 * time.Second)
	case "1m":
		result = start.Add(time.Duration(factor) * 1 * time.Minute)
	case "5m":
		result = start.Add(time.Duration(factor) * 5 * time.Minute)
	case "10m":
		result = start.Add(time.Duration(factor) * 10 * time.Minute)
	case "15m":
		result = start.Add(time.Duration(factor) * 15 * time.Minute)
	case "30m":
		result = start.Add(time.Duration(factor) * 30 * time.Minute)
	case "45m":
		result = start.Add(time.Duration(factor) * 45 * time.Minute)
	case "1h":
		result = start.Add(time.Duration(factor) * 1 * time.Hour)
	case "4h":
		result = start.Add(time.Duration(factor) * 4 * time.Hour)
	case "6h":
		result = start.Add(time.Duration(factor) * 6 * time.Hour)
	case "1d":
		result = start.AddDate(0, 0, factor*1)
	case "1w":
		result = start.AddDate(0, 0, factor*7)
	case "1month":
		result = start.AddDate(0, factor*1, 0)
	case "1y":
		result = start.AddDate(factor*1, 0, 0)
	default:
		return time.Time{}, errors.New("invalid interval string")
	}
	return result, nil
}

func GetStartingTimestamp(origin time.Time, o HistoryOptions) (time.Time, error) {
	if o.Start.Unix() < origin.Unix() {
		return time.Time{}, errors.New("start timestamp must be greater than the origin timestamp")
	}
	originWithAddedInterval, err := AddIntervalToTime(origin, o.Interval, 1)
	if err != nil {
		return time.Time{}, nil
	}
	durationInSeconds := int(originWithAddedInterval.Sub(origin).Seconds())
	currentFactor := math.MaxInt32 / durationInSeconds
	currentTimestamp := origin
	for currentTimestamp.Unix() < o.Start.Unix() {
		var err error
		intermediateCurrentTimestamp, err := AddIntervalToTime(currentTimestamp, o.Interval, currentFactor)
		if err != nil {
			return time.Time{}, err
		}
		if intermediateCurrentTimestamp.Unix() >= o.Start.Unix() && currentFactor != 1 {
			currentFactor = currentFactor / 2
		} else {
			currentTimestamp = intermediateCurrentTimestamp
		}
	}
	if currentTimestamp.Unix() == o.Start.Unix() {
		// start boundary is exact
		return currentTimestamp, nil
	} else {
		// otherwise there are values from o.Start to currentTimestamp
		beforeTimestamp, err := AddIntervalToTime(currentTimestamp, o.Interval, -1)
		if err != nil {
			return time.Time{}, err
		}
		return beforeTimestamp, err
	}
}

// GenerateInterval generates all intervals for a given hoursInterval
// between unixStart and unixEnd
func GenerateInterval(o HistoryOptions) ([]int64, error) {
	location, err := utils.GetLocation(o.Timezone)
	if err != nil {
		return nil, err
	}

	var origin time.Time

	origin, err = time.ParseInLocation("2006-01-02", GetSuitableOriginDate(o.Interval), location)
	if err != nil {
		return nil, err
	}

	currentTimestamp, err := GetStartingTimestamp(origin, o)
	if err != nil {
		return nil, err
	}
	buckets := make([]int64, 0)
	for currentTimestamp.Unix() <= o.End.Unix() {
		if currentTimestamp.Unix() >= o.Start.Unix() {
			buckets = append(buckets, currentTimestamp.Unix())
		}
		currentTimestamp, err = AddIntervalToTime(currentTimestamp, o.Interval, 1)
		if err != nil {
			return nil, err
		}
	}
	return buckets, nil
}

// CreateMeasurement inserts a measurement into the database and updates the last
// value for this variable in redis
func (r Repository) CreateMeasurement(project string, m Measurement) (MetricResult, error) {
	// get a redis connection
	conn := r.Pool.Get()
	defer func(conn redis.Conn) {
		err := conn.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(conn)

	var metricResult MetricResult
	key := fmt.Sprintf("lynus:projects:%s:variables", project)
	// TODO: use GetVariableID instead of this
	id, err := redis.Int(conn.Do("HGET", key, m.Name))
	if err != nil {
		// if it's some other redis error, return
		if err != redis.ErrNil {
			utils.LogError(err, "Some Redis error occured in CreateMeasurement")
			return MetricResult{}, err
		}

		// first check for the variable limit (which is hardcoded right now)
		sum, err := redis.Int(conn.Do("HLEN", key))
		if err != nil {
			return MetricResult{}, err
		}

		if sum >= variableLimit {
			return MetricResult{}, errors.New("limit reached")
		}

		id, err = r.createMeasurementMeta(project, m.Name)
		if err != nil {
			utils.LogError(err, "Failed to create measurement meta")
			return MetricResult{}, err
		}
		metricResult.VariablesCreated += 1
	}

	if m.Time == 0 {
		if _, err = r.Database.Exec(queryCreateMeasurementWithoutTime, id, m.Value, m.Unit); err != nil {
			return MetricResult{}, err
		}
		// add the last value of the variable in redis
		lastValue := m.Value
		key = fmt.Sprintf("lynus:projects:%s:measurements", project)
		if _, err := conn.Do("HSET", key, m.Name, lastValue); err != nil {
			return MetricResult{}, err
		}
	} else {
		if _, err = r.Database.Exec(queryCreateMeasurementWithTime, m.Time, id, m.Value, m.Unit); err != nil {
			return MetricResult{}, err
		}
		// the last value of the variable in redis will be updated by UpdateLastValuesInRedisForVariablesWithTimestamp
	}

	metricResult.MeasurementsCreated += 1

	return metricResult, nil
}

// createMeasurementMeta creates a variables for a project, if it doesn't exist already
func (r Repository) createMeasurementMeta(project, variable string) (id int, err error) {
	// get a redis connection
	conn := r.Pool.Get()
	defer func(conn redis.Conn) {
		err := conn.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(conn)

	if err := r.Database.QueryRow(queryCreateProjectVariable, project, variable).Scan(&id); err != nil {
		return 0, err
	}

	key := fmt.Sprintf("lynus:projects:%s:variables", project)
	if _, err := conn.Do("HSET", key, variable, id); err != nil {
		return 0, err
	}

	return id, nil
}

func (r Repository) DeleteMeasurementsWithoutMeta() error {
	_, err := r.Database.Exec("DELETE FROM measurements m WHERE variable not in (SELECT id FROM measurements_meta)")
	return err
}

// CreateShellyMeasurements creates measurements in the shelly table
func (r Repository) CreateShellyMeasurements(measurements []ShellyMeasurement) error {
	for _, measurement := range measurements {
		// try to ingest measurement into the database
		if _, err := r.Database.Exec(queryCreateShellyMeasurement,
			measurement.Id, measurement.Name, measurement.Generation, measurement.User,
			measurement.Category, measurement.Manufacturer, measurement.Model, measurement.Phase,
			measurement.Property, measurement.Value, measurement.Unit, utils.GetFloatUnixTimestampFromTime(measurement.Timestamp)); err != nil {
			// return the error
			return err
		}
	}
	// no error happened
	return nil
}

func PublishVariable(mqttClient *mqtt.Client, projectId string, measurements []Measurement, callback func()) {
	jsonBytes, err := json.Marshal(measurements)
	if err != nil {
		utils.LogError(err, "")
		return
	}
	(*mqttClient).Publish(utils.GetCloudToDeviceMqttTopic(projectId), 2, false, jsonBytes)
	callback()
}

func PublishImpulse(mqttClient *mqtt.Client, projectId string, variable string, callback func()) {
	PublishVariable(mqttClient, projectId, []Measurement{{Name: variable, Value: 1, Unit: ""}}, callback)
	time.Sleep(time.Second)
	PublishVariable(mqttClient, projectId, []Measurement{{Name: variable, Value: 0, Unit: ""}}, callback)
}
