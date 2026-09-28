# ---------------------------------------------------
# ETAPA 1: Compilación (Build)
# ---------------------------------------------------
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copiamos primero el pom.xml para aprovechar la caché de capas de Docker
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiamos el código fuente y compilamos el JAR saltando los tests
COPY src ./src
RUN mvn clean package -DskipTests

# ---------------------------------------------------
# ETAPA 2: Ejecución ligera (Runtime)
# ---------------------------------------------------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copiamos únicamente el archivo .jar generado en la etapa anterior
COPY --from=builder /app/target/*.jar app.jar

# Exponemos el puerto de Spring Boot
EXPOSE 8080

# Comando para arrancar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]
