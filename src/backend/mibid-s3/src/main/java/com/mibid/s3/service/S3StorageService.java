package com.mibid.s3.service;

import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * Dịch vụ tương tác MinIO/Amazon S3 để sinh Pre-signed URL cho tải lên/tải xuống bảo mật.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class S3StorageService {

    private final MinioClient minioClient;

    @Value("${mibid.minio.bucket-name:mibid-documents}")
    private String defaultBucket;

    public String generateUploadPresignedUrl(String objectKey, int expiryMinutes) {
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.PUT)
                            .bucket(defaultBucket)
                            .object(objectKey)
                            .expiry(expiryMinutes, TimeUnit.MINUTES)
                            .build()
            );
        } catch (Exception e) {
            log.error("Không thể tạo Pre-signed URL cho upload [ObjectKey: {}]: ", objectKey, e);
            throw new RuntimeException("Lỗi khởi tạo liên kết tải lên S3", e);
        }
    }

    public String generateDownloadPresignedUrl(String objectKey, int expiryMinutes) {
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(defaultBucket)
                            .object(objectKey)
                            .expiry(expiryMinutes, TimeUnit.MINUTES)
                            .build()
            );
        } catch (Exception e) {
            log.error("Không thể tạo Pre-signed URL cho download [ObjectKey: {}]: ", objectKey, e);
            throw new RuntimeException("Lỗi khởi tạo liên kết tải xuống S3", e);
        }
    }
}
