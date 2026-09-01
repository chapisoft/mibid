package com.mibid.iam.domain;

import com.mibid.core.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Thực thể Khách thuê Doanh nghiệp (Tenant) trong mô hình Multi-tenant SaaS.
 */
@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tenants")
public class Tenant extends BaseEntity {

    @Column(name = "code", nullable = false, unique = true, length = 64)
    private String code;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "tax_code", length = 32)
    private String taxCode;

    @Column(name = "contact_email", nullable = false, length = 255)
    private String contactEmail;

    @Column(name = "contact_phone", length = 32)
    private String contactPhone;

    @Column(name = "status", nullable = false, length = 32)
    private String status; // ACTIVE, SUSPENDED, EXPIRED

    @Column(name = "storage_quota_gb", nullable = false)
    private int storageQuotaGb;
}
