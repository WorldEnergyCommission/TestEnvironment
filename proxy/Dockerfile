FROM golang:1.21.3-alpine3.18
# add git for git version logging
RUN apk add git
WORKDIR /build
# copy complete repo (Note: the context is in root of the repo)
COPY ./ ./
# change working directory to /proxy
WORKDIR /build/proxy
# build app
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o proxy .

FROM scratch
COPY --from=0 /build/proxy/proxy /proxy
EXPOSE 8000
EXPOSE 1883
EXPOSE 9001
CMD ["/proxy"]
