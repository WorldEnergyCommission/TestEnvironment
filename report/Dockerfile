FROM golang:1.21.3-alpine3.18
RUN apk add --no-cache tzdata
# add git for git version logging
RUN apk add git
WORKDIR /build
# copy complete repo (Note: the context is in root of the repo)
COPY ./ ./
# change working directory to /report
WORKDIR /build/report
# build app
RUN CGO_ENABLED=0 GOARCH=amd64 GOOS=linux go build -ldflags="-w -s" -o report .

FROM zenika/alpine-chrome:117
COPY --from=0 /build/report/report /usr/src/app/report
COPY --from=0 /usr/share/zoneinfo /usr/share/zoneinfo
COPY --from=0 /build/report/template /usr/src/app/template
EXPOSE 8000
ENTRYPOINT ["/usr/src/app/report"]
