package com.mibid.core.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Collections;
import java.util.List;

/**
 * Chuẩn phân trang dữ liệu trả về cho Frontend DataTable MIBID.
 * @param <T> Kiểu bản ghi danh sách
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageDTO<T> implements Serializable {

    @Builder.Default
    private List<T> items = Collections.emptyList();

    @Builder.Default
    private int page = 1;

    @Builder.Default
    private int size = 10;

    @Builder.Default
    private long totalElements = 0L;

    @Builder.Default
    private int totalPages = 0;

    public static <T> PageDTO<T> of(List<T> items, int page, int size, long totalElements) {
        int calculatedPages = size > 0 ? (int) Math.ceil((double) totalElements / size) : 0;
        return PageDTO.<T>builder()
                .items(items)
                .page(page)
                .size(size)
                .totalElements(totalElements)
                .totalPages(calculatedPages)
                .build();
    }
}
