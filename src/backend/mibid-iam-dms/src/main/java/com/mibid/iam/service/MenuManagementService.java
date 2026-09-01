package com.mibid.iam.service;

import com.mibid.iam.domain.AppMenu;
import com.mibid.iam.domain.TenantMenuPermission;
import com.mibid.iam.repository.AppMenuRepository;
import com.mibid.iam.repository.TenantMenuPermissionRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MenuManagementService {

    private final AppMenuRepository menuRepository;
    private final TenantMenuPermissionRepository tenantMenuPermissionRepository;

    @Data
    @Builder
    public static class MenuTreeDto {
        private String id;
        private String parentId;
        private String code;
        private String name;
        private String routePath;
        private String iconName;
        private String moduleCode;
        private Integer sortOrder;
        private Boolean isActive;
        private Boolean isSystem;
        private String requiredPermission;
        private List<MenuTreeDto> children;
    }

    @Data
    @Builder
    public static class TenantMenuPermissionDto {
        private String id;
        private String tenantId;
        private String menuId;
        private String menuCode;
        private String menuName;
        private String routePath;
        private String moduleCode;
        private Boolean isEnabled;
        private String customLabel;
    }

    @Transactional(readOnly = true)
    public List<AppMenu> getAllMenus(String moduleCode) {
        if (moduleCode != null && !moduleCode.trim().isEmpty()) {
            return menuRepository.findByModuleCodeAndIsActiveTrueOrderBySortOrderAscCreatedAtAsc(moduleCode);
        }
        return menuRepository.findByIsActiveTrueOrderBySortOrderAscCreatedAtAsc();
    }

    @Transactional(readOnly = true)
    public List<MenuTreeDto> getMenuTree() {
        List<AppMenu> allMenus = menuRepository.findByIsActiveTrueOrderBySortOrderAscCreatedAtAsc();
        Map<String, List<AppMenu>> childrenMap = allMenus.stream()
                .filter(m -> m.getParentId() != null)
                .collect(Collectors.groupingBy(AppMenu::getParentId));

        return allMenus.stream()
                .filter(m -> m.getParentId() == null)
                .map(parent -> buildTreeNode(parent, childrenMap))
                .collect(Collectors.toList());
    }

    private MenuTreeDto buildTreeNode(AppMenu menu, Map<String, List<AppMenu>> childrenMap) {
        List<AppMenu> children = childrenMap.getOrDefault(menu.getId(), new ArrayList<>());
        List<MenuTreeDto> childDtos = children.stream()
                .map(c -> buildTreeNode(c, childrenMap))
                .collect(Collectors.toList());

        return MenuTreeDto.builder()
                .id(menu.getId())
                .parentId(menu.getParentId())
                .code(menu.getCode())
                .name(menu.getTitle())
                .routePath(menu.getPath())
                .iconName(menu.getIcon())
                .moduleCode(menu.getModuleCode())
                .sortOrder(menu.getSortOrder())
                .isActive(menu.getIsActive())
                .isSystem(menu.getIsSystem())
                .requiredPermission(menu.getRequiredPermission())
                .children(childDtos)
                .build();
    }

    @Transactional(readOnly = true)
    public List<AppMenu> getTenantMenus(String tenantId) {
        return menuRepository.findActiveMenusForTenant(tenantId);
    }

    @Transactional(readOnly = true)
    public List<TenantMenuPermissionDto> getTenantPermissions(String tenantId) {
        List<AppMenu> allMenus = menuRepository.findByIsActiveTrueOrderBySortOrderAscCreatedAtAsc();
        List<TenantMenuPermission> permissions = tenantMenuPermissionRepository.findByTenantId(tenantId);
        Map<String, TenantMenuPermission> permMap = permissions.stream()
                .collect(Collectors.toMap(TenantMenuPermission::getMenuId, p -> p, (p1, p2) -> p1));

        return allMenus.stream()
                .map(m -> {
                    TenantMenuPermission p = permMap.get(m.getId());
                    boolean isEnabled = p == null || Boolean.TRUE.equals(p.getIsEnabled());
                    return TenantMenuPermissionDto.builder()
                            .id(p != null ? p.getId() : "TMP-" + tenantId + "-" + m.getId())
                            .tenantId(tenantId)
                            .menuId(m.getId())
                            .menuCode(m.getCode())
                            .menuName(m.getTitle())
                            .routePath(m.getPath())
                            .moduleCode(m.getModuleCode())
                            .isEnabled(isEnabled)
                            .customLabel(p != null ? p.getCustomLabel() : null)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void assignTenantMenus(String tenantId, List<String> menuIds) {
        tenantMenuPermissionRepository.deleteByTenantId(tenantId);
        if (menuIds != null && !menuIds.isEmpty()) {
            for (String menuId : menuIds) {
                TenantMenuPermission perm = TenantMenuPermission.builder()
                        .id("TMP-" + tenantId + "-" + menuId)
                        .tenantId(tenantId)
                        .menuId(menuId)
                        .isEnabled(true)
                        .build();
                tenantMenuPermissionRepository.save(perm);
            }
        }
    }

    @Transactional
    public AppMenu createMenu(AppMenu menu) {
        if (menu.getId() == null || menu.getId().trim().isEmpty()) {
            menu.setId("MENU-" + menu.getCode().toUpperCase());
        }
        if (menu.getIsSystem() == null) {
            menu.setIsSystem(false);
        }
        if (menu.getIsActive() == null) {
            menu.setIsActive(true);
        }
        return menuRepository.save(menu);
    }

    @Transactional
    public AppMenu updateMenu(String menuId, AppMenu updateRequest) {
        AppMenu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Menu ID: " + menuId));

        menu.setTitle(updateRequest.getTitle());
        menu.setPath(updateRequest.getPath());
        menu.setIcon(updateRequest.getIcon());
        menu.setModuleCode(updateRequest.getModuleCode());
        menu.setParentId(updateRequest.getParentId());
        menu.setSortOrder(updateRequest.getSortOrder());
        menu.setIsActive(updateRequest.getIsActive());
        menu.setRequiredPermission(updateRequest.getRequiredPermission());

        return menuRepository.save(menu);
    }

    @Transactional
    public void deleteMenu(String menuId) {
        AppMenu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Menu ID: " + menuId));
        if (Boolean.TRUE.equals(menu.getIsSystem())) {
            throw new IllegalStateException("Không thể xóa Menu hệ thống mặc định");
        }
        menuRepository.deleteById(menuId);
    }
}
