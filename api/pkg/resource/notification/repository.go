package notification

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/efficientIO/efficientIO/api/pkg/resource/alert"
	"github.com/efficientIO/efficientIO/api/pkg/resource/project"
	"github.com/efficientIO/efficientIO/api/pkg/utils"
	"github.com/samber/lo"
)

const (
	Email   = "email"
	Webhook = "webhook"
	Alert   = "alert"
)

type SendgridConfig struct {
	SendgridSender string `json:"sendgrid_sender"`
	SendgridApiKey string `json:"sendgrid_api_key"`
}

type Repository struct {
	SendgridConfigs map[string]SendgridConfig
	AlertRepo       *alert.Repository
	ProjectRepo     *project.Repository
}
type SendOptions struct {
	Type   string `json:"type"`
	Params struct {
		// email specific
		// https://docs.sendgrid.com/api-reference/mail-send/mail-send
		Recipients  []string     `json:"recipients"`
		Subject     string       `json:"subject"`
		Attachments []Attachment `json:"attachments"`

		// webhook specific
		URL     string            `json:"url"`
		Method  string            `json:"method"`
		Headers map[string]string `json:"headers"`

		// sms specific
		Recipient string `json:"recipient"`

		// event specific
		Type    int    `json:"type"`
		Project string `json:"project"`

		Body string `json:"body"`
	} `json:"params"`
}

type Attachment struct {
	Content  string `json:"content"`
	Type     string `json:"type"`
	Filename string `json:"filename"`
}

type ContentType struct {
	Type  string `json:"type"`
	Value string `json:"value"`
}

type EmailType struct {
	Email string `json:"email"`
}

type PersonalizationType struct {
	To []EmailType `json:"to"`
}

type SendgridEmailOptions struct {
	Personalizations []PersonalizationType `json:"personalizations"`
	From             EmailType             `json:"from"`
	Subject          string                `json:"subject"`
	Content          []ContentType         `json:"content"`
	Attachments      []Attachment          `json:"attachments"`
}

func ParseSendgridConfigs(value string) map[string]SendgridConfig {
	var result map[string]SendgridConfig
	err := json.Unmarshal([]byte(value), &result)
	if err != nil {
		panic(err)
	}
	return result
}

// Send to type
func (r Repository) Send(o SendOptions) error {
	switch o.Type {
	case Email:
		return r.sendEmail(o)
	case Webhook:
		return r.sendWebhook(o)
	case Alert:
		return r.sendAlert(o)
	default:
		return errors.New("invalid type")
	}
}

// sendEmail sends an email via sendgrid. This simply builds the JSON together instead of using yet another
// library that imports too much stuff
func (r Repository) sendEmail(o SendOptions) error {
	client := &http.Client{}
	urlStr := "https://api.sendgrid.com/v3/mail/send"

	if len(o.Params.Recipients) == 0 {
		return errors.New("no recipients")
	}

	recipients := lo.Map(o.Params.Recipients, func(email string, _ int) EmailType {
		return EmailType{Email: email}
	})

	// get sendgrid sender and sendgrid api key for the realm of the project
	projectID := o.Params.Project
	projectStruct, err := r.ProjectRepo.Get(project.GetOptions{ID: projectID})
	if err != nil {
		return err
	}
	projectRealm := projectStruct.Realm
	realmSendgridConfig, exists := r.SendgridConfigs[projectRealm]
	if !exists {
		return errors.New(fmt.Sprintf("the realm %v was not found in the sendgrid configs", projectRealm))
	}
	sendgridSender := realmSendgridConfig.SendgridSender
	sendgridApiKey := realmSendgridConfig.SendgridApiKey

	emailOptions := SendgridEmailOptions{
		Personalizations: []PersonalizationType{{To: recipients}},
		From:             EmailType{Email: sendgridSender},
		Subject:          o.Params.Subject,
		Content:          []ContentType{{Type: "text/plain", Value: o.Params.Body}},
		Attachments:      o.Params.Attachments,
	}

	emailOptionsBytes, err := json.Marshal(&emailOptions)
	if err != nil {
		return err
	}

	req, _ := http.NewRequest("POST", urlStr, bytes.NewReader(emailOptionsBytes))
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %v", sendgridApiKey))
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return err
	}

	b, err := ioutil.ReadAll(resp.Body)
	closeErr := resp.Body.Close()
	if closeErr != nil {
		utils.LogError(closeErr, "")
	}
	if err != nil {
		return err
	}

	if resp.StatusCode >= 400 {
		return fmt.Errorf("the call to sendgrid returned the status code %v and the following body: %v",
			resp.StatusCode, string(b))
	}

	l := utils.GetLogger()
	l.Info().Strs("recipients", o.Params.Recipients).Str("subject", o.Params.Subject).Str("response", string(b)).Int("attachments", len(o.Params.Attachments)).Msg("email sent successfully")

	return nil
}

func (r Repository) sendWebhook(o SendOptions) error {
	client := http.Client{}

	var data []byte
	data, err := base64.StdEncoding.DecodeString(o.Params.Body)
	if err != nil {
		utils.LogError(err, "webhook string decoding failed")
		data = []byte(o.Params.Body)
	}

	req, err := http.NewRequest(o.Params.Method, o.Params.URL, bytes.NewReader(data))
	if err != nil {
		return err
	}
	for k, v := range o.Params.Headers {
		req.Header.Set(k, v)
	}

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	b, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	l := utils.GetLogger()
	l.Info().Str("url", o.Params.URL).Str("method", o.Params.Method).Fields(o.Params.Headers).Int("attachments", len(o.Params.Attachments)).Str("response", string(b)).Msg("webhook")

	return nil
}

// sendAlert creates an alert in the database for a project
func (r Repository) sendAlert(o SendOptions) error {
	_, err := r.AlertRepo.Create(alert.CreateOptions{
		ProjectID: o.Params.Project,
		Body:      o.Params.Body,
		Type:      o.Params.Type,
	})

	return err
}
