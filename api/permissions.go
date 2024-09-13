package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/eneries/eneries/api/pkg/utils"

	"github.com/gorilla/mux"
)

type (
	CreateAdditonalPermissionsForMemberRequest struct {
		Permissions []string `json:"permissions"`
		Scopes      []string `json:"scopes,omitempty"`
		Wildcard    bool     `json:"wildcard,omitempty"`
	}
	DeleteAdditonalPermissionsForMemberRequest struct {
		Permission string `json:"permission"`
		Scope      string `json:"scope_id,omitempty"`
	}
)

// permissionsListHandler handles the HTTP request to list all possible permissions.
//
//	@Summary      List permissions
//	@Description  List all possible permissions
//	@Tags         Permissions
//	@Accept       json
//	@Produce      json
//	@Security     OAuth2Application[readPermission]
//	@Success      200  {object}  []permission.Permission "List of permissions"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /permissions [get]
func permissionsListHandler(w http.ResponseWriter, r *http.Request) {
	permissions, err := permissionRepo.ListPermissions()
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
	}
	respond(w, 200, permissions)
}

// permissionsListGroupsHandler handles the HTTP request to list all possible permission groups.
//
//	@Summary      List groups
//	@Description  List all possible permission  groups
//	@Tags         Permissions
//	@Accept       json
//	@Produce      json
//	@Security     OAuth2Application[readPermission]
//	@Success      200  {object}  []string "List of groups"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /permissions/groups [get]
func permissionsListGroupsHandler(w http.ResponseWriter, r *http.Request) {
	groups, err := permissionRepo.ListGroups()
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
	}
	respond(w, 200, groups)
}

// permissionsGetPlatformPermissionsForUserHandler retrieves platform permissions for a user.
//
//	@Summary      Get platform permissions for a user
//	@Description  Retrieves the platform permissions for a user based on the authentication.
//	@Tags         Users
//	@Accept       json
//	@Produce      json
//	@Success      200  {object}  []string "Platform permissions"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /users/me/permissions [get]
func permissionsGetPlatformPermissionsForUserHandler(w http.ResponseWriter, r *http.Request) {
	userId := r.Header.Get("x-user")
	realm := r.Header.Get("x-realm")

	permissions, err := permissionRepo.ListPlatformPermissionForUser(userId, realm)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
	}
	respond(w, 200, permissions)
}

// permissionsGetAdditionalPermissionsForMemberHandler retrieves additional permissions for a member in a project.
//
//	@Summary      Get additional permissions for a member
//
//	@Description  Retrieves additional permissions for a member in a project.
//	@Tags         Members
//	@Accept       json
//	@Param        member_id path string true "Member ID"
//	@Param        project_id path string true "Project ID"
//	@Produce      json
//	@Success      200  {object}  []permission.Permission "Additional permissions"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/members/{member_id}/permissions [get]
func permissionsGetAdditionalPermissionsForMemberHandler(w http.ResponseWriter, r *http.Request) {
	memberID := mux.Vars(r)["member_id"]
	project_id := mux.Vars(r)["project_id"]

	permissions, err := permissionRepo.ListAdditionalPermissionsForMember(project_id, memberID)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
	}
	respond(w, 200, permissions)
}

// permissionsCreateAdditionalPermissionsForMemberHandler creates additional permissions for a member in a project.
//
//	@Summary      Create additional permissions for member
//
//	@Description  Create additional permissions for a member in a project
//	@Tags         Members
//	@Accept       json
//	@Param        member_id path string true "Member ID"
//	@Param        project_id path string true "Project ID"
//	@Param        data body CreateAdditonalPermissionsForMemberRequest true "Request body"
//	@Produce      json
//	@Success      200  {object}  []permission.Permission "List of additional permissions"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/members/{member_id}/permissions [post]
func permissionsCreateAdditionalPermissionsForMemberHandler(w http.ResponseWriter, r *http.Request) {
	memberID := mux.Vars(r)["member_id"]
	project_id := mux.Vars(r)["project_id"]
	realm := r.Header.Get("x-realm")

	var err error

	requestData := CreateAdditonalPermissionsForMemberRequest{Wildcard: false}
	if err = json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		reject(w, r, http.StatusBadRequest, "")
		return
	}

	// TODO: check role (e.g. no added permissions for admin)
	for _, permission_id := range requestData.Permissions {
		if requestData.Wildcard {
			err = permissionRepo.AddScopedPermissionForPojectUser(project_id, memberID, realm, permission_id, "", requestData.Wildcard) // TODO: Should this be handled?
			if err != nil {
				utils.LogError(err, "")
			}
		}

		for _, scope := range requestData.Scopes {
			err = permissionRepo.AddScopedPermissionForPojectUser(project_id, memberID, realm, permission_id, scope, false) // TODO: Should this be handled?
			if err != nil {
				utils.LogError(err, "")
			}
		}
	}

	permissions, err := permissionRepo.ListAdditionalPermissionsForMember(project_id, memberID)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
	}

	respond(w, 200, permissions)
}

// permissionsDeleteAdditionalPermissionsForMemberHandler deletes additional permissions for a member in a project.
//
//	@Summary      Delete additional permissions for member
//
//	@Description  This endpoint deletes additional permissions for a specific member in a project.
//	@Tags         Members
//	@Accept       json
//	@Param        member_id path string true "Member ID"
//	@Param        project_id path string true "Project ID"
//	@Param        requestData body DeleteAdditonalPermissionsForMemberRequest true "Request data"
//	@Produce      json
//	@Success      200  {object}  map[string]interface{} "Empty response"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/members/{member_id}/permissions [delete]
func permissionsDeleteAdditionalPermissionsForMemberHandler(w http.ResponseWriter, r *http.Request) {
	memberID := mux.Vars(r)["member_id"]
	project_id := mux.Vars(r)["project_id"]

	var err error
	var requestData DeleteAdditonalPermissionsForMemberRequest

	if err = json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		reject(w, r, http.StatusBadRequest, "")
		return
	}

	err = permissionRepo.DeleteScopedPermissionForPojectUser(project_id, memberID, requestData.Permission, requestData.Scope)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error()) // TODO: handle as bad request? maybe custom error to check
	}
	// no response needed (empty response for delete)
}

// permissionListPossibleScopesHandler lists the possible scopes for a permission in a project.
//
//	@Summary      List possible scopes for a permission
//	@Description  This endpoint lists the possible scopes for a permission in a project.
//	@Tags         Permissions
//	@Accept       json
//	@Param        project_id path string true "The ID of the project"
//	@Param        permission_id path string true "The ID of the permission"
//	@Security     OAuth2Application[readPermission] "The required scope for this endpoint"
//	@Produce      json
//	@Success      200  {object}  []string "List of possible scopes"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/permissions/{permission_id}/scopes [get]
func permissionListPossibleScopesHandler(w http.ResponseWriter, r *http.Request) {
	// TODO: remove or add new columns?
	project_id := mux.Vars(r)["project_id"]
	permission_id := mux.Vars(r)["permission_id"]

	scopes, err := permissionRepo.ListPossibleScopes(project_id, permission_id)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
	}
	respond(w, 200, scopes)
}

// check if given permission (platform role based) is true, if yes resume request, if not reject
func handleWithPermission(op func(http.ResponseWriter, *http.Request), permission string) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		token := getToken(r)
		allowed, auth_error := authRepo.HasPlatformPermission(token, []string{permission})
		handleRequestOperation(allowed, auth_error, fmt.Sprintf("Token: %s \n invalid for permission: %s.", token, permission), w, r, op)
	}
}

// check if given permission for project is true, if yes resume request, if not reject
func handleWithProjectPermission(op func(http.ResponseWriter, *http.Request), permission string) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		token := getToken(r)
		project_id := mux.Vars(r)["project_id"]
		allowed, auth_error := authRepo.HasProjectPermission(token, project_id, []string{permission})
		handleRequestOperation(allowed, auth_error, fmt.Sprintf("Token: %s \n invalid for permission: %s.", token, permission), w, r, op)
	}
}

// check if given permission (project role based or additional permission) is true, if yes resume request, if not reject
func handleWithScopedPermission(op func(http.ResponseWriter, *http.Request), permission string, scope_path_key string, scope_db_key string) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		token := getToken(r)
		project_id := mux.Vars(r)["project_id"]
		scope := mux.Vars(r)[scope_path_key]
		allowed, auth_error := authRepo.HasSpecificProjectPermission(token, project_id, []string{permission}, scope_db_key, scope)
		handleRequestOperation(allowed, auth_error, fmt.Sprintf("Token: %s \n invalid for permission: %s.", token, permission), w, r, op)
	}
}

func handleWithOneOfMeasurementDevicePermission(op func(http.ResponseWriter, *http.Request), permissions []string, scope_path_key string) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		token := getToken(r)
		project_id := mux.Vars(r)["project_id"]
		scope := mux.Vars(r)[scope_path_key]
		allowed, auth_error := authRepo.HasOneOfSpecificMeasurementDevicePermissions(token, project_id, permissions, scope)
		handleRequestOperation(allowed, auth_error, fmt.Sprintf("Token: %s \n invalid for permission: %s.", token, strings.Join(permissions, " ")), w, r, op)
	}
}

func handleWithOneOfAIRulePermissions(op func(http.ResponseWriter, *http.Request), permissions []string, scope_path_key string) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		token := getToken(r)
		project_id := mux.Vars(r)["project_id"]
		scope := mux.Vars(r)[scope_path_key]
		allowed, auth_error := authRepo.HasProjectUserAnyPermissionScopedAndMappedAIToRule(token, project_id, permissions, scope)
		handleRequestOperation(allowed, auth_error, fmt.Sprintf("Token: %s \n invalid for permission: %s.", token, permissions), w, r, op)
	}
}

func handleWithCollectionDevicePermission(op func(http.ResponseWriter, *http.Request), permission string, scope_path_key string) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		token := getToken(r)
		project_id := mux.Vars(r)["project_id"]
		scope := mux.Vars(r)[scope_path_key]
		allowed, auth_error := authRepo.HasSpecificCollectionDevicePermission(token, project_id, []string{permission}, scope)
		handleRequestOperation(allowed, auth_error, fmt.Sprintf("Token: %s \n invalid for permission: %s.", token, permission), w, r, op)
	}
}

func handleWithOneOfMeasurementInQueryPermission(op func(http.ResponseWriter, *http.Request), permissions []string) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		token := getToken(r)
		project_id := mux.Vars(r)["project_id"]

		vars := mux.Vars(r)
		scopes := make([]string, 0)

		for _, value := range vars {
			scopes = append(scopes, value)
		}

		allAllowed := true
		var allAuthError error

		for _, scope := range scopes {
			allowed, auth_error := authRepo.HasOneOfSpecificMeasurementDevicePermissions(token, project_id, permissions, scope)

			if allowed == false {
				allAllowed = false
			}

			if auth_error != nil {
				allAllowed = false
				allAuthError = auth_error
			}
		}

		handleRequestOperation(allAllowed, allAuthError, fmt.Sprintf("Token: %s \n invalid for permission: %s.", token, strings.Join(permissions, " ")), w, r, op)
	}
}
