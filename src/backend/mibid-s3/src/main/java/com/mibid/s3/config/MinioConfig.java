package com.mibid.s3.config;

import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cấu hình MinIO Client Bean.
 */
@Configuration
public class MinioConfig {

    @Value("${mibid.minio.endpoint:http://localhost:9000}")
    private String endpoint;

    @Value("${mibid.minio.access-key:minioadmin}")
    private String accessKey;

    @Value("${mibid.minio.secret-key:minioadmin}")
    private String secretKey;

    @Bean
    @ConditionalOnMissingBean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();
    }
}
