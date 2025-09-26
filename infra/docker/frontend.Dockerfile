# syntax=docker/dockerfile:1.7-labs
FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/package.json frontend/tsconfig.json frontend/vite.config.ts frontend/postcss.config.cjs /app/
COPY frontend/src /app/src
COPY frontend/index.html /app/index.html
RUN corepack enable && corepack prepare pnpm@9.11.0 --activate
RUN pnpm install --frozen-lockfile || pnpm install
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm build

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY infra/docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK CMD wget -qO- http://localhost/ | grep -q "Crowd Ideas" || exit 1

