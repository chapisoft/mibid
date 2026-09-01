package com.mibid.sourcing.repository;

import com.mibid.sourcing.domain.PartnerSupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PartnerSupportTicketRepository extends JpaRepository<PartnerSupportTicket, UUID> {

    @Query("SELECT t FROM PartnerSupportTicket t WHERE t.isDeleted = false AND (:tenantId IS NULL OR t.tenantId = :tenantId) ORDER BY t.requestedAt DESC")
    List<PartnerSupportTicket> findByTenantIdAndIsDeletedFalse(@Param("tenantId") UUID tenantId);

    @Query("SELECT t FROM PartnerSupportTicket t WHERE t.id = :id AND t.isDeleted = false AND (:tenantId IS NULL OR t.tenantId = :tenantId)")
    Optional<PartnerSupportTicket> findByIdAndTenantIdAndIsDeletedFalse(@Param("id") UUID id, @Param("tenantId") UUID tenantId);
}
