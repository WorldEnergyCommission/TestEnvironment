# admin-console

Admin-console is an internally used to manage users and projects on a high level.

## Structure

- `/template` Go template files for rendering webpages
- `/static` Static css assets
- `main.go,repo.go` backend code for managing users and projects, etc.

## Environment

### Environment variables

| NAME              | Description              |
| ----------------- | ------------------------ |
| KEYCLOAK_USERNAME | Keycloak admin username  |
| KEYCLOAK_PASSWORD | Keycloak admin password  |
| KEYCLOAK_ADDR     | Keycloak address         |
| DB_ADDR           | Postgres address         |
| DB_NAME           | Postgres database name   |
| DB_USER           | Postgres user            |
| DB_PASS           | Postgres password        |
| ADMIN_USERNAME    | basicAuth admin username |
| ADMIN_PASSWORD    | basicAuth admin password |

### Ports

| NAME | Description   |
| ---- | ------------- |
| 8000 | HTTP endpoint |

## Development

`go get && go run .`

## Building

`docker build -t <tag> .`
