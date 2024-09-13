# Report

Report service is used to generate user-specified reports. There are two different reports:

1. Normal (counters, that only go up). A simple difference calculation, e.g: `value_now - value_old` where a price per
   unit can also be set which multiplies it by the difference, just for a simple price calculation.
1. [ZEV](https://www.swissolar.ch/index.php?id=403), which is only valid for a ZEV setup, otherwise the calculation
   doesn't make sense

Both reports can be returned as XML, PDF, CSV for the user and be sent by email/webhook when specified. When the report
is enabled, it will be generated automatically every month and be sent via the specified actions (see `deployment.yaml`
CronJob).

## Structure

`main.go` project logic
`template/` pdf/html template files
`pkg/pdf` code/logic for generating a pdf with headless chromium
`pkg/report` code/logic for generating normal and zev reports

## Environment

### Environment variables

| NAME          | Description                                    |
| ------------- | ---------------------------------------------- |
| DB_ADDR       | Postgres address                               |
| DB_NAME       | Postgres database name                         |
| DB_USER       | Postgres user                                  |
| DB_PASS       | Postgres password                              |
| API_ADDR      | Notification (api) address                     |
| STATIC_ASSETS | Full path to static assets ending with slash / |

### Ports

| NAME | Description   |
| ---- | ------------- |
| 8000 | HTTP endpoint |

## Development

`go get && go run .`

## Building

`docker build -t <tag> .`
