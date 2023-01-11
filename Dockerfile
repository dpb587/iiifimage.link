FROM node:18-bullseye-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM caddy:2.6-alpine
COPY --from=build /app/dist /mnt/docroot
RUN ( echo ':{$PORT}' ; echo 'encode gzip' ; echo 'root * /mnt/docroot' ; echo 'file_server' ) > /etc/caddy/Caddyfile
ENV PORT 8080
EXPOSE 8080
