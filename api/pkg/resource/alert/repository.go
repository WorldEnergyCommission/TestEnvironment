package alert

import (
	"database/sql"
	"time"

	"github.com/eneries/eneries/api/pkg/utils"
	"github.com/google/uuid"
	"github.com/lib/pq"
)

const (
	createQuery    = "INSERT INTO project_alert(id, project_id, body, type) VALUES ($1, $2, $3, $4)"
	acceptQuery    = "UPDATE project_alert SET accepted_by = $1, accepted_at = now() WHERE id = $2 AND project_id=$3 AND accepted_by IS NULL"
	acceptAllQuery = "UPDATE project_alert SET accepted_by = $1, accepted_at = now() WHERE project_id=$2 AND accepted_by IS NULL"
	getQuery       = "SELECT id, project_id, body, type, accepted_by, accepted_at, created_at FROM project_alert WHERE id = $1 AND project_id = $2"

	Success = 0
	Warning = 1
	Error   = 2
)

type Repository struct {
	Database *sql.DB
}
type Alert struct {
	ID         string     `json:"id"`
	ProjectID  string     `json:"project_id"`
	Body       string     `json:"body"`
	Type       int        `json:"type"`
	AcceptedBy *string    `json:"accepted_by"`
	AcceptedAt *time.Time `json:"accepted_at"`
	CreatedAt  time.Time  `json:"created_at"`
}
type CreateOptions struct {
	Body      string `json:"body"`
	Type      int    `json:"type"`
	ProjectID string `json:"project_id"`
}
type AcceptOptions struct {
	ID         string `json:"id"`
	ProjectID  string `json:"project_id"`
	AcceptedBy string `json:"accepted_by"`
}
type AcceptAllOptions struct {
	ProjectID  string `json:"project_id"`
	AcceptedBy string `json:"accepted_by"`
}
type GetOptions struct {
	ID        string `json:"id"`
	ProjectID string `json:"project_id"`
}
type ListOptions struct {
	ProjectID string `json:"project_id"`
	Offset    int    `json:"offset"`
	Limit     int    `json:"limit"`
	Filter    struct {
		Accepted *bool `json:"accepted"`
	}
}
type SummaryOptions struct {
	ProjectIDs *[]string `json:"project_ids"`
	UserID     string    `json:"user_id"`
	Limit      int       `json:"limit"`
}
type CountOptions = ListOptions

func (r Repository) Create(o CreateOptions) (Alert, error) {
	a := Alert{
		ID:        uuid.New().String(),
		Body:      o.Body,
		Type:      o.Type,
		ProjectID: o.ProjectID,
		CreatedAt: time.Now(),
	}

	if _, err := r.Database.Exec(createQuery, a.ID, a.ProjectID, a.Body, a.Type); err != nil {
		return Alert{}, err
	}

	return a, nil
}
func (r Repository) Accept(o AcceptOptions) (Alert, error) {
	if _, err := r.Database.Exec(acceptQuery, o.AcceptedBy, o.ID, o.ProjectID); err != nil {
		return Alert{}, err
	}

	return r.Get(GetOptions{ID: o.ID, ProjectID: o.ProjectID})
}
func (r Repository) AcceptAll(o AcceptAllOptions) error {
	if _, err := r.Database.Exec(acceptAllQuery, o.AcceptedBy, o.ProjectID); err != nil {
		return err
	}

	return nil
}
func (r Repository) Get(o GetOptions) (Alert, error) {
	var (
		a          Alert
		acceptedAt sql.NullTime
		acceptedBy sql.NullString
	)

	if err := r.Database.QueryRow(getQuery, o.ID, o.ProjectID).
		Scan(&a.ID, &a.ProjectID, &a.Body, &a.Type, &acceptedBy, &acceptedAt, &a.CreatedAt); err != nil {
		return Alert{}, err
	}

	if acceptedAt.Valid {
		a.AcceptedAt = &acceptedAt.Time
	}
	if acceptedBy.Valid {
		a.AcceptedBy = &acceptedBy.String
	}

	return a, nil
}

// Count is used to get the total result
func (r Repository) Count(o CountOptions) (int, error) {
	var count int

	listQuery := "SELECT COUNT(*) FROM project_alert WHERE project_id = $1"
	if o.Filter.Accepted != nil {
		listQuery += " AND accepted_at "
		if *o.Filter.Accepted {
			listQuery += " IS NOT NULL "
		} else {
			listQuery += " IS NULL "
		}
	}

	err := r.Database.QueryRow(listQuery, o.ProjectID).Scan(&count)
	if err != nil {
		utils.LogError(err, "")
		return 0, err
	}

	return count, nil
}

// List is made to use pagination. I will look in the future how to improve this
// and how to maybe enable better filtering
func (r Repository) List(o ListOptions) ([]Alert, error) {
	// build listQuery
	listQuery := "SELECT id, project_id, body, type, accepted_by, accepted_at, created_at FROM project_alert WHERE project_id = $1"

	// filter by accepted
	if o.Filter.Accepted != nil {
		listQuery += " AND accepted_at "
		if *o.Filter.Accepted {
			listQuery += " IS NOT NULL "
		} else {
			listQuery += " IS NULL "
		}
	}

	listQuery += "ORDER BY created_at DESC LIMIT $2 OFFSET $3"

	var alerts = make([]Alert, 0)

	rows, err := r.Database.Query(listQuery, o.ProjectID, o.Limit, o.Offset)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	for rows.Next() {
		var (
			a          Alert
			acceptedAt sql.NullTime
			acceptedBy sql.NullString
		)

		if err := rows.Scan(&a.ID, &a.ProjectID, &a.Body, &a.Type, &acceptedBy, &acceptedAt, &a.CreatedAt); err != nil {
			return nil, err
		}

		if acceptedAt.Valid {
			a.AcceptedAt = &acceptedAt.Time
		}
		if acceptedBy.Valid {
			a.AcceptedBy = &acceptedBy.String
		}

		alerts = append(alerts, a)
	}

	return alerts, nil
}

// Summary is used to get the last n alerts for which a user has access
func (r Repository) Summary(o SummaryOptions) ([]Alert, error) {
	listQuery := `SELECT pa.id, pa.project_id, pa.body, pa.type, pa.accepted_by, pa.accepted_at, pa.created_at 
	FROM project_alert pa
	JOIN  public.permissions_for_user pfu ON pa.project_id = pfu.project_id 
		WHERE pfu.permission_id = 'listAlert'
		AND pfu.user_id = $1
		AND accepted_at IS NULL `

	var rows *sql.Rows
	var err error
	// check projects are not empty and not nil
	if *o.ProjectIDs != nil && len(*o.ProjectIDs) > 0 {
		listQuery += " AND project_id = ANY($2)"
		listQuery += "ORDER BY pa.created_at DESC LIMIT $3"
		rows, err = r.Database.Query(listQuery, o.UserID, pq.Array(*o.ProjectIDs), o.Limit)
	} else {
		l := utils.GetLogger()
		l.Debug().Str("query", listQuery).Msg("No project ids provided")
		listQuery += "ORDER BY pa.created_at DESC LIMIT $2"
		rows, err = r.Database.Query(listQuery, o.UserID, o.Limit)
	}

	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	var alerts = make([]Alert, 0)
	for rows.Next() {
		var (
			a          Alert
			acceptedAt sql.NullTime
			acceptedBy sql.NullString
		)

		if err := rows.Scan(&a.ID, &a.ProjectID, &a.Body, &a.Type, &acceptedBy, &acceptedAt, &a.CreatedAt); err != nil {
			return nil, err
		}

		if acceptedAt.Valid {
			a.AcceptedAt = &acceptedAt.Time
		}
		if acceptedBy.Valid {
			a.AcceptedBy = &acceptedBy.String
		}

		alerts = append(alerts, a)
	}

	return alerts, nil

}
