package com.mibid.iam.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Thực thể Phân quyền Menu theo từng Doanh nghiệp / Tenant trong mô hình Multi-tenant SaaS.
 */
@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tenant_menu_permissions", uniqueConstraints = {
        @UniqueConstraint(name = "uq_mibid_tenant_menu", columnNames = {"tenant_id", "menu_id"})
})
public class TenantMenuPermission {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "tenant_id", length = 50, nullable = false)
    private String tenantId;

    @Column(name = "menu_id", length = 50, nullable = false)
    private String menuId;

    @Column(name = "is_enabled", nullable = false)
    private Boolean isEnabled;

    @Column(name = "custom_label", length = 100)
    private String customLabel;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
