# ==============================================================================
# MIBID ENTERPRISE BACKEND SERVER DOCKERFILE (JAVA 21 / ECLIPSE TEMURIN)
# ==============================================================================
FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="MIBID Core Engineering Team <engineering@mibid.vn>"
LABEL project="mibid"
LABEL component="mibid-backend"

# Thiết lập thư mục làm việc và người dùng phi đặc quyền bảo mật
RUN addgroup -S mibid && adduser -S mibid -G mibid
WORKDIR /app

# Cài đặt curl để hỗ trợ Docker Healthcheck
RUN apk --no-cache add curl tzdata
ENV TZ=Asia/Ho_Chi_Minh

# Copy file jar ứng dụng từ target build
COPY mibid-server/target/mibid-server-*.jar /app/app.jar
RUN chown -R mibid:mibid /app

USER mibid

EXPOSE 8080

# Cấu hình JVM tối ưu hiệu năng container (Container-Aware Memory)
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=50.0 -Djava.security.egd=file:/dev/./urandom"

HEALTHCHECK --interval=15s --timeout=5s --retries=3 --start-period=30s \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
