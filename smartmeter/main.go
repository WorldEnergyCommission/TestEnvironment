package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"strconv"
	"sync/atomic"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/gomodule/redigo/redis"
	_ "github.com/lib/pq"
	"github.com/samber/lo"

	"github.com/efficientIO/efficientIO/api/pkg/resource/measurement"
	"github.com/efficientIO/efficientIO/api/pkg/utils"
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
	mqttTopic   = "shellies/#"
	mqttClient  mqtt.Client

	// variables for the prometheus server
	measurementsCreated int64

	// repos that will be used by this component
	measurementRepo measurement.Repository
)

// ShellyProperty a single shelly property
type ShellyProperty struct {
	Name      string
	Value     float64
	Unit      string
	Timestamp time.Time
}

// ShellyPayload is used by generation 2 devices
type ShellyPayload struct {
	Phase               int     `json:"channelId"`
	PowerFactor         float64 `json:"powerFactor"`
	ActivePower         float64 `json:"activePower"`
	ReactivePower       float64 `json:"reactivePower"`
	ApparentPower       float64 `json:"apparentPower"`
	Voltage             float64 `json:"voltage"`
	Current             float64 `json:"current"`
	Frequency           float64 `json:"frequency"`
	ActiveEnergyCounter float64 `json:"activeEnergyCounter"`
	Timestamp           float64 `json:"timestamp"`
}

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

	l.Info().Msg("Starting Smartmeter service ...")

	// start the web server with the metrics endpoint
	if err := http.ListenAndServe(":8000", http.HandlerFunc(handleMetrics)); err != nil {
		l.Fatal().Err(err).Msg("HTTP Metrics Server failed")
	}
}

// handleMetrics endpoint for the prometheus metrics
func handleMetrics(w http.ResponseWriter, _ *http.Request) {
	resp := utils.CreateVariableAndMeasurementMetrics("smartmeter", measurementsCreated, 0)
	resp += utils.GetRedisPoolStatsFormatted(redisPool, "smartmeter")
	resp += utils.GetPostgresStatsFormatted(postgresDatabase, "smartmeter")
	_, _ = w.Write([]byte(resp))
}

func createShellyMeasurementsFromMessage(message mqtt.Message) ([]measurement.ShellyMeasurement, error) {
	// check if the message is a valid shelly message
	shellyInfo, err := utils.GetShellyInfoFromTopic(message.Topic())
	if err != nil {
		return nil, err
	}

	// extract the passed properties
	var properties []ShellyProperty
	if shellyInfo.Generation == 1 && shellyInfo.Attribute != "" {
		value, err := strconv.ParseFloat(string(message.Payload()), 64)
		if err != nil {
			return nil, err
		}
		var name string
		var unit string
		var correctedValue float64
		if shellyInfo.Attribute == "power" {
			name = "activePower"
			unit = "kW"
			correctedValue = value / 1000
		} else if shellyInfo.Attribute == "energy" {
			name = "activeEnergyCounter"
			unit = "kWh"
			correctedValue = value / 1000 / 60
		} else {
			return nil, errors.New("unsupported attribute")
		}
		properties = []ShellyProperty{{
			Name:      name,
			Value:     correctedValue,
			Unit:      unit,
			Timestamp: time.Now(),
		}}
	} else if shellyInfo.Generation == 2 {
		var shellyPayload ShellyPayload
		if err := json.Unmarshal(message.Payload(), &shellyPayload); err != nil {
			return nil, err
		}
		shellyTimestamp := utils.GetTimeFromFloatUnixTimestamp(shellyPayload.Timestamp)
		properties = []ShellyProperty{{
			Name:      "powerFactor",
			Value:     shellyPayload.PowerFactor,
			Timestamp: shellyTimestamp,
			Unit:      "W/VA",
		}, {
			Name:      "activePower",
			Value:     shellyPayload.ActivePower / 1000,
			Timestamp: shellyTimestamp,
			Unit:      "kW",
		}, {
			Name:      "reactivePower",
			Value:     shellyPayload.ReactivePower / 1000,
			Timestamp: shellyTimestamp,
			Unit:      "kVAR",
		}, {
			Name:      "apparentPower",
			Value:     shellyPayload.ApparentPower / 1000,
			Timestamp: shellyTimestamp,
			Unit:      "kVA",
		}, {
			Name:      "voltage",
			Value:     shellyPayload.Voltage,
			Timestamp: shellyTimestamp,
			Unit:      "V",
		}, {
			Name:      "current",
			Value:     shellyPayload.Current,
			Timestamp: shellyTimestamp,
			Unit:      "A",
		}, {
			Name:      "frequency",
			Value:     shellyPayload.Frequency,
			Timestamp: shellyTimestamp,
			Unit:      "Hz",
		}, {
			Name:      "activeEnergyCounter",
			Value:     shellyPayload.ActiveEnergyCounter / 1000,
			Timestamp: shellyTimestamp,
			Unit:      "kWh",
		}}
	}

	// map the properties to shelly measurements
	shellyMeasurements := lo.Map(properties, func(elem ShellyProperty, _ int) measurement.ShellyMeasurement {
		return measurement.ShellyMeasurement{Id: shellyInfo.Id, Name: shellyInfo.Name, Generation: shellyInfo.Generation,
			User: shellyInfo.User, Category: shellyInfo.Category, Manufacturer: shellyInfo.Manufacturer, Model: shellyInfo.Model,
			Phase: shellyInfo.Phase, Property: elem.Name, Value: elem.Value, Unit: elem.Unit, Timestamp: elem.Timestamp}
	})
	// return the mapped measurements
	return shellyMeasurements, nil

}

// mqttMessageHandler is called on incoming mqtt messages
func mqttMessageHandler(_ mqtt.Client, message mqtt.Message) {
	// create shelly measurements from the message
	shellyMeasurements, err := createShellyMeasurementsFromMessage(message)
	if err != nil {
		utils.LogError(err, "")
		return
	}

	// insert shelly measurements into the database
	err = measurementRepo.CreateShellyMeasurements(shellyMeasurements)
	if err != nil {
		utils.LogError(err, "")
		return
	}

	// update the recorder metrics using atomic operations
	atomic.AddInt64(&measurementsCreated, int64(len(shellyMeasurements)))
}
