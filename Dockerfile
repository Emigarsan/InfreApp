# ---- FE BUILD ----
FROM node:18 AS fe
WORKDIR /app/frontend
COPY frontend/ ./
RUN npm ci || npm install
RUN npm run build

# ---- BE BUILD (usa Maven oficial, NO wrapper) ----
FROM maven:3.9-eclipse-temurin-17 AS be-build
WORKDIR /app/backend
COPY backend/ ./
# Copiamos el frontend build a los estáticos del backend
RUN mkdir -p src/main/resources/static
COPY --from=fe /app/frontend/dist/ src/main/resources/static/
# 👇 IMPORTANTE: incluir spring-boot:repackage
RUN mvn -B -DskipTests clean package spring-boot:repackage

# ---- RUNTIME ----
FROM eclipse-temurin:17-jre
WORKDIR /app
ENV PORT=8080
COPY --from=be-build /app/backend/target/thanos-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
CMD ["sh","-c","java -Dserver.port=${PORT} -jar app.jar"]
