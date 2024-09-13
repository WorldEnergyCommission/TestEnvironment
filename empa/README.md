# empa

Service for internal use only, that is currently utilized by mpc/ML, because dealing with MQTT, Databases, etc. is
easier in Go than Python. The main use for this service is getting time series data and writing measurements (via mqtt)
to Lynus

## Environment

### Environment variables

| NAME       | Description                           |
| ---------- | ------------------------------------- |
| MQTT_ADDR  | Mosquitto broker address              |
| REDIS_ADDR | Redis address                         |
| DB_ADDR    | Postgres address                      |
| DB_NAME    | Postgres database name                |
| DB_USER    | Postgres user                         |
| DB_PASS    | Postgres password                     |
| PASSWORD   | Simple password in url query for auth |

### Ports

| NAME | Description   |
| ---- | ------------- |
| 8000 | HTTP endpoint |

## Development

`go get && go run .`

## Building

`docker build -t <tag> .`

## Other

The name `empa` is just here for historical reasons, it can be renamed to whatever
