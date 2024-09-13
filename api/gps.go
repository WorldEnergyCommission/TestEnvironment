package main

import (
	"fmt"

	"github.com/adrianmo/go-nmea"
	"github.com/eneries/eneries/api/pkg/resource/project"
	"github.com/eneries/eneries/api/pkg/utils"
	"github.com/gorilla/mux"

	"io/ioutil"
	"net/http"
	"os"
	"strings"
)

var (
	envGpsToken = os.Getenv("GPS_TOKEN")
)

// LocationResponseInformation has the structure of the partial response of the reverse mapping endpoint
type LocationResponseInformation struct {
	DisplayName string `json:"display_name"`
}

// LocationProjectInformation has the structure of the partial response of the reverse mapping endpoint
type LocationProjectInformation struct {
	DisplayName string `json:"display_name"`
	Latitude    string `json:"lat"`
	Longitude   string `json:"lon"`
	GpsDeviceId string `json:"gps_device_id"`
}

// handleGpsData parses NMEA messages and writes the location to the corresponding project
func handleGpsData(w http.ResponseWriter, r *http.Request) {
	// get all needed variables from the request
	token := mux.Vars(r)["token"]
	imeiNumber := r.URL.Query().Get("imei")
	serialNumber := r.URL.Query().Get("serial_num")
	if token == "" || imeiNumber == "" || serialNumber == "" {
		reject(w, r, http.StatusBadRequest, "please provide a valid token, imei or serial_num")
		return
	}
	// check GPS token
	if token != envGpsToken {
		reject(w, r, http.StatusUnauthorized, "please provide a valid token")
		return
	}
	// parse the http body into an NMEA messages array
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, "error occurred while reading the request body")
		return
	}
	bodyString := strings.TrimSpace(string(body))
	if bodyString == "" {
		reject(w, r, http.StatusInternalServerError, "please provide a request body")
		return
	}
	possibleNmeaSentences := strings.Split(bodyString, "\n")
	var nmeaSentences []nmea.Sentence
	for _, possibleNmeaSentence := range possibleNmeaSentences {
		nmeaSentence, err := nmea.Parse(strings.TrimSpace(possibleNmeaSentence))
		if err != nil {
			reject(w, r, http.StatusInternalServerError, "error occurred while parsing the NMEA sentences")
			return
		}
		nmeaSentences = append(nmeaSentences, nmeaSentence)
	}
	// read the location out of the NMEA sentences
	var optionalLatitude = utils.EmptyOptional[float64]()
	var optionalLongitude = utils.EmptyOptional[float64]()
	for _, nmeaSentence := range nmeaSentences {
		if nmeaSentence.DataType() == nmea.TypeRMC {
			rmcNmeaSentence := nmeaSentence.(nmea.RMC)
			optionalLatitude = utils.FilledOptional(rmcNmeaSentence.Latitude)
			optionalLongitude = utils.FilledOptional(rmcNmeaSentence.Longitude)
		}
	}
	if !utils.HasOptionalValue(optionalLatitude) || !utils.HasOptionalValue(optionalLongitude) {
		reject(w, r, http.StatusInternalServerError, "there was no NMEA sentence with a position present")
		return
	}
	var latitude = utils.GetOptionalValue(optionalLatitude)
	var longitude = utils.GetOptionalValue(optionalLongitude)
	// get the display name for the location
	locationInfo, err := utils.MakeHttpRequest[LocationResponseInformation]("GET", fmt.Sprintf("https://nominatim.openstreetmap.org/reverse?lat=%v&lon=%v&format=json", latitude, longitude), nil, nil, true)
	if err != nil {
		l := utils.GetLogger()
		// just log the error and do not terminate the handler in this case
		l.Error().Err(err).Msg("")
	}
	// if the request failed the display name will have the zero value
	var displayName = locationInfo.DisplayName
	// find all projects that use the gps device id
	gpsProjects, err := projectRepo.ListByGpsDeviceId(project.ListByGpsDeviceIdOptions{GpsDeviceId: serialNumber})
	if err != nil {
		reject(w, r, http.StatusInternalServerError, "cannot read the projects for the gps device")
		return
	}
	// update location information for all of these projects
	var updatedProjectIds []string
	for _, gpsProject := range gpsProjects {
		// get current project
		currentProject, err := projectRepo.Get(project.GetOptions{ID: gpsProject.ID})
		if err != nil {
			reject(w, r, http.StatusInternalServerError, "cannot get the project for location modification")
			return
		}
		// update the location information
		var locationProjectInformation = LocationProjectInformation{
			DisplayName: displayName,
			Latitude:    fmt.Sprintf("%v", latitude),
			Longitude:   fmt.Sprintf("%v", longitude),
			GpsDeviceId: serialNumber}
		currentProject.Meta["location"] = locationProjectInformation
		// update the project in the database
		_, err = projectRepo.Update(project.UpdateOptions{ID: currentProject.ID, Name: currentProject.Name, Meta: currentProject.Meta, Connectivity: currentProject.Connectivity})
		if err != nil {
			reject(w, r, http.StatusInternalServerError, "cannot update the project with the new location")
			return
		}
		updatedProjectIds = append(updatedProjectIds, currentProject.ID)
	}
	// return an empty JSON object as response
	respond(w, http.StatusOK, map[string]any{"updatedProjectIds": updatedProjectIds})
}
