package com.mibid.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

/**
 * Thành phần tạo lập và xác thực chữ ký số JWT cho hệ thống MIBID.
 */
@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long accessExpirationMs;
    private final long magicLinkExpirationMs;

    public JwtTokenProvider(@Value("${mibid.jwt.secret:mibidSecretKeyMustBeVeryLongForHmacSha256SecurityStandards2026!}") String secret,
                            @Value("${mibid.jwt.access-expiration-ms:900000}") long accessExpirationMs,
                            @Value("${mibid.jwt.magic-link-expiration-ms:259200000}") long magicLinkExpirationMs) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExpirationMs = accessExpirationMs;
        this.magicLinkExpirationMs = magicLinkExpirationMs;
    }

    public String generateAccessToken(UUID userId, UUID tenantId, String username, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessExpirationMs);

        return Jwts.builder()
                .subject(userId.toString())
                .claim("tenant_id", tenantId.toString())
                .claim("username", username)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey)
                .compact();
    }

    public String generateMagicLinkToken(UUID rfqId, UUID vendorId, UUID tenantId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + magicLinkExpirationMs);

        return Jwts.builder()
                .subject(vendorId.toString())
                .claim("rfq_id", rfqId.toString())
                .claim("tenant_id", tenantId.toString())
                .claim("type", "MAGIC_LINK")
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey)
                .compact();
    }

    public Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("JWT token không hợp lệ hoặc đã hết hạn: {}", e.getMessage());
            return false;
        }
    }
}
