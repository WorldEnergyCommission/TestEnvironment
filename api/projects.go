package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/efficientIO/efficientIO/api/pkg/resource/member"
	"github.com/efficientIO/efficientIO/api/pkg/resource/project"
	"github.com/efficientIO/efficientIO/api/pkg/resource/user"
	"github.com/efficientIO/efficientIO/api/pkg/utils"

	"github.com/gorilla/mux"
)

// projectsListHandler handles the request for listing projects.
// @Summary      List projects
//
//	@Description  List all projects for a user
//	@Tags         Projects
//	@Security     OAuth2Application[listProject]
//	@Produce      json
//	@Success      200  {object}  []project.Project "List of projects"
//	@Failure      400  {object}  map[string]any
//	@Failure      500  {object}  map[string]any
//	@Router       /projects [get]
func projectsListHandler(w http.ResponseWriter, r *http.Request) {
	userId := r.Header.Get("x-user")
	realmID := r.Header.Get("x-realm")

	opts := project.ListOptions{UserID: userId, Realm: realmID}

	projects, err := projectRepo.List(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, projects)
}

// projectsCreateHandler creates a new project for the authenticated user.
// @Summary      Create project
//
//	@Description  Create a new project for the authenticated user
//	@Tags         Projects
//	@Accept       json
//	@Param        opts body project.CreateOptions true "Project creation options"
//	@Security     OAuth2Application[createProject]
//	@Produce      json
//	@Success      200  {object}  project.Project "Created project"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects [post]
func projectsCreateHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("x-user")
	realmID := r.Header.Get("x-realm")

	var opts project.CreateOptions
	err := json.NewDecoder(r.Body).Decode(&opts)
	if err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}
	opts.Realm = realmID
	opts.UserID = userID

	// now get the user and check if he has already reached his project quota
	u, err := userRepo.Get(user.GetOptions{Realm: realmID, ID: userID, PrivateInfo: true})
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	pc, err := userRepo.ProjectCount(user.ProjectCountOptions{ID: u.ID})
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	if pc >= u.Limits.Projects {
		reject(w, r, http.StatusBadRequest, "user has project limit reached")
		return
	}

	p, err := projectRepo.Create(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	hasPlatformAdminRole, _ := authRepo.HasUserPlatformRole(getToken(r), "adminUser")

	if !hasPlatformAdminRole {
		_, err = memberRepo.Create(member.CreateOptions{ID: userID, Role: "projectAdmin", ProjectID: p.ID, Realm: realmID})
		if err != nil {
			reject(w, r, http.StatusInternalServerError, err.Error())
			return
		}

	}

	respond(w, http.StatusOK, p)
}

// projectsGetHandler retrieves a project by its ID and sends the response back to the client.
// @Summary      Get project by ID
//
//	@Description  Retrieves a project by its ID
//	@Tags         Projects
//	@Accept       json
//	@Param        project_id path string true "Project ID"
//	@Security     OAuth2Application[readProject]
//	@Produce      json
//	@Success      200  {object} 	project.Project "Project details"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id} [get]
func projectsGetHandler(w http.ResponseWriter, r *http.Request) {
	projectID := mux.Vars(r)["project_id"]
	opts := project.GetOptions{ID: projectID}

	p, err := projectRepo.Get(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, p)
}

// projectsMQTTSecretHandler retrieves the MQTT secret for a specific project.
// @Summary      Retrieve MQTT secret
//
//	@Description  Retrieves the MQTT secret for a specific project.
//	@Tags         Projects
//	@Accept       json
//	@Param        project_id path string true "Project ID"
//	@Security     OAuth2Application[readMQTTSecret]
//	@Produce      json
//	@Success      200  {string}  string "MQTT secret"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/mqtt-secret [get]
func projectsMQTTSecretHandler(w http.ResponseWriter, r *http.Request) {
	projectID := mux.Vars(r)["project_id"]
	opts := project.GetOptions{ID: projectID, WithSecret: true}

	p, err := projectRepo.Get(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, p.Secret)
}

// projectsUpdateHandler updates a project with the provided options.
// @Summary      Update a project
//
//	@Description  Update a project with the provided options
//	@Tags         Projects
//	@Accept       json
//	@Param        project_id path string true "Project ID"
//	@Param        opts body project.UpdateOptions true "Update options"
//	@Security     OAuth2Application[writeProject]
//	@Produce      json
//	@Success      200  {object}  project.Project "Updated project"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id} [put]
func projectsUpdateHandler(w http.ResponseWriter, r *http.Request) {
	var opts project.UpdateOptions

	if err := json.NewDecoder(r.Body).Decode(&opts); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	if len(opts.Connectivity.Actions) > 5 {
		reject(w, r, http.StatusInternalServerError, "cannot have more than 5 actions")
		return
	}
	for _, a := range opts.Connectivity.Actions {
		if err := a.Validate(); err != nil {
			reject(w, r, http.StatusBadRequest, err.Error())
			return
		}
	}

	opts.ID = mux.Vars(r)["project_id"]

	p, err := projectRepo.Update(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, p)
}

// projectsDeleteHandler deletes a project and its associated assets
// @Summary      Delete a project and its assets
//
//	@Description  Deletes a project and its associated assets from the system
//	@Tags         Projects
//	@Accept       json
//	@Param        project_id path string true "ID of the project to delete"
//	@Security     OAuth2Application[deleteProject]
//	@Produce      json
//	@Success      200  {object}  map[string]interface{} "Success response"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id} [delete]
func projectsDeleteHandler(w http.ResponseWriter, r *http.Request) {
	projectId := mux.Vars(r)["project_id"]

	err := assetRepo.DeleteAssetsForProject(projectId)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	err = projectRepo.DeleteProjectComplete(projectId)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}
}

// projectsGetCurrentOperatingHoursHandler retrieves the current operating hours for a project.
// @Summary      Get current operating hours
//
//	@Description  Retrieves the current operating hours for a project.
//	@Tags         Projects
//	@Accept       json
//	@Param        project_id path string true "Project ID"
//	@Security     OAuth2Application[readProject]
//	@Produce      json
//	@Success      200  {object}  []project.OperatingHours "Current operating hours"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/operating-hours [get]
func projectsGetCurrentOperatingHoursHandler(w http.ResponseWriter, r *http.Request) {
	projectId := mux.Vars(r)["project_id"]

	operatingHours, err := projectRepo.GetCurrentOperatingHours(projectId)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, operatingHours)
}

// projectsAddOperatingHoursHandler adds operating hours to a project.
// @Summary      Add operating hours
//
//	@Description  Add operating hours to a project
//	@Tags         Projects
//	@Accept       json
//	@Param        project_id path string true "The ID of the project"
//	@Param        data body string true "The operating hours data"
//	@Security     OAuth2Application[writeProject]
//	@Produce      json
//	@Success      200  {object}  map[string]interface{} "Operating hours added successfully"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/operating-hours [post]
func projectsAddOperatingHoursHandler(w http.ResponseWriter, r *http.Request) {
	projectId := mux.Vars(r)["project_id"]
	userID := r.Header.Get("x-user")

	data, err := io.ReadAll(r.Body)
	if err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	operatingHours, err := projectRepo.AddOperatingHours(projectId, userID, string(data[:]))
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, operatingHours)
}

type projectMachineReadableRequestBody struct {
	Username  string `json:"username"`
	Passsword string `json:"password"`
}

// projectsGetCurrentOperatingHoursMachineReadableHandler handles the HTTP request to retrieve the current operating hours in a machine-readable format for a specific project.
// @Summary      Get current operating hours (machine-readable)
//
//	@Description  Retrieves the current operating hours for a project in a machine-readable format.
//	@Tags         Projects
//	@Accept       json
//	@Param        project_id path string true "Project ID"
//	@Param        body body projectMachineReadableRequestBody true "Request body"
//	@Produce      json
//	@Success      200  {object}  map[string]interface{} "Machine-readable operating hours"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/operating-hours/machine-readable [get]
func projectsGetCurrentOperatingHoursMachineReadableHandler(w http.ResponseWriter, r *http.Request) {
	projectId := mux.Vars(r)["project_id"]

	var opts projectMachineReadableRequestBody

	if err := json.NewDecoder(r.Body).Decode(&opts); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	if err := projectRepo.AuthorizeWithProjectSecret(opts.Username, opts.Passsword); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	operatingHours, err := projectRepo.GetCurrentOperatingHours(projectId)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	machine_readable_map := operatingHours.Data["operating_hours"]

	respond(w, http.StatusOK, machine_readable_map)
}

// projectsGetCurrentHolidaysHandler handles the HTTP request to get the current holidays for a project.
// @Summary      Get current holidays for a project
//
//	@Description  Retrieves the current holidays for the specified project.
//	@Tags         Projects
//	@Accept       json
//	@Param        project_id path string true "The ID of the project"
//	@Security     OAuth2Application[readProject]
//	@Produce      json
//	@Success      200  {object} 	[]project.Holidays "Current holidays for the project"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/holidays [get]
func projectsGetCurrentHolidaysHandler(w http.ResponseWriter, r *http.Request) {
	projectId := mux.Vars(r)["project_id"]

	operatingHours, err := projectRepo.GetCurrentHolidays(projectId)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, operatingHours)
}

// projectsAddHolidaysHandler adds holidays to a project.
// @Summary      Add holidays to a project
//
//	@Description  This endpoint adds holidays to a project identified by the project ID.
//	@Tags         Projects
//	@Accept       json
//	@Param        project_id path string true "The ID of the project"
//	@Param        data body string true "The holidays data"
//	@Security     OAuth2Application[writeProject]
//	@Produce      json
//	@Success      200  {object} 	project.Holidays "Updated operating hours"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/holidays [post]
func projectsAddHolidaysHandler(w http.ResponseWriter, r *http.Request) {
	projectId := mux.Vars(r)["project_id"]
	userID := r.Header.Get("x-user")

	data, err := io.ReadAll(r.Body)
	if err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	operatingHours, err := projectRepo.AddHolidays(projectId, userID, string(data[:]))
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, operatingHours)
}

// repsone from open holidays api
type HolidayApiResponse struct {
	Id         string              `json:"id"`
	StartDate  string              `json:"startDate"`
	EndDate    string              `json:"endDate"`
	Type       string              `json:"type"`
	Name       []map[string]string `json:"name"`
	Nationwide bool                `json:"nationwide"`
}

// projectsCurrentHolidaysMachineReadable retrieves the current holidays in machine-readable format for a specific project.
// @Summary      Retrieve current holidays (machine-readable)
//
//	@Description  Retrieves the current holidays in machine-readable format for a specific project.
//	@Tags         Projects
//	@Accept       json
//	@Param        project_id path string true "Project ID"
//	@Param        body body projectMachineReadableRequestBody true "Request body"
//	@Produce      json
//	@Success      200  {array}  string "Array of current holidays"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/holidays/machine-readable [post]
func projectsCurrentHolidaysMachineReadable(w http.ResponseWriter, r *http.Request) {
	l := utils.GetLogger()
	projectId := mux.Vars(r)["project_id"]

	var opts projectMachineReadableRequestBody

	if err := json.NewDecoder(r.Body).Decode(&opts); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	if err := projectRepo.AuthorizeWithProjectSecret(opts.Username, opts.Passsword); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	project_holidays, err := projectRepo.GetCurrentHolidays(projectId)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	// if nil, it is not set
	// returning empty array with no holidays
	if project_holidays.Data == nil {
		l.Debug().Msg("project_holidays.Data is nil")
		respond(w, http.StatusOK, []string{})
		return
	}

	if enabled, cast_ok := project_holidays.Data["holiday_calender_enabled"].(bool); !cast_ok || !enabled {
		l.Debug().Bool("enabled", enabled).Bool("cast_ok", cast_ok).Msg("holiday_calender_enabled is nil")
		respond(w, http.StatusOK, []string{})
		return
	}

	select_calender, cast_calender_ok := project_holidays.Data["holiday_calender"].(string)

	if !cast_calender_ok {
		l.Debug().Str("calender", fmt.Sprintf("%v", project_holidays.Data["holiday_calender"])).Msg("cast_calender_err")
		respond(w, http.StatusOK, []string{})
		return
	}

	currentyear := time.Time.Year(time.Now())
	url := fmt.Sprintf("https://openholidaysapi.org/PublicHolidays?countryIsoCode=%s&validFrom=%d-01-01&validTo=%d-12-31",
		strings.ToUpper(select_calender), currentyear, currentyear)

	l.Debug().Str("url", url).Msg("")

	api_resp, err := utils.MakeHttpRequest[[]HolidayApiResponse]("GET", url, nil, http.Header{
		"accept": {"text/plain"},
	}, false)

	l.Debug().Str("resp", fmt.Sprintf("%v", api_resp)).Msg("")

	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	responseDates := []string{}

	for _, holiday := range api_resp {
		responseDates = append(responseDates, holiday.StartDate)
	}

	customHolidays, ok := project_holidays.Data["customHolidays"].([]interface{})
	if ok {
		for _, holiday := range customHolidays {
			if holidayMap, ok := holiday.(map[string]interface{}); ok {
				if date, ok := holidayMap["date"].(string); ok {
					responseDates = append(responseDates, date)
				}
			}
		}
	}

	respond(w, http.StatusOK, responseDates)
}
