package main

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	data_mapping "github.com/efficientIO/efficientIO/api/pkg/resource/data_mapping"
	"github.com/gorilla/mux"
)

// dataMappingListTypesHandler handles the HTTP request to list data mapping types.
//
//	@Summary      List data mapping types
//	@Description  Lists all available data mapping types
//	@Tags         Data Mappings
//	@Accept       json
//	@Security     OAuth2Application[listDataMappingTypes] "The required scope for this endpoint"
//	@Produce      json
//	@Success      200  {object}	[]data_mapping.DataMappingType "List of data mapping types"
//	@Failure      400  {object}	map[string]any "Bad request"
//	@Failure      401  {object}	map[string]any "Unauthorized"
//	@Failure      500  {object}	map[string]any "Internal server error"
//	@Router       /data-mapping/types/list [get]
func dataMappingListTypesHandler(w http.ResponseWriter, r *http.Request) {
	types, err := dataMappingRepo.ListTypes()
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, types)
}

// dataMappingListHandler handles the HTTP request for listing data mappings.
//
//	@Summary      List data mappings
//	@Description  List data mappings for a project
//	@Tags         Data Mappings
//	@Accept       json
//	@Security     OAuth2Application[listDataMapping] "The required scope for this endpoint"
//	@Produce      json
//	@Param        project_id	path	string	true	"Project ID"
//	@Success      200  {object}	[]data_mapping.DataMapping "List of devices"
//	@Failure      400  {object}	map[string]any "Bad request"
//	@Failure      401  {object}	map[string]any "Unauthorized"
//	@Failure      500  {object}	map[string]any "Internal server error"
//	@Router       /projects/{project_id}/data-mapping/list [get]
func dataMappingListHandler(w http.ResponseWriter, r *http.Request) {
	opts := data_mapping.ListOptions{
		UserID:    r.Header.Get("x-user"),
		ProjectID: mux.Vars(r)["project_id"],
	}

	devices, err := dataMappingRepo.List(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, devices)
}

// dataMappingPropertyListHandler handles the request to list properties for a given type.
//
//	@Summary      List properties for a type
//	@Description  Retrieves a list of properties for a given type.
//	@Tags         Data Mappings
//	@Accept       json
//	@Param        type_id	path	string	true	"Type ID"
//	@Security     OAuth2Application[listDataMappingTypes]	"The required scope for this endpoint"
//	@Produce      json
//	@Success      200	{object}	[]data_mapping.DataMappingTypeProperty "List of properties"
//	@Failure      400	{object}	map[string]any "Bad request"
//	@Failure      401	{object}	map[string]any "Unauthorized"
//	@Failure      500	{object}	map[string]any "Internal server error"
//	@Router       /data-mapping/types/{type_id}/properties [get]
func dataMappingPropertyListHandler(w http.ResponseWriter, r *http.Request) {
	typeID := mux.Vars(r)["type_id"]

	props, err := dataMappingRepo.ListPropertiesForType(typeID)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, props)
}

// dataMappingPropertyCreateHandler creates a new data mapping property for a project.
//
//	@Summary      Create data mapping property
//	@Description  Create a new data mapping property for a project
//	@Tags         Data Mappings
//	@Accept       json
//	@Param        project_id path string true "Project ID"
//	@Param        opts body data_mapping.CreateOptions true "Data mapping property options"
//	@Security     OAuth2Application[createDataMapping] "The required scope for this endpoint"
//	@Produce      json
//	@Success      200  {object}	[]data_mapping.DataMapping "Created data mapping property"
//	@Failure      400  {object}	map[string]any "Bad request"
//	@Failure      401  {object}	map[string]any "Unauthorized"
//	@Failure      500  {object}	map[string]any "Internal server error"
//	@Router       /projects/{project_id}/data-mapping/properties [post]
func dataMappingPropertyCreateHandler(w http.ResponseWriter, r *http.Request) {
	projectID := mux.Vars(r)["project_id"]
	var opts data_mapping.CreateOptions

	if err := json.NewDecoder(r.Body).Decode(&opts); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}
	opts.ProjectID = projectID

	props, err := dataMappingRepo.Create(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, props)
}

// dataMappingDeleteHandler deletes a data mapping for a specific project and device.
//
//	@Summary      Delete data mapping
//	@Description  Delete a data mapping for a project and device
//	@Tags         Data Mappings
//	@Accept       json
//	@Param        project_id path string true "Project ID"
//	@Param        data-mapping path string true "Data Mapping ID"
//	@Security 	  OAuth2Application[deleteDataMapping]
//	@Produce      json
//	@Success      200  {object}	nil "No content"
//	@Failure      400  {object}	map[string]any "Bad request"
//	@Failure      401  {object}	map[string]any "Unauthorized"
//	@Failure      500  {object}	map[string]any "Internal server error"
//	@Router       /projects/{project_id}/data-mapping/{data-mapping} [delete]
func dataMappingDeleteHandler(w http.ResponseWriter, r *http.Request) {
	opts := data_mapping.DeleteOptions{
		ProjectID: mux.Vars(r)["project_id"],
		ID:        mux.Vars(r)["device_id"],
	}

	if err := dataMappingRepo.Delete(opts); err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, nil)
}

// dataMappingUpdateHandler updates the data mapping for a device.
//
//	@Summary      Update data mapping
//	@Description  Update the data mapping for a device
//	@Tags         Data Mappings
//	@Accept       json
//	@Param        data-mapping path string true "Data Mapping ID"
//	@Param        opts body data_mapping.UpdateOptions true "Data mapping update options"
//	@Security     OAuth2Application[deleteDataMapping] "The required scope for this endpoint"
//	@Produce      json
//	@Success      200  {object}  data_mapping.DataMapping "Updated Data Mapping"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/data-mapping/{data-mapping} [put]
func dataMappingUpdateHandler(w http.ResponseWriter, r *http.Request) {
	device_id := mux.Vars(r)["device_id"]
	var opts data_mapping.UpdateOptions

	if err := json.NewDecoder(r.Body).Decode(&opts); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}
	opts.ID = device_id

	dataMapping, err := dataMappingRepo.Update(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, dataMapping)
}

func dataMappingChargingStationReportHandler(w http.ResponseWriter, r *http.Request) {
	opts := data_mapping.ChargingStationReportOptions{
		UserID:    r.Header.Get("x-user"),
		ProjectID: mux.Vars(r)["project_id"],
	}

	start := r.URL.Query().Get("start")
	if start != "" {
		startParsed, err := strconv.ParseInt(start, 10, 64)
		if err != nil {
			reject(w, r, http.StatusBadRequest, "Invalid start parameter")
			return
		}
		opts.Start = time.Unix(startParsed, 0)
	} else {
		opts.Start = time.Now().Add(-7 * 24 * time.Hour)
	}

	end := r.URL.Query().Get("end")
	if end != "" {
		endParsed, err := strconv.ParseInt(end, 10, 64)
		if err != nil {
			reject(w, r, http.StatusBadRequest, "Invalid end parameter")
			return
		}
		opts.End = time.Unix(endParsed, 0)
	} else {
		opts.End = time.Now()

	}

	report, err := dataMappingRepo.ChargingStationReport(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, report)
}
