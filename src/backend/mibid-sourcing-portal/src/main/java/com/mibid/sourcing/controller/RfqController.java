package com.mibid.sourcing.controller;

import com.mibid.core.context.TenantContextHolder;
import com.mibid.core.dto.ResultResponse;
import com.mibid.sourcing.domain.Rfq;
import com.mibid.sourcing.service.RfqService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rfqs")
@RequiredArgsConstructor
public class RfqController {

    private final RfqService rfqService;

    @GetMapping
    public ResponseEntity<ResultResponse<List<Rfq>>> listRfqs(
            @RequestParam(required = false) String projectId) {
        UUID tenantId = TenantContextHolder.getTenantId();
        List<Rfq> list = rfqService.getRfqs(tenantId, projectId);
        return ResponseEntity.ok(ResultResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResultResponse<Rfq>> getRfq(@PathVariable UUID id) {
        UUID tenantId = TenantContextHolder.getTenantId();
        Rfq rfq = rfqService.getRfqById(id, tenantId);
        return ResponseEntity.ok(ResultResponse.success(rfq));
    }

    @PostMapping
    public ResponseEntity<ResultResponse<Rfq>> createRfq(@RequestBody Rfq rfq) {
        UUID tenantId = TenantContextHolder.getTenantId();
        Rfq created = rfqService.createRfq(rfq, tenantId);
        return ResponseEntity.ok(ResultResponse.success(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResultResponse<Rfq>> updateRfq(
            @PathVariable UUID id,
            @RequestBody Rfq updates) {
        UUID tenantId = TenantContextHolder.getTenantId();
        Rfq updated = rfqService.updateRfq(id, updates, tenantId);
        return ResponseEntity.ok(ResultResponse.success(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResultResponse<Void>> deleteRfq(@PathVariable UUID id) {
        UUID tenantId = TenantContextHolder.getTenantId();
        rfqService.deleteRfq(id, tenantId);
        return ResponseEntity.ok(ResultResponse.success(null));
    }

    @GetMapping("/{id}/detail")
    public ResponseEntity<ResultResponse<RfqService.RfqQuotationDetailDto>> getQuotationDetail(@PathVariable String id) {
        UUID tenantId = TenantContextHolder.getTenantId();
        RfqService.RfqQuotationDetailDto detail = rfqService.getQuotationDetail(id, tenantId);
        return ResponseEntity.ok(ResultResponse.success(detail));
    }
}
