package com.mibid.workflow.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

/**
 * Entity lưu danh sách checklist items theo từng giai đoạn (Stage) trong quy trình đấu thầu.
 * Dữ liệu được quản lý tập trung trong bảng {@code stage_checklist_items} của DB.
 */
@Entity
@Table(name = "stage_checklist_items", indexes = {
    @Index(name = "idx_sci_stage", columnList = "stage_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StageChecklistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "project_id")
    private UUID projectId;

    @Column(name = "stage_id")
    private UUID stageId;

    @Column(name = "stage_code", length = 50)
    private String stageCode;

    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_required", nullable = false)
    private boolean required;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "doc_code", length = 100)
    private String docCode;

    @Column(name = "assignee_role", length = 100)
    private String assigneeRole;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
