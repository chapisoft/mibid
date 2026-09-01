package com.mibid.logistics.domain;

import com.mibid.core.domain.BaseEntity;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "shipments")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentEntity extends BaseEntity {

    @Column(name = "bl_number", nullable = false, length = 100)
    private String blNumber;

    @Column(name = "project_id", length = 100)
    private String projectId;

    @Column(name = "project_name", length = 255)
    private String projectName;

    @Column(name = "contract_no", length = 100)
    private String contractNo;

    @Column(name = "carrier", length = 150)
    private String carrier;

    @Column(name = "pol", length = 150)
    private String pol;

    @Column(name = "pod", length = 150)
    private String pod;

    @Column(name = "etd")
    private LocalDate etd;

    @Column(name = "eta")
    private LocalDate eta;

    @Column(name = "contract_deadline")
    private LocalDate contractDeadline;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "equipment_summary", columnDefinition = "TEXT")
    private String equipmentSummary;

    @Column(name = "supplier_name", length = 255)
    private String supplierName;

    @Column(name = "origin_country", length = 100)
    private String originCountry;

    @Column(name = "in_transit_value_usd", precision = 18, scale = 2)
    private BigDecimal inTransitValueUsd;

    @Column(name = "in_transit_value_vnd", precision = 18, scale = 2)
    private BigDecimal inTransitValueVnd;

    @Column(name = "container_count")
    private Integer containerCount;

    @Column(name = "gross_weight_kg", precision = 12, scale = 2)
    private BigDecimal grossWeightKg;

    @Column(name = "customs_declaration_no", length = 100)
    private String customsDeclarationNo;

    @Column(name = "customs_status", length = 50)
    private String customsStatus;

    @Column(name = "customs_cleared_date")
    private LocalDate customsClearedDate;

    @Column(name = "vessel_name", length = 150)
    private String vesselName;

    @Column(name = "voyage_no", length = 50)
    private String voyageNo;

    @Column(name = "delay_reason", columnDefinition = "TEXT")
    private String delayReason;

    @OneToMany(mappedBy = "shipment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    @Builder.Default
    private List<ShipmentMilestoneEntity> milestones = new ArrayList<>();
}
