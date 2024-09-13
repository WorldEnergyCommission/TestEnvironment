package project

import (
	"database/sql"
	"encoding/json"
	"time"
)

const (
	queryCurrentOperatingHours = `SELECT payload, created_at, created_by
	FROM public.project_operating_hours
	WHERE project_id = $1
	ORDER BY created_at DESC
	LIMIT 1;`
	queryAddOperatingHours = `INSERT INTO public.project_operating_hours
	(project_id, created_at, created_by, payload)
	VALUES($1, now(), $2, $3);`
)

type (
	OperatingHours struct {
		ProjectID  string         `json:"project_id"`
		Data       map[string]any `json:"data"`
		CreatedAt  time.Time      `json:"created_at"`
		CreatedyBy string         `json:"created_by"`
	}
)

func (r Repository) GetCurrentOperatingHours(project_id string) (OperatingHours, error) {
	var data string
	var created_at time.Time
	var created_by string

	err := r.Database.QueryRow(queryCurrentOperatingHours, project_id).Scan(&data, &created_at, &created_by)

	// Handle errors here or in api handler?
	if err == sql.ErrNoRows {
		return OperatingHours{}, nil
	}

	if err != nil {
		return OperatingHours{}, err
	}

	var dataMap map[string]any
	bytes := []byte(data)
	if err := json.Unmarshal(bytes, &dataMap); err != nil {
		return OperatingHours{}, err
	}

	return OperatingHours{
		ProjectID: project_id,
		CreatedAt: created_at, CreatedyBy: created_by, Data: dataMap,
	}, nil
}

func (r Repository) AddOperatingHours(project_id, user_id, data string) (OperatingHours, error) {
	_, err := r.Database.Exec(queryAddOperatingHours, project_id, user_id, data)
	if err != nil {
		return OperatingHours{}, err
	}

	return r.GetCurrentOperatingHours(project_id)
}
