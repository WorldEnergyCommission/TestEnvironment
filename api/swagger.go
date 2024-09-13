package main

import (
	"fmt"
	"github.com/gorilla/mux"
	"net/http"

	"github.com/efficientIO/efficientIO/api/pkg/utils"
)

var (

	// file names
	openApiJsonFilePath = "api/openapi.json"
	indexHtmlFilePath   = "web/index.html"
)

func openApiJsonHandler(w http.ResponseWriter, r *http.Request) {
	content, err := utils.ReadFileAndApplyReplacements(openApiJsonFilePath, map[string]string{"DOMAIN_VALUE": envDomain})
	if err != nil {
		reject(w, r, http.StatusInternalServerError, "Error loading openapi.json")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprint(w, content)
}

func openApiIndexHandler(w http.ResponseWriter, r *http.Request) {
	realm := mux.Vars(r)["realm"]
	if r.URL.Path == fmt.Sprintf("/swagger/realm-%v", realm) {
		replacements := map[string]string{
			"DOMAIN_VALUE":         envDomain,
			"KEYCLOAK_REALM_VALUE": realm,
		}
		content, err := utils.ReadFileAndApplyReplacements(indexHtmlFilePath, replacements)
		if err != nil {
			reject(w, r, http.StatusInternalServerError, "Error loading index")
			return
		}
		w.Header().Set("Content-Type", "text/html")
		fmt.Fprint(w, content)
		return
	}
}
