package com.mibid.sourcing.domain;

import com.mibid.core.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "rfq_line_items")
public class RfqLineItem extends BaseEntity {

    @Column(name = "rfq_id", nullable = false)
    private UUID rfqId;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "item_code", length = 50)
    private String itemCode;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "specifications", columnDefinition = "TEXT")
    private String specifications;

    @Column(name = "uom", nullable = false, length = 20)
    private String uom;

    @Column(name = "quantity", nullable = false, precision = 12, scale = 2)
    private BigDecimal quantity;

    @Column(name = "target_unit_price", precision = 15, scale = 2)
    private BigDecimal targetUnitPrice;

    @Column(name = "origin_country", length = 100)
    private String originCountry;

    @Column(name = "hs_code", length = 20)
    private String hsCode;
}
