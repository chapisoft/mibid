package com.mibid.workflow.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.time.Instant;
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
        private String message;
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
        List<WorkflowDefinitionEntity> list = workflowRepository.findAllByTenantIdOrTemplates(tenantId);
        if (list.isEmpty()) {
            initSeedWorkflows(tenantId);
            list = workflowRepository.findAllByTenantIdOrTemplates(tenantId);
        }
        return list.stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public WorkflowDto getWorkflowById(UUID id) {
        WorkflowDefinitionEntity entity = workflowRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy quy trình với ID: " + id));
        return toDto(entity);
    }

    @Transactional
    public WorkflowDto saveWorkflow(WorkflowDto dto, UUID tenantId) {
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

        entity.setCode(dto.getCode() != null && !dto.getCode().isBlank() ? dto.getCode() : "WF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        entity.setName(dto.getName() != null ? dto.getName() : "Quy trình thiết kế");
        entity.setVersion(dto.getVersion() != null ? dto.getVersion() : "v1.0");
        entity.setStatus(dto.getStatus() != null ? dto.getStatus() : "DRAFT");
        entity.setTenantId(tenantId);
        entity.setTenantName(dto.getTenantName() != null ? dto.getTenantName() : "Doanh nghiệp thành viên");
        entity.setDescription(dto.getDescription());

        try {
            entity.setNodesJson(objectMapper.writeValueAsString(dto.getNodes() != null ? dto.getNodes() : Collections.emptyList()));
            entity.setEdgesJson(objectMapper.writeValueAsString(dto.getEdges() != null ? dto.getEdges() : Collections.emptyList()));
        } catch (Exception e) {
            log.error("Lỗi serialize nodes/edges json", e);
            entity.setNodesJson("[]");
            entity.setEdgesJson("[]");
        }

        WorkflowDefinitionEntity saved = workflowRepository.save(entity);
        return toDto(saved);
    }

    @Transactional
    public WorkflowDto publishWorkflow(UUID id, UUID tenantId) {
        WorkflowDefinitionEntity entity = workflowRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy quy trình với ID: " + id));

        entity.setStatus("ACTIVE");
        String version = entity.getVersion();
        if (version != null && version.matches("v?\\d+\\.\\d+")) {
            String[] parts = version.replace("v", "").split("\\.");
            int major = Integer.parseInt(parts[0]);
            int minor = Integer.parseInt(parts[1]) + 1;
            entity.setVersion("v" + major + "." + minor);
        } else {
            entity.setVersion("v2.0");
        }

        WorkflowDefinitionEntity saved = workflowRepository.save(entity);
        return toDto(saved);
    }

    @Transactional
    public WorkflowDto cloneWorkflow(UUID id, UUID tenantId) {
        WorkflowDefinitionEntity original = workflowRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy quy trình gốc với ID: " + id));

        WorkflowDefinitionEntity clone = WorkflowDefinitionEntity.builder()
                .code(original.getCode() + "-COPY")
                .name(original.getName() + " (Bản sao)")
                .version("v1.0")
                .status("DRAFT")
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
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy quy trình với ID: " + id));
        entity.setDeleted(true);
        workflowRepository.save(entity);
    }

    private static final String DEFAULT_NODES_JSON = """
        [{"id":"node-start","type":"START","x":80,"y":200,"data":{"title":"Bắt Đầu Gói Thầu","subtitle":"Khai báo thông tin dự án","code":"START_NODE","stageKey":"STAGE_PREPARATION","department":"BID_MANAGER","slaDays":1,"description":"Tiếp nhận thông báo mời thầu từ hệ thống mạng đấu thầu quốc gia hoặc chủ đầu tư","gatekeeper":{"layer1DocChecklist":{"enabled":true,"mandatoryDocumentKeys":["HSMT_GOC","QUYET_DINH_MO_THAU"],"minimumFilesCount":1},"layer2Financial":{"enabled":false},"layer3Approval":{"enabled":false},"layer4DistributedLock":{"enabled":false}}}},{"id":"node-prep","type":"STAGE","x":340,"y":200,"data":{"title":"Khảo Sát Yêu Cầu HSMT","subtitle":"Bóc tách BoQ & Kỹ thuật","code":"STAGE_PREP","stageKey":"STAGE_PREPARATION","department":"TECHNICAL","slaDays":3,"description":"Rà soát tiêu chuẩn kỹ thuật thiết bị 220kV, bảng dữ liệu kỹ thuật và yêu cầu nghiệm thu","gatekeeper":{"layer1DocChecklist":{"enabled":true,"mandatoryDocumentKeys":["BANG_BOC_TACH_BOQ","BIEN_BAN_KHAO_SAT"],"minimumFilesCount":2},"layer2Financial":{"enabled":false},"layer3Approval":{"enabled":true,"requiredApproverRoles":["TECHNICAL_LEAD"],"minApprovalLevel":1},"layer4DistributedLock":{"enabled":false}}}},{"id":"node-sourcing","type":"STAGE","x":600,"y":200,"data":{"title":"Sourcing & Báo Giá NCC","subtitle":"Phát hành Magic Link RFQ","code":"STAGE_SOURCING","stageKey":"STAGE_SOURCING","department":"COMMERCIAL","slaDays":5,"description":"Phát hành RFQ tới các nhà chế tạo quốc tế (Siemens, Hitachi, TBEA, Hyosung) và tổng hợp so sánh Landed Cost","gatekeeper":{"layer1DocChecklist":{"enabled":true,"mandatoryDocumentKeys":["BAO_GIA_NCC_CIF","BANG_SO_SANH_LANDED_COST"],"minimumFilesCount":2},"layer2Financial":{"enabled":true,"maxBudgetThresholdVnd":185000000000,"minBidBondPercentage":1.5,"targetProfitMargin":12.5},"layer3Approval":{"enabled":true,"requiredApproverRoles":["SOURCING_DIRECTOR"],"minApprovalLevel":2},"layer4DistributedLock":{"enabled":false}}}},{"id":"node-dossier","type":"STAGE","x":860,"y":200,"data":{"title":"Lập Hồ Sơ Dự Thầu (HSDT)","subtitle":"Kỹ thuật, Tài chính & Pháp lý","code":"STAGE_DOSSIER","stageKey":"STAGE_DOSSIER_PREP","department":"BID_MANAGER","slaDays":4,"description":"Hoàn thiện đề xuất kỹ thuật, đơn dự thầu, bảo lãnh dự thầu ngân hàng Swift MT760 và hồ sơ năng lực kinh nghiệm","gatekeeper":{"layer1DocChecklist":{"enabled":true,"mandatoryDocumentKeys":["DON_DU_THAU","BAO_LANH_NGAN_HANG","HO_SO_KY_THUAT"],"minimumFilesCount":3},"layer2Financial":{"enabled":true,"maxBudgetThresholdVnd":185000000000,"minBidBondPercentage":2.0,"targetProfitMargin":10.0},"layer3Approval":{"enabled":true,"requiredApproverRoles":["LEGAL_CHIEF","CFO"],"minApprovalLevel":2},"layer4DistributedLock":{"enabled":false}}}},{"id":"node-approval","type":"APPROVAL","x":1120,"y":200,"data":{"title":"Hội Đồng Phê Duyệt Chốt Giá","subtitle":"Ban Tổng Giám Đốc","code":"STAGE_APPROVAL","stageKey":"STAGE_INTERNAL_REVIEW","department":"BOARD_OF_DIRECTORS","slaDays":1,"description":"Chốt giá dự thầu cuối cùng, tỷ lệ giảm giá, phương án thanh toán và ký số phê duyệt","gatekeeper":{"layer1DocChecklist":{"enabled":true,"mandatoryDocumentKeys":["TO_TRINH_PHE_DUYET_GIA","BIEN_BAN_HOP_HDQT"],"minimumFilesCount":1},"layer2Financial":{"enabled":true,"maxBudgetThresholdVnd":185000000000,"minBidBondPercentage":2.0,"targetProfitMargin":10.0},"layer3Approval":{"enabled":true,"requiredApproverRoles":["CEO","DEPUTY_CEO_TECH"],"minApprovalLevel":3},"layer4DistributedLock":{"enabled":true,"lockKey":"LOCK_FINAL_BID_SUBMISSION","leaseTimeSeconds":300,"retryAttempts":5}}}},{"id":"node-end","type":"END","x":1380,"y":200,"data":{"title":"Nộp Thầu Thành Công","subtitle":"Niêm phong số & Biên lai nộp","code":"END_NODE","stageKey":"STAGE_SUBMITTED","department":"BID_MANAGER","slaDays":0,"description":"Hồ sơ dự thầu đã được mã hóa bằng chứng thư số công cộng và nộp thành công lên hệ thống đấu thầu","gatekeeper":{"layer1DocChecklist":{"enabled":true,"mandatoryDocumentKeys":["BIEN_LAI_NOP_THAU_SO"],"minimumFilesCount":1},"layer2Financial":{"enabled":false},"layer3Approval":{"enabled":false},"layer4DistributedLock":{"enabled":false}}}}]
        """;

    private static final String DEFAULT_EDGES_JSON = """
        [{"id":"edge-1","sourceNodeId":"node-start","targetNodeId":"node-prep","sourceHandle":"right","targetHandle":"left","label":"Bàn giao HSMT","color":"#3b82f6"},{"id":"edge-2","sourceNodeId":"node-prep","targetNodeId":"node-sourcing","sourceHandle":"right","targetHandle":"left","label":"BoQ đã chốt","color":"#10b981"},{"id":"edge-3","sourceNodeId":"node-sourcing","targetNodeId":"node-dossier","sourceHandle":"right","targetHandle":"left","label":"Báo giá NCC đầy đủ","color":"#6366f1"},{"id":"edge-4","sourceNodeId":"node-dossier","targetNodeId":"node-approval","sourceHandle":"right","targetHandle":"left","label":"Trình phê duyệt","color":"#f59e0b"},{"id":"edge-5","sourceNodeId":"node-approval","targetNodeId":"node-end","sourceHandle":"right","targetHandle":"left","label":"Đã phê duyệt","color":"#8b5cf6"}]
        """;

    public List<WorkflowTemplateDto> getTemplates() {
        List<Map<String, Object>> defaultNodes = parseJsonList(DEFAULT_NODES_JSON);
        List<Map<String, Object>> defaultEdges = parseJsonList(DEFAULT_EDGES_JSON);

        List<WorkflowTemplateDto> templates = new ArrayList<>();
        templates.add(WorkflowTemplateDto.builder()
                .id("tpl-standard-01")
                .code("TPL-STANDARD")
                .name("Quy Trình Chuẩn Hóa HSMT & Gatekeeper 4 Lớp")
                .category("STANDARD")
                .description("Quy trình 6 giai đoạn tiêu chuẩn tích hợp đầy đủ 4 lớp Gatekeeper (Hồ sơ, Tài chính, Phê duyệt, Khóa Redisson).")
                .nodes(defaultNodes)
                .edges(defaultEdges)
                .build());
        templates.add(WorkflowTemplateDto.builder()
                .id("tpl-fast-02")
                .code("TPL-FAST-TRACK")
                .name("Quy Trình Sourcing Khẩn Cấp & Phê Duyệt Nhanh Fast-Track")
                .category("FAST_TRACK")
                .description("Quy trình rút gọn xử lý sự cố thiết bị lưới điện truyền tải trong 48h với cơ chế phê duyệt ủy quyền 1 cấp.")
                .nodes(defaultNodes)
                .edges(defaultEdges)
                .build());
        templates.add(WorkflowTemplateDto.builder()
                .id("tpl-epc-03")
                .code("TPL-EPC-INTL")
                .name("Quy Trình Dự Thầu EPC Quốc Tế & Bảo Lãnh Swift Ngân Hàng")
                .category("EPC_INTERNATIONAL")
                .description("Quy trình đấu thầu quốc tế gói EPC kiểm soát tỷ giá Hedging, bảo lãnh MT760 và vận đơn B/L.")
                .nodes(defaultNodes)
                .edges(defaultEdges)
                .build());
        return templates;
    }

    private List<Map<String, Object>> parseJsonList(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    public WorkflowValidationResultDto validateWorkflow(WorkflowDto dto) {
        List<WorkflowValidationErrorDto> errors = new ArrayList<>();
        List<WorkflowValidationErrorDto> warnings = new ArrayList<>();

        List<Map<String, Object>> nodes = dto.getNodes() != null ? dto.getNodes() : Collections.emptyList();
        List<Map<String, Object>> edges = dto.getEdges() != null ? dto.getEdges() : Collections.emptyList();

        boolean hasStart = nodes.stream().anyMatch(n -> "START".equals(n.get("type")));
        if (!hasStart) {
            errors.add(new WorkflowValidationErrorDto(null, null, "ERROR", "Quy trình bắt buộc phải có ít nhất 1 Start Node."));
        }

        boolean hasEnd = nodes.stream().anyMatch(n -> "END".equals(n.get("type")));
        if (!hasEnd) {
            errors.add(new WorkflowValidationErrorDto(null, null, "ERROR", "Quy trình bắt buộc phải có ít nhất 1 End Node."));
        }

        return WorkflowValidationResultDto.builder()
                .isValid(errors.isEmpty())
                .errors(errors)
                .warnings(warnings)
                .build();
    }

    private WorkflowDto toDto(WorkflowDefinitionEntity entity) {
        List<Map<String, Object>> nodes = Collections.emptyList();
        List<Map<String, Object>> edges = Collections.emptyList();

        try {
            if (entity.getNodesJson() != null && !entity.getNodesJson().isBlank() && !entity.getNodesJson().equals("[]")) {
                nodes = objectMapper.readValue(entity.getNodesJson(), new TypeReference<List<Map<String, Object>>>() {});
            } else {
                nodes = parseJsonList(DEFAULT_NODES_JSON);
            }
            if (entity.getEdgesJson() != null && !entity.getEdgesJson().isBlank() && !entity.getEdgesJson().equals("[]")) {
                edges = objectMapper.readValue(entity.getEdgesJson(), new TypeReference<List<Map<String, Object>>>() {});
            } else {
                edges = parseJsonList(DEFAULT_EDGES_JSON);
            }
        } catch (Exception e) {
            log.error("Lỗi parse nodes/edges JSON", e);
            nodes = parseJsonList(DEFAULT_NODES_JSON);
            edges = parseJsonList(DEFAULT_EDGES_JSON);
        }

        return WorkflowDto.builder()
                .id(entity.getId() != null ? entity.getId().toString() : "")
                .code(entity.getCode())
                .name(entity.getName())
                .version(entity.getVersion() != null ? entity.getVersion() : "v1.0")
                .status(entity.getStatus() != null ? entity.getStatus() : "ACTIVE")
                .tenantId(entity.getTenantId() != null ? entity.getTenantId().toString() : "11111111-1111-1111-1111-111111111111")
                .tenantName(entity.getTenantName() != null ? entity.getTenantName() : "Tổng Công Ty Thiết Bị Điện Đông Anh (EEMC)")
                .description(entity.getDescription())
                .nodes(nodes)
                .edges(edges)
                .createdAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : Instant.now().toString())
                .updatedAt(entity.getUpdatedAt() != null ? entity.getUpdatedAt().toString() : Instant.now().toString())
                .build();
    }

    private void initSeedWorkflows(UUID tenantId) {
        WorkflowDefinitionEntity wf1 = WorkflowDefinitionEntity.builder()
                .code("WF-EEMC-2026-v2.1")
                .name("Quy Trình Quản Lý Hồ Sơ Thầu & Gatekeeper Thiết Bị 220kV")
                .version("v2.1")
                .status("ACTIVE")
                .tenantId(tenantId)
                .tenantName("Tổng Công Ty Thiết Bị Điện Đông Anh (EEMC)")
                .description("Quy trình chuẩn hóa toàn diện từ tiếp nhận HSMT, phân rã BoQ, sourcing Magic Link, tính toán Landed Cost đa ngoại tệ đến kiểm soát 4 lớp Gatekeeper.")
                .nodesJson(DEFAULT_NODES_JSON)
                .edgesJson(DEFAULT_EDGES_JSON)
                .isTemplate(false)
                .build();

        WorkflowDefinitionEntity wf2 = WorkflowDefinitionEntity.builder()
                .code("WF-FAST-TRACK-2026")
                .name("Quy Trình Sourcing Khẩn Cấp & Phê Duyệt Nhanh Fast-Track")
                .version("v1.4")
                .status("ACTIVE")
                .tenantId(tenantId)
                .tenantName("Ban Mua Sắm Tập Trung EVN")
                .description("Quy trình rút gọn xử lý sự cố thiết bị lưới điện truyền tải trong 48h với cơ chế phê duyệt ủy quyền 1 cấp Manager Bypass.")
                .nodesJson(DEFAULT_NODES_JSON)
                .edgesJson(DEFAULT_EDGES_JSON)
                .isTemplate(false)
                .build();

        WorkflowDefinitionEntity wf3 = WorkflowDefinitionEntity.builder()
                .code("WF-EPC-LOGISTICS-2026")
                .name("Quy Trình Dự Thầu EPC Quốc Tế & Bảo Lãnh Swift Ngân Hàng")
                .version("v1.0")
                .status("DRAFT")
                .tenantId(tenantId)
                .tenantName("Tập đoàn Dầu Khí Quốc Gia Việt Nam (PVN)")
                .description("Quy trình đấu thầu quốc tế gói EPC Nhà máy điện Nhơn Trạch 3 & 4 kiểm soát tỷ giá Hedging, bảo lãnh MT760 và vận đơn B/L.")
                .nodesJson(DEFAULT_NODES_JSON)
                .edgesJson(DEFAULT_EDGES_JSON)
                .isTemplate(false)
                .build();

        WorkflowDefinitionEntity wf4 = WorkflowDefinitionEntity.builder()
                .code("WF-SPARE-PARTS-2026")
                .name("Quy Trình Mua Sắm Phụ Tùng Máy Biến Áp & Dầu Cách Điện")
                .version("v1.2")
                .status("DRAFT")
                .tenantId(tenantId)
                .tenantName("Tổng Công Ty Thiết Bị Điện Đông Anh (EEMC)")
                .description("Quy trình định kỳ mua sắm vật tư tiêu hao, sứ xuyên và dầu máy biến áp theo hợp đồng khung 12 tháng.")
                .nodesJson(DEFAULT_NODES_JSON)
                .edgesJson(DEFAULT_EDGES_JSON)
                .isTemplate(false)
                .build();

        workflowRepository.saveAll(List.of(wf1, wf2, wf3, wf4));
    }
}
