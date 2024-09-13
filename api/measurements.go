package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"sync"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"

	"github.com/efficientIO/efficientIO/api/pkg/resource/measurement"
	"github.com/efficientIO/efficientIO/api/pkg/utils"

	"github.com/gomodule/redigo/redis"
	"github.com/gorilla/mux"
)

// measurementsCreateHandler creates all measurements for the respective project that were passed in the body
// @Summary      Create measurements
//
//	@Description  Create measurements for a project
//	@Tags         Measurements
//	@Accept       json
//	@Param 		 data body []measurement.CreateOptions true "The measurments in SenML format to create"
//	@Produce      json
//	@Param        ignore_duplicates query bool false "Ignore duplicates option"
//	@Success      200  {object} 	map[string][]string "Updated projects"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/measurements [post]
func measurementsCreateHandler(w http.ResponseWriter, r *http.Request) {
	// get the ignore duplicates option
	avoidDuplicates := r.URL.Query().Get("ignore_duplicates") == "false"

	// parse passed body into a list of create options
	var optionsSlice []measurement.CreateOptions
	if err := json.NewDecoder(r.Body).Decode(&optionsSlice); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	// insert the passed measurements into the db
	updatedProjects, _, err := measurementRepo.CreateMeasurements(optionsSlice, projectRepo, !avoidDuplicates)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	// return the updated projects
	respond(w, http.StatusOK, updatedProjects)
}

// measurementsListHandler returns a list of all measurements
// {"one: 2, "three": 4}

// measurementsListHandler returns a list of all measurements
// @Summary      List measurements
//
//	@Description  List all measurements
//	@Tags         Measurements
//	@Accept       json
//	@Produce      json
//	@Param        project_id path string true "Project ID"
//	@Param        x-user     header string true "User ID"
//	@Success      200  {object}  map[string]float64 "List of measurements"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/measurements/ [get]
func measurementsListHandler(w http.ResponseWriter, r *http.Request) {
	opts := measurement.ListOptions{ProjectID: mux.Vars(r)["project_id"], UserID: r.Header.Get("x-user")}

	m, err := measurementRepo.List(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, m)
}

// measurementsGetHandler retrieves a measurement for a specific project and variable
// @Summary      Retrieve a measurement
//
//	@Description  Retrieve a measurement for a specific project and variable either
//	@Description  - the last measurement of a variable if no time "at" is supplied
//	@Description  - the last measurement before time "at"
//	@Tags         Measurements
//	@Accept       json
//	@Param        project_id path string true "The ID of the project"
//	@Param        measurement path string true "The name of the measurement variable"
//	@Param        at query string false "The timestamp of the measurement in Unix format"
//	@Produce      json
//	@Success      200  {object}  map[string]any "The measurement data"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/measurements/{measurement} [get]
func measurementsGetHandler(w http.ResponseWriter, r *http.Request) {
	var (
		queryProject  = mux.Vars(r)["project_id"]
		queryVariable = mux.Vars(r)["measurement"]
		queryTime     = r.URL.Query().Get("at")
	)

	var t utils.Optional[time.Time]
	val, err := strconv.ParseInt(queryTime, 10, 64)
	if err == nil {
		t = utils.FilledOptional(time.Unix(val, 0))
	} else {
		t = utils.EmptyOptional[time.Time]()
	}

	opts := measurement.GetOptions{
		ProjectID: queryProject,
		Variable:  queryVariable,
		Time:      t,
	}

	optionalDataPoint, err := measurementRepo.Get(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	if !utils.HasOptionalValue(optionalDataPoint) {
		reject(w, r, http.StatusInternalServerError, errors.New("no measurement available").Error())
		return
	}
	var dataPoint = utils.GetOptionalValue(optionalDataPoint)
	if !utils.HasOptionalValue(dataPoint.Value) {
		reject(w, r, http.StatusInternalServerError, errors.New("no measurement available").Error())
		return
	}

	respond(w, http.StatusOK, map[string]any{"time": dataPoint.Time, "value": utils.GetOptionalValue(dataPoint.Value)})
}

// measurementsHistoryHandler handles the HTTP request for retrieving the history of measurements.
// @Summary      Get measurements history
//
//	@Description  Retrieves the history of measurements for a specific project and variable within a given time range.
//	@Tags         Measurements
//	@Accept       json
//	@Produce      json
//	@Param        project_id path string true "Project ID"
//	@Param        measurement_id path string true "Measurement ID"
//	@Param        start query int true "Start time (Unix timestamp)"
//	@Param        end query int true "End time (Unix timestamp)"
//	@Param        int query string false "Interval for aggregation"
//	@Param        agg query string false "Aggregation method, methods like average, last value, min value, ..."
//	@Param        miss query string false "Missing value strategy"
//	@Param        tz query string false "Timezone"
//	@Param        format query string false "Output format (highcharts)"
//	@Success      200  {object}  [][]any "Measurement history in the form of [[ts1, val1], [ts2, val2]]"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/measurements/{measurement_id}/chart [get]
func measurementsHistoryHandler(w http.ResponseWriter, r *http.Request) {
	// measurementsHistoryHandler returns data in highcharts-compatible format
	// [[ts1, val1], [ts2, val2]]
	// for a given interval from start to finish with predefined aggregation
	// methods like average, last value, min value, ...
	// parse start and end time

	val, err := strconv.ParseInt(r.URL.Query().Get("start"), 10, 64)
	start := time.Unix(val, 0)
	val, err = strconv.ParseInt(r.URL.Query().Get("end"), 10, 64)
	end := time.Unix(val, 0)
	if err != nil {
		reject(w, r, http.StatusBadRequest, "start,end must be a unix timestamp")
		return
	}

	if start.After(end) || start.Unix() == end.Unix() {
		reject(w, r, http.StatusBadRequest, "start must be bigger than end")
		return
	}

	interval := r.URL.Query().Get("int")
	aggregator := r.URL.Query().Get("agg")
	missingValueStrategy := r.URL.Query().Get("miss")
	if missingValueStrategy == "" {
		missingValueStrategy = measurement.LOCF
	}
	timezone := r.URL.Query().Get("tz")
	if timezone == "" {
		timezone = "UTC"
	}

	project := mux.Vars(r)["project_id"]
	variable := mux.Vars(r)["measurement_id"]

	history, err := measurementRepo.History(measurement.HistoryOptions{
		ProjectID:            project,
		Variable:             variable,
		Start:                start,
		End:                  end,
		Interval:             interval,
		Aggregation:          aggregator,
		MissingValueStrategy: missingValueStrategy,
		Timezone:             timezone,
	})
	if err != nil {
		if err == redis.ErrNil {
			reject(w, r, http.StatusBadRequest, "invalid variable")
			return
		}

		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	if r.URL.Query().Get("format") == "highcharts" {
		js, err := json.Marshal(&history)
		if err != nil {
			reject(w, r, http.StatusInternalServerError, err.Error())
			return
		}

		_, _ = w.Write([]byte(`<div id="chart"></div><script src="https://code.highcharts.com/stock/highstock.js"></script><script>var data=` + string(js) + `.map(e => [e[0]*1000, e[1]]);Highcharts.stockChart('chart', {series:[{name:'` + variable + `',data:data}]});</script>`))
		return
	}

	respond(w, http.StatusOK, history)
}

// measurementPublishHandler handles the publishing of a measurement for a specific project.
// @Summary      Publish measurement
//
//	@Description  Publish a measurement for a project
//	@Tags         Measurements
//	@Accept       json
//	@Produce      json
//	@Param        project_id path string true "Project ID"
//	@Param        value body measurement.Measurement true "Measurement value"
//	@Success      200  {object}  []measurement.Measurement "Published measurements"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/measurements/{measurement_id}/publish [post]
func measurementPublishHandler(w http.ResponseWriter, r *http.Request) {
	var (
		project_id = mux.Vars(r)["project_id"]
	)

	// parse body
	var value measurement.Measurement
	if err := json.NewDecoder(r.Body).Decode(&value); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	var published []measurement.Measurement

	newMeasurement := []measurement.Measurement{value}
	measurement.PublishVariable(&mqttClient, project_id, newMeasurement, func() {
		published = append(published, value)
	})

	respond(w, http.StatusOK, published)
}

// measurementSubscribeHandler handles the subscribe endpoint for Server Side Events.
// It retrieves measurements for a specific project and user, and streams them to the client using Server Side Events.
// @Summary      Subscribe to measurements
//
//	@Description  Subscribe to measurements for a project using Server Side Events
//	@Tags         Measurements
//	@Accept       json
//	@Param        project_id path string true "The ID of the project"
//	@Produce      text/event-stream
//	@Success      200  {object}  any "Connection established event, or measurement event"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/measurements/all/subscribe [post]
//	@Router       /projects/{project_id}/measurements/all/subscribe [get]
func measurementSubscribeHandler(w http.ResponseWriter, r *http.Request) {
	var (
		project_id = mux.Vars(r)["project_id"]
		user_id    = r.Header.Get("x-user")
	)
	opts := measurement.ListOptions{ProjectID: mux.Vars(r)["project_id"], UserID: user_id}

	m, err := measurementRepo.List(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	setSSEHeaders(w)

	// Create a context with a cancel function
	requestContext, cancel := context.WithCancel(r.Context())
	defer cancel() // Ensure that cancel is called when the request handler exits

	if err = writeAndFlush(w, "event: connection\ndata: connecting\n\n"); err != nil {
		http.Error(w, "Connection doesnot support streaming", http.StatusBadRequest)
		return
	}

	allowed := utils.StringKeys(m)
	// allow measurements with no name for heartbeat
	mqttChan := make(chan []byte)
	var wg sync.WaitGroup

	allowed = append(allowed, "")
	mqttTopics := []string{utils.GetDeviceToCloudMqttTopic(project_id), utils.GetCloudToDeviceMqttTopic(project_id)}
	mqttClient, err := utils.CreateMqttClient(envMqttAddr, mqttTopics, func(_ mqtt.Client, message mqtt.Message) {
		wg.Add(1)
		defer wg.Done()

		processMQTTAndPublishToChannel(message, &allowed, mqttChan, false, r.Context())
	})

	if err != nil {
		utils.LogError(err, "")
		return
	}

	defer cleanUpMQTTAndChannel(mqttClient, mqttChan, &wg)

	processChannelsAndContext(requestContext, mqttChan, w)
}

func setSSEHeaders(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
}

// measurementSubscribeMultipleHandler subscribes to multiple projects' measurements.
// It takes a list of project IDs in the request body and subscribes to the measurements of each project.
// @Summary      Subscribe to multiple projects' measurements
//
//	@Description  Subscribe to the measurements of multiple projects
//	@Tags         Measurements
//	@Accept       json
//	@Param        project_ids body []string true "List of project IDs"
//	@Produce      text/event-stream
//	@Success      200  {object}  any "Connection established event, or measurement event"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /measurements/subscribe/multiple [post]
func measurementSubscribeMultipleHandler(w http.ResponseWriter, r *http.Request) {
	var (
		user_id = r.Header.Get("x-user")
	)

	var project_ids []string
	if err := json.NewDecoder(r.Body).Decode(&project_ids); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	allowed := []string{}
	mqttTopics := []string{}
	allowed = append(allowed, "")
	for _, project_id := range project_ids {

		opts := measurement.ListOptions{ProjectID: project_id, UserID: user_id}

		m, err := measurementRepo.List(opts)
		if err != nil {
			continue
		}

		measurment_keys := utils.StringKeys(m)
		for i, key := range measurment_keys {
			measurment_keys[i] = fmt.Sprintf("%s:%s", project_id, key)
		}

		allowed = append(allowed, measurment_keys...)
		mqttTopics = append(mqttTopics, utils.GetDeviceToCloudMqttTopic(project_id), utils.GetCloudToDeviceMqttTopic(project_id))
	}

	setSSEHeaders(w)

	// Create a context with a cancel function
	requestContext, cancel := context.WithCancel(r.Context())
	defer cancel() // Ensure that cancel is called when the request handler exits

	if err := writeAndFlush(w, "event: connection\ndata: connecting\n\n"); err != nil {
		http.Error(w, "Connection doesnot support streaming", http.StatusBadRequest)
		return
	}

	// allow measurements with no name for heartbeat
	mqttChan := make(chan []byte)
	var wg sync.WaitGroup

	mqttClient, err := utils.CreateMqttClient(envMqttAddr, mqttTopics, func(_ mqtt.Client, message mqtt.Message) {
		wg.Add(1)
		defer wg.Done()
		processMQTTAndPublishToChannel(message, &allowed, mqttChan, true, r.Context())
	})

	if err != nil {
		utils.LogError(err, "")
		return
	}

	defer cleanUpMQTTAndChannel(mqttClient, mqttChan, &wg)

	processChannelsAndContext(requestContext, mqttChan, w)

}

func processChannelsAndContext(requestContext context.Context, mqttChan chan []byte, w http.ResponseWriter) {
	for {
		// Check if the context is done before processing the MQTT message
		select {
		case <-requestContext.Done():
			// The context is done; stop processing MQTT messages
			return
		case messageData := <-mqttChan:
			// Continue processing the MQTT message
			//give priority to a possible concurrent Done() event non-blocking way
			select {
			case <-requestContext.Done():
				l := utils.GetLogger()
				l.Error().Msg("the almost impossible did happen")
				return
			default:
			}
			if err := writeAndFlush(w, "event: mqtt\ndata: %s\n\n", messageData); err != nil {
				return
			}
		}
	}
}

func processMQTTAndPublishToChannel(message mqtt.Message, allowed *[]string, mqttChan chan []byte, prependProjectId bool, requestContext context.Context) {
	project_id, err := utils.GetCloudProjectIdFromTopic(message.Topic())
	if err != nil {
		utils.LogError(err, "")
		return
	}

	measurements := make([]measurement.Measurement, 0)
	if err := json.Unmarshal(message.Payload(), &measurements); err != nil {
		utils.LogError(err, "")
		return
	}

	allowedMeasurements := make([]measurement.Measurement, 0)
	for _, v := range measurements {
		if prependProjectId {
			v.Name = fmt.Sprintf("%s:%s", project_id, v.Name)
		}
		if utils.StringArrayContains(*allowed, v.Name) {
			allowedMeasurements = append(allowedMeasurements, v)
		}
	}

	if len(allowedMeasurements) == 0 {
		return
	}

	messageData, err := json.Marshal(allowedMeasurements)
	if err != nil {
		utils.LogError(err, "")
		return
	}

	select {
	case <-requestContext.Done():
		// The context is done; do not publish
		return
	default:
		{
			mqttChan <- messageData
		}
	}
	return
}

func cleanUpMQTTAndChannel(mqttClient mqtt.Client, channelToClose chan []byte, wg *sync.WaitGroup) {
	err := utils.DestroyMqttClient(mqttClient)
	if err != nil {
		utils.LogError(err, "")
	}
	wg.Wait()
	close(channelToClose)
}

func writeAndFlush(w http.ResponseWriter, message string, args ...any) error {
	flusher, ok := w.(http.Flusher)

	if !ok {
		return fmt.Errorf("error casting http.ResponseWriter to http.Flusher")
	}
	fmt.Fprintf(w, message, args...)
	flusher.Flush()
	return nil
}
