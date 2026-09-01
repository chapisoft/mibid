package com.mibid.iam.service;

import com.mibid.core.exception.AppException;
import com.mibid.core.exception.ErrorCode;
import com.mibid.iam.domain.Document;
import com.mibid.iam.repository.DocumentRepository;
import com.mibid.s3.service.S3StorageService;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final S3StorageService s3StorageService;

    @Data
    @Builder
    public static class DocumentDto {
        private UUID id;
        private String title;
        private String documentTypeCode;
        private String s3ObjectKey;
        private long fileSizeBytes;
        private LocalDate effectiveFrom;
        private LocalDate expiresAt;
        private long daysUntilExpiration;
        private boolean isExpiringSoon; // true nếu < 30 ngày
        private String approvalStatus;
        private String downloadUrl;
    }

    @Transactional(readOnly = true)
    public List<DocumentDto> getDocuments(UUID tenantId) {
        LocalDate now = LocalDate.now();
        return documentRepository.findByTenantId(tenantId).stream()
                .map(doc -> toDto(doc, now))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DocumentDto> getExpiringDocuments(UUID tenantId, int withinDays) {
        LocalDate threshold = LocalDate.now().plusDays(withinDays);
        LocalDate now = LocalDate.now();
        return documentRepository.findExpiringDocuments(tenantId, threshold).stream()
                .map(doc -> toDto(doc, now))
                .collect(Collectors.toList());
    }

    @Transactional
    public Document uploadDocumentMetadata(Document document) {
        document.setApprovalStatus("APPROVED");
        return documentRepository.save(document);
    }

    public String generateUploadUrl(String filename) {
        String objectKey = "documents/" + UUID.randomUUID() + "_" + filename;
        return s3StorageService.generateUploadPresignedUrl(objectKey, 15);
    }

    private DocumentDto toDto(Document doc, LocalDate now) {
        long daysUntil = doc.getExpiresAt() != null ? ChronoUnit.DAYS.between(now, doc.getExpiresAt()) : 9999;
        boolean expiring = daysUntil >= 0 && daysUntil <= 30;

        return DocumentDto.builder()
                .id(doc.getId())
                .title(doc.getTitle())
                .documentTypeCode(doc.getDocumentTypeCode())
                .s3ObjectKey(doc.getS3ObjectKey())
                .fileSizeBytes(doc.getFileSizeBytes())
                .effectiveFrom(doc.getEffectiveFrom())
                .expiresAt(doc.getExpiresAt())
                .daysUntilExpiration(daysUntil)
                .isExpiringSoon(expiring)
                .approvalStatus(doc.getApprovalStatus())
                .downloadUrl(s3StorageService.generateDownloadPresignedUrl(doc.getS3ObjectKey(), 15))
                .build();
    }
}
