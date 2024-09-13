# Eventwatcher

This service imports measurements

## Development

`go get && go run .`

## Building

`docker build -t <tag> .`

## Easee Integration Important

Amqp observation values arrive only ON Change
Periodic HTTP Requests to get observation values on Eventwatcher startup and device creation
AccessToken is refreshed periodically depending on expiration duration.
Verification using charger-id PIN was not possible as integrator accounts can not retreive charger PIN.

For multi platform usage we target multiple credentials/queues because:

- accessToken invalidiation: when refreshing the token on one platform the previous accessToken retrieved on another platform is invalidated. This is currently not the case with easee but might be subject to change
- Message consumption: Manually handling ack and nack/reject is error prone, consuming messages belonging to another platform consumer. Requeuing, retention, ... -> error prone
