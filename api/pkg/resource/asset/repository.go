package asset

import (
	"context"
	"database/sql"
	"mime/multipart"

	"github.com/efficientIO/efficientIO/api/pkg/utils"

	"github.com/google/uuid"
	_ "github.com/lib/pq"
	"github.com/minio/minio-go/v7"
)

const (
	createQuery             = "INSERT INTO asset(id, project_id) VALUES($1, $2)"
	listForProjectQuery     = "SELECT id, project_id, created_at FROM asset WHERE project_id = $1"
	listWithoutProjectQuery = "SELECT id, created_at FROM asset WHERE project_id is null"
	deleteQuery             = "DELETE FROM asset WHERE id = $1"
)

type Repository struct {
	Database *sql.DB
	Storage  *minio.Client
	Bucket   string
}
type CreateOptions struct {
	File       *multipart.File       `json:"file"`
	FileHeader *multipart.FileHeader `json:"file_header"`
	ProjectID  string
}
type GetOptions struct {
	Name string `json:"name"`
}

func (r Repository) Create(o CreateOptions) (string, error) {
	id := uuid.New().String()

	if _, err := r.Storage.PutObject(context.Background(), r.Bucket, id, *o.File, o.FileHeader.Size, minio.PutObjectOptions{
		ContentType: o.FileHeader.Header.Get("Content-Type"),
	}); err != nil {
		return "", err
	}
	var err error

	_, err = r.Database.Exec(createQuery, id, o.ProjectID)

	if err != nil {
		return "", err
	}

	return id, nil
}

func (r Repository) Get(o GetOptions) (*minio.Object, error) {
	return r.Storage.GetObject(context.Background(), r.Bucket, o.Name, minio.GetObjectOptions{})
}

func (r Repository) DeleteAssetsForProject(project_id string) error {
	rows, err := r.Database.Query(listForProjectQuery, project_id)
	if err != nil {
		return err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	for rows.Next() {
		var (
			id         string
			created_at string
			pd_id      string
			err        error
		)
		if err = rows.Scan(&id, &pd_id, &created_at); err != nil {
			return err
		}

		err = r.Storage.RemoveObject(context.Background(), r.Bucket, id, minio.RemoveObjectOptions{})

		if err != nil {
			return err
		}
	}

	return nil
}

func (r Repository) RemoveAssetsWithoutProject() error {
	rows, err := r.Database.Query(listWithoutProjectQuery)
	if err != nil {
		return err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	for rows.Next() {
		var (
			id         string
			created_at string
			err        error
		)
		if err = rows.Scan(&id, &created_at); err != nil {
			return err
		}
		err = r.Storage.RemoveObject(context.Background(), r.Bucket, id, minio.RemoveObjectOptions{})
		if err != nil {
			utils.LogError(err, "")
		}
		_, err = r.Database.Exec(deleteQuery, id)

		if err != nil {
			utils.LogError(err, "")
			return err
		}
	}

	return nil
}
