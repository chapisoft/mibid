package com.mibid.iam.repository;

import com.mibid.iam.domain.AppMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppMenuRepository extends JpaRepository<AppMenu, String> {

    Optional<AppMenu> findByCode(String code);

    List<AppMenu> findByIsActiveTrueOrderBySortOrderAscCreatedAtAsc();

    List<AppMenu> findByModuleCodeAndIsActiveTrueOrderBySortOrderAscCreatedAtAsc(String moduleCode);

    List<AppMenu> findByParentIdOrderBySortOrderAsc(String parentId);

    List<AppMenu> findByParentIdIsNullOrderBySortOrderAsc();

    @Query("SELECT m FROM AppMenu m " +
           "LEFT JOIN TenantMenuPermission tmp ON m.id = tmp.menuId AND tmp.tenantId = :tenantId " +
           "WHERE m.isActive = true AND (tmp.isEnabled IS NULL OR tmp.isEnabled = true) " +
           "ORDER BY m.sortOrder ASC, m.createdAt ASC")
    List<AppMenu> findActiveMenusForTenant(@Param("tenantId") String tenantId);
}
