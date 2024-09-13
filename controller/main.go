package main

import (
	"database/sql"
	"math"
	"net/http"
	"os"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/efficientIO/efficientIO/api/pkg/resource/device"
	"github.com/efficientIO/efficientIO/api/pkg/resource/measurement"
	"github.com/efficientIO/efficientIO/api/pkg/utils"
	"github.com/gomodule/redigo/redis"

	"github.com/efficientIO/efficientIO/recorder/pkg/timeswitch"

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

	// mqtt environment variables
	envMqttAddr = os.Getenv("MQTT_ADDR")
	mqttClient  mqtt.Client

	// redis environment variables
	envRedisAddr = os.Getenv("REDIS_ADDR")
	redisPool    *redis.Pool

	variablesWritten int64

	deviceRepo      device.Repository
	measurementRepo measurement.Repository
)

const timeSwitchDeviceTypeKey = "TimeSwitch"

func main() {
	var err error

	//setup logging
	l := utils.GetLogger()

	// create a postgres database connection
	postgresDatabase, err = utils.OpenPostgresDatabase(envDbAddr, envDbPort, envDbName, envDbUser, envDbPass, envDbMode, utils.DefaultMaxOpenConnsLight, utils.DefaultMaxIdleConns, utils.DefaultConnMaxLifetime, utils.DefaultConnMaxIdleTime)
	if err != nil {
		l.Fatal().Err(err).Msg("")
		return
	}
	defer func(postgresDatabase *sql.DB) {
		err := utils.ClosePostgresDatabase(postgresDatabase)
		if err != nil {
			utils.LogError(err, "")
		}
	}(postgresDatabase)

	// connect a client to the mqtt broker
	mqttClient, err = utils.CreateMqttClient(envMqttAddr, []string{}, nil)
	if err != nil {
		l.Fatal().Err(err).Msg("")
		return
	}
	defer func(mqttClient mqtt.Client) {
		err := utils.DestroyMqttClient(mqttClient)
		if err != nil {
			utils.LogError(err, "")
		}
	}(mqttClient)

	// create a redis connection pool
	redisPool = utils.OpenRedisPool(envRedisAddr)
	defer func(redisPool *redis.Pool) {
		err := utils.CloseRedisPool(redisPool)
		if err != nil {
			utils.LogError(err, "")
		}
	}(redisPool)

	deviceRepo = device.Repository{Database: postgresDatabase}
	measurementRepo = measurement.Repository{Database: postgresDatabase, Pool: redisPool}

	l.Info().Msg("Starting Time Controller service...")

	go startMetricsServer()

	time.Sleep(time.Duration(nanosToNextMinute()))

	minuteTicker := time.NewTicker(time.Minute)
	defer minuteTicker.Stop()
	for {
		l.Debug().Msg("Schedule run")

		devices, err := deviceRepo.GetAllbyType(timeSwitchDeviceTypeKey)
		if err != nil {
			l.Fatal().Err(err).Msg("")
			return
		}
		timeswitch.HandleTimeSwitchDevices(devices, &mqttClient, &measurementRepo, incVariablesWritten)
		l.Debug().Int64("totalVariablesWritten", variablesWritten).Msg("Written variables")

		// wait for next minute
		<-minuteTicker.C
	}
}

func incVariablesWritten() {
	variablesWritten += 1
}

// start the web server with the metrics endpoint
func startMetricsServer() {
	if err := http.ListenAndServe(":8000", http.HandlerFunc(handleMetrics)); err != nil {
		l := utils.GetLogger()
		l.Fatal().Err(err).Msg("Starting metrics handler failed")
	}
}

// handleMetrics endpoint for the prometheus metrics
func handleMetrics(w http.ResponseWriter, _ *http.Request) {
	resp := utils.CreateVariablesWrittenMetrics("controller", variablesWritten)
	resp += utils.GetRedisPoolStatsFormatted(redisPool, "controller")
	resp += utils.GetPostgresStatsFormatted(postgresDatabase, "controller")
	_, _ = w.Write([]byte(resp))
}

func nanosToNextMinute() int64 {
	nanosInSecond := int64(math.Pow(10, 9))
	now := time.Now()
	return int64(60-now.Second())*nanosInSecond + int64(now.Nanosecond())
}
