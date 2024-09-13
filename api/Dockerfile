FROM golang:1.21.3-alpine3.18
RUN apk add ca-certificates && update-ca-certificates
RUN apk add git
WORKDIR /build
COPY . .
WORKDIR /build/api
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o lynus .

FROM alpine:3.18.4
COPY --from=0 /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=0 /build/api/api/ /api/
COPY --from=0 /build/api/web /web
COPY --from=0 /build/api/lynus /lynus
EXPOSE 8000
CMD ["/lynus"]
