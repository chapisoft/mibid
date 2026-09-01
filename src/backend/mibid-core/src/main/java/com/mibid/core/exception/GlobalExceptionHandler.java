package com.mibid.core.exception;

import com.mibid.core.dto.ResultResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Bộ xử lý ngoại lệ toàn cục cho các API Controller MIBID.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ResultResponse<Void>> handleAppException(AppException ex) {
        log.warn("Ngoại lệ nghiệp vụ AppException [Code: {}]: {}", ex.getErrorCode().getCode(), ex.getMessage());
        return ResponseEntity.status(HttpStatusCode.valueOf(ex.getErrorCode().getCode()))
                .body(ResultResponse.error(ex.getErrorCode().getCode(), ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResultResponse<Map<String, String>>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        log.warn("Dữ liệu nhập liệu không hợp lệ: {}", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ResultResponse.<Map<String, String>>builder()
                        .code(400)
                        .message("Dữ liệu gửi lên không vượt qua kiểm định tính hợp lệ")
                        .data(errors)
                        .build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResultResponse<Void>> handleGeneralException(Exception ex) {
        log.error("Lỗi hệ thống chưa được bẫy: ", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ResultResponse.error(500, "Đã xảy ra lỗi máy chủ nội bộ. Vui lòng liên hệ quản trị viên"));
    }
}
