package main

import (
	"bytes"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/mux"

	"github.com/efficientIO/efficientIO/api/pkg/utils"

	"github.com/efficientIO/efficientIO/report/pkg/report"
	_ "github.com/lib/pq"
)

var (
	// database environment variables
	envDbAddr        = os.Getenv("DB_ADDR")
	envDbPort        = os.Getenv("DB_PORT")
	envDbName        = os.Getenv("DB_NAME")
	envDbUser        = os.Getenv("DB_USER")
	envDbPass        = os.Getenv("DB_PASS")
	envDbMode        = os.Getenv("DB_MODE")
	envStaticAssets  = os.Getenv("STATIC_ASSETS")
	postgresDatabase *sql.DB

	envAPIAddr = os.Getenv("API_ADDR")
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
			utils.LogError(err, "Cannot close Postgres connection")
		}
	}(postgresDatabase)

	r := mux.NewRouter()
	r.Use(loggingMiddleWare)

	r.HandleFunc("/report", handleReport).Methods(http.MethodGet)
	r.HandleFunc("/monthly", handleMonthly).Methods(http.MethodGet)
	r.PathPrefix("/").Handler(http.FileServer(http.Dir(".")))

	l.Info().Msg("Starting report server...")

	if err := http.ListenAndServe(":8000", r); err != nil {
		l.Fatal().Err(err).Msg("HTTP Server failed")
	}
}

func loggingMiddleWare(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		l := utils.GetLogger()
		l.Info().
			Str("ip", r.Header.Get("x-forwarded-for")).
			Str("method", r.Method).
			Str("url", r.URL.String()).Msg("")
		next.ServeHTTP(w, r)
	})
}

// handleReport returns a report for the specified request
// example: /report?id=<report_id>&format=normal|zev&action=<whatever, if enabled, will send a notification>
func handleReport(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	id, format, action := q.Get("id"), q.Get("format"), q.Get("action")
	i, _ := strconv.Atoi(q.Get("start"))
	start := time.Unix(int64(i), 0)
	i, _ = strconv.Atoi(q.Get("end"))
	end := time.Unix(int64(i), 0)

	rep, err := report.Get(postgresDatabase, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		utils.LogError(err, "")
		return
	}
	rep.Start = start
	rep.End = end

	// get the result of report generation as []byte
	output, err := generate(rep, format)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		utils.LogError(err, "")
		return
	}

	// send notification if action is not empty
	if action != "" {
		if errs := sendNotifications(rep); len(errs) > 0 {
			errsStrings := make([]string, 0)
			for _, r := range errs {
				errsStrings = append(errsStrings, r.Error())
			}

			http.Error(w, strings.Join(errsStrings, ", "), http.StatusInternalServerError)
			return
		}
	}

	// write the result as response
	_, _ = w.Write(output)
}

// sendNotification sends the result as notification
func sendNotifications(r *report.Report) []error {
	errs := make([]error, 0)

	// mime-types
	formats := map[string]string{
		"csv":  "text/csv",
		"json": "application/json",
		"pdf":  "application/pdf",
		"xml":  "application/xml",
	}
	for _, a := range r.Actions {
		contentType := "text/plain"
		if val, ok := formats[a.Format]; ok {
			contentType = val
		}

		b, err := generate(r, a.Format)
		if err != nil {
			errs = append(errs, err)
			continue
		}

		switch a.Type {
		// send email
		case "email":
			body := a.Params.Body
			body = strings.ReplaceAll(body, "{{name}}", r.Name)
			body = strings.ReplaceAll(body, "{{start}}", r.Start.Format("02/01/2006 15:04"))
			body = strings.ReplaceAll(body, "{{end}}", r.End.Format("02/01/2006 15:04"))

			subject := a.Params.Subject
			subject = strings.ReplaceAll(subject, "{{name}}", r.Name)
			subject = strings.ReplaceAll(subject, "{{start}}", r.Start.Format("02/01/2006 15:04"))
			subject = strings.ReplaceAll(subject, "{{end}}", r.End.Format("02/01/2006 15:04"))

			a.Params.Subject = subject
			a.Params.Body = body
			a.Params.Attachments = []struct {
				Content  string "json:\"content\""
				Type     string "json:\"type\""
				Filename string "json:\"filename\""
			}{
				{
					Content:  base64.StdEncoding.EncodeToString(b),
					Filename: fmt.Sprintf("%s.%s", r.Name, a.Format),
					Type:     contentType,
				},
			}

		// webhook
		case "webhook":
			a.Params.Body = base64.StdEncoding.EncodeToString(b)
			a.Params.Headers["content-type"] = contentType

			// name
			name := fmt.Sprintf("%s.%s", r.Name, a.Format)
			name = strings.ReplaceAll(name, "{{start_date}}", r.Start.Format("20060102"))
			name = strings.ReplaceAll(name, "{{end_date}}", r.End.Format("20060102"))

			a.Params.Headers["name"] = name
		}

		js, err := json.Marshal(&a)
		if err != nil {
			errs = append(errs, err)
			continue
		}

		resp, err := http.Post(envAPIAddr+"/notifications", "application/json",
			bytes.NewReader(js))
		if err != nil {
			errs = append(errs, err)
			continue
		}
		if resp.StatusCode != http.StatusOK {
			data, err := ioutil.ReadAll(resp.Body)
			if err != nil {
				errs = append(errs, err)
				continue
			}
			errs = append(errs, errors.New(string(data)))
			continue
		}
		resp.Body.Close()
	}

	return errs
}

// generate the report
func generate(rep *report.Report, format string) ([]byte, error) {
	var (
		err    error
		output []byte
	)
	// generate different types like csv, json, pdf for each report, as specified in the report struct
	switch rep.Type {
	case report.TypeNormal:
		var normal *report.Normal
		normal, err = rep.Normal(envStaticAssets)
		if err != nil {
			return nil, err
		}
		switch format {
		case report.FormatCSV:
			output, err = normal.CSV()
		case report.FormatJSON:
			output, err = normal.JSON()
		case report.FormatPDF:
			output, err = normal.PDF()
		default:
			err = fmt.Errorf("%s is an invalid format", format)
		}
	case report.TypeZEV:
		var zev *report.Zev
		zev, err = rep.Zev()

		if err != nil {
			return nil, err
		}
		switch format {
		case report.FormatPDF:
			output, err = zev.PDF()
		case report.FormatXML:
			output, err = zev.InnosolvXML()
		case report.FormatCSV:
			output, err = zev.CSV()
		default:
			err = fmt.Errorf("%s is an invalid format", format)
		}
	}

	return output, err
}

// handleMonthly is a special endpoint that gets called by a cronjob (deployment.yaml) every month
func handleMonthly(w http.ResponseWriter, r *http.Request) {
	l := utils.GetLogger()
	l.Info().
		Str("ip", r.Header.Get("x-forwarded-for")).
		Str("method", r.Method).
		Str("url", r.URL.String()).Msg("")
	now := time.Now().AddDate(0, -1, 0) // get the previous month

	// get all reports
	reports, err := report.GetAllActive(postgresDatabase)
	if err != nil {
		utils.LogError(err, "[monthly] report failed")
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	for _, r := range reports {
		loc, err := time.LoadLocation(r.Timezone)
		if err != nil {
			utils.LogError(err, "")
			continue
		}

		// start of month
		start := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, loc)
		end := start.AddDate(0, 1, 0)

		r.Start = start
		r.End = end

		errs := sendNotifications(&r)
		if len(errs) > 0 {
			l := utils.GetLogger()
			l.Error().Err(errs[0]).Str("report", r.ID).Msg("[monthly] report failed")
		}
	}
}
