package com.mibid.sourcing.domain;

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

@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "supplier_partners")
public class SupplierPartner extends BaseEntity {

    @Column(name = "code", nullable = false, length = 64)
    private String code;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "tax_code", length = 50)
    private String taxCode;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "rating", precision = 3, scale = 1)
    private BigDecimal rating;

    @Column(name = "contact_person", length = 150)
    private String contactPerson;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "status", nullable = false, length = 32)
    private String status; // ACTIVE, PENDING, SUSPENDED

    @Column(name = "total_quotes_submitted")
    private Integer totalQuotesSubmitted;

    @Column(name = "total_won_bids")
    private Integer totalWonBids;

    @Column(name = "iso_certified")
    private Boolean isoCertified;
}
