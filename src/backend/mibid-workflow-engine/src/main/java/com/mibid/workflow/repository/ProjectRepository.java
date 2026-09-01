package com.mibid.workflow.repository;

import com.mibid.workflow.domain.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {
    @Query("SELECT p FROM Project p WHERE p.isDeleted = false AND (:tenantId IS NULL OR p.tenantId = :tenantId)")
    List<Project> findByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT p FROM Project p WHERE p.isDeleted = false AND (:tenantId IS NULL OR p.tenantId = :tenantId) AND p.status = :status")
    List<Project> findByTenantIdAndStatus(@Param("tenantId") UUID tenantId, @Param("status") String status);
}
