FROM golang:1.21.3-alpine3.18 as builder
RUN apk add ca-certificates && update-ca-certificates
# add git for git version logging
RUN apk add git
WORKDIR /build
# copy complete repo (Note: the context is in root of the repo)
COPY ./ ./
# change working directory to /empa
WORKDIR /build/empa
# build app
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o empa .

FROM scratch
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /build/empa/empa /empa
EXPOSE 8000
CMD ["/empa"]