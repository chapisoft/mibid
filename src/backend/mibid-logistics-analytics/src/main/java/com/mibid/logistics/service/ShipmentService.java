package com.mibid.logistics.service;

import com.mibid.core.domain.enums.ShipmentStatus;
import com.mibid.core.exception.AppException;
import com.mibid.core.exception.ErrorCode;
import com.mibid.logistics.domain.ShipmentEntity;
import com.mibid.logistics.domain.ShipmentMilestoneEntity;
import com.mibid.logistics.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;

    @Transactional(readOnly = true)
    public List<ShipmentEntity> getShipments(UUID tenantId, String projectId) {
        if (projectId != null && !projectId.equalsIgnoreCase("ALL") && !projectId.isBlank()) {
            return shipmentRepository.findByTenantIdAndProjectIdAndIsDeletedFalse(tenantId, projectId);
        }
        return shipmentRepository.findByTenantIdAndIsDeletedFalse(tenantId);
    }

    @Transactional(readOnly = true)
    public ShipmentEntity getShipmentById(UUID id, UUID tenantId) {
        return shipmentRepository.findByIdAndTenantIdAndIsDeletedFalse(id, tenantId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.shipment.notFound"));
    }

    @Transactional
    public ShipmentEntity createShipment(ShipmentEntity shipment, UUID tenantId) {
        if (tenantId != null) {
            shipment.setTenantId(tenantId);
        } else if (shipment.getTenantId() == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "error.shipment.tenantIdRequired");
        }

        if (shipment.getMilestones() == null || shipment.getMilestones().isEmpty()) {
            shipment.setMilestones(createDefaultMilestones(shipment));
        } else {
            for (ShipmentMilestoneEntity m : shipment.getMilestones()) {
                m.setShipment(shipment);
                m.setTenantId(shipment.getTenantId());
            }
        }

        return shipmentRepository.save(shipment);
    }

    @Transactional
    @SuppressWarnings("null")
    public ShipmentEntity updateShipment(UUID id, ShipmentEntity updates, UUID tenantId) {
        ShipmentEntity existing = getShipmentById(id, tenantId);

        if (updates.getBlNumber() != null) existing.setBlNumber(updates.getBlNumber());
        if (updates.getProjectId() != null) existing.setProjectId(updates.getProjectId());
        if (updates.getProjectName() != null) existing.setProjectName(updates.getProjectName());
        if (updates.getContractNo() != null) existing.setContractNo(updates.getContractNo());
        if (updates.getCarrier() != null) existing.setCarrier(updates.getCarrier());
        if (updates.getPol() != null) existing.setPol(updates.getPol());
        if (updates.getPod() != null) existing.setPod(updates.getPod());
        if (updates.getEtd() != null) existing.setEtd(updates.getEtd());
        if (updates.getEta() != null) existing.setEta(updates.getEta());
        if (updates.getContractDeadline() != null) existing.setContractDeadline(updates.getContractDeadline());
        if (updates.getStatus() != null) existing.setStatus(updates.getStatus());
        if (updates.getEquipmentSummary() != null) existing.setEquipmentSummary(updates.getEquipmentSummary());
        if (updates.getSupplierName() != null) existing.setSupplierName(updates.getSupplierName());
        if (updates.getOriginCountry() != null) existing.setOriginCountry(updates.getOriginCountry());
        if (updates.getInTransitValueUsd() != null) existing.setInTransitValueUsd(updates.getInTransitValueUsd());
        if (updates.getInTransitValueVnd() != null) existing.setInTransitValueVnd(updates.getInTransitValueVnd());
        if (updates.getContainerCount() != null) existing.setContainerCount(updates.getContainerCount());
        if (updates.getGrossWeightKg() != null) existing.setGrossWeightKg(updates.getGrossWeightKg());
        if (updates.getCustomsDeclarationNo() != null) existing.setCustomsDeclarationNo(updates.getCustomsDeclarationNo());
        if (updates.getCustomsStatus() != null) existing.setCustomsStatus(updates.getCustomsStatus());
        if (updates.getCustomsClearedDate() != null) existing.setCustomsClearedDate(updates.getCustomsClearedDate());
        if (updates.getVesselName() != null) existing.setVesselName(updates.getVesselName());
        if (updates.getVoyageNo() != null) existing.setVoyageNo(updates.getVoyageNo());
        if (updates.getDelayReason() != null) existing.setDelayReason(updates.getDelayReason());

        return shipmentRepository.save(existing);
    }

    @Transactional
    public void deleteShipment(UUID id, UUID tenantId) {
        ShipmentEntity existing = getShipmentById(id, tenantId);
        existing.setDeleted(true);
        shipmentRepository.save(existing);
    }

    private List<ShipmentMilestoneEntity> createDefaultMilestones(ShipmentEntity shipment) {
        List<ShipmentMilestoneEntity> list = new ArrayList<>();

        list.add(ShipmentMilestoneEntity.builder()
                .shipment(shipment)
                .tenantId(shipment.getTenantId())
                .code("M1_ETD")
                .name("milestone.pol.name")
                .status(ShipmentStatus.PENDING.name())
                .plannedDate(shipment.getEtd())
                .actualDate(null)
                .seqOrder(1)
                .build());

        list.add(ShipmentMilestoneEntity.builder()
                .shipment(shipment)
                .tenantId(shipment.getTenantId())
                .code("M2_TRANSIT")
                .name("milestone.transit.name")
                .status(ShipmentStatus.PENDING.name())
                .plannedDate(null)
                .actualDate(null)
                .seqOrder(2)
                .build());

        list.add(ShipmentMilestoneEntity.builder()
                .shipment(shipment)
                .tenantId(shipment.getTenantId())
                .code("M3_ETA")
                .name("milestone.pod.name")
                .status(ShipmentStatus.PENDING.name())
                .plannedDate(shipment.getEta())
                .actualDate(null)
                .seqOrder(3)
                .build());

        list.add(ShipmentMilestoneEntity.builder()
                .shipment(shipment)
                .tenantId(shipment.getTenantId())
                .code("M4_CUSTOMS")
                .name("milestone.customs.name")
                .status(ShipmentStatus.PENDING.name())
                .plannedDate(null)
                .actualDate(null)
                .seqOrder(4)
                .build());

        list.add(ShipmentMilestoneEntity.builder()
                .shipment(shipment)
                .tenantId(shipment.getTenantId())
                .code("M5_DELIVERY")
                .name("milestone.delivery.name")
                .status(ShipmentStatus.PENDING.name())
                .plannedDate(shipment.getContractDeadline())
                .actualDate(null)
                .seqOrder(5)
                .build());

        return list;
    }
}
