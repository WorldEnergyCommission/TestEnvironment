package document

import (
	"context"
	"database/sql"
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/eneries/eneries/api/pkg/utils"
	"github.com/minio/minio-go/v7"
	"github.com/rs/zerolog"
)

var (
	// environment variable for the domain
	envDomain = os.Getenv("DOMAIN")
)

const (
	createQuery = "INSERT INTO project_document (id, project_id, name, content_type, size, created_at) VALUES ($1, $2, $3, $4, $5, $6)"
	deleteQuery = "DELETE FROM project_document WHERE id = $1 AND project_id = $2"
	listQuery   = `SELECT DISTINCT pd.id, pd.project_id, pd."name", pd.content_type, pd."size", pd.created_at 
	FROM project_document pd
	JOIN permissions_for_user pfu on (pd.id = pfu.document_id OR (pfu.wildcard = true AND (pfu.project_id IS NULL OR pfu.project_id = pd.project_id)))
	WHERE pd.project_id = $1 AND pfu.permission_id = 'readDocument'
	AND pfu.user_id = $2`
	getQuery = "SELECT name, content_type, size FROM project_document WHERE id = $1 AND project_id = $2"
)

var (
	presignExpiration = (10 * time.Minute)
)

type Repository struct {
	Database   *sql.DB
	Storage    *minio.Client
	CoreClient *minio.Core
	Bucket     string
}
type Document struct {
	ID          string    `json:"id"`
	ProjectID   string    `json:"-"`
	Name        string    `json:"name"`
	Size        int       `json:"size"`
	ContentType string    `json:"content_type"`
	Href        string    `json:"href"` // the href will be computed, not saved in the db
	CreatedAt   time.Time `json:"created_at"`
}
type CreateOptions struct {
	ID          string `json:"id"`
	ProjectID   string `json:"project_id"`
	Name        string `json:"name"`
	ContentType string `json:"content_type"`
	Size        int    `json:"size"`
}
type DeleteOptions struct {
	ID        string `json:"id"`
	ProjectID string `json:"project_id"`
}
type GetOptions struct {
	ID        string `json:"id"`
	ProjectID string `json:"project_id"`
}
type ListOptions struct {
	ProjectID string `json:"project_id"`
	UserID    string
}

func (r Repository) Create(o CreateOptions) (url.URL, map[string]string, Document, error) {
	// create presigned policy link
	policy := minio.NewPostPolicy()
	_ = policy.SetBucket(r.Bucket)
	_ = policy.SetKey(o.ProjectID + "/" + o.ID)
	_ = policy.SetExpires(time.Now().UTC().Add(presignExpiration)) // link is only valid for 10 minutes from now
	_ = policy.SetContentType(o.ContentType)
	_ = policy.SetContentLengthRange(int64(o.Size), int64(o.Size))

	u, formData, err := r.Storage.PresignedPostPolicy(context.Background(), policy)
	if err != nil {
		return url.URL{}, nil, Document{}, err
	}

	if _, err := r.Database.Exec(createQuery, o.ID, o.ProjectID, o.Name, o.ContentType, o.Size, time.Now()); err != nil {
		return url.URL{}, nil, Document{}, err
	}

	a := &Document{
		ID:          o.ID,
		Name:        o.Name,
		Size:        o.Size,
		ContentType: o.ContentType,
		Href:        "https://static." + envDomain + "/" + r.Bucket + "/" + o.ID,
		CreatedAt:   time.Now(),
	}

	return *u, formData, *a, nil
}
func (r Repository) Get(o GetOptions) (string, error) {
	rows, err := r.Database.Query(getQuery, o.ID, o.ProjectID)
	if err != nil {
		return "", err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	// check if file exists
	if !rows.Next() {
		return "", utils.NotFoundError{}
	}

	var doc Document
	if err := rows.Scan(&doc.Name, &doc.ContentType, &doc.Size); err != nil {
		return "", err
	}

	reqParams := make(url.Values)
	reqParams.Set("response-content-disposition", "attachment;filename=\""+doc.Name+"\"")
	reqParams.Set("content-type", doc.ContentType+";")

	presignedURL, err := r.Storage.PresignedGetObject(context.Background(), r.Bucket, o.ProjectID+"/"+o.ID, time.Minute*5, reqParams)
	if err != nil {
		return "", err
	}

	return presignedURL.String(), nil
}
func (r Repository) Delete(o DeleteOptions) error {
	_, err := r.Database.Exec(deleteQuery, o.ID, o.ProjectID)
	if err != nil {
		return err
	}

	// fail silently for now
	name := o.ProjectID + "/" + o.ID
	_ = r.Storage.RemoveObject(context.Background(), r.Bucket, name, minio.RemoveObjectOptions{})

	return err
}
func (r Repository) DeleteAll(o DeleteOptions) error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// right now it throws errors gracefully
	ch := r.Storage.ListObjects(ctx, r.Bucket, minio.ListObjectsOptions{Prefix: o.ID, Recursive: true})
	for object := range ch {
		if object.Err != nil {
			utils.LogError(object.Err, "")
			continue
		}

		if err := r.Storage.RemoveObject(ctx, r.Bucket, object.Key, minio.RemoveObjectOptions{}); err != nil {
			utils.LogError(err, "")
			continue
		}

	}

	return nil
}
func (r Repository) List(o ListOptions) ([]Document, error) {
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

	assets := make([]Document, 0)
	for rows.Next() {
		var a Document
		if err := rows.Scan(&a.ID, &a.ProjectID, &a.Name, &a.ContentType, &a.Size, &a.CreatedAt); err != nil {
			return nil, err
		}

		assets = append(assets, a)
	}

	return assets, nil
}

// Multipart section
// Following functions are used to create multipart uploads
// First create multipart upload
// then get presigned put url for every part
// after all parts are uploaded complete multipart upload

func (r Repository) CreateMulitpart(o CreateOptions) (string, Document, error) {
	// create multipart upload
	opts := minio.PutObjectOptions{DisableMultipart: false}
	uploadID, err := r.CoreClient.NewMultipartUpload(context.Background(), r.Bucket, o.ProjectID+"/"+o.ID, opts)
	if err != nil {
		return uploadID, Document{}, err
	}

	if _, err := r.Database.Exec(createQuery, o.ID, o.ProjectID, o.Name, o.ContentType, o.Size, time.Now()); err != nil {
		return uploadID, Document{}, err
	}

	a := Document{
		ID:          o.ID,
		Name:        o.Name,
		Size:        o.Size,
		ContentType: o.ContentType,
		Href:        "https://static." + envDomain + "/" + r.Bucket + "/" + o.ID,
		CreatedAt:   time.Now(),
	}

	return uploadID, a, nil

}

type SignedPartOptions struct {
	ID         string `json:"id"`
	ProjectID  string
	PartNumber string
	UploadID   string `json:"upload_id"`
}

func (r Repository) GetSignedPartURL(o SignedPartOptions) (string, error) {
	reqParams := url.Values{}

	reqParams.Add("partNumber", o.PartNumber)
	reqParams.Add("uploadId", o.UploadID)

	url, err := r.CoreClient.Presign(context.Background(),
		http.MethodPut,
		r.Bucket,
		o.ProjectID+"/"+o.ID,
		presignExpiration,
		reqParams)

	if err != nil {
		return "", err
	}

	return url.String(), nil
}

type (
	CompletedPart struct {
		// Part number identifies the part.
		PartNumber int    `json:"part_number"`
		ETag       string `json:"etag"`
	}

	CompleteOptions struct {
		Parts     CompletedParts `json:"parts"`
		ProjectID string
		ID        string `json:"id"`
		UploadID  string `json:"upload_id"`
	}
)

func (u CompletedPart) MarshalZerologObject(e *zerolog.Event) {
	e.Int("PartNumber", u.PartNumber).
		Str("ETag", u.ETag)
}

type CompletedParts []CompletedPart

func (pp CompletedParts) MarshalZerologArray(a *zerolog.Array) {
	for _, p := range pp {
		a.Object(p)
	}
}

func (r Repository) CompleteMultipartUpload(o CompleteOptions) error {
	// complete multipart upload

	opts := minio.PutObjectOptions{DisableMultipart: false}
	// Map parts to minio type
	parts := []minio.CompletePart{}
	for _, v := range o.Parts {
		parts = append(parts, minio.CompletePart{
			PartNumber: v.PartNumber,
			ETag:       v.ETag,
		})
	}
	// complete upload
	_, err := r.CoreClient.CompleteMultipartUpload(context.Background(), r.Bucket, o.ProjectID+"/"+o.ID, o.UploadID, parts, opts)
	if err != nil {
		return err
	}
	return nil
}
