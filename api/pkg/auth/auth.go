// Package auth this is the authorization module for endpoints
// it leverages the mux.Router middleware
package auth

import (
	"context"
	"database/sql"
	"errors"
	"strings"

	"github.com/efficientIO/efficientIO/api/pkg/utils"

	"github.com/Nerzal/gocloak/v13"
	"github.com/golang-jwt/jwt/v5"
	"github.com/lib/pq"
)

type Repository struct {
	Database         *sql.DB
	Keycloak         *gocloak.GoCloak
	KeycloakUsername string
	KeycloakPassword string
}

// https://github.com/Nerzal/gocloak/blob/640934dd78692930603e556a389a4a6f660d4ac9/models.go#LL199C1-L219C1
type User struct {
	FirstName            *string              `json:"firstName,omitempty" validate:"required"`
	LastName             *string              `json:"lastName,omitempty" validate:"required"`
	Email                *string              `json:"email,omitempty" validate:"required,email"`
	Username             *string              `json:"username,omitempty"`
	Attributes           *map[string][]string `json:"attributes,omitempty"`
	Password             *string              `json:"password,omitempty" validate:"required,eqfield=PasswordConfirmation"`
	PasswordConfirmation *string              `json:"password_confirm,omitempty" validate:"required,eqfield=Password"`
}

// sql to check permissions
const (
	hasPlatformOneOfPermission = `SELECT true 
	FROM public.general_permissions_for_user
	WHERE permission_id = any($2)
	AND user_id = cast($1 as uuid)
	AND wildcard = TRUE`
	hasPlatformRole = `SELECT true 
		FROM public.user_role
		WHERE role_id = $2	AND user_id = cast($1 as uuid)`
	// New Queries using view which contains all permissions for users
	permissionQueryBase               = "SELECT DISTINCT true FROM permissions_for_user pfu "
	permissionQueryFilter             = " WHERE pfu.permission_id = any($2) AND pfu.user_id = cast( $1 as uuid) AND (pfu.project_id = cast( $3 as uuid) or pfu.project_id is null) "
	hasProjectUserAnyPermission       = permissionQueryBase + permissionQueryFilter
	scopedFilterBase                  = " AND (pfu.wildcard = TRUE OR "
	hasProjectUserAnyPermissionScoped = `SELECT true 
	FROM 
		(SELECT (cast($1 as text) = cast($4 as text)) or 
		(` + hasProjectUserAnyPermission + scopedFilterBase +
		` pfu.{{replaceme}} = cast($4 as uuid))	
		) user_permission) 
	equal_or 
	WHERE equal_or is not null`
	measurementDeviceMappingJoin = ` LEFT JOIN measurements_mapping mdm ON 
		(pfu.device_id = mdm.device_id 
		OR pfu.model_id = mdm.device_id 
		OR pfu.data_mapping_id = mdm.device_id 
		OR pfu.module_id = mdm.device_id) `
	measurementDeviceMappingFilter                 = scopedFilterBase + " mdm.measurement = $4) "
	hasProjectUserAnyPermissionMappedToMeasurement = permissionQueryBase + measurementDeviceMappingJoin + permissionQueryFilter + measurementDeviceMappingFilter
	collectionDeviceMappingJoin                    = " LEFT JOIN  project_device device ON pfu.device_id = device.device_id "
	collectionDeviceMappingFilter                  = scopedFilterBase + " device.collection_id = $4);"
	hasProjectUserAnyCollectionDevicePermission    = permissionQueryBase + collectionDeviceMappingJoin + permissionQueryFilter + collectionDeviceMappingFilter
	aiRuleMappingJoin                              = ` LEFT JOIN (
		select * from (
			select id, r->'data'->'meta'->>'errorRule' "rule" from models 
			union
			select id, r->'data'->'meta'->>'warningRule' "rule" from models
			) tmp 
		WHERE tmp."rule" is not null) 
		mapRule 	
	on pfu.model_id = cast( mapRule.id as uuid)`
	aiRuleMappingFilter                  = scopedFilterBase + " mapRule.rule = $4)"
	hasProjectUserMappedAIRulePermission = permissionQueryBase + aiRuleMappingJoin + permissionQueryFilter + aiRuleMappingFilter
)

func (r Repository) QueryPermission(query string, authorization string, args ...any) (bool, error) {
	user, _, err_decode := r.decodeToken(authorization)

	if err_decode != nil {
		return false, err_decode
	}
	argsToQuery := append([]any{user}, args...)

	rows, err := r.Database.Query(query, argsToQuery...)
	if err != nil {
		l := utils.GetLogger()
		l.Warn().Str("query", query).Msg("Failed Auth Query")
		return false, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	// if no row was found return not authorized
	if !rows.Next() {
		return false, nil
	}

	return true, nil
}

func (r Repository) GetUserAndRealm(authorization string) (user string, realm string, err error) {
	return r.decodeToken(authorization)
}

// returns (false, error) if one error is not nil. otherwise it returns (true,nil) if one check is true
func verfiyTwoChecks(check1 bool, error1 error, check2 bool, error2 error) (bool, error) {
	if error1 != nil {
		return false, error1
	}

	if error2 != nil {
		return false, error2
	}

	return check1 || check2, nil
}

// checks if authorization token has a permission for a project
func (r Repository) HasProjectPermission(authorization string, project_id string, permissions []string) (bool, error) {
	has_permission, err := r.QueryPermission(hasProjectUserAnyPermission, authorization, pq.Array(permissions), project_id)
	return has_permission, err
}

func (r Repository) HasSpecificProjectPermission(authorization string, project_id string, permissions []string, scope_key string, scope_value string) (bool, error) {
	has_permission, err := r.QueryPermission(strings.Replace(hasProjectUserAnyPermissionScoped, "{{replaceme}}", scope_key, -1), authorization, pq.Array(permissions), project_id, scope_value)
	return has_permission, err
}

func (r Repository) HasOneOfSpecificMeasurementDevicePermissions(authorization string, project_id string, permissions []string, scope_value string) (bool, error) {
	specific, err_s := r.QueryPermission(hasProjectUserAnyPermissionMappedToMeasurement, authorization, pq.Array(permissions), project_id, scope_value)
	general, err_g := r.QueryPermission(hasProjectUserAnyPermission, authorization, pq.Array(permissions), project_id)

	return verfiyTwoChecks(specific, err_s, general, err_g)
}

func (r Repository) HasSpecificCollectionDevicePermission(authorization string, project_id string, permissions []string, scope_value string) (bool, error) {
	specific, err_s := r.QueryPermission(hasProjectUserAnyCollectionDevicePermission, authorization, pq.Array(permissions), project_id, scope_value)
	general, err_g := r.QueryPermission(hasProjectUserAnyPermission, authorization, pq.Array(permissions), project_id)

	return verfiyTwoChecks(specific, err_s, general, err_g)
}

// Check if an user has
func (r Repository) HasProjectUserAnyPermissionScopedAndMappedAIToRule(authorization string, project_id string, permissions []string, scope_value string) (bool, error) {
	general_or_speciffic, err_gs := r.QueryPermission(strings.Replace(hasProjectUserAnyPermissionScoped, "{{replaceme}}", "rule_id", -1), authorization, pq.Array(permissions), project_id, scope_value)
	mapped, err_m := r.QueryPermission(hasProjectUserMappedAIRulePermission, authorization, pq.Array(permissions), project_id, scope_value)

	return verfiyTwoChecks(general_or_speciffic, err_gs, mapped, err_m)
}

func (r Repository) HasPlatformPermission(authorization string, permissions []string) (bool, error) {
	return r.QueryPermission(hasPlatformOneOfPermission, authorization, pq.Array(permissions))
}

func (r Repository) HasUserPlatformRole(authorization, role string) (bool, error) {
	return r.QueryPermission(hasPlatformRole, authorization, role)
}

// decodeToken is used for verifying the token and extracting the realm and user id
func (r Repository) decodeToken(tokenStr string) (string, string, error) {
	// parse the passed jwt into a token object
	parser := jwt.NewParser()
	parsedToken, _, err := parser.ParseUnverified(tokenStr, jwt.MapClaims{})
	if err != nil {
		return "", "", err
	}

	// extract information out of the parsed token
	claims, ok := parsedToken.Claims.(jwt.MapClaims)
	if !ok {
		return "", "", errors.New("the jwt claims were not convertable to a map")
	}
	issuerUrl, ok := claims["iss"].(string)
	if !ok {
		return "", "", errors.New("the jwt issuer url was not convertable to a string")
	}
	subject, ok := claims["sub"].(string)
	if !ok {
		return "", "", errors.New("the jwt subject was not convertable to a string")
	}

	// extract the realm from the issuer url
	// here is an example of an issuer url: https://accounts.efficientio.com/auth/realms/<realm>
	urls := strings.Split(issuerUrl, "/")
	if len(urls) == 0 {
		return "", "", errors.New("the issuer url had an invalid format")
	}
	realm := urls[len(urls)-1]

	// don't allow users from the keycloak master realm
	if realm == "master" {
		return "", "", errors.New("the keycloak master realm is not allowed")
	}

	// verify jwt
	if _, _, err := (*r.Keycloak).DecodeAccessToken(context.Background(), tokenStr, realm); err != nil {
		return "", "", err
	}

	// return the user id and the used realm
	return subject, realm, nil
}

// Sign in using username and password combination
func (r Repository) Login(user string, password string, realm string, clientId string) (*gocloak.JWT, error) {
	return (*r.Keycloak).Login(context.Background(), clientId, "", realm, user, password)
}

// Sign in using username, password and one-time password combination
func (r Repository) LoginOTP(user string, password string, otp string, realm string, clientId string) (*gocloak.JWT, error) {
	return (*r.Keycloak).LoginOtp(context.Background(), clientId, "", realm, user, password, otp)
}

func (r Repository) RefreshToken(refreshToken string, realm string, clientId string) (*gocloak.JWT, error) {
	return (*r.Keycloak).RefreshToken(context.Background(), refreshToken, clientId, "", realm)
}

func (r Repository) Logout(refreshToken string, realm string, clientId string) error {
	return (*r.Keycloak).Logout(context.Background(), clientId, "", realm, refreshToken)
}

// returns user id and error
func (r Repository) RegisterUser(user *User, realm string, isEmailAlreadVerified bool) (string, error) {
	token, err := (*r.Keycloak).LoginAdmin(context.Background(), r.KeycloakUsername, r.KeycloakPassword, "master")
	if err != nil {
		return "", err
	}

	enabled := true
	typePassword := "password"
	credentials := &[]gocloak.CredentialRepresentation{
		{
			Value: user.Password,
			Type:  &typePassword,
		}}

	requiredAction := []string{"VERIFY_EMAIL"}
	emailVerified := false
	if isEmailAlreadVerified {
		requiredAction = []string{}
		emailVerified = true
	}

	goUser := gocloak.User{
		FirstName:       user.FirstName,
		LastName:        user.LastName,
		Email:           user.Email,
		Attributes:      user.Attributes,
		Enabled:         &enabled,
		RequiredActions: &requiredAction,
		Credentials:     credentials,
		EmailVerified:   &emailVerified,
	}

	if user.Username != nil && *user.Username != "" {
		goUser.Username = user.Username
	}

	userId, err := (*r.Keycloak).CreateUser(context.Background(), token.AccessToken, realm, goUser)

	if err != nil {
		return "", err
	}

	if !isEmailAlreadVerified {
		action := gocloak.ExecuteActionsEmail{
			Actions: &[]string{"VERIFY_EMAIL"},
			UserID:  &userId,
		}
		err = (*r.Keycloak).ExecuteActionsEmail(context.Background(), token.AccessToken, realm, action)

	}

	if err != nil {
		return "", err
	}

	return userId, nil
}

func (r Repository) ResetPassword(userId string, realm string) error {
	token, err := (*r.Keycloak).LoginAdmin(context.Background(), r.KeycloakUsername, r.KeycloakPassword, "master")
	if err != nil {
		return err
	}

	action := gocloak.ExecuteActionsEmail{
		Actions: &[]string{"UPDATE_PASSWORD"},
		UserID:  &userId,
	}

	return (*r.Keycloak).ExecuteActionsEmail(context.Background(), token.AccessToken, realm, action)
}

func (r Repository) GetUsersByEmail(email string, realm string) ([]*gocloak.User, error) {
	token, err := (*r.Keycloak).LoginAdmin(context.Background(), r.KeycloakUsername, r.KeycloakPassword, "master")
	if err != nil {
		return nil, err
	}

	userParams := gocloak.GetUsersParams{
		Email: &email,
	}

	return (*r.Keycloak).GetUsers(context.Background(), token.AccessToken, realm, userParams)
}

// Check if a user can self register on a given realm.
// Returns (bool,nil) or (false,error) if error occured
func (r Repository) IsRegistrationEnabled(realmName string) (bool, error) {
	token, err := (*r.Keycloak).LoginAdmin(context.Background(), r.KeycloakUsername, r.KeycloakPassword, "master")
	if err != nil {
		return false, err
	}

	realm, err := (*r.Keycloak).GetRealm(context.Background(), token.AccessToken, realmName)
	if err != nil {
		return false, err
	}

	return *realm.RegistrationAllowed, nil
}
