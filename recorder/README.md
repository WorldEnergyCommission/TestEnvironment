# Recorder

This service saves every valid mqtt message from project topics (`project/+/+`) as measurements to the database and
redis.

### Environment variables

| NAME                   | Description                            |
| ---------------------- | -------------------------------------- |
| MQTT_ADDR              | Mosquitto broker address               |
| REDIS_ADDR             | Redis address                          |
| DB_ADDR                | Postgres address                       |
| DB_NAME                | Postgres database name                 |
| DB_USER                | Postgres user                          |
| DB_PASS                | Postgres password                      |
| PROJECT_VARIABLE_LIMIT | Global limit for variables per project |

### Ports

| NAME | Description           |
| ---- | --------------------- |
| 8000 | HTTP metrics endpoint |

## Development

`go get && go run .`

## Building

`docker build -t <tag> .`
