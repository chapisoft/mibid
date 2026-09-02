package com.mibid.sourcing.domain;

import com.mibid.core.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Bản ghi báo giá do Nhà cung cấp nộp qua Vendor Portal.
 * Bảng rfq_submissions — lưu toàn bộ thông tin thương mại & vận tải do vendor điền.
 */
@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "rfq_submissions", indexes = {
        @Index(name = "idx_rfq_submissions_rfq_id", columnList = "rfq_id"),
        @Index(name = "idx_rfq_submissions_vendor_email", columnList = "vendor_email")
})
public class RfqSubmission extends BaseEntity {

    @Column(name = "rfq_id", nullable = false)
    private UUID rfqId;

    @Column(name = "vendor_email", nullable = false, length = 150)
    private String vendorEmail;

    @Column(name = "supplier_contact", length = 150)
    private String supplierContact;

    @Column(name = "supplier_country", length = 100)
    private String supplierCountry;

    @Column(name = "currency", length = 20)
    private String currency;

    @Column(name = "incoterm", length = 20)
    private String incoterm;

    @Column(name = "payment_term", length = 100)
    private String paymentTerm;

    @Column(name = "loading_port", length = 150)
    private String loadingPort;

    @Column(name = "discharge_port", length = 150)
    private String dischargePort;

    @Column(name = "lead_time_weeks")
    private Integer leadTimeWeeks;

    @Column(name = "warranty_months")
    private Integer warrantyMonths;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "total_amount", precision = 18, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "digital_checksum", length = 255)
    private String digitalChecksum;

    @Column(name = "security_pin_hash", length = 255)
    private String securityPinHash;

    @Column(name = "security_pin_salt", length = 64)
    private String securityPinSalt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "status", nullable = false, length = 32)
    private String status; // DRAFT, SUBMITTED, ACCEPTED, REJECTED
}
