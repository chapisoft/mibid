package com.mibid.logistics.service;

import com.mibid.core.exception.AppException;
import com.mibid.core.exception.ErrorCode;
import com.mibid.logistics.domain.ShipmentEntity;
import com.mibid.logistics.domain.ShipmentMilestoneEntity;
import com.mibid.logistics.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy vận đơn: " + id));
    }

    @Transactional
    public ShipmentEntity createShipment(ShipmentEntity shipment, UUID tenantId) {
        if (tenantId != null) {
            shipment.setTenantId(tenantId);
        } else if (shipment.getTenantId() == null) {
            shipment.setTenantId(UUID.fromString("11111111-1111-1111-1111-111111111111"));
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
        LocalDate now = LocalDate.now();

        list.add(ShipmentMilestoneEntity.builder()
                .shipment(shipment)
                .code("M1_ETD")
                .name("Rời cảng xếp hàng (POL)")
                .status("COMPLETED")
                .plannedDate(shipment.getEtd() != null ? shipment.getEtd() : now.minusDays(10))
                .actualDate(shipment.getEtd() != null ? shipment.getEtd() : now.minusDays(10))
                .seqOrder(1)
                .build());

        list.add(ShipmentMilestoneEntity.builder()
                .shipment(shipment)
                .code("M2_TRANSIT")
                .name("Đang hành trình trên biển")
                .status("IN_PROGRESS")
                .plannedDate(now.minusDays(5))
                .actualDate(now.minusDays(5))
                .seqOrder(2)
                .build());

        list.add(ShipmentMilestoneEntity.builder()
                .shipment(shipment)
                .code("M3_ETA")
                .name("Cập cảng dỡ hàng (POD)")
                .status("PENDING")
                .plannedDate(shipment.getEta() != null ? shipment.getEta() : now.plusDays(10))
                .seqOrder(3)
                .build());

        list.add(ShipmentMilestoneEntity.builder()
                .shipment(shipment)
                .code("M4_CUSTOMS")
                .name("Thông quan hải quan")
                .status("PENDING")
                .plannedDate(shipment.getEta() != null ? shipment.getEta().plusDays(2) : now.plusDays(12))
                .seqOrder(4)
                .build());

        list.add(ShipmentMilestoneEntity.builder()
                .shipment(shipment)
                .code("M5_DELIVERY")
                .name("Giao hàng tại chân công trình")
                .status("PENDING")
                .plannedDate(shipment.getContractDeadline() != null ? shipment.getContractDeadline() : now.plusDays(15))
                .seqOrder(5)
                .build());

        return list;
    }
}
