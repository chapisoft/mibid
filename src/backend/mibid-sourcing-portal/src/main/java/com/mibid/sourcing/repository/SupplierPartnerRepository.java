package com.mibid.sourcing.repository;

import com.mibid.sourcing.domain.SupplierPartner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SupplierPartnerRepository extends JpaRepository<SupplierPartner, UUID> {

    @Query("SELECT p FROM SupplierPartner p WHERE p.isDeleted = false AND (:tenantId IS NULL OR p.tenantId = :tenantId) ORDER BY p.createdAt DESC")
    List<SupplierPartner> findByTenantIdAndIsDeletedFalse(@Param("tenantId") UUID tenantId);

    @Query("SELECT p FROM SupplierPartner p WHERE p.id = :id AND p.isDeleted = false AND (:tenantId IS NULL OR p.tenantId = :tenantId)")
    Optional<SupplierPartner> findByIdAndTenantIdAndIsDeletedFalse(@Param("id") UUID id, @Param("tenantId") UUID tenantId);
}
