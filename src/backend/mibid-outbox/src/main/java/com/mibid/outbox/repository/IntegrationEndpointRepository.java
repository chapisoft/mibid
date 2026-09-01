package com.mibid.outbox.repository;

import com.mibid.outbox.domain.IntegrationEndpointEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IntegrationEndpointRepository extends JpaRepository<IntegrationEndpointEntity, String> {

    @Query("SELECT e FROM IntegrationEndpointEntity e WHERE (:tenantId IS NULL OR e.tenantId = :tenantId) ORDER BY e.createdAt DESC")
    List<IntegrationEndpointEntity> findAllByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT e FROM IntegrationEndpointEntity e WHERE e.isActive = true AND (:tenantId IS NULL OR e.tenantId = :tenantId) ORDER BY e.createdAt DESC")
    List<IntegrationEndpointEntity> findAllByTenantIdAndIsActiveTrue(@Param("tenantId") UUID tenantId);
}
