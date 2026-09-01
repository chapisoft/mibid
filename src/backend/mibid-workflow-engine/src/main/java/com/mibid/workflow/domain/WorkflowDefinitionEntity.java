package com.mibid.workflow.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "workflow_definitions", indexes = {
    @Index(name = "idx_wf_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_wf_code", columnList = "code")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowDefinitionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "code", nullable = false, length = 100)
    private String code;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "version", length = 50)
    private String version;

    @Column(name = "status", length = 50)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "tenant_id")
    private UUID tenantId;

    @Column(name = "tenant_name", length = 255)
    private String tenantName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "nodes_json", columnDefinition = "TEXT")
    private String nodesJson;

    @Column(name = "edges_json", columnDefinition = "TEXT")
    private String edgesJson;

    @Column(name = "is_template", nullable = false)
    @Builder.Default
    private boolean isTemplate = false;

    @Column(name = "template_category", length = 100)
    private String templateCategory;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private boolean deleted = false;
}
