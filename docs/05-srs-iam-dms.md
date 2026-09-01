# ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS) — PHÂN HỆ 1
## QUẢN TRỊ NỀN TẢNG SAAS, IAM VÀ KHO TÀI LIỆU SỐ (DMS)
### MÃ TÀI LIỆU: MIBID_SRS_MOD01_v1.0

---

## 1. TỔNG QUAN PHÂN HỆ

Phân hệ 1 đóng vai trò là xương sống nền tảng của hệ thống Mibid, chịu trách nhiệm quản lý mô hình đa khách thuê (Multi-tenant SaaS), định danh và phân quyền người dùng theo mô hình lai (RBAC kết hợp ABAC theo từng dự án), đồng thời cung cấp hệ thống kho lưu trữ tài liệu số (DMS) tập trung có kiểm soát phiên bản và quy trình phê duyệt chứng từ nghiêm ngặt trước khi sử dụng cho hồ sơ thầu.

---

## 2. ĐẶC TẢ CHI TIẾT CÁC CHỨC NĂNG NGHIỆP VỤ

### 2.1. Chức Năng F-1.1: Quản Lý Khách Thuê Và Gói Cước SaaS (Tenants & Subscription Plans)

#### 2.1.1. Thông Tin Chung Chức Năng
* **Mục tiêu:** Cho phép quản trị viên hệ thống khởi tạo khách thuê doanh nghiệp mới, cấu hình tên miền truy cập, gán gói cước dịch vụ và kiểm soát trạng thái hoạt động (Hoạt động, Tạm khóa, Hủy bỏ).
* **Tác nhân thực hiện:** Quản trị viên Toàn cục (System Admin).
* **Đường dẫn thao tác:** `Menu Hệ thống` → `Quản lý Doanh nghiệp Khách thuê` → `Danh sách Tenants`.
* **Ghi nhật ký hệ thống:** Bắt buộc ghi nhận mọi thay đổi trạng thái thuê bao vào bảng `activity_logs`.

#### 2.1.2. Màn Hình Giao Diện
* **Bố cục màn hình:** Bảng danh sách khách thuê với các cột định danh, tên doanh nghiệp, tên miền truy cập, gói cước hiện tại, số lượng người dùng tối đa và huy hiệu trạng thái hoạt động (Xanh: Hoạt động, Vàng: Tạm khóa, Xám: Đã hủy). Nút bấm `[+ Khởi tạo Doanh nghiệp]` mở hộp thoại dạng trượt (Slide-over Drawer).
* **Trạng thái giao diện:**
  * *Trạng thái trống:* Hiển thị hình ảnh đồ họa và thông điệp "Chưa có doanh nghiệp khách thuê nào được khởi tạo".
  * *Hộp thoại xác nhận:* Bật popup xác nhận khi thao tác tạm khóa doanh nghiệp với cảnh báo "Người dùng thuộc doanh nghiệp này sẽ bị ngắt phiên làm việc ngay lập tức".
  * *Thông báo phản hồi:* Toast thông báo màu xanh "Cập nhật thông tin khách thuê thành công".

#### 2.1.3. Mô Tả Chi Tiết Các Thành Phần Giao Diện
| STT | Tên trường * | Kiểu dữ liệu [Độ dài] | Input / Output | Giá trị khởi tạo | Mô tả & Ràng buộc CSDL |
| :---: | :--- | :--- | :---: | :--- | :--- |
| 1 | Tên Doanh nghiệp * | String [255] | Input | Rỗng | Bắt buộc nhập. Ánh xạ `tenants.name`. |
| 2 | Tên miền định danh * | String [100] | Input | Rỗng | Bắt buộc, duy nhất toàn hệ thống. Định dạng chữ thường không dấu. Ánh xạ `tenants.domain`. |
| 3 | Gói cước dịch vụ * | UUID | Input | Gói Mặc định | Chọn từ danh mục `subscription_plans.id`. |
| 4 | Trạng thái hoạt động * | Enum [20] | Input | 'ACTIVE' | Giá trị hợp lệ: `ACTIVE`, `SUSPENDED`, `CANCELLED`. Ánh xạ `tenants.status`. |
| 5 | Ngày hết hạn gói | DateTime | Input | Hiện tại + 1 năm | Ánh xạ `tenant_subscriptions.end_date`. Phải lớn hơn ngày hiện tại. |

#### 2.1.4. Luồng Nghiệp Vụ Xử Lý

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Quản Trị Viên
    actor UI as Giao Diện Web Admin
    participant Gateway as Cổng API Gateway
    participant TenantSvc as Dịch Vụ SaaS Tenant
    participant Database as Cơ Sở Dữ Liệu PostgreSQL

    Admin->>UI: Nhập thông tin doanh nghiệp và chọn gói cước -> Bấm Lưu
    activate UI
    UI->>UI: Kiểm tra tính hợp lệ dữ liệu biểu mẫu phía client
    alt Biểu mẫu thiếu trường bắt buộc hoặc sai định dạng tên miền
        UI-->>Admin: Hiển thị thông báo lỗi vi phạm tại từng trường
    else Dữ liệu biểu mẫu hoàn toàn hợp lệ
        UI->>Gateway: Gửi yêu cầu khởi tạo tenant (POST /api/v1/admin/tenants)
        activate Gateway
        Gateway->>TenantSvc: Điều phối yêu cầu có gắn JWT Admin
        activate TenantSvc
        TenantSvc->>Database: Kiểm tra trùng lặp tên miền trong bảng tenants
        activate Database
        alt Tên miền đã tồn tại trên hệ thống
            Database-->>TenantSvc: Trả về kết quả trùng lặp bản ghi
            TenantSvc-->>Gateway: Phản hồi lỗi xung đột 409 Conflict
            Gateway-->>UI: Hiển thị thông báo "Tên miền định danh đã được sử dụng"
        else Tên miền hợp lệ và chưa tồn tại
            TenantSvc->>Database: Thực thi giao dịch mở mới tenants và tenant_subscriptions
            Database-->>TenantSvc: Xác nhận ghi nhận thành công bản ghi
            deactivate Database
            TenantSvc-->>Gateway: Trả về đối tượng tenant vừa tạo thành công (201 Created)
            deactivate TenantSvc
            Gateway-->>UI: Phản hồi kết quả thành công
            deactivate Gateway
            UI-->>Admin: Hiển thị Toast thông báo thành công và cập nhật lại bảng dữ liệu
        end
    end
    deactivate UI
```

---

### 2.2. Chức Năng F-1.2: Quản Lý Người Dùng Và Phân Quyền Lai (Users, Roles & RBAC/ABAC)

#### 2.2.1. Thông Tin Chung Chức Năng
* **Mục tiêu:** Quản trị toàn bộ danh sách tài khoản nội bộ trong doanh nghiệp, quản lý vai trò chức năng và gán vai trò tương ứng trong từng dự án cụ thể.
* **Tác nhân thực hiện:** Giám đốc Doanh nghiệp (Company Manager) hoặc Quản trị viên (System Admin).
* **Đường dẫn thao tác:** `Menu Hệ thống` → `Quản lý Người dùng & Phân quyền`.
* **Ghi nhật ký hệ thống:** Ghi nhận nhật ký mỗi khi tạo mới, phân lại vai trò hoặc khóa tài khoản.

#### 2.2.2. Màn Hình Giao Diện
* **Bố cục màn hình:** Danh sách nhân sự kèm thông tin phòng ban, vị trí công tác, vai trò hệ thống và trạng thái kích hoạt 2FA. Phía trên có thanh công cụ lọc theo phòng ban và ô tìm kiếm theo tên hoặc thư điện tử.
* **Trạng thái giao diện:**
  * *Hộp thoại phân vai trò dự án:* Cho phép chọn người dùng và gán vai trò tương ứng (Trưởng nhóm, Mua hàng, Đấu thầu, Vận hành) trên từng dự án cụ thể.
  * *Popup khóa tài khoản:* Xác nhận trước khi vô hiệu hóa quyền truy cập của nhân sự.

#### 2.2.3. Mô Tả Chi Tiết Các Thành Phần Giao Diện
| STT | Tên trường * | Kiểu dữ liệu [Độ dài] | Input / Output | Giá trị khởi tạo | Mô tả & Ràng buộc CSDL |
| :---: | :--- | :--- | :---: | :--- | :--- |
| 1 | Thư điện tử đăng nhập * | String [150] | Input | Rỗng | Bắt buộc, đúng định dạng email, duy nhất trong tenant. Ánh xạ `users.email`. |
| 2 | Họ và tên đầy đủ * | String [150] | Input | Rỗng | Bắt buộc nhập. Ánh xạ `users.full_name`. |
| 3 | Phòng ban công tác | String [100] | Input | Rỗng | Ví dụ: Mua hàng, Đấu thầu, Logistics. Ánh xạ `users.department`. |
| 4 | Vai trò toàn cục * | UUID | Input | Vai trò Nhân viên | Bắt buộc. Tham chiếu khóa ngoại `roles.id`. |
| 5 | Trạng thái kích hoạt * | Boolean | Input | True | True: Được phép đăng nhập; False: Bị khóa. Ánh xạ `users.is_active`. |

#### 2.2.4. Luồng Nghiệp Vụ Xử Lý

```mermaid
sequenceDiagram
    autonumber
    actor Manager as Quản Lý Doanh Nghiệp
    actor UI as Giao Diện Web
    participant Gateway as Cổng API Gateway
    participant UserSvc as Dịch Vụ Định Danh IAM
    participant Database as Cơ Sở Dữ Liệu PostgreSQL

    Manager->>UI: Thêm nhân sự mới và chọn vai trò toàn cục -> Bấm Tạo
    activate UI
    UI->>Gateway: Gửi yêu cầu tạo tài khoản (POST /api/v1/users)
    activate Gateway
    Gateway->>UserSvc: Xác thực quyền hạn và chuyển tiếp yêu cầu
    activate UserSvc
    UserSvc->>Database: Kiểm tra trùng lặp email trong phạm vi tenant
    activate Database
    alt Email đã tồn tại trong doanh nghiệp
        Database-->>UserSvc: Trả về lỗi trùng lặp
        UserSvc-->>Gateway: Trả về mã lỗi 409 Conflict
        Gateway-->>UI: Hiển thị thông báo "Email nhân sự đã tồn tại"
    else Email hợp lệ
        UserSvc->>UserSvc: Sinh mật khẩu ngẫu nhiên tạm thời và băm Bcrypt
        UserSvc->>Database: Chèn bản ghi vào bảng users và ghi nhận activity_logs
        Database-->>UserSvc: Xác nhận lưu trữ thành công
        deactivate Database
        UserSvc-->>Gateway: Trả về thông tin người dùng mới (201 Created)
        deactivate UserSvc
        Gateway-->>UI: Phản hồi thành công
        deactivate Gateway
        UI-->>Manager: Hiển thị thông báo thành công và gửi email kích hoạt cho nhân sự
    end
    deactivate UI
```

---

### 2.3. Chức Năng F-1.3: Quản Lý Kho Tài Liệu Số Và Phân Loại Chứng Từ (DMS Repository)

#### 2.3.1. Thông Tin Chung Chức Năng
* **Mục tiêu:** Quản lý tập trung các loại chứng từ của doanh nghiệp (Đăng ký kinh doanh, Hồ sơ năng lực, Chứng chỉ CO/CQ, Báo giá mẫu, Vận đơn đường biển) và phân loại theo danh mục để phục vụ việc kiểm tra tự động của chốt chặn Gatekeeper.
* **Tác nhân thực hiện:** Quản trị viên, Trưởng phòng Kinh doanh, Nhân viên được cấp quyền.
* **Đường dẫn thao tác:** `Menu Hệ thống` → `Kho Tài liệu Số DMS`.
* **Ghi nhật ký hệ thống:** Ghi nhận toàn bộ thao tác tải lên, cập nhật danh mục loại chứng từ.

#### 2.3.2. Màn Hình Giao Diện
* **Bố cục màn hình:** Cột bên trái hiển thị cây danh mục loại chứng từ (`doc_types`). Cột bên phải hiển thị danh sách các tệp tài liệu thuộc danh mục đã chọn kèm tên tệp, kích thước, người tải lên, ngày cập nhật và huy hiệu phân loại bắt buộc duyệt hay không.
* **Trạng thái giao diện:**
  * *Vùng tải tệp:* Hỗ trợ kéo thả tệp (Drag and Drop) với giới hạn kích thước tối đa 50 MB, chỉ chấp nhận các định dạng `.pdf`, `.docx`, `.xlsx`, `.jpg`, `.png`.

#### 2.3.3. Mô Tả Chi Tiết Các Thành Phần Giao Diện
| STT | Tên trường * | Kiểu dữ liệu [Độ dài] | Input / Output | Giá trị khởi tạo | Mô tả & Ràng buộc CSDL |
| :---: | :--- | :--- | :---: | :--- | :--- |
| 1 | Mã loại chứng từ * | String [50] | Input | Rỗng | Bắt buộc, duy nhất trong tenant. Ví dụ: `CO_CQ`, `LEGAL_BIZ`. Ánh xạ `doc_types.code`. |
| 2 | Tên loại chứng từ * | String [100] | Input | Rỗng | Bắt buộc nhập. Ánh xạ `doc_types.name`. |
| 3 | Bắt buộc duyệt mặc định | Boolean | Input | False | Nếu bật, các file thuộc loại này khi tải lên phải qua phê duyệt. Ánh xạ `doc_types.default_requires_approval`. |
| 4 | Tệp chứng từ đính kèm * | File Binary | Input | Trống | Tối đa 50 MB. Lưu vật lý lên S3, lưu đường dẫn vào `project_documents.file_url`. |

#### 2.3.4. Luồng Nghiệp Vụ Xử Lý

```mermaid
sequenceDiagram
    autonumber
    actor User as Nhân Viên Nghiệp Vụ
    actor UI as Giao Diện Web
    participant Gateway as Cổng API Gateway
    participant DMSSvc as Dịch Vụ Kho Tài Liệu DMS
    participant S3 as Kho Lưu Trữ Đám Mây S3
    participant Database as Cơ Sở Dữ Liệu PostgreSQL

    User->>UI: Kéo thả tệp chứng từ vào vùng tải lên -> Chọn loại chứng từ
    activate UI
    UI->>Gateway: Yêu cầu cấp quyền tải lên có chữ ký (POST /api/v1/dms/presigned-url)
    activate Gateway
    Gateway->>DMSSvc: Chuyển tiếp yêu cầu
    activate DMSSvc
    DMSSvc->>S3: Tạo đường dẫn Pre-signed URL với hạn dùng 15 phút
    activate S3
    S3-->>DMSSvc: Trả về Pre-signed URL hợp lệ
    deactivate S3
    DMSSvc-->>Gateway: Gửi Pre-signed URL
    deactivate DMSSvc
    Gateway-->>UI: Cung cấp Pre-signed URL
    deactivate Gateway
    UI->>S3: Tải trực tiếp tệp nhị phân lên kho S3 (HTTP PUT)
    activate S3
    S3-->>UI: Xác nhận tải tệp lên thành công (200 OK)
    deactivate S3
    UI->>Gateway: Gửi thông báo lưu bản ghi chứng từ (POST /api/v1/dms/documents)
    activate Gateway
    Gateway->>DMSSvc: Điều phối lưu thông tin bản ghi
    activate DMSSvc
    DMSSvc->>Database: Lưu bản ghi vào bảng project_documents với trạng thái PENDING
    activate Database
    Database-->>DMSSvc: Xác nhận lưu bản ghi thành công
    deactivate Database
    DMSSvc-->>Gateway: Phản hồi hoàn tất (201 Created)
    deactivate DMSSvc
    Gateway-->>UI: Trả về đối tượng tài liệu
    deactivate Gateway
    UI-->>User: Hiển thị tệp trong danh sách và báo trạng thái Chờ duyệt
    deactivate UI
```

---

### 2.4. Chức Năng F-1.4: Quy Trình Duyệt Chứng Từ Và Kiểm Soát Phiên Bản (Approval Workflow & Versions)

#### 2.4.1. Thông Tin Chung Chức Năng
* **Mục tiêu:** Kiểm soát chặt chẽ quy trình xem xét, phê duyệt hoặc từ chối chứng từ dự án của cấp quản lý; quản lý lịch sử các phiên bản tệp khi bị trả lại yêu cầu nộp bản mới.
* **Tác nhân thực hiện:** Trưởng nhóm Dự án (Project Owner) hoặc Giám đốc Doanh nghiệp (Manager).
* **Đường dẫn thao tác:** `Chi tiết Dự án` → `Tab Hồ sơ Chứng từ` → `Danh sách Chờ duyệt`.
* **Ghi nhật ký hệ thống:** Lưu vết toàn bộ lịch sử phê duyệt, lý do từ chối vào bảng `document_audit_logs`.

#### 2.4.2. Màn Hình Giao Diện
* **Bố cục màn hình:** Cửa sổ xem trước tệp PDF trực tiếp (PDF Previewer) ở giữa màn hình. Bên phải là thanh tác vụ phê duyệt gồm nút xanh `[Phê duyệt Chứng từ]` và nút đỏ `[Từ chối / Yêu cầu Bản mới]`. Khi bấm từ chối, hiển thị hộp thoại bắt buộc nhập lý do trả lại.
* **Trạng thái giao diện:**
  * *Huy hiệu trạng thái:* `Chờ duyệt` (Màu cam), `Đã duyệt` (Màu xanh lục), `Bị từ chối` (Màu đỏ).
  * *Danh sách phiên bản:* Hiển thị thẻ lịch sử phiên bản (Version 1, Version 2) cho phép người dùng so sánh và xem lại các bản tệp cũ.

#### 2.4.3. Mô Tả Chi Tiết Các Thành Phần Giao Diện
| STT | Tên trường * | Kiểu dữ liệu [Độ dài] | Input / Output | Giá trị khởi tạo | Mô tả & Ràng buộc CSDL |
| :---: | :--- | :--- | :---: | :--- | :--- |
| 1 | Mã tài liệu * | UUID | Output | - | Khóa chính tham chiếu `project_documents.id`. |
| 2 | Trạng thái phê duyệt * | Enum [20] | Input | 'PENDING' | Các giá trị: `PENDING`, `APPROVED`, `REJECTED`. |
| 3 | Lý do từ chối | Text | Input | Rỗng | Bắt buộc nhập nếu trạng thái chọn `REJECTED`. Ánh xạ `document_audit_logs.comment`. |
| 4 | Số phiên bản | Integer | Output | 1 | Tự động tăng khi nhân viên tải lên bản thay thế. Ánh xạ `project_documents.version`. |

#### 2.4.4. Luồng Nghiệp Vụ Xử Lý

```mermaid
sequenceDiagram
    autonumber
    actor Approver as Người Có Thẩm Quyền
    actor UI as Giao Diện Web
    participant Gateway as Cổng API Gateway
    participant DMSSvc as Dịch Vụ DMS
    participant Database as Cơ Sở Dữ Liệu PostgreSQL

    Approver->>UI: Xem tệp PDF -> Chọn "Từ chối" và nhập lý do trả lại -> Bấm Xác nhận
    activate UI
    UI->>Gateway: Gửi yêu cầu từ chối tài liệu (POST /api/v1/documents/{id}/reject)
    activate Gateway
    Gateway->>DMSSvc: Kiểm tra quyền phê duyệt của Approver trên dự án
    activate DMSSvc
    alt Người dùng không có thẩm quyền phê duyệt trên dự án này
        DMSSvc-->>Gateway: Trả về lỗi từ chối truy cập 403 Forbidden
        Gateway-->>UI: Hiển thị thông báo "Bạn không có quyền duyệt chứng từ dự án này"
    else Quyền hạn hợp lệ
        DMSSvc->>Database: Bắt đầu giao dịch cập nhật trạng thái
        activate Database
        Database->>Database: Cập nhật project_documents.status = 'REJECTED'
        Database->>Database: Ghi nhận bản ghi mới vào document_audit_logs kèm lý do
        Database-->>DMSSvc: Xác nhận giao dịch thành công
        deactivate Database
        DMSSvc-->>Gateway: Phản hồi thành công (200 OK)
        deactivate DMSSvc
        Gateway-->>UI: Trả về trạng thái tài liệu mới
        deactivate Gateway
        UI-->>Approver: Cập nhật huy hiệu "Bị từ chối" và hiển thị thông báo thành công
    end
    deactivate UI
```
