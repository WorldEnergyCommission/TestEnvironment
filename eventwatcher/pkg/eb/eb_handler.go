package eb

import (
	"context"
	"errors"
	"fmt"

	"github.com/efficientIO/efficientIO/api/pkg/resource/measurement"
	"github.com/efficientIO/efficientIO/api/pkg/resource/project"
	"github.com/efficientIO/efficientIO/api/pkg/utils"
	"github.com/rocketlaunchr/dataframe-go"
	"github.com/samber/lo"

	"os"
	"regexp"
	"sync/atomic"

	"time"
)

var (
	variablesCreated    *int64
	measurementsCreated *int64

	measurementRepo measurement.Repository
	projectRepo     project.Repository
)

// InitializeEventHandler sets the global variables from the main package that are accessed by the individual event handler
func InitializeEventHandler(variablesCreatedArg *int64, measurementsCreatedArg *int64, measurementRepoArg measurement.Repository, projectRepoArg project.Repository) {
	variablesCreated = variablesCreatedArg
	measurementsCreated = measurementsCreatedArg
	measurementRepo = measurementRepoArg
	projectRepo = projectRepoArg
}

// GetDataframeSeparator returns the separator present in the dataframe
func GetDataframeSeparator() rune {
	return ';'
}

// GetDataframeTypes returns the datatypes present in the dataframe
func GetDataframeTypes() map[string]any {
	return map[string]any{"Zählpunkt": "", "Typ": "", "Profil": "", "Profilwert": float64(0), "Datum": "", "Zeit": ""}
}

// GetEbSftpUserPasswordDir extracts the user, password and directory from the config
func GetEbSftpUserPasswordDir() (string, string, string, error) {
	user := os.Getenv("EB_SFTP_USER")
	usersConfig := os.Getenv("SFTP_USERS")
	pattern, err := regexp.Compile(fmt.Sprintf("%v:([^:]+):::([^:]+)", regexp.QuoteMeta(user)))
	if err != nil {
		return "", "", "", err
	}
	resultSlice := pattern.FindStringSubmatch(usersConfig)
	if len(resultSlice) != 3 {
		return "", "", "", errors.New("invalid sftp user config")
	}
	password := resultSlice[1]
	directory := resultSlice[2]
	return user, password, directory, err
}

// ProcessDataframe is called on each new dataframe
func ProcessDataframe(frame *dataframe.DataFrame) error {
	// create a proper timestamp and id column
	var timestampValues []time.Time
	var idValues []string
	for index := 0; index < frame.NRows(); index++ {
		currentRow := frame.Row(index, false)
		timestampValue, err := time.Parse("02.01.2006T15:04:05-07:00", fmt.Sprintf("%vT%v+02:00", currentRow["Datum"], currentRow["Zeit"]))
		if err != nil {
			utils.LogError(err, "")
			return err
		}
		timestampValues = append(timestampValues, timestampValue)
		idValues = append(idValues, fmt.Sprintf("%v.%v.%v", currentRow["Zählpunkt"], currentRow["Typ"], currentRow["Profil"]))
	}
	timestampSeries := dataframe.NewSeriesTime("timestamp", nil,
		lo.Map(timestampValues, func(elem time.Time, _ int) any { return any(elem) })...)
	err := frame.AddSeries(timestampSeries, nil)
	if err != nil {
		utils.LogError(err, "")
		return err
	}
	idSeries := dataframe.NewSeriesString("id", nil,
		lo.Map(idValues, func(elem string, _ int) any { return any(elem) })...)
	err = frame.AddSeries(idSeries, nil)

	// filter out zero values
	err = FilterZeroValues(frame)
	if err != nil {
		return err
	}

	// generate the create options slice
	createOptionsSlice, err := ConvertDataframeToCreateOptionsSlice(frame)
	if err != nil {
		utils.LogError(err, "")
		return err
	}

	// create the measurements in the database
	_, metricResult, err := measurementRepo.CreateMeasurements(createOptionsSlice, projectRepo, false)
	if err != nil {
		utils.LogError(err, "")
		return err
	}

	// update the recorder metrics using atomic operations
	atomic.AddInt64(variablesCreated, metricResult.VariablesCreated)
	atomic.AddInt64(measurementsCreated, metricResult.MeasurementsCreated)

	// no error has happened until now, operation was successful
	return nil
}

// FilterZeroValues filters out zero values at the end of an id sent in the dataframe
func FilterZeroValues(frame *dataframe.DataFrame) error {
	// variable to store which rows must be deleted
	var rowsToDelete []int

	// sort the dataframe first by id and then by timestamp
	frame.Sort(context.Background(), []dataframe.SortKey{{Key: "id"}, {Key: "timestamp"}})

	lastId := ""
	zeroStreak := false
	for index := frame.NRows() - 1; index >= 0; index-- {
		currentRow := frame.Row(index, false)

		// get values out of current row
		currentId := fmt.Sprintf("%v", currentRow["id"])
		currentValue, ok := currentRow["Profilwert"].(float64)
		if !ok {
			return errors.New("incompatible \"Profilwert\" column type")
		}

		// remove row if it is a zero at the end of the series
		if (currentId != lastId || zeroStreak) && currentValue == 0.0 {
			rowsToDelete = append(rowsToDelete, index)
			zeroStreak = true
		} else {
			zeroStreak = false
		}

		// save the last identifier
		lastId = currentId
	}

	// remove all rows
	for _, rowToDelete := range rowsToDelete {
		frame.Remove(rowToDelete)
	}

	// no error happened
	return nil
}

// ConvertDataframeToCreateOptionsSlice converts the frame into create options
func ConvertDataframeToCreateOptionsSlice(frame *dataframe.DataFrame) ([]measurement.CreateOptions, error) {
	// create used variables
	var createOptionsSlice []measurement.CreateOptions
	processedData := make(map[string][]measurement.Measurement)
	projectMappings := make(map[string][]project.ImportMapping)

	for index := 0; index < frame.NRows(); index++ {
		currentRow := frame.Row(index, false)

		// get values out of current row
		currentId := fmt.Sprintf("%v", currentRow["id"])
		currentValue, ok := currentRow["Profilwert"].(float64)
		if !ok {
			return nil, errors.New("incompatible \"Profilwert\" column type")
		}
		currentTime, ok := currentRow["timestamp"].(time.Time)
		if !ok {
			return nil, errors.New("incompatible \"timestamp\" column type")
		}

		// get the import mappings for the current row
		_, ok = projectMappings[currentId]
		if !ok {
			importMappings, err := projectRepo.GetImportMappingsForEbId(currentId)
			if err != nil {
				return nil, err
			}
			projectMappings[currentId] = importMappings
		}
		ebImportMappings := projectMappings[currentId]

		// create the measurements for the projects
		for _, ebImportMapping := range ebImportMappings {
			_, ok = processedData[ebImportMapping.Project]
			if !ok {
				processedData[ebImportMapping.Project] = []measurement.Measurement{}
			}
			processedData[ebImportMapping.Project] = append(processedData[ebImportMapping.Project],
				measurement.Measurement{Name: ebImportMapping.Variable, Unit: "kWh",
					Value: currentValue, Time: utils.GetFloatUnixTimestampFromTime(currentTime)})
		}
	}

	// convert the map into a list of create options
	for projectId, measurements := range processedData {
		createOptionsSlice = append(createOptionsSlice, measurement.CreateOptions{ProjectID: projectId, Measurements: measurements})
	}

	// return the final result
	return createOptionsSlice, nil
}
