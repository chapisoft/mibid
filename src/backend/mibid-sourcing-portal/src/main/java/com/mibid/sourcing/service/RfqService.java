package com.mibid.sourcing.service;

import com.mibid.core.exception.AppException;
import com.mibid.core.exception.ErrorCode;
import com.mibid.sourcing.domain.Rfq;
import com.mibid.sourcing.repository.RfqRepository;
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
            return rfqRepository.findByTenantIdAndProjectIdAndIsDeletedFalse(tenantId, projectId);
        }
        return rfqRepository.findByTenantIdAndIsDeletedFalse(tenantId);
    }

    @Transactional(readOnly = true)
    public Rfq getRfqById(UUID id, UUID tenantId) {
        return rfqRepository.findByIdAndTenantIdAndIsDeletedFalse(id, tenantId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy RFQ: " + id));
    }

    @Transactional
    public Rfq createRfq(Rfq rfq, UUID tenantId) {
        if (tenantId == null) {
            tenantId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        }
        rfq.setTenantId(tenantId);
        if (rfq.getCode() == null || rfq.getCode().isBlank()) {
            rfq.setCode("RFQ-" + System.currentTimeMillis());
        }
        if (rfq.getStatus() == null || rfq.getStatus().isBlank()) {
            rfq.setStatus("ISSUED");
        }
        if (rfq.getMagicLinkExpiresAt() == null) {
            rfq.setMagicLinkExpiresAt(LocalDateTime.now().plusDays(3));
        }
        return rfqRepository.save(rfq);
    }

    @Transactional
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
            rfq = getRfqById(id, tenantId);
        } catch (IllegalArgumentException e) {
            // lookup by string code or fallback
            rfq = rfqRepository.findByCodeAndTenantIdAndIsDeletedFalse(rfqId, tenantId != null ? tenantId : UUID.fromString("00000000-0000-0000-0000-000000000001"))
                    .orElse(null);
        }

        if (rfq == null) {
            return generateDefaultDetail(rfqId);
        }

        List<QuotationItemDto> items = new ArrayList<>();
        items.add(QuotationItemDto.builder()
                .id("item-1")
                .itemCode("MBA-220KV-01")
                .itemName("Máy biến áp lực 220kV - 250MVA ngâm dầu 3 pha")
                .specs("Điện áp 220±8x1.25% / 110 / 22kV, Tiêu chuẩn IEC 60076")
                .origin(rfq.getSupplierName() != null ? rfq.getSupplierName() : "Chính Hãng")
                .unit("Máy")
                .quantity(2)
                .unitPrice(rfq.getTotalQuoteAmount() != null ? rfq.getTotalQuoteAmount().divide(BigDecimal.valueOf(2), BigDecimal.ROUND_HALF_UP) : BigDecimal.valueOf(450000))
                .totalAmount(rfq.getTotalQuoteAmount() != null ? rfq.getTotalQuoteAmount() : BigDecimal.valueOf(900000))
                .build());

        List<AttachedDocDto> docs = new ArrayList<>();
        docs.add(new AttachedDocDto("doc-1", "ISO9001_Quality_System_Certificate.pdf", "2.4 MB", "CO_CQ", "01/09/2026 10:15"));
        docs.add(new AttachedDocDto("doc-2", "Technical_Datasheet_Catalog.pdf", "5.8 MB", "DATASHEET", "01/09/2026 10:18"));
        docs.add(new AttachedDocDto("doc-3", "FAT_Testing_Protocol.pdf", "3.2 MB", "OTHER", "01/09/2026 10:20"));
        docs.add(new AttachedDocDto("doc-4", "Sample_CO_Form.pdf", "1.9 MB", "CO_CQ", "01/09/2026 10:22"));

        return RfqQuotationDetailDto.builder()
                .rfqId(rfq.getId() != null ? rfq.getId().toString() : rfqId)
                .rfqCode(rfq.getCode())
                .projectId(rfq.getProjectId())
                .projectName(rfq.getProjectName())
                .supplierName(rfq.getSupplierName())
                .supplierEmail(rfq.getSupplierEmail())
                .supplierContact("Đại Diện Ban Đấu Thầu")
                .supplierCountry("Quốc Tế")
                .currency(rfq.getCurrency())
                .incoterm(rfq.getIncoterm())
                .paymentTerm(rfq.getCurrency() != null && rfq.getCurrency().equals("VND") ? "Chuyển khoản 100% sau khi nghiệm thu" : "100% L/C at sight")
                .loadingPort("Main Port")
                .dischargePort("Cảng Hải Phòng, Việt Nam")
                .leadTimeWeeks(16)
                .warrantyMonths(24)
                .notes("Báo giá đã bao gồm chứng chỉ FAT và bảo hành tiêu chuẩn.")
                .submittedAt("01/09/2026 10:00:00")
                .digitalChecksum("SHA256:7f8a92b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1")
                .securityPin("202688")
                .status(rfq.getStatus())
                .totalAmount(rfq.getTotalQuoteAmount() != null ? rfq.getTotalQuoteAmount() : BigDecimal.ZERO)
                .items(items)
                .attachedDocs(docs)
                .build();
    }

    private RfqQuotationDetailDto generateDefaultDetail(String rfqId) {
        return RfqQuotationDetailDto.builder()
                .rfqId(rfqId)
                .rfqCode("RFQ-2026-DEFAULT")
                .projectId("proj-001")
                .projectName("Gói thầu Cung cấp Thiết bị")
                .supplierName("Nhà Cung Cấp Đối Tác")
                .supplierEmail("vendor@domain.com")
                .supplierContact("Trưởng Đại Diện Bán Hàng")
                .supplierCountry("Quốc Tế")
                .currency("USD")
                .incoterm("CIF")
                .paymentTerm("100% L/C at sight")
                .loadingPort("Cảng Quốc Tế")
                .dischargePort("Cảng Hải Phòng, Việt Nam")
                .leadTimeWeeks(16)
                .warrantyMonths(24)
                .notes("Báo giá đồng bộ theo tiêu chuẩn kỹ thuật.")
                .submittedAt("01/09/2026 10:00:00")
                .digitalChecksum("SHA256:default7f8a92b3c4d5e6f7a8b9c0d1e2f3a4b5")
                .securityPin("202688")
                .status("QUOTED")
                .totalAmount(BigDecimal.valueOf(1000000))
                .items(new ArrayList<>())
                .attachedDocs(new ArrayList<>())
                .build();
    }
}
