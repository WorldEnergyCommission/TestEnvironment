package rule

import (
	"database/sql"
	"encoding/json"
	"reflect"
	"time"

	"github.com/efficientIO/efficientIO/api/pkg/utils"

	"github.com/google/uuid"
)

const (
	createQuery = "INSERT INTO project_rule (id, project_id, name, active, timeout, conditions, actions, schedule, created_manually) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)"
	updateQuery = "UPDATE project_rule SET name=$1, active = $2, timeout = $3, conditions = $4, actions = $5, schedule = $6 WHERE id = $7 AND project_id = $8"
	deleteQuery = "DELETE FROM project_rule WHERE id = $1 AND project_id = $2"
	getQuery    = "SELECT id, project_id, name, active, timeout, conditions, actions, schedule, created_manually, created_at FROM project_rule WHERE id = $1 AND project_id = $2"
	listQuery   = `	
	SELECT DISTINCT id, pr.project_id, name, active, timeout, conditions, actions, schedule, created_manually, 
	created_at FROM project_rule pr
	JOIN (
		SELECT case when tmp."rule" is not null then cast(tmp."rule" as uuid) else user_permission.rule_id end as rule_id, 
				project_id, 
				wildcard, 
				permission_id
		FROM public.permissions_for_user user_permission
		LEFT JOIN (select * from (
				select id, r->'data'->'meta'->>'errorRule' "rule" from models 
				union
				select id, r->'data'->'meta'->>'warningRule' "rule" from models
				) t1
			) tmp on user_permission.model_id = cast( tmp.id as uuid)
		WHERE user_permission.user_id = $2 and 
		(permission_id = 'readRule' OR permission_id = 'readAI')) scopes 
		on (scopes.project_id = pr.project_id OR scopes.project_id IS NULL) and (scopes.rule_id = pr.id OR scopes.wildcard = true)
	WHERE pr.project_id = $1`
	activeQuery = "SELECT id, project_id, name, active, timeout, conditions, actions, schedule, created_manually, created_at FROM project_rule WHERE active = true"
)

type Repository struct {
	Database *sql.DB
}
type Rule struct {
	ID              string         `json:"id"`
	ProjectID       string         `json:"-"`
	Name            string         `json:"name"`
	Active          bool           `json:"active"`
	Timeout         int64          `json:"timeout"`
	Conditions      []Condition    `json:"conditions"`
	Actions         []Action       `json:"actions"`
	Schedule        []ScheduleItem `json:"schedule"`
	CreatedManually bool           `json:"created_manually"`
	CreatedAt       time.Time      `json:"created_at"`
}
type CreateOptions struct {
	ProjectID       string         `json:"-"`
	Name            string         `json:"name"`
	Active          bool           `json:"active"`
	Timeout         int64          `json:"timeout"`
	CreatedManually bool           `json:"created_manually"`
	Conditions      []Condition    `json:"conditions"`
	Actions         []Action       `json:"actions"`
	Schedule        []ScheduleItem `json:"schedule"`
}
type UpdateOptions struct {
	ID         string         `json:"id"`
	ProjectID  string         `json:"-"`
	Name       string         `json:"name"`
	Active     bool           `json:"active"`
	Timeout    int64          `json:"timeout"`
	Conditions []Condition    `json:"conditions"`
	Actions    []Action       `json:"actions"`
	Schedule   []ScheduleItem `json:"schedule"`
}
type GetOptions struct {
	ID        string `json:"id"`
	ProjectID string `json:"project_id"`
}
type DeleteOptions = GetOptions
type ListOptions struct {
	ProjectID string `json:"project_id"`
	UserID    string `json:"user_id"`
}

func getDefaultScheduleIfEmpty(schedule []byte) []byte {
	if reflect.DeepEqual(schedule, []byte("null")) {
		return []byte("[]")
	} else {
		return schedule
	}
}

func (r Repository) Create(o CreateOptions) (*Rule, error) {
	rule := Rule{
		ID:              uuid.New().String(),
		ProjectID:       o.ProjectID,
		Name:            o.Name,
		Active:          o.Active,
		Timeout:         o.Timeout,
		Conditions:      o.Conditions,
		Actions:         o.Actions,
		Schedule:        o.Schedule,
		CreatedManually: o.CreatedManually,
		CreatedAt:       time.Now(),
	}

	conditions, err := json.Marshal(&rule.Conditions)
	if err != nil {
		return nil, err
	}
	actions, err := json.Marshal(&rule.Actions)
	if err != nil {
		return nil, err
	}
	schedule, err := json.Marshal(&rule.Schedule)
	if err != nil {
		return nil, err
	}

	if _, err := r.Database.Exec(createQuery, rule.ID, rule.ProjectID, rule.Name, rule.Active, rule.Timeout,
		conditions, actions, getDefaultScheduleIfEmpty(schedule), o.CreatedManually); err != nil {
		return nil, err
	}

	return &rule, err
}

func (r Repository) Update(o UpdateOptions) (*Rule, error) {
	conditions, err := json.Marshal(&o.Conditions)
	if err != nil {
		return nil, err
	}
	actions, err := json.Marshal(&o.Actions)
	if err != nil {
		return nil, err
	}
	schedule, err := json.Marshal(&o.Schedule)
	if err != nil {
		return nil, err
	}

	l := utils.GetLogger()
	l.Debug().Str("query", updateQuery).Str("id", o.ID).Str("project_id", o.ProjectID).Msg("Updating Rule")

	if _, err := r.Database.Exec(updateQuery, o.Name, o.Active, o.Timeout, conditions, actions,
		getDefaultScheduleIfEmpty(schedule), o.ID, o.ProjectID); err != nil {
		return nil, err
	}

	return r.Get(GetOptions{ID: o.ID, ProjectID: o.ProjectID})
}

func (r Repository) Delete(o DeleteOptions) error {
	_, err := r.Database.Exec(deleteQuery, o.ID, o.ProjectID)

	return err
}

func (r Repository) Get(o GetOptions) (*Rule, error) {
	rows, err := r.Database.Query(getQuery, o.ID, o.ProjectID)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	rules, err := scan(rows)
	if err != nil {
		return nil, err
	}
	if len(rules) == 0 {
		return nil, utils.NotFoundError{}
	}

	return &rules[0], nil
}

func (r Repository) List(o ListOptions) ([]Rule, error) {
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

	return scan(rows)
}

func (r Repository) ListActive() ([]Rule, error) {
	rows, err := r.Database.Query(activeQuery)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	return scan(rows)
}

func scan(rows *sql.Rows) ([]Rule, error) {
	rules := make([]Rule, 0)

	for rows.Next() {
		var (
			r          Rule
			err        error
			conditions []byte
			actions    []byte
			schedule   []byte
		)

		err = rows.Scan(&r.ID, &r.ProjectID, &r.Name, &r.Active, &r.Timeout, &conditions, &actions, &schedule, &r.CreatedManually, &r.CreatedAt)
		if err != nil {
			return nil, err
		}

		if err = json.Unmarshal(conditions, &r.Conditions); err != nil {
			return nil, err
		}
		if err = json.Unmarshal(actions, &r.Actions); err != nil {
			return nil, err
		}
		if err = json.Unmarshal(schedule, &r.Schedule); err != nil {
			return nil, err
		}

		rules = append(rules, r)
	}

	return rules, nil
}
