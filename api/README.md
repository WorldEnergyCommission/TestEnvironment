# API

API is the main interface to lynus. It mostly works as a CRUD application for all resources `pkg/resource/<resource>`

## Structure

- `api/openapi.json` OpenAPI specification
- `api/rules.json` [Rules](#Rules)
- `web/` OpenAPI/Swagger website with KeycloakJS authentication
- `pkg/auth` Authorization/Authentication in combination with [Rules](#Rules)
- `pkg/resource/<resource>` All Lynus resources
- `project root` all http endpoints

### Repository structure

Each resource has a `Repository` struct where all dependencies are passed to. So a func can only be accessed through
the `Repository`. For passing parameters into those functions, there is always a struct named e.g. `CreateUserOptions`
where all arguments can be defined

## Environment

### Environment variables

| NAME               | Description                                    |
| ------------------ | ---------------------------------------------- |
| DB_ADDR            | Postgres address                               |
| DB_NAME            | Postgres database name                         |
| DB_USER            | Postgres user                                  |
| DB_PASS            | Postgres password                              |
| REPORT_ADDR        | Report service address                         |
| REDIS_ADDR         | Redis address                                  |
| KEYCLOAK_ADDR      | Keycloak address                               |
| KEYCLOAK_USERNAME  | Keycloak admin username                        |
| KEYCLOAK_PASSWORD  | Keycloak admin password                        |
| SENDGRID_EMAIL     | Sendgrid email notifications will be sent with |
| SENDGRID_KEY       | Sendgrid api key                               |
| MINIO_ADDR         | Minio S3 endpoint                              |
| MINIO_SSL          | Whether HTTPS is enabled. To enable use `true` |
| MINIO_ACCESS_KEY   | Minio access key                               |
| MINIO_SECRET_KEY   | Minio secret key                               |
| OPENWEATHERMAP_KEY | OpenWeatherMap api key                         |

### Ports

| NAME | Description   |
| ---- | ------------- |
| 8000 | HTTP endpoint |

## Rules

Rules is a simple custom rule engine for authorizing api requests for users. The `api/rules.json` is pretty straight
forward.

```javascript
const just_for_syntax_highlighting = {
  paths: {
    "/endpoint-to-something": {
      unsecured: true | false, // when true, request will always succeed,
      regexp: true | false, // if regexp should be matched in the url, e.g: /assets/(?P<asset>.{36}) for uuid, where "asset" is a named group that can be used as an authorizer argument
      methods: {
        "get|post|put|delete": [
          // each method can have a list of authorizers
          "my_authorizer",
        ],
      },
    },
  },
  authorizer: {
    my_authorizer: "SELECT true FROM XXX WHERE XXX = {{named regexp group}}", // an sql query needs to return true/false.
  },
};
```

## Development

`go get && go run .`

## Building

`docker build -t <tag> .`

## Setting up certificate

On some Unix based systems golang runtime seem not to
perform [TLS certification path validation algorithm](https://en.wikipedia.org/wiki/Certification_path_validation_algorithm)
. Because the \*.efficientio.com domains are signed by intermediate CA (Sectigo RSA), some requests from the local go
runtime to the rest of the cluster fail with x509 verification error, because the JWT verification needs to download
realm certificates from the keycloak server to be able to verify their signature.

To resolve this issue, you need to manually download the Sectigo RSA and install it to your system:

```
wget http://comodo.tbs-certificats.com/SectigoRSAOrganizationValidationSecureServerCA.crt -O /usr/local/share/ca-certificates/SectigoRSA.crt
sudo chmod 600 /usr/local/share/ca-certificates/SectigoRSA.crt
sudo update-ca-certificates
```

## Generate Swagger

Swagger is genateated using swaggo. Simply use `swag i -o ./pkg/docs` to generate new docs.

#### Template for Copilot

Prompt template to generate docs for swagger

```
/doc I nedd docs for my OpenAPI generation. Dont include informatino such as x-user or x-realm, it gets added internally. Failures should be documented exactly as in the example. Not all Endpoints need Security definition, if they do they have a specific scope. Here is a example of the doc format i want you to use:

// measurementsCreateHandler creates all measurements for the respective project that were passed in the body
//
//	@Summary      Create measurements
//	@Description  Create measurements for a project
//	@Tags         Measurements
//	@Accept       json
// 	@Param 		    data body []measurement.CreateOptions true "The measurments in SenML format to create"
//	@Security 	  OAuth2Application[writeProject]
// 	@Produce      json
// 	@Param        ignore_duplicates query bool false "Ignore duplicates option"
// 	@Success      200  {object} 	map[string][]string "Updated projects"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
// 	@Router       /projects/{project_id}/measurements [post]
```
