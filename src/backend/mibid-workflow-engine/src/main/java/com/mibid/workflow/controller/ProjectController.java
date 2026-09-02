package com.mibid.workflow.controller;

import com.mibid.core.context.TenantContextHolder;
import com.mibid.core.dto.ResultResponse;
import com.mibid.workflow.domain.Project;
import com.mibid.workflow.service.WorkflowDefinitionService;
import com.mibid.workflow.service.WorkflowService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final WorkflowService workflowService;

    @Data
    public static class TransitionRequest {
        private UUID targetStageId;
        private String bypassReason;
    }

    @GetMapping
    public ResponseEntity<ResultResponse<List<Project>>> listProjects() {
        return ResponseEntity.ok(ResultResponse.success(workflowService.getProjects(TenantContextHolder.getTenantId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResultResponse<Project>> getProject(@PathVariable UUID id) {
        return ResponseEntity.ok(ResultResponse.success(workflowService.getProjectById(id)));
    }

    @PostMapping
    public ResponseEntity<ResultResponse<Project>> createProject(@RequestBody Project project) {
        UUID tenantId = TenantContextHolder.getTenantId();
        Project created = workflowService.createProject(project, tenantId);
        return ResponseEntity.ok(ResultResponse.success(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResultResponse<Project>> updateProject(
            @PathVariable UUID id,
            @RequestBody Project updates) {
        UUID tenantId = TenantContextHolder.getTenantId();
        Project updated = workflowService.updateProject(id, updates, tenantId);
        return ResponseEntity.ok(ResultResponse.success(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResultResponse<Void>> deleteProject(@PathVariable UUID id) {
        UUID tenantId = TenantContextHolder.getTenantId();
        workflowService.deleteProject(id, tenantId);
        return ResponseEntity.ok(ResultResponse.success(null));
    }

    @PutMapping("/{id}/workflow/{workflowId}")
    public ResponseEntity<ResultResponse<Project>> bindProjectWorkflow(
            @PathVariable UUID id,
            @PathVariable UUID workflowId) {
        UUID tenantId = TenantContextHolder.getTenantId();
        Project updated = workflowService.bindProjectWorkflow(id, workflowId, tenantId);
        return ResponseEntity.ok(ResultResponse.success(updated));
    }

    @GetMapping("/{id}/workflow")
    public ResponseEntity<ResultResponse<WorkflowDefinitionService.WorkflowDto>> getProjectWorkflow(
            @PathVariable UUID id) {
        return ResponseEntity.ok(ResultResponse.success(workflowService.getProjectWorkflow(id)));
    }

    @GetMapping("/stage-requirements")
    public ResponseEntity<ResultResponse<List<WorkflowService.StageChecklistItemDto>>> getStageRequirements(
            @RequestParam(defaultValue = "STAGE_PREPARATION") String stage) {
        return ResponseEntity.ok(ResultResponse.success(workflowService.getStageRequirements(stage)));
    }

    @GetMapping("/{id}/stage-requirements")
    public ResponseEntity<ResultResponse<List<WorkflowService.StageChecklistItemDto>>> getProjectStageRequirements(
            @PathVariable UUID id,
            @RequestParam(required = false, defaultValue = "ALL") String stage) {
        return ResponseEntity.ok(ResultResponse.success(workflowService.getProjectStageRequirements(id, stage)));
    }

    @PostMapping("/{id}/stage-requirements")
    public ResponseEntity<ResultResponse<WorkflowService.StageChecklistItemDto>> createStageRequirement(
            @PathVariable UUID id,
            @RequestBody WorkflowService.StageChecklistItemDto dto) {
        UUID tenantId = TenantContextHolder.getTenantId();
        return ResponseEntity.ok(ResultResponse.success(workflowService.createStageRequirement(id, dto, tenantId)));
    }

    @DeleteMapping("/stage-requirements/{itemId}")
    public ResponseEntity<ResultResponse<Void>> deleteStageRequirement(@PathVariable UUID itemId) {
        workflowService.deleteStageRequirement(itemId);
        return ResponseEntity.ok(ResultResponse.success(null));
    }

    @PatchMapping("/{id}/checklist-status/{itemId}")
    public ResponseEntity<ResultResponse<Boolean>> toggleChecklistItemStatus(
            @PathVariable UUID id,
            @PathVariable UUID itemId,
            @RequestParam(defaultValue = "true") boolean isChecked) {
        UUID tenantId = TenantContextHolder.getTenantId();
        UUID userId = TenantContextHolder.getUserId();
        boolean res = workflowService.toggleChecklistItemStatus(id, itemId, isChecked, tenantId, userId);
        return ResponseEntity.ok(ResultResponse.success(res));
    }

    @PostMapping("/{id}/transition")
    public ResponseEntity<ResultResponse<Project>> transition(
            @PathVariable UUID id,
            @RequestBody TransitionRequest request) {
        Project updated = workflowService.transitionStage(
                TenantContextHolder.getTenantId(), id, request.getTargetStageId(), request.getBypassReason());
        return ResponseEntity.ok(ResultResponse.success(updated));
    }
}
