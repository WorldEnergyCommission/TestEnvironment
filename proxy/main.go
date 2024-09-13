package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"sync"
	"time"

	"golang.org/x/exp/slices"

	"github.com/efficientIO/efficientIO/api/pkg/resource/measurement"
	"github.com/efficientIO/efficientIO/api/pkg/utils"

	"github.com/efficientIO/efficientIO/proxy/pkg/mqtt"
	"github.com/efficientIO/efficientIO/proxy/pkg/session"
	"github.com/efficientIO/efficientIO/proxy/pkg/websocket"
	"github.com/gomodule/redigo/redis"
)

var (
	// redis environment variables and the redis pool
	envRedisAddr = os.Getenv("REDIS_ADDR")
	redisPool    *redis.Pool

	// service environment variables
	envWebsocketAddr = os.Getenv("SERVICE_WEBSOCKETS")
	envMqttAddr      = os.Getenv("SERVICE_MQTT")

	// cluster name environment variable
	envClusterName = os.Getenv("CLUSTER_NAME")

	// message publish limit
	envMaxMessages = os.Getenv("MAX_MESSAGES")
	maxMessages    int

	// message publish limit
	envMeasurementsPerMessage = os.Getenv("MEASUREMENTS_PER_MESSAGE")
	measurementsPerMessage    int

	// MQTT session handler
	_ session.Handler = (*Handler)(nil)

	// timeout data structures
	timeouts      map[string]int
	timeoutsMutex *sync.RWMutex

	// prometheus metrics
	metricTotalConnections, metricTotalConnectionsAuthorized, metricTotalConnectionsUnauthorized, metricTotalPublish,
	metricCountSubscriptions, metricTotalDisconnects int
)

// Handler that proxies connections
type Handler struct {
	pool *redis.Pool
}

func main() {
	// Setup logging
	l := utils.GetLogger()

	// create a redis connection pool
	redisPool = utils.OpenRedisPool(envRedisAddr)
	defer func(redisPool *redis.Pool) {
		err := utils.CloseRedisPool(redisPool)
		if err != nil {
			utils.LogError(err, "")
		}
	}(redisPool)

	// parse the max messages environment variable
	var err error
	maxMessages, err = strconv.Atoi(envMaxMessages)
	if err != nil {
		l.Fatal().Err(err).Msg("Could not cast max messages env variable")
	}

	// parse the max measurements per message environment variable
	measurementsPerMessage, err = strconv.Atoi(envMeasurementsPerMessage)
	if err != nil {
		l.Fatal().Err(err).Msg("Could not cast max measurements per message env variable")
	}

	// create datastructures to track measurement publishing per minute
	timeoutsMutex = &sync.RWMutex{}
	timeouts = map[string]int{}
	go func() {
		for {
			// reset map after one minute
			time.Sleep(1 * time.Minute)
			timeoutsMutex.Lock()
			timeouts = map[string]int{}
			timeoutsMutex.Unlock()
		}
	}()

	// create the handler
	h := Handler{
		pool: redisPool,
	}

	// start the metrics server
	go func() {
		if err := http.ListenAndServe(":8000", http.HandlerFunc(handleMetrics)); err != nil {
			l.Fatal().Err(err).Msg("HTTP Metrics Server failed")
		}
	}()

	l.Info().Msg("Starting MQTT Proxy ...")

	// start websocket handler
	go h.handleWebsocket(envWebsocketAddr) // run in own goroutine, because functions are blocking

	// start MQTT handler
	h.handleMqtt(envMqttAddr)
}

// handleMetrics endpoint for prometheus stats
func handleMetrics(w http.ResponseWriter, _ *http.Request) {
	resp := "# HELP proxy_connections_total Total connections to proxy\n"
	resp += "# TYPE proxy_connections_total counter\n"
	resp += "proxy_connections_total " + strconv.Itoa(metricTotalConnections) + "\n"
	resp += "proxy_connections_total{status=\"authorized\"} " + strconv.Itoa(metricTotalConnectionsAuthorized) + "\n"
	resp += "proxy_connections_total{status=\"unauthorized\"} " + strconv.Itoa(metricTotalConnectionsUnauthorized) + "\n"
	resp += "# HELP proxy_publish_total Total messages published through proxy\n"
	resp += "# TYPE proxy_publish_total counter\n"
	resp += "proxy_publish_total " + strconv.Itoa(metricTotalPublish) + "\n"
	resp += "# HELP proxy_disconnects_total Total disconnects from proxy\n"
	resp += "# TYPE proxy_disconnects_total counter\n"
	resp += "proxy_disconnects_total " + strconv.Itoa(metricTotalDisconnects) + "\n"
	resp += "# HELP proxy_subscriptions Active client subscriptions going through proxy \n"
	resp += "# TYPE proxy_subscriptions gauge\n"
	resp += "proxy_subscriptions " + strconv.Itoa(metricCountSubscriptions) + "\n"
	resp += utils.GetRedisPoolStatsFormatted(redisPool, "proxy")

	_, err := w.Write([]byte(resp))
	if err != nil {
		utils.LogError(err, "")
	}
}

// Connect updates prometheus stats
func (h *Handler) Connect(_ *session.Client) {
	metricTotalConnections++
}

// Publish updates prometheus stats
func (h *Handler) Publish(_ *session.Client, _ *string, _ *[]byte) {
	metricTotalPublish++
}

// Subscribe updates prometheus stats
func (h *Handler) Subscribe(_ *session.Client, topics *[]string) {
	metricCountSubscriptions += len(*topics)
}

// Unsubscribe updates prometheus stats
func (h *Handler) Unsubscribe(_ *session.Client, topics *[]string) {
	metricCountSubscriptions -= len(*topics)
}

// Disconnect updates prometheus stats
func (h *Handler) Disconnect(_ *session.Client) {
	metricTotalDisconnects++
}

// handleWebsocket blocking start of the handler
func (h *Handler) handleWebsocket(addr string) {
	proxy := websocket.New(addr, "/", "ws", h)
	if err := http.ListenAndServe(":9001", proxy.Handler()); err != nil {
		l := utils.GetLogger()
		l.Fatal().Err(err).Msg("Websocket Server failed")
	}
}

// handleMqtt blocking start of the handler
func (h *Handler) handleMqtt(addr string) {
	proxy := mqtt.New(":1883", addr, h)
	if err := proxy.Proxy(); err != nil {
		l := utils.GetLogger()
		l.Fatal().Err(err).Msg("MQTT Proxy failed")
	}
}

// AuthConnect calls the authorize function
func (h *Handler) AuthConnect(c *session.Client) error {
	return h.authorize(c.Username, string(c.Password))
}

// authorize authenticates the clients
func (h *Handler) authorize(username, password string) error {
	// check if the username and password length matches the expectation
	if len(username) != 36 || len(password) != 36 {
		metricTotalConnectionsUnauthorized++
		return errors.New("invalid username or password length")
	}

	// get a redis connection
	conn := h.pool.Get()
	defer func(conn redis.Conn) {
		err := conn.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(conn)

	// retrieves the expected password from redis and throws an error if retrieval fails
	key := fmt.Sprintf("lynus:projects:%s", username)
	// TODO: fallback to DB if not found, and write to redis
	expectedPassword, err := redis.String(conn.Do("HGET", key, "secret"))
	if err != nil {
		metricTotalConnectionsUnauthorized++
		utils.LogError(err, "")
		return utils.NotFoundError{}
	}

	// check if passwords match ...
	if expectedPassword != password {
		// ... if not throw an error
		metricTotalConnectionsUnauthorized++
		return errors.New("invalid password for user" + username)
	}

	// adjust prometheus metrics
	metricTotalConnectionsAuthorized++

	// return no error to signal successful authorization
	return nil
}

// AuthPublish checks if the user is allowed to publish to the requested topic
func (h *Handler) AuthPublish(c *session.Client, topic *string, payload *[]byte) error {
	// check the publish topic
	if !isPublishValid(*topic, c.Username) {
		if utils.IsShellyTopic(*topic) && envClusterName == "dev" {
			// allow publishing to shelly topics on the development cluster
			return nil
		} else {
			// disallow publishing to all other topics
			return errors.New(fmt.Sprintf("invalid publish topic: %s", *topic))
		}
	}

	// check the max publish messages limit for the incoming MQTT message
	timeoutsMutex.RLock()
	currentMessages := timeouts[c.Username]
	timeoutsMutex.RUnlock()
	if currentMessages >= maxMessages {
		return fmt.Errorf("project %s has reached message limit of %d",
			c.Username, maxMessages)
	}

	// parse the given measurements
	measurements := make([]measurement.Measurement, 0)
	if err := json.Unmarshal(*payload, &measurements); err != nil {
		return err
	}

	// at least one measurement must be present
	if len(measurements) == 0 {
		return errors.New("an empty measurement list was provided")
	}

	// limit the amount of measurements per MQTT message
	if len(measurements) > measurementsPerMessage {
		return errors.New(fmt.Sprintf("there cannot be more than %v values", measurementsPerMessage))
	}

	// validate the name for each provided variable
	for _, m := range measurements {
		if err := utils.ValidateVariableName(m.Name); err != nil {
			return err
		}
	}

	// increase the internal publish message counter for each valid MQTT message
	timeoutsMutex.Lock()
	timeouts[c.Username]++
	timeoutsMutex.Unlock()

	// if all checks have passed, publishing is allowed
	return nil
}

// AuthSubscribe checks if the user is allowed to subscribe to the requested topics
func (h *Handler) AuthSubscribe(c *session.Client, topics *[]string) error {
	// check every subscribed topic
	for _, topic := range *topics {
		if !isSubscribeValid(topic, c.Username) {
			if utils.IsShellyTopic(topic) && envClusterName == "dev" {
				// allow subscribing to shelly topics on the development cluster
				return nil
			} else {
				// disallow subscribing to all other topics
				return errors.New(fmt.Sprintf("invalid subscribe topic: %s", topic))
			}
		}
	}

	// if all topics are fine, subscription is allowed
	return nil
}

// isSubscribeValid currently subscribing is allowed on both MQTT topics
func isSubscribeValid(topic, username string) bool {
	return slices.Contains([]string{
		utils.GetDeviceToCloudMqttTopic(username),
		utils.GetCloudToDeviceMqttTopic(username),
	}, topic)
}

// isPublishValid currently publishing via the proxy is only allowed from devices to the cloud
func isPublishValid(topic, username string) bool {
	return slices.Contains([]string{
		utils.GetDeviceToCloudMqttTopic(username),
	}, topic)
}
