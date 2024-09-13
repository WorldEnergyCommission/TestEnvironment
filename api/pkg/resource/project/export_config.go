package project

import (
	"database/sql"
	"encoding/json"

	"github.com/efficientIO/efficientIO/api/pkg/utils"
)

const (
	exportMappingQuery = "SELECT id, export_config FROM project"
)

// GetExportMappings returns the import mappings from an import mapping query
func (r Repository) GetExportMappings() (map[string]map[string]map[string][]string, error) {
	// retrieve the rows from the database
	rows, err := r.Database.Query(exportMappingQuery)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	// build the export mappings from the returned rows
	exportMappings := make(map[string]map[string]map[string][]string)
	for rows.Next() {
		var projectId string
		var exportConfigBytes []byte
		if err = rows.Scan(&projectId, &exportConfigBytes); err != nil {
			return nil, err
		}
		var exportConfig map[string]map[string][]string
		if err := json.Unmarshal(exportConfigBytes, &exportConfig); err != nil {
			return nil, err
		}
		for exportType, exportSettings := range exportConfig {
			for variableName, exportId := range exportSettings {
				_, ok := exportMappings[projectId]
				if !ok {
					exportMappings[projectId] = make(map[string]map[string][]string)
				}
				_, ok = exportMappings[projectId][variableName]
				if !ok {
					exportMappings[projectId][variableName] = make(map[string][]string)
				}
				exportMappings[projectId][variableName][exportType] = exportId
			}
		}
	}

	// no errors have occurred return the import mappings
	return exportMappings, nil
}
