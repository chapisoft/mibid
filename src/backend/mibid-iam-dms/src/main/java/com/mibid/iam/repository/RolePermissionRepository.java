package com.mibid.iam.repository;

import com.mibid.iam.domain.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, RolePermission.RolePermissionId> {
    List<RolePermission> findByRoleId(UUID roleId);
    void deleteByRoleId(UUID roleId);
}
