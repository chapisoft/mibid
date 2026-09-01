package com.mibid.iam.repository;

import com.mibid.iam.domain.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {
    List<Document> findByTenantId(UUID tenantId);

    @Query("SELECT d FROM Document d WHERE d.tenantId = :tenantId AND d.expiresAt IS NOT NULL AND d.expiresAt <= :thresholdDate")
    List<Document> findExpiringDocuments(@Param("tenantId") UUID tenantId, @Param("thresholdDate") LocalDate thresholdDate);
}
