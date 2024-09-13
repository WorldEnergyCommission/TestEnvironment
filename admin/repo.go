package main

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/Nerzal/gocloak/v13"
	"github.com/samber/lo"
	"github.com/xuri/excelize/v2"

	"github.com/efficientIO/efficientIO/api/pkg/utils"
)

type User struct {
	ID        string
	Realm     string
	Enabled   bool
	Projects  int
	FirstName string
	LastName  string
	Email     string
	Mobile    string
	Address   struct {
		City    string
		Country string
		Street  string
		ZipCode string
	}
	Organization struct {
		Name string
		ID   string
	}
	CreatedAt time.Time
}

type Invoice struct {
	ID          string
	UserID      string
	Name        string
	Description string
	Notes       string
	Amount      float64
	PaidAt      sql.NullTime
	DueAt       time.Time
	CreatedAt   time.Time
}

type Project struct {
	ID        string
	Name      string
	Variables int
	Cost      string
	Limits    struct {
		Collections int
		Devices     int
		Members     int
	}
	CreatedAt time.Time
}

func CreateInvoice(db *sql.DB, invoice Invoice) error {
	if _, err := db.Exec(`INSERT INTO invoice(id, user_id, name, description, notes, amount, paid_at, due_at, created_at) VALUES 
                                ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
		&invoice.ID, &invoice.UserID, &invoice.Name, &invoice.Description, &invoice.Notes, &invoice.Amount,
		&invoice.PaidAt, &invoice.DueAt, &invoice.CreatedAt); err != nil {
		return err
	}

	return nil
}

func UpdateInvoice(db *sql.DB, invoice Invoice) error {
	_, err := db.Exec("UPDATE invoice SET name=$1, description=$2, notes=$3, amount=$4, paid_at=$5, due_at=$6, created_at=$7 WHERE id=$8",
		invoice.Name, invoice.Description, invoice.Notes, invoice.Amount, invoice.PaidAt, invoice.DueAt, invoice.CreatedAt, invoice.ID)

	return err
}

func GetInvoices(db *sql.DB, user string) ([]Invoice, error) {
	invoices := make([]Invoice, 0)

	rows, err := db.Query("SELECT id, user_id, name, description, notes, amount::numeric::float, paid_at, due_at, created_at FROM invoice WHERE user_id=$1", user)
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
		var i Invoice

		if err := rows.Scan(&i.ID, &i.UserID, &i.Name, &i.Description, &i.Notes, &i.Amount, &i.PaidAt, &i.DueAt, &i.CreatedAt); err != nil {
			return nil, err
		}

		invoices = append(invoices, i)
	}

	return invoices, nil
}

// GetUser returns keycloak user information with custom attributes
func GetUser(kk gocloak.GoCloak, token, id, realm string) (User, error) {
	u, err := kk.GetUserByID(context.TODO(), token, realm, id)
	if err != nil {
		return User{}, err
	}

	// use custom map because keycloak user attrs are full of pointers
	attrs := make(map[string]string)
	// attributes is nil when there are no custom attributes
	if u.Attributes != nil {
		for k, v := range *u.Attributes {
			if len(v) > 0 {
				attrs[k] = v[0]
			}
		}
	}

	return User{
		ID:        *u.ID,
		FirstName: *u.FirstName,
		LastName:  *u.LastName,
		Enabled:   *u.Enabled,
		Email:     *u.Email,
		Mobile:    attrs["mobile"],
		Address: struct {
			City    string
			Country string
			Street  string
			ZipCode string
		}{
			City:    attrs["address.city"],
			Country: attrs["address.country"],
			Street:  attrs["address.street"],
			ZipCode: attrs["address.zipCode"],
		},
		Organization: struct {
			Name string
			ID   string
		}{
			Name: attrs["organization.name"],
			ID:   attrs["organization.id"],
		},
		CreatedAt: time.Unix(*u.CreatedTimestamp/1000, 0),
	}, nil
}

// GetUsers returns all users from keycloak (except from "master" realm)
func GetUsers(kk gocloak.GoCloak, token string, db *sql.DB) ([]User, error) {
	ctx := context.Background()

	// get all projects and map them by the owner id
	now := time.Now()
	nextMonth := time.Date(now.Year(), now.Month()+1, 1, 0, 0, 0, 0, time.UTC)
	projects := make(map[string]int)

	rows, err := db.Query("SELECT COUNT(*), owner_id FROM project WHERE created_at <= $1 GROUP BY owner_id", nextMonth)
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
			count int
			owner string
		)

		if err := rows.Scan(&count, &owner); err != nil {
			return nil, err
		}

		projects[owner] = count
	}

	realms, err := GetAvailableRealms(kk, token)
	if err != nil {
		return nil, err
	}

	users := make([]User, 0)
	for _, realm := range realms {
		kkUsers, err := kk.GetUsers(ctx, token, *realm.ID, gocloak.GetUsersParams{})
		if err != nil {
			return nil, err
		}
		for _, u := range kkUsers {
			users = append(users, User{
				ID:        *u.ID,
				Enabled:   *u.Enabled,
				Projects:  projects[*u.ID],
				Realm:     *realm.ID,
				FirstName: *u.FirstName,
				LastName:  *u.LastName,
				Email:     *u.Email,
				CreatedAt: time.Unix(*u.CreatedTimestamp/1000, 0),
			})
		}
	}

	return users, nil
}

// GetAllProjects returns all projects with their variable count and cost
// for a specific user (owner)
func GetAllProjects(db *sql.DB, owner string, start time.Time, end time.Time) ([]Project, error) {
	rows, err := db.Query(`SELECT id, name, (SELECT COUNT(*) FROM measurements_meta WHERE project=p.id) as 
    							 variables, limit_collections, limit_devices, limit_members,
								 created_at FROM project p WHERE owner_id = $1 
    							 AND created_at <= $3 ORDER BY name`, owner, end)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	projects := make([]Project, 0)
	for rows.Next() {
		var p Project
		if err := rows.Scan(&p.ID, &p.Name, &p.Variables, &p.Limits.Collections, &p.Limits.Devices, &p.Limits.Members, &p.CreatedAt); err != nil {
			return nil, err
		}

		// 1   - 25   = 0,25€ or 0,275 CHF
		// 26  - 100  = 0,10€ or 0,11  CHF
		// 101 - 250  = 0,05€ or 0,055 CHF
		// 251 - 500  = 0,03€ or 0,033 CHF
		// 501 - 1000 = 0,02€ or 0,022 CHF
		var cost float64
		for i := 1; i <= p.Variables; i++ {
			if i <= 25 {
				cost += 0.25
			} else if i <= 100 {
				cost += 0.1
			} else if i <= 250 {
				cost += 0.05
			} else if i <= 500 {
				cost += 0.03
			} else {
				cost += 0.02
			}
		}

		p.Cost = fmt.Sprintf("%.3f", cost)

		projects = append(projects, p)
	}

	return projects, nil
}

// GetTop returns quick stats about the project
func GetTop(db *sql.DB, kk gocloak.GoCloak, token string) (projects int, measurements int, users int, err error) {
	// query all realms
	kkRealms, err := GetAvailableRealms(kk, token)
	if err != nil {
		return 0, 0, 0, err
	}

	userCount := 0
	for _, kkRealm := range kkRealms {
		realm := *kkRealm.ID
		users, err = kk.GetUserCount(context.TODO(), token, realm, gocloak.GetUsersParams{})
		if err != nil {
			return 0, 0, 0, err
		}
		userCount += users
	}

	// projects, measurements
	if err := db.QueryRow("SELECT (SELECT COUNT(*) FROM project), (SELECT * FROM approximate_row_count('measurements'))").
		Scan(&projects, &measurements); err != nil {
		return 0, 0, 0, err
	}

	return projects, measurements, userCount, nil
}

// GetAvailableRealms filters out the master realm and broken realms
func GetAvailableRealms(kk gocloak.GoCloak, token string) ([]*gocloak.RealmRepresentation, error) {
	keycloakRealms, err := kk.GetRealms(context.TODO(), token)
	if err != nil {
		return nil, err
	}
	filteredKeycloakRealms := lo.Filter(keycloakRealms, func(elem *gocloak.RealmRepresentation, _ int) bool {
		_, err := kk.GetUsers(context.TODO(), token, *elem.ID, gocloak.GetUsersParams{})
		realmBroken := err != nil
		return *elem.ID != "master" && !realmBroken
	})
	return filteredKeycloakRealms, nil
}

// GetReport returns an excel file with resource consumption information
// for a given timeframe
func GetReport(db *sql.DB, kk gocloak.GoCloak, token string, start, end time.Time) (*excelize.File, error) {
	// create a new page for each realm... we'll see LOL
	f := excelize.NewFile()
	style, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{
			Bold:   true,
			Italic: false,
			Family: "Times New Roman",
			Size:   12,
			Color:  "000000",
		},
	})

	// get project data and other stuff
	variables := make(map[string]int)

	rows, err := db.Query(`SELECT p.owner_id, COUNT(m) FROM measurements_meta m
         								 INNER JOIN project p ON m.project = p.id
										 WHERE p.created_at <= $2
										 GROUP BY p.owner_id;`, end)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	var (
		vars  int
		owner string
	)
	for rows.Next() {
		if err := rows.Scan(&owner, &vars); err != nil {
			return nil, err
		}

		variables[owner] = vars
	}

	ctx := context.TODO()

	kkRealms, err := GetAvailableRealms(kk, token)
	if err != nil {
		return nil, err
	}

	for _, kkRealm := range kkRealms {
		realm := *kkRealm.ID

		f.NewSheet(realm)
		// header
		_ = f.SetCellStyle(realm, "A1", "N1", style)
		_ = f.SetCellValue(realm, "A1", "ID")
		_ = f.SetCellValue(realm, "B1", "FirstName")
		_ = f.SetCellValue(realm, "C1", "LastName")
		_ = f.SetCellValue(realm, "D1", "Email")
		_ = f.SetCellValue(realm, "E1", "Mobile")
		_ = f.SetCellValue(realm, "F1", "Street")
		_ = f.SetCellValue(realm, "G1", "City")
		_ = f.SetCellValue(realm, "H1", "ZipCode")
		_ = f.SetCellValue(realm, "I1", "Country")
		_ = f.SetCellValue(realm, "J1", "Organization")
		_ = f.SetCellValue(realm, "K1", "Organization-ID")
		_ = f.SetCellValue(realm, "L1", "Variables")
		_ = f.SetCellValue(realm, "M1", "Cost")

		// now get all users and the data
		kkUsers, err := kk.GetUsers(ctx, token, realm, gocloak.GetUsersParams{})
		if err != nil {
			return nil, err
		}

		var index = 2
		for _, u := range kkUsers {
			// attributes is nil when there are no custom attributes
			attrs := make(map[string]string)
			if u.Attributes != nil {
				for k, v := range *u.Attributes {
					if len(v) > 0 {
						attrs[k] = v[0]
					}
				}
			}

			_ = f.SetCellValue(realm, fmt.Sprintf("A%d", index), *u.ID)
			_ = f.SetCellHyperLink(realm, fmt.Sprintf("A%d", index), fmt.Sprintf("https://admin.lynus.io/users/%s?realm=%s", *u.ID, realm), "External")

			_ = f.SetCellValue(realm, fmt.Sprintf("B%d", index), *u.FirstName)
			_ = f.SetCellValue(realm, fmt.Sprintf("C%d", index), *u.LastName)
			_ = f.SetCellValue(realm, fmt.Sprintf("D%d", index), *u.Email)
			_ = f.SetCellValue(realm, fmt.Sprintf("E%d", index), attrs["mobile"])
			_ = f.SetCellValue(realm, fmt.Sprintf("F%d", index), attrs["address.street"])
			_ = f.SetCellValue(realm, fmt.Sprintf("G%d", index), attrs["address.city"])
			_ = f.SetCellValue(realm, fmt.Sprintf("H%d", index), attrs["address.zipCode"])
			_ = f.SetCellValue(realm, fmt.Sprintf("I%d", index), attrs["address.country"])
			_ = f.SetCellValue(realm, fmt.Sprintf("J%d", index), attrs["organization.name"])
			_ = f.SetCellValue(realm, fmt.Sprintf("K%d", index), attrs["organization.id"])
			_ = f.SetCellValue(realm, fmt.Sprintf("L%d", index), variables[*u.ID])
			_ = f.SetCellValue(realm, fmt.Sprintf("M%d", index), float64(variables[*u.ID])*0.25)
			index++
		}

	}
	f.DeleteSheet("Sheet1")

	return f, nil
}
