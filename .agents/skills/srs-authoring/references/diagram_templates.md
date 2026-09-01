# THƯ VIỆN MẪU SƠ ĐỒ MERMAID CHUẨN CHO TÀI LIỆU SRS

Tài liệu này cung cấp các mẫu sơ đồ Mermaid chuẩn mực đã được tối ưu hóa hiển thị theo tỷ lệ 4:3, dàn trải 2 cột song song bằng `flowchart LR`, nút dạng khối hộp vuông vắn, chống tràn trang và không làm treo công cụ xem trước Markdown Preview.

---

## 1. MẪU SƠ ĐỒ PHÂN RÃ CHỨC NĂNG DẠNG CÂY (FUNCTIONAL DECOMPOSITION TREE)

Dùng ở phần Tổng quan hệ thống hoặc đầu mỗi phân hệ để thể hiện cấu trúc cây chức năng phân cấp 3 tầng ngang (`flowchart LR`), các ô ôm sát chữ với khoảng đệm cân đối, dóng thẳng tắp lề trái:

```mermaid
%%{init: {'flowchart': {'nodeSpacing': 8, 'rankSpacing': 140, 'padding': 3, 'curve': 'basis'}}}%%
flowchart LR
    %% GỐC HỆ THỐNG (CẤP 0)
    ROOT["HỆ THỐNG QUẢN LÝ VÀ PHÊ DUYỆT HỒ SƠ"]:::cLevel0

    %% CÁC NHÓM CHỨC NĂNG CHÍNH (CẤP 1 - ĐỒNG BỘ ĐỘ DÀI)
    MOD1["1. NHÓM TRA CỨU QUẢN LÝ"]:::cLevel1
    MOD2["2. NHÓM QUY TRÌNH DUYỆT"]:::cLevel1
    MOD3["3. NHÓM QUẢN TRỊ ADMIN"]:::cLevel1

    %% CHỨC NĂNG CON PHÂN HỆ 1 (CẤP 2)
    F1_1["1.1. Tra cứu & Hiển thị danh sách"]:::cLevel2
    F1_2["1.2. Thêm mới hồ sơ (kiểm tra trùng)"]:::cLevel2
    F1_3["1.3. Cập nhật & Quản lý phiên bản"]:::cLevel2
    F1_4["1.4. Xuất / Nhập danh sách Excel"]:::cLevel2

    %% CHỨC NĂNG CON PHÂN HỆ 2 (CẤP 2)
    F2_1["2.1. Gửi duyệt đơn lẻ & hàng loạt"]:::cLevel2
    F2_2["2.2. Cấp trung gian thẩm tra"]:::cLevel2
    F2_3["2.3. Lãnh đạo phê duyệt chính thức"]:::cLevel2
    F2_4["2.4. Từ chối & Lưu vết phản hồi"]:::cLevel2

    %% CHỨC NĂNG CON PHÂN HỆ 3 (CẤP 2)
    F3_1["3.1. Khóa / Mở khóa hồ sơ dữ liệu"]:::cLevel2
    F3_2["3.2. Đối soát lịch sử thay đổi"]:::cLevel2
    F3_3["3.3. Ghi nhật ký kiểm toán Audit Log"]:::cLevel2
    F3_4["3.4. Phân quyền vai trò người dùng"]:::cLevel2

    %% LIÊN KẾT TỪ GỐC SANG CÁC NHÓM
    ROOT --> MOD1
    ROOT --> MOD2
    ROOT --> MOD3

    %% LIÊN KẾT TỪ NHÓM SANG CHỨC NĂNG CON ĐỘC LẬP
    MOD1 --> F1_1 & F1_2 & F1_3 & F1_4
    MOD2 --> F2_1 & F2_2 & F2_3 & F2_4
    MOD3 --> F3_1 & F3_2 & F3_3 & F3_4

    %% ĐỊNH DẠNG Ô CÂN ĐỐI TRÊN DƯỚI VÀ 2 BÊN
    classDef cLevel0 font-size:12px,font-weight:bold,padding:6px 16px;
    classDef cLevel1 font-size:11px,font-weight:bold,padding:5px 14px;
    classDef cLevel2 font-size:10px,padding:4px 10px;
```

---

## 2. MẪU SƠ ĐỒ CHU TRÌNH TRẠNG THÁI DỮ LIỆU (STATE MACHINE DIAGRAM)

Dùng để mô hình hóa vòng đời của đối tượng từ khi khởi tạo đến khi phê duyệt hoặc khóa:

```mermaid
flowchart LR
    subgraph S_STATE_INIT ["GIAI ĐOẠN 1: KHỞI TẠO VÀ XEM XÉT TRUNG GIAN"]
        direction TB
        ST_DRAFT["TRẠNG THÁI: LƯU NHÁP (DRAFT)<br/>• Bản ghi mới tạo hoặc chuyên viên đang sửa<br/>• Cờ công bố: is_public = FALSE<br/>• Cờ khóa: lock = FALSE"]
        ST_PROC["TRẠNG THÁI: CHỜ DUYỆT (PROCESSING)<br/>• Đã gửi hồ sơ lên cấp thẩm định<br/>• Khóa chỉnh sửa đối với chuyên viên<br/>• Ghi nhận cán bộ duyệt trung gian"]
        ST_REV["TRẠNG THÁI: ĐÃ XEM XÉT (REVIEWED)<br/>• Cấp phòng/ban trung gian xác nhận đạt<br/>• Chuyển tiếp lên cấp thủ trưởng duyệt<br/>• Sẵn sàng cho bước duyệt cuối cùng"]
        ST_DRAFT -->|Gửi phê duyệt| ST_PROC
        ST_PROC -->|Xác nhận đạt| ST_REV
    end

    subgraph S_STATE_FINAL ["GIAI ĐOẠN 2: PHÊ DUYỆT CHÍNH THỨC VÀ TỪ CHỐI"]
        direction TB
        ST_APP["TRẠNG THÁI: ĐÃ DUYỆT (APPROVED)<br/>• Hồ sơ chính thức có hiệu lực pháp lý<br/>• Cờ công bố: is_public = TRUE<br/>• Cờ khóa: lock = TRUE"]
        ST_REJ["TRẠNG THÁI: TỪ CHỐI (REJECT)<br/>• Cấp trung gian hoặc lãnh đạo từ chối<br/>• Lưu lý do vào feedback_information<br/>• Cho phép chuyên viên sửa và gửi lại"]
        ST_LOCK["TRẠNG THÁI: KHÓA BẢN GHI (LOCKED)<br/>• Đóng băng dữ liệu không cho tác động<br/>• Chỉ mở khóa bởi người có thẩm quyền"]
        ST_REV -->|Thủ trưởng phê duyệt| ST_APP
        ST_PROC -->|Từ chối trung gian| ST_REJ
        ST_REV -->|Từ chối lãnh đạo| ST_REJ
        ST_APP -->|Khóa hồ sơ| ST_LOCK
    end

    ST_REJ -->|Chỉnh sửa & Gửi lại| ST_PROC
```

---

## 3. MẪU SƠ ĐỒ WORKFLOW CHUẨN MỰC (SEQUENCE DIAGRAM)

Mọi quy trình nghiệp vụ, luồng xử lý tương tác giữa các tác nhân và hệ thống trong tài liệu SRS **bắt buộc phải sử dụng `sequenceDiagram`**. Sơ đồ phải sử dụng các đường nét dóng thẳng trực giao chuẩn mực của Sequence Diagram, tuyệt đối **không sử dụng các nét vẽ lượn cong tùy tiện**.

### 3.1. Sơ đồ Tuần tự cho Chức năng Nhập liệu và Thêm mới (Create / Update Workflow)

```mermaid
sequenceDiagram
    autonumber
    actor U as Chuyên viên lập hồ sơ
    participant FE as Giao diện Web (Form)
    participant BE as Dịch vụ Backend API
    participant DB as CSDL Quan hệ

    U->>FE: 1. Nhập thông tin biểu mẫu & nhấn [Lưu lại]
    activate FE
    FE->>BE: 2. Gửi yêu cầu POST /api/v1/martyrs
    activate BE

    BE->>BE: 3. Kiểm tra tính hợp lệ dữ liệu (Validation)
    alt TH2: Thiếu trường bắt buộc có dấu * hoặc sai định dạng
        BE-->>FE: 4.1. Trả về mã lỗi 400 Bad Request (Danh sách trường lỗi)
        FE-->>U: 4.2. Hiển thị thông báo lỗi inline tại từng ô nhập liệu
    else TH3: Trùng số CCCD đã tồn tại ở trạng thái APPROVED
        BE->>DB: 5.1. SELECT id FROM martyrs WHERE identity_code = :code AND status = 'APPROVED'
        DB-->>BE: 5.2. Trả về bản ghi trùng lặp
        BE-->>FE: 5.3. Trả về mã lỗi 409 Conflict ("Số CCCD đã tồn tại")
        FE-->>U: 5.4. Hiển thị thông báo cảnh báo trùng dữ liệu
    else TH1: Dữ liệu hợp lệ & Không trùng lặp
        BE->>DB: 6.1. INSERT INTO martyrs (status = 'DRAFT', version = 0, ...)
        DB-->>BE: 6.2. Xác nhận ghi thành công
        BE->>DB: 6.3. INSERT INTO audit_log (action = 'CREATE_MARTYR', ...)
        DB-->>BE: 6.4. Ghi log thành công
        BE-->>FE: 6.5. Trả về mã 201 Created (Kèm ID bản ghi mới)
        FE-->>U: 6.6. Đóng form, hiển thị toast "Lưu hồ sơ nháp thành công"
    end
    deactivate BE
    deactivate FE
```

### 3.2. Sơ đồ Tuần tự cho Quy trình Phê duyệt Phân cấp Đa tác nhân (Approval Workflow)

```mermaid
sequenceDiagram
    autonumber
    actor ChuyenVien as Chuyên viên
    actor CanBoDuyet as Cán bộ thẩm tra
    actor ThuTruong as Thủ trưởng phê duyệt
    participant FE as Giao diện Hệ thống
    participant BE as Dịch vụ Backend API
    participant DB as Cơ sở dữ liệu

    Note over ChuyenVien,DB: GIAI ĐOẠN 1: GỬI DUYỆT HỒ SƠ
    ChuyenVien->>FE: 1. Chọn hồ sơ (DRAFT) & nhấn [Gửi phê duyệt]
    activate FE
    FE->>BE: 2. PUT /api/v1/martyrs/:id/submit
    activate BE
    BE->>DB: 3. UPDATE martyrs SET status = 'PROCESSING', lock = TRUE WHERE id = :id
    DB-->>BE: 4. Cập nhật thành công
    BE-->>FE: 5. Phản hồi 200 OK
    FE-->>ChuyenVien: 6. Hiển thị toast "Gửi phê duyệt thành công"
    deactivate BE
    deactivate FE

    Note over CanBoDuyet,DB: GIAI ĐOẠN 2: THẨM ĐỊNH TRUNG GIAN
    CanBoDuyet->>FE: 7. Mở danh sách chờ duyệt & kiểm tra chi tiết
    activate FE
    alt Thẩm định không đạt
        CanBoDuyet->>FE: 8.1. Nhập lý do & nhấn [Từ chối]
        FE->>BE: 8.2. PUT /api/v1/martyrs/:id/reject
        activate BE
        BE->>DB: 8.3. UPDATE martyrs SET status = 'REJECT', lock = FALSE
        DB-->>BE: 8.4. Ghi nhận thành công
        BE-->>FE: 8.5. Phản hồi 200 OK
        FE-->>CanBoDuyet: 8.6. Hiển thị toast "Đã từ chối hồ sơ"
        deactivate BE
    else Thẩm định đạt yêu cầu
        CanBoDuyet->>FE: 9.1. Nhấn [Xác nhận đạt yêu cầu]
        FE->>BE: 9.2. PUT /api/v1/martyrs/:id/review
        activate BE
        BE->>DB: 9.3. UPDATE martyrs SET status = 'REVIEWED'
        DB-->>BE: 9.4. Ghi nhận thành công
        BE-->>FE: 9.5. Phản hồi 200 OK
        FE-->>CanBoDuyet: 9.6. Hiển thị toast "Xác nhận hồ sơ đạt yêu cầu"
        deactivate BE
    end
    deactivate FE

    Note over ThuTruong,DB: GIAI ĐOẠN 3: PHÊ DUYỆT CHÍNH THỨC (CÔNG BỐ DỮ LIỆU)
    ThuTruong->>FE: 10. Xem hồ sơ (REVIEWED) & nhấn [Phê duyệt]
    activate FE
    FE->>BE: 11. PUT /api/v1/martyrs/:id/approve
    activate BE
    critical Giao dịch nguyên tử & Khóa lạc quan (Optimistic Locking)
        BE->>DB: 12.1. UPDATE martyrs SET status = 'APPROVED', is_public = TRUE, lock = TRUE WHERE id = :id AND version = :version
        DB-->>BE: 12.2. Số dòng cập nhật = 1
        BE->>DB: 12.3. INSERT INTO audit_log (action = 'APPROVE_MARTYR', ...)
        DB-->>BE: 12.4. Ghi nhật ký thành công
    end
    BE-->>FE: 13. Phản hồi 200 OK
    FE-->>ThuTruong: 14. Hiển thị toast "Phê duyệt hồ sơ Liệt sĩ thành công"
    deactivate BE
    deactivate FE
```


---

## 4. MẪU SƠ ĐỒ MÔ HÌNH DỮ LIỆU QUAN HỆ MỨC CAO (HIGH-LEVEL ERD)

Khối Mermaid `erDiagram` chỉ hiển thị các thực thể chính và mối quan hệ; các trường chi tiết được trình bày bằng Bảng Markdown tiêu chuẩn bên dưới:

```mermaid
erDiagram
    CITIZEN ||--o{ MARTYRS : "mapping thong tin CCCD"
    CATEGORY_DATA ||--o{ MARTYRS : "cung cap danh muc"
    MARTYRS ||--o{ FEEDBACK_INFORMATION : "luu ly do tu choi"
    MARTYRS ||--o{ AUDIT_LOG : "ghi vet thay doi"
    USERS ||--o{ MARTYRS : "quan ly nguoi tao va duyet"
```

### Bảng Từ điển Dữ liệu Thực thể Cốt lõi (`martyrs`)

| Tên trường | Kiểu dữ liệu | Khóa | Bắt buộc | Giá trị mặc định | Mô tả nghiệp vụ |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | BIGINT | PK | Có | Tự tăng | Khóa chính bản ghi |
| `profile_id` | VARCHAR(50) | | Có | Tự sinh | Mã định danh hồ sơ không đổi qua các phiên bản |
| `identity_code` | VARCHAR(20) | | Không | NULL | Số CCCD/CMND của đối tượng |
| `full_name` | VARCHAR(255) | | Có | NULL | Họ và tên đầy đủ |
| `gender` | VARCHAR(10) | | Có | NULL | Giới tính (NAM, NU) |
| `birth_date` | DATE | | Có | NULL | Ngày tháng năm sinh |
| `enlistment_date` | DATE | | Có | NULL | Ngày nhập ngũ |
| `sacrifice_date` | DATE | | Có | NULL | Ngày hy sinh |
| `rank_code` | VARCHAR(50) | FK | Có | NULL | Mã cấp bậc khi hy sinh (DanhMucCapBac) |
| `position_code` | VARCHAR(50) | FK | Có | NULL | Mã chức vụ khi hy sinh (DanhMucChucVu) |
| `status` | VARCHAR(20) | | Có | 'DRAFT' | Trạng thái (DRAFT, PROCESSING, REVIEWED, APPROVED, REJECT) |
| `version` | INT | | Có | 0 | Phiên bản bản ghi phục vụ quản lý lịch sử |
| `is_public` | BOOLEAN | | Có | FALSE | Cờ công bố hồ sơ cho toàn hệ thống |
| `is_deleted` | BOOLEAN | | Có | FALSE | Cờ xóa mềm bản ghi |
| `created_by` | VARCHAR(50) | | Có | NULL | Tên tài khoản người tạo |
| `created_date` | TIMESTAMP | | Có | NOW() | Thời điểm tạo bản ghi |
| `updated_by` | VARCHAR(50) | | Không | NULL | Tên tài khoản người cập nhật gần nhất |
| `updated_date` | TIMESTAMP | | Không | NULL | Thời điểm cập nhật gần nhất |

---

## 5. MẪU SƠ ĐỒ KIẾN TRÚC TÍCH HỢP HỆ THỐNG (SYSTEM INTEGRATION)

Minh họa kết nối giữa Phân hệ nghiệp vụ với các dịch vụ nền tảng:

```mermaid
flowchart LR
    subgraph S_INT_CORE ["PHÂN HỆ NGHIỆP VỤ VÀ GIAO DIỆN"]
        direction TB
        UI_CLIENT["Giao diện người dùng Web / Mobile<br/>• Quản lý danh sách & biểu mẫu nhập liệu<br/>• Trình duyệt hồ sơ & xem chi tiết<br/>• Bảng điều khiển giám sát tiến độ"]
        BE_CORE["Dịch vụ Backend phân hệ nghiệp vụ<br/>• Xử lý quy tắc nghiệp vụ & bẫy dữ liệu<br/>• Điều phối máy trạng thái phê duyệt<br/>• Quản lý giao dịch cơ sở dữ liệu"]
        UI_CLIENT -->|RESTful API / HTTPS| BE_CORE
    end

    subgraph S_INT_SHARED ["DỊCH VỤ NỀN TẢNG VÀ TÍCH HỢP CHUNG"]
        direction TB
        SRV_CITIZEN["CSDL Công dân (Citizen DB)<br/>• Tra cứu số CCCD/CMND tự động<br/>• Đồng bộ thông tin nhân thân & quê quán"]
        SRV_CAT["Cổng Danh mục Dùng chung<br/>• Cấp bậc quân hàm, chức vụ<br/>• Danh mục địa giới hành chính 3 cấp"]
        SRV_FILE["Dịch vụ Quản lý Tệp tin (MinIO / S3)<br/>• Lưu trữ ảnh chân dung & hồ sơ đính kèm<br/>• Sinh tệp xuất Excel & nhận tệp nhập Excel"]
        SRV_AUTH["Dịch vụ Định danh & Ghi log (IAM / Audit)<br/>• Xác thực JWT & phân quyền vai trò RBAC<br/>• Ghi vết kiểm toán tập trung 24/7"]
        SRV_CITIZEN --> SRV_CAT
        SRV_CAT --> SRV_FILE
        SRV_FILE --> SRV_AUTH
    end

    BE_CORE -->|gRPC / RESTful API| SRV_CITIZEN
    BE_CORE -->|Truy vấn danh mục| SRV_CAT
    BE_CORE -->|Upload / Download| SRV_FILE
    BE_CORE -->|Xác thực & Audit Log| SRV_AUTH
```
