# ========== Stage 1: Build ==========
FROM gradle:8.5-jdk21 AS builder
WORKDIR /app
COPY . .
RUN gradle clean bootJar --no-daemon

# ========== Stage 2: Run ==========
FROM eclipse-temurin:21-jdk
ENV TZ=Asia/Ho_Chi_Minh
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
RUN mkdir -p /app/uploads && chmod -R 777 /app/uploads
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
