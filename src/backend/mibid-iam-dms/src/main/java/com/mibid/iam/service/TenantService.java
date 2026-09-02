package com.mibid.iam.service;

import com.mibid.core.domain.enums.TenantStatus;
import com.mibid.core.domain.enums.UserStatus;
import com.mibid.core.exception.AppException;
import com.mibid.core.exception.ErrorCode;
import com.mibid.iam.domain.SubscriptionPlan;
import com.mibid.iam.domain.Tenant;
import com.mibid.iam.domain.TenantMember;
import com.mibid.iam.domain.TenantSubscription;
import com.mibid.iam.domain.User;
import com.mibid.iam.repository.SubscriptionPlanRepository;
import com.mibid.iam.repository.TenantMemberRepository;
import com.mibid.iam.repository.TenantRepository;
import com.mibid.iam.repository.TenantSubscriptionRepository;
import com.mibid.iam.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;
    private final TenantMemberRepository tenantMemberRepository;
    private final UserRepository userRepository;
    private final TenantSubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository planRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TenantSummaryDto {
        private UUID id;
        private String code;
        private String name;
        private String taxCode;
        private String contactEmail;
        private String contactPhone;
        private String status;
        private int storageQuotaGb;
        private String subscriptionPlan;
        private String planCode;
        private int userCount;
        private int activeProjects;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TenantMemberItemDto {
        private UUID userId;
        private String username;
        private String email;
        private String fullName;
        private String role;
        private String department;
        private String position;
        private String status;
        private boolean isDefault;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TenantMembersDto {
        private UUID tenantId;
        private String tenantCode;
        private String tenantName;
        private String planCode;
        private String planName;
        private int currentUserCount;
        private int maxUsers;
        private boolean isQuotaExceeded;
        private List<TenantMemberItemDto> members;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AddTenantMemberRequest {
        private String username;
        private String email;
        private String fullName;
        private String role;
        private String department;
        private String position;
    }

    @Transactional(readOnly = true)
    public List<Tenant> getAllTenants() {
        return tenantRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<TenantSummaryDto> getAllTenantsSummary() {
        List<Tenant> tenants = tenantRepository.findAll();
        List<TenantSummaryDto> dtos = new ArrayList<>();

        for (Tenant tenant : tenants) {
            String planName = "Gói Khởi Động Đấu Thầu (Starter)";
            String planCode = "STARTER";

            Optional<TenantSubscription> subOpt = subscriptionRepository.findByTenantId(tenant.getId().toString());
            if (subOpt.isPresent()) {
                Optional<SubscriptionPlan> planOpt = planRepository.findById(subOpt.get().getPlanId());
                if (planOpt.isPresent()) {
                    planName = planOpt.get().getName();
                    planCode = planOpt.get().getCode();
                }
            }

            long memberCount = tenantMemberRepository.countByTenantId(tenant.getId());
            if (memberCount == 0) {
                memberCount = userRepository.countByTenantId(tenant.getId());
            }

            long activeProjects = 0;
            try {
                Number count = (Number) entityManager.createNativeQuery(
                        "SELECT COUNT(*) FROM projects WHERE tenant_id = :tenantId AND (is_deleted = false OR is_deleted IS NULL)")
                        .setParameter("tenantId", tenant.getId())
                        .getSingleResult();
                activeProjects = count != null ? count.longValue() : 0;
            } catch (Exception ignored) {
            }

            dtos.add(TenantSummaryDto.builder()
                    .id(tenant.getId())
                    .code(tenant.getCode())
                    .name(tenant.getName())
                    .taxCode(tenant.getTaxCode())
                    .contactEmail(tenant.getContactEmail())
                    .contactPhone(tenant.getContactPhone())
                    .status(tenant.getStatus())
                    .storageQuotaGb(tenant.getStorageQuotaGb())
                    .subscriptionPlan(planName)
                    .planCode(planCode)
                    .userCount((int) memberCount)
                    .activeProjects((int) activeProjects)
                    .build());
        }
        return dtos;
    }

    @Transactional(readOnly = true)
    public Tenant getTenantById(UUID id) {
        return tenantRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.tenant.notFound"));
    }

    @Transactional(readOnly = true)
    public TenantMembersDto getTenantMembers(UUID tenantId) {
        Tenant tenant = getTenantById(tenantId);

        // Lấy thông tin Subscription & Plan
        Optional<TenantSubscription> subOpt = subscriptionRepository.findByTenantId(tenantId.toString());
        int maxUsers = 10;
        String planCode = "DEFAULT";
        String planName = "Gói Tiêu Chuẩn (Standard)";

        if (subOpt.isPresent()) {
            TenantSubscription sub = subOpt.get();
            Optional<SubscriptionPlan> planOpt = planRepository.findById(sub.getPlanId());
            if (planOpt.isPresent()) {
                SubscriptionPlan plan = planOpt.get();
                maxUsers = plan.getMaxUsers() != null ? plan.getMaxUsers() : 10;
                planCode = plan.getCode();
                planName = plan.getName();
            }
        }

        // Lấy danh sách thành viên từ tenant_members
        List<TenantMember> tmList = tenantMemberRepository.findByTenantId(tenantId);
        List<TenantMemberItemDto> members = new ArrayList<>();

        for (TenantMember tm : tmList) {
            userRepository.findById(tm.getUserId()).ifPresent(u -> {
                members.add(TenantMemberItemDto.builder()
                        .userId(u.getId())
                        .username(u.getUsername())
                        .email(u.getEmail())
                        .fullName(u.getFullName())
                        .role(tm.getRole())
                        .department(u.getDepartment())
                        .position(u.getPosition())
                        .status(u.getStatus())
                        .isDefault(tm.isDefault())
                        .build());
            });
        }

        // Nếu bảng tenant_members rỗng, fallback lấy theo users.tenant_id
        if (members.isEmpty()) {
            List<User> userList = userRepository.findByTenantId(tenantId);
            for (User u : userList) {
                members.add(TenantMemberItemDto.builder()
                        .userId(u.getId())
                        .username(u.getUsername())
                        .email(u.getEmail())
                        .fullName(u.getFullName())
                        .role(u.getRole())
                        .department(u.getDepartment())
                        .position(u.getPosition())
                        .status(u.getStatus())
                        .isDefault(true)
                        .build());
            }
        }

        int currentUsers = members.size();
        boolean isQuotaExceeded = currentUsers >= maxUsers;

        return TenantMembersDto.builder()
                .tenantId(tenant.getId())
                .tenantCode(tenant.getCode())
                .tenantName(tenant.getName())
                .planCode(planCode)
                .planName(planName)
                .currentUserCount(currentUsers)
                .maxUsers(maxUsers)
                .isQuotaExceeded(isQuotaExceeded)
                .members(members)
                .build();
    }

    @Transactional
    public TenantMemberItemDto addMemberToTenant(UUID tenantId, AddTenantMemberRequest request) {
        Tenant tenant = getTenantById(tenantId);

        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Tên đăng nhập không được để trống");
        }
        if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Họ và tên không được để trống");
        }

        // 1. Kiểm tra hạn mức Quota của Tenant
        TenantMembersDto currentStatus = getTenantMembers(tenantId);
        if (currentStatus.getCurrentUserCount() >= currentStatus.getMaxUsers()) {
            throw new AppException(ErrorCode.TENANT_USER_QUOTA_EXCEEDED,
                    "Doanh nghiệp đã đạt giới hạn tối đa " + currentStatus.getMaxUsers() + " người dùng của " + currentStatus.getPlanName() + ". Vui lòng nâng cấp gói dịch vụ để bổ sung thêm thành viên.");
        }

        String username = request.getUsername().trim().toLowerCase();
        String email = request.getEmail() != null && !request.getEmail().trim().isEmpty()
                ? request.getEmail().trim().toLowerCase()
                : username + "@" + (tenant.getCode() != null ? tenant.getCode().toLowerCase() : "mibid") + ".vn";

        // 2. Tìm hoặc Tạo mới User
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(email))
                .orElse(null);

        if (user == null) {
            user = User.builder()
                    .username(username)
                    .email(email)
                    .fullName(request.getFullName().trim())
                    .role(request.getRole() != null ? request.getRole() : "VIEWER")
                    .status(UserStatus.ACTIVE.name())
                    .passwordHash("$2a$12$LJ3et7vOJnTjVp5JDXjXke8YEjL8pZcxUHOOb7sXkGj6QaZrH0xKK") // MibidSecure2026!
                    .build();
            user.setTenantId(tenantId);
            user.setDepartment(request.getDepartment());
            user.setPosition(request.getPosition());
            user = userRepository.save(user);
        }

        // 3. Gán quyền vào tenant_members
        Optional<TenantMember> tmOpt = tenantMemberRepository.findByTenantIdAndUserId(tenantId, user.getId());
        TenantMember tm;
        if (tmOpt.isPresent()) {
            tm = tmOpt.get();
            if (request.getRole() != null) tm.setRole(request.getRole());
        } else {
            tm = TenantMember.builder()
                    .tenantId(tenantId)
                    .userId(user.getId())
                    .role(request.getRole() != null ? request.getRole() : user.getRole())
                    .isDefault(false)
                    .build();
        }
        tenantMemberRepository.save(tm);

        // 4. Cập nhật current_user_count trong subscription
        subscriptionRepository.findByTenantId(tenantId.toString()).ifPresent(sub -> {
            sub.setCurrentUserCount(currentStatus.getCurrentUserCount() + 1);
            subscriptionRepository.save(sub);
        });

        return TenantMemberItemDto.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(tm.getRole())
                .department(user.getDepartment())
                .position(user.getPosition())
                .status(user.getStatus())
                .isDefault(tm.isDefault())
                .build();
    }

    @Transactional
    public Tenant createTenant(Tenant tenant) {
        if (tenantRepository.findByCode(tenant.getCode()).isPresent()) {
            throw new AppException(ErrorCode.RESOURCE_CONFLICT, "error.tenant.codeConflict");
        }
        tenant.setStatus(TenantStatus.ACTIVE.name());
        return tenantRepository.save(tenant);
    }

    @Transactional
    public Tenant updateTenant(UUID id, Tenant updates) {
        Tenant existing = getTenantById(id);
        if (updates.getName() != null) existing.setName(updates.getName());
        if (updates.getTaxCode() != null) existing.setTaxCode(updates.getTaxCode());
        if (updates.getContactEmail() != null) existing.setContactEmail(updates.getContactEmail());
        if (updates.getContactPhone() != null) existing.setContactPhone(updates.getContactPhone());
        if (updates.getStatus() != null) existing.setStatus(updates.getStatus());
        if (updates.getStorageQuotaGb() > 0) existing.setStorageQuotaGb(updates.getStorageQuotaGb());
        return tenantRepository.save(existing);
    }

    @Transactional
    public void deleteTenant(UUID id) {
        Tenant existing = getTenantById(id);
        tenantRepository.delete(existing);
    }

    @Transactional
    public void removeMemberFromTenant(UUID tenantId, UUID userId) {
        Tenant tenant = getTenantById(tenantId);
        tenantMemberRepository.deleteByTenantIdAndUserId(tenantId, userId);

        // Cập nhật current_user_count trong subscription
        subscriptionRepository.findByTenantId(tenantId.toString()).ifPresent(sub -> {
            long count = tenantMemberRepository.countByTenantId(tenantId);
            if (count == 0) {
                count = userRepository.countByTenantId(tenantId);
            }
            sub.setCurrentUserCount((int) count);
            subscriptionRepository.save(sub);
        });
    }
}
