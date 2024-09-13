package main

import (
	"encoding/json"
	"math"
	"net/http"
	"strconv"

	"github.com/efficientIO/efficientIO/api/pkg/resource/alert"
	"github.com/gorilla/mux"
)

// alertsCreateHandler creates an alert for a project based on the provided options.
//
//	@Summary      Create an alert
//	@Description  Create an alert for a project
//	@Tags         Alerts
//	@Accept       json
//	@Param        opts body alert.CreateOptions true "The options for creating the alert"
//	@Produce      json
//	@Success      200 {object} alert.Alert "The created alert"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/alerts [post]
func alertsCreateHandler(w http.ResponseWriter, r *http.Request) {
	var opts alert.CreateOptions
	if err := json.NewDecoder(r.Body).Decode(&opts); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}
	opts.ProjectID = mux.Vars(r)["project_id"]

	if opts.Type < 0 || opts.Type > 2 {
		reject(w, r, http.StatusBadRequest, "invalid type")
		return
	}

	a, err := alertRepo.Create(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, a)
}

// alertsAcceptHandler accepts an alert for a specific project and alert ID.
//
//	@Summary      Accept alert
//	@Description  Accepts an alert for a specific project and alert ID.
//	@Tags         Alerts
//	@Accept       json
//	@Param        project_id path string true "Project ID"
//	@Param        alert_id path string true "Alert ID"
//	@Security     OAuth2Application[writeAlerts]
//	@Produce      json
//	@Success      200  {object}  alert.Alert "Accepted alert"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/alerts/{alert_id}/accept [post]
func alertsAcceptHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	user := r.Header.Get("x-user")
	opts := alert.AcceptOptions{
		ProjectID: vars["project_id"],
		ID:        vars["alert_id"],
	}
	opts.AcceptedBy = user

	a, err := alertRepo.Accept(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, a)
}

// alertAcceptAllHandler accepts all alerts for a specific project and user.
//
//	@Summary      Accept all alerts
//	@Description  Accepts all alerts for a specific project and user.
//	@Tags         Alerts
//	@Accept       json
//	@Param        project_id path string true "Project ID"
//	@Security     OAuth2Application[writeProject]
//	@Produce      json
//	@Success      200  {object}  nil "All alerts accepted for the project"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/alerts [post]
func alertAcceptAllHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("x-user")
	projectID := mux.Vars(r)["project_id"]

	if err := alertRepo.AcceptAll(alert.AcceptAllOptions{ProjectID: projectID, AcceptedBy: userID}); err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
	}
}

type AlertListResponse struct {
	// Number of pages for the alerts
	Pages float64 `json:"pages"`
	// List of alerts for the requested page
	Data []alert.Alert `json:"data"`
} // @name AlertListResponse

// alertsListHandler with pagination
// alertsListHandler handles the request to list alerts.
//
//	@Summary      List alerts
//	@Description  List alerts for a project
//	@Tags         Alerts
//	@Accept       json
//	@Param        project_id path string true "Project ID"
//	@Param        accepted query bool false "Accepted option"
//	@Param        page query int false "Page number"
//	@Security     OAuth2Application[listAlert]
//	@Produce      json
//	@Success      200  {object}  main.AlertListResponse "Alerts list"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/alerts [get]
func alertsListHandler(w http.ResponseWriter, r *http.Request) {
	var accepted *bool
	if val := r.URL.Query().Get("accepted"); val != "" {
		var temp bool

		if val == "true" {
			temp = true
		}
		accepted = &temp
	}

	page, err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil {
		page = 1
	}

	limit := 20
	startIndex := (page - 1) * limit

	opts := alert.ListOptions{
		ProjectID: mux.Vars(r)["project_id"],
		Limit:     limit,
		Offset:    startIndex,
		Filter: struct {
			Accepted *bool `json:"accepted"`
		}{
			Accepted: accepted,
		},
	}

	alerts, err := alertRepo.List(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	count, err := alertRepo.Count(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, AlertListResponse{
		Pages: math.Ceil(float64(count) / float64(limit)),
		Data:  alerts,
	})
}

// alertsSummaryHandler retrieves a summary of alerts for the specified projects.
//
//	@Summary      Retrieve alerts summary
//	@Description  Retrieves a summary of alerts for the specified projects.
//	@Tags         Alerts
//	@Accept       json
//	@Param        project_ids body []string true "The IDs of the projects to retrieve alerts for"
//	@Security     OAuth2Application
//	@Produce      json
//	@Param        count query int false "The maximum number of alerts to retrieve (default: 5)"
//	@Success      200  {object}  []alert.Alert "Summary of alerts"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /alerts/summary [post]
func alertsSummaryHandler(w http.ResponseWriter, r *http.Request) {
	user := r.Header.Get("x-user")
	var project_ids []string
	if err := json.NewDecoder(r.Body).Decode(&project_ids); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	count, err := strconv.Atoi(r.URL.Query().Get("count"))
	if err != nil {
		count = 5
	}

	opts := alert.SummaryOptions{
		ProjectIDs: &project_ids,
		Limit:      count,
		UserID:     user,
	}

	alerts, err := alertRepo.Summary(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, alerts)
}
