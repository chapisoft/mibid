package com.mibid.iam.service;

import com.mibid.iam.domain.SubscriptionInvoice;
import com.mibid.iam.domain.SubscriptionNotification;
import com.mibid.iam.domain.SubscriptionPlan;
import com.mibid.iam.domain.TenantSubscription;
import com.mibid.iam.repository.SubscriptionInvoiceRepository;
import com.mibid.iam.repository.SubscriptionNotificationRepository;
import com.mibid.iam.repository.SubscriptionPlanRepository;
import com.mibid.iam.repository.TenantSubscriptionRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionBillingService {

    private final SubscriptionPlanRepository planRepository;
    private final TenantSubscriptionRepository subscriptionRepository;
    private final SubscriptionInvoiceRepository invoiceRepository;
    private final SubscriptionNotificationRepository notificationRepository;

    @Data
    @Builder
    public static class TenantSubscriptionSummaryDto {
        private String id;
        private String tenantId;
        private String tenantName;
        private String planId;
        private String planCode;
        private String planName;
        private String billingCycle;
        private LocalDate startDate;
        private LocalDate endDate;
        private Integer gracePeriodDays;
        private String status;
        private Boolean autoRenew;
        private Integer currentUserCount;
        private Integer maxUsers;
        private Integer currentMachineCount;
        private Integer maxMachines;
        private Long daysRemaining;
        private LocalDateTime lastNotificationSentAt;
    }

    @Transactional(readOnly = true)
    public List<SubscriptionPlan> getAllPlans() {
        return planRepository.findByIsActiveTrueOrderByMonthlyPriceAsc();
    }

    @Transactional
    public SubscriptionPlan createPlan(SubscriptionPlan plan) {
        if (plan.getId() == null || plan.getId().trim().isEmpty()) {
            plan.setId("PLAN-" + plan.getCode().toUpperCase());
        }
        if (plan.getIsActive() == null) {
            plan.setIsActive(true);
        }
        return planRepository.save(plan);
    }

    @Transactional(readOnly = true)
    public List<TenantSubscriptionSummaryDto> getAllSubscriptions() {
        List<TenantSubscription> subs = subscriptionRepository.findAll();
        return subs.stream().map(this::mapToSummaryDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TenantSubscriptionSummaryDto getTenantSubscription(String tenantId) {
        TenantSubscription sub = subscriptionRepository.findByTenantId(tenantId)
                .orElseGet(() -> createDefaultSubscription(tenantId));
        return mapToSummaryDto(sub);
    }

    private TenantSubscription createDefaultSubscription(String tenantId) {
        SubscriptionPlan defaultPlan = planRepository.findByCode("ENTERPRISE")
                .orElseGet(() -> planRepository.findAll().stream().findFirst().orElse(null));

        TenantSubscription newSub = TenantSubscription.builder()
                .id("SUB-" + tenantId + "-2026")
                .tenantId(tenantId)
                .planId(defaultPlan != null ? defaultPlan.getId() : "PLAN-ENTERPRISE")
                .billingCycle("YEARLY")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusYears(1))
                .gracePeriodDays(7)
                .status("ACTIVE")
                .autoRenew(true)
                .currentUserCount(10)
                .currentMachineCount(0)
                .build();

        return subscriptionRepository.save(newSub);
    }

    private TenantSubscriptionSummaryDto mapToSummaryDto(TenantSubscription sub) {
        SubscriptionPlan plan = planRepository.findById(sub.getPlanId()).orElse(null);
        long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), sub.getEndDate());

        return TenantSubscriptionSummaryDto.builder()
                .id(sub.getId())
                .tenantId(sub.getTenantId())
                .tenantName("Doanh nghiệp " + sub.getTenantId())
                .planId(sub.getPlanId())
                .planCode(plan != null ? plan.getCode() : "CUSTOM")
                .planName(plan != null ? plan.getName() : "Gói Tùy biến")
                .billingCycle(sub.getBillingCycle())
                .startDate(sub.getStartDate())
                .endDate(sub.getEndDate())
                .gracePeriodDays(sub.getGracePeriodDays())
                .status(sub.getStatus())
                .autoRenew(sub.getAutoRenew())
                .currentUserCount(sub.getCurrentUserCount())
                .maxUsers(plan != null ? plan.getMaxUsers() : 100)
                .currentMachineCount(sub.getCurrentMachineCount())
                .maxMachines(plan != null ? plan.getMaxMachines() : 50)
                .daysRemaining(daysRemaining)
                .lastNotificationSentAt(sub.getLastNotificationSentAt())
                .build();
    }

    @Transactional
    public TenantSubscriptionSummaryDto renewSubscription(String tenantId, String planId, String billingCycle, String paymentMethod, String txnRef, String notes) {
        TenantSubscription sub = subscriptionRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hợp đồng thuê bao cho Tenant: " + tenantId));

        if (planId != null && !planId.trim().isEmpty()) {
            sub.setPlanId(planId);
        }
        if (billingCycle != null && !billingCycle.trim().isEmpty()) {
            sub.setBillingCycle(billingCycle);
        }

        SubscriptionPlan plan = planRepository.findById(sub.getPlanId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy gói cước ID: " + sub.getPlanId()));

        LocalDate currentEnd = sub.getEndDate();
        LocalDate baseDate = currentEnd.isAfter(LocalDate.now()) ? currentEnd : LocalDate.now();
        LocalDate newEnd = "YEARLY".equalsIgnoreCase(sub.getBillingCycle()) ? baseDate.plusYears(1) : baseDate.plusMonths(1);

        sub.setEndDate(newEnd);
        sub.setStatus("ACTIVE");
        subscriptionRepository.save(sub);

        // Sinh hóa đơn
        BigDecimal amount = "YEARLY".equalsIgnoreCase(sub.getBillingCycle()) ? plan.getYearlyPrice() : plan.getMonthlyPrice();
        String invoiceId = "INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String invoiceNumber = "INV-" + LocalDate.now().getYear() + "-" + (int)(1000 + Math.random() * 9000);

        SubscriptionInvoice invoice = SubscriptionInvoice.builder()
                .id(invoiceId)
                .tenantId(tenantId)
                .subscriptionId(sub.getId())
                .invoiceNumber(invoiceNumber)
                .amount(amount != null ? amount : BigDecimal.ZERO)
                .currency("VND")
                .status("PAID")
                .paymentMethod(paymentMethod != null ? paymentMethod : "BANK_TRANSFER")
                .paymentDate(LocalDateTime.now())
                .dueDate(LocalDate.now().plusDays(15))
                .transactionReference(txnRef != null ? txnRef : "TXN-" + System.currentTimeMillis())
                .notes(notes != null ? notes : "Gia hạn gói " + plan.getName())
                .build();
        invoiceRepository.save(invoice);

        // Ghi log thông báo gia hạn
        long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), newEnd);
        SubscriptionNotification notif = SubscriptionNotification.builder()
                .id("NOTIF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .tenantId(tenantId)
                .subscriptionId(sub.getId())
                .notificationType("RENEWAL_CONFIRMATION")
                .recipientEmail("admin@" + tenantId.toLowerCase() + ".vn")
                .title("Gia hạn dịch vụ MIBID thành công")
                .message("Hợp đồng thuê bao gói " + plan.getName() + " đã được gia hạn đến ngày " + newEnd)
                .daysRemaining((int) daysRemaining)
                .status("SENT")
                .build();
        notificationRepository.save(notif);

        return mapToSummaryDto(sub);
    }

    @Transactional(readOnly = true)
    public List<SubscriptionInvoice> getInvoices(String tenantId) {
        if (tenantId != null && !tenantId.trim().isEmpty()) {
            return invoiceRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
        }
        return invoiceRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public SubscriptionInvoice markInvoicePaid(String invoiceId, String txnRef, String paymentMethod) {
        SubscriptionInvoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hóa đơn ID: " + invoiceId));

        invoice.setStatus("PAID");
        invoice.setPaymentDate(LocalDateTime.now());
        if (txnRef != null) invoice.setTransactionReference(txnRef);
        if (paymentMethod != null) invoice.setPaymentMethod(paymentMethod);

        return invoiceRepository.save(invoice);
    }

    @Transactional(readOnly = true)
    public List<SubscriptionNotification> getNotifications(String tenantId) {
        if (tenantId != null && !tenantId.trim().isEmpty()) {
            return notificationRepository.findByTenantIdOrderBySentAtDesc(tenantId);
        }
        return notificationRepository.findAllByOrderBySentAtDesc();
    }
}
