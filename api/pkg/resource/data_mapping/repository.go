package data_mapping

import (
	"database/sql"
	"time"

	"github.com/eneries/eneries/api/pkg/resource/measurement"
	"github.com/eneries/eneries/api/pkg/utils"
	"github.com/gomodule/redigo/redis"
	"github.com/google/uuid"
)

const (
	listTypesQuery     = `SELECT id, name, description FROM public.data_mapping_types`
	listTypeProperties = `SELECT id, name, optional, unit, "group" FROM data_mapping_type_properties WHERE type_id = $1`
	listQuery          = `SELECT DISTINCT dev.id, dev.name, created_at, types.name as type, types.id as type_id, dev.project_id as project_id
	FROM public.project_data_mapping dev
	JOIN public.data_mapping_types types ON dev.type_id = types.id
	JOIN (
		SELECT data_mapping_id, project_id, wildcard, permission_id
		FROM public.permissions_for_user user_permission
		where user_permission.user_id = $2 and permission_id = 'readDataMapping') scopes 
	ON (scopes.project_id = dev.project_id OR scopes.project_id is NULL) AND (scopes.data_mapping_id = dev.id OR scopes.wildcard = true)
	WHERE dev.project_id = $1`
	listProperties = `SELECT property_id, variable FROM data_mapping_property_mapping WHERE data_mapping_id = $1 AND variable != ''`
	listMappings   = `SELECT dtp.name, variable FROM data_mapping_property_mapping mapp JOIN data_mapping_type_properties dtp on mapp.property_id = dtp.id  WHERE data_mapping_id = $1`
	getQuery       = `SELECT dev.id, dev.name, created_at, types.name as type, types.id as type_id 
	 FROM public.project_data_mapping dev 
	 JOIN public.data_mapping_types types ON dev.type_id = types.id
	 WHERE dev.id=$1`
	insertPropertiesQuery = `INSERT INTO data_mapping_property_mapping (data_mapping_id, property_id, variable)
	VALUES ($1, $2, $3)`
	insertDataMapping = `INSERT INTO project_data_mapping (id, "name", project_id, type_id)
	VALUES ($1, $2, $3, $4)`
	deleteDataMapping     = `DELETE FROM project_data_mapping WHERE id = $1 and project_id = $2`
	deleteAllProperties   = `DELETE FROM data_mapping_property_mapping WHERE data_mapping_id = $1`
	updateNameQuery       = "UPDATE project_data_mapping SET name = $2 WHERE id = $1;"
	updatePropertiesQuery = `UPDATE data_mapping_property_mapping SET variable = $3 WHERE data_mapping_id = $1 AND property_id = $2;`

	listPropertyGroupsForDataMappingQuery = `SELECT dtp."group" FROM data_mapping_type_properties dtp JOIN data_mapping_property_mapping dpm ON dpm.property_id = dtp.id WHERE dpm.data_mapping_id = $1`
	listCompleteGroupsForDataMappingQuery = `SELECT "group" FROM (` + listPropertyGroupsForDataMappingQuery + `) propGroups
			WHERE propGroups."group" NOT IN (
				SELECT "group" FROM (
					` + listProperties + `) mapp
					FULL JOIN data_mapping_type_properties dtp ON mapp.property_id = dtp.id 
					WHERE dtp.type_id = (
						SELECT type_id FROM project_data_mapping 
						WHERE id = $1)
			AND property_id is null)`

	// list all project data mappings for a given project (first parameter / $1) and a type name (second parameter / $2)
	listDataMappingForProjectByTypeName = `SELECT DISTINCT dev.id, dev.name, created_at, types.name as type, types.id as type_id, dev.project_id as project_id 
		FROM project_data_mapping dev
		JOIN public.data_mapping_types types ON dev.type_id = types.id
		JOIN (
			SELECT data_mapping_id, project_id, wildcard, permission_id
			FROM public.permissions_for_user user_permission
			where user_permission.user_id = $3 and permission_id = 'readDataMapping') scopes 
		ON (scopes.project_id = dev.project_id OR scopes.project_id is NULL) AND (scopes.data_mapping_id = dev.id OR scopes.wildcard = true)
		WHERE types."name" = $2
		AND dev.project_id = $1;`

	getChargingStationReport = `SELECT * FROM get_charge_station_report($1, $2, $3, $4);`
)

type (
	Repository struct {
		Database  *sql.DB
		RedisPool *redis.Pool
	}

	// Object for a data mapping that aggregates variables together
	DataMapping struct {
		ID             string            `json:"id"`
		Name           string            `json:"name"`
		ProjectID      string            `json:"project_id"`
		CreatedAt      time.Time         `json:"created_at"`
		Type           string            `json:"type"`
		TypeID         string            `json:"type_id"`
		Mapping        map[string]string `json:"mappings"`
		CompleteGroups []string          `json:"complete_mappings"`
	}

	// type of an data mapping
	DataMappingType struct {
		ID          string `json:"id"`
		Name        string `json:"name"`
		Description string `json:"description"`
	}

	DataMappingTypeProperty struct {
		ID       string `json:"id"`
		Name     string `json:"name"`
		Optional bool   `json:"optional"`
		Unit     string `json:"unit"`
		Group    string `json:"group"`
	}

	ListOptions struct {
		ProjectID string
		UserID    string
	}

	CreateOptions struct {
		TypeID    string            `json:"type_id"`
		Name      string            `json:"name"`
		Mappings  map[string]string `json:"mappings"`
		ProjectID string            `json:"ProjectID"`
	}

	DeleteOptions struct {
		ID        string
		ProjectID string
	}

	UpdateOptions struct {
		ID       string            `json:"id"`
		Name     string            `json:"name"`
		Mappings map[string]string `json:"mappings"`
	}

	ValidationOptions struct {
		TypeID         string            `json:"type_id"`
		Name           string            `json:"name"`
		Mappings       map[string]string `json:"mappings"`
		TypeProperties []DataMappingTypeProperty
	}

	ChargingStationReportOptions struct {
		ProjectID string
		UserID    string
		Start     time.Time
		End       time.Time
	}

	ChargingStationReportEntry struct {
		DataMappingID string  `json:"data_mapping_id"`
		ProjectID     string  `json:"project_id"`
		Start         float64 `json:"start"`
		End           float64 `json:"end"`
		Energy        float64 `json:"energy"`
	}
)

func (r Repository) List(o ListOptions) ([]DataMapping, error) {
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

	return r.scanDataMappings(rows)
}

func (r Repository) scanDataMappings(rows *sql.Rows) ([]DataMapping, error) {
	return scanDataMappings(r.Database, rows)
}

func scanDataMappings(database *sql.DB, rows *sql.Rows) ([]DataMapping, error) {
	dataMappings := make([]DataMapping, 0)

	for rows.Next() {
		var (
			d DataMapping
		)

		if err := rows.Scan(&d.ID, &d.Name, &d.CreatedAt, &d.Type, &d.TypeID, &d.ProjectID); err != nil {
			return nil, err
		}

		// ignore error
		d.Mapping, _ = ListPropertiesForDataMapping(d.ID, database)
		d.CompleteGroups, _ = ListCompleteGroupsForDataMapping(d.ID, database)
		dataMappings = append(dataMappings, d)
	}

	return dataMappings, nil
}

func (r Repository) ListCompleteGroupsForDataMapping(id string) ([]string, error) {
	return ListCompleteGroupsForDataMapping(id, r.Database)
}

func ListCompleteGroupsForDataMapping(id string, db *sql.DB) ([]string, error) {
	rows, err := db.Query(listCompleteGroupsForDataMappingQuery, id)
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

func (r Repository) ListPropertiesForDataMapping(id string) (map[string]string, error) {
	return ListPropertiesForDataMapping(id, r.Database)
}

// returns mappings for data mapping in a map where the key is the id of the property
func ListPropertiesForDataMapping(id string, db *sql.DB) (map[string]string, error) {
	rows, err := db.Query(listProperties, id)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	m := make(map[string]string)

	for rows.Next() {
		var (
			key   string
			value string
		)

		if err := rows.Scan(&key, &value); err != nil {
			return nil, err
		}

		m[key] = value
	}

	return m, nil
}

// returns mappings for data mapping in a map where the key is the name of the property
func ListMappingsForDataMapping(db *sql.DB, id string) (map[string]string, error) {
	rows, err := db.Query(listMappings, id)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	m := make(map[string]string)

	for rows.Next() {
		var (
			key   string
			value string
		)

		if err := rows.Scan(&key, &value); err != nil {
			return nil, err
		}

		m[key] = value
	}

	return m, nil
}

func (r Repository) ListTypes() ([]DataMappingType, error) {
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

	types := make([]DataMappingType, 0)

	for rows.Next() {
		var (
			t DataMappingType
		)

		if err := rows.Scan(&t.ID, &t.Name, &t.Description); err != nil {
			return nil, err
		}

		types = append(types, t)
	}

	return types, nil
}

func (r Repository) ListPropertiesForType(typeID string) ([]DataMappingTypeProperty, error) {
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

	properties := make([]DataMappingTypeProperty, 0)

	for rows.Next() {
		var (
			p DataMappingTypeProperty
		)

		if err := rows.Scan(&p.ID, &p.Name, &p.Optional, &p.Unit, &p.Group); err != nil {
			return nil, err
		}

		properties = append(properties, p)
	}

	return properties, nil
}

func (r Repository) Get(id string) (DataMapping, error) {
	rows, err := r.Database.Query(getQuery, id)
	if err != nil {
		return DataMapping{}, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	// check if data mapping exists
	if !rows.Next() {
		return DataMapping{}, utils.NotFoundError{}
	}

	var d DataMapping
	if err := rows.Scan(&d.ID, &d.Name, &d.CreatedAt, &d.Type, &d.TypeID); err != nil {
		return DataMapping{}, err
	}

	// ignore error
	d.Mapping, _ = r.ListPropertiesForDataMapping(d.ID)
	d.CompleteGroups, _ = r.ListCompleteGroupsForDataMapping(d.ID)

	return d, nil
}

func (r Repository) Create(o CreateOptions) (DataMapping, error) {
	newID := uuid.New().String()

	isValid, err := r.Validate(ValidationOptions{
		TypeID:   o.TypeID,
		Name:     o.Name,
		Mappings: o.Mappings})

	if err != nil {
		return DataMapping{}, err
	}

	if !isValid {
		return DataMapping{}, utils.NotValidError{}
	}

	_, err = r.Database.Exec(insertDataMapping, newID, o.Name, o.ProjectID, o.TypeID)
	if err != nil {
		return DataMapping{}, err
	}

	for key, value := range o.Mappings {
		_, _ = r.Database.Exec(insertPropertiesQuery, newID, key, value)
	}

	return r.Get(newID)
}

func (r Repository) Delete(o DeleteOptions) error {
	_, err := r.Database.Exec(deleteDataMapping, o.ID, o.ProjectID)
	return err
}

func (r Repository) Update(o UpdateOptions) (DataMapping, error) {
	// use get to return not found
	dbItem, err := r.Get(o.ID)
	if err != nil {
		return DataMapping{}, err
	}

	isValid, err := r.Validate(ValidationOptions{
		TypeID:   dbItem.TypeID,
		Name:     o.Name,
		Mappings: o.Mappings})

	if err != nil {
		return DataMapping{}, err
	}

	if !isValid {
		return DataMapping{}, utils.NotValidError{}
	}

	// update name
	_, err = r.Database.Exec(updateNameQuery, o.ID, o.Name)
	if err != nil {
		return DataMapping{}, err
	}

	//update mappings
	_, _ = r.Database.Exec(deleteAllProperties, o.ID)
	for key, value := range o.Mappings {
		if value != "" {
			_, _ = r.Database.Exec(insertPropertiesQuery, o.ID, key, value)
		}
	}
	// return using get
	return r.Get(o.ID)
}

func (r Repository) Validate(o ValidationOptions) (bool, error) {
	props, err := r.ListPropertiesForType(o.TypeID)
	if err != nil {
		return false, err
	}

	isValid := ValidateDataMapping(ValidationOptions{
		TypeID:         o.TypeID,
		Name:           o.Name,
		Mappings:       o.Mappings,
		TypeProperties: props,
	})

	return isValid, nil
}

// Validates if a name is not empty, and if all view properties are filled out
func ValidateDataMapping(o ValidationOptions) bool {
	if o.Name == "" {
		return false
	}

	view_Properties := []string{}

	for i := range o.TypeProperties {
		if o.TypeProperties[i].Group == "View" {
			view_Properties = append(view_Properties, o.TypeProperties[i].ID)
		}
	}

	//update mappings
	for _, property := range view_Properties {
		mapping, ok := o.Mappings[property]
		// If the key exists
		if !ok || mapping == "" {
			return false
		}
	}
	return true
}

func (r Repository) ListDataMappingsForProjectByTypeName(projectId, typeName, userId string) ([]DataMapping, error) {
	return ListDataMappingsForProjectByTypeName(r.Database, projectId, typeName, userId)
}

func ListDataMappingsForProjectByTypeName(database *sql.DB, projectId, typeName, userId string) ([]DataMapping, error) {
	rows, err := database.Query(listDataMappingForProjectByTypeName, projectId, typeName, userId)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	return scanDataMappings(database, rows)
}

func (r Repository) ChargingStationReport(opts ChargingStationReportOptions) ([]ChargingStationReportEntry, error) {
	// cs_state and power
	entries := []ChargingStationReportEntry{}

	// l := utils.GetLogger()s

	stations, err_list := ListDataMappingsForProjectByTypeName(r.Database, opts.ProjectID, "Charging Station", opts.UserID)
	if err_list != nil {
		return nil, err_list
	}
	for _, station := range stations {
		mappings, err_mappings := ListMappingsForDataMapping(r.Database, station.ID)
		if err_mappings != nil {
			continue
			//TODO: log?
		}

		// get cs_state and power
		cs_state, ok_state := mappings["cs_state"]
		power, ok_power := mappings["power"]
		if !ok_state || !ok_power {
			continue
		}

		// get variable id's

		cs_state_id, err_cs := measurement.GetVariableID(station.ProjectID, cs_state, r.RedisPool)
		power_id, err_power := measurement.GetVariableID(station.ProjectID, power, r.RedisPool)

		if err_cs != nil || err_power != nil {
			continue
		}

		rows, err := r.Database.Query(getChargingStationReport, opts.Start, opts.End, cs_state_id, power_id)
		if err != nil {
			utils.LogError(err, "Error in querieng database")
			continue
		}

		for rows.Next() {
			var (
				session int
				entry   ChargingStationReportEntry
				end     time.Time
				start   time.Time
			)

			if err := rows.Scan(&session, &start, &end, &entry.Energy); err != nil {
				utils.LogError(err, "Error in scanning database")
				continue
			}

			entry.DataMappingID = station.ID
			entry.ProjectID = station.ProjectID
			entry.Start = float64(start.Unix())
			entry.End = float64(end.Unix())

			entries = append(entries, entry)
		}

		rows.Close()

	}

	return entries, nil
}
