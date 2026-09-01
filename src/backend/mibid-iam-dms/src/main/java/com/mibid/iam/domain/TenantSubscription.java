package com.mibid.iam.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Thực thể Hợp đồng và Thuê bao Doanh nghiệp trong MIBID.
 */
@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tenant_subscriptions")
public class TenantSubscription {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "tenant_id", length = 50, nullable = false)
    private String tenantId;

    @Column(name = "plan_id", length = 50, nullable = false)
    private String planId;

    @Column(name = "billing_cycle", length = 20)
    private String billingCycle;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "grace_period_days")
    private Integer gracePeriodDays;

    @Column(name = "status", length = 30, nullable = false)
    private String status; // ACTIVE, EXPIRING_SOON, GRACE_PERIOD, SUSPENDED, CANCELLED

    @Column(name = "auto_renew")
    private Boolean autoRenew;

    @Column(name = "current_user_count")
    private Integer currentUserCount;

    @Column(name = "current_machine_count")
    private Integer currentMachineCount;

    @Column(name = "last_notification_sent_at")
    private LocalDateTime lastNotificationSentAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
