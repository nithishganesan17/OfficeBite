
# Build the Spring Boot application using Java 21
FROM eclipse-temurin:21-jdk AS build

WORKDIR /app

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
COPY src/ src/

RUN chmod +x mvnw && ./mvnw -DskipTests package

# Run the packaged application using a smaller Java 21 image
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/officebite-backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
