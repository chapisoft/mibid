package com.mibid.bidding.repository;

import com.mibid.bidding.domain.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

    @Query("SELECT t FROM Task t WHERE t.isDeleted = false AND (:tenantId IS NULL OR t.tenantId = :tenantId)")
    List<Task> findByTenantIdAndIsDeletedFalse(@Param("tenantId") UUID tenantId);

    @Query("SELECT t FROM Task t WHERE t.isDeleted = false AND (:tenantId IS NULL OR t.tenantId = :tenantId) AND (t.projectId = :projectId OR t.code = :projectId)")
    List<Task> findByTenantIdAndProjectIdAndIsDeletedFalse(@Param("tenantId") UUID tenantId, @Param("projectId") String projectId);

    @Query("SELECT t FROM Task t WHERE t.isDeleted = false AND (:tenantId IS NULL OR t.tenantId = :tenantId) AND t.departmentCode = :departmentCode")
    List<Task> findByTenantIdAndDepartmentCodeAndIsDeletedFalse(@Param("tenantId") UUID tenantId, @Param("departmentCode") String departmentCode);

    @Query("SELECT t FROM Task t WHERE t.id = :id AND t.isDeleted = false AND (:tenantId IS NULL OR t.tenantId = :tenantId)")
    Optional<Task> findByIdAndTenantIdAndIsDeletedFalse(@Param("id") UUID id, @Param("tenantId") UUID tenantId);
}
