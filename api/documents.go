package main

import (
	"encoding/json"
	"net/http"

	"github.com/efficientIO/efficientIO/api/pkg/resource/document"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

// documentsListHandler handles the HTTP request for listing documents.
//
//	@Summary      List documents
//	@Description  List documents for a project
//	@Tags         Documents
//	@Accept       json
//	@Param        project_id path string true "Project ID"
//	@Security     OAuth2Application[listDocument]
//	@Produce      json
//	@Success      200  {object}  []document.Document "List of documents"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/documents [get]
func documentsListHandler(w http.ResponseWriter, r *http.Request) {
	projectId := mux.Vars(r)["project_id"]
	userID := r.Header.Get("x-user")
	assets, err := documentRepo.List(document.ListOptions{ProjectID: projectId, UserID: userID})
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	for i, a := range assets {
		u, err := documentRepo.Get(document.GetOptions{ProjectID: projectId, ID: a.ID})
		if err != nil {
			reject(w, r, http.StatusInternalServerError, err.Error())
			return
		}
		assets[i].Href = u
	}

	respond(w, http.StatusOK, assets)
}

// Document Create Response
//
//	@Description  Repsonse object after creating a document, with the presigned URL
type DocumentCreateResponse struct {
	// Presigned url to allow for post operations to storage
	UploadUrl string `json:"upload_url" example:"s3.efficientio.io/341234-asdf-14asdf-1243asdf"`
	// Form data to be used in the post request
	Form map[string]string `json:"form" `
	// Meta data about the document
	Asset document.Document `json:"asset"`
} //	@name DocumentCreateResponse

// documentsCreateHandler creates a new document with the provided options.
//
//	@Summary      Create document
//	@Description  Create a new document with the specified options
//	@Tags         Documents
//	@Accept       json
//	@Param        opts body document.CreateOptions true "The options for creating the document"
//	@Security     OAuth2Application[createDocument]
//	@Produce      json
//	@Success      200  {object}  main.DocumentCreateResponse "The upload URL, form data, and asset information"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/documents [post]
func documentsCreateHandler(w http.ResponseWriter, r *http.Request) {
	var opts document.CreateOptions
	if err := json.NewDecoder(r.Body).Decode(&opts); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	if len(opts.Name) < 1 || len(opts.Name) > 100 {
		reject(w, r, http.StatusBadRequest, "length must be between 1 and 100 characters")
		return
	}

	if len(opts.ContentType) < 1 || len(opts.ContentType) > 256 {
		reject(w, r, http.StatusBadRequest, "content_type must be between 1 and 256 characters")
		return
	}

	// if the size is bigger than 20mb
	if opts.Size < 1 || opts.Size > 20_000_000 {
		reject(w, r, http.StatusBadRequest, "size must be between 1 and 10^6 bytes")
		return
	}

	opts.ProjectID = mux.Vars(r)["project_id"]
	opts.ID = uuid.New().String()

	assetUrl, formData, asset1, err := documentRepo.Create(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	repsoneObject := DocumentCreateResponse{
		UploadUrl: assetUrl.String(),
		Form:      formData,
		Asset:     asset1}
	respond(w, http.StatusOK, repsoneObject)
}

// documentsDeleteHandler deletes a document based on the provided document ID and project ID.
//
//	@Summary      Delete a document
//	@Description  Delete a document by ID and project ID
//	@Tags         Documents
//	@Accept       json
//	@Param        document_id path string true "Document ID"
//	@Param        project_id path string true "Project ID"
//	@Security     OAuth2Application[deleteDocument]
//	@Produce      json
//	@Success      200  {object}  nil "Document deleted successfully"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/documents/{document_id} [delete]
func documentsDeleteHandler(w http.ResponseWriter, r *http.Request) {
	opts := document.DeleteOptions{
		ID:        mux.Vars(r)["document_id"],
		ProjectID: mux.Vars(r)["project_id"],
	}

	if err := documentRepo.Delete(opts); err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
	}
}

// Document Create Response
//
//	@Description  Repsonse object after creating a document, with the id for the multipart upload
type DocumentCreateMultipartResponse struct {
	// UploaID for the multipart upload, used for refenrece when getting presigned part URLs
	UploadID string `json:"upload_id"`
	// Meta data about the document
	Asset document.Document `json:"asset"`
} //	@name DocumentCreateMultipartResponse

// documentsCreateMultipartHandler creates a new multipart document.
//
//	@Summary      Create multipart document
//	@Description  Create a new multipart document with the specified options.
//	@Tags         Documents
//	@Accept       json
//	@Param        opts body document.CreateOptions true "The options for creating the document"
//	@Security     OAuth2Application[createDocument]
//	@Produce      json
//	@Success      200  {object}  main.DocumentCreateMultipartResponse "Upload ID and new asset"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/documents/multipart [post]
func documentsCreateMultipartHandler(w http.ResponseWriter, r *http.Request) {
	var opts document.CreateOptions
	if err := json.NewDecoder(r.Body).Decode(&opts); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	if len(opts.Name) < 1 || len(opts.Name) > 100 {
		reject(w, r, http.StatusBadRequest, "length must be between 1 and 100 characters")
		return
	}

	if len(opts.ContentType) < 1 || len(opts.ContentType) > 256 {
		reject(w, r, http.StatusBadRequest, "content_type must be between 1 and 256 characters")
		return
	}

	opts.ProjectID = mux.Vars(r)["project_id"]
	opts.ID = uuid.New().String()

	uploadID, newAsset, err := documentRepo.CreateMulitpart(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	responseObject := DocumentCreateMultipartResponse{
		UploadID: uploadID,
		Asset:    newAsset}

	respond(w, http.StatusOK, responseObject)
}

type PresignedPartResponse struct {
	// Presigned url to allow for post operations to storage
	Url string `json:"url" example:"s3.efficientio.io/341234-asdf-14asdf-1243asdf"`
} //	@name PresignedPartResponse

// documentsGetSignedPartUrlHandler handles the request to get the signed part URL for a document.
//
//	@Summary      Get signed part URL for a document
//	@Description  Retrieves the signed part URL for a specific part of a document.
//	@Tags         Documents
//	@Accept       json
//	@Param        opts body document.SignedPartOptions true "The options for creating the part"
//	@Param        project_id path string true "Project ID"
//	@Param        part_number path string true "Part number"
//	@Param        document_id path string true "Document ID"
//	@Security     OAuth2Application[createDocument]
//	@Produce      json
//	@Success      200  {object}  main.PresignedPartResponse "URL of the signed part"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/documents/{document_id}/multipart/part/{part_number} [put]
func documentsGetSignedPartUrlHandler(w http.ResponseWriter, r *http.Request) {
	var opts document.SignedPartOptions
	if err := json.NewDecoder(r.Body).Decode(&opts); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	opts.ProjectID = mux.Vars(r)["project_id"]
	opts.PartNumber = mux.Vars(r)["part_number"]
	opts.ID = mux.Vars(r)["document_id"]

	url, err := documentRepo.GetSignedPartURL(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, map[string]any{
		"url": url,
	})
}

// documentsCompleteMultipartHandler completes a multipart upload for a document.
//
//	@Summary      Complete multipart upload for a document
//	@Description  Completes a multipart upload for a document in the API.
//	@Tags         Documents
//	@Accept       json
//	@Param        project_id path string true "The ID of the project"
//	@Param        document_id path string true "The ID of the document"
//	@Security     OAuth2Application[createDocument]
//	@Produce      json
//	@Success      200  {object}  nil "Successful completion of multipart upload"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/documents/{document_id}/multipart/complete [put]
func documentsCompleteMultipartHandler(w http.ResponseWriter, r *http.Request) {
	var opts document.CompleteOptions
	if err := json.NewDecoder(r.Body).Decode(&opts); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	opts.ProjectID = mux.Vars(r)["project_id"]
	opts.ID = mux.Vars(r)["document_id"]

	err := documentRepo.CompleteMultipartUpload(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, nil)
}
