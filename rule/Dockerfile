FROM golang:1.21.3-alpine3.18
# add git for git version logging
RUN apk add git
WORKDIR /build
# copy complete repo (Note: the context is in root of the repo)
COPY ./ ./
# change working directory to /rule
WORKDIR /build/rule
# build app
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o rules .

FROM scratch
COPY --from=0 /build/rule/rules /rules
COPY --from=0 /usr/local/go/lib/time/zoneinfo.zip /usr/local/go/lib/time/
EXPOSE 8000
CMD ["/rules"]
