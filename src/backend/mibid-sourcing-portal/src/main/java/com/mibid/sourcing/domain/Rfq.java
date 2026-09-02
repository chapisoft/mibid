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

@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "rfqs")
public class Rfq extends BaseEntity {

    @Column(name = "project_id")
    private java.util.UUID projectId;

    @Column(name = "project_name", length = 255)
    private String projectName;

    @Column(name = "code", nullable = false, length = 64)
    private String code;

    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "supplier_name", length = 255)
    private String supplierName;

    @Column(name = "supplier_email", length = 150)
    private String supplierEmail;

    @Column(name = "item_count")
    private Integer itemCount;

    @Column(name = "currency", length = 20)
    private String currency;

    @Column(name = "incoterm", length = 20)
    private String incoterm;

    @Column(name = "total_quote_amount", precision = 18, scale = 2)
    private BigDecimal totalQuoteAmount;

    @Column(name = "submission_deadline")
    private LocalDateTime submissionDeadline;

    @Column(name = "magic_link_expires_at")
    private LocalDateTime magicLinkExpiresAt;

    @Column(name = "status", nullable = false, length = 32)
    private String status; // DRAFT, ISSUED, QUOTED, CLOSED, CANCELLED

    @Column(name = "rfq_code", length = 50)
    private String rfqCode;

    @Column(name = "incoterms", length = 10)
    private String incoterms;

    @Column(name = "deadline")
    private LocalDateTime deadline;

    @Column(name = "shipping_method", length = 30)
    private String shippingMethod;

    @Column(name = "evaluation_method", length = 30)
    private String evaluationMethod;

    @Column(name = "quote_validity_days")
    private Integer quoteValidityDays;

    @Column(name = "rfq_round")
    private Integer rfqRound;

    @PrePersist
    @Override
    public void prePersist() {
        super.prePersist();
        if (this.rfqCode == null && this.code != null) {
            this.rfqCode = this.code;
        } else if (this.code == null && this.rfqCode != null) {
            this.code = this.rfqCode;
        }
        if (this.incoterms == null) {
            this.incoterms = this.incoterm != null ? this.incoterm : "CIF";
        }
        if (this.deadline == null) {
            this.deadline = this.submissionDeadline != null ? this.submissionDeadline : LocalDateTime.now().plusDays(7);
        }
        if (this.shippingMethod == null) {
            this.shippingMethod = "SEA";
        }
        if (this.evaluationMethod == null) {
            this.evaluationMethod = "LOWEST_PRICE";
        }
        if (this.quoteValidityDays == null) {
            this.quoteValidityDays = 30;
        }
        if (this.rfqRound == null) {
            this.rfqRound = 1;
        }
        if (this.getCreatedBy() == null && com.mibid.core.context.TenantContextHolder.getUserId() != null) {
            this.setCreatedBy(com.mibid.core.context.TenantContextHolder.getUserId());
        }
    }
}
