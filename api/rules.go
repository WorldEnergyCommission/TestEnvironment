package main

import (
	"encoding/json"
	"io/ioutil"
	"net/http"

	"github.com/efficientIO/efficientIO/api/pkg/resource/rule"

	"github.com/gorilla/mux"
)

// rulesCreateHandler creates rules for a project based on the request body.
//
//	@Summary      Create rules
//	@Description  Create rules for a project
//	@Tags         Rules
//	@Accept       json
//	@Param        project_id path string true "Project ID"
//	@Param        data body []rule.CreateOptions true "The rules to create"
//	@Produce      json
//	@Security     OAuth2Application[createRule]
//	@Success      200  {object}  []rule.Rule "Created rules"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/rules [post]
func rulesCreateHandler(w http.ResponseWriter, r *http.Request) {
	projectID := mux.Vars(r)["project_id"]

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	// multiple rules
	if body[0] == '[' {
		var (
			rulesOpts []rule.CreateOptions
			rules     []rule.Rule
		)
		if err := json.Unmarshal(body, &rulesOpts); err != nil {
			reject(w, r, http.StatusInternalServerError, err.Error())
			return
		}

		for i := range rulesOpts {
			rulesOpts[i].ProjectID = projectID

			err := rule.Validate(rule.ValidateOptions{
				ProjectID:  rulesOpts[i].ProjectID,
				Name:       rulesOpts[i].Name,
				Active:     rulesOpts[i].Active,
				Timeout:    rulesOpts[i].Timeout,
				Conditions: rulesOpts[i].Conditions,
				Actions:    rulesOpts[i].Actions,
				Schedule:   rulesOpts[i].Schedule,
			})
			if err != nil {
				reject(w, r, http.StatusBadRequest, err.Error())
				return
			}
		}

		// keep the creation separated to have a better flow:
		// first check all rules, then create them
		for i := range rulesOpts {
			rul, err := ruleRepo.Create(rulesOpts[i])
			if err != nil {
				reject(w, r, http.StatusInternalServerError, err.Error())
				return
			}

			rules = append(rules, *rul)
		}

		respond(w, http.StatusOK, rules)
		return
	}

	// by default a single rule
	var opts rule.CreateOptions
	if err := json.Unmarshal(body, &opts); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}
	opts.ProjectID = mux.Vars(r)["project_id"]

	// TODO: think about something better
	err = rule.Validate(rule.ValidateOptions{
		ProjectID:  opts.ProjectID,
		Name:       opts.Name,
		Active:     opts.Active,
		Timeout:    opts.Timeout,
		Conditions: opts.Conditions,
		Actions:    opts.Actions,
	})
	if err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	rul, err := ruleRepo.Create(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, rul)
}

// rulesListHandler handles the HTTP request for listing rules.
//
//	@Summary      List rules
//	@Description  List rules for a project
//	@Tags         Rules
//	@Accept       json
//	@Produce      json
//	@Param        project_id path string true "Project ID"
//	@Security     OAuth2Application[listRule]
//	@Success      200 	{array} 	[]rule.Rule "List of rules"
//	@Failure      400  	{object}  	map[string]any "Bad request"
//	@Failure      401  	{object}  	map[string]any "Unauthorized"
//	@Failure      500  	{object}  	map[string]any "Internal server error"
//	@Router       /projects/{project_id}/rules [get]
func rulesListHandler(w http.ResponseWriter, r *http.Request) {
	rul, err := ruleRepo.List(rule.ListOptions{ProjectID: mux.Vars(r)["project_id"], UserID: r.Header.Get("x-user")})
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, rul)
}

// rulesDeleteHandler deletes a rule for a specific project.
//
//	@Summary      Delete a rule
//	@Description  Delete a rule for a project
//	@Tags         Rules
//	@Accept       json
//	@Param        project_id path string true "The ID of the project"
//	@Param        rule_id path string true "The ID of the rule"
//	@Security     OAuth2Application[deleteRule,deleteAI]
//	@Produce      json
//	@Success      200  {object}  nil "Success response"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/rules/{rule_id} [delete]
func rulesDeleteHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	project := vars["project_id"]
	rule1 := vars["rule_id"]

	if err := ruleRepo.Delete(rule.DeleteOptions{ProjectID: project, ID: rule1}); err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}
}

// rulesUpdateHandler updates a rule with the specified ID in the given project.
//
//	@Summary      Update a rule
//	@Description  Update a rule in a project
//	@Tags         Rules
//	@Accept       json
//	@Param        project_id path string true "The ID of the project"
//	@Param        rule_id path string true "The ID of the rule"
//	@Param        opts body rule.UpdateOptions true "The options for updating the rule"
//	@Security     OAuth2Application[writeRule,writeAI]
//	@Produce      json
//	@Success      200  {object}  rule.Rule "The updated rule"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/rules/{rule_id} [put]
func rulesUpdateHandler(w http.ResponseWriter, r *http.Request) {
	var opts rule.UpdateOptions
	if err := json.NewDecoder(r.Body).Decode(&opts); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	vars := mux.Vars(r)
	opts.ProjectID = vars["project_id"]
	opts.ID = vars["rule_id"]

	if err := rule.Validate(opts); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	rul, err := ruleRepo.Update(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, rul)
}
