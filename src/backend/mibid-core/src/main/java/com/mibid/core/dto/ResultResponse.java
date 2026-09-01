package com.mibid.core.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Chuẩn định dạng dữ liệu phản hồi API thống nhất cho toàn hệ thống MIBID.
 * @param <T> Kiểu dữ liệu payload
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResultResponse<T> implements Serializable {

    @Builder.Default
    private int code = 200;

    @Builder.Default
    private String message = "SUCCESS";

    private T data;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    public static <T> ResultResponse<T> success(T data) {
        return ResultResponse.<T>builder()
                .code(200)
                .message("SUCCESS")
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ResultResponse<T> success(String message, T data) {
        return ResultResponse.<T>builder()
                .code(200)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ResultResponse<T> error(int code, String message) {
        return ResultResponse.<T>builder()
                .code(code)
                .message(message)
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
