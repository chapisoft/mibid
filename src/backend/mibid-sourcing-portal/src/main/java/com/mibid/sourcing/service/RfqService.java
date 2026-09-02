package com.mibid.sourcing.service;

import com.mibid.core.domain.enums.RfqStatus;
import com.mibid.core.exception.AppException;
import com.mibid.core.exception.ErrorCode;
import com.mibid.sourcing.domain.Rfq;
import com.mibid.sourcing.domain.RfqSubmission;
import com.mibid.sourcing.domain.RfqVendor;
import com.mibid.sourcing.domain.SupplierPartner;
import com.mibid.sourcing.dto.CreateRfqInvitationRequest;
import com.mibid.sourcing.dto.RfqInvitationDto;
import com.mibid.sourcing.repository.RfqLineItemRepository;
import com.mibid.sourcing.repository.RfqRepository;
import com.mibid.sourcing.repository.RfqSubmissionRepository;
import com.mibid.sourcing.repository.RfqVendorRepository;
import com.mibid.sourcing.repository.SupplierPartnerRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RfqService {

    private final RfqRepository rfqRepository;
    private final RfqLineItemRepository rfqLineItemRepository;
    private final RfqSubmissionRepository rfqSubmissionRepository;
    private final RfqVendorRepository rfqVendorRepository;
    private final SupplierPartnerRepository supplierPartnerRepository;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuotationItemDto {
        private String id;
        private String itemCode;
        private String itemName;
        private String specs;
        private String origin;
        private String unit;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalAmount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttachedDocDto {
        private String id;
        private String name;
        private String size;
        private String type;
        private String uploadedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RfqQuotationDetailDto {
        private String rfqId;
        private String rfqCode;
        private String projectId;
        private String projectName;
        private String supplierName;
        private String supplierEmail;
        private String supplierContact;
        private String supplierCountry;
        private String currency;
        private String incoterm;
        private String paymentTerm;
        private String loadingPort;
        private String dischargePort;
        private Integer leadTimeWeeks;
        private Integer warrantyMonths;
        private String notes;
        private String submittedAt;
        private String digitalChecksum;
        private String securityPin;
        private String status;
        private BigDecimal totalAmount;
        private List<QuotationItemDto> items;
        private List<AttachedDocDto> attachedDocs;
    }

    @Transactional(readOnly = true)
    public List<Rfq> getRfqs(UUID tenantId, String projectId) {
        if (projectId != null && !projectId.equalsIgnoreCase("ALL") && !projectId.isBlank()) {
            try {
                UUID pid = UUID.fromString(projectId);
                return rfqRepository.findByTenantIdAndProjectIdAndIsDeletedFalse(tenantId, pid);
            } catch (IllegalArgumentException ignored) {
            }
        }
        return rfqRepository.findByTenantIdAndIsDeletedFalse(tenantId);
    }

    @Transactional(readOnly = true)
    public Rfq getRfqById(UUID id, UUID tenantId) {
        return rfqRepository.findByIdAndTenantIdAndIsDeletedFalse(id, tenantId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.rfq.notFound"));
    }

    @Transactional
    public Rfq createRfq(Rfq rfq, UUID tenantId) {
        if (tenantId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "error.rfq.tenantIdRequired");
        }
        rfq.setTenantId(tenantId);
        if (rfq.getCode() == null || rfq.getCode().isBlank()) {
            rfq.setCode("RFQ-" + System.currentTimeMillis());
        }
        if (rfq.getStatus() == null || rfq.getStatus().isBlank()) {
            rfq.setStatus(RfqStatus.ISSUED.name());
        }
        if (rfq.getMagicLinkExpiresAt() == null) {
            rfq.setMagicLinkExpiresAt(LocalDateTime.now().plusDays(3));
        }
        return rfqRepository.save(rfq);
    }

    @Transactional
    public RfqInvitationDto createRfqWithVendorInvitation(CreateRfqInvitationRequest req, UUID tenantId) {
        if (tenantId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "error.rfq.tenantIdRequired");
        }
        if (req.getProjectId() == null || req.getVendorId() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "error.rfq.invalidParams");
        }

        // 1. Tra cứu Nhà Cung Cấp / Đối tác từ CSDL
        SupplierPartner partner = supplierPartnerRepository.findByIdAndTenantIdAndIsDeletedFalse(req.getVendorId(), tenantId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.partner.notFound"));

        // 2. Ràng buộc: Kiểm tra xem Vendor này đã được mời vào dự án này chưa
        boolean alreadyInvited = rfqRepository.existsByProjectIdAndSupplierEmail(tenantId, req.getProjectId(), partner.getEmail());
        if (alreadyInvited) {
            throw new AppException(ErrorCode.RESOURCE_CONFLICT, "error.rfq.vendorAlreadyInvited");
        }

        // 3. Tạo bản ghi RFQ trong bảng rfqs từ dữ liệu thực tế gửi lên
        String rfqCode = (req.getRfqCode() != null && !req.getRfqCode().isBlank()) 
                ? req.getRfqCode() 
                : ("RFQ-" + System.currentTimeMillis());

        Rfq rfq = Rfq.builder()
                .tenantId(tenantId)
                .projectId(req.getProjectId())
                .projectName(req.getProjectName())
                .code(rfqCode)
                .rfqCode(rfqCode)
                .title(req.getTitle())
                .supplierName(partner.getName())
                .supplierEmail(partner.getEmail())
                .itemCount(req.getItemCount())
                .currency(req.getCurrency() != null ? req.getCurrency().name() : null)
                .incoterm(req.getIncoterm() != null ? req.getIncoterm().name() : null)
                .incoterms(req.getIncoterm() != null ? req.getIncoterm().name() : null)
                .status(RfqStatus.ISSUED.name())
                .submissionDeadline(req.getSubmissionDeadline())
                .magicLinkExpiresAt(req.getSubmissionDeadline())
                .build();
        rfq = rfqRepository.save(java.util.Objects.requireNonNull(rfq));

        // 4. Sinh Mã Thư Mời duy nhất (invitation_code) và Mã PIN 6 số riêng biệt
        String invitationCode = "INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String rawPin = String.format("%06d", new java.security.SecureRandom().nextInt(1000000));
        String salt = UUID.randomUUID().toString().substring(0, 16);
        String pinHash = computeSha256(rawPin + ":" + salt);

        // 5. Lưu thông tin lời mời vào bảng rfq_vendors
        RfqVendor rfqVendor = RfqVendor.builder()
                .tenantId(tenantId)
                .rfqId(rfq.getId())
                .vendorEmail(partner.getEmail())
                .vendorName(partner.getContactPerson() != null ? partner.getContactPerson() : partner.getName())
                .companyName(partner.getName())
                .phone(partner.getPhone())
                .country(partner.getCountry())
                .category(partner.getCategory())
                .status(com.mibid.core.domain.enums.RfqVendorStatus.INVITED.name())
                .invitationCode(invitationCode)
                .pinHash(pinHash)
                .pinSalt(salt)
                .pinAttempts(0)
                .invitedAt(LocalDateTime.now())
                .build();
        rfqVendorRepository.save(java.util.Objects.requireNonNull(rfqVendor));

        return RfqInvitationDto.builder()
                .rfqId(rfq.getId())
                .rfqCode(rfq.getCode())
                .projectId(rfq.getProjectId())
                .projectName(rfq.getProjectName())
                .vendorId(partner.getId())
                .vendorName(partner.getContactPerson() != null ? partner.getContactPerson() : partner.getName())
                .vendorEmail(partner.getEmail())
                .companyName(partner.getName())
                .country(partner.getCountry())
                .incoterm(rfq.getIncoterm())
                .currency(rfq.getCurrency())
                .itemCount(rfq.getItemCount())
                .invitationCode(invitationCode)
                .securityPin(rawPin)
                .portalUrl("/vendor/rfq/" + invitationCode)
                .status(rfq.getStatus())
                .invitedAt(rfqVendor.getInvitedAt())
                .build();
    }

    private String computeSha256(String input) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "error.security.hashFailed");
        }
    }

    @Transactional
    @SuppressWarnings("null")
    public Rfq updateRfq(UUID id, Rfq updates, UUID tenantId) {
        Rfq existing = getRfqById(id, tenantId);

        if (updates.getCode() != null) existing.setCode(updates.getCode());
        if (updates.getTitle() != null) existing.setTitle(updates.getTitle());
        if (updates.getProjectId() != null) existing.setProjectId(updates.getProjectId());
        if (updates.getProjectName() != null) existing.setProjectName(updates.getProjectName());
        if (updates.getSupplierName() != null) existing.setSupplierName(updates.getSupplierName());
        if (updates.getSupplierEmail() != null) existing.setSupplierEmail(updates.getSupplierEmail());
        if (updates.getItemCount() != null) existing.setItemCount(updates.getItemCount());
        if (updates.getCurrency() != null) existing.setCurrency(updates.getCurrency());
        if (updates.getIncoterm() != null) existing.setIncoterm(updates.getIncoterm());
        if (updates.getTotalQuoteAmount() != null) existing.setTotalQuoteAmount(updates.getTotalQuoteAmount());
        if (updates.getStatus() != null) existing.setStatus(updates.getStatus());
        if (updates.getSubmissionDeadline() != null) existing.setSubmissionDeadline(updates.getSubmissionDeadline());

        return rfqRepository.save(existing);
    }

    @Transactional
    public void deleteRfq(UUID id, UUID tenantId) {
        Rfq existing = getRfqById(id, tenantId);
        existing.setDeleted(true);
        rfqRepository.save(existing);
    }

    @Transactional(readOnly = true)
    public RfqQuotationDetailDto getQuotationDetail(String rfqId, UUID tenantId) {
        Rfq rfq;
        try {
            UUID id = UUID.fromString(rfqId);
            rfq = rfqRepository.findByIdAndTenantIdAndIsDeletedFalse(id, tenantId).orElse(null);
        } catch (IllegalArgumentException e) {
            rfq = rfqId != null ? rfqRepository.findByCodeAndTenantIdAndIsDeletedFalse(rfqId, tenantId).orElse(null) : null;
        }

        if (rfq == null) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.rfq.notFound");
        }

        // Truy vấn trực tiếp từ CSDL — không khởi tạo dữ liệu giả lập
        final Rfq finalRfq = rfq;
        List<QuotationItemDto> items = rfqLineItemRepository.findByRfqIdAndIsDeletedFalse(finalRfq.getId())
                .stream()
                .map(li -> QuotationItemDto.builder()
                        .id(li.getId() != null ? li.getId().toString() : "")
                        .itemCode(li.getItemCode())
                        .itemName(li.getDescription())
                        .specs(li.getSpecifications())
                        .origin(li.getOriginCountry())
                        .unit(li.getUom())
                        .quantity(li.getQuantity() != null ? li.getQuantity().intValue() : 0)
                        .unitPrice(li.getTargetUnitPrice() != null ? li.getTargetUnitPrice() : BigDecimal.ZERO)
                        .totalAmount(li.getTargetUnitPrice() != null && li.getQuantity() != null
                                ? li.getTargetUnitPrice().multiply(li.getQuantity()) : BigDecimal.ZERO)
                        .build())
                .collect(java.util.stream.Collectors.toList());

        // Truy vấn submission mới nhất từ bảng rfq_submissions (dữ liệu do vendor nộp)
        // Nếu chưa có submission → trả null để FE biết vendor chưa nộp báo giá
        RfqSubmission submission = rfqSubmissionRepository
                .findTopByRfqIdOrderBySubmittedAtDesc(rfq.getId())
                .orElse(null);

        return RfqQuotationDetailDto.builder()
                .rfqId(rfq.getId() != null ? rfq.getId().toString() : rfqId)
                .rfqCode(rfq.getCode())
                .projectId(rfq.getProjectId() != null ? rfq.getProjectId().toString() : null)
                .projectName(rfq.getProjectName())
                .supplierName(rfq.getSupplierName())
                .supplierEmail(rfq.getSupplierEmail())
                // Các field từ bảng rfq_submissions (do vendor điền khi nộp báo giá)
                .supplierContact(submission != null ? submission.getSupplierContact() : null)
                .supplierCountry(submission != null ? submission.getSupplierCountry() : null)
                .currency(submission != null ? submission.getCurrency() : rfq.getCurrency())
                .incoterm(submission != null ? submission.getIncoterm() : rfq.getIncoterm())
                .paymentTerm(submission != null ? submission.getPaymentTerm() : null)
                .loadingPort(submission != null ? submission.getLoadingPort() : null)
                .dischargePort(submission != null ? submission.getDischargePort() : null)
                .leadTimeWeeks(submission != null ? submission.getLeadTimeWeeks() : null)
                .warrantyMonths(submission != null ? submission.getWarrantyMonths() : null)
                .notes(submission != null ? submission.getNotes() : null)
                .submittedAt(submission != null && submission.getSubmittedAt() != null
                        ? submission.getSubmittedAt().toString() : null)
                .digitalChecksum(submission != null ? submission.getDigitalChecksum() : null)
                .securityPin(null) // Tuyệt đối không trả PIN hash về FE
                .status(rfq.getStatus())
                .totalAmount(submission != null && submission.getTotalAmount() != null
                        ? submission.getTotalAmount()
                        : (rfq.getTotalQuoteAmount() != null ? rfq.getTotalQuoteAmount() : null))
                .items(items)
                .attachedDocs(new ArrayList<>())
                .build();
    }
}
