# THIẾT KẾ CHI TIẾT CẤP THẤP (LLD) — PHÂN HỆ 2
## WORKFLOW ENGINE VÀ BỘ KIỂM SOÁT CHUYỂN BƯỚC (GATEKEEPER)
### MÃ TÀI LIỆU: MIBID_LLD_MOD02_v1.0

---

## 1. TỔNG QUAN PHÂN HỆ VÀ KIẾN TRÚC ĐỘNG CƠ LUỒNG LINH HOẠT

Phân hệ 2 chịu trách nhiệm quản trị mô hình máy trạng thái hữu hạn động (Dynamic Finite State Machine - FSM) cho từng gói thầu xuất nhập khẩu. Hệ thống cho phép:
1. Định nghĩa và tùy biến sơ đồ chuyển bước dạng đồ thị có hướng (Directed Acyclic Graph - DAG) qua bảng `workflow_transitions`.
2. Hỗ trợ rẽ nhánh luồng động thông qua bộ đánh giá biểu thức điều kiện (Condition Evaluator) dựa trên metadata của từng gói thầu (Loại chủ đầu tư, Giá trị ngân sách, Yêu cầu bảo lãnh ngân hàng).
3. Cho phép Quản lý dự án nhân bản và ghi đè quy trình riêng cho từng gói thầu (Project-level Workflow Snapshot & Override) mà không ảnh hưởng tới mẫu chung.
4. Thực thi ma trận 4 lớp điều kiện bảo đảm (Gatekeeper Criteria Matrix: Chứng từ AND/OR, Tiêu chí Checklist, Thương mại/Tài chính, Phê duyệt cấp bậc) với 3 chế độ kiểm soát thực thi (Hard Stop, Soft Warning, Manager Bypass).

---

## 2. CỔNG VÀO (INBOUND PORTS) VÀ ĐẶC TẢ DTO

```java
public interface WorkflowConfigurationUseCase {
    WorkflowTemplateResponse createTemplate(CreateWorkflowTemplateRequest request);
    ProjectWorkflowGraphResponse getProjectWorkflowGraph(UUID projectId);
    ProjectWorkflowGraphResponse overrideProjectWorkflow(UUID projectId, WorkflowOverrideRequest request);
    void resetProjectWorkflowToTemplate(UUID projectId);
}

public interface ProjectTransitionUseCase {
    GatekeeperEvaluationResult evaluateGatekeeper(UUID projectId, UUID targetStageId);
    TransitionResponse executeTransition(UUID projectId, TransitionRequest request);
    TransitionResponse approveBypassTransition(UUID transitionId, UUID managerId, String note);
}
```

### Các Cấu Trúc DTO Cốt Lõi:
* `WorkflowOverrideRequest`: Chứa danh sách các bước tùy biến `List<StageConfigDTO>` và danh sách các đường chuyển bước `List<TransitionLinkDTO>`.
* `GatekeeperEvaluationResult`:
  * `boolean canTransition`: Cho phép chuyển bước hay không.
  * `GatekeeperMode mode`: `PASSED`, `HARD_STOP`, `SOFT_WARNING`, `PENDING_BYPASS`.
  * `List<UnsatisfiedConditionDTO> violations`: Chi tiết các tiêu chí chưa đạt (Tài liệu thiếu, Checklist chưa hoàn thành, Chưa có phê duyệt).

---

## 3. CỔNG RA (OUTBOUND PORTS)

```java
public interface WorkflowRepositoryPort {
    Optional<WorkflowStage> findStageById(UUID stageId);
    List<WorkflowStage> findStagesByProjectId(UUID projectId);
    List<WorkflowTransition> findAllowedTransitions(UUID fromStageId);
    List<StageDocRule> findDocRulesByStageId(UUID stageId);
    List<StageChecklistItem> findChecklistItemsByStageId(UUID stageId);
    void saveProjectWorkflowSnapshot(UUID projectId, List<WorkflowStage> stages, List<WorkflowTransition> transitions);
}

public interface ProjectRepositoryPort {
    Optional<Project> findByIdWithLock(UUID projectId); // Pessimistic Lock
    Project save(Project project);
}

public interface ConditionEvaluatorPort {
    boolean evaluate(String conditionExpression, Map<String, Object> projectContext);
}

public interface DistributedLockPort {
    boolean acquireLock(String lockKey, Duration waitTime, Duration leaseTime);
    void releaseLock(String lockKey);
}

public interface OutboxEventPort {
    void publish(String eventType, Object payload);
}
```

---

## 4. ĐẶC TẢ RESTFUL API CONTRACTS & OPENAPI SCHEMAS

### 4.1. Endpoint Tùy Biến Luồng Quy Trình Riêng Cho Gói Thầu
* **Đường dẫn:** `PUT /api/v1/projects/{id}/workflow-override`
* **Request Payload Schema:**
```json
{
  "stages": [
    {
      "code": "PREP",
      "name": "Chuẩn bị Hồ sơ",
      "sequence": 1,
      "stage_type": "MANUAL",
      "sla_hours": 48
    },
    {
      "code": "BANK_GUARANTEE",
      "name": "Thẩm định Bảo lãnh Ngân hàng",
      "sequence": 2,
      "stage_type": "APPROVAL",
      "sla_hours": 24
    },
    {
      "code": "SOURCING",
      "name": "Hỏi giá Vốn Nhà cung cấp",
      "sequence": 3,
      "stage_type": "MANUAL",
      "sla_hours": 72
    }
  ],
  "transitions": [
    {
      "from_stage_code": "PREP",
      "to_stage_code": "BANK_GUARANTEE",
      "condition_expression": "context['has_bank_guarantee'] == true"
    },
    {
      "from_stage_code": "PREP",
      "to_stage_code": "SOURCING",
      "condition_expression": "context['has_bank_guarantee'] == false"
    }
  ]
}
```

### 4.2. Endpoint Kéo Thẻ Chuyển Bước Kèm Đánh Giá Gatekeeper
* **Đường dẫn:** `POST /api/v1/projects/{id}/transitions`
* **Request Payload Schema:**
```json
{
  "target_stage_id": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
  "force_warning": false,
  "transition_note": "Chuyển bước sau khi hoàn thiện toàn bộ checklist"
}
```
* **Response Payload Khi Bị Chặn Cứng (422 Unprocessable Entity):**
```json
{
  "error_code": "GATEKEEPER_HARD_STOP_VIOLATION",
  "message": "Không thể chuyển bước: Hồ sơ vi phạm các điều kiện bảo đảm bắt buộc",
  "details": {
    "gatekeeper_mode": "HARD_STOP",
    "missing_documents": [
      {
        "doc_type_code": "CO_CQ",
        "doc_type_name": "Chứng chỉ Xuất xứ & Chất lượng (CO/CQ)",
        "requires_approval": true,
        "current_status": "PENDING"
      }
    ],
    "uncompleted_checklists": [
      {
        "checklist_id": "chk-123",
        "title": "Đã đối chiếu bảng thông số kỹ thuật với HSMT mục 3.2"
      }
    ]
  }
}
```

---

## 5. LOGIC NGHIỆP VỤ VÀ MÃ GIẢ (PSEUDOCODE)

```java
@Service
public class ProjectTransitionServiceImpl implements ProjectTransitionUseCase {

    private final ProjectRepositoryPort projectRepository;
    private final WorkflowRepositoryPort workflowRepository;
    private final ConditionEvaluatorPort conditionEvaluator;
    private final DistributedLockPort distributedLockPort;
    private final OutboxEventPort outboxEventPort;

    @Transactional
    public TransitionResponse executeTransition(UUID projectId, TransitionRequest request) {
        String lockKey = "lock:project:transition:" + projectId;
        boolean locked = distributedLockPort.acquireLock(lockKey, Duration.ofSeconds(5), Duration.ofSeconds(10));
        if (!locked) {
            throw new ConcurrencyException("GATEKEEPER_CONCURRENCY_CONFLICT", "Dự án đang được thao tác bởi người dùng khác");
        }

        try {
            Project project = projectRepository.findByIdWithLock(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy dự án định danh: " + projectId));

            UUID currentStageId = project.getCurrentStageId();
            UUID targetStageId = request.getTargetStageId();

            // 1. Kiểm tra tính hợp lệ của đường chuyển bước (DAG Transition)
            List<WorkflowTransition> allowedTransitions = workflowRepository.findAllowedTransitions(currentStageId);
            WorkflowTransition matchingTransition = allowedTransitions.stream()
                .filter(t -> t.getToStageId().equals(targetStageId))
                .findFirst()
                .orElseThrow(() -> new InvalidTransitionException("WORKFLOW_INVALID_TRANSITION", "Không tồn tại đường chuyển bước từ giai đoạn hiện tại sang giai đoạn đích"));

            // 2. Đánh giá biểu thức điều kiện rẽ nhánh (nếu có cấu hình condition_expression)
            if (matchingTransition.getConditionExpression() != null && !matchingTransition.getConditionExpression().isEmpty()) {
                Map<String, Object> context = buildProjectContext(project);
                boolean conditionPassed = conditionEvaluator.evaluate(matchingTransition.getConditionExpression(), context);
                if (!conditionPassed) {
                    throw new TransitionConditionFailedException("TRANSITION_CONDITION_NOT_MET", "Không thỏa mãn điều kiện rẽ nhánh: " + matchingTransition.getConditionExpression());
                }
            }

            // 3. Đánh giá Ma trận 4 lớp Điều kiện Bảo đảm (Gatekeeper Evaluation)
            GatekeeperEvaluationResult eval = evaluateGatekeeperInternal(project, targetStageId);
            if (!eval.isCanTransition()) {
                if (eval.getMode() == GatekeeperMode.HARD_STOP) {
                    throw new GatekeeperViolationException("GATEKEEPER_HARD_STOP_VIOLATION", eval.getViolations());
                }
                if (eval.getMode() == GatekeeperMode.SOFT_WARNING && !request.isForceWarning()) {
                    throw new GatekeeperWarningPromptException("GATEKEEPER_SOFT_WARNING", eval.getViolations());
                }
                if (eval.getMode() == GatekeeperMode.MANAGER_BYPASS) {
                    // Đưa vào hàng đợi chờ duyệt vượt cấp
                    project.setBypassStatus("PENDING_BYPASS");
                    projectRepository.save(project);
                    outboxEventPort.publish("PROJECT_BYPASS_REQUESTED", new BypassRequestedPayload(projectId, targetStageId, request.getNote()));
                    return new TransitionResponse(projectId, currentStageId, currentStageId, "PENDING_BYPASS");
                }
            }

            // 4. Cập nhật bước mới thành công
            project.setCurrentStageId(targetStageId);
            project.setBypassStatus("NONE");
            Project savedProject = projectRepository.save(project);

            // 5. Ghi nhật ký kiểm toán vào bảng project_transition_logs
            ProjectTransitionLog log = new ProjectTransitionLog();
            log.setProjectId(projectId);
            log.setFromStageId(currentStageId);
            log.setToStageId(targetStageId);
            log.setNote(request.getNote());
            log.setTransitionType(request.isForceWarning() ? "SOFT_FORCED" : "STANDARD");
            transitionLogRepository.save(log);

            // 6. Bắn sự kiện ra Outbox Table để kích hoạt Dynamic Task Dispatcher ở Phân hệ 4
            outboxEventPort.publish("PROJECT_STAGE_CHANGED", new StageChangedPayload(projectId, targetStageId));

            return new TransitionResponse(projectId, currentStageId, targetStageId, "COMPLETED");
        } finally {
            distributedLockPort.releaseLock(lockKey);
        }
    }
}
```

---

## 6. MA TRẬN MÃ LỖI NGHIỆP VỤ PHÂN HỆ 2

| Mã lỗi hệ thống | Mã HTTP | Mô tả nguyên nhân nghiệp vụ | Hướng xử lý phía Client |
| :--- | :---: | :--- | :--- |
| `WORKFLOW_INVALID_TRANSITION` | 400 | Đường chuyển bước không nằm trong sơ đồ DAG quy định. | Kéo thẻ theo đúng các đường liên kết được phép. |
| `TRANSITION_CONDITION_NOT_MET` | 422 | Không thỏa mãn điều kiện rẽ nhánh (ngân sách, loại CĐT). | Kiểm tra lại thông tin hồ sơ thầu. |
| `GATEKEEPER_HARD_STOP_VIOLATION`| 422 | Thiếu chứng từ hoặc checklist bắt buộc của bước. | Bổ sung đầy đủ chứng từ và tích chọn checklist. |
| `GATEKEEPER_SOFT_WARNING` | 409 | Còn thiếu các tiêu chí khuyến nghị chưa hoàn thành. | Hiển thị Popup cảnh báo vàng, yêu cầu nhập lý do xác nhận. |
| `GATEKEEPER_CONCURRENCY_CONFLICT`| 423 | Xung đột khóa phân tán do 2 người kéo thẻ đồng thời. | Tự động thử lại sau 3 giây. |
| `BYPASS_PERMISSION_DENIED` | 403 | Người dùng không có thẩm quyền duyệt ngoại lệ đặc cách. | Chuyển yêu cầu lên Giám đốc có thẩm quyền. |
