package com.mibid.iam.controller;

import com.mibid.core.dto.ResultResponse;
import com.mibid.iam.domain.SubscriptionInvoice;
import com.mibid.iam.domain.SubscriptionNotification;
import com.mibid.iam.domain.SubscriptionPlan;
import com.mibid.iam.service.SubscriptionBillingService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/management/subscriptions")
@RequiredArgsConstructor
public class SubscriptionManagementController {

    private final SubscriptionBillingService billingService;

    @Data
    public static class RenewSubscriptionRequest {
        private String planId;
        private String billingCycle;
        private String paymentMethod;
        private String transactionReference;
        private String notes;
    }

    @Data
    public static class PayInvoiceRequest {
        private String transactionReference;
        private String paymentMethod;
    }

    @GetMapping
    public ResponseEntity<ResultResponse<List<SubscriptionBillingService.TenantSubscriptionSummaryDto>>> getAllSubscriptions() {
        return ResponseEntity.ok(ResultResponse.success(billingService.getAllSubscriptions()));
    }

    @GetMapping("/plans")
    public ResponseEntity<ResultResponse<List<SubscriptionPlan>>> getAllPlans() {
        return ResponseEntity.ok(ResultResponse.success(billingService.getAllPlans()));
    }

    @PostMapping("/plans")
    public ResponseEntity<ResultResponse<SubscriptionPlan>> createPlan(@RequestBody SubscriptionPlan plan) {
        return ResponseEntity.ok(ResultResponse.success(billingService.createPlan(plan)));
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<ResultResponse<SubscriptionBillingService.TenantSubscriptionSummaryDto>> getTenantSubscription(
            @PathVariable("tenantId") String tenantId) {
        return ResponseEntity.ok(ResultResponse.success(billingService.getTenantSubscription(tenantId)));
    }

    @PostMapping("/tenant/{tenantId}/renew")
    public ResponseEntity<ResultResponse<SubscriptionBillingService.TenantSubscriptionSummaryDto>> renewSubscription(
            @PathVariable("tenantId") String tenantId,
            @RequestBody RenewSubscriptionRequest request) {
        return ResponseEntity.ok(ResultResponse.success(billingService.renewSubscription(
                tenantId,
                request.getPlanId(),
                request.getBillingCycle(),
                request.getPaymentMethod(),
                request.getTransactionReference(),
                request.getNotes()
        )));
    }

    @GetMapping("/invoices")
    public ResponseEntity<ResultResponse<List<SubscriptionInvoice>>> getAllInvoices(
            @RequestParam(value = "tenantId", required = false) String tenantId) {
        return ResponseEntity.ok(ResultResponse.success(billingService.getInvoices(tenantId)));
    }

    @GetMapping("/tenant/{tenantId}/invoices")
    public ResponseEntity<ResultResponse<List<SubscriptionInvoice>>> getTenantInvoices(
            @PathVariable("tenantId") String tenantId) {
        return ResponseEntity.ok(ResultResponse.success(billingService.getInvoices(tenantId)));
    }

    @PostMapping("/invoices/{invoiceId}/pay")
    public ResponseEntity<ResultResponse<SubscriptionInvoice>> payInvoice(
            @PathVariable("invoiceId") String invoiceId,
            @RequestBody(required = false) PayInvoiceRequest request) {
        String txnRef = request != null ? request.getTransactionReference() : null;
        String method = request != null ? request.getPaymentMethod() : null;
        return ResponseEntity.ok(ResultResponse.success(billingService.markInvoicePaid(invoiceId, txnRef, method)));
    }

    @GetMapping("/notifications")
    public ResponseEntity<ResultResponse<List<SubscriptionNotification>>> getNotifications(
            @RequestParam(value = "tenantId", required = false) String tenantId) {
        return ResponseEntity.ok(ResultResponse.success(billingService.getNotifications(tenantId)));
    }
}
