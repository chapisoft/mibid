package com.mibid.sourcing.service;

import com.mibid.core.domain.enums.Currency;
import com.mibid.core.domain.enums.Incoterm;
import com.mibid.core.domain.enums.PaymentTerm;
import com.mibid.core.domain.enums.PortalAuthStatus;
import com.mibid.core.domain.enums.RfqStatus;
import com.mibid.core.exception.AppException;
import com.mibid.core.exception.ErrorCode;
import com.mibid.security.jwt.JwtTokenProvider;
import com.mibid.sourcing.domain.Rfq;
import com.mibid.sourcing.domain.RfqLineItem;
import com.mibid.sourcing.domain.RfqVendor;
import com.mibid.sourcing.repository.RfqLineItemRepository;
import com.mibid.sourcing.repository.RfqRepository;
import com.mibid.sourcing.repository.RfqVendorRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class VendorPortalService {

    private final RfqRepository rfqRepository;
    private final RfqVendorRepository rfqVendorRepository;
    private final RfqLineItemRepository rfqLineItemRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerifyPinRequest {
        private String token;
        private String pinCode;
        private String captchaToken;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerifyPinResponse {
        private boolean success;
        private ErrorCode errorCode;
        private PortalAuthStatus status;
        private String sessionToken;
        private boolean isLocked;
        private Integer lockoutSeconds;
        private Integer remainingAttempts;
        private boolean isCaptchaRequired;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuoteSubmissionRequest {
        private Currency currency;
        private Incoterm incoterm;
        private PaymentTerm paymentTerm;
        private String loadingPort;
        private String dischargePort;
        private Integer leadTime;
        private Integer warranty;
        private String notes;
        private Map<String, String> prices;
        private Map<String, String> origins;
        private List<RfqService.AttachedDocDto> attachedFiles;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmissionReceiptDto {
        private String receiptCode;
        private String rfqCode;
        private RfqStatus status;
        private String submittedAt;
        private String digitalChecksum;
        private BigDecimal totalAmount;
    }

    @Transactional
    public VerifyPinResponse verifyPin(VerifyPinRequest req) {
        String token = req.getToken() != null ? req.getToken().trim() : "";
        String pin = req.getPinCode() != null ? req.getPinCode().trim() : "";

        if (token.isEmpty() || pin.isEmpty()) {
            return VerifyPinResponse.builder()
                    .success(false)
                    .errorCode(ErrorCode.PIN_REQUIRED)
                    .status(PortalAuthStatus.UNAUTHORIZED)
                    .build();
        }

        // Truy vấn đối chiếu dữ liệu mời thầu của Vendor từ CSDL PostgreSQL
        Optional<RfqVendor> vendorOpt = rfqVendorRepository.findByInvitationCodeAndIsDeletedFalse(token);
        
        // Nếu không tìm thấy qua mã mời thầu trực tiếp, tra cứu qua RFQ ID / Code
        if (vendorOpt.isEmpty()) {
            Optional<Rfq> rfqOpt = findRfqByCodeOrId(token);
            if (rfqOpt.isPresent()) {
                List<RfqVendor> list = rfqVendorRepository.findByRfqIdAndIsDeletedFalse(rfqOpt.get().getId());
                if (!list.isEmpty()) {
                    vendorOpt = Optional.of(list.get(0));
                }
            }
        }

        if (vendorOpt.isEmpty()) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.rfq.vendorNotFound");
        }

        RfqVendor vendor = vendorOpt.get();
        LocalDateTime now = LocalDateTime.now();

        // 1. Kiểm tra trạng thái khóa do Rate Limit (Nhập sai >= 5 lần)
        if (vendor.getPinLockedUntil() != null && vendor.getPinLockedUntil().isAfter(now)) {
            long diffSec = java.time.Duration.between(now, vendor.getPinLockedUntil()).getSeconds();
            return VerifyPinResponse.builder()
                    .success(false)
                    .errorCode(ErrorCode.MAGIC_LINK_LOCKED)
                    .status(PortalAuthStatus.LOCKED)
                    .isLocked(true)
                    .lockoutSeconds((int) Math.max(1, diffSec))
                    .remainingAttempts(0)
                    .build();
        }

        // 2. Đối chiếu mã PIN từ CSDL thông qua thuật toán băm bảo mật SHA-256 + Salt
        boolean isValidPin = matchesPin(pin, vendor.getPinHash(), vendor.getPinSalt());

        if (isValidPin) {
            // Đăng nhập thành công -> Reset số lần nhập sai trong CSDL
            vendor.setPinAttempts(0);
            vendor.setPinLockedUntil(null);
            vendor.setStatus(PortalAuthStatus.AUTHENTICATED.name());
            vendor.setRespondedAt(now);
            rfqVendorRepository.save(vendor);

            UUID tenantId = vendor.getTenantId();
            UUID rfqId = vendor.getRfqId();
            if (tenantId == null && rfqId != null) {
                Optional<Rfq> rfqOpt = rfqRepository.findById(rfqId);
                if (rfqOpt.isPresent()) {
                    tenantId = rfqOpt.get().getTenantId();
                }
            }
            if (tenantId == null) {
                throw new AppException(ErrorCode.UNAUTHORIZED, "error.rfq.tenantIdRequired");
            }

            String sessionToken = jwtTokenProvider.generateAccessToken(
                    vendor.getId(),
                    tenantId,
                    vendor.getVendorEmail(),
                    "VENDOR"
            );

            return VerifyPinResponse.builder()
                    .success(true)
                    .errorCode(ErrorCode.SUCCESS)
                    .status(PortalAuthStatus.AUTHENTICATED)
                    .sessionToken(sessionToken)
                    .build();
        } else {
            // Nhập sai PIN -> Tăng số lần thử trong CSDL
            int currentAttempts = vendor.getPinAttempts() != null ? vendor.getPinAttempts() + 1 : 1;
            vendor.setPinAttempts(currentAttempts);
            int remaining = Math.max(0, 5 - currentAttempts);

            if (currentAttempts >= 5) {
                vendor.setPinLockedUntil(now.plusMinutes(15));
                rfqVendorRepository.save(vendor);

                return VerifyPinResponse.builder()
                        .success(false)
                        .errorCode(ErrorCode.MAGIC_LINK_LOCKED)
                        .status(PortalAuthStatus.LOCKED)
                        .isLocked(true)
                        .lockoutSeconds(900)
                        .remainingAttempts(0)
                        .build();
            }

            rfqVendorRepository.save(vendor);

            return VerifyPinResponse.builder()
                    .success(false)
                    .errorCode(ErrorCode.MAGIC_LINK_INVALID_PIN)
                    .status(currentAttempts >= 2 ? PortalAuthStatus.CAPTCHA_REQUIRED : PortalAuthStatus.UNAUTHORIZED)
                    .remainingAttempts(remaining)
                    .isCaptchaRequired(currentAttempts >= 2)
                    .build();
        }
    }

    @Transactional(readOnly = true)
    @SuppressWarnings("null")
    public RfqService.RfqQuotationDetailDto getPortalRfqDetail(String token) {
        Rfq rfq = findRfqByCodeOrId(token)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.rfq.notFound"));

        List<RfqLineItem> dbItems = rfqLineItemRepository.findByRfqIdAndIsDeletedFalse(rfq.getId());
        List<RfqService.QuotationItemDto> items = new ArrayList<>();

        for (RfqLineItem line : dbItems) {
            items.add(RfqService.QuotationItemDto.builder()
                    .id(line.getId().toString())
                    .itemCode(line.getItemCode())
                    .itemName(line.getDescription())
                    .specs(line.getSpecifications())
                    .origin(line.getOriginCountry() != null ? line.getOriginCountry() : "")
                    .unit(line.getUom())
                    .quantity(line.getQuantity() != null ? line.getQuantity().intValue() : 1)
                    .unitPrice(line.getTargetUnitPrice() != null ? line.getTargetUnitPrice() : BigDecimal.ZERO)
                    .totalAmount(line.getTargetUnitPrice() != null && line.getQuantity() != null
                            ? line.getTargetUnitPrice().multiply(line.getQuantity())
                            : BigDecimal.ZERO)
                    .build());
        }

        Optional<RfqVendor> vendorOpt = rfqVendorRepository.findByInvitationCodeAndIsDeletedFalse(token);
        String contact = vendorOpt.map(RfqVendor::getVendorName).orElse("");
        String country = vendorOpt.map(RfqVendor::getCountry).orElse("");

        return RfqService.RfqQuotationDetailDto.builder()
                .rfqId(rfq.getId().toString())
                .rfqCode(rfq.getCode())
                .projectId(rfq.getProjectId() != null ? rfq.getProjectId().toString() : "")
                .projectName(rfq.getProjectName())
                .supplierName(rfq.getSupplierName())
                .supplierEmail(rfq.getSupplierEmail())
                .supplierContact(contact)
                .supplierCountry(country)
                .currency(rfq.getCurrency() != null ? rfq.getCurrency() : "")
                .incoterm(rfq.getIncoterm() != null ? rfq.getIncoterm() : "")
                .paymentTerm("")
                .loadingPort("")
                .dischargePort("")
                .leadTimeWeeks(null)
                .warrantyMonths(null)
                .notes("")
                .submittedAt("")
                .digitalChecksum("")
                .securityPin("")
                .status(rfq.getStatus())
                .totalAmount(rfq.getTotalQuoteAmount() != null ? rfq.getTotalQuoteAmount() : BigDecimal.ZERO)
                .items(items)
                .attachedDocs(new ArrayList<>())
                .build();
    }

    @Transactional
    public SubmissionReceiptDto submitPortalQuote(String token, QuoteSubmissionRequest req) {
        Rfq rfq = findRfqByCodeOrId(token)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.rfq.notFound"));

        LocalDateTime now = LocalDateTime.now();
        String submittedAt = now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"));

        BigDecimal total = BigDecimal.ZERO;
        if (req.getPrices() != null) {
            for (String priceStr : req.getPrices().values()) {
                try {
                    total = total.add(new BigDecimal(priceStr.replace(",", "")));
                } catch (Exception ignored) {
                }
            }
        }

        // Cập nhật trạng thái RFQ trong CSDL
        rfq.setTotalQuoteAmount(total);
        rfq.setStatus(RfqStatus.QUOTED.name());
        if (req.getCurrency() != null) rfq.setCurrency(req.getCurrency().name());
        if (req.getIncoterm() != null) rfq.setIncoterm(req.getIncoterm().name());
        rfqRepository.save(rfq);

        // Sinh mã băm chữ ký số toàn vẹn dữ liệu
        String rawToHash = rfq.getCode() + "|" + req.getCurrency() + "|" + req.getIncoterm() + "|" + total + "|" + submittedAt;
        String checksum = "SHA256:" + computeSha256(rawToHash);
        String receiptCode = "RECEIPT-" + rfq.getCode().replaceAll("[^A-Z0-9]", "") + "-" + (System.currentTimeMillis() % 1000000);

        return SubmissionReceiptDto.builder()
                .receiptCode(receiptCode)
                .rfqCode(rfq.getCode())
                .status(RfqStatus.SUBMITTED)
                .submittedAt(submittedAt)
                .digitalChecksum(checksum)
                .totalAmount(total)
                .build();
    }

    private Optional<Rfq> findRfqByCodeOrId(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }

        // 1. Tra cứu theo invitation_code trong bảng rfq_vendors
        Optional<RfqVendor> vendorOpt = rfqVendorRepository.findByInvitationCodeAndIsDeletedFalse(token);
        if (vendorOpt.isPresent() && vendorOpt.get().getRfqId() != null) {
            return rfqRepository.findByIdAndTenantIdAndIsDeletedFalse(vendorOpt.get().getRfqId(), null);
        }

        // 2. Tra cứu theo UUID
        try {
            UUID id = UUID.fromString(token);
            return rfqRepository.findByIdAndTenantIdAndIsDeletedFalse(id, null);
        } catch (IllegalArgumentException ignored) {
        }

        // 3. Tra cứu theo mã gói thầu rfq_code
        return rfqRepository.findByCodeAndTenantIdAndIsDeletedFalse(token, null);
    }

    private boolean matchesPin(String rawPin, String dbPinHash, String dbPinSalt) {
        if (dbPinHash == null || dbPinHash.isBlank()) {
            return false;
        }
        String salt = dbPinSalt != null ? dbPinSalt : "";
        String computed = computeSha256(rawPin + ":" + salt);
        return computed.equalsIgnoreCase(dbPinHash);
    }

    private String computeSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            log.error("Failed to hash data with SHA-256: ", e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "error.security.hashFailed");
        }
    }
}
