FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install --unsafe-perm

COPY . .

RUN chmod -R 755 node_modules/.bin

RUN npm run build


FROM nginx:1.25-alpine

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=0 /app/dist .

# SPA fix reload
RUN printf 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { try_files $uri $uri/ /index.html; } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]