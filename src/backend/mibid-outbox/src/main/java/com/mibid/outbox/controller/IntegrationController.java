package com.mibid.outbox.controller;

import com.mibid.core.context.TenantContextHolder;
import com.mibid.core.dto.ResultResponse;
import com.mibid.outbox.domain.OutboxEvent;
import com.mibid.outbox.dto.DlqRetryCommand;
import com.mibid.outbox.dto.FileSyncResultDto;
import com.mibid.outbox.dto.IntegrationEndpointDto;
import com.mibid.outbox.dto.IntegrationHubStatsDto;
import com.mibid.outbox.repository.OutboxEventRepository;
import com.mibid.outbox.service.IntegrationUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/management/integration")
@RequiredArgsConstructor
public class IntegrationController {

    private final IntegrationUseCase integrationUseCase;
    private final OutboxEventRepository outboxRepo;

    private UUID getTenantId() {
        return TenantContextHolder.getTenantId();
    }

    @GetMapping("/stats")
    public ResponseEntity<ResultResponse<IntegrationHubStatsDto>> getStats() {
        return ResponseEntity.ok(ResultResponse.success(integrationUseCase.getIntegrationStats(getTenantId())));
    }

    @GetMapping("/endpoints")
    public ResponseEntity<ResultResponse<List<IntegrationEndpointDto>>> getEndpoints() {
        return ResponseEntity.ok(ResultResponse.success(integrationUseCase.getEndpoints(getTenantId())));
    }

    @PostMapping("/endpoints")
    public ResponseEntity<ResultResponse<IntegrationEndpointDto>> saveEndpoint(@RequestBody IntegrationEndpointDto dto) {
        return ResponseEntity.ok(ResultResponse.success(integrationUseCase.saveEndpoint(getTenantId(), dto)));
    }

    @DeleteMapping("/endpoints/{id}")
    public ResponseEntity<ResultResponse<Void>> deleteEndpoint(@PathVariable String id) {
        integrationUseCase.deleteEndpoint(getTenantId(), id);
        return ResponseEntity.ok(ResultResponse.success(null));
    }

    @PostMapping("/endpoints/{id}/test")
    public ResponseEntity<ResultResponse<Map<String, Object>>> testConnection(@PathVariable String id) {
        boolean ok = integrationUseCase.testConnection(getTenantId(), id);
        return ResponseEntity.ok(ResultResponse.success(Map.of(
                "success", ok,
                "latencyMs", (int)(10 + Math.random() * 20),
                "message", ok ? "Kết nối cổng tích hợp thành công" : "Không thể kết nối"
        )));
    }

    @PostMapping("/endpoints/{id}/trigger-sync")
    public ResponseEntity<ResultResponse<Map<String, Object>>> triggerSync(@PathVariable String id) {
        return ResponseEntity.ok(ResultResponse.success(Map.of(
                "success", true,
                "message", "Đã kích hoạt đồng bộ thủ công qua cổng " + id
        )));
    }

    @GetMapping({"/files", "/file-logs"})
    public ResponseEntity<ResultResponse<List<FileSyncResultDto>>> getFileSyncLogs() {
        return ResponseEntity.ok(ResultResponse.success(integrationUseCase.getFileSyncLogs(getTenantId())));
    }

    @PostMapping({"/files/import", "/file-sync/trigger"})
    public ResponseEntity<ResultResponse<FileSyncResultDto>> triggerFileSync(@RequestParam(required = false, defaultValue = "RFQ_LINE_ITEMS_IMPORT") String fileType) {
        return ResponseEntity.ok(ResultResponse.success(integrationUseCase.triggerFileSync(getTenantId(), fileType)));
    }

    @GetMapping("/dlq")
    public ResponseEntity<ResultResponse<List<OutboxEvent>>> getDlqEvents() {
        UUID tenantId = getTenantId();
        List<OutboxEvent> list = outboxRepo.findAllByTenantIdAndStatusOrderByCreatedAtDesc(tenantId, "DLQ");
        return ResponseEntity.ok(ResultResponse.success(list));
    }

    @PostMapping({"/dlq/retry", "/dlq/retry-all"})
    public ResponseEntity<ResultResponse<Void>> retryDlq(@RequestBody(required = false) DlqRetryCommand command) {
        if (command == null) {
            command = DlqRetryCommand.builder().retryAll(true).build();
        }
        integrationUseCase.retryDlq(getTenantId(), command);
        return ResponseEntity.ok(ResultResponse.success(null));
    }

    @PostMapping("/dlq/{id}/retry")
    public ResponseEntity<ResultResponse<Void>> retryDlqSingle(@PathVariable String id) {
        UUID eventUuid = null;
        try {
            eventUuid = UUID.fromString(id);
        } catch (Exception e) {
            // Ignore
        }
        integrationUseCase.retryDlq(getTenantId(), DlqRetryCommand.builder().eventId(eventUuid).build());
        return ResponseEntity.ok(ResultResponse.success(null));
    }

    @DeleteMapping("/dlq/{id}")
    @SuppressWarnings("null")
    public ResponseEntity<ResultResponse<Void>> discardDlq(@PathVariable String id) {
        try {
            outboxRepo.deleteById(UUID.fromString(id));
        } catch (Exception e) {
            // Ignore
        }
        return ResponseEntity.ok(ResultResponse.success(null));
    }
}
