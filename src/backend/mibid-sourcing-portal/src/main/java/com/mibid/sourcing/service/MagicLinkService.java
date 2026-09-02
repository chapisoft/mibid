package com.mibid.sourcing.service;

import com.mibid.security.jwt.JwtTokenProvider;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.UUID;

/**
 * Dịch vụ sinh liên kết ma thuật Magic Link JWT kèm PIN 4 số băm bảo mật cho Nhà cung cấp.
 *
 * <p>Cấu hình:
 * <ul>
 *   <li>{@code mibid.portal.url} — URL gốc của Vendor Portal (đọc từ biến môi trường {@code MIBID_PORTAL_URL})</li>
 *   <li>{@code mibid.portal.magic-link-path} — path prefix của Magic Link (mặc định {@code /rfq})</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MagicLinkService {

    private final JwtTokenProvider jwtTokenProvider;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${mibid.portal.url}")
    private String portalBaseUrl;

    @Value("${mibid.portal.magic-link-path:/rfq}")
    private String magicLinkPath;

    @Data
    @Builder
    public static class MagicLinkPackage {
        private String token;
        private String rawPin;
        private String portalUrl;
    }

    public MagicLinkPackage generateVendorMagicLink(UUID tenantId, UUID rfqId, UUID vendorId, String vendorEmail) {
        String token = jwtTokenProvider.generateMagicLinkToken(rfqId, vendorId, tenantId);

        // Sinh mã PIN 4 số ngẫu nhiên bảo mật
        int pinCode = 1000 + secureRandom.nextInt(9000);
        String rawPin = String.valueOf(pinCode);

        String portalUrl = portalBaseUrl + magicLinkPath + "/" + token;
        log.info("Magic Link issued for Vendor [email={}] rfqId={} vendorId={}", vendorEmail, rfqId, vendorId);

        return MagicLinkPackage.builder()
                .token(token)
                .rawPin(rawPin)
                .portalUrl(portalUrl)
                .build();
    }
}
