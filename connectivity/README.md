# connectivity

Service used to check on projects, whether they are online or offline. If no **heartbeat** has been sent for the last 30
seconds. This only cares about the heartbeat, not other messages.<br><br>
Steps:

1. Get all projects with connectivity enabled from the database
1. Periodically check the `heartbeat` variables in redis for each project
1. If the last `heartbeat` > 30 seconds and `last_connectivity_trigger` is smaller than the last `heartbeat`, trigger
   notification and set `last_connectivity_trigger` to the current time
1. Repeat every 10 seconds

## Environment

### Environment variables

| NAME              | Description                |
| ----------------- | -------------------------- |
| REDIS_ADDR        | Redis address              |
| DB_ADDR           | Postgres address           |
| DB_NAME           | Postgres database name     |
| DB_USER           | Postgres user              |
| DB_PASS           | Postgres password          |
| NOTIFICATION_ADDR | Notification (api) address |

## Structure

`main.go` project logic

## Development

`go get && go run .`

## Building

`docker build -t <tag> .`
