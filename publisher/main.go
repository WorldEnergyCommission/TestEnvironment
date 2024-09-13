package main

import (
	"database/sql"
	"fmt"
	"os"
	"strconv"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/gomodule/redigo/redis"
	_ "github.com/lib/pq"

	"github.com/eneries/eneries/api/pkg/resource/measurement"
	"github.com/eneries/eneries/api/pkg/resource/project"
	"github.com/eneries/eneries/api/pkg/utils"
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

	// limits (can be changed per project/user)
	projectLimit    = 8192
	deviceLimit     = 8192
	memberLimit     = 8192
	collectionLimit = 8192

	projectRepo project.Repository
)

func main() {
	var err error

	//setup logging
	l := utils.GetLogger()

	l.Info().Msg("Starting Publisher")
	// create a postgres database connection
	postgresDatabase, err = utils.OpenPostgresDatabase(envDbAddr, envDbPort, envDbName, envDbUser, envDbPass, envDbMode, utils.DefaultMaxOpenConnsLight, utils.DefaultMaxIdleConns, utils.DefaultConnMaxLifetime, utils.DefaultConnMaxIdleTime)
	if err != nil {
		l.Fatal().Err(err).Msg("Cannot open Postgres connection")
		return
	}
	l.Info().Msg("Opened Postgres connection")

	defer func(postgresDatabase *sql.DB) {
		err := utils.ClosePostgresDatabase(postgresDatabase)
		if err != nil {
			utils.LogError(err, "Cannot close Postgres connection")
		}
	}(postgresDatabase)

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

	// create a redis connection pool
	redisPool = utils.OpenRedisPool(envRedisAddr)
	defer func(redisPool *redis.Pool) {
		err := utils.CloseRedisPool(redisPool)
		if err != nil {
			utils.LogError(err, "Cannot close Redis pool")
		}
	}(redisPool)

	projectRepo = project.Repository{Database: postgresDatabase, Pool: redisPool, CollectionLimit: collectionLimit, DeviceLimit: deviceLimit, MemberLimit: memberLimit}
	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()
	for {
		l.Debug().Msg("Running ticker")

		projects, err := projectRepo.ListAll()
		if err != nil {
			utils.LogError(err, "")
			break
		}

		for _, project := range projects {

			location := project.Meta["location"]
			if location == nil {
				break
			}

			locationCasted := project.Meta["location"].(map[string]any)
			if locationCasted["lat"] == nil || locationCasted["lon"] == nil {
				break
			}

			lat, errParseLat := strconv.ParseFloat(locationCasted["lat"].(string), 64)
			lon, errParseLon := strconv.ParseFloat(locationCasted["lon"].(string), 64)
			if (errParseLat != nil) || (errParseLon != nil) {
				l := utils.GetLogger()
				l.Error().Str("project_id", project.ID).Msg("Error Parsing location")
				break
			}

			locationAsMeasurements := []measurement.Measurement{{Name: "GVL.location_lat", Value: lat}}
			measurement.PublishVariable(&mqttClient, project.ID, locationAsMeasurements, LoggingForPublishedVariable(project.ID, "GVL.location_lat", fmt.Sprint(lat)))
			locationAsMeasurements = []measurement.Measurement{{Name: "GVL.location_lon", Value: lon}}
			measurement.PublishVariable(&mqttClient, project.ID, locationAsMeasurements, LoggingForPublishedVariable(project.ID, "GVL.location_lon", fmt.Sprint(lon)))
		}

		// wait for ticker
		<-ticker.C
	}
}

func LoggingForPublishedVariable(project string, name string, val string) func() {
	return func() {
		l := utils.GetLogger()
		l.Debug().Str("variable", name).Str("value", val).Str("project_id", project).Msg("Published variable")
	}
}
