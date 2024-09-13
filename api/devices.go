package main

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/eneries/eneries/api/pkg/resource/device"
	"github.com/eneries/eneries/api/pkg/resource/project"
	"github.com/eneries/eneries/api/pkg/utils"

	"github.com/gorilla/mux"
)

// devicesCreateHandler creates a new device for the specified project.
// @Summary      Create device
//
//	@Description  Create a new device for a project
//	@Tags         Devices
//	@Accept       json
//	@Param        project_id path string true "Project ID"
//	@Param        opts body device.CreateOptions true "Device creation options"
//	@Produce      json
//	@Success      200  {object}  device.Device "Created device"
//	@Failure      400  {object}  map[string]string "Bad request"
//	@Failure      500  {object}  map[string]string "Internal server error"
//	@Router       /projects/{project_id}/devices [post]
func devicesCreateHandler(w http.ResponseWriter, r *http.Request) {
	projectID := mux.Vars(r)["project_id"]
	var opts device.CreateOptions

	if err := json.NewDecoder(r.Body).Decode(&opts); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}
	opts.ProjectID = projectID

	// validate if the device can be created...
	limits, err := projectRepo.Limits(project.LimitOptions{ID: projectID})
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	count, err := deviceRepo.Count(device.CountOptions{ProjectID: projectID})
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	if count >= limits.Devices {
		reject(w, r, http.StatusBadRequest, "limit reached")
		return
	}

	d, err := deviceRepo.Create(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, d)
}

// devicesListHandler handles the HTTP request for listing devices.
// @Summary      List devices
//
//	@Description  List devices for a project
//	@Tags         Devices
//	@Accept       json
//	@Produce      json
//	@Param        project_id path string true "Project ID"
//	@Success      200  {object}  []device.Device "List of devices"
//	@Failure      400  {object}  map[string]any{} "Bad request"
//	@Failure      500  {object}  map[string]any{} "Internal server error"
//	@Router       /projects/{project_id}/devices [get]
func devicesListHandler(w http.ResponseWriter, r *http.Request) {
	opts := device.ListOptions{
		ProjectID: mux.Vars(r)["project_id"],
		UserID:    r.Header.Get("x-user"),
	}

	devices, err := deviceRepo.List(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, devices)
}

// devicesUpdateDevice updates a device with the provided options.
// @Summary      Update a device
//
//	@Description  Update a device with the provided options
//	@Tags         Devices
//	@Accept       json
//	@Param        project_id path string true "Project ID"
//	@Param        device_id path string true "Device ID"
//	@Param        opts body device.UpdateOptions true "Update options"
//	@Produce      json
//	@Success      200  {object}  device.Device "Updated device"
//	@Failure      400  {object}  map[string]string "Bad request"
//	@Failure      500  {object}  map[string]string "Internal server error"
//	@Router       /projects/{project_id}/devices/{device_id} [put]
func devicesUpdateDevice(w http.ResponseWriter, r *http.Request) {
	var opts device.UpdateOptions

	if err := json.NewDecoder(r.Body).Decode(&opts); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	opts.ProjectID = mux.Vars(r)["project_id"]
	opts.ID = mux.Vars(r)["device_id"]
	opts.UserID = r.Header.Get("x-user")

	d, err := deviceRepo.Update(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, d)
}

// devicesUpdateChartOptions updates the chart options for a device
// @Summary      Update chart options
//
//	@Description  Update the chart options for a device in the database
//	@Tags         Devices
//	@Accept       json
//	@Param        device_id path string true "Device ID"
//	@Param        project_id path string true "Project ID"
//	@Param        body body device.UpdateChartOptions true "Chart options to update"
//	@Produce      json
//	@Success      200  {object}  device.Device "Updated device"
//	@Failure      400  {object}  map[string]string "Bad request"
//	@Failure      500  {object}  map[string]string "Internal server error"
//	@Router       /projects/{project_id}/devices/chart-options/{device_id} [put]
func devicesUpdateChartOptions(w http.ResponseWriter, r *http.Request) {
	// parse input data
	var opts device.UpdateChartOptions
	if err := json.NewDecoder(r.Body).Decode(&opts); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	// validate input data
	if err := device.ValidateIntervalString(opts.Interval); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}
	if err := device.ValidatePeriodString(opts.PeriodName); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}
	if err := device.ValidateSelectedStackingOptionString(opts.SelectedStackingOption); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	// apply input options to a chart device in the database
	getOptions := device.GetOptions{UserID: r.Header.Get("x-user"), ID: mux.Vars(r)["device_id"], ProjectID: mux.Vars(r)["project_id"]}
	dev, err := deviceRepo.Get(getOptions)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	// check if the device is a chart
	if dev.Data["type"] != "chart" {
		reject(w, r, http.StatusBadRequest, errors.New("device is not a chart").Error())
		return
	}
	// set dev options in the chart object
	dev.Data["interval"] = opts.Interval
	dev.Data["periodName"] = opts.PeriodName
	dev.Data["selectedStackingOptions"] = opts.SelectedStackingOption

	// update the chart
	dev, err = deviceRepo.Update(device.UpdateOptions{ID: dev.ID, Name: dev.Name, Data: dev.Data, UserID: r.Header.Get("x-user"), CollectionID: dev.CollectionID, ProjectID: dev.ProjectID})
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, dev)
}

// devicesDeleteHandler deletes a device with the specified project ID and device ID.
// @Summary      Delete a device
//
//	@Description  Delete a device with the specified project ID and device ID
//	@Tags         Devices
//	@Param        project_id path string true "Project ID"
//	@Param        device_id path string true "Device ID"
//	@Success      200  {object}  map[string]string "Device deleted successfully"
//	@Failure      400  {object}  map[string]any{} "Bad request"
//	@Failure      500  {object}  map[string]any{} "Internal server error"
//	@Router       /projects/{project_id}/devices/{device_id} [delete]
func devicesDeleteHandler(w http.ResponseWriter, r *http.Request) {
	opts := device.DeleteOptions{
		ProjectID: mux.Vars(r)["project_id"],
		ID:        mux.Vars(r)["device_id"],
	}

	if err := deviceRepo.Delete(opts); err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}
}

// devicesCreateFavoriteHandler handles the creation of a favorite device.
// @Summary      Create favorite device
//
//	@Description  Create a favorite device for a project
//	@Tags         Devices
//	@Accept       json
//	@Param        project_id path string true "Project ID"
//	@Param        device_id path string true "Device ID"
//	@Success      200  {object}  map[string]interface{} "Favorite device created successfully"
//	@Failure      400  {object}  map[string]interface{} "Bad request"
//	@Failure      500  {object}  map[string]interface{} "Internal server error"
//	@Router       /projects/{project_id}/favorites/{device_id} [put]
func devicesCreateFavoriteHandler(w http.ResponseWriter, r *http.Request) {
	opts := device.AddFavoriteOptions{
		ProjectID: mux.Vars(r)["project_id"],
		ID:        mux.Vars(r)["device_id"],
		UserID:    r.Header.Get("x-user"),
	}

	if err := deviceRepo.AddFavorite(opts); err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
	}
}

// devicesDeleteFavoriteHandler handles the HTTP request to remove a device from favorites.
// @Summary      Remove device from favorites
//
//	@Description  Remove a device from the user's favorites list.
//	@Tags         Devices
//	@Accept       json
//	@Param        device_id path string true "The ID of the device to remove from favorites"
//	@Produce      json
//	@Success      200  {object}  map[string][]string "Updated favorites list"
//	@Failure      400  {object}  map[string]any{} "Bad request"
//	@Failure      500  {object}  map[string]any{} "Internal server error"
//	@Router       /projects/{project_id}/favorites/{device_id} [delete]
func devicesDeleteFavoriteHandler(w http.ResponseWriter, r *http.Request) {
	opts := device.RemoveFavoriteOptions{
		ID:     mux.Vars(r)["device_id"],
		UserID: r.Header.Get("x-user"),
	}

	if err := deviceRepo.RemoveFavorite(opts); err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
	}
}

type ChargerDetails struct {
	Type         string      `json:"type"`
	SerialNumber string      `json:"serialNumber"`
	PhaseMode    int32       `json:"phaseMode"`
	LedMode      interface{} `json:"ledMode"`
}

func devicesChargerDetailsHander(w http.ResponseWriter, r *http.Request) {
	device_id := mux.Vars(r)["device_id"]
	project_id := mux.Vars(r)["project_id"]

	// apply input options to a chart device in the database
	getOptions := device.GetOptions{UserID: r.Header.Get("x-user"), ID: device_id, ProjectID: project_id}
	dev, err := deviceRepo.Get(getOptions)

	if err != nil {
		if _, ok := err.(utils.NotFoundError); !ok {
			reject(w, r, http.StatusNotFound, "not found")
			return
		}
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	if dev.Data["type"] != "EaseeWallbox" {
		reject(w, r, http.StatusBadRequest, "device is not supported for charger details")
		return
	}

	meta := dev.Data["meta"]

	// try casting meta as a map[string]interface{}
	metaMap, ok := meta.(map[string]interface{})
	if !ok {
		reject(w, r, http.StatusInternalServerError, "device meta is not a map")
		return
	}

	charger_id := metaMap["chargerId"]

	// cast charger_id as a string
	charger_id_str, ok := charger_id.(string)
	if !ok {
		reject(w, r, http.StatusInternalServerError, "charger_id is not a string")
		return
	}

	if easeeClient == nil {
		reject(w, r, http.StatusInternalServerError, "easee client is nil")
		return
	}

	err = easeeClient.GetTokens()
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	details, err := easeeClient.GetChargerDetails(charger_id_str)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	configureation, err := easeeClient.GetChargerConfig(charger_id_str)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	ledObservation, err := easeeClient.GetObservationValue(charger_id_str, "46")
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	returnObj := ChargerDetails{
		Type:         details.Product,
		SerialNumber: details.SerialNumber,
		PhaseMode:    configureation.PhaseMode,
		LedMode:      ledObservation.Value,
	}

	respond(w, http.StatusOK, returnObj)
}
