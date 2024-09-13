package main

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"os"
	"sync/atomic"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/efficientIO/efficientIO/api/pkg/resource/measurement"
	"github.com/efficientIO/efficientIO/api/pkg/resource/project"
	"github.com/efficientIO/efficientIO/api/pkg/utils"
	"github.com/gomodule/redigo/redis"
	_ "github.com/lib/pq"
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
	mqttTopic   = "projects/+/+"
	mqttClient  mqtt.Client

	variablesCreated    int64
	measurementsCreated int64

	measurementRepo measurement.Repository
	projectRepo     project.Repository
)

func main() {
	var err error

	// Setup logging
	l := utils.GetLogger()

	// create a postgres database connection
	postgresDatabase, err = utils.OpenPostgresDatabase(envDbAddr, envDbPort, envDbName, envDbUser, envDbPass, envDbMode, utils.DefaultMaxOpenConnsUltra, utils.DefaultMaxIdleConns, utils.DefaultConnMaxLifetime, utils.DefaultConnMaxIdleTime)
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

	// create used repositories
	measurementRepo = measurement.Repository{Database: postgresDatabase, Pool: redisPool}
	projectRepo = project.Repository{Database: postgresDatabase, Pool: redisPool}

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

	l.Info().Msg("Starting Recorder service ...")

	// start the web server with the metrics endpoint
	if err := http.ListenAndServe(":8000", http.HandlerFunc(handleMetrics)); err != nil {
		l.Fatal().Err(err).Msg("HTTP Metrics Server failed")
	}
}

// handleMetrics endpoint for the prometheus metrics
func handleMetrics(w http.ResponseWriter, _ *http.Request) {
	resp := utils.CreateVariableAndMeasurementMetrics("recorder", measurementsCreated, variablesCreated)
	resp += utils.GetRedisPoolStatsFormatted(redisPool, "recorder")
	resp += utils.GetPostgresStatsFormatted(postgresDatabase, "recorder")
	_, _ = w.Write([]byte(resp))
}

// mqttMessageHandler is called on incoming mqtt messages
func mqttMessageHandler(_ mqtt.Client, message mqtt.Message) {
	// retrieve the project and measurements from the mqtt message
	projectId, err := utils.GetProjectIdFromTopic(message.Topic())
	if err != nil {
		utils.LogError(err, "")
		return
	}
	measurements := make([]measurement.Measurement, 0)
	if err := json.Unmarshal(message.Payload(), &measurements); err != nil {
		utils.LogError(err, "")
		return
	}

	// generate the create options slice
	createOptionsSlice := []measurement.CreateOptions{{ProjectID: projectId, Measurements: measurements}}

	// create the measurements in the database
	_, metricResult, err := measurementRepo.CreateMeasurements(createOptionsSlice, projectRepo, true)
	if err != nil {
		utils.LogError(err, "")
		return
	}

	// update the recorder metrics using atomic operations
	atomic.AddInt64(&variablesCreated, metricResult.VariablesCreated)
	atomic.AddInt64(&measurementsCreated, metricResult.MeasurementsCreated)
}
