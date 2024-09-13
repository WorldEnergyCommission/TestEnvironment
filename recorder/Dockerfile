FROM golang:1.21.3-alpine3.18
# add git for git version logging
RUN apk add git
WORKDIR /build
# copy complete repo (Note: the context is in root of the repo)
COPY ./ ./
# change working directory to /recorder
WORKDIR /build/recorder
# build app
RUN CGO_ENABLED=0 GOARCH=amd64 GOOS=linux go build -ldflags="-w -s" -o recorder .

FROM scratch
COPY --from=0 /build/recorder/recorder /recorder
CMD ["/recorder"]
