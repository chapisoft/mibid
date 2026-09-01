package com.mibid.bidding.controller;

import com.mibid.bidding.domain.Task;
import com.mibid.bidding.service.TaskService;
import com.mibid.core.context.TenantContextHolder;
import com.mibid.core.dto.ResultResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<ResultResponse<List<Task>>> listTasks(
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) String department) {
        UUID tenantId = TenantContextHolder.getTenantId();
        List<Task> list = taskService.getTasks(tenantId, projectId, department);
        return ResponseEntity.ok(ResultResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResultResponse<Task>> getTask(@PathVariable UUID id) {
        UUID tenantId = TenantContextHolder.getTenantId();
        Task task = taskService.getTaskById(id, tenantId);
        return ResponseEntity.ok(ResultResponse.success(task));
    }

    @PostMapping
    public ResponseEntity<ResultResponse<Task>> createTask(@RequestBody Task task) {
        UUID tenantId = TenantContextHolder.getTenantId();
        Task created = taskService.createTask(task, tenantId);
        return ResponseEntity.ok(ResultResponse.success(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResultResponse<Task>> updateTask(
            @PathVariable UUID id,
            @RequestBody Task updates) {
        UUID tenantId = TenantContextHolder.getTenantId();
        Task updated = taskService.updateTask(id, updates, tenantId);
        return ResponseEntity.ok(ResultResponse.success(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResultResponse<Void>> deleteTask(@PathVariable UUID id) {
        UUID tenantId = TenantContextHolder.getTenantId();
        taskService.deleteTask(id, tenantId);
        return ResponseEntity.ok(ResultResponse.success(null));
    }
}
