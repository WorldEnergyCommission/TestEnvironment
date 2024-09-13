package project

import (
	"crypto/sha256"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/efficientIO/efficientIO/api/pkg/utils"

	"github.com/gomodule/redigo/redis"
	"github.com/google/uuid"
)

const (
	ebImportMappingQuery     = "SELECT id, import_config['eb']->>$1 FROM project WHERE import_config['eb'][$1] IS NOT NULL"
	oeamtcImportMappingQuery = "SELECT id, import_config['oeamtc']->>$1 FROM project WHERE import_config['oeamtc'][$1] IS NOT NULL"
	oqdoImportMappingQuery   = "SELECT id, import_config['oqdo']->>$1 FROM project WHERE import_config['oqdo'][$1] IS NOT NULL"

	oqdoImportAllMappingsQuery   = "SELECT id, import_config->'oqdo' FROM project WHERE import_config['oqdo'] IS NOT NULL"
	oeamtcImportAllMappingsQuery = "SELECT id, import_config->'oeamtc' FROM project WHERE import_config['oeamtc'] IS NOT NULL"
	// Easee PIN verification not supported yet
	//easeeImportAllMappingsQuery = "SELECT project_id, data->'meta'->>'chargerId' as chargerId, data->'meta'->>'chargerHash' as chargerHash, data->'meta'->>'chargerSalt' as chargerSalt from public.project_device WHERE data->>'type' = 'EaseeWallbox'"
	easeeImportAllMappingsQuery = "SELECT project_id, data->'meta'->>'chargerId' as chargerId from public.project_device WHERE data->>'type' = 'EaseeWallbox'"
	
	CachingPeriod = 12 * time.Hour
)

type (
	ImportMapping struct {
		Project  string `json:"project"`
		Variable string `json:"variable"`
	}

	EaseeMapping struct {
		ProjectId  	string `json:"projectId"`
		//ChargerHash 	string `json:"chargerHash"`
		//ChargerSalt 	string `json:"chargerSalt"`
	}
)

// GetImportMappingQueryHashKey computes a key for the respective import mapping query request
func GetImportMappingQueryHashKey(query string, argument string) string {
	hasher := sha256.New()
	hasher.Write([]byte(query + argument))
	hashString := fmt.Sprintf("%x", hasher.Sum(nil))
	return hashString
}

// GetImportMappingsString return a string representation from import mappings
func GetImportMappingsString(importMappings []ImportMapping) (string, error) {
	bytes, err := json.Marshal(importMappings)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// GetImportMappingsFromString returns import mappings from a string representation
func GetImportMappingsFromString(importMappingsString string) ([]ImportMapping, error) {
	var importMappings []ImportMapping
	err := json.Unmarshal([]byte(importMappingsString), &importMappings)
	if err != nil {
		return nil, err
	}
	return importMappings, nil
}

// GetImportMappingsFromQuery returns the import mappings from an import mapping query
// Currently not in use
func (r Repository) GetImportMappingsFromQuery(query string, argument string) ([]ImportMapping, error) {
	// get a redis connection
	conn := r.Pool.Get()
	defer func(conn redis.Conn) {
		err := conn.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(conn)

	// compute the query request key
	key := GetImportMappingQueryHashKey(query, argument)

	// get last timestamp from redis or 0 as default value
	importMappingsTimestamp, err := redis.Int64(conn.Do("HGET", "lynus:import:timestamp", key))
	if err != nil {
		l := utils.GetLogger()
		l.Error().Err(err).Str("command", "HGET").Str("key", "lynus:import:timestamp").Msg("Redis Error")
		importMappingsTimestamp = 0
	}

	// compute the key age
	keyAge := time.Since(time.Unix(importMappingsTimestamp, 0))
	keyExpired := keyAge > CachingPeriod

	// try to get string from redis, err after is either nil or redis.ErrNil
	importMappingsString, err := redis.String(conn.Do("HGET", "lynus:import:result", key))
	if err != nil && err != redis.ErrNil {
		l := utils.GetLogger()
		l.Error().Err(err).Str("command", "HGET").Str("key", "lynus:import:result").Msg("Redis Error")
		// other error happened
		return nil, err
	}

	// return result from cache if it is still valid
	// WTF it an be a string that is "null" ?!?!?!?!
	// redis.String converts it to "null" probably...
	// maybe don't check for && importMappingsString != "null"
	// seems as if null gets saved to redis if no mapping exists
	if err == nil && !keyExpired {
		// parse result from redis and return it
		importMappings, err := GetImportMappingsFromString(importMappingsString)
		if err != nil {
			utils.LogError(err, "")
			return nil, err
		}
		return importMappings, nil
	}

	// otherwise if key is not there or expired, get the import mappings from the database ...
	importMappings, err := r.GetImportMappingsFromDatabase(query, argument)
	if err != nil {
		return nil, err
	}

	// ... and set the import mappings as string representation in redis
	importMappingsString, err = GetImportMappingsString(importMappings)
	if err != nil {
		return nil, err
	}

	_, err = conn.Do("HSET", "lynus:import:result", key, importMappingsString)
	if err != nil {
		return nil, err
	}

	// set the current timestamp also in redis
	_, err = conn.Do("HSET", "lynus:import:timestamp", key, time.Now().Unix())
	if err != nil {
		return nil, err
	}

	// return the result from the database
	return importMappings, nil
}

// GetImportMappingsFromDatabase returns the import mappings from an import mapping query
func (r Repository) GetImportMappingsFromDatabase(query string, argument string) ([]ImportMapping, error) {
	// retrieve the rows from the database
	rows, err := r.Database.Query(query, argument)

	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	if err != nil {
		return nil, err
	}

	// build the import mappings from the returned rows
	var importMappings []ImportMapping

	for rows.Next() {
		var importMapping ImportMapping
		if err = rows.Scan(&importMapping.Project, &importMapping.Variable); err != nil {
			return nil, err
		}
		importMappings = append(importMappings, importMapping)
	}

	// no errors have occurred return the import mappings
	return importMappings, nil
}



// GetAllEaseeDeviceIdsProjectMappings returns the device-id <-> project-id / pin / salt mapping for easee devices as
func (r Repository) GetAllEaseeDeviceIdsProjectMappings(query string) (map[string]EaseeMapping, error) {

	rows, err := r.Database.Query(query)
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	if err != nil {
		utils.LogError(err, "")
		return nil, err
	}

	importMappings := make(map[string]EaseeMapping)
	for rows.Next() {
		var projectId string
		var chargerId string
		//var chargerHash string
		//var chargerSalt string

		if err = rows.Scan(&projectId, &chargerId); err != nil { //, &chargerHash, &chargerSalt
			utils.LogError(err, "")
			return nil, err
		}

		mapping := EaseeMapping{
			ProjectId: projectId,
			//ChargerHash: chargerHash,
			//ChargerSalt: chargerSalt,
		}

		importMappings[chargerId] = mapping
	}
	/* var err error = nil
	// TODO remove test mapping
	importMappings := map[string]EaseeMapping{
		"ECY9Q6E9": {
			ProjectId: "860e8e24-eac9-4d3f-a049-218c33986af5",
			Pin: "1234",
			Salt: "1234",
		},
	} */

	return importMappings, err
}
// GetAllImportMappings returns the import mappings from an import mapping query
// values ImportMapping
func (r Repository) GetAllImportMappings(query string) (map[string]ImportMapping, error) {
	// retrieve the rows from the database
	rows, err := r.Database.Query(query)
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	if err != nil {
		utils.LogError(err, "")
		return nil, err
	}
	// build the export mappings from the returned rows
	importMappings := make(map[string]ImportMapping)
	for rows.Next() {
		var projectId string
		var importConfigBytes []byte
		if err = rows.Scan(&projectId, &importConfigBytes); err != nil {
			utils.LogError(err, "")
			return nil, err
		}
		var importConfig map[string]string
		if err := json.Unmarshal(importConfigBytes, &importConfig); err != nil {
			utils.LogError(err, "")
			return nil, err
		}

		for key, measurement := range importConfig {
			importMappings[key] = ImportMapping{
				Project:  projectId,
				Variable: measurement,
			}
		}
	}

	// no errors have occurred return the import mappings
	return importMappings, nil
}

// GetOqdoImportMappings returns the import mappings for oqdo mappings
// values ImportMapping
func (r Repository) GetOqdoImportMappings() (map[string]ImportMapping, error) {
	// retrieve the rows from the database
	return r.GetAllImportMappings(oqdoImportAllMappingsQuery)
}

func (r Repository) GetEaseeImportMappings() (map[string]EaseeMapping, error) {
	// retrieve the rows from the database
	return r.GetAllEaseeDeviceIdsProjectMappings(easeeImportAllMappingsQuery)
}

// GetOeamtcImportMappings returns the import mappings for oemtc mappings
// values ImportMapping
func (r Repository) GetOeamtcImportMappings() (map[string]ImportMapping, error) {
	return r.GetAllImportMappings(oeamtcImportAllMappingsQuery)
}

// GetImportMappingsForEbId returns the import mappings for the oeamtc asset name
func (r Repository) GetImportMappingsForEbId(ebId string) ([]ImportMapping, error) {
	return r.GetImportMappingsFromQuery(ebImportMappingQuery, ebId)
}

// GetImportMappingsForOeamtcAssetName returns the import mappings for the oeamtc asset name
func (r Repository) GetImportMappingsForOeamtcAssetName(oeamtcAssetName string) ([]ImportMapping, error) {
	return r.GetImportMappingsFromQuery(oeamtcImportMappingQuery, oeamtcAssetName)
}

// GetImportMappingsForOqdoResourceGroupIdObjectIdAndPropertyName returns the import mappings for the oqdo object id
func (r Repository) GetImportMappingsForOqdoResourceGroupIdObjectIdAndPropertyName(oqdoResourceGroupId uuid.UUID, oqdoObjectId uuid.UUID, oqdoPropertyName string) ([]ImportMapping, error) {
	return r.GetImportMappingsFromQuery(oqdoImportMappingQuery, fmt.Sprintf("%s.%s.%s", oqdoResourceGroupId.String(), oqdoObjectId.String(), oqdoPropertyName))
}
