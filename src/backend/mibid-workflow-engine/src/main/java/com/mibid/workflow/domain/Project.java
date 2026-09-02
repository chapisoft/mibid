package com.mibid.workflow.domain;

import com.mibid.core.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Thực thể Gói thầu / Dự án (Project) trong MIBID.
 */
@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "projects")
public class Project extends BaseEntity {

    @Column(name = "code", nullable = false, length = 64)
    private String code;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "tender_type", length = 50)
    private String tenderType; // TENANT_PARTICIPATING, TENANT_ISSUED

    @Column(name = "investor_type", length = 32)
    private String investorType; // STATE_OWNED, EPC_GENERAL_CONTRACTOR, FDI_FOREIGN, PRIVATE_DOMESTIC

    @Column(name = "investor_name", length = 255)
    private String investorName;

    @Column(name = "industry_sector", length = 50)
    private String industrySector;

    @Column(name = "procurement_method", length = 32)
    private String procurementMethod; // OPEN_BIDDING, COMPETITIVE_OFFER, DIRECT_PROCUREMENT

    @Column(name = "estimated_budget", precision = 18, scale = 2)
    private BigDecimal estimatedBudget;

    @Column(name = "currency", length = 8)
    private String currency; // VND, USD, EUR, JPY, CNY

    @Column(name = "workflow_id")
    private UUID workflowId;

    @Column(name = "current_stage_id")
    private UUID currentStageId;

    @Column(name = "stage_enum", length = 50)
    private String stageEnum; // STAGE_PREPARATION, STAGE_SOURCING, STAGE_BID_BOND, STAGE_DOSSIER, STAGE_SUBMISSION, STAGE_CLOSING

    @Column(name = "bid_submission_deadline")
    private LocalDateTime bidSubmissionDeadline;

    @Column(name = "manager_id")
    private UUID managerId;

    @Column(name = "manager_name", length = 150)
    private String managerName;

    @Column(name = "completed_tasks")
    private Integer completedTasks;

    @Column(name = "total_tasks")
    private Integer totalTasks;

    @Column(name = "status", nullable = false, length = 32)
    private String status; // DRAFT, IN_PROGRESS, SUBMITTED, WON, LOST, CANCELLED
}
