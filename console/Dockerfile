FROM node:18.18.2-alpine3.18
RUN apk update && apk add --no-cache zip
WORKDIR /app
COPY console/package*.json console/yarn.lock ./
RUN npm ci
COPY console .
RUN npm run build
RUN cd dist && zip -r ../dist.zip . -9

FROM golang:1.21.3-alpine3.18
RUN apk add ca-certificates && update-ca-certificates
# add git for git version logging
RUN apk add git
WORKDIR /build
# copy complete repo (Note: the context is in root of the repo)
COPY ./ ./
# change working directory to /console
WORKDIR /build/console
# build app
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o console .

FROM scratch
COPY --from=0 /app/dist /dist
COPY --from=0 /app/dist.zip /dist.zip
COPY --from=0 /app/version.json /version.json
COPY --from=0 /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=1 /build/console/console /console
EXPOSE 80 443
CMD ["/console"]
