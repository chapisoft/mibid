package com.mibid.workflow.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mibid.core.domain.enums.WorkflowStatus;
import com.mibid.core.exception.AppException;
import com.mibid.core.exception.ErrorCode;
import com.mibid.workflow.domain.WorkflowDefinitionEntity;
import com.mibid.workflow.repository.WorkflowDefinitionRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkflowDefinitionService {

    private final WorkflowDefinitionRepository workflowRepository;
    private final ObjectMapper objectMapper;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WorkflowDto {
        private String id;
        private String code;
        private String name;
        private String version;
        private String status;
        private String tenantId;
        private String tenantName;
        private String description;
        private List<Map<String, Object>> nodes;
        private List<Map<String, Object>> edges;
        private String createdAt;
        private String updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WorkflowTemplateDto {
        private String id;
        private String code;
        private String name;
        private String category;
        private String description;
        private List<Map<String, Object>> nodes;
        private List<Map<String, Object>> edges;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WorkflowValidationErrorDto {
        private String nodeId;
        private String edgeId;
        private String type;
        private String messageKey;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WorkflowValidationResultDto {
        private boolean isValid;
        private List<WorkflowValidationErrorDto> errors;
        private List<WorkflowValidationErrorDto> warnings;
    }

    @Transactional
    public List<WorkflowDto> getAllWorkflows(UUID tenantId) {
        return workflowRepository.findAllByTenantIdOrTemplates(tenantId)
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public WorkflowDto getWorkflowById(UUID id) {
        WorkflowDefinitionEntity entity = workflowRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.workflow.notFound"));
        return toDto(entity);
    }

    /**
     * Lưu hoặc cập nhật Workflow.
     * Quy tắc: name và tenantName bắt buộc do client truyền lên — không được tự điền giá trị mặc định.
     * Nếu thiếu → throw lỗi validation.
     */
    @Transactional
    public WorkflowDto saveWorkflow(WorkflowDto dto, UUID tenantId) {
        if (tenantId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "error.workflow.tenantIdRequired");
        }
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "error.workflow.nameRequired");
        }

        WorkflowDefinitionEntity entity;
        if (dto.getId() != null && !dto.getId().isBlank() && !dto.getId().startsWith("wf-")) {
            try {
                UUID uuid = UUID.fromString(dto.getId());
                entity = workflowRepository.findByIdAndDeletedFalse(uuid)
                        .orElse(new WorkflowDefinitionEntity());
            } catch (Exception e) {
                entity = new WorkflowDefinitionEntity();
            }
        } else {
            entity = new WorkflowDefinitionEntity();
        }

        entity.setCode(dto.getCode() != null && !dto.getCode().isBlank()
                ? dto.getCode()
                : "WF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        entity.setName(dto.getName());
        entity.setVersion(dto.getVersion() != null && !dto.getVersion().isBlank() ? dto.getVersion() : null);
        entity.setStatus(dto.getStatus() != null ? dto.getStatus() : WorkflowStatus.DRAFT.name());
        entity.setTenantId(tenantId);
        entity.setTenantName(dto.getTenantName());
        entity.setDescription(dto.getDescription());

        try {
            entity.setNodesJson(objectMapper.writeValueAsString(
                    dto.getNodes() != null ? dto.getNodes() : Collections.emptyList()));
            entity.setEdgesJson(objectMapper.writeValueAsString(
                    dto.getEdges() != null ? dto.getEdges() : Collections.emptyList()));
        } catch (Exception e) {
            log.error("Failed to serialize workflow nodes/edges to JSON", e);
            entity.setNodesJson("[]");
            entity.setEdgesJson("[]");
        }

        WorkflowDefinitionEntity saved = workflowRepository.save(entity);
        return toDto(saved);
    }

    @Transactional
    public WorkflowDto publishWorkflow(UUID id, UUID tenantId) {
        WorkflowDefinitionEntity entity = workflowRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.workflow.notFound"));

        entity.setStatus(WorkflowStatus.ACTIVE.name());
        String version = entity.getVersion();
        if (version != null && version.matches("v?\\d+\\.\\d+")) {
            String[] parts = version.replace("v", "").split("\\.");
            int major = Integer.parseInt(parts[0]);
            int minor = Integer.parseInt(parts[1]) + 1;
            entity.setVersion("v" + major + "." + minor);
        }

        WorkflowDefinitionEntity saved = workflowRepository.save(entity);
        return toDto(saved);
    }

    @Transactional
    @SuppressWarnings("null")
    public WorkflowDto cloneWorkflow(UUID id, UUID tenantId) {
        WorkflowDefinitionEntity original = workflowRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.workflow.notFound"));

        WorkflowDefinitionEntity clone = WorkflowDefinitionEntity.builder()
                .code(original.getCode() + "-COPY")
                .name(original.getName())
                .version(original.getVersion())
                .status(WorkflowStatus.DRAFT.name())
                .tenantId(tenantId)
                .tenantName(original.getTenantName())
                .description(original.getDescription())
                .nodesJson(original.getNodesJson())
                .edgesJson(original.getEdgesJson())
                .isTemplate(false)
                .build();

        WorkflowDefinitionEntity saved = workflowRepository.save(clone);
        return toDto(saved);
    }

    @Transactional
    public void deleteWorkflow(UUID id, UUID tenantId) {
        WorkflowDefinitionEntity entity = workflowRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.workflow.notFound"));
        entity.setDeleted(true);
        workflowRepository.save(entity);
    }

    /**
     * Trả danh sách Template workflow từ DB (bản ghi có isTemplate = true).
     * Không tự sinh mock data trong code.
     */
    @Transactional(readOnly = true)
    public List<WorkflowTemplateDto> getTemplates() {
        return workflowRepository.findAllTemplates()
                .stream()
                .map(entity -> {
                    List<Map<String, Object>> nodes = parseJsonList(entity.getNodesJson());
                    List<Map<String, Object>> edges = parseJsonList(entity.getEdgesJson());
                    return WorkflowTemplateDto.builder()
                            .id(entity.getId() != null ? entity.getId().toString() : null)
                            .code(entity.getCode())
                            .name(entity.getName())
                            .category(entity.getTemplateCategory())
                            .description(entity.getDescription())
                            .nodes(nodes)
                            .edges(edges)
                            .build();
                })
                .toList();
    }

    @Transactional
    public WorkflowTemplateDto saveTemplate(WorkflowTemplateDto dto) {
        WorkflowDefinitionEntity entity;
        if (dto.getId() != null && !dto.getId().isBlank()) {
            try {
                UUID uuid = UUID.fromString(dto.getId());
                entity = workflowRepository.findByIdAndDeletedFalse(uuid).orElse(new WorkflowDefinitionEntity());
            } catch (Exception e) {
                entity = new WorkflowDefinitionEntity();
            }
        } else {
            entity = new WorkflowDefinitionEntity();
        }
        entity.setCode(dto.getCode() != null && !dto.getCode().isBlank()
                ? dto.getCode()
                : "TPL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        entity.setName(dto.getName() != null && !dto.getName().isBlank() ? dto.getName() : "Mẫu Quy Trình Mới");
        entity.setTemplateCategory(dto.getCategory() != null ? dto.getCategory() : "STANDARD_TENDER");
        entity.setDescription(dto.getDescription());
        entity.setTemplate(true);
        entity.setStatus(WorkflowStatus.ACTIVE.name());
        try {
            entity.setNodesJson(objectMapper.writeValueAsString(dto.getNodes() != null ? dto.getNodes() : Collections.emptyList()));
            entity.setEdgesJson(objectMapper.writeValueAsString(dto.getEdges() != null ? dto.getEdges() : Collections.emptyList()));
        } catch (Exception e) {
            entity.setNodesJson("[]");
            entity.setEdgesJson("[]");
        }
        WorkflowDefinitionEntity saved = workflowRepository.save(entity);
        return WorkflowTemplateDto.builder()
                .id(saved.getId().toString())
                .code(saved.getCode())
                .name(saved.getName())
                .category(saved.getTemplateCategory())
                .description(saved.getDescription())
                .nodes(parseJsonList(saved.getNodesJson()))
                .edges(parseJsonList(saved.getEdgesJson()))
                .build();
    }

    private List<Map<String, Object>> parseJsonList(String json) {
        if (json == null || json.isBlank() || "[]".equals(json.trim())) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            log.warn("Failed to parse workflow JSON list, returning empty: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Validate cấu trúc workflow.
     * Message lỗi trả về là messageKey để FE tra cứu i18n.
     */
    public WorkflowValidationResultDto validateWorkflow(WorkflowDto dto) {
        List<WorkflowValidationErrorDto> errors = new ArrayList<>();
        List<WorkflowValidationErrorDto> warnings = new ArrayList<>();

        List<Map<String, Object>> nodes = dto.getNodes() != null ? dto.getNodes() : Collections.emptyList();
        List<Map<String, Object>> edges = dto.getEdges() != null ? dto.getEdges() : Collections.emptyList();

        boolean hasStart = nodes.stream().anyMatch(n -> "START".equals(n.get("type")));
        if (!hasStart) {
            errors.add(WorkflowValidationErrorDto.builder()
                    .type("ERROR")
                    .messageKey("error.workflow.validation.missingStartNode")
                    .build());
        }

        boolean hasEnd = nodes.stream().anyMatch(n -> "END".equals(n.get("type")));
        if (!hasEnd) {
            errors.add(WorkflowValidationErrorDto.builder()
                    .type("ERROR")
                    .messageKey("error.workflow.validation.missingEndNode")
                    .build());
        }

        // Kiểm tra isolated nodes: node không phải END mà không có cạnh đi ra
        if (!edges.isEmpty()) {
            Set<Object> sourcesWithEdge = new HashSet<>();
            for (Map<String, Object> edge : edges) {
                sourcesWithEdge.add(edge.get("source"));
            }
            for (Map<String, Object> node : nodes) {
                Object nodeType = node.get("type");
                Object nodeId = node.get("id");
                if (!"END".equals(nodeType) && !sourcesWithEdge.contains(nodeId)) {
                    warnings.add(WorkflowValidationErrorDto.builder()
                            .nodeId(nodeId != null ? nodeId.toString() : null)
                            .type("WARNING")
                            .messageKey("error.workflow.validation.isolatedNode")
                            .build());
                }
            }
        }

        return WorkflowValidationResultDto.builder()
                .isValid(errors.isEmpty())
                .errors(errors)
                .warnings(warnings)
                .build();
    }

    private WorkflowDto toDto(WorkflowDefinitionEntity entity) {
        // Trả đúng dữ liệu từ DB. Nếu nodes/edges chưa có → trả list rỗng.
        // Tuyệt đối không fallback về mock data.
        List<Map<String, Object>> nodes = parseJsonList(entity.getNodesJson());
        List<Map<String, Object>> edges = parseJsonList(entity.getEdgesJson());

        return WorkflowDto.builder()
                .id(entity.getId() != null ? entity.getId().toString() : null)
                .code(entity.getCode())
                .name(entity.getName())
                .version(entity.getVersion())
                .status(entity.getStatus() != null ? entity.getStatus() : WorkflowStatus.DRAFT.name())
                .tenantId(entity.getTenantId() != null ? entity.getTenantId().toString() : null)
                .tenantName(entity.getTenantName())
                .description(entity.getDescription())
                .nodes(nodes)
                .edges(edges)
                .createdAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null)
                .updatedAt(entity.getUpdatedAt() != null ? entity.getUpdatedAt().toString() : null)
                .build();
    }
}
