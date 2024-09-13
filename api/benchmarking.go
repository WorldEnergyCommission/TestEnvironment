package main

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
)

func benchmarkingProjectReportHandler(w http.ResponseWriter, r *http.Request) {
	projectID := mux.Vars(r)["project_id"]
	userID := r.Header.Get("x-user")

	timezone := r.URL.Query().Get("tz")
	if timezone == "" {
		timezone, _ = time.Now().Zone()
	}

	report, err := benchmarkingRepo.GenerateProjectReport(projectID, timezone, envMPCAddr, userID)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	respond(w, http.StatusOK, report)
}

func benchmarkingMultipleReportsHandler(w http.ResponseWriter, r *http.Request) {
	var (
		user_id = r.Header.Get("x-user")
	)

	var project_ids []string
	token := getToken(r)

	if err := json.NewDecoder(r.Body).Decode(&project_ids); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	timezone := r.URL.Query().Get("tz")
	if timezone == "" {
		timezone, _ = time.Now().Zone()
	}

	var reports = make(map[string]map[string]any)

	for _, project_id := range project_ids {
		allowed, auth_error := authRepo.HasProjectPermission(token, project_id, []string{"readProject"})
		if auth_error != nil {
			reject(w, r, http.StatusInternalServerError, auth_error.Error())
			return
		}

		if !allowed {
			reject(w, r, http.StatusUnauthorized, "")
			return
		}
		report, err := benchmarkingRepo.GenerateProjectReport(project_id, timezone, envMPCAddr, user_id)
		if err == nil {
			reports[project_id] = report
		}
	}

	respond(w, http.StatusOK, reports)
}
