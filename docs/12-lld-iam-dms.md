# THIẾT KẾ CHI TIẾT CẤP THẤP (LLD) — PHÂN HỆ 1
## NỀN TẢNG SAAS, IAM VÀ KHO TÀI LIỆU SỐ (DMS)
### MÃ TÀI LIỆU: MIBID_LLD_MOD01_v1.0

---

## 1. TỔNG QUAN PHÂN HỆ VÀ RANH GIỚI TRÁCH NHIỆM

Phân hệ 1 chịu trách nhiệm cung cấp các dịch vụ định danh người dùng, xác thực JWT, phân quyền theo vai trò RBAC/ABAC, quản lý khách thuê đa người dùng (Multi-tenant) và kho lưu trữ chứng từ số hóa (DMS) có khả năng sinh đường dẫn tải tệp có chữ ký bảo mật Amazon S3 Pre-signed URL.

---

## 2. CỔNG VÀO (INBOUND PORTS) VÀ ĐẶC TẢ DTO

```java
public interface AuthenticationUseCase {
    LoginResponse authenticate(LoginRequest request);
    TokenRefreshResponse refreshToken(TokenRefreshRequest request);
}

public interface UserManagementUseCase {
    UserResponse createUser(CreateUserRequest request);
    void assignProjectRole(UUID projectId, UUID userId, String projectRole);
}

public interface DocumentManagementUseCase {
    PresignedUploadResponse generatePresignedUploadUrl(UploadRequest request);
    DocumentResponse registerDocument(RegisterDocumentRequest request);
    DocumentResponse approveDocument(UUID documentId, String note);
    DocumentResponse rejectDocument(UUID documentId, String reason);
}
```

---

## 3. CỔNG RA (OUTBOUND PORTS)

```java
public interface UserRepositoryPort {
    Optional<User> findById(UUID userId);
    Optional<User> findByTenantAndEmail(UUID tenantId, String email);
    User save(User user);
}

public interface DocumentRepositoryPort {
    Optional<ProjectDocument> findById(UUID documentId);
    List<ProjectDocument> findByProjectId(UUID projectId);
    ProjectDocument save(ProjectDocument doc);
}

public interface ObjectStoragePort {
    URL generatePresignedPutUrl(String s3Key, Duration expiration, String mimeType);
    URL generatePresignedGetUrl(String s3Key, Duration expiration);
}
```

---

## 4. ĐẶC TẢ RESTFUL API CONTRACTS & OPENAPI SCHEMAS

### 4.1. Endpoint Đăng Nhập Hệ Thống
* **Đường dẫn:** `POST /api/v1/auth/login`
* **Request Payload Schema:**
```json
{
  "email": "purchaser@hoanggia.vn",
  "password": "Password@123",
  "tenant_domain": "hoanggia"
}
```
* **Response Payload (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "8f3b2c1a-7e6d-4c5b-9a8b-1d2e3f4a5b6c",
  "token_type": "Bearer",
  "expires_in": 900,
  "user": {
    "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "full_name": "Nguyễn Văn Mua",
    "email": "purchaser@hoanggia.vn",
    "system_role": "STAFF",
    "tenant_id": "99999999-8888-7777-6666-555555555555"
  }
}
```

### 4.2. Endpoint Yêu Cầu Pre-signed URL Tải Tệp Lên Kho S3
* **Đường dẫn:** `POST /api/v1/dms/presigned-upload`
* **Request Payload Schema:**
```json
{
  "project_id": "c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f",
  "doc_type_id": "d1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a",
  "file_name": "Giay_Uy_Quyen_Ban_Hang.pdf",
  "file_size": 2048576,
  "mime_type": "application/pdf"
}
```
* **Response Payload (200 OK):**
```json
{
  "upload_url": "https://mibid-storage.s3.ap-southeast-1.amazonaws.com/tenants/999/docs/xyz.pdf?X-Amz-Signature=...",
  "s3_key": "tenants/999/projects/c1d2/Giay_Uy_Quyen_Ban_Hang_v1.pdf",
  "expires_in_seconds": 900
}
```

---

## 5. LOGIC NGHIỆP VỤ VÀ MÃ GIẢ (PSEUDOCODE)

```java
// Logic Phê duyệt hoặc Từ chối Chứng từ Dự án
public DocumentResponse processDocumentApproval(UUID documentId, UUID approverId, ApprovalAction action, String note) {
    ProjectDocument doc = documentRepository.findById(documentId)
        .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy tài liệu định danh: " + documentId));

    // Kiểm tra quyền hạn phê duyệt của người dùng trên dự án
    boolean hasApprovalPermission = projectMemberRepository.isProjectOwner(doc.getProjectId(), approverId);
    if (!hasApprovalPermission) {
        throw new AccessDeniedException("Người dùng không có quyền phê duyệt chứng từ trên dự án này");
    }

    if (action == ApprovalAction.APPROVE) {
        doc.setStatus("APPROVED");
        doc.setApprovedBy(approverId);
        doc.setApprovedAt(Instant.now());
    } else if (action == ApprovalAction.REJECT) {
        if (note == null || note.trim().isEmpty()) {
            throw new IllegalArgumentException("Bắt buộc phải nhập lý do khi từ chối tài liệu");
        }
        doc.setStatus("REJECTED");
    }

    ProjectDocument savedDoc = documentRepository.save(doc);

    // Ghi nhật ký kiểm toán vào bảng document_audit_logs
    DocumentAuditLog auditLog = new DocumentAuditLog();
    auditLog.setDocumentId(savedDoc.getId());
    auditLog.setAction(action.name());
    auditLog.setPerformedBy(approverId);
    auditLog.setComment(note);
    auditLogRepository.save(auditLog);

    return documentMapper.toResponse(savedDoc);
}
```

---

## 6. MA TRẬN MÃ LỖI NGHIỆP VỤ PHÂN HỆ 1

| Mã lỗi hệ thống | Mã HTTP | Mô tả nguyên nhân nghiệp vụ | Hướng xử lý phía Client |
| :--- | :---: | :--- | :--- |
| `AUTH_INVALID_CREDENTIALS` | 401 | Thư điện tử hoặc mật khẩu không chính xác. | Yêu cầu người dùng kiểm tra lại thông tin. |
| `AUTH_ACCOUNT_LOCKED` | 403 | Tài khoản bị tạm khóa do nhập sai quá 5 lần. | Thông báo thời gian chờ mở khóa cho người dùng. |
| `DMS_FILE_TOO_LARGE` | 413 | Kích thước tệp tải lên vượt quá 50 MB. | Yêu cầu nén tệp trước khi tải lên. |
| `DMS_UNSUPPORTED_MIME` | 415 | Định dạng tệp không được phép (Chỉ nhận PDF, Office, Ảnh).| Yêu cầu đổi định dạng tệp chuẩn. |
| `DMS_REJECT_REASON_EMPTY`| 422 | Từ chối chứng từ nhưng không nhập lý do giải thích. | Bắt buộc nhập lý do vào ô nhập liệu. |
