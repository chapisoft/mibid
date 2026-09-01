package com.mibid.bidding.service;

import com.mibid.bidding.domain.Task;
import com.mibid.bidding.repository.TaskRepository;
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
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy nhiệm vụ: " + id));
    }

    @Transactional
    public Task createTask(Task task, UUID tenantId) {
        if (tenantId == null) {
            tenantId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        }
        task.setTenantId(tenantId);
        if (task.getCode() == null || task.getCode().isBlank()) {
            task.setCode("TSK-" + System.currentTimeMillis());
        }
        if (task.getStatus() == null || task.getStatus().isBlank()) {
            task.setStatus("TODO");
        }
        if (task.getSlaStatus() == null || task.getSlaStatus().isBlank()) {
            task.setSlaStatus("ON_TRACK");
        }
        if (task.getSlaRemainingHours() == null) {
            task.setSlaRemainingHours(48);
        }
        if (task.getDueAt() == null) {
            task.setDueAt(LocalDateTime.now().plusDays(3));
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

        return taskRepository.save(existing);
    }

    @Transactional
    public void deleteTask(UUID id, UUID tenantId) {
        Task existing = getTaskById(id, tenantId);
        existing.setDeleted(true);
        taskRepository.save(existing);
    }
}
