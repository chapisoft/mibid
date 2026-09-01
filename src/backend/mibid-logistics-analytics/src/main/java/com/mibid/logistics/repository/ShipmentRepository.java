package com.mibid.logistics.repository;

import com.mibid.logistics.domain.ShipmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShipmentRepository extends JpaRepository<ShipmentEntity, UUID> {

    @Query("SELECT s FROM ShipmentEntity s WHERE s.isDeleted = false AND (:tenantId IS NULL OR s.tenantId = :tenantId) ORDER BY s.createdAt DESC")
    List<ShipmentEntity> findByTenantIdAndIsDeletedFalse(@Param("tenantId") UUID tenantId);

    @Query("SELECT s FROM ShipmentEntity s WHERE s.isDeleted = false AND (:tenantId IS NULL OR s.tenantId = :tenantId) AND (s.projectId = :projectId) ORDER BY s.createdAt DESC")
    List<ShipmentEntity> findByTenantIdAndProjectIdAndIsDeletedFalse(@Param("tenantId") UUID tenantId, @Param("projectId") String projectId);

    @Query("SELECT s FROM ShipmentEntity s WHERE s.id = :id AND s.isDeleted = false AND (:tenantId IS NULL OR s.tenantId = :tenantId)")
    Optional<ShipmentEntity> findByIdAndTenantIdAndIsDeletedFalse(@Param("id") UUID id, @Param("tenantId") UUID tenantId);

    @Query("SELECT s FROM ShipmentEntity s WHERE s.blNumber = :blNumber AND s.isDeleted = false AND (:tenantId IS NULL OR s.tenantId = :tenantId)")
    Optional<ShipmentEntity> findByBlNumberAndTenantIdAndIsDeletedFalse(@Param("blNumber") String blNumber, @Param("tenantId") UUID tenantId);
}
