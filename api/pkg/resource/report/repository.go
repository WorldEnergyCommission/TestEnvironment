package report

import (
	"database/sql"
	"encoding/json"
	"time"

	"github.com/efficientIO/efficientIO/api/pkg/utils"

	"github.com/google/uuid"
)

const (
	createQuery = `INSERT INTO project_report(id, project_id, type, timezone, name, 
				   address_street, address_city, address_country, currency, 
				   variables, active, actions, meta, created_at) VALUES 
				   ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`
	updateQuery = `UPDATE project_report SET name=$1, timezone=$2, address_street=$3, 
				   address_city=$4, address_country=$5, currency = $6, 
				   variables=$7, active=$8, actions=$9, meta=$10 WHERE id=$11 
				   AND project_id=$12`
	deleteQuery = `DELETE FROM project_report WHERE id = $1 AND project_id = $2`
	getQuery    = `SELECT id, project_id, type, timezone, name, address_street, address_city, 
				   address_country, currency, variables, active, actions, meta,
				   created_at FROM project_report WHERE id = $1 
				   AND project_id = $2`
	listQuery = `SELECT DISTINCT id, pr.project_id, type, timezone, name, address_street, address_city, 
				 address_country, currency, variables, active, actions, meta,
				 created_at FROM project_report pr
				 JOIN (
					SELECT report_id, project_id, wildcard, permission_id
					FROM public.permissions_for_user user_permission
					where user_permission.user_id = $2 and permission_id = 'readReport') scopes 
					on (scopes.project_id = pr.project_id or scopes.project_id is NULL) and (scopes.report_id = pr.id or scopes.wildcard = true)
				WHERE pr.project_id = $1`
)

type Repository struct {
	Database *sql.DB
}
type Address struct {
	Street  string `json:"street"`
	City    string `json:"city"`
	Country string `json:"country"`
}
type Report struct {
	ID        string         `json:"id"`
	Type      string         `json:"type"`
	ProjectID string         `json:"-"`
	Timezone  string         `json:"timezone"`
	Name      string         `json:"name"`
	Address   Address        `json:"address"`
	Currency  string         `json:"currency"`
	Variables []Variable     `json:"variables"`
	CreatedAt time.Time      `json:"created_at"`
	Active    bool           `json:"active"`
	Actions   []Action       `json:"actions"`
	Meta      map[string]any `json:"meta"`
}

type Action struct {
	Type   string `json:"type"`
	Format string `json:"format"`
	Params struct {
		Recipients []string          `json:"recipients"`
		Subject    string            `json:"subject"`
		URL        string            `json:"url"`
		Method     string            `json:"method"`
		Headers    map[string]string `json:"headers"`
		Body       string            `json:"body"`
	} `json:"params"`
}

type Variable struct {
	Name     string  `json:"name"`
	Title    string  `json:"title"`
	Unit     string  `json:"unit"`
	UnitCost float64 `json:"unit_cost"`

	// these values will be applied programmatically
	// when getting a report (GET), because they are
	// needed for the report application
	// I don't think I will need them again anyways
	// since all the stuff is handeled by the report
	// service
	StartValue *float64 `json:"start_value,omitempty"`
	EndValue   *float64 `json:"end_value,omitempty"`
}
type CreateOptions struct {
	ProjectID string         `json:"project_id"`
	Type      string         `json:"type"`
	Timezone  string         `json:"timezone"`
	Name      string         `json:"name"`
	Address   Address        `json:"address"`
	Currency  string         `json:"currency"`
	Variables []Variable     `json:"variables"`
	Active    bool           `json:"active"`
	Actions   []Action       `json:"actions"`
	Meta      map[string]any `json:"meta"`
}
type UpdateOptions struct {
	ID        string         `json:"id"`
	ProjectID string         `json:"project_id"`
	Timezone  string         `json:"timezone"`
	Name      string         `json:"name"`
	Address   Address        `json:"address"`
	Currency  string         `json:"currency"`
	Variables []Variable     `json:"variables"`
	Active    bool           `json:"active"`
	Actions   []Action       `json:"actions"`
	Meta      map[string]any `json:"meta"`
}
type DeleteOptions struct {
	ID        string `json:"id"`
	ProjectID string `json:"project_id"`
}
type ListOptions struct {
	ProjectID string `json:"project_id"`
	UserID    string `json:"user_id"`
}
type GetOptions struct {
	ID        string `json:"id"`
	ProjectID string `json:"project_id"`

	// for generating the report
	Start time.Time `json:"start"`
	End   time.Time `json:"end"`
}

func (r Repository) Create(o CreateOptions) (Report, error) {
	if o.Variables == nil {
		o.Variables = []Variable{}
	}
	if o.Actions == nil {
		o.Actions = []Action{}
	}
	if o.Meta == nil {
		o.Meta = make(map[string]any)
	}

	rep := Report{
		ID:        uuid.New().String(),
		Type:      o.Type,
		ProjectID: o.ProjectID,
		Name:      o.Name,
		Address:   o.Address,
		Variables: o.Variables,
		Currency:  o.Currency,
		Active:    o.Active,
		Actions:   o.Actions,
		Meta:      o.Meta,
		Timezone:  o.Timezone,
		CreatedAt: time.Now(),
	}

	// if, for whatever reason, somebody knows
	// about these properties, delete them
	for i := 0; i < len(o.Variables); i++ {
		o.Variables[i].EndValue = nil
		o.Variables[i].StartValue = nil
	}

	js, err := json.Marshal(&o.Variables)
	if err != nil {
		return Report{}, err
	}

	js2, err := json.Marshal(&o.Actions)
	if err != nil {
		return Report{}, err
	}

	js3, err := json.Marshal(&o.Meta)
	if err != nil {
		return Report{}, err
	}

	_, err = r.Database.Exec(createQuery, rep.ID, rep.ProjectID, rep.Type,
		rep.Timezone, rep.Name, rep.Address.Street, rep.Address.City,
		rep.Address.Country, rep.Currency, js, rep.Active, js2, js3,
		rep.CreatedAt)
	return rep, err
}

func (r Repository) Update(o UpdateOptions) (Report, error) {
	if o.Variables == nil {
		o.Variables = []Variable{}
	}
	if o.Actions == nil {
		o.Actions = []Action{}
	}
	if o.Meta == nil {
		o.Meta = make(map[string]any)
	}

	// if, for whatever reason, somebody knows
	// about these properties, delete them
	for i := 0; i < len(o.Variables); i++ {
		o.Variables[i].EndValue = nil
		o.Variables[i].StartValue = nil
	}

	js, err := json.Marshal(&o.Variables)
	if err != nil {
		return Report{}, err
	}

	js2, err := json.Marshal(&o.Actions)
	if err != nil {
		return Report{}, err
	}

	js3, err := json.Marshal(&o.Meta)
	if err != nil {
		return Report{}, err
	}
	_, err = r.Database.Exec(updateQuery, o.Name, o.Timezone, o.Address.Street,
		o.Address.City, o.Address.Country, o.Currency, js, o.Active, js2, js3,
		o.ID, o.ProjectID)
	if err != nil {
		return Report{}, err
	}

	return r.Get(GetOptions{ID: o.ID, ProjectID: o.ProjectID})
}

func (r Repository) List(o ListOptions) ([]Report, error) {
	rows, err := r.Database.Query(listQuery, o.ProjectID, o.UserID)
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
		var (
			js  []byte
			js2 []byte
			js3 []byte
			rep Report
		)

		if err := rows.Scan(&rep.ID, &rep.ProjectID, &rep.Type, &rep.Timezone,
			&rep.Name, &rep.Address.Street, &rep.Address.City,
			&rep.Address.Country, &rep.Currency, &js, &rep.Active, &js2, &js3,
			&rep.CreatedAt); err != nil {
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

		reports = append(reports, rep)
	}

	return reports, nil

}

func (r Repository) Get(o GetOptions) (Report, error) {
	rows, err := r.Database.Query(getQuery, o.ID, o.ProjectID)
	if err != nil {
		return Report{}, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	// check if report exists
	if !rows.Next() {
		return Report{}, utils.NotFoundError{}
	}

	var (
		js  []byte
		js2 []byte
		js3 []byte
		rep Report
	)

	if err := rows.Scan(&rep.ID, &rep.ProjectID, &rep.Type, &rep.Timezone,
		&rep.Name, &rep.Address.Street, &rep.Address.City,
		&rep.Address.Country, &rep.Currency, &js, &rep.Active, &js2, &js3,
		&rep.CreatedAt); err != nil {
		return Report{}, err
	}
	if err := json.Unmarshal(js, &rep.Variables); err != nil {
		return Report{}, err
	}
	if err := json.Unmarshal(js2, &rep.Actions); err != nil {
		return Report{}, err
	}
	if err := json.Unmarshal(js3, &rep.Meta); err != nil {
		return Report{}, err
	}

	return rep, nil
}

func (r Repository) Delete(o DeleteOptions) error {
	_, err := r.Database.Exec(deleteQuery, o.ID, o.ProjectID)
	return err
}
