# Local dev environment

Dev env using local dev containers.

- with this setup you can start local dev env with single command
- requires just 2 config files: the .env file and kubectl config
- auto starts forwarder to production services
- hot reloading of api and console mapped to local files by volumes
- removes the hassle of changing conflicting ports and wiring services
- solves cert issues and auth misconfiguration
- unifies env variables to single file
- includes golang debugger and opens port for it
- other go services can be added using universal dockerfile for golang

## Installation

- docker + docker compose (aliased as dc)

## Configuration

- `cp .env.example .env`
- set env variables

## Usage

### Start

- `dc up -d`

### Logs

- `dc logs -f`

### Recreate containers without hot reload

- `dc up -d --build --force-recreate report`

## Next steps

- local state: database + migrations + seeder
- brokers: mqtt + redis
- remove prod service forwarder
