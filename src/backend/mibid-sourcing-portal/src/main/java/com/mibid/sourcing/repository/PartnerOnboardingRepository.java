package com.mibid.sourcing.repository;

import com.mibid.sourcing.domain.PartnerOnboardingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PartnerOnboardingRepository extends JpaRepository<PartnerOnboardingRequest, UUID> {

    @Query("SELECT o FROM PartnerOnboardingRequest o WHERE o.isDeleted = false AND (:tenantId IS NULL OR o.tenantId = :tenantId) ORDER BY o.submittedAt DESC")
    List<PartnerOnboardingRequest> findByTenantIdAndIsDeletedFalse(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM PartnerOnboardingRequest o WHERE o.id = :id AND o.isDeleted = false AND (:tenantId IS NULL OR o.tenantId = :tenantId)")
    Optional<PartnerOnboardingRequest> findByIdAndTenantIdAndIsDeletedFalse(@Param("id") UUID id, @Param("tenantId") UUID tenantId);
}
