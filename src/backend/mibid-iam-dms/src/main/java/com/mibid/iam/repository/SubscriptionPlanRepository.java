package com.mibid.iam.repository;

import com.mibid.iam.domain.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, String> {

    Optional<SubscriptionPlan> findByCode(String code);

    List<SubscriptionPlan> findByIsActiveTrueOrderByMonthlyPriceAsc();
}
