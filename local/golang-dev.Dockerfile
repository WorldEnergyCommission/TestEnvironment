# This dockerfile is universal for all golang dev microservices
FROM golang:1.21.3-alpine3.18
WORKDIR /app

ENV GO111MODULE="on"
ENV GOOS="linux"
ENV CGO_ENABLED=0

# System dependencies
RUN wget http://comodo.tbs-certificats.com/SectigoRSAOrganizationValidationSecureServerCA.crt -O /usr/local/share/ca-certificates/SectigoRSA.crt
RUN chmod 600 /usr/local/share/ca-certificates/SectigoRSA.crt
RUN apk update && apk add --no-cache ca-certificates && update-ca-certificates

# Hot reloading mod
RUN go install github.com/go-delve/delve/cmd/dlv@v1.22.1
RUN go install github.com/cosmtrek/air@v1.49.0

# Api package is used by multiple services
COPY api /api

ARG SOURCE_PROJECT_PATH
COPY ${SOURCE_PROJECT_PATH}/go.mod ${SOURCE_PROJECT_PATH}/go.sum ./
RUN go mod download -x

# project files are mapped by volume in docker-compose.yml

EXPOSE 8000 4000

ENTRYPOINT ["air", "-c", "/local/.air.toml"]
