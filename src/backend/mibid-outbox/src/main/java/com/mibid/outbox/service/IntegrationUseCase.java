package com.mibid.outbox.service;

import com.mibid.outbox.dto.DlqRetryCommand;
import com.mibid.outbox.dto.FileSyncResultDto;
import com.mibid.outbox.dto.IntegrationEndpointDto;
import com.mibid.outbox.dto.IntegrationHubStatsDto;

import java.util.List;
import java.util.UUID;

public interface IntegrationUseCase {
    IntegrationHubStatsDto getIntegrationStats(UUID tenantId);
    List<IntegrationEndpointDto> getEndpoints(UUID tenantId);
    IntegrationEndpointDto saveEndpoint(UUID tenantId, IntegrationEndpointDto dto);
    void deleteEndpoint(UUID tenantId, String id);
    boolean testConnection(UUID tenantId, String id);
    void retryDlq(UUID tenantId, DlqRetryCommand command);
    List<FileSyncResultDto> getFileSyncLogs(UUID tenantId);
    FileSyncResultDto triggerFileSync(UUID tenantId, String fileType);
}
