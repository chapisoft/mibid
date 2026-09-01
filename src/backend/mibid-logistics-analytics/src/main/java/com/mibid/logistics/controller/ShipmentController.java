package com.mibid.logistics.controller;

import com.mibid.core.context.TenantContextHolder;
import com.mibid.core.dto.ResultResponse;
import com.mibid.logistics.domain.ShipmentEntity;
import com.mibid.logistics.service.ShipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/shipments")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;

    @GetMapping
    public ResponseEntity<ResultResponse<List<ShipmentEntity>>> listShipments(
            @RequestParam(required = false) String projectId) {
        UUID tenantId = TenantContextHolder.getTenantId();
        List<ShipmentEntity> list = shipmentService.getShipments(tenantId, projectId);
        return ResponseEntity.ok(ResultResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResultResponse<ShipmentEntity>> getShipment(@PathVariable UUID id) {
        UUID tenantId = TenantContextHolder.getTenantId();
        ShipmentEntity shipment = shipmentService.getShipmentById(id, tenantId);
        return ResponseEntity.ok(ResultResponse.success(shipment));
    }

    @PostMapping
    public ResponseEntity<ResultResponse<ShipmentEntity>> createShipment(@RequestBody ShipmentEntity shipment) {
        UUID tenantId = TenantContextHolder.getTenantId();
        ShipmentEntity created = shipmentService.createShipment(shipment, tenantId);
        return ResponseEntity.ok(ResultResponse.success(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResultResponse<ShipmentEntity>> updateShipment(
            @PathVariable UUID id,
            @RequestBody ShipmentEntity updates) {
        UUID tenantId = TenantContextHolder.getTenantId();
        ShipmentEntity updated = shipmentService.updateShipment(id, updates, tenantId);
        return ResponseEntity.ok(ResultResponse.success(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResultResponse<Void>> deleteShipment(@PathVariable UUID id) {
        UUID tenantId = TenantContextHolder.getTenantId();
        shipmentService.deleteShipment(id, tenantId);
        return ResponseEntity.ok(ResultResponse.success(null));
    }
}
