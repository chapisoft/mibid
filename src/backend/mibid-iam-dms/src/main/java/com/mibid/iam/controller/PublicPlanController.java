package com.mibid.iam.controller;

import com.mibid.core.dto.ResultResponse;
import com.mibid.iam.domain.SubscriptionPlan;
import com.mibid.iam.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Cổng API công khai cung cấp danh mục Gói cước SaaS cho Trang chủ (Landing Page).
 * Không yêu cầu xác thực JWT.
 */
@RestController
@RequestMapping("/api/v1/public/plans")
@RequiredArgsConstructor
public class PublicPlanController {

    private final SubscriptionPlanRepository subscriptionPlanRepository;

    @GetMapping
    public ResponseEntity<ResultResponse<List<SubscriptionPlan>>> getPublicPlans() {
        List<SubscriptionPlan> plans = subscriptionPlanRepository.findByIsActiveTrueOrderByMonthlyPriceAsc();
        return ResponseEntity.ok(ResultResponse.success(plans));
    }
}
