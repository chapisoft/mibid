package com.mibid.core.exception;

import com.mibid.core.dto.ResultResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

/**
 * Bộ xử lý ngoại lệ toàn cục cho các API Controller MIBID.
 *
 * <p>Cơ chế i18n:
 * <ol>
 *   <li>AppException chứa một {@code messageKey} (khóa tra trong messages_*.properties).</li>
 *   <li>Handler này dùng {@link MessageSource} + header {@code Accept-Language} để resolve
 *       messageKey thành chuỗi đúng ngôn ngữ của client.</li>
 *   <li>Nếu không tìm thấy bản dịch → fallback về messageKey (không bao giờ trả null).</li>
 * </ol>
 */
@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
@SuppressWarnings("null")
public class GlobalExceptionHandler {

    private final MessageSource messageSource;

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ResultResponse<Void>> handleAppException(
            @NonNull AppException ex,
            @NonNull HttpServletRequest request) {

        Locale locale = resolveLocale(request);
        // Đảm bảo messageKey không null — fallback về tên ErrorCode
        String messageKey = Objects.requireNonNullElse(ex.getMessage(), ex.getErrorCode().name());

        // Resolve message từ MessageSource theo ngôn ngữ của client
        String resolvedMessage = resolveMessage(messageKey, messageKey, locale);

        log.warn("AppException [ErrorCode={} | Key={} | Locale={}]: {}",
                ex.getErrorCode().name(), messageKey, locale, resolvedMessage);

        return ResponseEntity
                .status(HttpStatusCode.valueOf(ex.getErrorCode().getCode()))
                .body(ResultResponse.error(ex.getErrorCode().getCode(), resolvedMessage));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResultResponse<Map<String, String>>> handleValidationException(
            @NonNull MethodArgumentNotValidException ex,
            @NonNull HttpServletRequest request) {

        Locale locale = resolveLocale(request);
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }

        String validationMsg = resolveMessage("error.validation",
                "Input payload failed validation rules", locale);
        log.warn("Validation failed [Locale={}]: {}", locale, errors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ResultResponse.<Map<String, String>>builder()
                        .code(400)
                        .message(validationMsg)
                        .data(errors)
                        .build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResultResponse<Void>> handleGeneralException(
            @NonNull Exception ex,
            @NonNull HttpServletRequest request) {

        Locale locale = resolveLocale(request);
        String internalMsg = resolveMessage("error.internal",
                "Internal server error occurred. Please contact system administrator", locale);

        log.error("Unhandled exception: ", ex);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ResultResponse.error(500, internalMsg));
    }

    /**
     * Resolve Locale từ header Accept-Language.
     * Hỗ trợ: vi, en, zh, ja, ko — mặc định vi nếu không có header.
     */
    @NonNull
    private Locale resolveLocale(@NonNull HttpServletRequest request) {
        String lang = request.getHeader("Accept-Language");
        if (lang == null || lang.isBlank()) {
            return new Locale("vi");
        }
        String primaryLang = lang.split("[,;]")[0].trim().toLowerCase();
        return switch (primaryLang) {
            case "en", "en-us", "en-gb" -> Locale.ENGLISH;
            case "zh", "zh-cn", "zh-tw" -> Locale.CHINESE;
            case "ja", "ja-jp" -> Locale.JAPANESE;
            case "ko", "ko-kr" -> Locale.KOREAN;
            default -> new Locale("vi");
        };
    }

    /**
     * Wrapper null-safe cho MessageSource.getMessage.
     * Đảm bảo không bao giờ truyền null vào các tham số @NonNull của MessageSource.
     */
    @NonNull
    private String resolveMessage(@NonNull String key, @NonNull String fallback, @NonNull Locale locale) {
        return Objects.requireNonNullElse(
                messageSource.getMessage(key, null, fallback, locale),
                fallback
        );
    }
}
