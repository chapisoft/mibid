# THIẾT KẾ CHI TIẾT CẤP THẤP (LLD) — PHÂN HỆ 4
## QUẢN TRỊ CÔNG VIỆC VI MÔ VÀ HỒ SƠ DỰ THẦU (BIDDING TASKS & ASSEMBLY)
### MÃ TÀI LIỆU: MIBID_LLD_MOD04_v1.0

---

## 1. TỔNG QUAN PHÂN HỆ VÀ KIẾN TRÚC ĐỘNG CƠ CÔNG VIỆC LINH HOẠT

Phân hệ 4 cung cấp dịch vụ điều phối công việc vi mô thông minh (Dynamic Task Dispatcher Engine) và giải pháp đóng gói hồ sơ dự thầu số hóa. Kiến trúc phân hệ tập trung vào 4 năng lực kỹ thuật then chốt:
1. **Bộ Điều Phối Công Việc Theo Điều Kiện (Conditional Task Dispatcher):** Tự động phân tích các thuộc tính của gói thầu (Loại chủ đầu tư Nhà nước/FDI/Tư nhân, Ngành hàng, Giá trị ngân sách, Điều kiện Incoterms) khi nhận sự kiện chuyển bước để quyết định sinh đúng danh mục công việc cần thiết.
2. **Bộ Tính Toán SLA Động (Dynamic SLA Engine):** Tự động điều chỉnh số giờ định mức của từng công việc dựa trên khoảng thời gian còn lại đến hạn nộp thầu chính thức.
3. **Quản Trị Công Việc Đột Xuất (Ad-hoc Task Injection):** Cho phép Quản lý dự án bổ sung đầu việc ngoài kế hoạch, phân công chéo phòng ban và gia hạn thời gian tại thời gian thực.
4. **Chốt Chặn Hoàn Thành Công Việc (Task Completion Gate):** Tích hợp với Gatekeeper Engine ở Phân hệ 2 để chặn chuyển bước khi còn công việc bắt buộc (Mandatory Gate) chưa đạt trạng thái `DONE`.

---

## 2. CỔNG VÀO (INBOUND PORTS) VÀ ĐẶC TẢ DTO

```java
public interface TaskManagementUseCase {
    List<TaskResponse> getProjectTasks(UUID projectId, TaskFilterRequest filter);
    TaskResponse createAdhocTask(UUID projectId, CreateAdhocTaskRequest request);
    TaskResponse updateTaskStatus(UUID taskId, TaskStatusUpdateDTO request);
    void reassignTask(UUID taskId, UUID newAssigneeId);
    boolean checkMandatoryTasksCompleted(UUID projectId, UUID stageId);
    void handleStageChangedEvent(UUID projectId, UUID newStageId);
}

public interface TenderPackagingUseCase {
    TenderPackageValidationResponse validateDocumentsForPackaging(UUID projectId, List<UUID> documentIds);
    TenderPackageResponse assembleTenderPackage(UUID projectId, PackageAssemblyRequest request);
}
```

---

## 3. CỔNG RA (OUTBOUND PORTS)

```java
public interface TaskRepositoryPort {
    List<ProjectTask> findByProjectIdAndStageId(UUID projectId, UUID stageId);
    Optional<ProjectTask> findById(UUID taskId);
    ProjectTask save(ProjectTask task);
    List<ProjectTask> saveAll(List<ProjectTask> tasks);
    long countUnfinishedMandatoryTasks(UUID projectId, UUID stageId);
}

public interface StageTaskTemplatePort {
    List<WorkflowStageTask> findTemplatesByStageId(UUID stageId);
}

public interface ConditionEvaluatorPort {
    boolean evaluate(String conditionExpression, Map<String, Object> projectContext);
}

public interface NotificationPort {
    void sendInAppNotification(UUID userId, String title, String content, String link);
    void broadcastTaskStatusUpdated(UUID projectId, TaskResponse task);
}
```

---

## 4. ĐẶC TẢ RESTFUL API CONTRACTS & OPENAPI SCHEMAS

### 4.1. Endpoint Tạo Công Việc Đột Xuất Của Quản Lý Dự Án
* **Đường dẫn:** `POST /api/v1/projects/{id}/tasks`
* **Request Payload Schema:**
```json
{
  "stage_id": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
  "title": "Thẩm tra năng lực tài chính nhà thầu liên danh",
  "description": "Kiểm tra báo cáo tài chính kiểm toán và thư cam kết hạn mức tín dụng",
  "assignee_id": "u1a2b3c4-d5e6-7a8b-9c0d-1e2f3a4b5c6d",
  "priority": "HIGH",
  "due_date": "2026-09-03T17:00:00Z",
  "is_mandatory_gate": true
}
```
* **Response Payload Thành Công (201 Created):**
```json
{
  "task_id": "t9a8b7c6-d5e4-3f2a-1b0c-9d8e7f6a5b4c",
  "project_id": "c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f",
  "title": "Thẩm tra năng lực tài chính nhà thầu liên danh",
  "status": "TODO",
  "priority": "HIGH",
  "is_adhoc": true,
  "is_mandatory_gate": true,
  "created_at": "2026-09-01T12:20:00Z"
}
```

### 4.2. Endpoint Cập Nhật Trạng Thái Công Việc Kèm Biên Bản Hoàn Thành
* **Đường dẫn:** `PATCH /api/v1/tasks/{id}/status`
* **Request Payload Schema:**
```json
{
  "status": "DONE",
  "completion_note": "Đã thu thập và đối chiếu đủ 3 báo giá cạnh tranh từ các nhà sản xuất.",
  "attachment_ids": [
    "doc-1111-2222-3333-4444-555555555555"
  ]
}
```

---

## 5. LOGIC NGHIỆP VỤ VÀ MÃ GIẢ (PSEUDOCODE)

```java
@Service
public class TaskManagementServiceImpl implements TaskManagementUseCase {

    private final TaskRepositoryPort taskRepository;
    private final StageTaskTemplatePort stageTaskTemplatePort;
    private final ProjectRepositoryPort projectRepository;
    private final ConditionEvaluatorPort conditionEvaluator;
    private final NotificationPort notificationPort;

    // Logic Bộ điều phối tự động sinh Task theo điều kiện động khi nhận sự kiện chuyển bước
    @EventListener
    @Transactional
    public void handleStageChangedEvent(UUID projectId, UUID newStageId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy dự án: " + projectId));

        List<WorkflowStageTask> templates = stageTaskTemplatePort.findTemplatesByStageId(newStageId);
        if (templates.isEmpty()) {
            return;
        }

        Map<String, Object> context = buildProjectContext(project);
        List<ProjectMember> members = projectMemberRepository.findByProjectId(projectId);
        List<ProjectTask> tasksToCreate = new ArrayList<>();

        // Tính toán khoảng thời gian còn lại đến hạn nộp thầu
        Duration timeToSubmission = Duration.between(Instant.now(), project.getSubmissionDeadline());
        boolean isUrgentTender = timeToSubmission.toHours() < 72; // Gói thầu khẩn dưới 3 ngày

        for (WorkflowStageTask tmpl : templates) {
            // Đánh giá biểu thức điều kiện (nếu có cấu hình condition_rule)
            if (tmpl.getConditionRule() != null && !tmpl.getConditionRule().isEmpty()) {
                boolean isEligible = conditionEvaluator.evaluate(tmpl.getConditionRule(), context);
                if (!isEligible) {
                    continue; // Bỏ qua task không phù hợp với đặc thù gói thầu
                }
            }

            // Tính toán hạn SLA động
            long effectiveSlaHours = tmpl.getSlaHours();
            if (isUrgentTender && effectiveSlaHours > 8) {
                effectiveSlaHours = Math.max(4, effectiveSlaHours / 3); // Co ngắn SLA cho gói khẩn
            }
            Instant dueDate = Instant.now().plus(Duration.ofHours(effectiveSlaHours));

            // Tìm nhân sự tương ứng với vai trò
            UUID assigneeId = members.stream()
                .filter(m -> m.getProjectRole().equalsIgnoreCase(tmpl.getDefaultRole()))
                .map(ProjectMember::getUserId)
                .findFirst()
                .orElse(null);

            ProjectTask task = new ProjectTask();
            task.setProjectId(projectId);
            task.setStageId(newStageId);
            task.setTitle(tmpl.getTaskName());
            task.setAssigneeId(assigneeId);
            task.setDueDate(dueDate);
            task.setPriority(tmpl.getPriority());
            task.setIsMandatoryGate(tmpl.isMandatoryGate());
            task.setStatus("TODO");
            task.setIsAdhoc(false);

            tasksToCreate.add(task);
        }

        List<ProjectTask> savedTasks = taskRepository.saveAll(tasksToCreate);

        // Bắn thông báo đẩy cho nhân viên phụ trách
        for (ProjectTask task : savedTasks) {
            if (task.getAssigneeId() != null) {
                notificationPort.sendInAppNotification(
                    task.getAssigneeId(),
                    "Công việc mới được phân bổ",
                    "Gói thầu " + project.getCode() + ": " + task.getTitle(),
                    "/projects/" + projectId + "/tasks"
                );
            }
        }
    }

    // Logic kiểm tra chốt chặn hoàn thành công việc cho Gatekeeper
    public boolean checkMandatoryTasksCompleted(UUID projectId, UUID stageId) {
        long unfinishedCount = taskRepository.countUnfinishedMandatoryTasks(projectId, stageId);
        return unfinishedCount == 0;
    }
}
```

---

## 6. MA TRẬN MÃ LỖI NGHIỆP VỤ PHÂN HỆ 4

| Mã lỗi hệ thống | Mã HTTP | Mô tả nguyên nhân nghiệp vụ | Hướng xử lý phía Client |
| :--- | :---: | :--- | :--- |
| `TASK_MANDATORY_NOT_COMPLETED` | 422 | Còn công việc bắt buộc (Mandatory Gate) chưa xong.| Hoàn thành toàn bộ công việc trọng yếu trước khi chuyển bước. |
| `TASK_NOT_FOUND` | 404 | Mã định danh công việc không tồn tại trên hệ thống. | Kiểm tra lại danh mục công việc của dự án. |
| `TASK_ASSIGN_ROLE_MISMATCH` | 400 | Người được phân công không thuộc danh sách dự án. | Phân công cho nhân sự đã được gán vào dự án. |
| `TENDER_PACKAGE_CONTAINS_UNAPPROVED` | 422 | Gói hồ sơ thầu chứa tài liệu chưa được cấp quản lý duyệt.| Chỉ đóng gói các tài liệu có trạng thái APPROVED. |
