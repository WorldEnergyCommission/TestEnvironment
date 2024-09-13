package main

import (
	"context"
	"crypto/tls"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/procyon-projects/chrono"

	"github.com/efficientIO/efficientIO/api/pkg/auth"
	"github.com/efficientIO/efficientIO/api/pkg/resource/ai"
	"github.com/efficientIO/efficientIO/api/pkg/resource/alert"
	"github.com/efficientIO/efficientIO/api/pkg/resource/asset"
	"github.com/efficientIO/efficientIO/api/pkg/resource/benchmarking"
	"github.com/efficientIO/efficientIO/api/pkg/resource/collection"
	data_mapping "github.com/efficientIO/efficientIO/api/pkg/resource/data_mapping"
	"github.com/efficientIO/efficientIO/api/pkg/resource/device"
	"github.com/efficientIO/efficientIO/api/pkg/resource/document"
	"github.com/efficientIO/efficientIO/api/pkg/resource/easeeapi"
	"github.com/efficientIO/efficientIO/api/pkg/resource/icon"
	"github.com/efficientIO/efficientIO/api/pkg/resource/invoice"
	"github.com/efficientIO/efficientIO/api/pkg/resource/measurement"
	"github.com/efficientIO/efficientIO/api/pkg/resource/member"
	"github.com/efficientIO/efficientIO/api/pkg/resource/modules"
	"github.com/efficientIO/efficientIO/api/pkg/resource/notification"
	"github.com/efficientIO/efficientIO/api/pkg/resource/permission"
	"github.com/efficientIO/efficientIO/api/pkg/resource/project"
	"github.com/efficientIO/efficientIO/api/pkg/resource/report"
	"github.com/efficientIO/efficientIO/api/pkg/resource/rule"
	"github.com/efficientIO/efficientIO/api/pkg/resource/user"
	"github.com/efficientIO/efficientIO/api/pkg/resource/weather"
	"github.com/efficientIO/efficientIO/api/pkg/utils"
	"github.com/go-playground/validator/v10"
	"github.com/gorilla/handlers"

	"github.com/Nerzal/gocloak/v13"
	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/gomodule/redigo/redis"
	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	httpSwagger "github.com/swaggo/http-swagger/v2" // http-swagger middleware

	docs "github.com/efficientIO/efficientIO/api/pkg/docs"
)

const (
	DatabaseCheckInterval = 30 * time.Second
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

	// redis environment variables
	envRedisAddr = os.Getenv("REDIS_ADDR")
	redisPool    *redis.Pool

	// keycloak environment variables
	envKeycloakAddr     = os.Getenv("KEYCLOAK_ADDR")
	envKeycloakUsername = os.Getenv("KEYCLOAK_USERNAME")
	envKeycloakPassword = os.Getenv("KEYCLOAK_PASSWORD")
	keycloak            gocloak.GoCloak

	// mqtt environment variables
	envMqttAddr = os.Getenv("MQTT_ADDR")
	mqttClient  mqtt.Client

	// other environment variables
	envDomain                    = os.Getenv("DOMAIN")
	envReportAddr                = os.Getenv("REPORT_ADDR")
	envSendgridConfigs           = os.Getenv("SENDGRID_CONFIGS")
	envMinioEndpoint             = os.Getenv("MINIO_ADDR")
	envMinioSSL                  = os.Getenv("MINIO_SSL")
	envMinioAccessKey            = os.Getenv("MINIO_ACCESS_KEY")
	envMinioSecretKey            = os.Getenv("MINIO_SECRET_KEY")
	envOpenWeatherMapApiKey      = os.Getenv("OPENWEATHERMAP_KEY")
	envMPCAddr                   = os.Getenv("MPC_ADDR")
	envEaseeAmqpConnectionString = os.Getenv("EASEE_AMQP_CONNECTION_STRING")

	// dependencies
	client    *minio.Client
	minioCore *minio.Core

	// repositories
	iconRepo         icon.Repository
	ruleRepo         rule.Repository
	authRepo         auth.Repository
	userRepo         user.Repository
	alertRepo        alert.Repository
	assetRepo        asset.Repository
	deviceRepo       device.Repository
	memberRepo       member.Repository
	invoiceRepo      invoice.Repository
	weatherRepo      weather.Repository
	projectRepo      project.Repository
	documentRepo     document.Repository
	collectionRepo   collection.Repository
	measurementRepo  measurement.Repository
	notificationRepo notification.Repository
	reportRepo       report.Repository
	permissionRepo   permission.Repository
	aiRepo           ai.Repository
	dataMappingRepo  data_mapping.Repository
	modulesRepo      modules.Repository
	benchmarkingRepo benchmarking.Repository

	easeeClient *easeeapi.EaseeAPIClient
	err_easee   error

	// limits (can be changed per project/user)
	projectLimit    = 8192
	deviceLimit     = 8192
	memberLimit     = 8192
	collectionLimit = 8192

	// messages
	msgInternalServerError = "internal server error"

	// prometheus metrics
	metricMutex         = &sync.RWMutex{}
	metricRequestsTotal = map[string]int{}

	//single instance of validator, it caches struct info
	validate *validator.Validate
)

func main() {
	// Setup logging
	l := utils.GetLogger()

	var err error

	// create a postgres database connection
	postgresDatabase, err = utils.OpenPostgresDatabase(envDbAddr, envDbPort, envDbName, envDbUser, envDbPass, envDbMode, utils.DefaultMaxOpenConnsUltra, utils.DefaultMaxIdleConns, utils.DefaultConnMaxLifetime, utils.DefaultConnMaxIdleTime)
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

	// create a new task scheduler
	taskScheduler := chrono.NewDefaultTaskScheduler()
	// schedule the database check periodically
	_, err = taskScheduler.ScheduleAtFixedRate(func(ctx context.Context) {
		databaseCheck(postgresDatabase, false)
	}, DatabaseCheckInterval)
	if err != nil {
		l.Fatal().Err(err).Msg("Schedule Database Check")
		return
	}

	// create a redis connection pool
	redisPool = utils.OpenRedisPool(envRedisAddr)
	defer func(redisPool *redis.Pool) {
		err := utils.CloseRedisPool(redisPool)
		if err != nil {
			l.Error().Err(err).Msg("Cannot close Redis pool")
		}
	}(redisPool)

	// keycloak
	keycloak = *gocloak.NewClient(envKeycloakAddr)
	gocloak.SetLegacyWildFlySupport()(&keycloak)

	// minio
	client, err = minio.New(envMinioEndpoint, &minio.Options{
		Creds:     credentials.NewStaticV4(envMinioAccessKey, envMinioSecretKey, ""),
		Secure:    envMinioSSL == "true",
		Transport: &http.Transport{TLSClientConfig: &tls.Config{InsecureSkipVerify: true}},
	})
	if err != nil {
		l.Fatal().Err(err).Msg("Cannot open Minio connection")
	}
	minioCore, err = minio.NewCore(envMinioEndpoint, &minio.Options{
		Creds:     credentials.NewStaticV4(envMinioAccessKey, envMinioSecretKey, ""),
		Secure:    envMinioSSL == "true",
		Transport: &http.Transport{TLSClientConfig: &tls.Config{InsecureSkipVerify: true}},
	})
	if err != nil {
		l.Fatal().Err(err).Msg("Cannot open Minio connection")
	}

	// connect a client to the mqtt broker
	mqttClient, err = utils.CreateMqttClient(envMqttAddr, []string{}, nil)
	if err != nil {
		l.Fatal().Err(err).Msg("Cannot open MQTT connection")
		return
	}
	defer func(mqttClient mqtt.Client) {
		err := utils.DestroyMqttClient(mqttClient)
		if err != nil {
			l.Error().Err(err).Msg("Cannot close MQTT connection")
		}
	}(mqttClient)

	authRepo = auth.Repository{Database: postgresDatabase, Keycloak: &keycloak, KeycloakUsername: envKeycloakUsername, KeycloakPassword: envKeycloakPassword}
	ruleRepo = rule.Repository{Database: postgresDatabase}
	iconRepo = icon.Repository{}
	alertRepo = alert.Repository{Database: postgresDatabase}
	userRepo = user.Repository{Database: postgresDatabase, Keycloak: &keycloak, KeycloakUsername: envKeycloakUsername, KeycloakPassword: envKeycloakPassword, ProjectLimit: projectLimit}
	assetRepo = asset.Repository{Database: postgresDatabase, Bucket: "assets", Storage: client}
	memberRepo = member.Repository{Database: postgresDatabase, SendgridConfigs: notification.ParseSendgridConfigs(envSendgridConfigs)}
	deviceRepo = device.Repository{Database: postgresDatabase}
	reportRepo = report.Repository{Database: postgresDatabase}
	invoiceRepo = invoice.Repository{Database: postgresDatabase}
	projectRepo = project.Repository{Database: postgresDatabase, Pool: redisPool, CollectionLimit: collectionLimit, DeviceLimit: deviceLimit, MemberLimit: memberLimit, MPCAddr: envMPCAddr}
	weatherRepo = weather.Repository{OpenWeatherAPIKey: envOpenWeatherMapApiKey}
	documentRepo = document.Repository{Database: postgresDatabase, Storage: client, Bucket: "documents", CoreClient: minioCore}
	collectionRepo = collection.Repository{Database: postgresDatabase}
	measurementRepo = measurement.Repository{Database: postgresDatabase, Pool: redisPool}
	notificationRepo = notification.Repository{SendgridConfigs: notification.ParseSendgridConfigs(envSendgridConfigs), AlertRepo: &alertRepo, ProjectRepo: &projectRepo}
	permissionRepo = permission.Repository{Database: postgresDatabase}
	aiRepo = ai.Repository{Database: postgresDatabase}
	validate = validator.New()
	dataMappingRepo = data_mapping.Repository{Database: postgresDatabase, RedisPool: redisPool}
	modulesRepo = modules.Repository{Database: postgresDatabase}
	benchmarkingRepo = benchmarking.Repository{Database: postgresDatabase, MeasurementRepo: &measurementRepo, RedisPool: redisPool}

	if envEaseeAmqpConnectionString != "" && envEaseeAmqpConnectionString != " " {
		easeeClient, err_easee = easeeapi.NewEaseeAPIClient(envEaseeAmqpConnectionString)
		if err_easee != nil {
			l.Fatal().Err(err_easee).Msg("Cannot open easee connection")
		}
	}

	r := routes()
	r.Use(requestHousekeeping)

	corsOptions := []handlers.CORSOption{
		handlers.AllowedOrigins([]string{"*"}),
		handlers.AllowedHeaders([]string{"Authorization", "Content-Type"}),
		handlers.AllowedMethods([]string{"GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}),
		handlers.MaxAge(1728000),
		handlers.OptionStatusCode(204),
	}

	l.Info().Msg("Starting API server ...")

	if err := http.ListenAndServe(":8000", handlers.CORS(corsOptions...)(r)); err != nil {
		l.Fatal().Err(err).Msg("HTTP Server failed")
	}
}

// databaseCheck logs the amount of open connections and eventually terminates the program if the connection limit is reached
func databaseCheck(postgresDatabase *sql.DB, terminateOnReachedLimit bool) {
	l := utils.GetLogger()
	// log the current amount of open connections
	currentOpenConnections := postgresDatabase.Stats().OpenConnections
	currentConnectionLimit := postgresDatabase.Stats().MaxOpenConnections

	l.Debug().Int("OpenConnections", currentOpenConnections).Msg(fmt.Sprintf("DatabaseStats: %v out of %v possible connections used", currentOpenConnections, currentConnectionLimit))

	if currentOpenConnections == currentConnectionLimit && terminateOnReachedLimit {
		l.Fatal().Msg("DatabaseStats: connection limit reached, terminating application ...")
	}
}

// @title           EfficientIO API
// @version         1.0
// @Description     EfficientIO API documentation for developers.

// @contact.name   API Support
// @contact.email  development@efficientio.com

// @BasePath  /v1

// @Securitydefinitions.oauth2.password OAuth2Application
// @tokenUrl https://api.efficientio.io/v1/auth/dev/token
func routes() *mux.Router {
	docs.SwaggerInfo.Host = "https://api." + envDomain
	r := mux.NewRouter()

	// openapi specification, swagger docs
	// TODO: somehow change description for realms/whitelabels
	// how to authenticate here (readSwagger) ? -- maybe console via iframe -- no authentication for now
	r.PathPrefix("/swagger/").Handler(httpSwagger.Handler(
		httpSwagger.URL("./swagger/doc.json"),
	))

	//	@Tag.name	Projects
	//	@Tag.description Project management endpoints.
	r.HandleFunc("/projects", handleWithPermission(projectsListHandler, "listProject")).Methods(http.MethodGet)
	r.HandleFunc("/projects", handleWithPermission(projectsCreateHandler, "createProject")).Methods(http.MethodPost)
	r.HandleFunc("/projects/{project_id}", handleWithProjectPermission(projectsGetHandler, "readProject")).Methods(http.MethodGet)
	r.HandleFunc("/projects/{project_id}", handleWithProjectPermission(projectsUpdateHandler, "writeProject")).Methods(http.MethodPut)
	r.HandleFunc("/projects/{project_id}", handleWithPermission(projectsDeleteHandler, "deleteProject")).Methods(http.MethodDelete)
	r.HandleFunc("/projects/{project_id}/mqtt-secret", handleWithProjectPermission(projectsMQTTSecretHandler, "readMQTTSecret")).Methods(http.MethodGet)
	r.HandleFunc("/projects/{project_id}/operating-hours", handleWithProjectPermission(projectsGetCurrentOperatingHoursHandler, "readProject")).Methods(http.MethodGet)
	r.HandleFunc("/projects/{project_id}/operating-hours", handleWithProjectPermission(projectsAddOperatingHoursHandler, "writeProject")).Methods(http.MethodPost)
	r.HandleFunc("/projects/{project_id}/holidays", handleWithProjectPermission(projectsGetCurrentHolidaysHandler, "readProject")).Methods(http.MethodGet)
	r.HandleFunc("/projects/{project_id}/holidays", handleWithProjectPermission(projectsAddHolidaysHandler, "writeProject")).Methods(http.MethodPost)
	// Machine Readable endpoints
	r.HandleFunc("/projects/{project_id}/operating-hours/machine-readable", projectsGetCurrentOperatingHoursMachineReadableHandler).Methods(http.MethodPost)
	r.HandleFunc("/projects/{project_id}/holidays/machine-readable", projectsCurrentHolidaysMachineReadable).Methods(http.MethodPost)

	//	@Tag.name	Collections
	//	@Tag.description Collection management endpoints. Collections are for grouping devices. The might get referred to as "Areas" in the console.
	r.HandleFunc("/projects/{project_id}/collections", handleWithProjectPermission(collectionsCreateHandler, "createCollection")).Methods(http.MethodPost) // createCollection (project right)
	r.HandleFunc("/projects/{project_id}/collections", handleWithProjectPermission(collectionsListHandler, "listCollection")).Methods(http.MethodGet)
	r.HandleFunc("/projects/{project_id}/collections/{collection_id}", handleWithCollectionDevicePermission(collectionsGetHandler, "readDevice", "collection_id")).Methods(http.MethodGet)
	r.HandleFunc("/projects/{project_id}/collections/{collection_id}", handleWithScopedPermission(collectionsUpdateHandler, "writeCollection", "collection_id", "collection_id")).Methods(http.MethodPut)     // writeCollection:{id/*} (project right)
	r.HandleFunc("/projects/{project_id}/collections/{collection_id}", handleWithScopedPermission(collectionsDeleteHandler, "deleteCollection", "collection_id", "collection_id")).Methods(http.MethodDelete) // deleteCollection:{id/*} (project right)

	// @Tag.name		Devices
	// @Tag.description Devices are used to map between measurements stored in the database and visualizations in the console.
	r.HandleFunc("/projects/{project_id}/devices", handleWithProjectPermission(devicesCreateHandler, "createDevice")).Methods(http.MethodPost)
	r.HandleFunc("/projects/{project_id}/devices", handleWithProjectPermission(devicesListHandler, "listDevice")).Methods(http.MethodGet) // readDevice:{id/*} (project right)
	r.HandleFunc("/projects/{project_id}/devices/{device_id}", handleWithScopedPermission(devicesListHandler, "readDevice", "device_id", "device_id")).Methods(http.MethodGet)
	r.HandleFunc("/projects/{project_id}/devices/{device_id}", handleWithScopedPermission(devicesUpdateDevice, "writeDevice", "device_id", "device_id")).Methods(http.MethodPut)                        // writeDevice:{id/*} (project right)
	r.HandleFunc("/projects/{project_id}/devices/{device_id}/charger-details", handleWithScopedPermission(devicesChargerDetailsHander, "readDevice", "device_id", "device_id")).Methods(http.MethodGet) // writeDevice:{id/*} (project right)
	r.HandleFunc("/projects/{project_id}/devices/chartOptions/{device_id}", handleWithScopedPermission(devicesUpdateChartOptions, "readDevice", "device_id", "device_id")).Methods(http.MethodPut)      // -- should be get actually since it only gets chart data
	r.HandleFunc("/projects/{project_id}/devices/{device_id}", handleWithScopedPermission(devicesDeleteHandler, "deleteDevice", "device_id", "device_id")).Methods(http.MethodDelete)                   // deleteDevice:{id/*} (project right)
	r.HandleFunc("/projects/{project_id}/favorites/{device_id}", handleWithScopedPermission(devicesCreateFavoriteHandler, "writeDevice", "device_id", "device_id")).Methods(http.MethodPut)             // writeDevice:{id/*} (project right)
	r.HandleFunc("/projects/{project_id}/favorites/{device_id}", handleWithScopedPermission(devicesDeleteFavoriteHandler, "writeDevice", "device_id", "device_id")).Methods(http.MethodDelete)          // writeDevice:{id/*} (project right)

	// @Tag.name		Measurements
	// @Tag.description Measurement endpoints, to list, create, and get measurements. Also subscribe endpoints for live updates using SSE.
	r.HandleFunc("/projects/measurements", handleWithPermission(measurementsCreateHandler, "createMeasurement")).Methods(http.MethodPost) // createMeasurement (user right)
	r.HandleFunc("/projects/{project_id}/measurements", handleWithProjectPermission(measurementsListHandler, "listDevice")).Methods(http.MethodGet)
	r.HandleFunc("/projects/{project_id}/measurements/{measurement}", handleWithOneOfMeasurementDevicePermission(measurementsGetHandler, []string{"readDevice", "readAI"}, "measurement")).Methods(http.MethodGet)
	r.HandleFunc("/projects/{project_id}/measurements/{measurement_id}/chart", handleWithOneOfMeasurementDevicePermission(measurementsHistoryHandler, []string{"readDevice", "readAI"}, "measurement_id")).Methods(http.MethodGet)
	r.HandleFunc("/projects/{project_id}/measurements/{measurement_id}/publish", handleWithOneOfMeasurementDevicePermission(measurementPublishHandler, []string{"readDevice", "readAI"}, "measurement_id")).Methods(http.MethodPost)
	r.HandleFunc("/projects/{project_id}/measurements/all/subscribe", measurementSubscribeHandler).Methods(http.MethodGet)
	r.HandleFunc("/projects/{project_id}/measurements/all/subscribe", measurementSubscribeHandler).Methods(http.MethodPost)
	r.HandleFunc("/measurements/subscribe/multiple", measurementSubscribeMultipleHandler).Methods(http.MethodPost)

	// @Tag.name		Members
	// @Tag.description Member management endpoints, to manage members of projects and their roles in projects.
	r.HandleFunc("/projects/{project_id}/members", handleWithProjectPermission(membersListHandler, "listMember")).Methods(http.MethodGet)                                           //  -- should not list platform admins
	r.HandleFunc("/projects/{project_id}/members", handleWithProjectPermission(membersCreateHandler, "createMember")).Methods(http.MethodPost)                                      // createMember (project right) -- create user role regularUser automatically in request for this user and assign project role from payload (either restrictedUser, projectUser, projectAdmin)
	r.HandleFunc("/projects/{project_id}/members/{member_id}", handleWithScopedPermission(membersUpdateHandler, "writeMember", "member_id", "user_id")).Methods(http.MethodPut)     // writeMember:{id/*} (project right) -- it should be possible to change the project role and to add/delete additional rights for this user if the user is a restrictedUser (currently only readDevice for a specific id should be addable or deletable), when user is switched away from restrictedUser, delete additional rights
	r.HandleFunc("/projects/{project_id}/members/{member_id}", handleWithScopedPermission(membersGetHandler, "readMember", "member_id", "user_id")).Methods(http.MethodGet)         // -- should not list platform admins
	r.HandleFunc("/projects/{project_id}/members/{member_id}", handleWithScopedPermission(membersDeleteHandler, "deleteMember", "member_id", "user_id")).Methods(http.MethodDelete) // should fail for platform admin
	r.HandleFunc("/projects/{project_id}/members/{member_id}/permissions", handleWithScopedPermission(permissionsGetAdditionalPermissionsForMemberHandler, "readMember", "member_id", "user_id")).Methods(http.MethodGet)
	r.HandleFunc("/projects/{project_id}/members/{member_id}/permissions", handleWithScopedPermission(permissionsCreateAdditionalPermissionsForMemberHandler, "writeMember", "member_id", "user_id")).Methods(http.MethodPost)
	r.HandleFunc("/projects/{project_id}/members/{member_id}/permissions", handleWithScopedPermission(permissionsDeleteAdditionalPermissionsForMemberHandler, "writeMember", "member_id", "user_id")).Methods(http.MethodDelete)
	r.HandleFunc("/projects/{project_id}/members/invite", membersInviteHandler).Methods(http.MethodPost)

	//	@Tag.name         	Users
	//	@Tag.description 	User management endpoints, mostly for the currently authenticated user.
	r.HandleFunc("/users", handleWithPermission(usersListHandler, "readUser")).Methods(http.MethodGet)
	r.HandleFunc("/users/{user}", handleWithPermission(usersGetHandler, "readUser")).Methods(http.MethodGet)
	// /me endpoints are authorized through token, and gets user id from token
	r.HandleFunc("/users/me", usersUpdateHandler).Methods(http.MethodPut)
	r.HandleFunc("/users/me", usersDeleteHandler).Methods(http.MethodDelete)
	r.HandleFunc("/users/me/password", usersUpdatePasswordHandler).Methods(http.MethodPut)
	r.HandleFunc("/users/me/otp", usersGetOTPDevices).Methods(http.MethodGet)
	r.HandleFunc("/users/me/otp", userSetOTPDevice).Methods(http.MethodPost)
	r.HandleFunc("/users/me/otp/{otp_id}", userDeleteOTPDevice).Methods(http.MethodDelete)
	r.HandleFunc("/users/me/otp/qr", getOTPQRHandler).Methods(http.MethodGet)
	r.HandleFunc("/users/me/permissions", permissionsGetPlatformPermissionsForUserHandler).Methods(http.MethodGet)

	// @Tag.name		Documents
	// @Tag.description Document management endpoints, to manage documents in projects.
	r.HandleFunc("/projects/{project_id}/documents", handleWithProjectPermission(documentsListHandler, "listDocument")).Methods(http.MethodGet)                                                          //TODO list + filter                                               // readDocument:{id/*} (project right)
	r.HandleFunc("/projects/{project_id}/documents", handleWithProjectPermission(documentsCreateHandler, "createDocument")).Methods(http.MethodPost)                                                     // createDocument:{id/*} (project right)
	r.HandleFunc("/projects/{project_id}/documents/multipart", handleWithProjectPermission(documentsCreateMultipartHandler, "createDocument")).Methods(http.MethodPost)                                  // createDocument:{id/*} (project right)
	r.HandleFunc("/projects/{project_id}/documents/{document_id}/multipart/part/{part_number}", handleWithProjectPermission(documentsGetSignedPartUrlHandler, "createDocument")).Methods(http.MethodPut) // createDocument:{id/*} (project right)
	r.HandleFunc("/projects/{project_id}/documents/{document_id}/multipart/complete", handleWithProjectPermission(documentsCompleteMultipartHandler, "createDocument")).Methods(http.MethodPut)          // createDocument:{id/*} (project right)
	r.HandleFunc("/projects/{project_id}/documents/{document_id}", handleWithScopedPermission(documentsDeleteHandler, "deleteDocument", "document_id", "document_id")).Methods(http.MethodDelete)        // deleteDocument:{id/*} (project right)

	//TODO: shouldn't documents and assets be the same?

	// @Tag.name 		Assets
	// @Tag.description	Asset management endpoints, to manage assets in projects (such as Pojrect Image & Report image).
	r.HandleFunc("/assets/{name}", assetGetHandler).Methods(http.MethodGet) // TODO: unsecured because <img src> wont easily work with jwt
	r.HandleFunc("/projects/{project_id}/assets", handleWithPermission(assetProjectCreateHandler, "createProjectAsset")).Methods(http.MethodPost)

	//	@Tag.name			Weather
	//	@Tag.description 	Weather endpoints, to get weather data for a specific location or a list of locations
	r.HandleFunc("/weather", handleWithPermission(weatherGetHandler, "readWeather")).Methods(http.MethodGet)
	r.HandleFunc("/weather/forecast", handleWithPermission(weatherGetForecastHandler, "readWeather")).Methods(http.MethodGet)
	r.HandleFunc("/places", handleWithPermission(weatherPlaceGetHandler, "readWeather")).Methods(http.MethodGet)

	// @Tag.name 	   	Alerts
	// @Tag.description Alert endpoints, to list or accept alerts for project. Also a summary endpoint for multiple projects.
	r.HandleFunc("/projects/{project_id}/alerts", handleWithProjectPermission(alertsListHandler, "listAlert")).Methods(http.MethodGet)
	r.HandleFunc("/projects/{project_id}/alerts", alertsCreateHandler).Methods(http.MethodPost) // TODO: add log output and check if endpoint is called on efficientio cluster, endpoint is not used
	r.HandleFunc("/alerts/summary", alertsSummaryHandler).Methods(http.MethodPost)              // Permission check is done in SQL query, since the checks don't work on multi project level
	r.HandleFunc("/projects/{project_id}/alerts", handleWithProjectPermission(alertAcceptAllHandler, "writeAlert")).Methods(http.MethodPut)
	r.HandleFunc("/projects/{project_id}/alerts/{alert_id}", handleWithProjectPermission(alertsAcceptHandler, "writeAlert")).Methods(http.MethodPut)

	// @Tag.name		Icons
	// @Tag.description Icon list endpoint.
	r.HandleFunc("/icons", handleWithPermission(iconsListHandler, "readIcon"))

	// @Tag.name		Rules
	// @Tag.description Rule management endpoints. Rules are evaluated by Core1''s Rule service.
	r.HandleFunc("/projects/{project_id}/rules", handleWithProjectPermission(rulesListHandler, "listRule")).Methods(http.MethodGet)
	r.HandleFunc("/projects/{project_id}/rules", handleWithProjectPermission(rulesCreateHandler, "createRule")).Methods(http.MethodPost)
	r.HandleFunc("/projects/{project_id}/rules/{rule_id}", handleWithOneOfAIRulePermissions(rulesUpdateHandler, []string{"writeRule", "writeAI"}, "rule_id")).Methods(http.MethodPut)
	r.HandleFunc("/projects/{project_id}/rules/{rule_id}", handleWithOneOfAIRulePermissions(rulesDeleteHandler, []string{"deleteRule", "deleteAI"}, "rule_id")).Methods(http.MethodDelete)

	// notifications
	r.HandleFunc("/notifications", notificationsCreateHandler).Methods(http.MethodPost) // createNotification (user right) - needed to authenticate rule engine

	// @Tag.name		Invoices
	// @Tag.description Invoice list endpoint, currently not in use.
	r.HandleFunc("/invoices", invoicesListHandler).Methods(http.MethodGet)
	r.HandleFunc("/invoices/{invoice_id}", invoicesGetHandler).Methods(http.MethodGet)

	// @Tag.name		Reports
	// @Tag.description Report endpoints, to list, create, update, get, and delete reports for a project.
	r.HandleFunc("/projects/{project_id}/reports", handleWithProjectPermission(reportsListHandler, "listReport")).Methods(http.MethodGet)
	r.HandleFunc("/projects/{project_id}/reports", handleWithProjectPermission(reportsCreateHandler, "createReport")).Methods(http.MethodPost)
	r.HandleFunc("/projects/{project_id}/reports/{report_id}", handleWithScopedPermission(reportsGetHandler, "readReport", "report_id", "report_id")).Methods(http.MethodGet)
	r.HandleFunc("/projects/{project_id}/reports/{report_id}", handleWithScopedPermission(reportsUpdateHandler, "writeReport", "report_id", "report_id")).Methods(http.MethodPut)
	r.HandleFunc("/projects/{project_id}/reports/{report_id}", handleWithScopedPermission(reportsDeleteHandler, "deleteReport", "report_id", "report_id")).Methods(http.MethodDelete)

	// @Tag.name 		Permissions
	// @Tag.description Permission endpoints, to list possible permissions (and groups), list possible scopes for a project.
	r.HandleFunc("/permissions", handleWithPermission(permissionsListHandler, "readPermission"))
	r.HandleFunc("/permissions/groups", handleWithPermission(permissionsListGroupsHandler, "readPermission"))
	// writeMember, exposes all possible scopes, but should be ok for user who can add permissions
	r.HandleFunc("/projects/{project_id}/permissions/{permission_id}/scopes", handleWithPermission(permissionListPossibleScopesHandler, "writeMember"))

	// mpc
	r.HandleFunc("/projects/{project_id}/controllers", handleWithProjectPermission(aiListHandler, "listAI")).Methods(http.MethodGet)
	r.HandleFunc("/projects/{project_id}/controllers", handleWithProjectPermission(aiCreateHandler, "createAI")).Methods(http.MethodPost)
	r.HandleFunc("/projects/{project_id}/controllers/{model_id}", handleWithScopedPermission(aiGetHandler, "readAI", "model_id", "model_id")).Methods(http.MethodGet)
	r.HandleFunc("/projects/{project_id}/controllers/{model_id}", handleWithScopedPermission(aiUpdateHandler, "writeAI", "model_id", "model_id")).Methods(http.MethodPut)
	r.HandleFunc("/projects/{project_id}/controllers/{model_id}", handleWithScopedPermission(aiDeleteHandler, "deleteAI", "model_id", "model_id")).Methods(http.MethodDelete)
	r.HandleFunc("/projects/{project_id}/controllers/{model_id}/favorites", handleWithScopedPermission(aiAddFavoritesHandler, "writeAI", "model_id", "model_id")).Methods(http.MethodPut)
	r.HandleFunc("/projects/{project_id}/controllers/{model_id}/favorites", handleWithScopedPermission(aiDeleteFavoritesHandler, "writeAI", "model_id", "model_id")).Methods(http.MethodDelete)
	r.HandleFunc("/projects/{project_id}/controllers/{model_id}/settings", handleWithScopedPermission(aiSettingsHandler, "writeAI", "model_id", "model_id")).Methods(http.MethodPut)
	r.HandleFunc("/projects/{project_id}/controllers/{model_id}/score", handleWithScopedPermission(aiGetScoreHandler, "readAI", "model_id", "model_id")).Methods(http.MethodGet)
	r.HandleFunc("/projects/{project_id}/controllers/{model_id}/report", handleWithScopedPermission(aiGetReportHandler, "readAI", "model_id", "model_id")).Methods(http.MethodGet)

	// TODO: refactor to use url params
	r.HandleFunc("/projects/{project_id}/autarchy/{start}/{end}", handleWithOneOfMeasurementInQueryPermission(aiAutarchyHandler, []string{"readDevice", "readAI"})).Methods(http.MethodGet)

	r.HandleFunc("/projects/{project_id}/weather", handleWithProjectPermission(aiGetWeatherHandler, "readAIWeather")).Methods(http.MethodGet)
	r.HandleFunc("/projects/{project_id}/weather", handleWithProjectPermission(aiCreateWeatherHandler, "createAIWeather")).Methods(http.MethodPost)
	r.HandleFunc("/projects/{project_id}/weather", handleWithProjectPermission(aiDeleteWeatherHandler, "deleteAIWeather")).Methods(http.MethodDelete)

	// metrics
	// TODO: readMetric? (user right) - needed to authenticate prometheus
	r.HandleFunc("/metrics", func(w http.ResponseWriter, r *http.Request) {
		var total int
		resp := "# HELP api_requests_total Total requests to the API\n"
		resp += "# TYPE api_requests_total counter\n"
		metricMutex.RLock()
		for k, v := range metricRequestsTotal {
			resp += "api_requests_total{realm=\"" + k + "\"} " + strconv.Itoa(v) + "\n"
			total += v
		}
		metricMutex.RUnlock()
		resp += "api_requests_total " + strconv.Itoa(total) + "\n"
		resp += utils.GetRedisPoolStatsFormatted(redisPool, "api")
		resp += utils.GetPostgresStatsFormatted(postgresDatabase, "api")

		_, err := w.Write([]byte(resp))
		if err != nil {
			l := utils.GetLogger()
			l.Error().Err(err).Msg("")
			return
		}
	})

	// auth
	r.HandleFunc("/auth/{realm}/token", tokenRequestHandler).Methods(http.MethodPost)
	r.HandleFunc("/auth/{realm}/signup", signupRequestHandler).Methods(http.MethodPost)
	r.HandleFunc("/auth/{realm}/invite", inviteRequestHandler).Methods(http.MethodGet)
	r.HandleFunc("/auth/{realm}/signup", registrationEnabledHandler).Methods(http.MethodGet)
	r.HandleFunc("/auth/{realm}/logout", logoutRequestHandler).Methods(http.MethodPost)
	r.HandleFunc("/auth/{realm}/resetPassword", resetPasswordRequestHandler).Methods(http.MethodPost)

	// gps
	r.HandleFunc("/gps/{token}", handleGpsData).Methods(http.MethodPost)

	// @Tag.name		Data Mappings
	// @Tag.description Data Mapping endpoints. Data Mappings map measurment to predefined type, to allow for automatic reporting
	r.HandleFunc("/data-mapping/types/list", handleWithPermission(dataMappingListTypesHandler, "listDataMappingTypes")).Methods(http.MethodGet)
	r.HandleFunc("/data-mapping/types/{type_id}/properties", handleWithPermission(dataMappingPropertyListHandler, "listDataMappingTypes")).Methods(http.MethodGet)
	r.HandleFunc("/projects/{project_id}/data-mapping/list", handleWithProjectPermission(dataMappingListHandler, "listDataMapping")).Methods(http.MethodGet)
	r.HandleFunc("/projects/{project_id}/data-mapping", handleWithProjectPermission(dataMappingPropertyCreateHandler, "createDataMapping")).Methods(http.MethodPost)
	r.HandleFunc("/projects/{project_id}/data-mapping/{device_id}", handleWithScopedPermission(dataMappingDeleteHandler, "deleteDataMapping", "device_id", "data_mapping_id")).Methods(http.MethodDelete)
	r.HandleFunc("/projects/{project_id}/data-mapping/{device_id}", handleWithScopedPermission(dataMappingUpdateHandler, "deleteDataMapping", "device_id", "data_mapping_id")).Methods(http.MethodPut)
	r.HandleFunc("/projects/{project_id}/data-mapping/charging-stations/report", handleWithProjectPermission(dataMappingChargingStationReportHandler, "listDataMapping")).Methods(http.MethodGet)

	// @Tag.name 		Modules
	// @Tag.description Module endpoints, CRUD operations on modules for a project. Modules combine DataMappings to interactive Devices in Console.
	r.HandleFunc("/modules/types/list", handleWithPermission(modulesListTypesHandler, "listModuleTypes")).Methods(http.MethodGet)
	r.HandleFunc("/modules/types/{type_id}/properties", handleWithPermission(modulesListTypeDevicesHandler, "listModuleTypes")).Methods(http.MethodGet)
	r.HandleFunc("/projects/{project_id}/modules/list", handleWithProjectPermission(modulesListHandler, "listModules")).Methods(http.MethodGet)
	r.HandleFunc("/projects/{project_id}/modules", handleWithProjectPermission(modulesCreateHandler, "createModule")).Methods(http.MethodPost)
	r.HandleFunc("/projects/{project_id}/modules/{module_id}", handleWithScopedPermission(modulesDeleteHandler, "deleteModule", "module_id", "module_id")).Methods(http.MethodDelete)
	r.HandleFunc("/projects/{project_id}/modules/{module_id}", handleWithScopedPermission(modulesUpdateHandler, "updateModule", "module_id", "module_id")).Methods(http.MethodPut)
	r.HandleFunc("/projects/{project_id}/modules/{module_id}/collection", handleWithScopedPermission(modulesUpdateCollectionHandler, "updateModule", "module_id", "module_id")).Methods(http.MethodPut)
	r.HandleFunc("/projects/{project_id}/modules/{module_id}/collection", handleWithScopedPermission(modulesDeleteCollectionHandler, "updateModule", "module_id", "module_id")).Methods(http.MethodDelete)

	// just readProject is sufficient, user still needs access to data mappings
	// @Tag.name		Benchmarking
	// @Tag.description Benchmarking endpoints to create a report fo a project or multiple
	r.HandleFunc("/projects/{project_id}/modules/report", handleWithProjectPermission(benchmarkingProjectReportHandler, "readProject")).Methods(http.MethodGet)
	r.HandleFunc("/benchmarking/report", benchmarkingMultipleReportsHandler).Methods(http.MethodPost) // checks the permission readProject for every project in the request body

	return r
}

// middleware to added user to request header (in order for request handlers to access user information), set logging config and check token
func requestHousekeeping(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		l := utils.GetLogger()
		info := l.Info().
			Str("ip", r.Header.Get("X-Forwarded-For")).
			Str("method", r.Method).
			Str("url", r.URL.String())
		// configure routes that do not need authentication
		withoutAuthrization := false
		var pathPrefixesWithoutAuth = []string{"/swagger", "/auth", "/metrics", "/gps", "/assets/", "/notifications"}
		for _, pathPrefix := range pathPrefixesWithoutAuth {
			if strings.HasPrefix(r.URL.Path, pathPrefix) || strings.Contains(r.URL.Path, "machine-readable") {
				withoutAuthrization = true
			}
		}

		if withoutAuthrization {
			info.Msg("")
			next.ServeHTTP(w, r)
			return

		}

		if strings.HasSuffix(r.URL.Path, "subscribe") && r.Header.Get("authorization") == "" {
			queryToken := r.URL.Query().Get("token")

			if queryToken != "" {
				r.Header.Set("authorization", queryToken)
			} else {
				reject(w, r, http.StatusUnauthorized, "missing authorization")
				return
			}
		}

		token := getToken(r)
		usr, realm, err := authRepo.GetUserAndRealm(token)

		if err != nil {
			reject(w, r, http.StatusUnauthorized, err.Error())
			return
		}

		// forward headers internally
		r.Header.Set("x-user", usr)
		r.Header.Set("x-realm", realm)

		// api request metrics
		if realm != "" {
			metricMutex.Lock()
			metricRequestsTotal[realm]++
			metricMutex.Unlock()
		}

		info.Str("user", usr).Str("realm", realm).Msg("")

		next.ServeHTTP(w, r)
	})

}

// Get access token from http.Request
func getToken(r *http.Request) string {
	// Allow bearer and no bearer as authorization token
	token := r.Header.Get("authorization")
	prefix := "bearer"
	tokenParts := strings.Split(token, " ")
	if len(tokenParts) == 2 && strings.ToLower(tokenParts[0]) == prefix {
		token = tokenParts[1]
	}
	return token
}

// if auth_error is nil and allowed is true, call op and return, otherwise reject and return
func handleRequestOperation(allowed bool, auth_error error, error_message string, w http.ResponseWriter, r *http.Request, op func(http.ResponseWriter, *http.Request)) {
	if auth_error != nil {
		reject(w, r, http.StatusInternalServerError, auth_error.Error())
		return
	}

	if !allowed {
		reject(w, r, http.StatusUnauthorized, error_message)
		return
	}

	op(w, r)
}

func respond(w http.ResponseWriter, code int, v any) {
	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(code)
	if err := json.NewEncoder(w).Encode(&v); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func reject(w http.ResponseWriter, r *http.Request, code int, message string) {
	l := utils.GetLogger().
		With().
		CallerWithSkipFrameCount(3).
		Logger()

	realm := r.Header.Get("x-realm")
	userId := r.Header.Get("x-user")
	ip := r.Header.Get("X-Forwarded-For")

	// error logging message
	l.Error().
		Int("code", code).
		Str("ip", ip).
		Str("method", r.Method).
		Str("url", r.URL.String()).
		Str("user", userId).
		Str("realm", realm).Msg(message)

	// don't expose error message
	if code == http.StatusInternalServerError {
		message = msgInternalServerError
	}

	respond(w, code, map[string]any{
		"code":    code,
		"message": message,
	})
}
