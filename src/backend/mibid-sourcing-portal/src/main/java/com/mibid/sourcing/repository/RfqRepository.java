package com.mibid.sourcing.repository;

import com.mibid.sourcing.domain.Rfq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RfqRepository extends JpaRepository<Rfq, UUID> {

    @Query("SELECT r FROM Rfq r WHERE r.isDeleted = false AND (:tenantId IS NULL OR r.tenantId = :tenantId)")
    List<Rfq> findByTenantIdAndIsDeletedFalse(@Param("tenantId") UUID tenantId);

    @Query("SELECT r FROM Rfq r WHERE r.isDeleted = false AND (:tenantId IS NULL OR r.tenantId = :tenantId) AND (r.projectId = :projectId OR r.code = :projectId)")
    List<Rfq> findByTenantIdAndProjectIdAndIsDeletedFalse(@Param("tenantId") UUID tenantId, @Param("projectId") String projectId);

    @Query("SELECT r FROM Rfq r WHERE r.id = :id AND r.isDeleted = false AND (:tenantId IS NULL OR r.tenantId = :tenantId)")
    Optional<Rfq> findByIdAndTenantIdAndIsDeletedFalse(@Param("id") UUID id, @Param("tenantId") UUID tenantId);

    @Query("SELECT r FROM Rfq r WHERE r.code = :code AND r.isDeleted = false AND (:tenantId IS NULL OR r.tenantId = :tenantId)")
    Optional<Rfq> findByCodeAndTenantIdAndIsDeletedFalse(@Param("code") String code, @Param("tenantId") UUID tenantId);
}
