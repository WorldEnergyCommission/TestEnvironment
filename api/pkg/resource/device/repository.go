package device

import (
	"database/sql"
	"encoding/json"
	"errors"
	"time"

	"github.com/eneries/eneries/api/pkg/utils"
	"golang.org/x/exp/slices"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

const (
	createQuery = "INSERT INTO project_device(id, name, data, collection_id, project_id, created_at) VALUES ($1, $2, $3, $4, $5, $6)"
	updateQuery = "UPDATE project_device SET name = $1, data = $2, collection_id = $3 WHERE id = $4 AND project_id = $5"
	deleteQuery = "DELETE FROM project_device WHERE id=$1 AND project_id=$2"
	listQuery   = `
	SELECT pc.id, pc.name, pc.data, (select exists(select true from project_favorite WHERE device_id=pc.id AND user_id=$1)) as favorite, pc.project_id, pc.created_at, pc.collection_id 
	FROM project_device pc 
	JOIN (
		SELECT device_id, project_id, wildcard, permission_id
		FROM public.permissions_for_user user_permission
		where user_permission.user_id = $1 and permission_id = 'readDevice') scopes 
	ON (scopes.project_id = pc.project_id or scopes.project_id is NULL) AND (scopes.device_id = pc.id or scopes.wildcard = true)
	WHERE pc.project_id=$2`
	countQuery          = "SELECT COUNT(*) FROM project_device WHERE project_id=$1"
	getAllByTypeQuery   = "SELECT pc.id, pc.name, pc.data, false as favorite, pc.project_id, pc.created_at, pc.collection_id FROM project_device pc WHERE data::json->>'type'=$1"
	getQuery            = "SELECT pd.id, pd.name, pd.data, (select exists(select true from project_favorite WHERE device_id=pd.id AND user_id=$1)) as favorite, pd.project_id, pd.created_at, pd.collection_id FROM project_device pd WHERE id=$2 AND project_id=$3"
	addFavoriteQuery    = "INSERT INTO project_favorite(project_id, user_id, device_id) VALUES ($1, $2, $3)"
	deleteFavoriteQuery = "DELETE FROM project_favorite WHERE device_id=$1 AND user_id=$2"
)

type Repository struct {
	Database *sql.DB
}
type Device struct {
	ID           string         `json:"id"`
	Name         string         `json:"name"`
	Data         map[string]any `json:"data"`
	Favorite     bool           `json:"favorite"`
	CollectionID string         `json:"collection_id"`
	ProjectID    string         `json:"-"`
	CreatedAt    time.Time      `json:"created_at"`
}
type Options struct {
	ID           string         `json:"id"`
	Name         string         `json:"name"`
	Data         map[string]any `json:"data"`
	CollectionID string         `json:"collection_id"`
	ProjectID    string         `json:"project_id"`
	UserID       string         `json:"user_id"`
}
type CreateOptions struct {
	Name         string         `json:"name"`
	Data         map[string]any `json:"data"`
	CollectionID string         `json:"collection_id"`
	ProjectID    string         `json:"project_id"`
}
type UpdateOptions struct {
	ID           string         `json:"id"`
	Name         string         `json:"name"`
	Data         map[string]any `json:"data"`
	UserID       string         `json:"user_id"`
	CollectionID string         `json:"collection_id"`
	ProjectID    string         `json:"project_id"`
}
type UpdateChartOptions struct {
	PeriodName             string `json:"period_name"`
	Interval               string `json:"interval"`
	SelectedStackingOption string `json:"selected_stacking_options"`
}
type DeleteOptions struct {
	ID        string `json:"id"`
	ProjectID string `json:"project_id"`
}
type ListOptions struct {
	UserID    string `json:"user_id"`
	ProjectID string `json:"project_id"`
}
type CountOptions struct {
	ProjectID string `json:"project_id"`
}
type GetOptions struct {
	UserID    string `json:"user_id"`
	ID        string `json:"id"`
	ProjectID string `json:"project_id"`
}
type AddFavoriteOptions struct {
	ProjectID string `json:"project_id"`
	UserID    string `json:"user_id"`
	ID        string `json:"id"`
}
type RemoveFavoriteOptions struct {
	UserID string `json:"user_id"`
	ID     string `json:"id"`
}

func (r Repository) Create(o CreateOptions) (Device, error) {
	d := Device{
		ID:           uuid.New().String(),
		Name:         o.Name,
		Data:         o.Data,
		CollectionID: o.CollectionID,
		ProjectID:    o.ProjectID,
		CreatedAt:    time.Now(),
	}

	data, err := json.Marshal(d.Data)
	if err != nil {
		return Device{}, err
	}

	_, err = r.Database.Exec(createQuery, d.ID, d.Name, data, d.CollectionID, d.ProjectID, d.CreatedAt)
	if err != nil {
		return Device{}, err
	}

	return d, nil
}
func (r Repository) Update(o UpdateOptions) (Device, error) {
	data, err := json.Marshal(o.Data)
	if err != nil {
		return Device{}, err
	}

	_, err = r.Database.Exec(updateQuery, o.Name, data, o.CollectionID, o.ID, o.ProjectID)
	if err != nil {
		return Device{}, err
	}

	return r.Get(GetOptions{UserID: o.UserID, ID: o.ID, ProjectID: o.ProjectID})
}
func (r Repository) Delete(o DeleteOptions) error {
	_, err := r.Database.Exec(deleteQuery, o.ID, o.ProjectID)
	return err
}
func (r Repository) List(opts ListOptions) ([]Device, error) {
	rows, err := r.Database.Query(listQuery, opts.UserID, opts.ProjectID)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	devices := make([]Device, 0)
	for rows.Next() {
		var (
			js []byte
			d  Device
		)

		if err := rows.Scan(&d.ID, &d.Name, &js, &d.Favorite, &d.ProjectID, &d.CreatedAt, &d.CollectionID); err != nil {
			return nil, err
		}
		if err := json.Unmarshal(js, &d.Data); err != nil {
			return nil, err
		}

		devices = append(devices, d)
	}

	return devices, nil
}
func (r Repository) Get(o GetOptions) (Device, error) {
	rows, err := r.Database.Query(getQuery, o.UserID, o.ID, o.ProjectID)
	if err != nil {
		return Device{}, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	// check if device exists
	if !rows.Next() {
		return Device{}, utils.NotFoundError{}
	}

	var (
		d  Device
		js []byte
	)
	if err := rows.Scan(&d.ID, &d.Name, &js, &d.Favorite, &d.ProjectID, &d.CreatedAt, &d.CollectionID); err != nil {
		return Device{}, err
	}
	if err := json.Unmarshal(js, &d.Data); err != nil {
		return Device{}, err
	}

	return d, nil
}

func (r Repository) GetAllbyType(deviceType string) ([]Device, error) {
	rows, err := r.Database.Query(getAllByTypeQuery, deviceType)
	if err != nil {
		return []Device{}, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	devices := make([]Device, 0)
	for rows.Next() {
		var (
			js []byte
			d  Device
		)

		if err := rows.Scan(&d.ID, &d.Name, &js, &d.Favorite, &d.ProjectID, &d.CreatedAt, &d.CollectionID); err != nil {
			return nil, err
		}
		if err := json.Unmarshal(js, &d.Data); err != nil {
			return nil, err
		}

		devices = append(devices, d)
	}
	return devices, nil
}

func (r Repository) AddFavorite(o AddFavoriteOptions) error {
	_, err := r.Database.Exec(addFavoriteQuery,
		o.ProjectID, o.UserID, o.ID)

	// for us this is not an error, it just means that it has already been set
	// as favorite. So for now we ignore the error
	if err, ok := err.(*pq.Error); ok && err.Code.Name() == "unique_violation" {
		return nil
	}

	return err
}
func (r Repository) RemoveFavorite(o RemoveFavoriteOptions) error {
	_, err := r.Database.Exec(deleteFavoriteQuery, o.ID, o.UserID)
	return err
}

func (r Repository) Count(o CountOptions) (int, error) {
	var (
		count int
		err   error
	)

	err = r.Database.QueryRow(countQuery, o.ProjectID).Scan(&count)
	return count, err
}

// ValidateIntervalString checks if the passed interval string as chart option is valid
func ValidateIntervalString(interval string) error {
	allowedValues := []string{"1s", "15s", "1m", "15m", "1h", "1d", "1w", "1month", "1y"}
	if !slices.Contains(allowedValues, interval) {
		return errors.New("invalid interval string")
	}
	return nil
}

// ValidatePeriodString checks if the passed period string as chart option is valid
func ValidatePeriodString(period string) error {
	allowedValues := []string{"live", "hour", "day", "week", "month", "year",
		"last_hour", "last_six_hours", "last_twentyfour_hours",
		"last_three_days", "last_seven_days", "last_thirty_days",
		"last_ninety_days", "last_year", "last_five_years"}
	if !slices.Contains(allowedValues, period) {
		return errors.New("invalid period string")
	}
	return nil
}

// ValidateSelectedStackingOptionString checks if the passed stacking option string as chart option is valid
func ValidateSelectedStackingOptionString(selectedStackingOption string) error {
	allowedValues := []string{"", "normal"}
	if !slices.Contains(allowedValues, selectedStackingOption) {
		return errors.New("invalid selected stacking option string")
	}
	return nil
}
