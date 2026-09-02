package com.mibid.sourcing.controller;

import com.mibid.core.dto.ResultResponse;
import com.mibid.core.exception.ErrorCode;
import com.mibid.sourcing.service.RfqService;
import com.mibid.sourcing.service.VendorPortalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * RESTful Controller cho Cổng Báo Giá Nhà Cung Cấp (Vendor Portal).
 * Đối chiếu dữ liệu thực tế trong Cơ Sở Dữ Liệu PostgreSQL qua JPA Repository.
 * Tuân thủ 100% Enums và ErrorCode chuẩn mực.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/portal")
@RequiredArgsConstructor
public class VendorPortalController {

    private final VendorPortalService vendorPortalService;

    @PostMapping("/verify-pin")
    public ResponseEntity<ResultResponse<VendorPortalService.VerifyPinResponse>> verifyPin(
            @RequestBody VendorPortalService.VerifyPinRequest req) {

        VendorPortalService.VerifyPinResponse response = vendorPortalService.verifyPin(req);

        if (response.isSuccess()) {
            return ResponseEntity.ok(ResultResponse.success(response));
        }

        if (response.getErrorCode() == ErrorCode.MAGIC_LINK_LOCKED) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(ResultResponse.success(response));
        }

        if (response.getErrorCode() == ErrorCode.PIN_REQUIRED) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResultResponse.success(response));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ResultResponse.success(response));
    }

    @GetMapping("/rfq/{token}")
    public ResponseEntity<ResultResponse<RfqService.RfqQuotationDetailDto>> getPortalRfqDetail(
            @PathVariable String token) {

        RfqService.RfqQuotationDetailDto detail = vendorPortalService.getPortalRfqDetail(token);
        return ResponseEntity.ok(ResultResponse.success(detail));
    }

    @PostMapping("/rfq/{token}/submit-quote")
    public ResponseEntity<ResultResponse<VendorPortalService.SubmissionReceiptDto>> submitQuote(
            @PathVariable String token,
            @RequestBody VendorPortalService.QuoteSubmissionRequest req) {

        VendorPortalService.SubmissionReceiptDto receipt = vendorPortalService.submitPortalQuote(token, req);
        return ResponseEntity.ok(ResultResponse.success(receipt));
    }
}
