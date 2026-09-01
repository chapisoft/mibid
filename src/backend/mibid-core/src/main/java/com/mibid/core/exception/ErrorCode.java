package com.mibid.core.exception;

import lombok.Getter;

/**
 * Định nghĩa bảng mã lỗi hệ thống MIBID chuẩn mực.
 */
@Getter
public enum ErrorCode {

    SUCCESS(200, "Thao tác thành công"),
    BAD_REQUEST(400, "Dữ liệu yêu cầu không hợp lệ"),
    UNAUTHORIZED(401, "Yêu cầu chưa được xác thực hoặc phiên làm việc đã hết hạn"),
    AUTHENTICATION_FAILED(401, "Tên đăng nhập hoặc mật khẩu không chính xác"),
    FORBIDDEN(403, "Bạn không có quyền thực hiện hành động này"),
    USER_ACCOUNT_LOCKED(403, "Tài khoản người dùng đã bị khóa"),
    NOT_FOUND(404, "Không tìm thấy tài nguyên yêu cầu"),
    RESOURCE_NOT_FOUND(404, "Không tìm thấy tài nguyên yêu cầu"),
    CONFLICT(409, "Xung đột dữ liệu hoặc bản ghi đã tồn tại"),
    RESOURCE_CONFLICT(409, "Tài nguyên đã tồn tại trong hệ thống"),
    
    // Gatekeeper & Workflow Errors
    GATEKEEPER_HARD_STOP(422, "Vi phạm điều kiện tiên quyết chuyển bước: Thiếu tài liệu hoặc tiêu chí bắt buộc"),
    GATEKEEPER_LOCK_BUSY(423, "Thao tác chuyển bước đang được xử lý đồng thời bởi phiên khác, vui lòng thử lại sau"),
    
    // Magic Link Errors
    MAGIC_LINK_EXPIRED(410, "Liên kết báo giá Magic Link đã hết hạn"),
    MAGIC_LINK_INVALID_PIN(401, "Mã PIN xác thực không chính xác"),
    MAGIC_LINK_LOCKED(429, "Cổng báo giá tạm khóa do nhập sai mã PIN quá 5 lần"),
    
    INTERNAL_SERVER_ERROR(500, "Lỗi máy chủ nội bộ");

    private final int code;
    private final String defaultMessage;

    ErrorCode(int code, String defaultMessage) {
        this.code = code;
        this.defaultMessage = defaultMessage;
    }
}
