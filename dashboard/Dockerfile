FROM node:18.18.2-alpine3.18
COPY dashboard /dashboard
WORKDIR /dashboard
RUN npm install
RUN npm run build --prod

FROM nginx:1.25.2-alpine
COPY --from=0 /dashboard/dist/dashboard /usr/share/nginx/html
