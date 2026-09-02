package com.mibid.workflow.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "project_checklist_status", indexes = {
    @Index(name = "idx_pcs_project", columnList = "project_id")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uq_pcs_proj_item", columnNames = {"project_id", "checklist_item_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectChecklistStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "checklist_item_id", nullable = false)
    private UUID checklistItemId;

    @Column(name = "is_checked", nullable = false)
    private boolean checked;

    @Column(name = "checked_by")
    private UUID checkedBy;

    @Column(name = "checked_at")
    private Instant checkedAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
