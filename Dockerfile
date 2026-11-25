# syntax=docker/dockerfile:1
#
# Frontend de Buenaventura Reporta (React + Vite) servido con Nginx.
# Nginx también es la puerta de entrada del sistema: reenvía /api, /storage
# y el WebSocket (/app) al contenedor backend.
#
#   docker build -t buenaventura/frontend --build-arg VITE_REVERB_APP_KEY=<clave> .

# ---------------------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# Vite incrusta estas variables al compilar. La API va por el mismo origen (/api),
# así la misma imagen sirve en local y en el servidor.
ARG VITE_API_URL=/api
ARG VITE_REVERB_APP_KEY=
ENV VITE_API_URL=$VITE_API_URL \
    VITE_REVERB_APP_KEY=$VITE_REVERB_APP_KEY

# tsc -b (verificación de tipos) + vite build
RUN npm run build

# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS prod

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1/healthz >/dev/null || exit 1
