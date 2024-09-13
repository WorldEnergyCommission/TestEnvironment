FROM golang:1.21.3-alpine3.18
# update certificates of root certificate authorities
RUN apk add -U --no-cache ca-certificates
# add git for git version logging
RUN apk add git
WORKDIR /build
# copy complete repo (Note: the context is in root of the repo)
COPY ./ ./
# change working directory to /smartmeter
WORKDIR /build/smartmeter
# build app
RUN CGO_ENABLED=0 GOARCH=amd64 GOOS=linux go build -ldflags="-w -s" -o smartmeter .

FROM scratch
COPY --from=0 /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=0 /usr/local/go/lib/time/zoneinfo.zip /usr/local/go/lib/time/
COPY --from=0 /build/smartmeter/smartmeter /smartmeter
EXPOSE 8000
CMD ["/smartmeter"]
