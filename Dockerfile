# ---- FE BUILD ----
FROM node:18 AS fe
WORKDIR /app/frontend
COPY frontend/ ./
RUN npm ci || npm install
RUN npm run build

# ---- BE BUILD ----
FROM eclipse-temurin:17-jdk AS be-build
WORKDIR /app
COPY backend/ ./backend/
# Mete el build del frontend dentro de los estáticos del backend
RUN mkdir -p ./backend/src/main/resources/static
COPY --from=fe /app/frontend/dist/ ./backend/src/main/resources/static/
WORKDIR /app/backend
RUN chmod +x mvnw || true
RUN ./mvnw -DskipTests package

# ---- RUNTIME ----
FROM eclipse-temurin:17-jre
WORKDIR /app
ENV PORT=8080
COPY --from=be-build /app/backend/target/thanos-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
CMD ["sh","-c","java -Dserver.port=${PORT} -jar app.jar"]
