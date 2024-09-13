package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"os"
	"strconv"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/eneries/eneries/api/pkg/utils"
	"github.com/gomodule/redigo/redis"
	"github.com/gorilla/mux"

	_ "github.com/lib/pq"
)

type (
	SenML struct {
		Name  string  `json:"n"`
		Value float64 `json:"v"`
	}

	measurementPublish struct {
		Topic  string    `json:"topic"`
		Values [][]SenML `json:"values"`
	}

	measurementOptions struct {
		Password     string               `json:"pass"`
		Measurements []measurementPublish `json:"measurements"`
	}
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

	// mqtt environment variables
	envMqttAddr = os.Getenv("MQTT_ADDR")
	mqttClient  mqtt.Client

	// intervalReference for parsing intervals from string to Duration
	intervalReference = map[string][]int{
		"5s":  {5, int(time.Second)},
		"10s": {10, int(time.Second)},
		"15s": {15, int(time.Second)},
		"30s": {30, int(time.Second)},
		"1m":  {1, int(time.Minute)},
		"5m":  {5, int(time.Minute)},
		"10m": {10, int(time.Minute)},
		"15m": {15, int(time.Minute)},
		"30m": {30, int(time.Minute)},
		"45m": {45, int(time.Minute)},
		"1h":  {1, int(time.Hour)},
		"4h":  {4, int(time.Hour)},
		"6h":  {6, int(time.Hour)},
		"1d":  {24, int(time.Hour)},
	}
)

func main() {
	var err error

	//setup logging
	l := utils.GetLogger()

	// create a postgres database connection
	postgresDatabase, err = utils.OpenPostgresDatabase(envDbAddr, envDbPort, envDbName, envDbUser, envDbPass, envDbMode, utils.DefaultMaxOpenConnsHeavy, utils.DefaultMaxIdleConns, utils.DefaultConnMaxLifetime, utils.DefaultConnMaxIdleTime)
	if err != nil {
		l.Fatal().Err(err).Msg("Cannot open Postgres connection")
		return
	}
	defer func(postgresDatabase *sql.DB) {
		err := utils.ClosePostgresDatabase(postgresDatabase)
		if err != nil {
			utils.LogError(err, "")
		}
	}(postgresDatabase)

	// create a redis connection pool
	redisPool = utils.OpenRedisPool(envRedisAddr)
	defer func(redisPool *redis.Pool) {
		err := utils.CloseRedisPool(redisPool)
		if err != nil {
			utils.LogError(err, "Cannot close Postgres connection")
		}
	}(redisPool)

	// connect a client to the mqtt broker
	mqttClient, err = utils.CreateMqttClient(envMqttAddr, []string{}, nil)
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

	r := routes()

	l.Info().Msg("Starting EMPA Service...")

	if err := http.ListenAndServe(":8000", r); err != nil {
		l.Fatal().Err(err).Msg("HTTP Server failed")
	}
}

func routes() *mux.Router {
	r := mux.NewRouter()

	r.HandleFunc("/data", handleGetData).Methods(http.MethodGet)
	r.HandleFunc("/measurements", handleMeasurements).Methods(http.MethodPost)
	r.HandleFunc("/data/last", handleLastValue).Methods(http.MethodGet)
	r.HandleFunc("/metrics", handleMetrics).Methods(http.MethodGet)

	return r
}

// handleMetrics endpoint for the prometheus metrics
func handleMetrics(w http.ResponseWriter, _ *http.Request) {
	resp := utils.GetRedisPoolStatsFormatted(redisPool, "empa")
	resp += utils.GetPostgresStatsFormatted(postgresDatabase, "empa")
	_, _ = w.Write([]byte(resp))
}

func handleLastValue(w http.ResponseWriter, r *http.Request) {
	var (
		queryProject  = r.URL.Query().Get("project")
		queryVariable = r.URL.Query().Get("var")
	)

	// get a redis connection
	conn := redisPool.Get()
	defer func(conn redis.Conn) {
		err := conn.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(conn)

	// get last value from redis
	key := fmt.Sprintf("lynus:projects:%s:measurements", queryProject)
	val, err := redis.Float64(conn.Do("HGET", key, queryVariable))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(&map[string]any{"value": val}); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func handleMeasurements(w http.ResponseWriter, r *http.Request) {
	var opts measurementOptions

	if err := json.NewDecoder(r.Body).Decode(&opts); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	for _, measurement := range opts.Measurements {
		for _, val := range measurement.Values {
			js, err := json.Marshal(val)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				continue
			}
			mqttClient.Publish(measurement.Topic, 2, false, js)
		}
	}
}

// handleGetData returns a time series [[ts, val], [ts2, val2], ..] for the requested parameters
func handleGetData(w http.ResponseWriter, r *http.Request) {
	// parameters
	var (
		err             error
		start           time.Time
		end             time.Time
		queryStart      = r.URL.Query().Get("start")
		queryEnd        = r.URL.Query().Get("end")
		queryVariable   = r.URL.Query().Get("var")
		queryType       = r.URL.Query().Get("type")
		querySampleTime = r.URL.Query().Get("sample_time")
		queryProject    = r.URL.Query().Get("project")
	)

	if queryType != "avg" && queryType != "last" {
		http.Error(w, "not supported query type: "+queryType, http.StatusBadRequest)
		return
	}

	start, err = stringToUnix(queryStart)
	if err != nil {
		utils.LogError(err, "error converting string")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	end, err = stringToUnix(queryEnd)
	if err != nil {
		utils.LogError(err, "error converting string")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	id, err := getVariableID(queryProject, queryVariable)
	if err != nil {
		utils.LogError(err, "error getVariableID for project")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	ref := intervalReference[querySampleTime]
	bucket := generateInterval(start, end, ref[0], time.Duration(ref[1]))

	var (
		rows   *sql.Rows
		sqlErr error
	)

	query := ""

	if queryType == "avg" {
		if querySampleTime == "15m" {
			query = `SELECT time_bucket_gapfill($1, bucket) as period,
				avg(avg) as value
				FROM measurements_15_min
				WHERE variable = $2
				AND bucket >= $3
				AND bucket <= $4
				GROUP BY period
				ORDER BY period`
		} else {
			query = `SELECT time_bucket_gapfill($1, time) as 
				period, avg(value) as value FROM 
				measurements WHERE variable = $2 AND time >= $3 AND time <= $4 
				GROUP BY period ORDER BY period`
		}
	} else {
		query = `SELECT time_bucket_gapfill($1, time) as
			period, last(value, time) as value FROM
			measurements WHERE variable = $2 AND time >= $3 AND time <= $4
			GROUP BY period ORDER BY period`
	}

	rows, sqlErr = postgresDatabase.Query(query, querySampleTime, id, start, end)
	if sqlErr != nil {
		utils.LogError(err, "error query database")
		http.Error(w, sqlErr.Error(), http.StatusInternalServerError)
		return
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	var (
		result    = make([][]any, 0)
		sqlResult = map[int]any{}
		ts        time.Time
		value     sql.NullFloat64
	)

	for rows.Next() {
		if err := rows.Scan(&ts, &value); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if !value.Valid {
			sqlResult[int(ts.Unix())] = nil
		} else {
			sqlResult[int(ts.Unix())] = math.Round(value.Float64*100) / 100
		}
	}

	// generate time series with timestamps from bucket and values
	// from sqlResults
	for _, e := range bucket {
		result = append(result, []any{e, sqlResult[e]})
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(&result)
}

func stringToUnix(ts string) (time.Time, error) {
	val, err := strconv.ParseInt(ts, 10, 64)
	if err != nil {
		return time.Time{}, err
	}
	return time.Unix(val, 0), nil
}

// TODO use func from api
func getVariableID(project, variable string) (int, error) {
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
	if err != nil {
		return 0, err
	}

	return val, nil
}

// generateInterval generates all intervals for a given hoursInterval
// between unixStart and unixEnd
func generateInterval(start, end time.Time, interval int, unit time.Duration) []int {
	endUnix := end.Unix()
	startUnix := start.Unix()

	counter := start.Truncate(time.Duration(interval) * unit)
	if counter.Unix() < startUnix {
		counter = counter.Add(time.Duration(interval) * unit)
	}

	bucket := make([]int, 0)

	for counter.Unix() <= endUnix {
		bucket = append(bucket, int(counter.Unix()))
		counter = counter.Add(time.Duration(interval) * unit)
	}

	return bucket
}
