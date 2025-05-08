// InitializeEventHandler sets the global variables from the main package that are accesses by the individual event handler
package easee

/*
Todos:
- use utils http functions
- use shared http client

*/

import (
	"crypto/sha256"
	"errors"
	"strconv"
	"strings"
	"sync"
	"time"

	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/url"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	amqp091 "github.com/rabbitmq/amqp091-go"

	"github.com/eneries/eneries/api/pkg/resource/easeeapi"
	"github.com/eneries/eneries/api/pkg/resource/measurement"

	"github.com/eneries/eneries/api/pkg/resource/project"
	"github.com/eneries/eneries/api/pkg/utils"
)

var (
	projectRepo project.Repository

	importMappings     map[string]project.EaseeMapping
	importMappingsLock = sync.RWMutex{}

	easeeClient     *easeeapi.EaseeAPIClient
	easeeClientLock = sync.RWMutex{}

	//observationIds = []int{109,120,121,124} // implement getObservationAsFloat for each observation
	observationIds = map[int]string{
		109: "integer",
		120: "double",
		121: "double",
		124: "double",
	}
)

type (
	EaseeChargerMessage struct {
		ChargerId     string    `json:"chargerId"`
		ObservationId int       `json:"observationId"`
		Value         float64   `json:"value"`
		ProjectId     string    `json:"projectId"`
		ArrivalTime   time.Time `json:"arrivalTime"`
	}
	EaseeBody struct {
		Timestamp string          `json:"Timestamp"`
		Value     json.RawMessage `json:"Value"`
	}
)

// InitializeEventHandler sets the global variables from the main package that are accesses by the individual event handler
// and handles the import mappings
func InitializeEventHandler(projectRepoArg project.Repository) error {
	projectRepo = projectRepoArg

	var err error
	// get the import mappings for all variables
	importMappingsLock.Lock()
	importMappings, err = projectRepo.GetEaseeImportMappings()
	importMappingsLock.Unlock()

	if err != nil {
		return err
	}

	// update the import mappings in the background
	go updateImportMappings()

	return nil
}

// updateImportMappings updates the import mappings in the background
func updateImportMappings() {
	l := utils.GetLogger()
	minuteTicker := time.NewTicker(time.Minute * 15)
	defer minuteTicker.Stop()
	for {
		// update the import mappings
		exportMappingsResult, err := projectRepo.GetEaseeImportMappings()
		if err != nil {
			utils.LogError(err, "Fatal Error updating Easee import mappings in Ticker")
		} else {
			importMappingsLock.Lock()
			importMappings = exportMappingsResult
			importMappingsLock.Unlock()
		}

		l.Debug().Msg("Updated Easee import mappings!")

		// wait for next minute
		<-minuteTicker.C
	}
}

func InitializeApi(amqpConnectionString string) error {

	var err error

	easeeClientLock.Lock()
	easeeClient, err = easeeapi.NewEaseeAPIClient(amqpConnectionString)
	easeeClientLock.Unlock()
	if err != nil {
		return err
	}

	// update the import mappings in the background
	go updateApiToken()

	return nil
}

// updateImportMappings updates the import mappings in the background
func updateApiToken() {
	l := utils.GetLogger()

	duration := getRefreshTokenDuration()
	for {
		refreshTicker := time.NewTicker(duration)

		easeeClientLock.Lock()
		err := easeeClient.RefreshToken()
		easeeClientLock.Unlock()
		if err != nil {
			err = easeeClient.GetTokens()
			if err != nil {
				l.Error().Err(err).Msg("Failed to obtain Easee API Tokens")
			} else {
				l.Debug().Msg("Updated Token!")
			}
		} else {
			l.Debug().Msg("Updated Token!")
		}

		// wait for next trigger
		<-refreshTicker.C
		refreshTicker.Stop() // Stop the current ticker

		duration = getRefreshTokenDuration()
	}
}

func getRefreshTokenDuration() time.Duration {
	duration := time.Second*time.Duration(easeeClient.Tokens.ExpiresIn) - time.Minute*10
	if duration < 1 {
		duration = time.Minute * 1
	}

	return duration
}

func ConnectAMQP(mqttClient *mqtt.Client) (conn *amqp091.Connection, ch *amqp091.Channel) {
	l := utils.GetLogger()

	credentials, err := easeeClient.GetAmqpCredentials()
	if err != nil {
		l.Fatal().Err(err).Msg("Failed to obtain Easee amqp credentials")
		return
	}
	l.Debug().Msg("AMQP credentials retrieved successfully")

	conn, ch, err = StartReceivingAmqpEvents(credentials, mqttClient)
	if err != nil {
		l.Fatal().Err(err).Msg("Failed Starting to Receiv SignalR Events")
		return
	}

	return conn, ch
}

// StartReceivingAmqpEvents function to start receiving amqp events
func StartReceivingAmqpEvents(cred *easeeapi.AmqpCredentials, mqttclient *mqtt.Client) (conn *amqp091.Connection, ch *amqp091.Channel, err error) {

	sslOption := "amqp"
	if cred.UseSsl {
		sslOption = "amqps"
	}

	connectionString := fmt.Sprintf("%s://%s:%s@%s:%s%s",
		sslOption,
		url.QueryEscape(cred.Username),
		url.QueryEscape(cred.Password),
		url.QueryEscape(cred.Server),
		strconv.Itoa(cred.Port),
		cred.VirtualHost)

	conn, err = amqp091.Dial(connectionString)
	if err != nil {
		utils.LogError(err, "Failed to connect to RabbitMQ")
	}
	//defer conn.Close() handled in main.go

	ch, err = conn.Channel()
	if err != nil {
		utils.LogError(err, "Failed to open a channel")
	}
	//defer ch.Close() //defer conn.Close() handled in main.go

	_, err = ch.QueueDeclarePassive(
		cred.QueueName, // name
		true,           // durable
		false,          // delete when unused
		false,          // exclusive
		false,          // no-wait
		nil,            // arguments
	)
	if err != nil {
		utils.LogError(err, "Failed to declare a queue")
	}

	msgs, err := ch.Consume(
		cred.QueueName, // queue
		"",             // consumer
		true,           // auto-ack
		false,          // exclusive
		false,          // no-local
		false,          // no-wait
		nil,            // args
	)
	if err != nil {
		utils.LogError(err, "Failed to register a consumer")
	}

	go func() {
		l := utils.GetLogger()
		l.Debug().Msg("Waiting for messages from Easee AMQP")
		for d := range msgs {
			valueReceived(d, mqttclient)
		}
	}()

	return conn, ch, nil
}

// ValueReceived is the method called by easee AMQP service when a message was received
func valueReceived(msg amqp091.Delivery, mqttClient *mqtt.Client) {
	l := utils.GetLogger()

	l.Debug().Msg("Received message from Easee AMQP")

	chargerMsg, err := prepareAMQPMessage(msg)
	if err != nil {
		l.Error().Err(err).Msg("Error extracting Easee AMQP message")
		return
	}

	// Debug log for checking each received message
	l.Debug().Str("charger", chargerMsg.ChargerId).Str("observation", strconv.Itoa(chargerMsg.ObservationId)).Str("val", strconv.FormatFloat(chargerMsg.Value, 'f', -1, 64)).Msg("Got Easee message")

	var exists bool
	var mapping project.EaseeMapping

	// filter non existing charger-ids
	if mapping, exists = importMappings[chargerMsg.ChargerId]; !exists {
		return
	}
	chargerMsg.ProjectId = mapping.ProjectId

	// Verify charger access using PIN
	// Commented since currently Easee does not Support PIN retrieval for integrators

	/* valid, err := CheckEaseePin(easeeClient, mapping, chargerMsg.ChargerId)
	if err != nil {
		l.Error().Err(err).Msg("Error checking Easee pin")
		return
	}

	if !valid {
		l.Warn().Msg("Easee PIN is not valid. Ignoring message.")
		return
	} */

	// filter observation-ids
	exists = false
	for id := range observationIds {
		if id == chargerMsg.ObservationId {
			exists = true
			break
		}
	}

	if !exists {
		return
	}

	chargerMsg.Value, err = extractMsgValue(msg, chargerMsg.ObservationId)
	if err != nil {
		l.Error().Err(err).Msg("Error extracting value from message")
		return
	}

	// Send value as measurement via MQTT
	EaseeChargerMessageToMeasurement(chargerMsg, mqttClient, "AMQP")
}

func extractMsgValue(msg amqp091.Delivery, observationId int) (float64, error) {
	var body EaseeBody
	var err error
	err = json.Unmarshal([]byte(msg.Body), &body)
	if err != nil {
		return 0, fmt.Errorf("error unmarshalling message body: %w", err)
	}

	var val float64
	val, err = byteToFloat64(observationId, body.Value)
	if err != nil {
		return 0, fmt.Errorf("error converting observation value to float64: %w", err)
	}

	return val, nil

}

func prepareAMQPMessage(msg amqp091.Delivery) (EaseeChargerMessage, error) {

	var ok bool
	var err error

	var chargerMsg EaseeChargerMessage = EaseeChargerMessage{}

	// unmarshal message body
	if _, ok = msg.Headers["ArrivalTime"]; !ok {
		return chargerMsg, errors.New("ArrivalTime not found in message")
	}

	layout := "2006-01-02T15:04:05.0000000Z"

	// Convert string to time.Time
	chargerMsg.ArrivalTime, err = time.Parse(layout, msg.Headers["ArrivalTime"].(string))
	if err != nil {
		err = fmt.Errorf("error converting string to time: %w", err)
		return chargerMsg, err
	}

	timeNow := time.Now()

	// Check if currentTime is at least 10 minutes after t
	if timeNow.After(chargerMsg.ArrivalTime.Add(10 * time.Minute)) {
		l := utils.GetLogger()
		l.Warn().Msg("Easee AMQP Message is older than 10 minutes.")
	}

	if msg.RoutingKey == "" {
		return chargerMsg, errors.New("RoutingKey not found in message")
	}

	// extract chargerId and observationId from routing key
	routingKey := strings.Split(msg.RoutingKey, ".")
	chargerMsg.ChargerId = routingKey[0]
	oid := routingKey[2]
	chargerMsg.ObservationId, err = strconv.Atoi(oid)
	if err != nil {
		err = fmt.Errorf("error converting observation-id to int: %w", err)
		return chargerMsg, err
	}

	return chargerMsg, nil
}

/* func CheckEaseePin(c *easeeapi.EaseeAPIClient, mapping project.EaseeMapping, chargerId string) (bool, error) {

	rawPin, err := c.GetChargerPin(chargerId)
	if err != nil {
		return false, err
	}

	hashedPin := HasWithSaltSha256(rawPin, mapping.ChargerSalt)
	if hashedPin == mapping.ChargerHash {
		return true, nil
	}
	return false, nil
} */

func HasWithSaltSha256(raw string, salt string) string {
	s := raw + salt
	h := sha256.New()
	h.Write([]byte(s))
	sha1_hash := hex.EncodeToString(h.Sum(nil))

	return sha1_hash
}

func EaseeChargerMessageToMeasurement(chargerMsg EaseeChargerMessage, mqttClient *mqtt.Client, flag string) {

	var msmt measurement.Measurement

	msmt.Name = fmt.Sprintf("easee.%s.%d", chargerMsg.ChargerId, chargerMsg.ObservationId)
	msmt.Unit = ""
	msmt.Value = chargerMsg.Value
	//msmt.Time = "" For using current timestamp

	l := utils.GetLogger()

	newMeasurement := []measurement.Measurement{msmt}

	l.Debug().Str("msg", msmt.Name).Str("type", flag).Msg("EaseeChargerMessageToMeasurement")

	if flag == "AMQP" {
		logMessage := fmt.Sprintf("project: %v measurement: %v", chargerMsg.ProjectId, newMeasurement)
		l.Debug().Str("msg", logMessage).Str("type", flag).Msg("Publishing MQTT message")
	}

	measurement.PublishVariable(mqttClient, chargerMsg.ProjectId, newMeasurement, func() {})
}

func CloseAmqpConnectionChannel(conn *amqp091.Connection, ch *amqp091.Channel) error {
	// First attempt to close the channel

	if err := ch.Close(); err != nil {
		utils.LogError(err, "Failed to close channel")
		return err
	}

	if err := conn.Close(); err != nil {
		utils.LogError(err, "Failed to close connection")

		return err
	}
	l := utils.GetLogger()
	l.Debug().Msg("Easee AMQP closed successfully")

	return nil
}

func UpdateMeasurementsHTTP(duration time.Duration, mqttClient *mqtt.Client) {
	l := utils.GetLogger()

	ticker := time.NewTicker(duration)
	defer ticker.Stop()
	for {
		err := UpdateMeasurementsHTTPOnce(mqttClient)
		if err != nil {
			l.Err(err).Msg("Failed to obtain measurements via HTTP")
		}
		<-ticker.C
	}
}

func UpdateMeasurementsHTTPOnce(mqttClient *mqtt.Client) error {

	for chargerId, mapping := range importMappings {

		observations, err := easeeClient.GetObservationValues(chargerId, convertObservationIdsAsString())
		if err != nil {
			return err
		}

		for _, observation := range observations.Observations {

			val, err := interfaceToFloat64(observation.Id, observation.Value)
			if err != nil {
				return err
			}

			chargerMsg := EaseeChargerMessage{
				ChargerId:     chargerId,
				ObservationId: observation.Id,
				Value:         val,
				ProjectId:     mapping.ProjectId,
				ArrivalTime:   time.Now(),
			}

			// Send value as measurement via MQTT
			EaseeChargerMessageToMeasurement(chargerMsg, mqttClient, "HTTP")
		}
	}
	return nil
}

func convertObservationIdsAsString() string {
	var parts []string
	for id := range observationIds {
		parts = append(parts, strconv.Itoa(id))
	}
	return strings.Join(parts, ",")
}

func byteToFloat64(observationId int, value []byte) (float64, error) {
	switch observationIds[observationId] {
	case "double":
		var num float64
		if err := json.Unmarshal(value, &num); err == nil {
			return num, nil
		}
	case "integer":
		var num int
		if err := json.Unmarshal(value, &num); err == nil {
			return float64(num), nil
		}
	default:
		return 0, fmt.Errorf("obersvation type not implemented")
	}
	return 0, fmt.Errorf("error unmarshalling observation value")
}

func interfaceToFloat64(observationId int, value interface{}) (float64, error) {
	switch observationIds[observationId] {
	case "double":
		return value.(float64), nil
	case "integer":
		return value.(float64), nil
	default:
		return 0, fmt.Errorf("unsupported observationId")
	}
}
