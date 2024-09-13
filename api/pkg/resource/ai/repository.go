package ai

import (
	"database/sql"

	"github.com/eneries/eneries/api/pkg/utils"
)

const (
	listQuery = `SELECT id
	FROM models m
	JOIN (
		SELECT user_permission.model_id, user_permission.project_id, wildcard, permission_id
		FROM public.permissions_for_user user_permission
		WHERE cast(user_permission.user_id as uuid) = cast( $2 as uuid) 
		AND permission_id = 'readAI' 
		AND (cast(user_permission.project_id as uuid)=cast( $1 as uuid) or user_permission.project_id is NULL)
	) scopes 
	ON (scopes.model_id = m.id or scopes.wildcard = true)
	where cast(m.r->>'project_id' as uuid) = cast( $1 as uuid)`
)

type (
	Repository struct {
		Database *sql.DB
	}
	ListOptions struct {
		ProjectID string `json:"project_id"`
		UserID    string `json:"user_id"`
	}
)

func (r Repository) List(o ListOptions) ([]string, error) {
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

	ids := make([]string, 0)
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}

		ids = append(ids, id)
	}

	return ids, nil
}
