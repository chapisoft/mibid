package com.mibid.outbox.repository;

import com.mibid.outbox.domain.WebhookDeliveryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WebhookDeliveryRepository extends JpaRepository<WebhookDeliveryEntity, UUID> {
    List<WebhookDeliveryEntity> findAllByTenantIdOrderByCreatedAtDesc(UUID tenantId);
}
