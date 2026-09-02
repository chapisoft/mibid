package com.mibid.iam.controller;

import com.mibid.core.dto.ResultResponse;
import com.mibid.iam.service.RoleManagementService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/management/roles")
@RequiredArgsConstructor
public class RoleManagementController {

    private final RoleManagementService roleService;

    @Data
    public static class UpdatePermissionsRequest {
        private List<String> permissions;
    }

    @GetMapping
    public ResponseEntity<ResultResponse<List<RoleManagementService.RoleDto>>> getAllRoles(
            @RequestParam(value = "tenantId", required = false) String tenantId) {
        return ResponseEntity.ok(ResultResponse.success(roleService.getAllRoles(tenantId)));
    }

    @GetMapping("/{roleId}/permissions")
    public ResponseEntity<ResultResponse<List<String>>> getRolePermissions(
            @PathVariable("roleId") String roleId) {
        return ResponseEntity.ok(ResultResponse.success(roleService.getRolePermissions(roleId)));
    }

    @PutMapping("/{roleId}/permissions")
    public ResponseEntity<ResultResponse<List<String>>> updateRolePermissions(
            @PathVariable("roleId") String roleId,
            @RequestBody UpdatePermissionsRequest request) {
        return ResponseEntity.ok(ResultResponse.success(
                roleService.updateRolePermissions(roleId, request.getPermissions())));
    }

    @PostMapping
    public ResponseEntity<ResultResponse<RoleManagementService.RoleDto>> createRole(
            @RequestBody RoleManagementService.RoleDto roleDto) {
        return ResponseEntity.ok(ResultResponse.success(roleService.createRole(roleDto)));
    }

    @DeleteMapping("/{roleId}")
    public ResponseEntity<ResultResponse<Void>> deleteRole(
            @PathVariable("roleId") String roleId) {
        roleService.deleteRole(roleId);
        return ResponseEntity.ok(ResultResponse.success(null));
    }
}
