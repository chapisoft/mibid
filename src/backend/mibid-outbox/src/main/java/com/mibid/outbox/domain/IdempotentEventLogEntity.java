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
@Table(name = "idempotent_event_logs")
public class IdempotentEventLogEntity {

    @Id
    @Column(name = "id", length = 128, nullable = false)
    private String id; // Idempotency Key

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "source_system", length = 64, nullable = false)
    private String sourceSystem;

    @Column(name = "event_type", length = 128, nullable = false)
    private String eventType;

    @CreationTimestamp
    @Column(name = "processed_at", nullable = false, updatable = false)
    private LocalDateTime processedAt;

    @Column(name = "expire_at", nullable = false)
    private LocalDateTime expireAt;
}
