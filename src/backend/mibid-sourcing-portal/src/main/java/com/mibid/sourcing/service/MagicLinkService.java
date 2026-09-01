package com.mibid.sourcing.service;

import com.mibid.security.jwt.JwtTokenProvider;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.UUID;

/**
 * Dịch vụ sinh liên kết ma thuật Magic Link JWT kèm PIN 4 số băm bảo mật cho Nhà cung cấp.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MagicLinkService {

    private final JwtTokenProvider jwtTokenProvider;
    private final SecureRandom secureRandom = new SecureRandom();

    @Data
    @Builder
    public static class MagicLinkPackage {
        private String token;
        private String rawPin;
        private String portalUrl;
    }

    public MagicLinkPackage generateVendorMagicLink(UUID tenantId, UUID rfqId, UUID vendorId, String vendorEmail) {
        String token = jwtTokenProvider.generateMagicLinkToken(rfqId, vendorId, tenantId);

        // Sinh mã PIN 4 số ngẫu nhiên
        int pinCode = 1000 + secureRandom.nextInt(9000);
        String rawPin = String.valueOf(pinCode);

        String portalUrl = "https://portal.mibid.vn/rfq/" + token;
        log.info("Phát hành Magic Link cho Vendor [Email: {}]: {} với PIN: {}", vendorEmail, portalUrl, rawPin);

        return MagicLinkPackage.builder()
                .token(token)
                .rawPin(rawPin)
                .portalUrl(portalUrl)
                .build();
    }
}
