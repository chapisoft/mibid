package com.mibid.outbox.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "integration_endpoints")
public class IntegrationEndpointEntity {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "system_type", length = 64, nullable = false)
    private String systemType; // SAP_ERP, ORACLE_ERP, BRAVO_ERP, FAST_ERP, VNACCS_CUSTOMS, WMS_LOGISTICS, CUSTOM_REST

    @Column(name = "integration_mode", length = 64, nullable = false)
    private String integrationMode; // KAFKA_STREAMING, WEBHOOK_HMAC, SFTP_BATCH, REST_PULL

    @Column(name = "endpoint_url", length = 1024)
    private String endpointUrl;

    @Column(name = "auth_config", columnDefinition = "TEXT")
    private String authConfig; // JSON AES-256

    @Column(name = "mapping_schema", columnDefinition = "TEXT")
    private String mappingSchema;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "sync_status", length = 32, nullable = false)
    @Builder.Default
    private String syncStatus = "CONNECTED"; // CONNECTED, DISCONNECTED, ERROR

    @Column(name = "last_sync_at", nullable = false)
    @Builder.Default
    private LocalDateTime lastSyncAt = LocalDateTime.now();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
