package com.mibid.outbox.repository;

import com.mibid.outbox.domain.OutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OutboxEventRepository extends JpaRepository<OutboxEvent, UUID> {
    List<OutboxEvent> findTop50ByStatusOrderByCreatedAtAsc(String status);
    
    @Query("SELECT o FROM OutboxEvent o WHERE (:tenantId IS NULL OR o.tenantId = :tenantId) AND o.status = :status ORDER BY o.createdAt DESC")
    List<OutboxEvent> findAllByTenantIdAndStatusOrderByCreatedAtDesc(@Param("tenantId") UUID tenantId, @Param("status") String status);
    
    @Query("SELECT o FROM OutboxEvent o WHERE (:tenantId IS NULL OR o.tenantId = :tenantId) ORDER BY o.createdAt DESC")
    List<OutboxEvent> findAllByTenantId(@Param("tenantId") UUID tenantId);

    long countByStatus(String status);
}
