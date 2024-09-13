package oeamtc

import (
	"context"
	"encoding/json"
	"sync"
	"sync/atomic"
	"time"

	eventhub "github.com/Azure/azure-event-hubs-go/v3"

	"github.com/efficientIO/efficientIO/api/pkg/resource/measurement"
	"github.com/efficientIO/efficientIO/api/pkg/resource/project"
	"github.com/efficientIO/efficientIO/api/pkg/utils"
)

var (
	variablesCreated    *int64
	measurementsCreated *int64

	measurementRepo measurement.Repository
	projectRepo     project.Repository

	importMappings     map[string]project.ImportMapping
	importMappingsLock = sync.RWMutex{}
)

type (
	Event struct {
		Name  string    `json:"Asset"`
		Value float64   `json:"Leistung"`
		Time  time.Time `json:"Time"`
	}
)

// InitializeEventHandler sets the global variables from the main package that are accesses by the individual event handler
func InitializeEventHandler(variablesCreatedArg *int64, measurementsCreatedArg *int64, measurementRepoArg measurement.Repository, projectRepoArg project.Repository) {
	variablesCreated = variablesCreatedArg
	measurementsCreated = measurementsCreatedArg
	measurementRepo = measurementRepoArg
	projectRepo = projectRepoArg

	var err error
	// get the import mappings for all variables
	importMappingsLock.Lock()
	importMappings, err = projectRepo.GetOeamtcImportMappings()
	importMappingsLock.Unlock()

	if err != nil {
		l := utils.GetLogger()
		l.Fatal().Err(err).Msg("Fatal Error updating oeamtc import mappings")
		return
	}

	// update the import mappings in the background
	go updateImportMappings()
}

func updateImportMappings() {
	l := utils.GetLogger()

	ticker := time.NewTicker(time.Minute * 15)
	defer ticker.Stop()
	for {
		// update the import mappings
		importMappingsResult, err := projectRepo.GetOeamtcImportMappings()
		if err != nil {
			l.Fatal().Err(err).Msg("Fatal Error updating oeamtc import mappings in Ticker")
		} else {
			importMappingsLock.Lock()
			importMappings = importMappingsResult
			importMappingsLock.Unlock()
		}

		l.Debug().Msg("Updated oeamtc import mappings!")

		// wait for next minute
		<-ticker.C
	}
}

// ConvertEventsToCreateOptionsSlice converts the events from the event hub event to multiple create options
func ConvertEventsToCreateOptionsSlice(events []Event) ([]measurement.CreateOptions, error) {
	var createOptionsSlice []measurement.CreateOptions
	for _, event := range events {
		// get the mapped projects and variables for this asset name
		importMappingsLock.RLock()
		importMapping, ok := importMappings[event.Name]
		importMappingsLock.RUnlock()
		if !ok {
			l := utils.GetLogger()
			l.Debug().Str("Eventname", event.Name).Msg("Cound not find Oemtc import mapping")
			continue
		}

		createOptionsSlice = append(createOptionsSlice,
			measurement.CreateOptions{ProjectID: importMapping.Project,
				Measurements: []measurement.Measurement{
					{Name: importMapping.Variable,
						Value: event.Value,
						Time:  utils.GetFloatUnixTimestampFromTime(event.Time)}}})
	}
	return createOptionsSlice, nil
}

// EventHandler is called on incoming oeamtc messages
func EventHandler(c context.Context, event *eventhub.Event) error {

	// parse the event string into the struct slice
	var measurementEvents []Event
	if err := json.Unmarshal(event.Data, &measurementEvents); err != nil {
		utils.LogError(err, "oeamtc unmarshall")
		return err
	}

	// generate the create options slice
	createOptionsSlice, err := ConvertEventsToCreateOptionsSlice(measurementEvents)
	if err != nil {
		utils.LogError(err, "Oematc ConvertEventsToCreateOptionsSlice")
		return err
	}

	// create the measurements in the database
	_, metricResult, err := measurementRepo.CreateMeasurements(createOptionsSlice, projectRepo, true)
	if err != nil {
		utils.LogError(err, "Oematc CreateMeasurements")
		return err
	}

	// update the recorder metrics using atomic operations
	atomic.AddInt64(variablesCreated, metricResult.VariablesCreated)
	atomic.AddInt64(measurementsCreated, metricResult.MeasurementsCreated)

	// no error has happened until now, operation was successful
	return nil
}
