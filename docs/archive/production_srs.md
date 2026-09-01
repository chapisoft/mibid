# Tài liệu Đặc tả Yêu cầu Hệ thống (SRS) - Cấp độ Production

*Phiên bản này được nâng cấp theo tiêu chuẩn Enterprise/Production, loại bỏ sự cứng nhắc (hardcode) và áp dụng các mô hình linh hoạt: Quản lý quyền theo dự án (Project-Based Access), Quản lý luồng công việc động (Dynamic Workflow), và Hệ thống Kho tài liệu số (Document Management System).*

---

## 1. PHÂN HỆ QUẢN TRỊ HỆ THỐNG (SYSTEM ADMIN & IAM)

Đây là xương sống của hệ thống, kiểm soát việc "Ai được làm gì, ở dự án nào".

### 1.1 Chức năng: Quản lý Người dùng & Phân quyền (User & Role Management)
*   **Tính năng thao tác:**
    *   Tạo/Sửa/Khóa tài khoản User (Email, Password, Department, Manager).
    *   Định nghĩa Nhóm quyền (Roles): `Super Admin`, `Project Manager`, `Sales/Bidding`, `Sourcing/Purchasing`, `Logistics`, `Accounting`.
    *   Phân quyền tính năng (Feature Permissions): View/Create/Edit/Delete trên từng module.
*   **Logic bảo mật:** Mật khẩu mã hóa Bcrypt/Argon2. Cấp phát JWT token kèm theo Scope quyền hạn khi login.

### 1.2 Chức năng: Phân quyền theo Dự án / Gói thầu (Project-based Authorization)
*   **Mô tả:** Hệ thống quản lý dữ liệu theo không gian (Workspace/Project). User A có quyền Sourcing ở Dự án X, nhưng không nhìn thấy Dự án Y.
*   **Dữ liệu quản lý:** Bảng map `Project_Users` (Project_ID, User_ID, Project_Role).
*   **Logic hành động:**
    1. Khi tạo Dự án/Gói thầu mới, người tạo mặc định là `Project Owner`.
    2. Owner gán thành viên (Assign Members) vào dự án và chỉ định vai trò trong dự án (VD: Gán anh B làm Sourcing Lead cho dự án này).
    3. Tất cả các dữ liệu sinh ra từ dự án này (RFQ, Quotation, Chat-room) đều check quyền truy cập (ABAC) dựa trên bảng map `Project_Users`.

---

## 2. PHÂN HỆ QUẢN LÝ LUỒNG CÔNG VIỆC (DYNAMIC WORKFLOW ENGINE)

Thay vì hardcode luồng "Chuẩn bị -> Nộp thầu -> Vận hành", hệ thống cho phép tự định nghĩa (Customize) các luồng khác nhau cho các loại hàng hóa/khách hàng khác nhau.

### 2.1 Chức năng: Định nghĩa Flow (Workflow Definition)
*   **Mô tả:** Khởi tạo các mẫu (Template) quy trình chuẩn của công ty.
*   **Dữ liệu quản lý:**
    *   `Tên Flow`: VD "Quy trình Đấu thầu Nhà Nước", "Quy trình Nhập Thương mại nhanh".
    *   `Danh sách Bước (Stages)`: Cấu hình mảng các bước tuần tự (VD: [1] Lập HSMT -> [2] Sourcing giá vốn -> [3] Trình duyệt giá -> [4] Nộp thầu -> [5] Ký HĐ).
    *   `Tài liệu Yêu cầu (Required Documents)`: Tại mỗi Bước (Stage), khai báo danh sách các `Loại tài liệu (Document Types)` bắt buộc phải có để được phép hoàn thành bước đó (VD: Bước "Trình duyệt giá" bắt buộc phải có loại tài liệu "Báo giá Vendor").
    *   `Quyền chuyển bước (Transition Rules)`: Chỉ định Role nào được phép chuyển từ Bước 2 sang Bước 3.

### 2.2 Chức năng: Áp dụng Flow vào Dự án (Project Execution)
*   **Logic hành động:**
    1. Khi tạo (hoặc sửa) Dự án, User bắt buộc phải chọn 1 `Workflow Template`.
    2. Dự án sẽ khởi tạo một bản sao (Instance) của Flow đó. Tại đây, User có quyền **tùy chỉnh Cấu hình Tài liệu** riêng cho dự án này:
        *   Thêm/Bớt các `Tài liệu Yêu cầu` so với Template gốc.
        *   **Cấu hình Phê duyệt Tài liệu (Document Approval):** Với mỗi loại tài liệu yêu cầu, User có thể tick chọn `Cần duyệt (Requires Approval)`. Nếu bật, tài liệu khi được upload/đính kèm sẽ không có hiệu lực ngay mà phải trải qua luồng kiểm duyệt.
    3. Thẻ dự án (Card) sẽ xuất hiện trên Kanban board có các cột tương ứng với các Bước (Stages) đã định nghĩa.
    3. **Kiểm soát chuyển bước (Transition Gatekeeper):** Khi User thao tác kéo thẻ (drag) sang Bước tiếp theo, hệ thống sẽ quét kho tài liệu của Dự án xem đã đủ các `Tài liệu Yêu cầu` của bước hiện tại chưa. Tùy theo cấu hình Flow, hệ thống sẽ phản hồi theo 3 kịch bản:
        *   **Kịch bản 1 - Hard Stop (Chặn cứng):** Báo lỗi thiếu tài liệu và không cho phép chuyển bước.
        *   **Kịch bản 2 - Soft Warning (Cảnh báo mềm):** Hiện popup cảnh báo "Đang thiếu tài liệu [Tên tài liệu], bạn có chắc chắn muốn đi tiếp?". Nếu User chọn Yes, thẻ vẫn được chuyển.
        *   **Kịch bản 3 - Manager Approval (Yêu cầu duyệt ngoại lệ):** Thẻ bị treo ở trạng thái "Pending Transition". Hệ thống gửi request cho Manager. Nếu Manager bấm "Approve bypass", thẻ mới được chuyển sang bước tiếp theo.
    4. Khi dự án chuyển bước thành công, hệ thống có thể trigger tự động các task (VD: Chuyển sang bước Sourcing -> Tự động bắn thông báo cho Team Purchasing vào làm việc).

---

## 3. PHÂN HỆ KHO TÀI LIỆU SỐ (DOCUMENT MANAGEMENT SYSTEM - DMS)

### 3.1 Chức năng: Quản lý Kho chung, Phân quyền & Loại tài liệu
*   **Mô tả:** Nơi lưu trữ tập trung các tài liệu dùng chung và định nghĩa các danh mục tài liệu của hệ thống.
*   **Dữ liệu quản lý:**
    *   `Loại tài liệu (Document Types)`: Cấu hình danh mục các loại giấy tờ (VD: Đăng ký kinh doanh, Báo giá Vendor, Vận đơn BL, Packing List, Hợp đồng nguyên tắc).
    *   `Thư mục (Folders)`, `Tài liệu (Documents)`, `Phiên bản (Versions)`.
    *   `Phân quyền thư mục (Folder Permissions)`.
*   **Logic hành động:**
    1. Tài liệu tải lên Kho chung phải được gán Thẻ (Tag/Category) để dễ search.
    2. Mỗi thư mục có quyền Read/Write riêng (VD: Thư mục Kế toán thì phòng Sales chỉ được Read).

### 3.2 Chức năng: Kế thừa & Đính kèm tài liệu theo Flow (Contextual Documents)
*   **Mô tả:** Tài liệu sinh ra ở khâu nào thì dính chặt vào khâu đó và kế thừa sang khâu sau.
*   **Logic hành động:**
    1. Tại màn hình tạo **Hồ sơ thầu**, Sales có thể "Link" các tài liệu từ Kho chung vào Dự án.
    2. **Quy trình Duyệt tài liệu (Document Approval Workflow):** 
        * Nếu tài liệu thuộc loại `Cần duyệt` (theo cấu hình Flow của dự án), file khi upload/link vào dự án sẽ mang trạng thái `Pending Approval`.
        * Người có thẩm quyền (Manager/Reviewer) sẽ xem file. Họ có thể chọn **Duyệt (Approve)** hoặc **Trả lại (Reject/Return)** kèm lý do.
        * Nếu bị Trả lại, trạng thái file là `Rejected`, nhân viên bắt buộc phải upload lại phiên bản mới (Version 2) để xin duyệt lại.
        * Hệ thống Transition Gatekeeper (Kiểm soát chuyển bước) sẽ chỉ đếm các tài liệu có trạng thái `Approved` (hoặc không yêu cầu duyệt) là hợp lệ.
    3. Khi dự án chuyển qua bước **Sourcing**, Purchaser upload `Yêu cầu kỹ thuật.pdf`. File này được lưu vật lý vào hệ thống, nhưng được gán `Entity_Type = 'Project'`, `Entity_ID = ID_Dự_án`.
    3. Khi tạo **RFQ** để gửi Magic Link, Purchaser có thể chọn đính kèm các tài liệu đã có trong dự án cho Vendor xem.
    4. Báo giá của **Vendor** upload qua Magic Link sẽ tự động chảy về Kho tài liệu của Dự án đó với nhãn (Tag) là "Vendor Quotation".

---

## 4. PHÂN HỆ SOURCING & BIDDING (PRODUCTION DATA FIELDS)

Dữ liệu được mở rộng chi tiết để đáp ứng yêu cầu nghiệp vụ thực tế, tính toán tài chính và làm thủ tục hải quan.

### 4.1 Quản lý Dự án / Gói thầu (Project / Bidding)
*   **Dữ liệu lõi:**
    *   `Project_Code` (Unique), `Project_Name`.
    *   `Client_ID` (Liên kết với bảng Khách hàng CRM).
    *   `Workflow_ID` (Luồng quy trình đang áp dụng), `Current_Stage_ID`.
    *   `Budget` (Ngân sách trần), `Currency` (Tiền tệ cơ sở: VND/USD).
    *   `Tỷ giá quy đổi (Exchange Rate)`: Cố định tại thời điểm lập dự án.
    *   `Thuế VAT`, `Các loại phí khác (Margin dự kiến)`.
    *   `Điều khoản thanh toán (Payment Terms)`: VD 30% Advance, 70% LC.
*   **Hợp lệ dữ liệu:** Không thể chuyển dự án sang trạng thái "Đã nộp thầu" nếu chưa có bản ghi Quotation nào được `Approved` ở bước Sourcing.

### 4.2 Quản lý Yêu cầu báo giá (RFQ)
*   **Dữ liệu lõi:**
    *   `RFQ_Code`, `Project_ID` (Móc nối trực tiếp về dự án).
    *   `Incoterms` (EXW, FOB, CIF, DDP...) & `Nơi giao/nhận cụ thể` (Delivery Location).
    *   **Line Items (Danh sách chi tiết hàng):**
        *   `Mã SKU / Part Number`.
        *   `Mô tả kỹ thuật chi tiết`.
        *   `Mã HS Code` (Quan trọng để tính thuế nhập khẩu sau này).
        *   `Số lượng`, `Đơn vị tính (UOM)`.
        *   `Kích thước/Trọng lượng dự kiến (CBM/Gross Weight)`: Để ước tính cước vận chuyển (Freight cost).

### 4.3 Nhận Báo giá qua Magic Link (Vendor Portal)
*   **Dữ liệu Vendor nộp lên (Quotations):**
    *   Vendor điền giá cho từng `Line Item` (Unit Price). Hệ thống tự tính `Item Total`.
    *   `Phí vận chuyển (Freight Cost)`: Nếu Vendor báo giá CIF/DDP.
    *   `Phí bảo hiểm (Insurance Cost)`: Nếu có.
    *   `Thời gian sản xuất (Lead Time)` và `Cảng đi dự kiến (Port of Loading)`.
    *   `Tổng giá trị báo giá (Grand Total)`.
*   **Logic so sánh (Comparison Matrix nâng cao):**
    *   Hệ thống không chỉ so sánh giá Vendor đưa ra, mà phải tự động quy đổi `Grand Total` về cùng một loại Tiền tệ (Base Currency của dự án) dựa trên `Exchange Rate` đang thiết lập.
    *   Hiển thị So sánh từng Line Item (Apple-to-Apple comparison) giữa các Vendor để Manager dễ dàng nhận diện Vendor nào báo giá rẻ món nào.

---

## 5. PHÂN HỆ QUẢN LÝ CÔNG VIỆC & TIẾN ĐỘ (TASK & PROGRESS MANAGEMENT)

### 5.1 Chức năng: Giao việc & Quản lý Công việc (Task Management)
*   **Mô tả:** Hệ thống quản lý công việc vi mô (Micro-tasks) bên trong từng Dự án/Gói thầu, giúp phân bổ nguồn lực rõ ràng thay vì chỉ nhìn vào luồng tổng thể.
*   **Dữ liệu quản lý:** `Task_Name`, `Assignee` (Người được giao), `Deadline`, `Priority`, `Status` (To-do, Doing, Done).
*   **Logic hành động:**
    1. **Tạo Task tự động (Auto-generated Tasks):** Khi thẻ Dự án chuyển sang một Bước (Stage) mới, hệ thống tự động sinh ra các Task chuẩn đã định nghĩa sẵn trong Workflow (VD: Sang bước Sourcing -> Sinh task "Tạo RFQ", "Thu thập 3 báo giá"). Hệ thống tự động Assign cho người phụ trách (Lead) của bước đó.
    2. **Tạo Task thủ công:** Quản lý dự án (Project Manager) có thể chủ động tạo thêm các Task phát sinh và tag/assign tên nhân sự cụ thể.
    3. **Liên kết Transition Gatekeeper:** Tương tự như Tài liệu, Flow có thể cấu hình yêu cầu: "Chỉ được chuyển bước khi tất cả các Task của bước hiện tại đã được đánh dấu Done".

### 5.2 Chức năng: Quản lý & Theo dõi Tiến độ (Progress Tracking)
*   **Mô tả:** Giám sát "sức khỏe" và thời gian của các dự án, phòng ban.
*   **Tiến độ theo Dự án / Gói thầu:** 
    *   Hệ thống thiết lập **SLA (Service Level Agreement)** cho từng Bước trong Flow (VD: Bước Sourcing tối đa 3 ngày). 
    *   Nếu Dự án nằm ở một bước quá thời hạn SLA, thẻ dự án sẽ chuyển màu Đỏ (Overdue) và gửi cảnh báo đến Quản lý.
*   **Tiến độ theo Bộ phận / Nhân sự (Workload):**
    *   Xem dưới dạng Lịch (Calendar View) hoặc Gantt Chart để biết Nhân viên A đang gánh bao nhiêu Task, Phòng Sourcing đang tồn đọng bao nhiêu Yêu cầu báo giá chưa xử lý.

---

## 6. PHÂN HỆ BÁO CÁO KINH DOANH & PHÂN TÍCH (REPORTING & DASHBOARDS)

Để đáp ứng hoạt động quản trị của Ban Giám đốc doanh nghiệp XNK, phân hệ báo cáo trích xuất dữ liệu theo thời gian thực thành các biểu đồ trực quan.

### 6.1 Báo cáo Hiệu suất Kinh doanh (Sales & Bidding Performance)
*   **Tỷ lệ Thắng/Trượt thầu (Win/Loss Ratio):** Thống kê theo tháng/quý. Phân tích nguyên nhân trượt thầu (Lost Reason) - VD: Trượt do giá cao, Trượt do thiếu hàng.
*   **Doanh thu & Ngân sách (Budget vs Actual):** Theo dõi Tổng giá trị dự án trúng thầu so với target công ty đặt ra.

### 6.2 Báo cáo Vận hành & Nguồn cung (Sourcing & Logistics Operations)
*   **Đánh giá Nhà cung cấp (Vendor Rating):** 
    *   Tỷ lệ Vendor thắng báo giá thường xuyên (Win quote rate).
    *   Tỷ lệ giao hàng đúng hạn (On-time Delivery) dựa vào mốc ETA ở phân hệ Logistics.
*   **Thời gian xử lý luồng (Cycle Time Analysis):** Phân tích xem trung bình công ty mất bao nhiêu ngày từ lúc nhận Hồ sơ thầu đến lúc Nộp thầu. Bước nào trong Workflow đang tốn nhiều thời gian nhất (Nút thắt cổ chai - Bottleneck) để tối ưu.

### 6.3 Báo cáo Hiệu suất Nhân sự (HR & Workload Report)
*   Thống kê số lượng Task hoàn thành đúng hạn / trễ hạn của từng nhân sự.
*   Thống kê khối lượng công việc (Số dự án đang follow) của từng Sales Exec hoặc Logistics Exec để Quản lý có cơ sở phân bổ dự án mới, tránh tình trạng quá tải (Burnout).
