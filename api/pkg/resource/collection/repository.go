package collection

import (
	"database/sql"
	"encoding/json"
	"time"

	"github.com/efficientIO/efficientIO/api/pkg/utils"

	"github.com/google/uuid"
)

const (
	createQuery = "INSERT INTO project_collection(id, name, project_id, meta, created_at) VALUES ($1, $2, $3, $4, $5)"
	updateQuery = "UPDATE project_collection SET name=$1, meta=$2 WHERE id=$3 AND project_id=$4"
	deleteQuery = "DELETE FROM project_collection WHERE id=$1"
	getQuery    = "SELECT id, name, project_id, meta, created_at FROM project_collection WHERE id=$1 AND project_id=$2"
	listQuery   = `SELECT DISTINCT id, name, col.project_id, meta, created_at 
					FROM project_collection col
					JOIN (
						SELECT 	case when pd.collection_id is not null then pd.collection_id 
								when cast(m.r->>'collection_id' as uuid) is not null then cast(m.r->>'collection_id' as uuid)
								else null end as collection_id, 
								user_permission.project_id, 
								wildcard, 
								permission_id
						FROM public.permissions_for_user user_permission
						LEFT JOIN public.project_device pd ON (user_permission.device_id = pd.id)
						LEFT JOIN public.models m ON (user_permission.model_id = m.id)
						WHERE (permission_id = 'readDevice' OR permission_id = 'readAI')
						AND user_permission.user_id = $2 ) scopes 
					ON (scopes.project_id = col.project_id OR scopes.project_id IS NULL) 
						AND (scopes.collection_id = col.id OR scopes.wildcard = true)
					WHERE col.project_id=$1`
	countQuery = "SELECT COUNT(*) FROM project_collection WHERE project_id=$1"
)

type Repository struct {
	Database *sql.DB
}
type Collection struct {
	ID        string         `json:"id"`
	Name      string         `json:"name"`
	ProjectID string         `json:"-"`
	Meta      map[string]any `json:"meta"`
	CreatedAt time.Time      `json:"created_at"`
}
type CreateOptions struct {
	Name      string         `json:"name"`
	Meta      map[string]any `json:"meta"`
	ProjectID string         `json:"project_id"`
}
type UpdateOptions struct {
	ID        string         `json:"id"`
	ProjectID string         `json:"project_id"`
	Name      string         `json:"name"`
	Meta      map[string]any `json:"meta"`
}
type DeleteOptions struct {
	ID string `json:"id"`
}
type GetOptions struct {
	ID        string `json:"id"`
	ProjectID string `json:"project_id"`
}
type ListOptions struct {
	ProjectID string `json:"project_id"`
	UserID    string `json:"user_id"`
}
type CountOptions = ListOptions

func (r Repository) Create(o CreateOptions) (Collection, error) {
	if o.Meta == nil {
		o.Meta = map[string]any{}
	}

	c := Collection{
		ID:        uuid.New().String(),
		Name:      o.Name,
		ProjectID: o.ProjectID,
		Meta:      o.Meta,
		CreatedAt: time.Now(),
	}

	js, err := json.Marshal(&o.Meta)
	if err != nil {
		return Collection{}, err
	}

	_, err = r.Database.Exec(createQuery, c.ID, c.Name, c.ProjectID, js, c.CreatedAt)
	if err != nil {
		return Collection{}, err
	}

	return c, nil
}
func (r Repository) Update(o UpdateOptions) (Collection, error) {
	if o.Meta == nil {
		o.Meta = map[string]any{}
	}

	js, err := json.Marshal(&o.Meta)
	if err != nil {
		return Collection{}, err
	}

	_, err = r.Database.Exec(updateQuery, o.Name, js, o.ID, o.ProjectID)
	if err != nil {
		return Collection{}, err
	}

	return r.Get(GetOptions{ProjectID: o.ProjectID, ID: o.ID})
}
func (r Repository) Delete(opts DeleteOptions) error {
	_, err := r.Database.Exec(deleteQuery, opts.ID)
	return err
}
func (r Repository) Get(o GetOptions) (Collection, error) {
	rows, err := r.Database.Query(getQuery, o.ID, o.ProjectID)
	if err != nil {
		return Collection{}, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	if !rows.Next() {
		return Collection{}, utils.NotFoundError{}
	}

	var (
		c  Collection
		js []byte
	)
	if err := rows.Scan(&c.ID, &c.Name, &c.ProjectID, &js, &c.CreatedAt); err != nil {
		return Collection{}, err
	}
	if err := json.Unmarshal(js, &c.Meta); err != nil {
		return Collection{}, err
	}

	return c, nil
}
func (r Repository) List(o ListOptions) ([]Collection, error) {
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

	collections := make([]Collection, 0)
	for rows.Next() {
		var (
			c  Collection
			js []byte
		)
		if err := rows.Scan(&c.ID, &c.Name, &c.ProjectID, &js, &c.CreatedAt); err != nil {
			return nil, err
		}
		if err := json.Unmarshal(js, &c.Meta); err != nil {
			return nil, err
		}

		collections = append(collections, c)
	}

	return collections, nil
}

func (r Repository) Count(o CountOptions) (int, error) {
	var (
		count int
		err   error
	)

	err = r.Database.QueryRow(countQuery, o.ProjectID).Scan(&count)
	return count, err
}
