package com.mibid.sourcing.controller;

import com.mibid.core.context.TenantContextHolder;
import com.mibid.core.dto.ResultResponse;
import com.mibid.sourcing.domain.PartnerOnboardingRequest;
import com.mibid.sourcing.domain.PartnerSupportTicket;
import com.mibid.sourcing.domain.SupplierPartner;
import com.mibid.sourcing.service.PartnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/partners")
@RequiredArgsConstructor
public class PartnerController {

    private final PartnerService partnerService;

    // 1. Directory Partners
    @GetMapping
    public ResponseEntity<ResultResponse<List<SupplierPartner>>> listPartners() {
        UUID tenantId = TenantContextHolder.getTenantId();
        return ResponseEntity.ok(ResultResponse.success(partnerService.getPartners(tenantId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResultResponse<SupplierPartner>> getPartner(@PathVariable UUID id) {
        UUID tenantId = TenantContextHolder.getTenantId();
        return ResponseEntity.ok(ResultResponse.success(partnerService.getPartnerById(id, tenantId)));
    }

    @PostMapping
    public ResponseEntity<ResultResponse<SupplierPartner>> createPartner(@RequestBody SupplierPartner partner) {
        UUID tenantId = TenantContextHolder.getTenantId();
        return ResponseEntity.ok(ResultResponse.success(partnerService.createPartner(partner, tenantId)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResultResponse<SupplierPartner>> updatePartner(
            @PathVariable UUID id,
            @RequestBody SupplierPartner updates) {
        UUID tenantId = TenantContextHolder.getTenantId();
        return ResponseEntity.ok(ResultResponse.success(partnerService.updatePartner(id, updates, tenantId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResultResponse<Void>> deletePartner(@PathVariable UUID id) {
        UUID tenantId = TenantContextHolder.getTenantId();
        partnerService.deletePartner(id, tenantId);
        return ResponseEntity.ok(ResultResponse.success(null));
    }

    // 2. Onboarding Requests
    @GetMapping("/onboarding")
    public ResponseEntity<ResultResponse<List<PartnerOnboardingRequest>>> listOnboardingRequests() {
        UUID tenantId = TenantContextHolder.getTenantId();
        return ResponseEntity.ok(ResultResponse.success(partnerService.getOnboardingRequests(tenantId)));
    }

    @PostMapping("/onboarding/{id}/approve")
    public ResponseEntity<ResultResponse<Boolean>> approveOnboarding(@PathVariable UUID id) {
        UUID tenantId = TenantContextHolder.getTenantId();
        partnerService.approveOnboarding(id, tenantId);
        return ResponseEntity.ok(ResultResponse.success(true));
    }

    @PostMapping("/onboarding/{id}/reject")
    public ResponseEntity<ResultResponse<Boolean>> rejectOnboarding(@PathVariable UUID id) {
        UUID tenantId = TenantContextHolder.getTenantId();
        partnerService.rejectOnboarding(id, tenantId);
        return ResponseEntity.ok(ResultResponse.success(true));
    }

    // 3. Support Tickets
    @GetMapping("/tickets")
    public ResponseEntity<ResultResponse<List<PartnerSupportTicket>>> listSupportTickets() {
        UUID tenantId = TenantContextHolder.getTenantId();
        return ResponseEntity.ok(ResultResponse.success(partnerService.getSupportTickets(tenantId)));
    }

    @PostMapping("/tickets/{id}/resolve")
    public ResponseEntity<ResultResponse<Boolean>> resolveTicket(@PathVariable UUID id) {
        UUID tenantId = TenantContextHolder.getTenantId();
        partnerService.resolveTicket(id, tenantId);
        return ResponseEntity.ok(ResultResponse.success(true));
    }

    @PostMapping("/tickets/{id}/resend-magic-link")
    public ResponseEntity<ResultResponse<Map<String, Object>>> resendMagicLink(@PathVariable UUID id) {
        UUID tenantId = TenantContextHolder.getTenantId();
        boolean success = partnerService.resendMagicLink(id, tenantId);
        return ResponseEntity.ok(ResultResponse.success(Map.of("success", success, "message", "Đã tái phát hành Magic Link và gửi mã PIN mới thành công.")));
    }
}
