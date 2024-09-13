package easeeapi

import (
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/efficientIO/efficientIO/api/pkg/utils"
)

type (
	EaseeAPIClient struct {
		BaseUrl     string
		Credentials Credentials
		Tokens      Tokens
		HTTPClient  *http.Client
	}

	Tokens struct {
		AccessToken  string   `json:"accessToken"`
		RefreshToken string   `json:"refreshToken"`
		ExpiresIn    int      `json:"expiresIn"`
		AccessClaims []string `json:"accessClaims"`
		TokenType    string   `json:"tokenType"`
	}

	Credentials struct {
		UserName string `json:"userName"`
		Password string `json:"password"`
	}

	AmqpCredentials struct {
		Server       string `json:"server"`
		Port         int    `json:"port"`
		UseSsl       bool   `json:"useSsl"`
		VirtualHost  string `json:"virtualHost"`
		QueueName    string `json:"queueName"`
		ExchangeName string `json:"exchangeName"`
		Username     string `json:"username"`
		Password     string `json:"password"`
	}

	ChargerDetails struct {
		SerialNumber  string `json:"serialNumber"`
		PinCode       string `json:"pinCode"`
		Product       string `json:"product"`
		UnitType      string `json:"unitType"`
		LevelOfAccess int32  `json:"levelOfAccess"`
		Partner       struct {
			Id         int32  `json:"id"`
			Name       string `json:"name"`
			Short      string `json:"short"`
			Long       string `json:"long"`
			BigImage   string `json:"bigImage"`
			SmallImage string `json:"smallImage"`
		} `json:"partner"`
	}

	ChargerConfigurations struct {
		IsEnabled             bool   `json:"isEnabled,omitempty"`
		LockCablePermanently  bool   `json:"lockCablePermanently,omitempty"`
		AuthorizationRequired bool   `json:"authorizationRequired,omitempty"`
		RemoteStartRequired   bool   `json:"remoteStartRequired,omitempty"`
		SmartButtonEnabled    bool   `json:"smartButtonEnabled,omitempty"`
		WiFiSSID              string `json:"wiFiSSID,omitempty"`
		// 1 2 3 4 5 30 31 50 51 52
		DetectedPowerGridType int32 `json:"detectedPowerGridType,omitempty"`
		// 1 2
		OfflineChargingMode        int32   `json:"offlineChargingMode,omitempty"`
		CircuitMaxCurrentP1        float64 `json:"circuitMaxCurrentP1,omitempty"`
		CircuitMaxCurrentP2        float64 `json:"circuitMaxCurrentP2,omitempty"`
		CircuitMaxCurrentP3        float64 `json:"circuitMaxCurrentP3,omitempty"`
		EnableIdleCurrent          bool    `json:"enableIdleCurrent,omitempty"`
		LimitToSinglePhaseCharging bool    `json:"limitToSinglePhaseCharging,omitempty"`
		// one of: 1, 2 or 3
		// 		0	Ignore, no phase mode reported
		// 		1	Locked to 1-phase
		// 		2	Auto phase mode
		// 		3	Locked to 3-phase
		PhaseMode int32 `json:"phaseMode,omitempty"`
		// 1 2 3
		LocalNodeType                int32   `json:"localNodeType,omitempty"`
		LocalAuthorizationRequired   bool    `json:"localAuthorizationRequired,omitempty"`
		LocalRadioChannel            int32   `json:"localRadioChannel,omitempty"`
		LocalShortAddress            int32   `json:"localShortAddress,omitempty"`
		LocalParentAddrOrNumOfNodes  int32   `json:"localParentAddrOrNumOfNodes,omitempty"`
		LocalPreAuthorizeEnabled     bool    `json:"localPreAuthorizeEnabled,omitempty"`
		LocalAuthorizeOfflineEnabled bool    `json:"localAuthorizeOfflineEnabled,omitempty"`
		AllowOfflineTxForUnknownId   bool    `json:"allowOfflineTxForUnknownId,omitempty"`
		MaxChargerCurrent            float64 `json:"maxChargerCurrent,omitempty"`
		LedStripBrightness           int32   `json:"ledStripBrightness,omitempty"`
		ChargingSchedule             string  `json:"chargingSchedule,omitempty"`
	}

	Observation struct {
		Id        int         `json:"id"`
		Timestamp string      `json:"timestamp"`
		DataType  int         `json:"dataType"`
		Value     interface{} `json:"value"`
	}

	ObservationsResponse struct {
		Observations []Observation `json:"observations"`
	}
	ObservationResponse struct {
		Observation Observation `json:"observation"`
	}
)

func NewEaseeAPIClient(amqpConnectionString string) (*EaseeAPIClient, error) {

	parts := strings.Split(amqpConnectionString, " ")
	if len(parts) != 3 {
		return nil, errors.New("invalid easee connection string")
	}
	userName, password := parts[1], parts[2]

	baseUrl := "https://api.easee.com/api/"

	credentials := Credentials{
		UserName: userName,
		Password: password,
	}

	c := EaseeAPIClient{
		BaseUrl:     baseUrl,
		Tokens:      Tokens{},
		Credentials: credentials,
		HTTPClient:  &http.Client{},
	}

	err := c.GetTokens()
	if err != nil {
		return nil, err
	}

	return &c, nil
}

func (c *EaseeAPIClient) GetTokens() error {

	url := c.BaseUrl + "accounts/login"

	body, err := utils.MakeHttpRequestWithTimeoutAndClient[Tokens]("POST", url, c.Credentials, http.Header{}, true, 0, c.HTTPClient)
	if err != nil {
		return err
	}

	c.Tokens = body
	return nil
}

func (c *EaseeAPIClient) GetAmqpCredentials() (*AmqpCredentials, error) {

	url := c.BaseUrl + "streams/amqp/v2"
	header := http.Header{
		"Authorization": []string{"Bearer " + c.Tokens.AccessToken},
	}

	body, err := utils.MakeHttpRequestWithTimeoutAndClient[AmqpCredentials]("GET", url, "", header, true, 0, c.HTTPClient)
	if err != nil {
		return nil, err
	}

	return &body, nil

}

func (c *EaseeAPIClient) GetChargerPin(chargerId string) (string, error) {
	body, err := c.GetChargerDetails(chargerId)
	if err != nil {
		return "", err
	}

	return body.PinCode, nil
}

func (c *EaseeAPIClient) GetChargerDetails(chargerId string) (ChargerDetails, error) {

	url := fmt.Sprintf(c.BaseUrl+"chargers/%s/details", chargerId)

	header := http.Header{
		"Authorization": []string{"Bearer " + c.Tokens.AccessToken},
	}

	body, err := utils.MakeHttpRequestWithTimeoutAndClient[ChargerDetails]("GET", url, "", header, true, 0, c.HTTPClient)
	if err != nil {
		return ChargerDetails{}, err
	}

	return body, nil
}

func (c *EaseeAPIClient) GetChargerConfig(chargerId string) (ChargerConfigurations, error) {

	url := fmt.Sprintf(c.BaseUrl+"chargers/%s/config", chargerId)

	header := http.Header{
		"Authorization": []string{"Bearer " + c.Tokens.AccessToken},
	}

	body, err := utils.MakeHttpRequestWithTimeoutAndClient[ChargerConfigurations]("GET", url, "", header, true, 0, c.HTTPClient)
	if err != nil {
		return ChargerConfigurations{}, err
	}

	return body, nil

}

func (c *EaseeAPIClient) RefreshToken() error {

	url := c.BaseUrl + "accounts/refresh_token"

	header := http.Header{
		"Authorization": []string{"Bearer " + c.Tokens.AccessToken},
	}

	body, err := utils.MakeHttpRequestWithTimeoutAndClient[Tokens]("POST", url, "", header, true, 0, c.HTTPClient)
	if err != nil {
		return err
	}

	c.Tokens = body

	return nil
}

// TODO rename to list (e.g.: ListObservationValues) to prevent confuision with single value function
func (c *EaseeAPIClient) GetObservationValues(chargerId string, observationIds string) (ObservationsResponse, error) {

	url := fmt.Sprintf("https://api.easee.com/state/%s/observations?ids=%s", chargerId, observationIds)

	header := http.Header{
		"Authorization": []string{"Bearer " + c.Tokens.AccessToken},
	}

	l := utils.GetLogger()
	l.Debug().Msgf("Requesting obvservation values via  %s", url)

	body, err := utils.MakeHttpRequestWithTimeoutAndClient[ObservationsResponse]("GET", url, "", header, true, 0, c.HTTPClient)
	if err != nil {
		return ObservationsResponse{}, err
	}

	return body, nil
}

func (c *EaseeAPIClient) GetObservationValue(chargerId string, observationId string) (Observation, error) {

	url := fmt.Sprintf("https://api.easee.com/state/%s/observation/%s", chargerId, observationId)

	header := http.Header{
		"Authorization": []string{"Bearer " + c.Tokens.AccessToken},
	}

	l := utils.GetLogger()
	l.Debug().Msgf("Requesting obvservation value via  %s", url)

	body, err := utils.MakeHttpRequestWithTimeoutAndClient[ObservationResponse]("GET", url, "", header, true, 0, c.HTTPClient)
	if err != nil {
		return Observation{}, err
	}

	return body.Observation, nil
}
