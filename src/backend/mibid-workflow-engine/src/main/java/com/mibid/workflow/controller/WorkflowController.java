package com.mibid.workflow.controller;

import com.mibid.core.context.TenantContextHolder;
import com.mibid.core.dto.ResultResponse;
import com.mibid.workflow.service.WorkflowDefinitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workflows")
@RequiredArgsConstructor
public class WorkflowController {

    private final WorkflowDefinitionService workflowService;

    @GetMapping
    public ResponseEntity<ResultResponse<List<WorkflowDefinitionService.WorkflowDto>>> getAllWorkflows() {
        UUID tenantId = TenantContextHolder.getTenantId();
        return ResponseEntity.ok(ResultResponse.success(workflowService.getAllWorkflows(tenantId)));
    }

    @GetMapping("/templates")
    public ResponseEntity<ResultResponse<List<WorkflowDefinitionService.WorkflowTemplateDto>>> getTemplates() {
        return ResponseEntity.ok(ResultResponse.success(workflowService.getTemplates()));
    }

    @PostMapping("/templates")
    public ResponseEntity<ResultResponse<WorkflowDefinitionService.WorkflowTemplateDto>> createTemplate(
            @RequestBody WorkflowDefinitionService.WorkflowTemplateDto dto) {
        return ResponseEntity.ok(ResultResponse.success(workflowService.saveTemplate(dto)));
    }

    @PutMapping("/templates/{id}")
    public ResponseEntity<ResultResponse<WorkflowDefinitionService.WorkflowTemplateDto>> updateTemplate(
            @PathVariable UUID id,
            @RequestBody WorkflowDefinitionService.WorkflowTemplateDto dto) {
        dto.setId(id.toString());
        return ResponseEntity.ok(ResultResponse.success(workflowService.saveTemplate(dto)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResultResponse<WorkflowDefinitionService.WorkflowDto>> getWorkflowById(@PathVariable UUID id) {
        return ResponseEntity.ok(ResultResponse.success(workflowService.getWorkflowById(id)));
    }

    @PostMapping
    public ResponseEntity<ResultResponse<WorkflowDefinitionService.WorkflowDto>> createWorkflow(
            @RequestBody WorkflowDefinitionService.WorkflowDto dto) {
        UUID tenantId = TenantContextHolder.getTenantId();
        return ResponseEntity.ok(ResultResponse.success(workflowService.saveWorkflow(dto, tenantId)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResultResponse<WorkflowDefinitionService.WorkflowDto>> updateWorkflow(
            @PathVariable UUID id,
            @RequestBody WorkflowDefinitionService.WorkflowDto dto) {
        UUID tenantId = TenantContextHolder.getTenantId();
        dto.setId(id.toString());
        return ResponseEntity.ok(ResultResponse.success(workflowService.saveWorkflow(dto, tenantId)));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<ResultResponse<WorkflowDefinitionService.WorkflowDto>> publishWorkflow(@PathVariable UUID id) {
        UUID tenantId = TenantContextHolder.getTenantId();
        return ResponseEntity.ok(ResultResponse.success(workflowService.publishWorkflow(id, tenantId)));
    }

    @PostMapping("/{id}/clone")
    public ResponseEntity<ResultResponse<WorkflowDefinitionService.WorkflowDto>> cloneWorkflow(@PathVariable UUID id) {
        UUID tenantId = TenantContextHolder.getTenantId();
        return ResponseEntity.ok(ResultResponse.success(workflowService.cloneWorkflow(id, tenantId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResultResponse<Boolean>> deleteWorkflow(@PathVariable UUID id) {
        UUID tenantId = TenantContextHolder.getTenantId();
        workflowService.deleteWorkflow(id, tenantId);
        return ResponseEntity.ok(ResultResponse.success(true));
    }

    @PostMapping("/validate")
    public ResponseEntity<ResultResponse<WorkflowDefinitionService.WorkflowValidationResultDto>> validateWorkflow(
            @RequestBody WorkflowDefinitionService.WorkflowDto dto) {
        return ResponseEntity.ok(ResultResponse.success(workflowService.validateWorkflow(dto)));
    }
}
