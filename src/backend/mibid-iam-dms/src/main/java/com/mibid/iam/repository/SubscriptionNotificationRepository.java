package com.mibid.iam.repository;

import com.mibid.iam.domain.SubscriptionNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubscriptionNotificationRepository extends JpaRepository<SubscriptionNotification, String> {

    List<SubscriptionNotification> findByTenantIdOrderBySentAtDesc(String tenantId);

    List<SubscriptionNotification> findAllByOrderBySentAtDesc();
}
