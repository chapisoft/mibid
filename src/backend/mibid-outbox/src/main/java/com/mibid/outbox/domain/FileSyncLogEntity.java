package com.mibid.outbox.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "file_sync_logs")
public class FileSyncLogEntity {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "file_type", length = 64, nullable = false)
    private String fileType; // RFQ_LINE_ITEMS_IMPORT, VENDOR_CATALOG_SYNC, PO_CONTRACT_EXPORT, CUSTOMS_DECLARATION

    @Column(name = "total_records", nullable = false)
    @Builder.Default
    private int totalRecords = 0;

    @Column(name = "success_count", nullable = false)
    @Builder.Default
    private int successCount = 0;

    @Column(name = "error_count", nullable = false)
    @Builder.Default
    private int errorCount = 0;

    @Column(name = "status", length = 32, nullable = false)
    @Builder.Default
    private String status = "SUCCESS"; // SUCCESS, PARTIAL_ERROR, FAILED

    @Column(name = "error_log_json", columnDefinition = "TEXT")
    private String errorLogJson;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
