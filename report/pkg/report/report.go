package report

import (
	"database/sql"
	"encoding/json"
	"time"

	"github.com/efficientIO/efficientIO/api/pkg/utils"
)

const (
	FormatXML  = "xml"
	FormatCSV  = "csv"
	FormatJSON = "json"
	FormatPDF  = "pdf"

	TypeNormal = "normal"
	TypeZEV    = "zev"
)

// Report struct
type Report struct {
	db        *sql.DB   // get db instance, so it doesn't have to be passed everywhere
	ID        string    `json:"id"`
	Start     time.Time `json:"start"`
	End       time.Time `json:"end"`
	ProjectID string    `json:"project_id"`
	Type      string    `json:"type"`
	Currency  string    `json:"currency"`
	Active    bool      `json:"active"`
	Name      string    `json:"name"`
	Timezone  string    `json:"timezone"`
	Address   struct {
		Street  string `json:"street"`
		City    string `json:"city"`
		Country string `json:"country"`
	} `json:"address"`
	Variables []struct {
		Name     string         `json:"name"`
		Title    string         `json:"title"`
		Unit     string         `json:"unit"`
		UnitCost float64        `json:"unit_cost"`
		Meta     map[string]any `json:"meta"`
	} `json:"variables"`
	Actions []struct {
		Type   string `json:"type"`
		Format string `json:"format"`
		Params struct {
			// email specific
			// https://docs.sendgrid.com/api-reference/mail-send/mail-send
			Recipients []string `json:"recipients"`
			Subject    string   `json:"subject"`

			Attachments []struct {
				Content  string `json:"content"`
				Type     string `json:"type"`
				Filename string `json:"filename"`
			} `json:"attachments"`

			// webhook specific
			URL     string            `json:"url"`
			Method  string            `json:"method"`
			Headers map[string]string `json:"headers"`

			// used by everyone
			Body string `json:"body"`
		} `json:"params"`
	} `json:"actions"`
	Meta struct {
		ShowReportImage bool `json:"show_report_image,omitempty"`

		// this is only used for zev reports
		Zev struct {
			Innosolv struct {
				Username string `json:"username"`
			} `json:"innosolv"`
			Titles struct {
				Photovoltaik string `json:"photovoltaik"`
				Grid         string `json:"grid"`
			} `json:"titles"`
			Consumers []ZevVariable `json:"consumers"`
			Producers struct {
				Internal []ZevVariable `json:"internal"`
				External []ZevVariable `json:"external"`
			} `json:"producers"`
			Tariffs struct {
				Internal struct {
					Time [][][]int `json:"time"`
					Low  float64   `json:"low"`
					High float64   `json:"high"`
				} `json:"internal"`
				External struct {
					Time [][][]int `json:"time"`
					Low  float64   `json:"low"`
					High float64   `json:"high"`
				} `json:"external"`
			} `json:"tariffs"`
		} `json:"zev"`
	}
	CreatedAt time.Time `json:"created_at"`
}

// GetAllActive returns all reports that are "active"
func GetAllActive(db *sql.DB) ([]Report, error) {
	rows, err := db.Query(`SELECT id, project_id, type, timezone, name, address_street, 
	address_city, address_country, currency, variables, active, actions, meta,
	created_at FROM project_report WHERE ACTIVE = true`)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	reports := make([]Report, 0)
	for rows.Next() {
		rep, err := scanRow(rows)
		if err != nil {
			return nil, err
		}
		rep.db = db
		reports = append(reports, *rep)
	}

	return reports, nil
}

// Get returns a single report
func Get(db *sql.DB, id string) (*Report, error) {
	rows, err := db.Query(`SELECT id, project_id, type, timezone, name, address_street, 
	address_city, address_country, currency, variables, active, actions, meta,
	created_at FROM project_report WHERE id = $1`, id)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	// check if report exists
	if !rows.Next() {
		return nil, utils.NotFoundError{}
	}

	rep, err := scanRow(rows)
	if err != nil {
		return nil, err
	}
	rep.db = db

	return rep, nil
}

// scanRow is a simple helper function to read rows from the sql response for bit GetAllActive and Get
func scanRow(rows *sql.Rows) (*Report, error) {
	var (
		js  []byte
		js2 []byte
		js3 []byte
		rep Report
	)

	if err := rows.Scan(&rep.ID, &rep.ProjectID, &rep.Type, &rep.Timezone, &rep.Name, &rep.Address.Street,
		&rep.Address.City, &rep.Address.Country, &rep.Currency, &js,
		&rep.Active, &js2, &js3, &rep.CreatedAt); err != nil {
		return nil, err
	}
	if err := json.Unmarshal(js, &rep.Variables); err != nil {
		return nil, err
	}

	if err := json.Unmarshal(js2, &rep.Actions); err != nil {
		return nil, err
	}

	if err := json.Unmarshal(js3, &rep.Meta); err != nil {
		return nil, err
	}

	return &rep, nil
}
