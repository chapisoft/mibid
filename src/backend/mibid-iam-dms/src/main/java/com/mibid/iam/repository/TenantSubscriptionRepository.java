package com.mibid.iam.repository;

import com.mibid.iam.domain.TenantSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TenantSubscriptionRepository extends JpaRepository<TenantSubscription, String> {

    Optional<TenantSubscription> findByTenantId(String tenantId);

    List<TenantSubscription> findByStatus(String status);
}
