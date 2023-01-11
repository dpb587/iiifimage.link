FROM node:18-bullseye-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN gzip -9kv dist/index.html

FROM caddy:2.6-alpine
COPY --from=build /app/dist /mnt/docroot
RUN ( \
    echo ':{$PORT}' ; \
    echo 'root * /mnt/docroot' ; \
    echo 'file_server {' ; \
    echo '  precompressed gzip' ; \
    echo '}' ; \
  ) > /etc/caddy/Caddyfile
ENV PORT 8080
EXPOSE 8080
