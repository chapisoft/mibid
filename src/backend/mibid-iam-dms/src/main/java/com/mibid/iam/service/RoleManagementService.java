package com.mibid.iam.service;

import com.mibid.core.context.TenantContextHolder;
import com.mibid.core.exception.AppException;
import com.mibid.core.exception.ErrorCode;
import com.mibid.iam.domain.Role;
import com.mibid.iam.domain.RolePermission;
import com.mibid.iam.repository.RolePermissionRepository;
import com.mibid.iam.repository.RoleRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleManagementService {

    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;

    @Data
    @Builder
    public static class RoleDto {
        private String id;
        private String tenantId;
        private String name;
        private String description;
        private Boolean isSystem;
        private List<String> permissions;
    }

    @Transactional(readOnly = true)
    public List<RoleDto> getAllRoles(String tenantIdStr) {
        UUID tenantId = null;
        if (tenantIdStr != null && !tenantIdStr.trim().isEmpty()) {
            try {
                tenantId = UUID.fromString(tenantIdStr.trim());
            } catch (IllegalArgumentException ignored) {
            }
        }
        if (tenantId == null) {
            tenantId = TenantContextHolder.getTenantId();
        }

        List<Role> roles;
        if (tenantId != null) {
            roles = roleRepository.findByTenantIdOrderByNameAsc(tenantId);
        } else {
            roles = roleRepository.findAll();
        }

        return roles.stream().map(role -> {
            List<String> perms = rolePermissionRepository.findByRoleId(role.getId())
                    .stream()
                    .map(p -> p != null ? p.getFeatureCode() : null)
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toList());

            return RoleDto.builder()
                    .id(role.getId().toString())
                    .tenantId(role.getTenantId() != null ? role.getTenantId().toString() : "")
                    .name(role.getName())
                    .description(role.getDescription())
                    .isSystem(role.getIsSystem())
                    .permissions(perms)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getRolePermissions(String roleIdStr) {
        UUID roleId = UUID.fromString(roleIdStr);
        return rolePermissionRepository.findByRoleId(roleId)
                .stream()
                .map(p -> p != null ? p.getFeatureCode() : null)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<String> updateRolePermissions(String roleIdStr, List<String> permissions) {
        UUID roleId = UUID.fromString(roleIdStr);
        roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.role.notFound"));

        rolePermissionRepository.deleteByRoleId(roleId);

        if (permissions != null && !permissions.isEmpty()) {
            List<RolePermission> newPerms = permissions.stream()
                    .map(p -> RolePermission.builder()
                            .roleId(roleId)
                            .featureCode(p)
                            .build())
                    .collect(Collectors.toList());
            rolePermissionRepository.saveAll(newPerms);
        }

        return getRolePermissions(roleIdStr);
    }

    @Transactional
    public RoleDto createRole(RoleDto dto) {
        UUID tenantId = null;
        if (dto.getTenantId() != null && !dto.getTenantId().trim().isEmpty()) {
            try {
                tenantId = UUID.fromString(dto.getTenantId().trim());
            } catch (IllegalArgumentException ignored) {
            }
        }
        if (tenantId == null) {
            tenantId = TenantContextHolder.getTenantId();
        }
        if (tenantId == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "error.tenant.required");
        }

        Role role = Role.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .name(dto.getName())
                .description(dto.getDescription())
                .isSystem(false)
                .build();

        Role saved = roleRepository.save(role);

        if (dto.getPermissions() != null && !dto.getPermissions().isEmpty()) {
            List<RolePermission> perms = dto.getPermissions().stream()
                    .map(p -> RolePermission.builder()
                            .roleId(saved.getId())
                            .featureCode(p)
                            .build())
                    .collect(Collectors.toList());
            rolePermissionRepository.saveAll(perms);
        }

        return RoleDto.builder()
                .id(saved.getId().toString())
                .tenantId(saved.getTenantId().toString())
                .name(saved.getName())
                .description(saved.getDescription())
                .isSystem(saved.getIsSystem())
                .permissions(dto.getPermissions() != null ? dto.getPermissions() : List.of())
                .build();
    }

    @Transactional
    public void deleteRole(String roleIdStr) {
        UUID roleId = UUID.fromString(roleIdStr);
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.role.notFound"));
        if (Boolean.TRUE.equals(role.getIsSystem())) {
            throw new AppException(ErrorCode.FORBIDDEN, "error.role.cannotDeleteSystemRole");
        }
        rolePermissionRepository.deleteByRoleId(roleId);
        roleRepository.delete(role);
    }
}
