package com.mibid.iam.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Thực thể Gói cước SaaS cho MIBID.
 */
@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "subscription_plans")
public class SubscriptionPlan {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "code", length = 50, nullable = false, unique = true)
    private String code;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "monthly_price", precision = 15, scale = 2)
    private BigDecimal monthlyPrice;

    @Column(name = "yearly_price", precision = 15, scale = 2)
    private BigDecimal yearlyPrice;

    @Column(name = "max_users")
    private Integer maxUsers;

    @Column(name = "max_machines")
    private Integer maxMachines;

    @Column(name = "max_storage_gb")
    private Integer maxStorageGb;

    @Column(name = "allowed_modules", columnDefinition = "jsonb")
    private String allowedModules;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
