package com.mibid.iam.controller;

import com.mibid.core.dto.ResultResponse;
import com.mibid.iam.domain.Tenant;
import com.mibid.iam.service.TenantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;

    @GetMapping
    public ResponseEntity<ResultResponse<List<TenantService.TenantSummaryDto>>> listTenants() {
        return ResponseEntity.ok(ResultResponse.success(tenantService.getAllTenantsSummary()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResultResponse<Tenant>> getTenant(@PathVariable UUID id) {
        return ResponseEntity.ok(ResultResponse.success(tenantService.getTenantById(id)));
    }

    @PostMapping
    public ResponseEntity<ResultResponse<Tenant>> createTenant(@RequestBody Tenant tenant) {
        return ResponseEntity.ok(ResultResponse.success(tenantService.createTenant(tenant)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResultResponse<Tenant>> updateTenant(@PathVariable UUID id, @RequestBody Tenant tenant) {
        return ResponseEntity.ok(ResultResponse.success(tenantService.updateTenant(id, tenant)));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<ResultResponse<TenantService.TenantMembersDto>> getTenantMembers(@PathVariable UUID id) {
        return ResponseEntity.ok(ResultResponse.success(tenantService.getTenantMembers(id)));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<ResultResponse<TenantService.TenantMemberItemDto>> addMember(
            @PathVariable UUID id,
            @RequestBody TenantService.AddTenantMemberRequest request
    ) {
        return ResponseEntity.ok(ResultResponse.success(tenantService.addMemberToTenant(id, request)));
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<ResultResponse<Void>> removeMember(
            @PathVariable UUID id,
            @PathVariable UUID userId
    ) {
        tenantService.removeMemberFromTenant(id, userId);
        return ResponseEntity.ok(ResultResponse.success(null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResultResponse<Void>> deleteTenant(@PathVariable UUID id) {
        tenantService.deleteTenant(id);
        return ResponseEntity.ok(ResultResponse.success(null));
    }
}
