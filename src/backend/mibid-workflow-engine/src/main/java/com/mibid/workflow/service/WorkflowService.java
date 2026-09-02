package com.mibid.workflow.service;

import com.mibid.core.exception.AppException;
import com.mibid.core.exception.ErrorCode;
import com.mibid.workflow.domain.Project;
import com.mibid.workflow.domain.StageChecklistItem;
import com.mibid.workflow.engine.GatekeeperInterceptor;
import com.mibid.workflow.repository.ProjectRepository;
import com.mibid.workflow.repository.StageChecklistItemRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkflowService {

    private final ProjectRepository projectRepository;
    private final GatekeeperInterceptor gatekeeperInterceptor;
    private final StageChecklistItemRepository stageChecklistItemRepository;
    private final com.mibid.workflow.repository.ProjectChecklistStatusRepository projectChecklistStatusRepository;
    private final com.mibid.workflow.repository.WorkflowDefinitionRepository workflowDefinitionRepository;
    private final WorkflowDefinitionService workflowDefinitionService;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StageChecklistItemDto {
        private String id;
        private String projectId;
        private String stage;
        private String title;
        private String description;
        private boolean isRequired;
        private String docCode;
        private String assigneeRole;
        private int sortOrder;
        private boolean isChecked;
    }

    @Transactional(readOnly = true)
    public List<Project> getProjects(UUID tenantId) {
        return projectRepository.findByTenantId(tenantId);
    }

    @Transactional(readOnly = true)
    @SuppressWarnings("null")
    public Project getProjectById(UUID id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.project.notFound"));
    }

    @Transactional
    public Project createProject(Project project, UUID tenantId) {
        if (tenantId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "error.project.tenantIdRequired");
        }
        project.setTenantId(tenantId);
        if (project.getCode() == null || project.getCode().isBlank()) {
            project.setCode("PROJ-" + System.currentTimeMillis());
        }
        return projectRepository.save(project);
    }

    @Transactional
    @SuppressWarnings("null")
    public Project updateProject(UUID id, Project updates, UUID tenantId) {
        Project existing = getProjectById(id);

        if (updates.getCode() != null) existing.setCode(updates.getCode());
        if (updates.getName() != null) existing.setName(updates.getName());
        if (updates.getTenderType() != null) existing.setTenderType(updates.getTenderType());
        if (updates.getInvestorType() != null) existing.setInvestorType(updates.getInvestorType());
        if (updates.getInvestorName() != null) existing.setInvestorName(updates.getInvestorName());
        if (updates.getIndustrySector() != null) existing.setIndustrySector(updates.getIndustrySector());
        if (updates.getProcurementMethod() != null) existing.setProcurementMethod(updates.getProcurementMethod());
        if (updates.getEstimatedBudget() != null) existing.setEstimatedBudget(updates.getEstimatedBudget());
        if (updates.getCurrency() != null) existing.setCurrency(updates.getCurrency());
        if (updates.getWorkflowId() != null) existing.setWorkflowId(updates.getWorkflowId());
        if (updates.getStageEnum() != null) existing.setStageEnum(updates.getStageEnum());
        if (updates.getBidSubmissionDeadline() != null) existing.setBidSubmissionDeadline(updates.getBidSubmissionDeadline());
        if (updates.getManagerId() != null) existing.setManagerId(updates.getManagerId());
        if (updates.getManagerName() != null) existing.setManagerName(updates.getManagerName());
        if (updates.getCompletedTasks() != null) existing.setCompletedTasks(updates.getCompletedTasks());
        if (updates.getTotalTasks() != null) existing.setTotalTasks(updates.getTotalTasks());
        if (updates.getStatus() != null) existing.setStatus(updates.getStatus());

        return projectRepository.save(existing);
    }

    @Transactional
    public Project bindProjectWorkflow(UUID projectId, UUID workflowId, UUID tenantId) {
        Project project = getProjectById(projectId);
        com.mibid.workflow.domain.WorkflowDefinitionEntity wf = workflowDefinitionRepository.findByIdAndDeletedFalse(workflowId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.workflow.notFound"));
        project.setWorkflowId(wf.getId());
        return projectRepository.save(project);
    }

    @Transactional
    public WorkflowDefinitionService.WorkflowDto getProjectWorkflow(UUID projectId) {
        Project project = getProjectById(projectId);
        if (project.getWorkflowId() != null) {
            return workflowDefinitionService.getWorkflowById(project.getWorkflowId());
        }
        // Nếu chưa có workflowId, tự động tìm quy trình phù hợp và gán cho dự án
        List<com.mibid.workflow.domain.WorkflowDefinitionEntity> candidates = workflowDefinitionRepository.findAllByTenantIdOrTemplates(project.getTenantId());
        if (!candidates.isEmpty()) {
            com.mibid.workflow.domain.WorkflowDefinitionEntity selected = candidates.get(0);
            project.setWorkflowId(selected.getId());
            projectRepository.save(project);
            return workflowDefinitionService.getWorkflowById(selected.getId());
        }
        throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.workflow.notFoundForProject");
    }

    @Transactional
    public void deleteProject(UUID id, UUID tenantId) {
        Project existing = getProjectById(id);
        existing.setDeleted(true);
        projectRepository.save(existing);
    }

    @Transactional
    public Project transitionStage(UUID tenantId, UUID projectId, UUID targetStageId, String bypassReason) {
        Project project = getProjectById(projectId);
        gatekeeperInterceptor.evaluateTransitionGate(tenantId, projectId, project.getCurrentStageId(), targetStageId, bypassReason);
        project.setCurrentStageId(targetStageId);
        return projectRepository.save(project);
    }

    /**
     * Lấy danh sách checklist items theo stage từ DB.
     * Dữ liệu checklist phải được seed vào bảng stage_checklist_item trước khi deploy.
     * Tuyệt đối không hardcode dữ liệu nghiệp vụ trong code.
     */
    @Transactional(readOnly = true)
    public List<StageChecklistItemDto> getStageRequirements(String stage) {
        if (stage == null || stage.isBlank()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "error.workflow.stage.required");
        }

        List<StageChecklistItem> items = stageChecklistItemRepository.findByStageCodeOrderBySortOrderAsc(stage);
        if (items.isEmpty()) {
            items = stageChecklistItemRepository.findAll();
        }

        return items.stream()
                .map(item -> StageChecklistItemDto.builder()
                        .id(item.getId() != null ? item.getId().toString() : null)
                        .projectId(item.getProjectId() != null ? item.getProjectId().toString() : null)
                        .stage(item.getStageCode() != null ? item.getStageCode() : stage)
                        .title(item.getTitle())
                        .description(item.getDescription())
                        .isRequired(item.isRequired())
                        .docCode(item.getDocCode())
                        .assigneeRole(item.getAssigneeRole())
                        .sortOrder(item.getSortOrder())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StageChecklistItemDto> getProjectStageRequirements(UUID projectId, String stage) {
        List<StageChecklistItem> items;
        if (stage != null && !stage.isBlank() && !stage.equalsIgnoreCase("ALL")) {
            items = stageChecklistItemRepository.findByProjectIdAndStageCodeOrderBySortOrderAsc(projectId, stage);
            if (items.isEmpty()) {
                // Fallback nếu dự án chưa có tiêu chí riêng cho bước này
                items = stageChecklistItemRepository.findByStageCodeOrderBySortOrderAsc(stage);
            }
        } else {
            items = stageChecklistItemRepository.findByProjectIdOrderBySortOrderAsc(projectId);
        }

        // Lấy danh sách ID đã hoàn thành từ bảng project_checklist_status
        List<com.mibid.workflow.domain.ProjectChecklistStatus> statuses = projectChecklistStatusRepository.findByProjectId(projectId);
        java.util.Set<UUID> completedIds = statuses.stream()
                .filter(s -> s != null && s.isChecked())
                .map(s -> s != null ? s.getChecklistItemId() : null)
                .filter(java.util.Objects::nonNull)
                .collect(java.util.stream.Collectors.toSet());

        return items.stream()
                .map(item -> StageChecklistItemDto.builder()
                        .id(item.getId() != null ? item.getId().toString() : null)
                        .projectId(item.getProjectId() != null ? item.getProjectId().toString() : (projectId != null ? projectId.toString() : null))
                        .stage(item.getStageCode() != null ? item.getStageCode() : stage)
                        .title(item.getTitle())
                        .description(item.getDescription())
                        .isRequired(item.isRequired())
                        .docCode(item.getDocCode())
                        .assigneeRole(item.getAssigneeRole())
                        .sortOrder(item.getSortOrder())
                        .isChecked(item.getId() != null && completedIds.contains(item.getId()))
                        .build())
                .toList();
    }

    @Transactional
    public StageChecklistItemDto createStageRequirement(UUID projectId, StageChecklistItemDto dto, UUID tenantId) {
        if (tenantId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "error.tenant.required");
        }

        StageChecklistItem item = StageChecklistItem.builder()
                .tenantId(tenantId)
                .projectId(projectId)
                .stageCode(dto.getStage() != null ? dto.getStage() : "STAGE_PREPARATION")
                .title(dto.getTitle())
                .description(dto.getDescription())
                .docCode(dto.getDocCode())
                .assigneeRole(dto.getAssigneeRole())
                .required(dto.isRequired())
                .sortOrder(dto.getSortOrder() > 0 ? dto.getSortOrder() : 1)
                .build();

        StageChecklistItem saved = stageChecklistItemRepository.save(java.util.Objects.requireNonNull(item));

        return StageChecklistItemDto.builder()
                .id(saved.getId().toString())
                .projectId(saved.getProjectId() != null ? saved.getProjectId().toString() : null)
                .stage(saved.getStageCode())
                .title(saved.getTitle())
                .description(saved.getDescription())
                .docCode(saved.getDocCode())
                .assigneeRole(saved.getAssigneeRole())
                .isRequired(saved.isRequired())
                .sortOrder(saved.getSortOrder())
                .isChecked(false)
                .build();
    }

    @Transactional
    public void deleteStageRequirement(UUID itemId) {
        stageChecklistItemRepository.deleteById(java.util.Objects.requireNonNull(itemId));
    }

    @Transactional
    public boolean toggleChecklistItemStatus(UUID projectId, UUID itemId, boolean isChecked, UUID tenantId, UUID userId) {
        var opt = projectChecklistStatusRepository.findByProjectIdAndChecklistItemId(projectId, itemId);
        com.mibid.workflow.domain.ProjectChecklistStatus status;
        if (opt.isPresent()) {
            status = opt.get();
            status.setChecked(isChecked);
            status.setCheckedAt(isChecked ? java.time.Instant.now() : null);
            status.setCheckedBy(userId);
        } else {
            status = com.mibid.workflow.domain.ProjectChecklistStatus.builder()
                    .tenantId(tenantId)
                    .projectId(projectId)
                    .checklistItemId(itemId)
                    .checked(isChecked)
                    .checkedAt(isChecked ? java.time.Instant.now() : null)
                    .checkedBy(userId)
                    .build();
        }
        projectChecklistStatusRepository.save(java.util.Objects.requireNonNull(status));

        // Cập nhật lại tỷ lệ hoàn thành completionRate của dự án
        try {
            var allItems = stageChecklistItemRepository.findByProjectIdOrderBySortOrderAsc(projectId);
            if (!allItems.isEmpty()) {
                var completedStatuses = projectChecklistStatusRepository.findByProjectId(projectId);
                long completedCount = completedStatuses.stream()
                        .filter(s -> s != null && s.isChecked())
                        .count();
                int rate = (int) Math.round(((double) completedCount / allItems.size()) * 100);
                if (rate > 100) rate = 100;

                projectRepository.findById(java.util.Objects.requireNonNull(projectId)).ifPresent(p -> {
                    p.setCompletedTasks((int) completedCount);
                    p.setTotalTasks(allItems.size());
                    projectRepository.save(p);
                });
            }
        } catch (Exception ignored) {
        }

        return isChecked;
    }
}
