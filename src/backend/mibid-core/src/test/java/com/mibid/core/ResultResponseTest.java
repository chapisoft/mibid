package com.mibid.core;

import com.mibid.core.dto.PageDTO;
import com.mibid.core.dto.ResultResponse;
import com.mibid.core.exception.AppException;
import com.mibid.core.exception.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Kiểm thử Đơn vị Core DTO và Exceptions MIBID")
class ResultResponseTest {

    @Test
    @DisplayName("Tạo ResultResponse thành công")
    void testSuccessResponse() {
        ResultResponse<String> response = ResultResponse.success("Hello Mibid");
        assertEquals(200, response.getCode());
        assertEquals("SUCCESS", response.getMessage());
        assertEquals("Hello Mibid", response.getData());
        assertNotNull(response.getTimestamp());
    }

    @Test
    @DisplayName("Tạo PageDTO phân trang chuẩn")
    void testPageDto() {
        List<String> items = List.of("Gói thầu 01", "Gói thầu 02", "Gói thầu 03");
        PageDTO<String> page = PageDTO.of(items, 1, 10, 25);

        assertEquals(1, page.getPage());
        assertEquals(10, page.getSize());
        assertEquals(25, page.getTotalElements());
        assertEquals(3, page.getTotalPages());
        assertEquals(3, page.getItems().size());
    }

    @Test
    @DisplayName("Ném AppException với ErrorCode chuẩn")
    void testAppException() {
        AppException ex = new AppException(ErrorCode.GATEKEEPER_HARD_STOP, "Chặn chuyển bước do thiếu hồ sơ");
        assertEquals(ErrorCode.GATEKEEPER_HARD_STOP, ex.getErrorCode());
        assertEquals("Chặn chuyển bước do thiếu hồ sơ", ex.getMessage());
    }
}
