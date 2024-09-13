package modules

import (
	"database/sql"
	"time"

	data_mapping "github.com/efficientIO/efficientIO/api/pkg/resource/data_mapping"
	"github.com/efficientIO/efficientIO/api/pkg/utils"
	"github.com/google/uuid"
)

const (
	listTypesQuery     = `SELECT id, name, description FROM public.module_types`
	listTypeProperties = `SELECT id, name, data_mapping_type_id, min_count, max_count FROM module_type_data_mappings WHERE module_type_id = $1`
	listQuery          = `SELECT module.id, module.name, created_at, types.name as type, types.id as type_id, coalesce(cast(mapping.collection_id as varchar), '') as collection_id, coalesce(cast( types.frontend_type as varchar), '') as frontend_type 
		FROM public.modules module
		JOIN public.module_types types ON module.type_id = types.id
		LEFT JOIN public.project_collection_module_mapping mapping ON module.id = mapping.module_id
		JOIN (
			SELECT module_id, project_id, wildcard, permission_id
			FROM public.permissions_for_user user_permission
			where user_permission.user_id = $2 and permission_id = 'readModule') scopes 
		ON (scopes.project_id = module.project_id OR scopes.project_id is NULL) AND (scopes.module_id = module.id OR scopes.wildcard = true)
		WHERE module.project_id = $1`
	listMappingSelectBase = "SELECT modmapping.property_id, modmapping.data_mapping_id, types.name, dev.name as data_mapping_name, dev.type_id as data_mapping_type_id"
	listMappingFromBase   = `
		FROM module_data_mapping_mapping modmapping 
		JOIN module_type_data_mappings types ON modmapping.property_id = types.id 
		JOIN project_data_mapping dev ON modmapping.data_mapping_id = dev.id`
	listMapping         = listMappingSelectBase + listMappingFromBase + " WHERE modmapping.module_id = $1"
	listVariableMapping = listMappingSelectBase + ", devmapping.variable as variable, dtp.name as data_mapping_property " + listMappingFromBase +
		` JOIN data_mapping_property_mapping devmapping on modmapping.data_mapping_id = devmapping.data_mapping_id 
		JOIN data_mapping_type_properties dtp on devmapping.property_id  = dtp.id
		WHERE modmapping.module_id = $1`
	getQuery = `SELECT module.id, module.name, created_at, types.name as type, types.id as type_id, coalesce(cast(mapping.collection_id as varchar), '') as collection_id
		FROM public.modules module 
		JOIN public.module_types types ON module.type_id = types.id
	 	LEFT JOIN public.project_collection_module_mapping mapping ON module.id = mapping.module_id
	 	WHERE module.id=$1`
	insertPropertiesQuery = `INSERT INTO module_data_mapping_mapping (module_id, property_id, data_mapping_id)
		VALUES ($1, $2, $3)`
	insertModuleQuery = `INSERT INTO modules (id, "name", project_id, type_id)
		VALUES ($1, $2, $3, $4)`
	deleteModuleQuery                            = "DELETE FROM modules WHERE id = $1 and project_id = $2"
	updateNameQuery                              = "UPDATE modules SET name = $2 WHERE id = $1;"
	dropPropertiesQuery                          = "DELETE FROM module_data_mapping_mapping WHERE module_id = $1;"
	listRequiredGroupsForModuleTypePropertyQuery = `SELECT "group" FROM module_required_data_mapping_properties WHERE module_type_data_mapping = $1;`
	collectionMappingExistsQuery                 = "SELECT true FROM project_collection_module_mapping WHERE module_id = $1 and project_id = $2;"
	insertCollectionMappingQuery                 = "INSERT INTO project_collection_module_mapping (module_id, project_id, collection_id) VALUES ($1, $2, $3);"
	updateCollectionMappingQuery                 = "UPDATE project_collection_module_mapping SET collection_id = $3 WHERE module_id = $1 and project_id = $2;"
	deleteCollectionMappingQuery                 = "DELETE FROM project_collection_module_mapping WHERE module_id = $1 and project_id = $2;"
)

type (
	Repository struct {
		Database *sql.DB
	}

	// Object for a modules that consists of one or many devices
	EfficientIOModule struct {
		ID         string           `json:"id"`
		Name       string           `json:"name"`
		ProjectID  string           `json:"project_id"`
		CreatedAt  time.Time        `json:"created_at"`
		Type       string           `json:"type"`
		TypeID     string           `json:"type_id"`
		Properties []ModuleProperty `json:"properties"`
		// properties for gui
		Data         map[string]any `json:"data,omitempty"`
		CollectionID string         `json:"collection_id"`
	}

	ModuleProperty struct {
		Name              string            `json:"name"`
		ID                string            `json:"id"`
		DataMappingID     string            `json:"data_mapping_id"`
		DataMappingTypeID string            `json:"data_mapping_type_id"`
		DataMappingName   string            `json:"data_mapping_name"`
		Mappings          map[string]string `json:"mappings,omitempty"`
		// used in validation, omitted in json
		DataMappingGroups []string `json:"-"`
	}

	// type of an module
	ModuleType struct {
		ID          string `json:"id"`
		Name        string `json:"name"`
		Description string `json:"description"`
	}

	ModuleTypeProperty struct {
		ID                string   `json:"id"`
		Name              string   `json:"name"`
		DataMappingTypeID string   `json:"data_mapping_type_id"`
		MinCount          int      `json:"min_count"`
		MaxCount          int      `json:"max_count"`
		RequiredGroups    []string `json:"required_groups"`
	}

	ListOptions struct {
		ProjectID       string
		UserID          string
		VariableMapping bool
	}

	CreateOptions struct {
		TypeID     string           `json:"type_id"`
		Name       string           `json:"name"`
		Properties []ModuleProperty `json:"properties"`
		ProjectID  string           `json:"project_id"`
	}

	DeleteOptions struct {
		ID        string
		ProjectID string
	}

	UpdateOptions struct {
		ID         string           `json:"id"`
		Name       string           `json:"name"`
		Properties []ModuleProperty `json:"properties"`
	}

	ValidationOptions struct {
		Name           string           `json:"name"`
		TypeID         string           `json:"type_id"`
		Properties     []ModuleProperty `json:"properties"`
		TypeProperties []ModuleTypeProperty
	}

	CollectionUpdateOptions struct {
		ID           string `json:"id"`
		ProjectID    string `json:"project_id"`
		CollectionID string `json:"collection_id"`
	}

	CollectionDeleteOptions struct {
		ID        string `json:"id"`
		ProjectID string `json:"project_id"`
	}
)

func (r Repository) List(o ListOptions) ([]EfficientIOModule, error) {
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

	modules := make([]EfficientIOModule, 0)

	for rows.Next() {
		var (
			d  EfficientIOModule
			ft string
		)

		if err := rows.Scan(&d.ID, &d.Name, &d.CreatedAt, &d.Type, &d.TypeID, &d.CollectionID, &ft); err != nil {
			return nil, err
		}

		d.Data = map[string]any{"type": ft}

		// ignore error
		if !o.VariableMapping {
			d.Properties, err = r.ListPropertiesForModule(d.ID)
		} else {
			d.Properties, err = r.ListPropertiesForModuleWithMappings(d.ID)
		}

		if err != nil {
			utils.LogError(err, "")
		}

		modules = append(modules, d)
	}

	return modules, nil
}

func (r Repository) ListPropertiesForModule(id string) ([]ModuleProperty, error) {
	rows, err := r.Database.Query(listMapping, id)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	m := make([]ModuleProperty, 0)

	for rows.Next() {
		var (
			key               string
			name              string
			dataMappingID     string
			dataMappingName   string
			dataMappingTypeId string
		)

		if err := rows.Scan(&key, &dataMappingID, &name, &dataMappingName, &dataMappingTypeId); err != nil {
			return nil, err
		}

		m = append(m, ModuleProperty{
			ID:                key,
			Name:              name,
			DataMappingID:     dataMappingID,
			DataMappingName:   dataMappingName,
			DataMappingTypeID: dataMappingTypeId,
		})

	}

	return m, nil
}

func (r Repository) ListPropertiesForModuleWithMappings(id string) ([]ModuleProperty, error) {
	rows, err := r.Database.Query(listMapping, id)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	m := make([]ModuleProperty, 0)

	for rows.Next() {
		var (
			key               string
			name              string
			dataMappingID     string
			dataMappingName   string
			dataMappingTypeID string
		)

		if err := rows.Scan(&key, &dataMappingID, &name, &dataMappingName, &dataMappingTypeID); err != nil {
			return nil, err
		}

		// ignore error for mappings
		mappings, _ := data_mapping.ListMappingsForDataMapping(r.Database, dataMappingID)

		m = append(m, ModuleProperty{
			ID:                key,
			Name:              name,
			DataMappingID:     dataMappingID,
			DataMappingName:   dataMappingName,
			DataMappingTypeID: dataMappingTypeID,
			Mappings:          mappings,
		})

	}

	return m, nil
}

func (r Repository) ListTypes() ([]ModuleType, error) {
	rows, err := r.Database.Query(listTypesQuery)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	types := make([]ModuleType, 0)

	for rows.Next() {
		var (
			t ModuleType
		)

		if err := rows.Scan(&t.ID, &t.Name, &t.Description); err != nil {
			return nil, err
		}

		types = append(types, t)
	}

	return types, nil
}

func (r Repository) ListPropertiesForType(typeID string) ([]ModuleTypeProperty, error) {
	rows, err := r.Database.Query(listTypeProperties, typeID)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	properties := make([]ModuleTypeProperty, 0)

	for rows.Next() {
		var (
			p ModuleTypeProperty
		)

		if err := rows.Scan(&p.ID, &p.Name, &p.DataMappingTypeID, &p.MinCount, &p.MaxCount); err != nil {
			return nil, err
		}

		// ignore error
		p.RequiredGroups, _ = r.ListRequiredGroupsForModuleTypeProperty(p.ID)

		properties = append(properties, p)
	}

	return properties, nil
}

func (r Repository) ListRequiredGroupsForModuleTypeProperty(id string) ([]string, error) {
	rows, err := r.Database.Query(listRequiredGroupsForModuleTypePropertyQuery, id)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	g := make([]string, 0)

	for rows.Next() {
		var (
			value string
		)

		if err := rows.Scan(&value); err != nil {
			return nil, err
		}

		g = append(g, value)
	}

	return g, nil
}

func (r Repository) Get(id string) (EfficientIOModule, error) {
	rows, err := r.Database.Query(getQuery, id)
	if err != nil {
		return EfficientIOModule{}, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	// check if module exists
	if !rows.Next() {
		return EfficientIOModule{}, utils.NotFoundError{}
	}

	var d EfficientIOModule
	if err := rows.Scan(&d.ID, &d.Name, &d.CreatedAt, &d.Type, &d.TypeID, &d.CollectionID); err != nil {
		return EfficientIOModule{}, err
	}

	// ignore error
	d.Properties, _ = r.ListPropertiesForModule(d.ID)

	return d, nil
}

func (r Repository) Create(o CreateOptions) (EfficientIOModule, error) {
	newID := uuid.New().String()

	isValid, err := r.Validate(ValidationOptions{
		TypeID:     o.TypeID,
		Name:       o.Name,
		Properties: o.Properties})

	if err != nil {
		return EfficientIOModule{}, err
	}

	if !isValid {
		return EfficientIOModule{}, utils.NotValidError{}
	}

	_, err = r.Database.Exec(insertModuleQuery, newID, o.Name, o.ProjectID, o.TypeID)
	if err != nil {
		return EfficientIOModule{}, err
	}

	err = r.CreateOrUpdateModuleProperties(newID, o.Properties)
	if err != nil {
		r.Delete(DeleteOptions{ProjectID: o.ProjectID, ID: newID})
		return EfficientIOModule{}, err
	}

	return r.Get(newID)
}

// creates or updates all module properties
// deletes all properties first and then inserts all given properties
// on error: deletes all properties and returns error
func (r Repository) CreateOrUpdateModuleProperties(module_id string, props []ModuleProperty) error {
	// delete existing mappings
	_, err := r.Database.Exec(dropPropertiesQuery, module_id)

	if err != nil {
		return err
	}
	// create new mappings
	for _, prop := range props {
		_, err = r.Database.Exec(insertPropertiesQuery, module_id, prop.ID, prop.DataMappingID)

		// on error delete all mappings & return error
		if err != nil {
			r.Database.Exec(dropPropertiesQuery, module_id)
			return err
		}
	}

	return nil
}

func (r Repository) Delete(o DeleteOptions) error {
	_, err := r.Database.Exec(deleteModuleQuery, o.ID, o.ProjectID)
	return err
}

func (r Repository) Update(o UpdateOptions) (EfficientIOModule, error) {
	// use get to return not found
	dbItem, err := r.Get(o.ID)
	if err != nil {
		return EfficientIOModule{}, err
	}

	isValid, err := r.Validate(ValidationOptions{
		TypeID:     dbItem.TypeID,
		Name:       o.Name,
		Properties: o.Properties})

	if err != nil {
		return EfficientIOModule{}, err
	}

	if !isValid {
		return EfficientIOModule{}, utils.NotValidError{}
	}

	// update name
	_, err = r.Database.Exec(updateNameQuery, o.ID, o.Name)
	if err != nil {
		return EfficientIOModule{}, err
	}

	//update mappings
	err = r.CreateOrUpdateModuleProperties(o.ID, o.Properties)
	if err != nil {
		return EfficientIOModule{}, err
	}
	// return using get
	return r.Get(o.ID)
}

func (r Repository) UpdateCollection(o CollectionUpdateOptions) (EfficientIOModule, error) {
	// use get to return not found
	_, err := r.Get(o.ID)
	if err != nil {
		return EfficientIOModule{}, err
	}

	rows, err := r.Database.Query(collectionMappingExistsQuery, o.ID, o.ProjectID)
	if err != nil {
		return EfficientIOModule{}, err
	}

	// if no row was found, insert new
	if !rows.Next() {
		_, err = r.Database.Exec(insertCollectionMappingQuery, o.ID, o.ProjectID, o.CollectionID)
	} else {
		// else update
		_, err = r.Database.Exec(updateCollectionMappingQuery, o.ID, o.ProjectID, o.CollectionID)
	}

	if err != nil {
		return EfficientIOModule{}, err
	}

	// return using get
	return r.Get(o.ID)
}

func (r Repository) DeleteCollection(o CollectionDeleteOptions) (EfficientIOModule, error) {
	// use get to return not found
	_, err := r.Get(o.ID)
	if err != nil {
		return EfficientIOModule{}, err
	}

	_, err = r.Database.Exec(deleteCollectionMappingQuery, o.ID, o.ProjectID)

	if err != nil {
		return EfficientIOModule{}, err
	}

	// return using get
	return r.Get(o.ID)
}

func (r Repository) Validate(o ValidationOptions) (bool, error) {
	props, err := r.ListPropertiesForType(o.TypeID)
	if err != nil {
		return false, err
	}

	newOptions := ValidationOptions{
		TypeID:         o.TypeID,
		Name:           o.Name,
		Properties:     o.Properties,
		TypeProperties: props,
	}

	for i := range newOptions.Properties {
		newOptions.Properties[i].DataMappingGroups, err = data_mapping.ListCompleteGroupsForDataMapping(newOptions.Properties[i].DataMappingID, r.Database)
		if err != nil {
			return false, err
		}
	}

	isValid := ValidateModule(newOptions)

	return isValid, nil
}

// validate all type properties min & max count
func ValidateModule(o ValidationOptions) bool {

	// validate count for all properties
	for _, typ := range o.TypeProperties {
		if !ValidateModulePropertyCount(o.Properties, typ) || !ValidateRequiredGroups(o.Properties, typ) {
			return false
		}
	}

	return true
}

// validate if number of properties of typ is not less than miniumn and not more than maximum
func ValidateModulePropertyCount(properties []ModuleProperty, typ ModuleTypeProperty) bool {
	count := 0

	for _, value := range properties {
		if value.DataMappingTypeID == typ.DataMappingTypeID {
			count++
		}
	}

	return typ.MinCount <= count && count <= typ.MaxCount
}

// validate for all properties of given type, that it has all the required groups
func ValidateRequiredGroups(properties []ModuleProperty, typ ModuleTypeProperty) bool {
	missingGroup := false

	for _, value := range properties {
		if value.DataMappingTypeID == typ.DataMappingTypeID {
			for _, group := range typ.RequiredGroups {
				if !utils.StringArrayContains(value.DataMappingGroups, group) {
					missingGroup = true
				}
			}
		}
	}

	return !missingGroup
}
