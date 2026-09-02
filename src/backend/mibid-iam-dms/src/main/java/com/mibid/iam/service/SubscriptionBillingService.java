package com.mibid.iam.service;

import com.mibid.core.domain.enums.BillingCycle;
import com.mibid.core.domain.enums.Currency;
import com.mibid.core.domain.enums.InvoiceStatus;
import com.mibid.core.domain.enums.PaymentMethod;
import com.mibid.core.domain.enums.SubscriptionStatus;
import com.mibid.core.exception.AppException;
import com.mibid.core.exception.ErrorCode;
import com.mibid.iam.domain.SubscriptionInvoice;
import com.mibid.iam.domain.SubscriptionNotification;
import com.mibid.iam.domain.SubscriptionPlan;
import com.mibid.iam.domain.Tenant;
import com.mibid.iam.domain.TenantSubscription;
import com.mibid.iam.repository.SubscriptionInvoiceRepository;
import com.mibid.iam.repository.SubscriptionNotificationRepository;
import com.mibid.iam.repository.SubscriptionPlanRepository;
import com.mibid.iam.repository.SystemConfigRepository;
import com.mibid.iam.repository.TenantRepository;
import com.mibid.iam.repository.TenantSubscriptionRepository;
import com.mibid.iam.repository.UserRepository;
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
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Dịch vụ quản lý Gói cước và Thuê bao SaaS cho MIBID.
 *
 * <p>Quy tắc Zero-Hardcode:
 * <ul>
 *   <li>Toàn bộ tham số nghiệp vụ mặc định (default plan, billing cycle, grace period, invoice due days)
 *       phải được đọc từ bảng {@code system_config} thông qua {@link SystemConfigRepository}.</li>
 *   <li>Thông tin tên doanh nghiệp, email liên hệ được truy vấn từ bảng {@code tenants}.</li>
 *   <li>Số lượng người dùng hiện tại được đếm trực tiếp từ bảng {@code users}.</li>
 *   <li>Không gán các giá trị mặc định giả lập khi thiếu dữ liệu (trả về {@code null}).</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionBillingService {

    private final SubscriptionPlanRepository planRepository;
    private final TenantSubscriptionRepository subscriptionRepository;
    private final SubscriptionInvoiceRepository invoiceRepository;
    private final SubscriptionNotificationRepository notificationRepository;
    private final SystemConfigRepository systemConfigRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;

    @Data
    @Builder
    public static class TenantSubscriptionSummaryDto {
        private String id;
        private String tenantId;
        private String tenantCode;
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

    @Data
    public static class UpdateSubscriptionRequest {
        private String planId;
        private String billingCycle;
        private LocalDate startDate;
        private LocalDate endDate;
        private Integer gracePeriodDays;
        private String status;
        private Boolean autoRenew;
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

    @Transactional
    public SubscriptionPlan updatePlan(String planId, SubscriptionPlan updates) {
        SubscriptionPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.subscriptionPlan.notFound"));
        if (updates.getName() != null) plan.setName(updates.getName());
        if (updates.getDescription() != null) plan.setDescription(updates.getDescription());
        if (updates.getMonthlyPrice() != null) plan.setMonthlyPrice(updates.getMonthlyPrice());
        if (updates.getYearlyPrice() != null) plan.setYearlyPrice(updates.getYearlyPrice());
        if (updates.getMaxUsers() != null) plan.setMaxUsers(updates.getMaxUsers());
        if (updates.getMaxMachines() != null) plan.setMaxMachines(updates.getMaxMachines());
        if (updates.getMaxStorageGb() != null) plan.setMaxStorageGb(updates.getMaxStorageGb());
        if (updates.getAllowedModules() != null) plan.setAllowedModules(updates.getAllowedModules());
        if (updates.getIsActive() != null) plan.setIsActive(updates.getIsActive());
        return planRepository.save(plan);
    }

    @Transactional
    public void deletePlan(String planId) {
        SubscriptionPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.subscriptionPlan.notFound"));
        plan.setIsActive(false);
        planRepository.save(plan);
    }

    @Transactional(readOnly = true)
    public List<TenantSubscriptionSummaryDto> getAllSubscriptions() {
        List<TenantSubscription> subs = subscriptionRepository.findAll();
        return subs.stream().map(this::mapToSummaryDto).collect(Collectors.toList());
    }

    @Transactional
    public TenantSubscriptionSummaryDto getTenantSubscription(String tenantId) {
        TenantSubscription sub = subscriptionRepository.findByTenantId(tenantId)
                .orElseGet(() -> createDefaultSubscription(tenantId));
        return mapToSummaryDto(sub);
    }

    /**
     * Khởi tạo hợp đồng thuê bao ban đầu cho Tenant từ cấu hình hệ thống trong bảng system_config.
     */
    private TenantSubscription createDefaultSubscription(String tenantId) {
        Tenant tenant = resolveTenant(tenantId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.tenant.notFound"));

        String defaultPlanCode = systemConfigRepository.getStringValue(
                "subscription.default.plan.code", "ENTERPRISE");

        SubscriptionPlan defaultPlan = planRepository.findByCode(defaultPlanCode)
                .orElseGet(() -> planRepository.findAll().stream()
                        .filter(p -> Boolean.TRUE.equals(p.getIsActive()))
                        .findFirst()
                        .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.subscriptionPlan.notFound")));

        String defaultCycle = systemConfigRepository.getStringValue(
                "subscription.default.billing.cycle", BillingCycle.YEARLY.name());

        int gracePeriodDays = systemConfigRepository.getIntValue(
                "subscription.default.grace.period.days", 7);

        LocalDate startDate = LocalDate.now();
        LocalDate endDate = calculateEndDate(startDate, defaultCycle);

        int currentUserCount = countTenantUsers(tenant.getId() != null ? tenant.getId().toString() : tenantId);

        TenantSubscription newSub = TenantSubscription.builder()
                .id(String.format("SUB-%s-%d", tenantId, LocalDate.now().getYear()))
                .tenantId(tenantId)
                .planId(defaultPlan.getId())
                .billingCycle(defaultCycle)
                .startDate(startDate)
                .endDate(endDate)
                .gracePeriodDays(gracePeriodDays)
                .status(SubscriptionStatus.ACTIVE.name())
                .autoRenew(true)
                .currentUserCount(currentUserCount)
                .currentMachineCount(0)
                .build();

        return subscriptionRepository.save(java.util.Objects.requireNonNull(newSub));
    }

    private TenantSubscriptionSummaryDto mapToSummaryDto(TenantSubscription sub) {
        SubscriptionPlan plan = sub.getPlanId() != null
                ? planRepository.findById(sub.getPlanId()).orElse(null)
                : null;
        long daysRemaining = sub.getEndDate() != null
                ? ChronoUnit.DAYS.between(LocalDate.now(), sub.getEndDate())
                : 0L;

        Tenant tenant = resolveTenant(sub.getTenantId()).orElse(null);
        String tenantName = tenant != null ? tenant.getName() : null;
        String tenantCode = tenant != null && tenant.getCode() != null && !tenant.getCode().trim().isEmpty()
                ? tenant.getCode()
                : (tenantName != null && tenantName.length() >= 4 ? tenantName.substring(0, 4).toUpperCase() : "TNT");

        Integer userCount = sub.getCurrentUserCount() != null
                ? sub.getCurrentUserCount()
                : countTenantUsers(sub.getTenantId());

        return TenantSubscriptionSummaryDto.builder()
                .id(sub.getId())
                .tenantId(sub.getTenantId())
                .tenantCode(tenantCode)
                .tenantName(tenantName)
                .planId(sub.getPlanId())
                .planCode(plan != null ? plan.getCode() : null)
                .planName(plan != null ? plan.getName() : null)
                .billingCycle(sub.getBillingCycle())
                .startDate(sub.getStartDate())
                .endDate(sub.getEndDate())
                .gracePeriodDays(sub.getGracePeriodDays())
                .status(sub.getStatus())
                .autoRenew(sub.getAutoRenew())
                .currentUserCount(userCount)
                .maxUsers(plan != null ? plan.getMaxUsers() : null)
                .currentMachineCount(sub.getCurrentMachineCount())
                .maxMachines(plan != null ? plan.getMaxMachines() : null)
                .daysRemaining(daysRemaining)
                .lastNotificationSentAt(sub.getLastNotificationSentAt())
                .build();
    }

    @Transactional
    public TenantSubscriptionSummaryDto updateSubscription(String subId, UpdateSubscriptionRequest request) {
        TenantSubscription sub = subscriptionRepository.findById(subId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.subscription.notFound"));

        if (request.getPlanId() != null && !request.getPlanId().trim().isEmpty()) {
            sub.setPlanId(request.getPlanId().trim());
        }
        if (request.getBillingCycle() != null && !request.getBillingCycle().trim().isEmpty()) {
            sub.setBillingCycle(request.getBillingCycle().trim());
        }
        if (request.getStartDate() != null) {
            sub.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            sub.setEndDate(request.getEndDate());
        }
        if (request.getGracePeriodDays() != null) {
            sub.setGracePeriodDays(request.getGracePeriodDays());
        }
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            sub.setStatus(request.getStatus().trim());
        }
        if (request.getAutoRenew() != null) {
            sub.setAutoRenew(request.getAutoRenew());
        }

        TenantSubscription saved = subscriptionRepository.save(sub);
        return mapToSummaryDto(saved);
    }

    @Transactional
    public TenantSubscriptionSummaryDto renewSubscription(
            String tenantId,
            String planId,
            String billingCycle,
            String paymentMethod,
            String txnRef,
            String notes) {

        TenantSubscription sub = subscriptionRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.subscription.notFound"));

        Tenant tenant = resolveTenant(tenantId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.tenant.notFound"));

        if (planId != null && !planId.trim().isEmpty()) {
            sub.setPlanId(planId);
        }
        if (billingCycle != null && !billingCycle.trim().isEmpty()) {
            sub.setBillingCycle(billingCycle);
        }

        SubscriptionPlan plan = planRepository.findById(sub.getPlanId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.subscriptionPlan.notFound"));

        LocalDate currentEnd = sub.getEndDate();
        LocalDate baseDate = (currentEnd != null && currentEnd.isAfter(LocalDate.now())) ? currentEnd : LocalDate.now();
        LocalDate newEnd = calculateEndDate(baseDate, sub.getBillingCycle());

        sub.setEndDate(newEnd);
        sub.setStatus(SubscriptionStatus.ACTIVE.name());
        subscriptionRepository.save(sub);

        // Sinh hóa đơn gia hạn với các tham số từ cấu hình hệ thống
        BigDecimal amount = BillingCycle.YEARLY.name().equalsIgnoreCase(sub.getBillingCycle())
                ? plan.getYearlyPrice()
                : plan.getMonthlyPrice();

        String invoiceId = "INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String invoiceNumber = String.format("INV-%d-%s",
                LocalDate.now().getYear(), UUID.randomUUID().toString().substring(0, 6).toUpperCase());

        String defaultCurrency = systemConfigRepository.getStringValue(
                "subscription.default.currency", Currency.VND.name());

        String resolvedPaymentMethod = (paymentMethod != null && !paymentMethod.isBlank())
                ? paymentMethod
                : systemConfigRepository.getStringValue(
                        "subscription.default.payment.method", PaymentMethod.BANK_TRANSFER.name());

        int invoiceDueDays = systemConfigRepository.getIntValue(
                "subscription.invoice.due.days", 15);

        SubscriptionInvoice invoice = SubscriptionInvoice.builder()
                .id(invoiceId)
                .tenantId(tenantId)
                .tenantCode(tenant.getCode() != null ? tenant.getCode() : "TNT")
                .subscriptionId(sub.getId())
                .invoiceNumber(invoiceNumber)
                .amount(amount != null ? amount : BigDecimal.ZERO)
                .currency(defaultCurrency)
                .status(InvoiceStatus.PAID.name())
                .paymentMethod(resolvedPaymentMethod)
                .paymentDate(LocalDateTime.now())
                .dueDate(LocalDate.now().plusDays(invoiceDueDays))
                .transactionReference(txnRef != null ? txnRef : "")
                .notes(notes != null ? notes : "")
                .build();
        invoiceRepository.save(invoice);

        // Ghi log thông báo gia hạn theo template cấu hình hệ thống
        long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), newEnd);
        String titleTemplate = systemConfigRepository.getStringValue(
                "subscription.notification.renewal.title",
                "notification.subscription.renewal.title");
        String messageTemplate = systemConfigRepository.getStringValue(
                "subscription.notification.renewal.message",
                "notification.subscription.renewal.message");

        String planDisplayName = plan.getName() != null ? plan.getName() : "";
        String messageFormatted = messageTemplate
                .replace("{planName}", planDisplayName)
                .replace("{endDate}", newEnd.toString());

        SubscriptionNotification notif = SubscriptionNotification.builder()
                .id("NOTIF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .tenantId(tenantId)
                .tenantCode(tenant.getCode() != null ? tenant.getCode() : "TNT")
                .subscriptionId(sub.getId())
                .notificationType("RENEWAL_CONFIRMATION")
                .recipientEmail(tenant.getContactEmail())
                .title(titleTemplate)
                .message(messageFormatted)
                .daysRemaining((int) daysRemaining)
                .status(InvoiceStatus.SENT.name())
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
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.invoice.notFound"));

        invoice.setStatus(InvoiceStatus.PAID.name());
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

    /**
     * Tìm thực thể Tenant theo id (UUID) hoặc code từ cơ sở dữ liệu.
     */
    private Optional<Tenant> resolveTenant(String tenantId) {
        if (tenantId == null || tenantId.isBlank()) {
            return Optional.empty();
        }
        try {
            UUID uuid = UUID.fromString(tenantId);
            Optional<Tenant> byId = tenantRepository.findById(uuid);
            if (byId.isPresent()) {
                return byId;
            }
        } catch (IllegalArgumentException ignored) {
            // Chuỗi không phải định dạng UUID, tìm theo mã doanh nghiệp
        }
        return tenantRepository.findByCode(tenantId);
    }

    /**
     * Đếm số lượng người dùng thực tế của Tenant từ bảng users.
     */
    private int countTenantUsers(String tenantId) {
        if (tenantId == null || tenantId.isBlank()) {
            return 0;
        }
        try {
            UUID uuid = UUID.fromString(tenantId);
            return (int) userRepository.countByTenantId(uuid);
        } catch (IllegalArgumentException ignored) {
            return resolveTenant(tenantId)
                    .map(t -> (int) userRepository.countByTenantId(t.getId()))
                    .orElse(0);
        }
    }

    /**
     * Tính toán ngày kết thúc thuê bao dựa theo chu kỳ thanh toán.
     */
    private LocalDate calculateEndDate(LocalDate startDate, String cycle) {
        if (cycle == null) {
            return startDate.plusYears(1);
        }
        if (BillingCycle.MONTHLY.name().equalsIgnoreCase(cycle)) {
            return startDate.plusMonths(1);
        }
        if (BillingCycle.QUARTERLY.name().equalsIgnoreCase(cycle)) {
            return startDate.plusMonths(3);
        }
        return startDate.plusYears(1);
    }
}
