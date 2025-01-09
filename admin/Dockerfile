# for the build, admin-console gets minified very heavily
# purgecss:
#   remove all unused css classes
# minify:
#   minify all html files (remove obsolete quotes, <head> tag, etc.)
# go:
#   build a static, stripped binary to be used in a scratch image
FROM node:20.18.1-alpine3.21
WORKDIR /build
COPY admin .
RUN yarn global add purgecss minify
RUN purgecss --css static/*.css --content template/*.html --output static/
RUN minify static/bootstrap.css > static/bootstrap2.css && mv static/bootstrap2.css static/bootstrap.css
RUN for f in /build/template/*; \
    do \
    minify $f > /build/template/$(basename $f).old && mv template/$(basename $f).old template/$(basename $f); \
    done

FROM golang:1.21.3-alpine3.18
# add git for git version logging
RUN apk add git
WORKDIR /build
# copy complete repo (Note: the context is in root of the repo)
COPY ./ ./
# change working directory to /admin
WORKDIR /build/admin
# build app
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o app .

FROM scratch
# copy build artifacts
COPY --from=1 /build/admin/app /app
COPY --from=0 /build/static /static
COPY --from=0 /build/template /template
EXPOSE 8000
CMD ["/app"]
