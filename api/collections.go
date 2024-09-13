package main

import (
	"encoding/json"
	"net/http"

	"github.com/eneries/eneries/api/pkg/resource/collection"
	"github.com/eneries/eneries/api/pkg/resource/project"

	"github.com/gorilla/mux"
)

// collectionsCreateHandler creates a new collection for the specified project.
// @Summary      Create collection
//
//	@Description  Create a new collection for a project
//	@Tags         Collections
//	@Accept       json
//	@Param        project_id path string true "ID of the project"
//	@Param        opts body collection.CreateOptions true "Options for creating the collection"
//	@Produce      json
//	@Success      200  {object}  collection.Collection "Created collection"
//	@Failure      400  {object}  map[string]any{} "Bad request"
//	@Failure      500  {object}  map[string]any{} "Internal server error"
//	@Router       /projects/{project_id}/collections [post]
func collectionsCreateHandler(w http.ResponseWriter, r *http.Request) {
	projectID := mux.Vars(r)["project_id"]

	var opts collection.CreateOptions
	if err := json.NewDecoder(r.Body).Decode(&opts); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	opts.ProjectID = projectID

	// validate if the collection can be created...
	limits, err := projectRepo.Limits(project.LimitOptions{ID: projectID})
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	count, err := collectionRepo.Count(collection.CountOptions{ProjectID: projectID})
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	if count >= limits.Collections {
		reject(w, r, http.StatusBadRequest, "limit reached")
		return
	}

	c, err := collectionRepo.Create(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, c)
}

// collectionsListHandler handles the HTTP request for listing collections.
// @Summary      List collections
//
//	@Description  List collections for a project
//	@Tags         Collections
//	@Accept       json
//	@Param        project_id path string true "Project ID"
//	@Produce      json
//	@Success      200  {object}  []collection.Collection "List of collections"
//	@Failure      400  {object}  map[string]any{} "Bad request"
//	@Failure      500  {object}  map[string]any{} "Internal server error"
//	@Router       /projects/{project_id}/collections [get]
func collectionsListHandler(w http.ResponseWriter, r *http.Request) {
	opts := collection.ListOptions{
		ProjectID: mux.Vars(r)["project_id"],
		UserID:    r.Header.Get("x-user"),
	}

	collections, err := collectionRepo.List(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, collections)
}

// collectionsGetHandler retrieves a collection based on the provided collection ID and project ID.
// @Summary      Get a collection
//
//	@Description  Get a collection by collection ID and project ID
//	@Tags         Collections
//	@Accept       json
//	@Param        collection_id path string true "Collection ID"
//	@Param        project_id path string true "Project ID"
//	@Produce      json
//	@Success      200  {object}  collection.Collection "The retrieved collection"
//	@Failure      400  {object}  map[string]any{} "Bad request"
//	@Failure      500  {object}  map[string]any{} "Internal server error"
//	@Router       /projects/{project_id}/collections/{collection_id} [get]
func collectionsGetHandler(w http.ResponseWriter, r *http.Request) {
	opts := collection.GetOptions{
		ID:        mux.Vars(r)["collection_id"],
		ProjectID: mux.Vars(r)["project_id"],
	}

	c, err := collectionRepo.Get(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, c)
}

// collectionsUpdateHandler updates a collection based on the provided options
// @Summary      Update a collection
//
//	@Description  Update a collection based on the provided options
//	@Tags         Collections
//	@Accept       json
//	@Param        project_id path string true "The ID of the project"
//	@Param        collection_id path string true "The ID of the collection"
//	@Param        opts body collection.UpdateOptions true "The options for updating the collection"
//	@Produce      json
//	@Success      200  {object} collection.Collection "The updated collection"
//	@Failure      400  {object} map[string]interface{} "Bad request"
//	@Failure      500  {object} map[string]interface{} "Internal server error"
//	@Router       /projects/{project_id}/collections/{collection_id} [put]
func collectionsUpdateHandler(w http.ResponseWriter, r *http.Request) {
	var opts collection.UpdateOptions

	if err := json.NewDecoder(r.Body).Decode(&opts); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	opts.ProjectID = mux.Vars(r)["project_id"]
	opts.ID = mux.Vars(r)["collection_id"]

	c, err := collectionRepo.Update(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, c)
}

// collectionsDeleteHandler deletes a collection based on the collection ID provided in the request URL.
// @Summary      Delete a collection
//
//	@Description  Delete a collection based on the collection ID
//	@Tags         Collections
//	@Accept       json
//	@Param        collection_id path string true "Collection ID"
//	@Produce      json
//	@Success      200  {object}  map[string]string "Collection deleted successfully"
//	@Failure      400  {object}  map[string]string "Bad request"
//	@Failure      500  {object}  map[string]string "Internal server error"
//	@Router       /projects/{project_id}/collections/{collection_id} [delete]
func collectionsDeleteHandler(w http.ResponseWriter, r *http.Request) {
	opts := collection.DeleteOptions{
		ID: mux.Vars(r)["collection_id"],
	}

	err := collectionRepo.Delete(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
	}
}
