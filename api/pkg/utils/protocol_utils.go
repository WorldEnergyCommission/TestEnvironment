package utils

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"path"
	"reflect"
	"regexp"
	"strconv"
	"strings"
	"time"

	eventhub "github.com/Azure/azure-event-hubs-go/v3"
	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/gomodule/redigo/redis"
	"github.com/google/uuid"
	"github.com/philippseith/signalr"
	"github.com/pkg/sftp"
	"github.com/rocketlaunchr/dataframe-go"
	"github.com/rocketlaunchr/dataframe-go/imports"
	"golang.org/x/crypto/ssh"
)

const (
	DefaultMaxOpenConnsLight  = 2
	DefaultMaxOpenConnsMedium = 16
	DefaultMaxOpenConnsHeavy  = 32
	DefaultMaxOpenConnsUltra  = 48
	DefaultMaxIdleConns       = 2
	DefaultConnMaxLifetime    = 1 * time.Minute
	DefaultConnMaxIdleTime    = 30 * time.Second
)

// GetAuthorizationHeader returns a new authorization header containing a token
func GetAuthorizationHeader(token string) http.Header {
	return http.Header{
		"Authorization": {token},
	}
}

// GetCloudAuthorizationHeader returns a new authorization header containing a client id and a subscription key
func GetCloudAuthorizationHeader(clientId string, subscriptionKey string) http.Header {
	return http.Header{
		"x-ms-client-principal-id":  {clientId},
		"Ocp-Apim-Subscription-Key": {subscriptionKey},
	}
}

// GetContentTypeApplicationJsonHeader returns a the header used to send JSON data
func GetContentTypeApplicationJsonHeader() http.Header {
	return http.Header{
		"Content-Type": {"application/json"},
	}
}

// MakeHttpRequest sends an http request and returns the body as a string
func MakeHttpRequest[T any](method string, url string, body any, header http.Header, disableCache bool) (T, error) {
	return MakeHttpRequestWithTimeout[T](method, url, body, header, disableCache, time.Duration(0))
}

func MakeHttpRequestWithTimeout[T any](method string, url string, body any, header http.Header, disableCache bool, timeout time.Duration) (T, error) {
	return MakeHttpRequestWithTimeoutAndClient[T](method, url, body, header, disableCache, timeout, &http.Client{})	
}

func MakeHttpRequestWithTimeoutAndClient[T any](method string, url string, body any, header http.Header, disableCache bool, timeout time.Duration, c *http.Client) (T, error) {
	var bodyBytes []byte
	var err error
	if body != nil {
		bodyBytes, err = json.Marshal(body)
		if err != nil {
			return GetZeroValue[T](), err
		}
	} else {
		bodyBytes = []byte{}
	}
	buffer := bytes.NewBuffer(bodyBytes)
	request, err := http.NewRequest(method, url, buffer)
	if err != nil {
		return GetZeroValue[T](), err
	}
	if header != nil {
		for key, values := range header {
			for _, value := range values {
				request.Header.Add(key, value)
			}
		}
	}
	if buffer.Len() > 0 {
		request.Header.Add("Content-Type", "application/json")
	}
	if disableCache {
		request.Header.Add("Cache-Control", "no-cache")
	}
	c.Timeout = timeout
	response, err := c.Do(request)
	if err != nil {
		return GetZeroValue[T](), err
	}
	defer func(body io.ReadCloser) {
		err := body.Close()
		if err != nil {
			LogError(err, "")
		}
	}(response.Body)
	var object T
	if reflect.TypeOf(object).Kind() == reflect.String {
		if bodyBytes, err = io.ReadAll(response.Body); err != nil {
			return GetZeroValue[T](), err
		}
		object = any(string(bodyBytes)).(T)
	} else {
		err = json.NewDecoder(response.Body).Decode(&object)
		if err != nil {
			return GetZeroValue[T](), err
		}
	}
	if response.StatusCode >= 400 {
		return object, errors.New(fmt.Sprintf("response of \"%s\" and method \"%s\" has an error status code of %v", url, method, response.StatusCode))
	}
	return object, nil
}

// OpenPostgresDatabase connects to a postgres database and returns the connection as a pointer
func OpenPostgresDatabase(dbAddr string, dbPort string, dbName string, dbUser string, dbPass string, dbMode string, maxOpenConns int, maxIdleConns int, connMaxLifetime time.Duration, connMaxIdleTime time.Duration) (*sql.DB, error) {
	// build the database connection string
	connectionString := fmt.Sprintf("host=%s port=%s dbname=%s user=%s password=%s sslmode=%s",
		dbAddr, dbPort, dbName, dbUser, dbPass, dbMode)
	// open the connection using the postgres database driver
	db, err := sql.Open("postgres", connectionString)
	if err == nil {
		db.SetMaxOpenConns(maxOpenConns)
		db.SetMaxIdleConns(maxIdleConns)
		db.SetConnMaxLifetime(connMaxLifetime)
		db.SetConnMaxIdleTime(connMaxIdleTime)
	}
	return db, err
}

// ClosePostgresDatabase closes the database connection
func ClosePostgresDatabase(postgresDatabase *sql.DB) error {
	return postgresDatabase.Close()
}

// return stats about the redis pool formatted for prometheus
func GetPostgresStatsFormatted(postgresDatabase *sql.DB, prefix string) string {
	stats := postgresDatabase.Stats()
	resp := "# HELP " + prefix + "_pg_open_connections Active postgres connections\n"
	resp += "# TYPE " + prefix + "_pg_open_connections gauge\n"
	resp += prefix + "_pg_open_connections " + strconv.Itoa(stats.OpenConnections) + "\n"
	resp += "# HELP " + prefix + "_pg_waiting_connections Waiting postgres connections\n"
	resp += "# TYPE " + prefix + "_pg_waiting_connections counter\n"
	resp += prefix + "_pg_wating_connections " + strconv.Itoa(int(stats.WaitCount)) + "\n"
	resp += "# HELP " + prefix + "_pg_waiting_duration Waiting duration for postgres connection in seconds\n"
	resp += "# TYPE " + prefix + "_pg_waiting_duration counter\n"
	resp += prefix + "_pg_waiting_duration " + strconv.Itoa(int(stats.WaitDuration.Seconds())) + "\n"
	resp += "# HELP " + prefix + "_pg_in_use_connections In use postgres connections\n"
	resp += "# TYPE " + prefix + "_pg_in_use_connections gauge\n"
	resp += prefix + "_pg_in_use_connections " + strconv.Itoa(int(stats.InUse)) + "\n"
	resp += "# HELP " + prefix + "_pg_idle_connections Idle postgres connections\n"
	resp += "# TYPE " + prefix + "_pg_idle_connections gauge\n"
	resp += prefix + "_pg_idle_connections " + strconv.Itoa(int(stats.Idle)) + "\n"

	return resp
}

// OpenRedisPool returns the pointer to a redis pool
func OpenRedisPool(redisAddr string) *redis.Pool {
	return &redis.Pool{
		Dial: func() (redis.Conn, error) {
			return redis.Dial("tcp", strings.ReplaceAll(redisAddr, "redis://", ""))
		},
		TestOnBorrow: func(c redis.Conn, t time.Time) error {
			_, err := c.Do("PING")
			return err
		},
		MaxIdle:         2,
		MaxActive:       1000,
		IdleTimeout:     30 * time.Second,
		Wait:            true,
		MaxConnLifetime: 1 * time.Minute,
	}
}

// CloseRedisPool closes the underlying redis pool
func CloseRedisPool(redisPool *redis.Pool) error {
	return redisPool.Close()
}

// return stats about the redis pool formatted for prometheus
func GetRedisPoolStatsFormatted(redisPool *redis.Pool, prefix string) string {
	stats := redisPool.Stats()
	resp := "# HELP " + prefix + "_redis_active Active redis connections\n"
	resp += "# TYPE " + prefix + "_redis_active gauge\n"
	resp += prefix + "_redis_active " + strconv.Itoa(stats.ActiveCount) + "\n"
	resp += "# HELP " + prefix + "_redis_idle Idle redis connections\n"
	resp += "# TYPE " + prefix + "_redis_idle gauge\n"
	resp += prefix + "_redis_idle " + strconv.Itoa(stats.IdleCount) + "\n"
	resp += "# HELP " + prefix + "_redis_wait Wait redis connections\n"
	resp += "# TYPE " + prefix + "_redis_wait gauge\n"
	resp += prefix + "_redis_wait " + strconv.Itoa(int(stats.WaitCount)) + "\n"
	return resp
}

// StartReceivingAzureEventHubEvents registers an event handler to an azure event hub
func StartReceivingAzureEventHubEvents(connectionString string, handler eventhub.Handler) (*eventhub.Hub, []*eventhub.ListenerHandle, error) {
	// connect to an azure event hub
	l := GetLogger()
	l.Debug().Msg(fmt.Sprintf("trying to connect to the azure event hub (%s)\n", connectionString))

	hub, err := eventhub.NewHubFromConnectionString(connectionString)
	if err != nil {
		return nil, nil, err
	}

	l.Debug().Msg(fmt.Sprintf("successfully connected to the azure event hub (%s)\n", connectionString))

	// define a context for the subsequent slow operations
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	// get all partitions of the event hub
	l.Debug().Msg(fmt.Sprintf("trying to get the runtime information of the connected azure event hub (%s)\n", connectionString))
	runtimeInfo, err := hub.GetRuntimeInformation(ctx)
	if err != nil {
		return nil, nil, err
	}
	l.Debug().Msg(fmt.Sprintf("successfully got the runtime information of the connected azure event hub (%s)\n", connectionString))

	// listen to all partitions of the event hub
	var listenerHandles []*eventhub.ListenerHandle
	for _, partitionID := range runtimeInfo.PartitionIDs {
		l.Debug().Msg(fmt.Sprintf("trying to register an event handler for events of the connected azure event hub (%s) and partition %s\n", connectionString, partitionID))
		listenerHandle, err := hub.Receive(ctx, partitionID, handler, eventhub.ReceiveWithLatestOffset())
		if err != nil {
			return nil, nil, err
		}
		l.Debug().Msg(fmt.Sprintf("successfully registered an event handler for events of the connected azure event hub (%s) and partition %s\n", connectionString, partitionID))
		listenerHandles = append(listenerHandles, listenerHandle)
	}

	// no error occurred return hub and listener handles
	return hub, listenerHandles, nil
}

// StopReceivingAzureEventHubEvents frees the resources that were returned by StartReceivingAzureEventHubEvents
func StopReceivingAzureEventHubEvents(hub *eventhub.Hub, listenerHandles []*eventhub.ListenerHandle) error {
	// close the individual listener handles
	for _, listenerHandle := range listenerHandles {
		err := listenerHandle.Close(context.Background())
		if err != nil {
			return err
		}
	}

	// close the event hub
	err := hub.Close(context.Background())
	if err != nil {
		return err
	}

	// no error has occurred, operation was successful
	return nil
}

// GetDeviceToCloudMqttTopic get mqtt topic for device to cloud communication
func GetDeviceToCloudMqttTopic(projectId string) string {
	return fmt.Sprintf("projects/%s/messages", projectId)
}

// GetCloudToDeviceMqttTopic get mqtt topic for cloud to device communication
func GetCloudToDeviceMqttTopic(projectId string) string {
	return fmt.Sprintf("projects/%s/messages2", projectId)
}

// GetCloudToDeviceMqttTopic get mqtt topic for cloud to device communication
func GetCloudProjectIdFromTopic(topic string) (string, error) {
	// Define the regex pattern to match the UUID
	pattern := `projects/([a-f0-9\-]+)/messages2?`
	re := regexp.MustCompile(pattern)

	// Find the matching strings
	matches := re.FindStringSubmatch(topic)
	if len(matches) < 2 {
		return "", fmt.Errorf("no UUID found in the input string")
	}

	return matches[1], nil
}

// CreateMqttClient registers a message handler to a broker and a specified topic
// do not forget to close the mqtt client with mqttClient.Disconnect
func CreateMqttClient(mqttAddr string, mqttTopics []string, mqttMessageHandler mqtt.MessageHandler) (mqtt.Client, error) {
	// set the broker and the default message handler
	opts := mqtt.NewClientOptions().
		AddBroker(mqttAddr).
		SetOrderMatters(false).
		SetConnectRetry(true).
		SetKeepAlive(10 * time.Second).
		SetPingTimeout(10 * time.Second).
		SetConnectTimeout(10 * time.Second).
		SetMaxReconnectInterval(10 * time.Second).
		SetConnectRetryInterval(10 * time.Second).
		SetConnectionLostHandler(
			func(c mqtt.Client, err error) {
				LogError(err, "lost mqtt connection")
			},
		).
		SetOnConnectHandler(
			func(c mqtt.Client) {
				l := GetLogger()

				l.Info().Msg("client connected to the MQTT broker ...")
				// subscribe to the passed topic and log errors if topic is specified
				for _, mqttTopic := range mqttTopics {
					l.Info().Str("topic", mqttTopic).Msg("subscribing to topic")
					token := c.Subscribe(mqttTopic, 2, nil)
					if token.Wait() && token.Error() != nil {
						LogError(token.Error(), "")
					}
				}
			},
		)
	if mqttMessageHandler != nil {
		opts.SetDefaultPublishHandler(mqttMessageHandler)
	}

	// create the mqtt client and pass the configured options
	mqttClient := mqtt.NewClient(opts)
	token := mqttClient.Connect()
	if token.Wait() && token.Error() != nil {
		return nil, token.Error()
	}

	// return the client if no errors have occurred
	return mqttClient, nil
}

func SendMqttMessage(mqttClient mqtt.Client, mqttTopic string, mqttMessage string) error {
	token := mqttClient.Publish(mqttTopic, 2, false, mqttMessage)
	if token.Wait() && token.Error() != nil {
		return token.Error()
	}
	return nil
}

// DestroyMqttClient disconnects the client from the broker
func DestroyMqttClient(mqttClient mqtt.Client) error {
	// disconnect the mqtt client from the broker
	mqttClient.Disconnect(0)
	return nil
}

// StartReceivingSftpCsvFileEvents this function is used to start processing of uploaded csv files
func StartReceivingSftpCsvFileEvents(sftpHost string, sftpPort uint16, sftpUser string, sftpPass string, sftpDir string, separator rune, dataframeTypes map[string]any, dataframeProcessor func(*dataframe.DataFrame) error, interval time.Duration) (*bool, error) {
	// save the used authentication methods
	var auths []ssh.AuthMethod

	// register the password as authentication method if present
	if sftpUser != "" && sftpPass != "" {
		auths = append(auths, ssh.Password(sftpPass))
	}

	// initialize the ssh client config
	clientConfig := ssh.ClientConfig{
		User:            sftpUser,
		Auth:            auths,
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
	}

	// create a running variable
	running := true

	// start file check loop in a goroutine
	go func() {
		for running {
			// connect to the sftp server
			sshClient, err := ssh.Dial("tcp", fmt.Sprintf("%s:%d", sftpHost, sftpPort), &clientConfig)
			if err != nil {
				LogError(err, "")
				continue
			}

			// create the sftp client
			sftpClient, err := sftp.NewClient(sshClient)
			if err != nil {
				LogError(err, "")
				continue
			}

			// get all unprocessed csv files
			uploadedFiles, err := sftpClient.Glob(path.Join(sftpDir, "*.csv"))
			if err != nil {
				LogError(err, "")
				continue
			}

			// load each file into a dataframe and process it
			for _, uploadedFile := range uploadedFiles {
				csvFile, err := sftpClient.Open(uploadedFile)
				if err != nil {
					LogError(err, "")
					continue
				}
				frame, err := imports.LoadFromCSV(context.Background(), csvFile, imports.CSVLoadOptions{Comma: separator, DictateDataType: dataframeTypes})
				if err != nil {
					LogError(err, "")
					continue
				}
				err = csvFile.Close()
				if err != nil {
					LogError(err, "")
					continue
				}
				err = dataframeProcessor(frame)
				if err != nil {
					LogError(err, "")
					continue
				}
				newUuid, err := uuid.NewUUID()
				err = sftpClient.Rename(uploadedFile, fmt.Sprintf("%v.%v.processed", uploadedFile, newUuid.String()))
				if err != nil {
					LogError(err, "")
					continue
				}

				l := GetLogger()
				l.Info().Str("uploadedFile", uploadedFile).Msg("successfully processed the csv file ")
			}

			// close opened resources
			err = sshClient.Close()
			if err != nil {
				LogError(err, "")
			}
			err = sftpClient.Close()
			if err != nil {
				LogError(err, "")
			}

			// wait for the specified interval
			time.Sleep(interval)
		}
	}()

	// no errors have happened until now
	return &running, nil
}

// StopReceivingSftpCsvFileEvents this function is used to stop processing of uploaded csv files
func StopReceivingSftpCsvFileEvents(running *bool) error {
	*running = false
	return nil
}

// StartReceivingSignalrEvents this function is used to start receiving signalr method invocations
func StartReceivingSignalrEvents(connectionFunction func() (signalr.Connection, error), receiver any) (*signalr.Client, error) {
	// create the client and set a receiver for callbacks from the server
	client, err := signalr.NewClient(context.Background(),
		signalr.WithConnector(connectionFunction),
		signalr.TransferFormat("Text"),
		signalr.WithReceiver(receiver))
	if err != nil {
		return nil, err
	}
	// start the client loop
	client.Start()
	// return the client
	return &client, nil
}

// StopReceivingSignalrEvents this function is used to stop receiving signalr method invocations
func StopReceivingSignalrEvents(_ *signalr.Client) error {
	// call eventual cleanup code
	return nil
}
