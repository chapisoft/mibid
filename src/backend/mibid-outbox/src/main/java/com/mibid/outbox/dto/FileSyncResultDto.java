package com.mibid.outbox.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileSyncResultDto {
    private String id;
    private String name;
    private String fileType;
    private int totalRecords;
    private int successCount;
    private int errorCount;
    private String status;
    private String errorLogJson;
    private LocalDateTime createdAt;
}
