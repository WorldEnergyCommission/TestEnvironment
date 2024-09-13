
FROM node:18.18.2-alpine3.18
EXPOSE 8080
WORKDIR /app
COPY console/package*.json .
RUN npm i
COPY console .
CMD ["npm", "run", "dev"]


