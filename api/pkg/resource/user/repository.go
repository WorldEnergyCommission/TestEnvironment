package user

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/eneries/eneries/api/pkg/utils"

	"github.com/Nerzal/gocloak/v13"
)

const (
	projectCountQuery = "SELECT COUNT(*) FROM project p INNER JOIN project_user_role pu on p.id=pu.project_id WHERE pu.user_id = $1"
	deleteUserQuery   = `DELETE FROM "user" WHERE id = $1`
)

type Repository struct {
	Database *sql.DB

	Keycloak         *gocloak.GoCloak
	KeycloakUsername string
	KeycloakPassword string

	kkToken        *gocloak.JWT
	kkTokenRequest time.Time

	ProjectLimit int
}

// token returns a keycloak token, that is either newly generated
// or re-used until it is expired
func (r Repository) token() (string, error) {
	if r.kkToken != nil && r.kkTokenRequest.Add(time.Second*time.Duration(r.kkToken.ExpiresIn)).After(time.Now()) {
		return r.kkToken.AccessToken, nil
	}

	var err error
	r.kkToken, err = (*r.Keycloak).LoginAdmin(context.TODO(), r.KeycloakUsername, r.KeycloakPassword, "master")
	if err != nil {
		return "", nil
	}

	r.kkTokenRequest = time.Now()
	return r.kkToken.AccessToken, nil
}

type User struct {
	ID           string        `json:"id"`
	HubSpotID    string        `json:"-"`
	Email        string        `json:"email"`
	Mobile       string        `json:"mobile,omitempty"`
	FirstName    string        `json:"first_name"`
	LastName     string        `json:"last_name"`
	Address      *Address      `json:"address,omitempty"`
	Limits       *Limits       `json:"limits,omitempty"`
	Organization *Organization `json:"organization,omitempty"`
}
type Address struct {
	Street  string `json:"street"`
	City    string `json:"city"`
	Country string `json:"country"`
	ZipCode string `json:"zip_code"`
}
type Organization struct {
	Name string `json:"name"`
	ID   string `json:"id"`
}
type Limits struct {
	Projects int `json:"projects"`
}
type GetOptions struct {
	ID          string `json:"id"`
	Realm       string `json:"realm"`
	PrivateInfo bool   `json:"-"`
}
type ListOptions struct {
	Email       string `json:"email"`
	Realm       string `json:"realm"`
	PrivateInfo bool   `json:"-"`
}
type ProjectCountOptions struct {
	ID string `json:"id"`
}

type OTPCredentials struct {
	ID          string `json:"id"`
	Name        string `json:"device_name"`
	CreatedDate int64  `json:"created_date,omitempty"`
}

func (r Repository) Get(o GetOptions) (User, error) {
	ctx := context.Background()
	token, err := r.token()
	if err != nil {
		return User{}, err
	}

	kkUser, err := (*r.Keycloak).GetUserByID(ctx, token, o.Realm, o.ID)
	if err != nil {
		return User{}, err
	}

	return parseUser(kkUser, o.PrivateInfo, r.ProjectLimit), nil
}
func (r Repository) List(o ListOptions) ([]User, error) {
	ctx := context.Background()
	token, err := r.token()
	if err != nil {
		return nil, err
	}

	users, err := (*r.Keycloak).GetUsers(ctx, token, o.Realm, gocloak.GetUsersParams{Email: &o.Email})
	if err != nil {
		return nil, err
	}

	result := make([]User, 0)
	for _, u := range users {
		result = append(result, parseUser(u, o.PrivateInfo, r.ProjectLimit))
	}

	return result, nil
}

// parseUser parses a keycloak response to our format, since keycloak
// uses camelCase and we use snake_case
func parseUser(u *gocloak.User, privateInfo bool, projectLimit int) User {
	user := User{
		ID:        *u.ID,
		Email:     *u.Email,
		FirstName: *u.FirstName,
		LastName:  *u.LastName,
	}

	// set default project limit
	defaultLimits := &Limits{Projects: projectLimit}
	user.Limits = defaultLimits

	// get all attributes in a better format
	attributes := map[string]string{}
	if u.Attributes != nil {
		for k, v := range *u.Attributes {
			if len(v) == 0 {
				continue
			}
			attributes[k] = v[0]
		}
	}

	// set user details
	if privateInfo {
		user.Mobile = utils.GetValueWithDefault(attributes, "mobile", "")
		user.Address = &Address{
			Street:  utils.GetValueWithDefault(attributes, "address.street", ""),
			City:    utils.GetValueWithDefault(attributes, "address.city", ""),
			Country: utils.GetValueWithDefault(attributes, "address.country", ""),
			ZipCode: utils.GetValueWithDefault(attributes, "address.zipCode", ""),
		}
	}

	// set specific project limit if present
	if val, ok := attributes["limit.project"]; ok {
		limitVal, err := strconv.Atoi(val)
		if err == nil {
			user.Limits.Projects = limitVal
		}
	}

	// set the organization only if it exists
	nameValue, nameOk := attributes["organization.name"]
	idValue, idOk := attributes["organization.id"]
	if nameOk && idOk && privateInfo {
		user.Organization = &Organization{
			Name: nameValue,
			ID:   idValue,
		}
	}

	return user
}

// ProjectCount returns the amount of projects the user is in
func (r Repository) ProjectCount(o ProjectCountOptions) (int, error) {
	var (
		count int
		err   error
	)

	err = r.Database.QueryRow(projectCountQuery, o.ID).Scan(&count)
	return count, err
}

func (r Repository) GetConfiguredAuthenticators(realm string, userId string) ([]OTPCredentials, error) {
	token, err := (*r.Keycloak).LoginAdmin(context.Background(), r.KeycloakUsername, r.KeycloakPassword, "master")
	if err != nil {
		return nil, err
	}

	credentials, err := (*r.Keycloak).GetCredentials(context.Background(), token.AccessToken, realm, userId)

	otps := make([]OTPCredentials, 0)

	for _, cred := range credentials {
		if *cred.Type == "otp" {
			otps = append(otps, OTPCredentials{ID: *cred.ID, Name: *cred.UserLabel, CreatedDate: *cred.CreatedDate})
		}
	}

	return otps, err
}

type (
	CreateMFAOptions struct {
		Secret      string `json:"secret"`
		InitialCode string `json:"initialCode"`
		DeviceName  string `json:"deviceName"`
	}

	OTPQr struct {
		Secret string `json:"Secret" validate:"required"`
		QR     string `json:"QR" validate:"required"`
	}

	UpdatePasswordOptions struct {
		OldPassword     string `json:"password"`
		OTPCode         string `json:"otp,omitempty"`
		NewPassword     string `json:"new_password"`
		PasswordConfirm string `json:"confirm_password"`
		ClientID        string `json:"client_id"`
		UserID          string `json:"user_id"`
	}
)

func (r Repository) GetQRCodeForOTP(userId string, realm string, token string) (OTPQr, error) {
	var result OTPQr
	envKeycloakAddr := os.Getenv("KEYCLOAK_ADDR")
	url := strings.Join([]string{envKeycloakAddr, "auth/realms", realm, "qr-rest-provider/mfa/qr"}, "/")

	resp, err := (*r.Keycloak).GetRequestWithBearerAuthNoCache(context.Background(), token).SetResult(&result).Get(url)
	if err != nil {
		return OTPQr{}, err
	}

	if resp == nil {
		return OTPQr{}, fmt.Errorf("empty reponse from keycloak")
	}

	return result, nil
}

func (r Repository) SetOTP(realm string, token string, o CreateMFAOptions) error {
	envKeycloakAddr := os.Getenv("KEYCLOAK_ADDR")
	url := strings.Join([]string{envKeycloakAddr, "auth/realms", realm, "qr-rest-provider/mfa"}, "/")

	resp, err := (*r.Keycloak).GetRequestWithBearerAuthNoCache(context.Background(), token).
		SetBody(map[string]interface{}{"secret": o.Secret, "initialCode": o.InitialCode, "deviceName": o.DeviceName}).Post(url)

	if err != nil {
		return err
	}

	if resp == nil {
		return fmt.Errorf("empty reponse from keycloak")
	}

	if resp.IsError() {
		return resp.Error().(error)
	}

	return nil
}

func (r Repository) DeleteOTP(realm string, userId string, id string) error {
	token, err := (*r.Keycloak).LoginAdmin(context.Background(), r.KeycloakUsername, r.KeycloakPassword, "master")
	if err != nil {
		return err
	}
	return (*r.Keycloak).DeleteCredentials(context.Background(), token.AccessToken, realm, userId, id)
}

func (r Repository) UpdateUser(realm string, o User) error {
	token, err := (*r.Keycloak).LoginAdmin(context.Background(), r.KeycloakUsername, r.KeycloakPassword, "master")
	if err != nil {
		return err
	}

	attributes := map[string][]string{}
	attributes["mobile"] = []string{o.Mobile}
	attributes["address.street"] = []string{o.Address.Street}
	attributes["address.city"] = []string{o.Address.City}
	attributes["address.zipCode"] = []string{o.Address.ZipCode}
	attributes["address.country"] = []string{o.Address.Country}

	user := gocloak.User{
		ID:         &o.ID,
		FirstName:  &o.FirstName,
		LastName:   &o.LastName,
		Attributes: &attributes,
	}

	return (*r.Keycloak).UpdateUser(context.Background(), token.AccessToken, realm, user)
}

func (r Repository) UpdatePassword(realm string, o UpdatePasswordOptions) error {
	adminToken, err := (*r.Keycloak).LoginAdmin(context.Background(), r.KeycloakUsername, r.KeycloakPassword, "master")
	if err != nil {
		return err
	}
	kkUser, err := (*r.Keycloak).GetUserByID(context.Background(), adminToken.AccessToken, realm, o.UserID)

	if err != nil {
		return err
	}

	var token *gocloak.JWT

	if o.OTPCode == "" {
		token, err = (*r.Keycloak).Login(context.Background(), o.ClientID, "", realm, *kkUser.Username, o.OldPassword)

	} else {
		token, err = (*r.Keycloak).LoginOtp(context.Background(), o.ClientID, "", realm, *kkUser.Username, o.OldPassword, o.OTPCode)
	}

	if err != nil {
		return utils.NotAuthorizedError{}
	}

	if token == nil || token.AccessToken == "" {
		return fmt.Errorf("token was nil")
	}

	return (*r.Keycloak).SetPassword(context.Background(), adminToken.AccessToken, o.UserID, realm, o.NewPassword, false)
}

func (r Repository) DeleteUser(realm string, user_id string) error {
	if _, err := r.Database.Exec(deleteUserQuery, user_id); err != nil {
		return err
	}

	adminToken, err := (*r.Keycloak).LoginAdmin(context.Background(), r.KeycloakUsername, r.KeycloakPassword, "master")
	if err != nil {
		return err
	}

	return (*r.Keycloak).DeleteUser(context.Background(), adminToken.AccessToken, realm, user_id)
}
