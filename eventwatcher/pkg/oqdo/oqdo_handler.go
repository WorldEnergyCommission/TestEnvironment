package oqdo

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/google/uuid"
	"github.com/philippseith/signalr"

	"github.com/eneries/eneries/api/pkg/resource/measurement"
	"github.com/eneries/eneries/api/pkg/resource/project"
	"github.com/eneries/eneries/api/pkg/utils"
)

const (
	ImportExportType = "oqdo"
)

var (
	baseUrl         string
	clientId        string
	subscriptionKey string

	variablesCreated    *int64
	measurementsCreated *int64

	measurementRepo measurement.Repository
	projectRepo     project.Repository

	importMappings     map[string]project.ImportMapping
	importMappingsLock = sync.RWMutex{}
)

type SignalrConfig struct {
	Url         string `json:"url"`
	AccessToken string `json:"accessToken"`
}

type Property struct {
	Key   string `json:"key"`
	Value any    `json:"value"`
}

type Properties struct {
	PropertiesArray []Property `json:"properties"`
}

type ValueChangeEvent struct {
	ObjectId        uuid.UUID `json:"objectId"`
	PropertyName    string    `json:"propertyName"`
	Schema          string    `json:"schema"`
	Timestamp       time.Time `json:"timestamp"`
	Value           any       `json:"value"`
	ResourceGroupId uuid.UUID `json:"resourceGroupId"`
	Id              uuid.UUID `json:"id"`
	CreationDate    time.Time `json:"creationDate"`
}

type Receiver struct{}

// InitializeEventHandler sets the global variables from the main package that are accesses by the individual event handler
func InitializeEventHandler(variablesCreatedArg *int64, measurementsCreatedArg *int64, measurementRepoArg measurement.Repository, projectRepoArg project.Repository) {
	variablesCreated = variablesCreatedArg
	measurementsCreated = measurementsCreatedArg
	measurementRepo = measurementRepoArg
	projectRepo = projectRepoArg

	var err error
	// get the import mappings for all variables
	importMappingsLock.Lock()
	importMappings, err = projectRepo.GetOqdoImportMappings()
	importMappingsLock.Unlock()

	if err != nil {
		utils.LogError(err, "Fatal Error updating oqdo import mappings")
		return
	}

	// update the import mappings in the background
	go updateImportMappings()
}

func updateImportMappings() {
	l := utils.GetLogger()
	minuteTicker := time.NewTicker(time.Minute * 15)
	defer minuteTicker.Stop()
	for {
		// update the import mappings
		exportMappingsResult, err := projectRepo.GetOqdoImportMappings()
		if err != nil {
			utils.LogError(err, "Fatal Error updating import mappings in Ticker")
		} else {
			importMappingsLock.Lock()
			importMappings = exportMappingsResult
			importMappingsLock.Unlock()
		}

		l.Debug().Msg("Updated import mappings!")

		// wait for next minute
		<-minuteTicker.C
	}
}

// InitializeBaseUrlClientIdAndSubscriptionKey sets the global variables for the oqdo authentication which are used by other functions
func InitializeBaseUrlClientIdAndSubscriptionKey(signalrConnectionString string) error {
	parts := strings.Split(signalrConnectionString, " ")
	if len(parts) != 3 {
		return errors.New("invalid oqdo connection string")
	}
	baseUrl, clientId, subscriptionKey = parts[0], parts[1], parts[2]
	return nil
}

// ConnectToSignalr this function is called every time the client loses connection to the signalr server
func ConnectToSignalr() (signalr.Connection, error) {
	// create a connection (with timeout for the negotiation process)
	l := utils.GetLogger()
	l.Debug().Msg("Connecting to singalR")
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()
	config, err := utils.MakeHttpRequest[SignalrConfig]("POST", fmt.Sprintf("%s/objectshub/negotiate?negotiateVersion=1", baseUrl), nil, utils.GetCloudAuthorizationHeader(clientId, subscriptionKey), true)
	if err != nil {
		return nil, err
	}
	_, err = utils.MakeHttpRequest[string]("POST", fmt.Sprintf("%s/objectshub/subscribe", baseUrl), nil, utils.GetCloudAuthorizationHeader(clientId, subscriptionKey), true)
	if err != nil {
		return nil, err
	}
	conn, err := signalr.NewHTTPConnection(
		ctx, config.Url,
		signalr.WithHTTPHeaders(
			func() http.Header {
				return utils.GetAuthorizationHeader(config.AccessToken)
			}))
	if err != nil {
		return nil, err
	}
	return conn, nil
}

// ConvertEventToCreateOptionsSlice converts the event from signalr to multiple create options
func ConvertEventToCreateOptionsSlice(event ValueChangeEvent) ([]measurement.CreateOptions, error) {
	var createOptionsSlice []measurement.CreateOptions
	// check if the value of the event is a number
	value, err := utils.TryConversionToFloat64(event.Value)
	if err != nil {
		l := utils.GetLogger()
		l.Error().Err(err).Str("value", fmt.Sprintf("%v", event.Value)).Msg("Error TryConversionToFloat64 error")
		return nil, err
	}

	importMappingsLock.RLock()
	oqdoImportMapping, ok := importMappings[fmt.Sprintf("%s.%s.%s", event.ResourceGroupId.String(), event.ObjectId.String(), event.PropertyName)]
	importMappingsLock.RUnlock()

	if !ok {
		l := utils.GetLogger()
		l.Debug().Str("key", fmt.Sprintf("%s.%s.%s", event.ResourceGroupId.String(), event.ObjectId.String(), event.PropertyName)).Msg("Cound not find oqdo import mapping")
		l.Info().Str("ResourceGroupID", event.ResourceGroupId).Msg("ResourceGroupID.")
		l.Info().Str("ObjectID", event.ObjectId).Msg("ObjectId.")
		l.Info().Str("PropertyName", event.PropertyName).Msg("PropertyName.")
		return createOptionsSlice, nil
	}

	createOptionsSlice = append(createOptionsSlice,
		measurement.CreateOptions{ProjectID: oqdoImportMapping.Project,
			Measurements: []measurement.Measurement{
				{Name: oqdoImportMapping.Variable,
					Value: value,
					Time:  utils.GetFloatUnixTimestampFromTime(event.Timestamp)}}})
	return createOptionsSlice, nil
}

// ValueChanged is the method called by signalr, do not change the name
func (r *Receiver) ValueChanged(event ValueChangeEvent) error {
	l := utils.GetLogger()
	l.Debug().Str("key", fmt.Sprintf("%s.%s.%s", event.ResourceGroupId.String(), event.ObjectId.String(), event.PropertyName)).Msg("Got Oqdo event")
	// generate the create options slice
	createOptionsSlice, err := ConvertEventToCreateOptionsSlice(event)
	if err != nil {
		utils.LogError(err, "Error ConvertEventToCreateOptionsSlice in Qqdo handler")
		return err
	}
	if len(createOptionsSlice) == 0 {
		return nil
	}

	l.Debug().Str("options", fmt.Sprintf("%v", createOptionsSlice)).Msg("creating measurements from oqdo, Options")

	// create the measurements in the database
	_, metricResult, err := measurementRepo.CreateMeasurements(createOptionsSlice, projectRepo, true)
	if err != nil {
		utils.LogError(err, "Error CreateMeasurements")
		return err
	}

	// update the recorder metrics using atomic operations
	atomic.AddInt64(variablesCreated, metricResult.VariablesCreated)
	atomic.AddInt64(measurementsCreated, metricResult.MeasurementsCreated)

	return nil
}

// UpdateValueByExportId is used to update a specific property of an oqdo object with an export id
func UpdateValueByExportId(exportId string, value float64) error {
	stringParts := strings.Split(exportId, ".")
	if len(stringParts) != 3 {
		return errors.New("invalid oqdo export id format")
	}
	resourceGroupIdString, objectIdString, propertyName := stringParts[0], stringParts[1], stringParts[2]
	resourceGroupId, err := uuid.Parse(resourceGroupIdString)
	if err != nil {
		return errors.New("invalid resource group uuid")
	}
	objectId, err := uuid.Parse(objectIdString)
	if err != nil {
		return errors.New("invalid resource group uuid")
	}
	return UpdateValue(resourceGroupId, objectId, propertyName, value)
}

// UpdateValue is used to update a specific property of an oqdo object
func UpdateValue(resourceGroupId uuid.UUID, objectId uuid.UUID, propertyName string, value any) error {
	fullUrl := fmt.Sprintf("%s/objects/%s/%s", baseUrl, resourceGroupId.String(), objectId.String())
	properties := Properties{PropertiesArray: []Property{{Key: propertyName, Value: value}}}
	authorizationHeader := utils.GetCloudAuthorizationHeader(clientId, subscriptionKey)
	_, err := utils.MakeHttpRequest[string]("POST", fullUrl, properties, authorizationHeader, true)
	if err != nil {
		return err
	}
	return nil
}
