# Rule

Rule service is a simple event-based (when a new measurement comes) rule system. There exist two types of rules:

1. `Normal rule`: When a measurement for a variable comes in which is in a rule, it evaluates the rule instantly, and if
   it evaluates to true, it will send actions.
1. `Timeout rule`: The same logic as `Normal rule` with the difference, that a timeout will be set. With a timeout
   of `60` (seconds) the rule will be evaluated again, if on the first evaluation it returned true. If it again
   evaluates to true, the rule will trigger. This can be useful if you want to check if a variable(s) stays the same for
   an extended amount of time

## Environment

### Environment variables

| NAME              | Description                |
| ----------------- | -------------------------- |
| MQTT_ADDR         | Mosquitto broker address   |
| REDIS_ADDR        | Redis address              |
| DB_ADDR           | Postgres address           |
| DB_NAME           | Postgres database name     |
| DB_USER           | Postgres user              |
| DB_PASS           | Postgres password          |
| NOTIFICATION_ADDR | Notification (api) address |

### Ports

| NAME | Description   |
| ---- | ------------- |
| 8000 | HTTP endpoint |

## Development

`go get && go run .`

## Building

`docker build -t <tag> .`
