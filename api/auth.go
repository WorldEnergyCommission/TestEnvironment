package main

import (
	"encoding/json"
	"fmt"

	"net/http"

	"github.com/eneries/eneries/api/pkg/auth"
	"github.com/eneries/eneries/api/pkg/resource/user"

	"github.com/Nerzal/gocloak/v13"
	"github.com/gorilla/mux"
)

// log user in
func tokenRequestHandler(w http.ResponseWriter, r *http.Request) {
	realm := mux.Vars(r)["realm"]
	var token *gocloak.JWT
	var err error

	clientId := r.FormValue("client_id")
	if len(clientId) == 0 {
		reject(w, r, http.StatusBadRequest, "client_id cannot be empty")
		return
	}

	switch grandType := r.FormValue("grant_type"); grandType {
	case "password":
		username, password, err := getUsernamePassword(w, r)
		if err != nil {
			return
		}
		token, err = authRepo.Login(username, password, realm, clientId)
	case "otp":
		username, password, err := getUsernamePassword(w, r)
		if err != nil {
			return
		}
		otp := r.FormValue("otp")
		if len(otp) == 0 {
			reject(w, r, http.StatusBadRequest, "otp cannot be empty")
			return
		}
		token, err = authRepo.LoginOTP(username, password, otp, realm, clientId)
	case "refresh_token":
		refreshToken := r.FormValue("refresh_token")
		if len(refreshToken) == 0 {
			reject(w, r, http.StatusBadRequest, "refresh_token cannot be empty")
			return
		}
		token, err = authRepo.RefreshToken(refreshToken, realm, clientId)
	default:
		reject(w, r, http.StatusBadRequest, "grand_type not supported")
		return
	}

	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	// seems like in some edge cases gocloak might return nil instead of error
	if token == nil || token.AccessToken == "" {
		reject(w, r, http.StatusInternalServerError, "token was nil")
		return
	}
	respond(w, http.StatusOK, token)

}

func signupRequestHandler(w http.ResponseWriter, r *http.Request) {
	realm := mux.Vars(r)["realm"]
	queryParams := r.URL.Query()
	invite := queryParams.Get("invite")

	if realm == "master" {
		reject(w, r, http.StatusBadRequest, "invalid realm")
		return
	}

	var err error
	var authUser auth.User

	if err = json.NewDecoder(r.Body).Decode(&authUser); err != nil {
		reject(w, r, http.StatusBadRequest, "")
		return
	}

	validationErrors := validate.Struct(authUser)

	if validationErrors != nil {
		reject(w, r, http.StatusBadRequest, validationErrors.Error())
		return
	}

	isAllowed, err := authRepo.IsRegistrationEnabled(realm)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	isInvited := invite != ""

	if !isAllowed && ((isInvited && !memberRepo.IsValidInvite(realm, invite)) || !isInvited) {
		reject(w, r, http.StatusInternalServerError, fmt.Errorf("registration not allowed").Error())
		return
	}

	userId, err := authRepo.RegisterUser(&authUser, realm, isInvited)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	if isInvited {
		permissionRepo.CreateUserIfNotExists(userId, realm)

		memberRepo.AddInvitedMemberToProject(realm, invite, userId)
	}

	respond(w, http.StatusOK, nil)
}

func inviteRequestHandler(w http.ResponseWriter, r *http.Request) {
	realm := mux.Vars(r)["realm"]
	queryParams := r.URL.Query()
	id := queryParams.Get("invite_id")

	info, err := memberRepo.GetInviteInfo(realm, id)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	user, err := userRepo.Get(user.GetOptions{ID: info.InvitedBy, Realm: realm})
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	info.InvitedBy = user.FirstName + " " + user.LastName

	respond(w, http.StatusOK, info)
}

func logoutRequestHandler(w http.ResponseWriter, r *http.Request) {
	realm := mux.Vars(r)["realm"]
	refreshToken := r.FormValue("refresh_token")
	if len(refreshToken) == 0 {
		reject(w, r, http.StatusBadRequest, "refresh_token cannot be empty")
		return
	}

	clientId := r.FormValue("client_id")
	if len(clientId) == 0 {
		reject(w, r, http.StatusBadRequest, "client_id cannot be empty")
		return
	}

	err := authRepo.Logout(refreshToken, realm, clientId)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, nil)
}

func resetPasswordRequestHandler(w http.ResponseWriter, r *http.Request) {
	realm := mux.Vars(r)["realm"]
	email := r.FormValue("email")
	if len(email) == 0 {
		reject(w, r, http.StatusBadRequest, "email cannot be empty")
		return
	}

	users, err := authRepo.GetUsersByEmail(email, realm)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	if len(users) < 1 {
		reject(w, r, http.StatusNotFound, "user not found")
		return
	}

	err = authRepo.ResetPassword(*users[0].ID, realm)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, nil)
}

func registrationEnabledHandler(w http.ResponseWriter, r *http.Request) {
	realm := mux.Vars(r)["realm"]

	enabled, err := authRepo.IsRegistrationEnabled(realm)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, enabled)
}

func getUsernamePassword(w http.ResponseWriter, r *http.Request) (string, string, error) {
	username := r.FormValue("username")
	if len(username) == 0 {
		reject(w, r, http.StatusBadRequest, "username cannot be empty")
		return "", "", fmt.Errorf("username cannot be empty")
	}

	password := r.FormValue("password")
	if len(password) == 0 {
		reject(w, r, http.StatusBadRequest, "password cannot be empty")
		return "", "", fmt.Errorf("password cannot be empty")
	}

	return username, password, nil
}
