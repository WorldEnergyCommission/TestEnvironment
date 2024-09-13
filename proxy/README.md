# Proxy

The proxy service acts as a middleware between the user (who goes through nginx first for SSL termination) and mosquitto
broker. It is responsible for authentication, authorization and rate-limiting.

![Flow](./flow.svg "Flow")

## Structure

- `pkg` mqtt proxy code, used from https://github.com/mainflux/mproxy (without SSL termination stuff)
- `main.go` main logic

## Environment

### Environment variables

| NAME               | Description                                                   |
| ------------------ | ------------------------------------------------------------- |
| SERVICE_WEBSOCKETS | Mosquitto websocket address                                   |
| SERVICE_MQTT       | Mosquitto mqtt address                                        |
| SERVICE_REDIS      | Redis address                                                 |
| MAX_MESSAGES       | maximum amount of mqtt messages a project can send per minute |

### Ports

| NAME | Description               |
| ---- | ------------------------- |
| 8000 | HTTP metrics endpoint     |
| 1883 | mqtt/tcp proxy            |
| 9001 | mqtt/http websocket proxy |

## Development

`go get && go run .`

## Building

`docker build -t <tag> .`
