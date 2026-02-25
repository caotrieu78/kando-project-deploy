# ========== Stage 1: Build ==========
FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# đảm bảo quyền thực thi
RUN chmod -R 755 node_modules/.bin

RUN npm run build


# ========== Stage 2: Serve ==========
FROM nginx:1.25

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=build /app/dist .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]