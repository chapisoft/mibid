package com.mibid.iam.repository;

import com.mibid.iam.domain.TenantMenuPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TenantMenuPermissionRepository extends JpaRepository<TenantMenuPermission, String> {

    List<TenantMenuPermission> findByTenantId(String tenantId);

    Optional<TenantMenuPermission> findByTenantIdAndMenuId(String tenantId, String menuId);

    void deleteByTenantId(String tenantId);
}
