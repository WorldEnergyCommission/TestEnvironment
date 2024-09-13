package main

import (
	"net/http"

	"github.com/efficientIO/efficientIO/api/pkg/resource/icon"
)

// iconsListHandler handles the request to list icons based on a query parameter.
//
//	@Summary      List icons
//	@Description  List icons based on a query parameter
//	@Tags         Icons
//	@Accept       json
//	@Param        q query string true "The query parameter"
//	@Security     OAuth2Application[readIcon]
//	@Produce      json
//	@Success      200  {object} 	[]icon.Icon "List of icons"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /icons [get]
func iconsListHandler(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")

	if len(q) < 2 {
		reject(w, r, http.StatusBadRequest, "q len must be greater than 1")
		return
	}

	icons, err := iconRepo.List(icon.ListOptions{Query: q})
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, icons)
}
