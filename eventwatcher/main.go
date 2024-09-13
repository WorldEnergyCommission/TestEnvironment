package main

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	eventhub "github.com/Azure/azure-event-hubs-go/v3"
	"github.com/philippseith/signalr"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/efficientIO/efficientIO/api/pkg/resource/measurement"
	"github.com/efficientIO/efficientIO/api/pkg/resource/project"

	"github.com/efficientIO/efficientIO/api/pkg/utils"

	"github.com/efficientIO/efficientIO/recorder/pkg/easee"
	"github.com/efficientIO/efficientIO/recorder/pkg/oeamtc"
	"github.com/efficientIO/efficientIO/recorder/pkg/oqdo"

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

	envOeamtcEventHubConnectionString = os.Getenv("OEAMTC_EVENT_HUB_CONNECTION_STRING")
	envOqdoSignalrConnectionString    = os.Getenv("OQDO_SIGNALR_CONNECTION_STRING")
	envEaseeAmqpConnectionString    = os.Getenv("EASEE_AMQP_CONNECTION_STRING")

	variablesCreated    int64
	measurementsCreated int64

	measurementRepo measurement.Repository
	projectRepo     project.Repository

	exportMappings     map[string]map[string]map[string][]string
	exportMappingsLock = sync.RWMutex{}
)

func main() {
	// Setup logging
	l := utils.GetLogger()

	var err error

	// create a postgres database connection
	postgresDatabase, err = utils.OpenPostgresDatabase(envDbAddr, envDbPort, envDbName, envDbUser, envDbPass, envDbMode, utils.DefaultMaxOpenConnsMedium, utils.DefaultMaxIdleConns, utils.DefaultConnMaxLifetime, utils.DefaultConnMaxIdleTime)
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

	l.Info().Msg("Starting Eventwatcher ...")

	// connect to the oeamtc azure event hub if the environment variable contains information
	if strings.TrimSpace(envOeamtcEventHubConnectionString) != "" {
		oeamtc.InitializeEventHandler(&variablesCreated, &measurementsCreated, measurementRepo, projectRepo)
		oeamtcHub, oeamtcListenerHandles, err := utils.StartReceivingAzureEventHubEvents(envOeamtcEventHubConnectionString, oeamtc.EventHandler)
		if err != nil {
			l.Fatal().Err(err).Msg("Could not Start Receiving Azure Event Hub Events")
			return
		}
		defer func(hub *eventhub.Hub, listenerHandles []*eventhub.ListenerHandle) {
			err := utils.StopReceivingAzureEventHubEvents(hub, listenerHandles)
			if err != nil {
				utils.LogError(err, "Something went wrong stopping Receiving Azure Event Hub Events")
			}
		}(oeamtcHub, oeamtcListenerHandles)
	}

	// connect to the oqdo signalr server if the environment variable contains information
	if strings.TrimSpace(envOqdoSignalrConnectionString) != "" {
		oqdo.InitializeEventHandler(&variablesCreated, &measurementsCreated, measurementRepo, projectRepo)
		err := oqdo.InitializeBaseUrlClientIdAndSubscriptionKey(envOqdoSignalrConnectionString)
		if err != nil {
			l.Fatal().Err(err).Msg("Failed to initialize Oqdo Handler")
			return
		}
		client, err := utils.StartReceivingSignalrEvents(
			oqdo.ConnectToSignalr,
			&oqdo.Receiver{})
		if err != nil {
			l.Fatal().Err(err).Msg("Failed Starting to Receiv SignalR Events")
			return
		}
		defer func(client *signalr.Client) {
			err := utils.StopReceivingSignalrEvents(client)
			if err != nil {
				utils.LogError(err, "Something went wrong stopping Receiving Signalr Events")
			}
		}(client)
	}
	
	// connect to the easee amqp service if the environment variable contains information
	if strings.TrimSpace(envEaseeAmqpConnectionString) != "" {

		var err error

		err = easee.InitializeEventHandler(projectRepo)
		if err != nil {
			l.Fatal().Err(err).Msg("Failed obtaining Easee mappings")
			return
		}

		err = easee.InitializeApi(envEaseeAmqpConnectionString)
		if err != nil {
			l.Fatal().Err(err).Msg("Failed to create Easee API Client")
		}
	
		l.Debug().Msg("Access Token retrieved successfully")

		conn, ch := easee.ConnectAMQP(&mqttClient)
		defer func() {
			err = easee.CloseAmqpConnectionChannel(conn, ch)
			if err != nil {
				utils.LogError(err, "Something went wrong stopping EaseeAMQP Events")
			}
		}()

		err = easee.UpdateMeasurementsHTTPOnce(&mqttClient)
		if err != nil {
			l.Debug().Err(err).Msg("Failed to obtain measurements via HTTP")
		}
		
		go easee.UpdateMeasurementsHTTP(time.Minute * 15, &mqttClient)
	}

	// get the export mappings for all variables
	exportMappings, err = projectRepo.GetExportMappings()
	if err != nil {
		l.Fatal().Err(err).Msg("Failed Getting Export Mappings")
		return
	}

	// update the export mappings in the background
	go updateExportMappings()


	// start the web server with the metrics endpoint
	if err := http.ListenAndServe(":8000", http.HandlerFunc(handleMetrics)); err != nil {
		l.Fatal().Err(err).Msg("HTTP Metrics Server failed")
	}
}

func updateExportMappings() {
	l := utils.GetLogger()

	minuteTicker := time.NewTicker(time.Minute * 15)
	defer minuteTicker.Stop()
	for {
		// update the export mappings
		l.Print("Should open DB")
		exportMappingsResult, err := projectRepo.GetExportMappings()
		if err != nil {
			l.Fatal().Err(err).Msg("Failed Getting Export Mappings in Ticker")
		} else {
			exportMappingsLock.Lock()
			exportMappings = exportMappingsResult
			exportMappingsLock.Unlock()
		}

		// wait for next minute
		<-minuteTicker.C
	}
}

// handleMetrics endpoint for the prometheus metrics
func handleMetrics(w http.ResponseWriter, _ *http.Request) {
	resp := utils.CreateVariableAndMeasurementMetrics("eventwatcher", measurementsCreated, variablesCreated)
	resp += utils.GetRedisPoolStatsFormatted(redisPool, "eventwatcher")
	resp += utils.GetPostgresStatsFormatted(postgresDatabase, "eventwatcher")
	_, _ = w.Write([]byte(resp))
}

// mqttMessageHandler is called on incoming mqtt messages to handle variable exports
func mqttMessageHandler(_ mqtt.Client, message mqtt.Message) {
	// retrieve the project and measurements from the mqtt message
	projectId, err := utils.GetProjectIdFromTopic(message.Topic())

	if err != nil {
		utils.LogError(err, "GetProjectIdFromTopic failed")
		return
	}
	measurements := make([]measurement.Measurement, 0)
	if err := json.Unmarshal(message.Payload(), &measurements); err != nil {
		utils.LogError(err, "Unmarshal Measurements from MQTT failed")
		return
	}
	for _, measurementValue := range measurements {
		exportMappingsLock.RLock()
		variableExportMapping, ok := exportMappings[projectId][measurementValue.Name]
		exportMappingsLock.RUnlock()
		if !ok {
			continue
		}
		for exportType, exportIds := range variableExportMapping {
			if exportType == oqdo.ImportExportType {
				for _, exportId := range exportIds {
					l := utils.GetLogger()
					l.Debug().Str("exportId", exportId).Float64("value", measurementValue.Value).Msg("Sending to oqdo")
					err := oqdo.UpdateValueByExportId(exportId, measurementValue.Value)
					if err != nil {
						utils.LogError(err, "UpdateValueByExportId")
					}
				}
			}
		}
	}
}

