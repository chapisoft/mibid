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

    @Column(name = "project_id", length = 100)
    private String projectId;

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
}
