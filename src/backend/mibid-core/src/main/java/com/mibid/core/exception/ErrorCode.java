package com.mibid.core.exception;

import lombok.Getter;

/**
 * Bảng mã lỗi hệ thống MIBID chuẩn mực.
 *
 * <p>Mỗi ErrorCode mang:
 * <ul>
 *   <li>{@code code} — HTTP status code trả về FE</li>
 *   <li>{@code messageKey} — Khóa i18n tra trong {@code messages_*.properties},
 *       được resolve bởi {@code GlobalExceptionHandler} dựa trên {@code Accept-Language} header</li>
 * </ul>
 */
@Getter
public enum ErrorCode {

    // ---- HTTP 2xx ----
    SUCCESS(200, "error.success"),

    // ---- HTTP 4xx ----
    BAD_REQUEST(400, "error.badRequest"),
    INVALID_REQUEST(400, "error.invalidRequest"),
    UNAUTHORIZED(401, "error.unauthorized"),
    AUTHENTICATION_FAILED(401, "error.authenticationFailed"),
    FORBIDDEN(403, "error.forbidden"),
    USER_ACCOUNT_LOCKED(403, "error.userAccountLocked"),
    NOT_FOUND(404, "error.notFound"),
    RESOURCE_NOT_FOUND(404, "error.resourceNotFound"),
    CONFLICT(409, "error.conflict"),
    RESOURCE_CONFLICT(409, "error.resourceConflict"),

    // ---- Gatekeeper & Workflow ----
    GATEKEEPER_HARD_STOP(422, "error.gatekeeperHardStop"),
    GATEKEEPER_LOCK_BUSY(423, "error.lockTimeout"),

    // ---- Magic Link & Vendor Portal ----
    MAGIC_LINK_EXPIRED(410, "error.portal.magicLinkExpired"),
    MAGIC_LINK_INVALID_PIN(401, "error.portal.invalidPin"),
    MAGIC_LINK_LOCKED(429, "error.portal.locked"),
    CAPTCHA_REQUIRED(400, "error.portal.captchaRequired"),
    PIN_REQUIRED(400, "error.portal.pinRequired"),

    // ---- SaaS & Quota ----
    TENANT_USER_QUOTA_EXCEEDED(400, "error.tenant.userQuotaExceeded"),

    // ---- Server Error ----
    INTERNAL_SERVER_ERROR(500, "error.internal");

    private final int code;
    private final String messageKey;

    ErrorCode(int code, String messageKey) {
        this.code = code;
        this.messageKey = messageKey;
    }

    /**
     * @deprecated Dùng {@link #getMessageKey()} — chuỗi này chỉ dùng nội bộ log.
     * Không trả trực tiếp về FE.
     */
    @Deprecated
    public String getDefaultMessage() {
        return messageKey;
    }
}
