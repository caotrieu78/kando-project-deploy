# ========== Stage 1: Build ==========
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Build-time environment variables
ARG VITE_BACKEND_URL
ARG VITE_ACL_ENABLE
ARG VITE_USER_CREATE_DEFAULT_PASSWORD

ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_ACL_ENABLE=$VITE_ACL_ENABLE
ENV VITE_USER_CREATE_DEFAULT_PASSWORD=$VITE_USER_CREATE_DEFAULT_PASSWORD

RUN npm run build

# ========== Stage 2: Serve ==========
FROM nginx:1.25
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist ./
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
