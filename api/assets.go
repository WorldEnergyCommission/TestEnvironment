package main

import (
	"io"
	"net/http"

	"github.com/efficientIO/efficientIO/api/pkg/resource/asset"
	"github.com/gorilla/mux"
)

// assetProjectCreateHandler creates an asset for the respective project based on the file provided in the request.
//
//	@Summary      Create asset
//	@Description  Create an asset for a project
//	@Tags         Assets
//	@Accept       multipart/form-data
//	@Param        project_id path string true "Project ID"
//	@Param        file formData file true "Asset file"
//	@Security     OAuth2Application[createProjectAsset]
//	@Produce      json
//	@Success      200  {object}  string "Created asset"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/assets [post]
func assetProjectCreateHandler(w http.ResponseWriter, r *http.Request) {
	projectID := mux.Vars(r)["project_id"]

	err := r.ParseMultipartForm(32 << 20) // 32 MB
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	defer file.Close()

	s, err := assetRepo.Create(asset.CreateOptions{
		File:       &file,
		FileHeader: header,
		ProjectID:  projectID,
	})
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, s)
}

// assetGetHandler retrieves an asset by name and writes it to the response writer.
//
//	@Summary      Retrieve an asset
//	@Description  Retrieves an asset by name and writes it to the response writer.
//	@Tags         Assets
//	@Accept       json
//	@Produce      json
//	@Param        name path string true "Name of the asset"
//	@Success      200  {object}  any "Asset content"
//	@Failure      500  {object}  any "Internal server error"
//	@Router       /assets/{name} [get]
func assetGetHandler(w http.ResponseWriter, r *http.Request) {
	obj, err := assetRepo.Get(asset.GetOptions{Name: mux.Vars(r)["name"]})
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	defer obj.Close()

	w.Header().Set("Etag", mux.Vars(r)["name"])
	w.Header().Set("Cache-Control", "max-age=2592000")
	io.Copy(w, obj)
}
