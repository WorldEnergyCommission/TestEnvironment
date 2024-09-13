package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/eneries/eneries/api/pkg/resource/report"

	"github.com/gorilla/mux"
)

// reportsCreateHandler creates a report for the specified project.
//
//	@Summary      Create a report
//	@Description  Create a report for a project
//	@Tags         Reports
//	@Accept       json
//	@Param        project_id path string true "Project ID"
//	@Param        opts body report.CreateOptions true "Report creation options"
//	@Security     OAuth2Application[createReport]
//	@Produce      json
//	@Success      200  {object}  report.Report "Created report"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/reports [post]
func reportsCreateHandler(w http.ResponseWriter, r *http.Request) {
	projectID := mux.Vars(r)["project_id"]

	var opts report.CreateOptions
	if err := json.NewDecoder(r.Body).Decode(&opts); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}
	opts.ProjectID = projectID

	report, err := reportRepo.Create(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, report)
}

// reportsListHandler handles the HTTP request to list reports.
//
//	@Summary      List reports
//	@Description  List reports for a project
//	@Tags         Reports
//	@Accept       json
//	@Produce      json
//	@Param        project_id path string true "Project ID"
//	@Security     OAuth2Application[listReport]
//	@Success      200  {object}  []report.Report "List of reports"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/reports [get]
func reportsListHandler(w http.ResponseWriter, r *http.Request) {
	opts := report.ListOptions{ProjectID: mux.Vars(r)["project_id"], UserID: r.Header.Get("x-user")}

	reports, err := reportRepo.List(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, reports)
}

// reportsGetHandler retrieves a report based on the provided report ID, start time, end time, and format.
//
//	@Summary      Retrieve a report
//	@Description  Retrieve a report based on the provided report ID, start time, end time, and format.
//	@Tags         Reports
//	@Accept       json
//	@Param        report_id path string true "Report ID"
//	@Param        start query int64 true "Start time in Unix timestamp format"
//	@Param        end query int64 true "End time in Unix timestamp format"
//	@Param        format query string true "Report format"
//	@Param        action query bool false "Action flag"
//	@Security     OAuth2Application[readReport]
//	@Produce      json
//	@Success      200  {object}  []byte "Report data, either csv, json or pdf"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/reports/{report_id} [get]
func reportsGetHandler(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["report_id"]

	// set start and end unix time
	val, err := strconv.ParseInt(r.URL.Query().Get("start"), 10, 64)
	if err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}
	start := time.Unix(val, 0)

	val, err = strconv.ParseInt(r.URL.Query().Get("end"), 10, 64)
	if err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}
	end := time.Unix(val, 0)

	// just some important checks
	if end.Before(start) {
		reject(w, r, http.StatusBadRequest, "end cannot be greater than start")
	}
	if end.Sub(start) > time.Hour*8760 {
		reject(w, r, http.StatusBadRequest, "difference between start and end cannot be greater than 1 year")
	}

	reqUrl := fmt.Sprintf("http://%s/report?id=%s&start=%d&end=%d&format=%s",
		envReportAddr, id, start.Unix(), end.Unix(),
		r.URL.Query().Get("format"))
	if r.URL.Query().Get("action") != "" {
		reqUrl += "&action=true"
	}
	resp, err := http.Get(reqUrl)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	io.Copy(w, resp.Body)
}

// reportsUpdateHandler updates a report with the specified options.
//
//	@Summary      Update a report
//	@Description  Update a report with the specified options
//	@Tags         Reports
//	@Accept       json
//	@Param        project_id path string true "The ID of the project"
//	@Param        report_id path string true "The ID of the report"
//	@Param        opts body report.UpdateOptions true "The options for updating the report"
//	@Security     OAuth2Application[writeReport]
//	@Produce      json
//	@Success      200  {object}  report.Report "The updated report"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/reports/{report_id} [put]
func reportsUpdateHandler(w http.ResponseWriter, r *http.Request) {
	var opts report.UpdateOptions

	if err := json.NewDecoder(r.Body).Decode(&opts); err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	opts.ProjectID = mux.Vars(r)["project_id"]
	opts.ID = mux.Vars(r)["report_id"]

	rep, err := reportRepo.Update(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, rep)
}

// reportsDeleteHandler deletes a report by its ID for a specific project.
//
//	@Summary      Delete a report
//	@Description  Delete a report by its ID for a specific project
//	@Tags         Reports
//	@Accept       json
//	@Param        project_id path string true "Project ID"
//	@Param        report_id path string true "Report ID"
//	@Security     OAuth2Application[deleteReport]
//	@Produce      json
//	@Success      200  {object}  nil "Report deleted"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/reports/{report_id} [delete]
func reportsDeleteHandler(w http.ResponseWriter, r *http.Request) {
	projectID, ID := mux.Vars(r)["project_id"], mux.Vars(r)["report_id"]

	if err := reportRepo.Delete(report.DeleteOptions{ID: ID, ProjectID: projectID}); err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
	}
}
