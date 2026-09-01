package com.mibid.iam.domain;

import com.mibid.core.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Thực thể Tài liệu số hóa (Document) trong kho DMS với gắn nhãn thời hạn hiệu lực.
 */
@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "documents")
public class Document extends BaseEntity {

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "document_type_code", nullable = false, length = 64)
    private String documentTypeCode;

    @Column(name = "s3_object_key", nullable = false, length = 512)
    private String s3ObjectKey;

    @Column(name = "file_size_bytes", nullable = false)
    private long fileSizeBytes;

    @Column(name = "mime_type", length = 128)
    private String mimeType;

    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    @Column(name = "expires_at")
    private LocalDate expiresAt;

    @Column(name = "approval_status", nullable = false, length = 32)
    private String approvalStatus; // DRAFT, PENDING, APPROVED, REJECTED

    @Column(name = "approved_by")
    private UUID approvedBy;
}
