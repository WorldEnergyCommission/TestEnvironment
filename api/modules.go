package main

import (
	"encoding/json"
	"net/http"

	"github.com/efficientIO/efficientIO/api/pkg/resource/modules"
	"github.com/gorilla/mux"
)

// modulesListTypesHandler handles the request to list all types of modules.
//
//	@Summary      List module types
//	@Description  Lists all types of modules.
//	@Tags         Modules
//	@Security     OAuth2Application[listModuleTypes] "The required scope for this endpoint"
//	@Produce      json
//	@Success      200  {object}	[]string "List of module types"
//	@Failure      400  {object}	map[string]any "Bad request"
//	@Failure      401  {object}	map[string]any "Unauthorized"
//	@Failure      500  {object}	map[string]any "Internal server error"
//	@Router       /modules/types/list [get]
func modulesListTypesHandler(w http.ResponseWriter, r *http.Request) {
	types, err := modulesRepo.ListTypes()
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, types)
}

// modulesListTypeDevicesHandler handles the request to list data mappings for a specific module type.
//
//	@Summary      List data mappings for module type
//	@Description  Retrieves a list of data mappings for a specific module type.
//	@Tags         Modules
//	@Accept       json
//	@Param        type_id path string true "Module type ID"
//	@Security     OAuth2Application[listModuleTypes] "The required scope for this endpoint"
//	@Produce      json
//	@Success      200  {object}	[]modules.ModuleTypeProperty "List of data mappings"
//	@Failure      400  {object}	map[string]any "Bad request"
//	@Failure      401  {object}	map[string]any "Unauthorized"
//	@Failure      500  {object}	map[string]any "Internal server error"
//	@Router       /modules/types/{type_id}/properties [get]
func modulesListTypeDevicesHandler(w http.ResponseWriter, r *http.Request) {
	typeID := mux.Vars(r)["type_id"]

	props, err := modulesRepo.ListPropertiesForType(typeID)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, props)
}

// modulesListHandler handles the request to list modules.
//
//	@Summary      List modules
//	@Description  List modules for a project
//	@Tags         Modules
//	@Accept       json
//	@Security     OAuth2Application[listModules] "The required scope for this endpoint"
//	@Produce      json
//	@Param        project_id path string true "Project ID"
//	@Param        includeMappings query bool false "Include variable mappings"
//	@Success      200  {object}  []modules.EfficientIOModule "List of modules"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/modules/list [get]
func modulesListHandler(w http.ResponseWriter, r *http.Request) {
	opts := modules.ListOptions{
		UserID:    r.Header.Get("x-user"),
		ProjectID: mux.Vars(r)["project_id"],
	}

	includeMappings := r.URL.Query().Get("includeMappings")
	opts.VariableMapping = includeMappings == "true"

	modules, err := modulesRepo.List(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, modules)
}

// modulesCreateHandler creates a module for the respective project based on the provided options.
//
//	@Summary      Create a module
//	@Description  Create a module for a project
//	@Tags         Modules
//	@Accept       json
//	@Param        project_id path string true "The ID of the project"
//	@Param        opts body modules.CreateOptions true "The options for creating the module"
//	@Security     OAuth2Application[createModule] "The required scope for this endpoint"
//	@Produce      json
//	@Success      200  {object}	modules.EfficientIOModule "The properties of the created module"
//	@Failure      400  {object}	map[string]any "Bad request"
//	@Failure      401  {object}	map[string]any "Unauthorized"
//	@Failure      500  {object}	map[string]any "Internal server error"
//	@Router       /projects/{project_id}/modules [post]
func modulesCreateHandler(w http.ResponseWriter, r *http.Request) {
	projectID := mux.Vars(r)["project_id"]
	var opts modules.CreateOptions

	if err := json.NewDecoder(r.Body).Decode(&opts); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}
	opts.ProjectID = projectID

	props, err := modulesRepo.Create(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, props)
}

// modulesDeleteHandler deletes a module by its ID for a specific project.
//
//	@Summary      Delete a module
//	@Description  Delete a module by its ID for a specific project
//	@Tags         Modules
//	@Accept       json
//	@Param        project_id path string true "The ID of the project"
//	@Param        module_id path string true "The ID of the module"
//	@Security     OAuth2Application[deleteModule]
//	@Produce      json
//	@Success      200  {object}	nil "Successful deletion"
//	@Failure      400  {object}	map[string]any "Bad request"
//	@Failure      401  {object}	map[string]any "Unauthorized"
//	@Failure      500  {object}	map[string]any "Internal server error"
//	@Router       /projects/{project_id}/modules/{module_id} [delete]
func modulesDeleteHandler(w http.ResponseWriter, r *http.Request) {
	opts := modules.DeleteOptions{
		ProjectID: mux.Vars(r)["project_id"],
		ID:        mux.Vars(r)["module_id"],
	}

	if err := modulesRepo.Delete(opts); err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, nil)
}

// modulesUpdateHandler updates a module with the specified module ID.
//
//	@Summary      Update a module
//	@Description  Update a module with the specified module ID
//	@Tags         Modules
//	@Accept       json
//	@Param        module_id path string true "Module ID"
//	@Param        opts body modules.UpdateOptions true "Update options"
//	@Security     OAuth2Application[updateModule]
//	@Produce      json
//	@Success      200  {object}	modules.EfficientIOModule "Updated module"
//	@Failure      400  {object}	map[string]any "Bad request"
//	@Failure      401  {object}	map[string]any "Unauthorized"
//	@Failure      500  {object}	map[string]any "Internal server error"
//	@Router       /projects/{project_id}/modules/{module_id} [put]
func modulesUpdateHandler(w http.ResponseWriter, r *http.Request) {
	module_id := mux.Vars(r)["module_id"]
	var opts modules.UpdateOptions

	if err := json.NewDecoder(r.Body).Decode(&opts); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}
	opts.ID = module_id

	updatedModule, err := modulesRepo.Update(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, updatedModule)
}

// modulesUpdateCollectionHandler updates a collection of modules.
//
//	@Summary      Update collection of modules
//	@Description  Update a collection of modules for a project
//	@Tags         Modules
//	@Accept       json
//	@Param        module_id path string true "Module ID"
//	@Param        project_id path string true "Project ID"
//	@Param        opts body modules.CollectionUpdateOptions true "Update options"
//	@Security     OAuth2Application[updateModule]
//	@Produce      json
//	@Success      200  {object}	modules.EfficientIOModule "Updated device"
//	@Failure      400  {object}	map[string]any "Bad request"
//	@Failure      401  {object}	map[string]any "Unauthorized"
//	@Failure      500  {object}	map[string]any "Internal server error"
//	@Router       /projects/{project_id}/modules/{module_id}/collection [put]
func modulesUpdateCollectionHandler(w http.ResponseWriter, r *http.Request) {
	var opts modules.CollectionUpdateOptions

	if err := json.NewDecoder(r.Body).Decode(&opts); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}
	opts.ID = mux.Vars(r)["module_id"]
	opts.ProjectID = mux.Vars(r)["project_id"]

	device, err := modulesRepo.UpdateCollection(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, device)
}

// modulesDeleteCollectionHandler deletes a collection of modules.
//
//	@Summary      Delete a collection of modules
//	@Description  This endpoint deletes a collection of modules based on the provided module ID and project ID.
//	@Tags         Modules
//	@Accept       json
//	@Param        module_id path string true "Module ID"
//	@Param        project_id path string true "Project ID"
//	@Security     OAuth2Application[updateModule]
//	@Produce      json
//	@Success      200  {object}	modules.EfficientIOModule "Deleted device"
//	@Failure      400  {object}	map[string]any "Bad request"
//	@Failure      401  {object}	map[string]any "Unauthorized"
//	@Failure      500  {object}	map[string]any "Internal server error"
//	@Router       /modules/{module_id}/projects/{project_id}/collection [delete]
func modulesDeleteCollectionHandler(w http.ResponseWriter, r *http.Request) {
	var opts modules.CollectionDeleteOptions

	opts.ID = mux.Vars(r)["module_id"]
	opts.ProjectID = mux.Vars(r)["project_id"]

	device, err := modulesRepo.DeleteCollection(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, device)
}
