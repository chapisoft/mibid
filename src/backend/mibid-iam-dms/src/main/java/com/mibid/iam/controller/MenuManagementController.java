package com.mibid.iam.controller;

import com.mibid.core.dto.ResultResponse;
import com.mibid.iam.domain.AppMenu;
import com.mibid.iam.service.MenuManagementService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/management/menus")
@RequiredArgsConstructor
public class MenuManagementController {

    private final MenuManagementService menuService;

    @Data
    public static class AssignTenantMenusRequest {
        private String tenantId;
        private List<String> menuIds;
    }

    @GetMapping
    public ResponseEntity<ResultResponse<List<AppMenu>>> getAllMenus(
            @RequestParam(value = "moduleCode", required = false) String moduleCode) {
        return ResponseEntity.ok(ResultResponse.success(menuService.getAllMenus(moduleCode)));
    }

    @GetMapping("/tree")
    public ResponseEntity<ResultResponse<List<MenuManagementService.MenuTreeDto>>> getMenuTree() {
        return ResponseEntity.ok(ResultResponse.success(menuService.getMenuTree()));
    }

    @GetMapping("/tenant")
    public ResponseEntity<ResultResponse<List<AppMenu>>> getTenantMenus(
            @RequestParam(value = "tenantId", defaultValue = "TNT-01") String tenantId) {
        return ResponseEntity.ok(ResultResponse.success(menuService.getTenantMenus(tenantId)));
    }

    @GetMapping("/tenant/{tenantId}/permissions")
    public ResponseEntity<ResultResponse<List<MenuManagementService.TenantMenuPermissionDto>>> getTenantPermissions(
            @PathVariable("tenantId") String tenantId) {
        return ResponseEntity.ok(ResultResponse.success(menuService.getTenantPermissions(tenantId)));
    }

    @PostMapping("/assign-tenant")
    public ResponseEntity<ResultResponse<String>> assignTenantMenus(@RequestBody AssignTenantMenusRequest request) {
        menuService.assignTenantMenus(request.getTenantId(), request.getMenuIds());
        return ResponseEntity.ok(ResultResponse.success("Phân quyền menu thành công cho Tenant: " + request.getTenantId()));
    }

    @PostMapping
    public ResponseEntity<ResultResponse<AppMenu>> createMenu(@RequestBody AppMenu menu) {
        return ResponseEntity.ok(ResultResponse.success(menuService.createMenu(menu)));
    }

    @PutMapping("/{menuId}")
    public ResponseEntity<ResultResponse<AppMenu>> updateMenu(
            @PathVariable("menuId") String menuId,
            @RequestBody AppMenu menu) {
        return ResponseEntity.ok(ResultResponse.success(menuService.updateMenu(menuId, menu)));
    }

    @DeleteMapping("/{menuId}")
    public ResponseEntity<ResultResponse<String>> deleteMenu(@PathVariable("menuId") String menuId) {
        menuService.deleteMenu(menuId);
        return ResponseEntity.ok(ResultResponse.success("Xóa Menu thành công"));
    }
}
