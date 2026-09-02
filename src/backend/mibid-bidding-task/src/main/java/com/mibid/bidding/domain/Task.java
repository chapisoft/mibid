package com.mibid.bidding.domain;

import com.mibid.core.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tasks")
public class Task extends BaseEntity {

    @Column(name = "project_id", length = 100)
    private String projectId;

    @Column(name = "project_name", length = 255)
    private String projectName;

    @Column(name = "stage_id", length = 100)
    private String stageId;

    @Column(name = "code", nullable = false, length = 64)
    private String code;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "department_code", nullable = false, length = 64)
    private String departmentCode; // TECHNICAL, COMMERCIAL, LEGAL, FINANCE

    @Column(name = "priority", length = 32)
    private String priority; // URGENT, HIGH, MEDIUM, LOW

    @Column(name = "assignee_id", length = 100)
    private String assigneeId;

    @Column(name = "assignee_name", length = 150)
    private String assigneeName;

    @Column(name = "assignee_avatar", length = 255)
    private String assigneeAvatar;

    @Column(name = "due_at")
    private LocalDateTime dueAt;

    @Column(name = "is_mandatory", nullable = false)
    private boolean isMandatory;

    @Column(name = "status", nullable = false, length = 32)
    private String status; // Trạng thái nhiệm vụ (tham chiếu enum TaskStatus)

    @Column(name = "clarification_count")
    private Integer clarificationCount;

    @Column(name = "sla_status", length = 32)
    private String slaStatus; // ON_TRACK, AT_RISK, OVERDUE

    @Column(name = "sla_remaining_hours")
    private Integer slaRemainingHours;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "evidence_docs", columnDefinition = "jsonb")
    private String evidenceDocs;

    @Column(name = "gate_checklists", columnDefinition = "jsonb")
    private String gateChecklists;
}
