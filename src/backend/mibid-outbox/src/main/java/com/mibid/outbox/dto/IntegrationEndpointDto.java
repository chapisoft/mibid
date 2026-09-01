package com.mibid.outbox.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntegrationEndpointDto {
    private String id;
    private UUID tenantId;
    private String name;
    private String systemType;
    private String integrationMode;
    private String endpointUrl;
    private String authConfig;
    private String mappingSchema;
    private boolean isActive;
    private String syncStatus;
    private LocalDateTime lastSyncAt;
}
