// user is a middleware for keycloak to get keycloak specific information
// about a user (name, address (attributes), etc.)
package main

import (
	"encoding/json"
	"net/http"
	"regexp"
	"strings"

	"github.com/eneries/eneries/api/pkg/resource/user"
	"github.com/eneries/eneries/api/pkg/utils"

	"github.com/gorilla/mux"
)

var emailRegex = regexp.MustCompile("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$")

func isEmailValid(e string) bool {
	if len(e) < 3 && len(e) > 254 {
		return false
	}
	return emailRegex.MatchString(e)
}

// usersListHandler handles the HTTP request for listing users.
// @Summary      List users
//
//	@Description  List users based on the provided email and realm
//	@Tags         Users
//	@Accept       json
//	@Param        email query string true "Email of the user"
//	@Security     OAuth2Application[readUser]
//	@Produce      json
//	@Success      200  {object}  []user.User "List of users"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /users [get]
func usersListHandler(w http.ResponseWriter, r *http.Request) {
	// handleListUsers returns a list with only 1 user if a user with the
	// matched email exists
	email := r.URL.Query().Get("email")
	realm := r.Header.Get("x-realm")

	if !isEmailValid(email) {
		reject(w, r, http.StatusBadRequest, "invalid email")
		return
	}

	users, err := userRepo.List(user.ListOptions{Email: email, Realm: realm})
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	_ = json.NewEncoder(w).Encode(users)
}

// handleGetUser returns a user with information if the user exists
// usersGetHandler retrieves user information based on the provided user ID.
// @Summary      Get user information
//
//	@Description  Retrieves user information based on the provided user ID
//	@Tags         Users
//	@Accept       json
//	@Param        user path string true "User ID"
//	@Security     OAuth2Application[readUser]
//	@Produce      json
//	@Success      200  {object}  user.User "User information"
//	@Failure      400  {object}  map[string]any{} "Bad request"
//	@Failure      401  {object}  map[string]any{} "Unauthorized"
//	@Failure      500  {object}  map[string]any{} "Internal server error"
//	@Router       /users/{user} [get]
func usersGetHandler(w http.ResponseWriter, r *http.Request) {
	userId := mux.Vars(r)["user"]
	requesterId := r.Header.Get("x-user")
	realm := r.Header.Get("x-realm")
	opts := user.GetOptions{ID: userId, Realm: realm}

	if userId == requesterId || userId == "@me" {
		opts.PrivateInfo = true
		opts.ID = requesterId
	}

	u, err := userRepo.Get(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	_ = json.NewEncoder(w).Encode(&u)
}

// usersGetOTPDevices retrieves the configured OTP (One-Time Password) devices for a user.
// @Summary      Get OTP devices
//
//	@Description  Retrieves the configured OTP devices for the authenticated user.
//	@Tags         Users
//	@Accept       json
//	@Security     OAuth2Application
//	@Produce      json
//	@Success      200  {object}  []user.OTPCredentials "Configured OTP devices"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /users/me/otp [get]
func usersGetOTPDevices(w http.ResponseWriter, r *http.Request) {
	realm := r.Header.Get("x-realm")
	userID := r.Header.Get("x-user")

	creds, err := userRepo.GetConfiguredAuthenticators(realm, userID)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, 200, creds)
}

// userSetOTPDevice sets the OTP device for a user.
// @Summary      Set OTP device
//
//	@Description  Sets the OTP device for the authenticated user.
//	@Tags         Users
//	@Accept       json
//	@Security     OAuth2Application
//	@Param        data body user.CreateMFAOptions true "The options for creating MFA"
//	@Produce      json
//	@Success      200  {object}  nil "Success"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /users/me/otp [post]
func userSetOTPDevice(w http.ResponseWriter, r *http.Request) {
	realm := r.Header.Get("x-realm")
	token := r.Header.Get("authorization")
	prefix := "bearer"
	tokenParts := strings.Split(token, " ")
	if len(tokenParts) == 2 && strings.ToLower(tokenParts[0]) == prefix {
		token = tokenParts[1]
	}

	var o user.CreateMFAOptions

	if err := json.NewDecoder(r.Body).Decode(&o); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}
	err := userRepo.SetOTP(realm, token, o)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	respond(w, 200, nil)
}

// userDeleteOTPDevice deletes the specified OTP device for a user.
// @Summary      Delete OTP device
//
//	@Description  Deletes the specified OTP device for the authenticated user.
//	@Tags         Users
//	@Accept       json
//	@Param        otp_id path string true "OTP device ID"
//	@Security     OAuth2Application
//	@Produce      json
//	@Success      200  {object}  nil "OK"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /users/me/otp/{otp_id} [delete]
func userDeleteOTPDevice(w http.ResponseWriter, r *http.Request) {
	realm := r.Header.Get("x-realm")
	userID := r.Header.Get("x-user")

	otpID := mux.Vars(r)["otp_id"]

	creds, err := userRepo.GetConfiguredAuthenticators(realm, userID)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	exists := false
	for _, cred := range creds {
		if cred.ID == otpID {
			exists = true
		}
	}

	if !exists {
		reject(w, r, http.StatusNotFound, "Authenticator not found")
	}

	err = userRepo.DeleteOTP(realm, userID, otpID)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, 200, nil)
}

// usersUpdateHandler updates a user's information.
// @Summary      Update user
//
//	@Description  Update a user's information
//	@Tags         Users
//	@Accept       json
//	@Param        data body user.User true "The user object with updated information"
//	@Security     OAuth2Application
//	@Produce      json
//	@Success      200  {object}  nil "User updated successfully"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /users/me [put]
func usersUpdateHandler(w http.ResponseWriter, r *http.Request) {
	realm := r.Header.Get("x-realm")
	userID := r.Header.Get("x-user")

	var o user.User

	if err := json.NewDecoder(r.Body).Decode(&o); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}
	o.ID = userID

	err := userRepo.UpdateUser(realm, o)

	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, 200, nil)
}

// getOTPQRHandler generates a QR code for the user's OTP (One-Time Password).
//
//	@Summary      Generate OTP QR code
//	@Description  This endpoint generates a QR code for the user''s OTP (One-Time Password).
//	@Tags         Users
//	@Accept       json
//	@Security     OAuth2Application
//	@Produce      json
//	@Success      200  {object}  user.OTPQr "QR code image"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /users/me/otp/qr [get]
func getOTPQRHandler(w http.ResponseWriter, r *http.Request) {
	realm := r.Header.Get("x-realm")
	userID := r.Header.Get("x-user")
	token := r.Header.Get("authorization")
	prefix := "bearer"
	tokenParts := strings.Split(token, " ")
	if len(tokenParts) == 2 && strings.ToLower(tokenParts[0]) == prefix {
		token = tokenParts[1]
	}

	qr, err := userRepo.GetQRCodeForOTP(userID, realm, token)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, qr)
}

// usersUpdatePasswordHandler updates the password for a user.
//
//	@Summary      Update password
//	@Description  Update the password for the authenticated user
//	@Tags         Users
//	@Accept       json
//	@Param        data body user.UpdatePasswordOptions true "The options for updating the password"
//	@Security     OAuth2Application
//	@Produce      json
//	@Success      200  {object}  interface{} "Success response"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /users/me/password [put]
func usersUpdatePasswordHandler(w http.ResponseWriter, r *http.Request) {
	realm := r.Header.Get("x-realm")
	userID := r.Header.Get("x-user")
	var o user.UpdatePasswordOptions

	if err := json.NewDecoder(r.Body).Decode(&o); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	o.UserID = userID

	if o.NewPassword != o.PasswordConfirm {
		reject(w, r, http.StatusBadRequest, "password confirm wrong")
		return
	}

	err := userRepo.UpdatePassword(realm, o)

	if err != nil {
		switch err.(type) {
		case utils.NotAuthorizedError:
			reject(w, r, http.StatusUnauthorized, err.Error())
		default:
			reject(w, r, http.StatusInternalServerError, err.Error())
		}
		return
	}

	respond(w, 200, nil)
}

// usersDeleteHandler deletes a user and all associated projects and assets.
//
//	@Summary      Delete a user
//	@Description  Deletes the authenticated user and all associated projects and assets.
//	@Tags         Users
//	@Accept       json
//	@Security     OAuth2Application
//	@Produce      json
//	@Success      200  {object}  nil "User deleted successfully"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /users/me [delete]
func usersDeleteHandler(w http.ResponseWriter, r *http.Request) {
	realm := r.Header.Get("x-realm")
	userID := r.Header.Get("x-user")

	projects, err := projectRepo.GetProjectsForOnlyLeftUser(userID)

	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	for _, project := range projects {
		err = assetRepo.DeleteAssetsForProject(project.ID)
		if err != nil {
			reject(w, r, http.StatusInternalServerError, err.Error())
			return
		}

		err = projectRepo.DeleteProjectComplete(project.ID)

		if err != nil {
			reject(w, r, http.StatusInternalServerError, err.Error())
			return
		}
	}

	err = userRepo.DeleteUser(realm, userID)

	if err != nil {
		switch err.(type) {
		case utils.NotAuthorizedError:
			reject(w, r, http.StatusUnauthorized, err.Error())
		default:
			reject(w, r, http.StatusInternalServerError, err.Error())
		}
		return
	}

	respond(w, 200, nil)
}
