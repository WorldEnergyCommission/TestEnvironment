package main

import (
	"context"
	"database/sql"
	"html/template"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/Nerzal/gocloak/v13"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	_ "github.com/lib/pq"

	"github.com/efficientIO/efficientIO/api/pkg/utils"
)

var (
	// database environment variables
	envDbAddr        = os.Getenv("DB_ADDR")
	envDbPort        = os.Getenv("DB_PORT")
	envDbName        = os.Getenv("DB_NAME")
	envDbUser        = os.Getenv("DB_USER")
	envDbPass        = os.Getenv("DB_PASS")
	envDbMode        = os.Getenv("DB_MODE")
	postgresDatabase *sql.DB

	// keycloak environment values
	envKKUsername      = os.Getenv("KEYCLOAK_USERNAME")
	envKKPassword      = os.Getenv("KEYCLOAK_PASSWORD")
	envKKAddr          = os.Getenv("KEYCLOAK_ADDR")
	keycloak           gocloak.GoCloak
	kkToken            *gocloak.JWT
	kkTokenLastRequest time.Time

	// other environment variables
	envDomain   = os.Getenv("DOMAIN")
	envUsername = os.Getenv("ADMIN_USERNAME")
	envPassword = os.Getenv("ADMIN_PASSWORD")

	tpl *template.Template

	// token func is used for caching the token until it expires,
	// so that we don't have to create a new token for each request
	token = func() string {
		if kkToken != nil && kkTokenLastRequest.Add(time.Second*time.Duration(kkToken.ExpiresIn)).After(time.Now()) {
			return kkToken.AccessToken
		}

		var err error
		kkToken, err = keycloak.LoginAdmin(context.TODO(), envKKUsername, envKKPassword, "master")
		if err != nil {
			utils.LogError(err, "[keycloak] could not login ")
			return ""
		}

		kkTokenLastRequest = time.Now()
		return kkToken.AccessToken
	}
)

func main() {
	var err error

	// Setup logging
	l := utils.GetLogger()

	// create a postgres database connection
	postgresDatabase, err = utils.OpenPostgresDatabase(envDbAddr, envDbPort, envDbName, envDbUser, envDbPass, envDbMode, utils.DefaultMaxOpenConnsLight, utils.DefaultMaxIdleConns, utils.DefaultConnMaxLifetime, utils.DefaultConnMaxIdleTime)
	if err != nil {
		l.Fatal().Err(err).Msg("Cannot open Postgres connection")
		return
	}
	defer func(postgresDatabase *sql.DB) {
		err := utils.ClosePostgresDatabase(postgresDatabase)
		if err != nil {
			l.Error().Err(err).Msg("Cannot close Postgres connection")
		}
	}(postgresDatabase)

	// initialize dependencies
	tpl = template.Must(template.ParseGlob("template/*.html"))
	keycloak = *gocloak.NewClient(envKKAddr)

	r := mux.NewRouter()
	r.Use(simpleAuthMiddleware)

	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("./static"))))
	r.HandleFunc("/", handleGetIndex).Methods(http.MethodGet)
	r.HandleFunc("/users", handleGetUsers).Methods(http.MethodGet)
	r.HandleFunc("/users/{user_id}", handleGetUser).Methods(http.MethodGet)
	r.HandleFunc("/report", handleGetReport).Methods(http.MethodGet)
	r.HandleFunc("/invoices", handleGetInvoice).Methods(http.MethodGet, http.MethodPost)

	r.HandleFunc("/api/userstatus", handleSetUserStatus)
	r.HandleFunc("/api/projectlimits", handleSetLimits)
	r.HandleFunc("/api/reset-password", handleResetPassword)

	l.Info().Msg("Admin Console Startet...")

	if err := http.ListenAndServe(":8000", r); err != nil {
		l.Fatal().Err(err).Msg("HTTP Server failed")
	}
}

// simpleAuthMiddleware is used as authentication for the admin-console.
// Because this is just an internal tool, until right now we didn't need
// multi-user management.
func simpleAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		username, password, ok := r.BasicAuth()
		if ok && username == envUsername && password == envPassword {
			next.ServeHTTP(w, r)
			return
		}

		w.Header().Set("WWW-Authenticate", `Basic`)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
	})
}

// handleGetIndex shows a basic overview
func handleGetIndex(w http.ResponseWriter, _ *http.Request) {
	projects, measurements, users, err := GetTop(postgresDatabase, keycloak, token())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := tpl.ExecuteTemplate(w, "index", map[string]any{
		"projects":     projects,
		"measurements": measurements,
		"users":        users,
	}); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// handleGetUsers lists users from all realms with the count of projects
// that they own
func handleGetUsers(w http.ResponseWriter, _ *http.Request) {
	users, err := GetUsers(keycloak, token(), postgresDatabase)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := tpl.ExecuteTemplate(w, "users", map[string]any{"users": users, "now": time.Now()}); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// handleGetUser shows user information and projects the user
// owns (with variables)
func handleGetUser(w http.ResponseWriter, r *http.Request) {
	realm := r.URL.Query().Get("realm")

	month, err := time.Parse("2006-01", r.URL.Query().Get("month"))
	if err != nil {
		now := time.Now()
		month = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
	}

	user, err := GetUser(keycloak, token(), mux.Vars(r)["user_id"], realm)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	invoices, err := GetInvoices(postgresDatabase, user.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	nextMonth := time.Date(month.Year(), month.Month()+1, month.Day(), 0, 0, 0, 0, time.UTC)
	projects, err := GetAllProjects(postgresDatabase, user.ID, month, nextMonth)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var (
		cost float64
	)
	for _, p := range projects {
		c, _ := strconv.ParseFloat(p.Cost, 64)
		cost += c
	}

	if err := tpl.ExecuteTemplate(w, "user", map[string]any{
		"user":       user,
		"projects":   projects,
		"month":      month,
		"next_month": nextMonth,
		"cost":       cost,
		"invoices":   invoices,
		"domain":     envDomain,
		"realm":      template.HTML(realm),
		"now":        time.Now(),
	}); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// handleGetReport creates a consumption report for all users
// in a given month in xlsx (excel) format
func handleGetReport(w http.ResponseWriter, r *http.Request) {
	month, err := time.Parse("2006-01", r.URL.Query().Get("month"))
	if err != nil {
		now := time.Now()
		month = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
	}
	nextMonth := time.Date(month.Year(), month.Month()+1, month.Day(), 0, 0, 0, 0, time.UTC)

	report, err := GetReport(postgresDatabase, keycloak, token(), month, nextMonth)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Content-Disposition", "attachment; filename=report_"+r.URL.Query().Get("month")+".xlsx")
	w.Header().Set("Content-Transfer-Encoding", "binary")
	if err := report.Write(w); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// handleGetInvoice renders the invoice page. Depending on the http method, the invoice gets created (POST)
// note that Lynus doesn't use this feature anymore, because invoices depend on the "variable count" and we
// changed our billing method. This has just been left here anyways.
func handleGetInvoice(w http.ResponseWriter, r *http.Request) {
	data := make(map[string]any)
	// add all url query params
	for k, v := range r.URL.Query() {
		data[k] = v[0]
	}

	// try to create invoice
	if r.Method == http.MethodPost {
		if err := r.ParseForm(); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		id := r.PostFormValue("id")
		user := r.PostFormValue("user")
		amount, _ := strconv.ParseFloat(r.PostFormValue("amount"), 64)
		name := r.PostFormValue("name")
		description := r.PostFormValue("description")
		notes := r.PostFormValue("notes")
		sCreation := r.PostFormValue("created_at")
		sDue := r.PostFormValue("due_at")
		sPaid := r.PostFormValue("paid_at")

		// overwrite data
		data["id"] = id
		data["user"] = user
		data["amount"] = amount
		data["name"] = name
		data["description"] = description
		data["notes"] = notes
		data["created_at"] = sCreation
		data["due_at"] = sDue
		data["paid_at"] = sPaid

		creation, _ := time.Parse("2006-01-02", sCreation)
		due, _ := time.Parse("2006-01-02", sDue)

		if due.Before(creation) {
			http.Error(w, "due cannot be before creation", http.StatusInternalServerError)
			return
		}

		paid := sql.NullTime{}
		if val, err := time.Parse("2006-01-02", sPaid); err == nil {
			paid.Time = val
			paid.Valid = true
		}

		invoice := Invoice{
			ID:          uuid.New().String(),
			UserID:      user,
			Name:        name,
			Description: description,
			Notes:       notes,
			Amount:      amount,
			PaidAt:      paid,
			DueAt:       due,
			CreatedAt:   creation,
		}

		if id != "" {
			invoice.ID = id
			if err := UpdateInvoice(postgresDatabase, invoice); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			data["message"] = "Updated successfully"
		} else {
			if err := CreateInvoice(postgresDatabase, invoice); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			data["message"] = "Created successfully"
		}
	}

	if err := tpl.ExecuteTemplate(w, "invoice", data); err != nil {
		utils.LogError(err, "Error Executing template 'Invoice' ")
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// handleSetUserStatus enables/disabled the user so that he cannot log in
// anymore
func handleSetUserStatus(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	realm := query.Get("realm")
	userId := query.Get("user")
	enabled, _ := strconv.ParseBool(query.Get("enabled"))

	if err := keycloak.UpdateUser(context.TODO(), token(), realm, gocloak.User{
		ID:      &userId,
		Enabled: &enabled,
	}); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// handleSetLimits sets limits for projects, mainly the maximal
// count of devices, collections, members
func handleSetLimits(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()

	devices, _ := strconv.ParseInt(q.Get("devices"), 10, 64)
	collections, _ := strconv.ParseInt(q.Get("collections"), 10, 64)
	members, _ := strconv.ParseInt(q.Get("members"), 10, 64)
	id := q.Get("project")

	if _, err := postgresDatabase.Exec("UPDATE project SET limit_devices = $1, limit_collections = $2, limit_members = $3 WHERE id = $4", devices, collections, members, id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func handleResetPassword(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	user := q.Get("user")
	realm := q.Get("realm")

	pass := randomPassword(8)
	if err := keycloak.SetPassword(context.TODO(), token(), user, realm, pass, true); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	w.Write([]byte(pass))
}

func randomPassword(n int) string {
	var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

	s := make([]rune, n)
	for i := range s {
		s[i] = letters[rand.Intn(len(letters))]
	}
	return string(s)
}
