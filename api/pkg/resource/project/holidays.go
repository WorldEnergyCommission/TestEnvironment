package project

import (
	"database/sql"
	"encoding/json"
	"time"
)

const (
	queryCurrentHolidays = `SELECT payload, created_at, created_by
	FROM public.project_holidays
	WHERE project_id = $1
	ORDER BY created_at DESC
	LIMIT 1;`
	queryAddHolidays = `INSERT INTO public.project_holidays
	(project_id, created_at, created_by, payload)
	VALUES($1, now(), $2, $3);`
)

type (
	Holidays struct {
		ProjectID  string         `json:"project_id"`
		Data       map[string]any `json:"data"`
		CreatedAt  time.Time      `json:"created_at"`
		CreatedyBy string         `json:"created_by"`
	}
)

func (r Repository) GetCurrentHolidays(project_id string) (Holidays, error) {
	var data string
	var created_at time.Time
	var created_by string

	err := r.Database.QueryRow(queryCurrentHolidays, project_id).Scan(&data, &created_at, &created_by)

	// Handle errors here or in api handler?
	if err == sql.ErrNoRows {
		return Holidays{}, nil
	}

	if err != nil {
		return Holidays{}, err
	}

	var dataMap map[string]any
	bytes := []byte(data)
	if err := json.Unmarshal(bytes, &dataMap); err != nil {
		return Holidays{}, err
	}

	return Holidays{
		ProjectID: project_id,
		CreatedAt: created_at, CreatedyBy: created_by, Data: dataMap,
	}, nil
}

func (r Repository) AddHolidays(project_id, user_id, data string) (Holidays, error) {
	_, err := r.Database.Exec(queryAddHolidays, project_id, user_id, data)
	if err != nil {
		return Holidays{}, err
	}

	return r.GetCurrentHolidays(project_id)
}
