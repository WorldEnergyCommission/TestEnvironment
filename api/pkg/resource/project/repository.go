package project

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/efficientIO/efficientIO/api/pkg/resource/rule"
	"github.com/efficientIO/efficientIO/api/pkg/utils"

	"github.com/gomodule/redigo/redis"
	"github.com/google/uuid"
)

const (
	createQuery = `INSERT INTO project(id, realm, name, secret, meta, connectivity, connectivity_actions, owner_id, created_at, limit_collections, limit_devices, limit_members) 
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`
	deleteProjectQuery       = "DELETE FROM project WHERE id = $1"
	deleteProjectModelsQuery = "DELETE FROM models WHERE r->>'project_id' = $1"
	updateQuery              = "UPDATE project SET name=$1, meta=$2, connectivity=$3, connectivity_actions=$4 WHERE id=$5"
	getQuery                 = `SELECT 
		id, realm, name, connectivity, connectivity_actions, meta, secret, owner_id, created_at, limit_collections, limit_devices, limit_members,
		(SELECT COUNT(*) FROM project_device WHERE project_device.project_id = project.id) as devices, 
		(SELECT COUNT(*) FROM project_collection WHERE project_collection.project_id = project.id) as collections, 
		(SELECT COUNT(*) FROM project_user_role WHERE project_user_role.project_id = project.id) as members, 
		(SELECT COALESCE((SELECT warning FROM project_alert_stats WHERE project_alert_stats.project_id = project.id LIMIT 1), 0)) as warnings, 
		(SELECT COALESCE((SELECT error FROM project_alert_stats WHERE project_alert_stats.project_id = project.id LIMIT 1), 0)) as errors 
	FROM project WHERE id = $1;`
	listQuery = `SELECT 
		p.id, p.realm, p.name, p.meta, p.secret, p.owner_id, p.created_at, p.limit_collections, p.limit_devices, p.limit_members,
		(SELECT COUNT(*) FROM project_device WHERE project_device.project_id = p.id) as devices, 
		(SELECT COUNT(*) FROM project_collection WHERE project_collection.project_id = p.id) as collections, 
		(SELECT COUNT(*) FROM project_user_role WHERE project_user_role.project_id = p.id) as members, 
		(SELECT COALESCE((SELECT warning FROM project_alert_stats WHERE project_alert_stats.project_id = p.id LIMIT 1), 0)) as warnings, 
		(SELECT COALESCE((SELECT error FROM project_alert_stats WHERE project_alert_stats.project_id = p.id LIMIT 1), 0)) as errors 
	FROM project p 
	INNER JOIN project_user_role pu on p.id = pu.project_id 
	WHERE pu.user_id = $1;`
	limitQuery       = "SELECT limit_collections, limit_devices, limit_members FROM project WHERE id = $1"
	listAllQueryBase = `SELECT DISTINCT 
		p.id, p.realm, p.name, p.meta, p.secret, p.owner_id, p.created_at, p.limit_collections, p.limit_devices, p.limit_members,
		(SELECT COUNT(*) FROM project_device WHERE project_device.project_id = p.id) as devices, 
		(SELECT COUNT(*) FROM project_collection WHERE project_collection.project_id = p.id) as collections, 
		(SELECT COUNT(*) FROM project_user_role WHERE project_user_role.project_id = p.id) as members, 
		(SELECT COALESCE((SELECT warning FROM project_alert_stats WHERE project_alert_stats.project_id = p.id LIMIT 1), 0)) as warnings, 
		(SELECT COALESCE((SELECT error FROM project_alert_stats WHERE project_alert_stats.project_id = p.id LIMIT 1), 0)) as errors 
	FROM project p 
	INNER JOIN project_user_role pu on p.id = pu.project_id`
	listAllQuery      = listAllQueryBase + ";"
	listByUserIdQuery = `SELECT 
		p.id, 
		p.realm, 
		p.name, 
		p.meta, 
		p.secret, 
		p.owner_id, 
		p.created_at, 
		p.limit_collections, 
		p.limit_devices, 
		p.limit_members,
		(SELECT COUNT(*)FROM project_device WHERE project_device.project_id = p.id) as devices, 
		(SELECT COUNT(*) FROM project_collection WHERE project_collection.project_id = p.id) as collections, 
		(SELECT COUNT(*) FROM project_user_role WHERE project_user_role.project_id = p.id) as members, 
		(SELECT COALESCE((SELECT warning FROM project_alert_stats WHERE project_alert_stats.project_id = p.id LIMIT 1), 0)) as warnings, 
	 	(SELECT COALESCE((SELECT error FROM project_alert_stats WHERE project_alert_stats.project_id = p.id LIMIT 1), 0)) as errors 
	FROM 
	(SELECT DISTINCT p.id
		FROM project p 
		LEFT JOIN permissions_for_user pfu on (p.id = pfu.project_id or pfu.wildcard = true)
		WHERE p.realm = $2	
		AND pfu.permission_id = 'readProject' AND pfu.user_id = $1) pid
	JOIN project p on pid.id = p.id`
	listByGpsDeviceIdQuery      = listAllQueryBase + " WHERE p.meta->'location'->>'gps_device_id' = $1;"
	onlyUserLeftProjectIdsQuery = `SELECT counter.project_id FROM (
		SELECT project_id, count(user_id) AS user_count FROM project_user_role 
		GROUP BY project_id ) AS counter
		JOIN project_user_role pu ON counter.project_id = pu.project_id
		WHERE pu.user_id  = $1 
		AND counter.user_count = 1`
	existsQuery = "SELECT true FROM project WHERE id = $1"
)

type Repository struct {
	Database *sql.DB
	Pool     *redis.Pool

	DeviceLimit     int
	MemberLimit     int
	CollectionLimit int
	MPCAddr         string
}

// Stats shows general statistics about a project. This is currently
// just used for List to show additional information in the project
// list.
type Stats struct {
	Devices     int `json:"devices"`
	Collections int `json:"collections"`
	Members     int `json:"members"`
	Warnings    int `json:"warnings"`
	Errors      int `json:"errors"`
}

// Limits defines the maximum amount of devices,members,collections
// in a specific project. This also prevents potential spamming.
type Limits struct {
	Devices     int `json:"devices"`     // 100
	Members     int `json:"members"`     // 25
	Collections int `json:"collections"` // 10
}

type Connectivity struct {
	Enabled bool          `json:"enabled"`
	Last    *time.Time    `json:"last"`
	Actions []rule.Action `json:"actions"`
}

type Project struct {
	ID           string         `json:"id"`
	Realm        string         `json:"-"`
	Name         string         `json:"name"`
	Secret       string         `json:"secret,omitempty"`
	Meta         map[string]any `json:"meta"`
	OwnerID      string         `json:"owner_id"`
	CreatedAt    time.Time      `json:"created_at"`
	Stats        Stats          `json:"stats"`
	Limits       Limits         `json:"limits"`
	Connectivity Connectivity   `json:"connectivity"`
}

type CreateOptions struct {
	Realm        string         `json:"realm"`
	Name         string         `json:"name"`
	UserID       string         `json:"user_id"`
	Meta         map[string]any `json:"meta"`
	Connectivity Connectivity   `json:"connectivity"`
}
type GetOptions struct {
	ID         string `json:"id"`
	WithSecret bool
}
type LimitOptions = GetOptions
type ListOptions struct {
	UserID string `json:"user_id"`
	Realm  string `json:"realm"`
}
type ListByGpsDeviceIdOptions struct {
	GpsDeviceId string `json:"gps_device_id"`
}
type UpdateOptions struct {
	ID           string         `json:"id"`
	Name         string         `json:"name"`
	Meta         map[string]any `json:"meta"`
	Connectivity Connectivity   `json:"connectivity"`
}

type StatsOptions struct {
	ID string `json:"id"`
}

func (r Repository) Create(o CreateOptions) (Project, error) {
	p := Project{
		ID:           uuid.New().String(),
		Realm:        o.Realm,
		Name:         o.Name,
		Secret:       uuid.New().String(),
		Meta:         o.Meta,
		Connectivity: o.Connectivity,
		OwnerID:      o.UserID,
		Limits: Limits{
			Devices:     r.DeviceLimit,
			Members:     r.MemberLimit,
			Collections: r.CollectionLimit,
		},
		Stats: Stats{
			Devices:     0,
			Collections: 0,
			Members:     1, // the initial member is the creator
			Warnings:    0,
			Errors:      0,
		},
		CreatedAt: time.Now(),
	}

	// "null" is valid json, but we don't want that. So if it is
	// "null", we replace it with "{}" (an empty map)
	if o.Meta == nil {
		o.Meta = map[string]any{}
	}

	if o.Connectivity.Actions == nil {
		o.Connectivity.Actions = make([]rule.Action, 0)
	}

	js, err := json.Marshal(&o.Meta)
	if err != nil {
		return Project{}, err
	}

	js2, err := json.Marshal(&o.Connectivity.Actions)
	if err != nil {
		return Project{}, err
	}

	_, err = r.Database.Exec(createQuery,
		p.ID, p.Realm, p.Name, p.Secret, js, o.Connectivity.Enabled, js2, p.OwnerID, p.CreatedAt, p.Limits.Collections, p.Limits.Devices, p.Limits.Members)
	if err != nil {
		return Project{}, err
	}

	// get a redis connection
	conn := r.Pool.Get()
	defer func(conn redis.Conn) {
		err := conn.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(conn)

	// set project secret in redis
	if _, err := conn.Do("HSET", fmt.Sprintf("lynus:projects:%s", p.ID), "secret", p.Secret); err != nil {
		return p, err
	}

	return p, nil
}

func (r Repository) Exists(id string) (bool, error) {
	rows, err := r.Database.Query(existsQuery, id)
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	if !rows.Next() {
		return false, err
	}

	return true, err
}

func (r Repository) Get(o GetOptions) (Project, error) {
	return GetProject(r.Database, r.Pool, o)
}

func GetProject(db *sql.DB, redis_pool *redis.Pool, o GetOptions) (Project, error) {
	rows, err := db.Query(getQuery, o.ID)
	if err != nil {
		return Project{}, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	if !rows.Next() {
		return Project{}, utils.NotFoundError{}
	}

	var (
		p       Project
		l       Limits
		s       Stats
		js, js2 []byte
	)
	if err := rows.Scan(&p.ID, &p.Realm, &p.Name, &p.Connectivity.Enabled, &js2, &js, &p.Secret, &p.OwnerID,
		&p.CreatedAt, &l.Collections, &l.Devices, &l.Members, &s.Devices, &s.Collections,
		&s.Members, &s.Warnings, &s.Errors); err != nil {
		return Project{}, err
	}

	p.Limits = l
	p.Stats = s

	if err := json.Unmarshal(js, &p.Meta); err != nil {
		p.Meta = map[string]any{}
	}

	if err := json.Unmarshal(js2, &p.Connectivity.Actions); err != nil {
		p.Connectivity.Actions = make([]rule.Action, 0)
	}

	last, err := heartbeat(redis_pool, p.ID)
	if err != nil {
		return Project{}, err
	}
	p.Connectivity.Last = last

	if !o.WithSecret {
		p.Secret = ""
	}

	return p, nil
}

// List returns a list of all projects for a specific user.
func (r Repository) List(o ListOptions) ([]Project, error) {
	// use different queries for stats and non-stats
	rows, err := r.Database.Query(listByUserIdQuery, o.UserID, o.Realm)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	return r.scanProject(rows)
}

// ListByGpsDeviceId returns a list of all projects that have a specific gps device set up
func (r Repository) ListByGpsDeviceId(o ListByGpsDeviceIdOptions) ([]Project, error) {
	rows, err := r.Database.Query(listByGpsDeviceIdQuery, o.GpsDeviceId)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	return r.scanProject(rows)
}

func (r Repository) scanProject(rows *sql.Rows) ([]Project, error) {
	projects := make([]Project, 0)

	for rows.Next() {
		var (
			p   Project
			s   Stats
			l   Limits
			js  []byte
			err error
		)

		if err = rows.Scan(&p.ID, &p.Realm, &p.Name, &js, &p.Secret, &p.OwnerID, &p.CreatedAt, &l.Collections,
			&l.Devices, &l.Members, &s.Devices, &s.Collections, &s.Members, &s.Warnings, &s.Errors); err != nil {
			return nil, err
		}
		p.Stats = s
		p.Limits = l

		if err = json.Unmarshal(js, &p.Meta); err != nil {
			p.Meta = map[string]any{}
		}

		last, err := heartbeat(r.Pool, p.ID)
		if err != nil {
			return nil, err
		}
		p.Connectivity.Last = last
		projects = append(projects, p)
	}

	return projects, nil
}

func (r Repository) ListAll() ([]Project, error) {
	// use different queries for stats and non-stats
	rows, err := r.Database.Query(listAllQuery)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	return r.scanProject(rows)
}

func (r Repository) Update(o UpdateOptions) (Project, error) {
	// see Send()
	if o.Meta == nil {
		o.Meta = map[string]any{}
	}

	if o.Connectivity.Actions == nil {
		o.Connectivity.Actions = make([]rule.Action, 0)
	}

	js, err := json.Marshal(&o.Meta)
	if err != nil {
		return Project{}, err
	}

	js2, err := json.Marshal(&o.Connectivity.Actions)
	if err != nil {
		return Project{}, err
	}

	_, err = r.Database.Exec(updateQuery, o.Name, js, o.Connectivity.Enabled, js2, o.ID)
	if err != nil {
		return Project{}, err
	}

	return r.Get(GetOptions{ID: o.ID})
}

func (r Repository) GetProjectsForOnlyLeftUser(user_id string) ([]Project, error) {
	projects := make([]Project, 0)
	rows, err := r.Database.Query(onlyUserLeftProjectIdsQuery, user_id)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	for rows.Next() {
		var (
			id      string
			err     error
			project Project
		)

		if err = rows.Scan(&id); err != nil {
			return nil, err
		}

		project, err = r.Get(GetOptions{ID: id, WithSecret: false})
		if err != nil {

			return nil, err
		}
		projects = append(projects, project)
	}

	return projects, nil
}

func (r Repository) DeleteProjectComplete(project_id string) error {

	url := fmt.Sprintf("%s/controllers/%s", r.MPCAddr, project_id)
	controllers, err := utils.MakeHttpRequest[[]map[string]any]("GET", url, nil, nil, true)
	if err != nil {
		return err
	}

	// delete ai controllers
	for _, controller := range controllers {
		url := fmt.Sprintf("%s/controllers/%s", r.MPCAddr, controller["id"])
		_, err := utils.MakeHttpRequest[string]("DELETE", url, nil, nil, true)
		if err != nil {
			return err
		}

	}

	// get weather station
	url = fmt.Sprintf("%s/weather/%s", r.MPCAddr, project_id)
	weatherSite, err := utils.MakeHttpRequest[map[string]bool]("GET", url, nil, nil, true)
	if err != nil {
		return err
	}

	// if is active delete
	if weatherSite["site_active"] {
		// delete weather stations
		url = fmt.Sprintf("%s/weather/%s", r.MPCAddr, project_id)
		_, err = utils.MakeHttpRequest[string]("DELETE", url, nil, nil, true)
		if err != nil {
			return err
		}
	}

	if err != nil {
		return err
	}

	// everything else gets deleted via 'on delete cascade'
	_, err = r.Database.Exec(deleteProjectQuery, project_id)
	if err != nil {
		return err
	}

	return r.RemoveProjectFromRedis(project_id)
}

func (r Repository) RemoveProjectFromRedis(project_id string) error {
	// get a redis connection
	conn := r.Pool.Get()
	defer func(conn redis.Conn) {
		err := conn.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(conn)

	// remove project from redis
	_, err := conn.Do("DEL", fmt.Sprintf("lynus:projects:%s", project_id))

	if err != nil {
		return err
	}

	cursor := 0
	pattern := fmt.Sprintf("lynus:projects:%s:*", project_id)
	count := 1000
	var keys []string

	// SCAN loop
	for {
		// Execute SCAN command
		values, err := redis.Values(conn.Do("SCAN", cursor, "MATCH", pattern, "COUNT", count))
		if err != nil {
			utils.LogError(err, "")
		}

		// Parse SCAN result
		_, err = redis.Scan(values, &cursor, &keys)
		if err != nil {
			utils.LogError(err, "")
		}

		// Delete the keys returned by the SCAN
		for _, key := range keys {
			_, err := conn.Do("DEL", key)
			if err != nil {
				// only log, don't return
				l := utils.GetLogger()
				l.Error().Str("key", key).Err(err).Msg("Error deleting from redis")
			}
		}

		// Check if the cursor is 0, which indicates the end of the scan
		if cursor == 0 {
			break
		}
	}

	return err
}

func (r Repository) RemoveProjectSecret(project_id string) error {
	// get a redis connection
	conn := r.Pool.Get()
	defer func(conn redis.Conn) {
		err := conn.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(conn)

	// remove the project secret from redis
	_, err := conn.Do("HDEL", fmt.Sprintf("lynus:projects:%s", project_id), "secret")
	return err
}

func (r Repository) Limits(o LimitOptions) (Limits, error) {
	var (
		err    error
		limits Limits
	)

	err = r.Database.QueryRow(limitQuery, o.ID).Scan(&limits.Collections, &limits.Devices, &limits.Members)
	return limits, err
}

// heartbeat returns the latest heartbeat
func heartbeat(pool *redis.Pool, project string) (*time.Time, error) {
	// get a redis connection
	conn := pool.Get()
	defer func(conn redis.Conn) {
		err := conn.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(conn)

	millis, err := redis.Int(conn.Do("HGET", fmt.Sprintf("lynus:projects:%s", project), "heartbeat"))
	if err != nil {
		if err == redis.ErrNil {
			return nil, nil
		}
		return nil, err
	}

	last := time.Unix(0, int64(millis)*int64(time.Millisecond))

	return &last, nil
}

// CreateProjectLastWrite saves the last time anything (except heartbeat) has been written to the project
func (r Repository) CreateProjectLastWrite(project string) error {
	// get a redis connection
	conn := r.Pool.Get()
	defer func(conn redis.Conn) {
		err := conn.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(conn)

	// get the current time in milliseconds
	now := time.Now().UnixNano() / 1_000_000
	_, err := conn.Do("HSET", fmt.Sprintf("lynus:projects:%s", project), "last", now)

	return err
}

// CreateProjectLastHeartbeat updates the last heartbeat time in redis,
// which is used for connectivity
func (r Repository) CreateProjectLastHeartbeat(project string) error {
	// get a redis connection
	conn := r.Pool.Get()
	defer func(conn redis.Conn) {
		err := conn.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(conn)

	// get the current time in milliseconds
	now := time.Now().UnixNano() / 1_000_000
	_, err := conn.Do("HSET", fmt.Sprintf("lynus:projects:%s", project), "heartbeat", now)

	return err
}

func (r Repository) AuthorizeWithProjectSecret(username, password string) error {
	return AuthorizeWithProjectSecret(username, password, r.Pool)
}

func AuthorizeWithProjectSecret(username, password string, pool *redis.Pool) error {
	// check if the username and password length matches the expectation
	if len(username) != 36 || len(password) != 36 {
		return errors.New("invalid username or password length")
	}

	// get a redis connection
	conn := pool.Get()
	defer func(conn redis.Conn) {
		err := conn.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(conn)

	// retrieves the expected password from redis and throws an error if retrieval fails
	key := fmt.Sprintf("lynus:projects:%s", username)
	expectedPassword, err := redis.String(conn.Do("HGET", key, "secret"))
	if err != nil {
		utils.LogError(err, "")
		return utils.NotFoundError{}
	}

	// check if passwords match ...
	if expectedPassword != password {
		// ... if not throw an error
		return errors.New("invalid password for user" + username)
	}

	// return no error to signal successful authorization
	return nil
}
