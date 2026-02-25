# =========================
# Stage 1: Build
# =========================
FROM node:20 AS build

WORKDIR /app

COPY package*.json ./

# Cài dependency chuẩn hơn
RUN npm install --unsafe-perm

COPY . .

# Cấp quyền execute cho bin
RUN chmod -R 755 node_modules/.bin

# Build
RUN npm run build


# =========================
# Stage 2: Serve
# =========================
FROM nginx:1.25-alpine

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=build /app/dist .

# SPA fix
RUN printf 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { try_files $uri $uri/ /index.html; } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]