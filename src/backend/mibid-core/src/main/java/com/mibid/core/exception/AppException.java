package com.mibid.core.exception;

import lombok.Getter;

/**
 * Ngoại lệ gốc của hệ thống MIBID mang mã lỗi ErrorCode và message key i18n.
 *
 * <p>Quy tắc bắt buộc:
 * <ul>
 *   <li>KHÔNG được truyền chuỗi tự do (tiếng Việt hay tiếng Anh cứng) vào constructor.</li>
 *   <li>Chỉ được truyền một {@code messageKey} — khóa tra cứu trong file {@code messages_*.properties}.</li>
 *   <li>Bộ xử lý {@code GlobalExceptionHandler} sẽ tự động resolve messageKey thành ngôn ngữ
 *       tương ứng dựa trên header {@code Accept-Language} của request.</li>
 * </ul>
 */
@Getter
public class AppException extends RuntimeException {

    private final ErrorCode errorCode;

    /**
     * Ném ngoại lệ với mã lỗi — message được lấy từ {@link ErrorCode#getMessageKey()}.
     *
     * @param errorCode mã lỗi hệ thống
     */
    public AppException(ErrorCode errorCode) {
        super(errorCode.getMessageKey());
        this.errorCode = errorCode;
    }

    /**
     * Ném ngoại lệ với mã lỗi và message key i18n tùy chỉnh.
     * Dùng khi cùng một ErrorCode nhưng muốn hiển thị thông điệp khác nhau.
     *
     * @param errorCode  mã lỗi hệ thống
     * @param messageKey khóa i18n, ví dụ: {@code "error.rfq.tenantIdRequired"}
     */
    public AppException(ErrorCode errorCode, String messageKey) {
        super(messageKey);
        this.errorCode = errorCode;
    }

    /**
     * Ném ngoại lệ với mã lỗi, message key i18n và nguyên nhân gốc.
     *
     * @param errorCode  mã lỗi hệ thống
     * @param messageKey khóa i18n
     * @param cause      nguyên nhân gốc gây ra ngoại lệ
     */
    public AppException(ErrorCode errorCode, String messageKey, Throwable cause) {
        super(messageKey, cause);
        this.errorCode = errorCode;
    }
}
