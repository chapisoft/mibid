package com.mibid.bidding.service;

import com.mibid.bidding.domain.Task;
import com.mibid.bidding.repository.TaskRepository;
import com.mibid.core.domain.enums.SlaStatus;
import com.mibid.core.domain.enums.TaskStatus;
import com.mibid.core.exception.AppException;
import com.mibid.core.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public List<Task> getTasks(UUID tenantId, String projectId, String departmentCode) {
        if (projectId != null && !projectId.equalsIgnoreCase("ALL") && !projectId.isBlank()) {
            return taskRepository.findByTenantIdAndProjectIdAndIsDeletedFalse(tenantId, projectId);
        }
        if (departmentCode != null && !departmentCode.equalsIgnoreCase("ALL") && !departmentCode.isBlank()) {
            return taskRepository.findByTenantIdAndDepartmentCodeAndIsDeletedFalse(tenantId, departmentCode);
        }
        return taskRepository.findByTenantIdAndIsDeletedFalse(tenantId);
    }

    @Transactional(readOnly = true)
    public Task getTaskById(UUID id, UUID tenantId) {
        return taskRepository.findByIdAndTenantIdAndIsDeletedFalse(id, tenantId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.task.notFound"));
    }

    @Transactional
    public Task createTask(Task task, UUID tenantId) {
        if (tenantId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "error.task.tenantIdRequired");
        }
        task.setTenantId(tenantId);
        if (task.getCode() == null || task.getCode().isBlank()) {
            task.setCode("TSK-" + System.currentTimeMillis());
        }
        if (task.getStatus() == null || task.getStatus().isBlank()) {
            task.setStatus(TaskStatus.TODO.name());
        }
        if (task.getSlaStatus() == null || task.getSlaStatus().isBlank()) {
            task.setSlaStatus(SlaStatus.ON_TRACK.name());
        }
        return taskRepository.save(task);
    }

    @Transactional
    public Task updateTask(UUID id, Task updates, UUID tenantId) {
        Task existing = getTaskById(id, tenantId);

        if (updates.getCode() != null) existing.setCode(updates.getCode());
        if (updates.getTitle() != null) existing.setTitle(updates.getTitle());
        if (updates.getProjectId() != null) existing.setProjectId(updates.getProjectId());
        if (updates.getProjectName() != null) existing.setProjectName(updates.getProjectName());
        if (updates.getDepartmentCode() != null) existing.setDepartmentCode(updates.getDepartmentCode());
        if (updates.getPriority() != null) existing.setPriority(updates.getPriority());
        if (updates.getAssigneeId() != null) existing.setAssigneeId(updates.getAssigneeId());
        if (updates.getAssigneeName() != null) existing.setAssigneeName(updates.getAssigneeName());
        if (updates.getAssigneeAvatar() != null) existing.setAssigneeAvatar(updates.getAssigneeAvatar());
        if (updates.getDueAt() != null) existing.setDueAt(updates.getDueAt());
        if (updates.getStatus() != null) {
            existing.setStatus(updates.getStatus());
            if ("DONE".equalsIgnoreCase(updates.getStatus()) && existing.getCompletedAt() == null) {
                existing.setCompletedAt(LocalDateTime.now());
            }
        }
        if (updates.getClarificationCount() != null) existing.setClarificationCount(updates.getClarificationCount());
        if (updates.getSlaStatus() != null) existing.setSlaStatus(updates.getSlaStatus());
        if (updates.getSlaRemainingHours() != null) existing.setSlaRemainingHours(updates.getSlaRemainingHours());
        if (updates.getEvidenceDocs() != null) existing.setEvidenceDocs(updates.getEvidenceDocs());
        if (updates.getGateChecklists() != null) existing.setGateChecklists(updates.getGateChecklists());

        return taskRepository.save(existing);
    }

    @Transactional
    public Task completeTaskWithGate(UUID id, UUID tenantId) {
        Task existing = getTaskById(id, tenantId);

        // Quality Gate: Yêu cầu bắt buộc phải có đầy đủ tài liệu chứng minh
        if (existing.getEvidenceDocs() != null && !existing.getEvidenceDocs().isBlank()) {
            if (existing.getEvidenceDocs().contains("\"isUploaded\":false") || existing.getEvidenceDocs().contains("\"isUploaded\": false")) {
                throw new AppException(ErrorCode.GATEKEEPER_HARD_STOP, "error.task.evidence.incomplete");
            }
        }
        // Quality Gate: Yêu cầu bắt buộc 100% tiêu chí con phải được thông qua
        if (existing.getGateChecklists() != null && !existing.getGateChecklists().isBlank()) {
            if (existing.getGateChecklists().contains("\"isPassed\":false") || existing.getGateChecklists().contains("\"isPassed\": false")) {
                throw new AppException(ErrorCode.GATEKEEPER_HARD_STOP, "error.task.gateChecklist.incomplete");
            }
        }

        existing.setStatus("DONE");
        existing.setCompletedAt(LocalDateTime.now());
        return taskRepository.save(existing);
    }

    @Transactional
    public void deleteTask(UUID id, UUID tenantId) {
        Task existing = getTaskById(id, tenantId);
        existing.setDeleted(true);
        taskRepository.save(existing);
    }
}
