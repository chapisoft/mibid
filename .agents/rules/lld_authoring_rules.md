# QUY CHUẨN VÀ NGUYÊN TẮC VIẾT TÀI LIỆU THIẾT KẾ CHI TIẾT CẤP THẤP (LOW-LEVEL DESIGN - LLD)

Tài liệu này quy định hệ thống nguyên tắc, quy chuẩn cấu trúc 11 phần bắt buộc và phương pháp đặc tả kỹ thuật khi xây dựng Tài liệu Thiết kế Chi tiết Cấp thấp (LLD) cho từng phân hệ nghiệp vụ hoặc tính năng phần mềm.

---

## 1. NGUYÊN TẮC CỐT LÕI KHI VIẾT LLD

* **Độ sâu kỹ thuật độc lập (Self-contained & Actionable):**
  * Tài liệu LLD phải có đủ độ sâu và chi tiết để kỹ sư phát triển (Developer) có thể triển khai mã nguồn ngay và kỹ sư kiểm thử (QA/QC) có thể viết kịch bản kiểm thử (Test Cases) mà không cần phải đọc thêm các tài liệu khác.
  * **Tuyệt đối không viết câu chữ thoái thác hoặc chung chung** như *"Xem thêm tài liệu BRD"*, *"Sẽ bổ sung sau"*, *"Cần xác nhận lại"*. Toàn bộ quy tắc, công thức tính toán và cấu trúc bảng phải được bóc tách chi tiết vào trong tài liệu.
* **Nguyên tắc Zero-Hardcode & Zero-Default Data trong thiết kế:**
  * Toàn bộ mã trạng thái, mã lỗi, phân loại, đơn vị tiền tệ, điều khoản thương mại trong thiết kế bắt buộc phải được đặc tả bằng bảng danh mục Enum cụ thể.
  * Cấm đặc tả hoặc cho phép gán các giá trị mặc định giả lập khi khởi tạo hoặc trả về thông tin đối tượng (DTO/Response). Toàn bộ dữ liệu phải phản ánh đúng thực tế lưu trữ trong CSDL hoặc Request payload thực tế.
* **Ngôn ngữ và định dạng chuẩn mực:**
  * Toàn bộ tài liệu sử dụng tiếng Việt kỹ thuật chuyên ngành, mạch lạc, chính xác.
  * Không chèn tiếng Anh đệm/dịch nghĩa song ngữ thừa thãi trong ngoặc đơn. Giữ lại tiếng Anh cho các định danh kỹ thuật quốc tế chuẩn (`RESTful API`, `Token JWT`, `Kafka Topic`, `SQL`, `Redis`, `JPA`, tên bảng, tên cột).
  * Không chèn biểu tượng (icon / emoji) tràn lan vào tiêu đề đề mục.
  * Sử dụng ký tự Unicode thuần túy (`→`, `×`, `≤`, `≥`, `•`) thay cho công thức LaTeX chứa dấu `$`.

---

## 2. CẤU TRÚC 11 PHẦN BẮT BUỘC CỦA TÀI LIỆU LLD

Mỗi tài liệu LLD cho một Business Domain / Phân hệ bắt buộc phải bao gồm đầy đủ 11 phần sau:

```text
Tài liệu LLD Phân hệ (LLD_Domain_X_*.md)
├── Section 0: Thư viện dùng chung & Phụ thuộc kỹ thuật (Shared Dependencies)
├── Section 1: Tổng quan & Phạm vi nghiệp vụ (Overview & Scope)
├── Section 2: Quan hệ phụ thuộc & Điểm tích hợp (Dependencies & Integrations)
├── Section 3: Thiết kế Cơ sở dữ liệu chi tiết (Database Design & ERD)
├── Section 4: Hợp đồng giao tiếp API chi tiết (API Contracts)
├── Section 5: Logic nghiệp vụ, Thuật toán & Tiến trình nền (Business Logic & Jobs)
├── Section 6: Sự kiện hàng đợi thông điệp (Kafka / Message Queue Events)
├── Section 7: Cấu trúc thành phần giao diện (Frontend Components & Forms)
├── Section 8: An toàn thông tin & Ma trận phân quyền (Security, RBAC & PII)
├── Section 9: Ma trận kịch bản kiểm thử (Test Cases & Acceptance Criteria)
├── Section 10: Yêu cầu phi chức năng (Non-Functional Requirements - NFR)
└── Section 11: Danh mục tiêu chí hoàn tất (Definition of Done - DoD)
```

---

## 3. CHI TIẾT TỪNG PHẦN TRONG TÀI LIỆU LLD

### Section 0: Thư viện dùng chung & Phụ thuộc kỹ thuật
* **Thành phần Frontend dùng chung:**
  * Bảng liệt kê: Thành phần giao diện | Tệp mã nguồn | Hàm / Hook sử dụng | Mục đích cụ thể trong phân hệ.
  * Danh mục khóa đa ngôn ngữ (i18n keys) mới cần thêm vào bộ từ điển giao diện `vi.json` (khóa và nội dung tiếng Việt đầy đủ).
  * Biến CSS (CSS Variables) và Design Tokens đặc thù.
* **Thành phần Backend dùng chung:**
  * Bảng liệt kê: Mô-đun | Tên lớp (Class) | Phương thức (Method) | Mục đích sử dụng.
  * Danh mục hằng số hệ thống, mã lỗi nghiệp vụ (`ErrorCodes`) và cấu hình hàng đợi (`KafkaTopics`).

### Section 1: Tổng quan & Phạm vi nghiệp vụ
* **Mục tiêu phân hệ:** Mô tả rõ phân hệ giải quyết bài toán nghiệp vụ gì, người dùng mục tiêu là ai.
* **Tham chiếu tài liệu đầu vào:** Ánh xạ chính xác tới các mục trong Yêu cầu nghiệp vụ (BRD), Kiến trúc hệ thống và Thiết kế giao diện.
* **Bảng danh mục màn hình & Use Cases:**
  * Mã màn hình chuẩn.
  * Tên màn hình tiếng Việt.
  * Mã Use Case tương ứng.
  * Vai trò người dùng thao tác.
  * Nền tảng hoạt động (Web Desktop, Mobile Web, Ứng dụng di động).
* **Phạm vi thực hiện (In-Scope / Out-of-Scope):** Xác định ranh giới rõ ràng, nêu rõ phần nào thuộc phân hệ khác xử lý.

### Section 2: Quan hệ phụ thuộc & Điểm tích hợp
* **Phụ thuộc nội bộ (Upstream / Downstream Domains):**
  * Bảng: Phân hệ phụ thuộc | Dữ liệu / API cần lấy | Lý do nghiệp vụ.
* **Tích hợp dịch vụ bên ngoài:**
  * Cổng thanh toán ngân hàng (VietQR / Napas): Quy trình sinh mã QR, nhận Webhook gạch nợ.
  * Dịch vụ ký số từ xa (Cloud HSM): Ký số chứng từ điện tử, hóa đơn, hồ sơ.
  * Dịch vụ bảo hiểm / Thuế / Cổng dịch vụ công: Giao thức kết nối, cơ chế xác thực, thời gian chờ tối đa (timeout).
  * Dịch vụ SMS Brandname / Email thông báo: Mẫu tin nhắn và điều kiện kích hoạt.

### Section 3: Thiết kế Cơ sở dữ liệu chi tiết
* **Sơ đồ ERD quan hệ thực thể:**
  * Khối Mermaid `erDiagram` thể hiện tất cả các bảng trong phân hệ và liên kết khóa ngoại (`FK`) ra các bảng bên ngoài.
* **Bảng đặc tả chi tiết từng cột (Bảng 8 cột chuẩn):**
  * Header: Tên bảng vật lý, Lược đồ CSDL (Schema), Ý nghĩa nghiệp vụ.
  * Bảng cấu trúc chi tiết:

| STT | Tên cột | Kiểu dữ liệu | Cho phép NULL | Giá trị mặc định | Ràng buộc (PK/FK/UQ) | Bảo mật PII | Mô tả nghiệp vụ & Quy tắc định dạng |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 1 | `id` | BIGINT | Không | Tự tăng | PK | Không | Khóa chính bản ghi |
| 2 | `profile_id` | VARCHAR(50) | Không | Tự sinh | UQ | Không | Mã định danh hồ sơ không đổi qua các phiên bản |
| 3 | `identity_code` | VARCHAR(20) | Có | NULL | | Có (Mã hóa) | Số CCCD/CMND công dân, mã hóa AES-256 trong CSDL |
| 4 | `status` | VARCHAR(30) | Không | 'DRAFT' | | Không | Trạng thái vòng đời hồ sơ |
| 5 | `version` | INT | Không | 0 | | Không | Phiên bản phục vụ khóa lạc quan (Optimistic Locking) |

* **Danh mục Enum và Máy trạng thái (State Machine):**
  * Bảng ánh xạ: Giá trị CSDL | Nhãn giao diện | Màu sắc Badge | Điều kiện và quyền chuyển trạng thái.
  * Sơ đồ chu trình trạng thái bằng Mermaid 4:3 LR 2 cột hoặc Sequence Diagram.
* **Chiến lược đánh chỉ mục (Index Strategy):**
  * Tên Index | Bảng | Danh sách cột | Loại Index (B-Tree / Bitmap) | Mục đích tối ưu câu truy vấn.
* **Mẫu câu lệnh DDL cơ sở dữ liệu:** Mẫu câu lệnh tạo bảng, phân vùng (Partition), Sequence và Index.

### Section 4: Hợp đồng giao tiếp API chi tiết (API Contracts)
* **Bảng tổng hợp danh mục API:**
  * Phương thức (HTTP Method) | Đường dẫn (URI) | Mô tả tóm tắt | Quyền truy cập (Role) | Cơ chế xác thực | Giới hạn tần suất (Rate Limit).
* **Đặc tả chi tiết cho từng API:**
  1. *Tiêu đề Header bắt buộc:* `Authorization: Bearer <token>`, `Content-Type: application/json`, `X-Request-ID: <uuid>` (Idempotency Key).
  2. *Payload yêu cầu (Request Body JSON):* Mẫu JSON đầy đủ dữ liệu thực tế kèm chú thích kiểu dữ liệu.
  3. *Bảng quy tắc kiểm tra tính hợp lệ (Validation Rules):* Trường dữ liệu | Kiểu | Bắt buộc | Độ dài tối thiểu/tối đa | Biểu thức Regex | Quy tắc nghiệp vụ.
  4. *Payload phản hồi thành công (Response 200/201 JSON):* Đầy đủ cấu trúc dữ liệu trả về.
  5. *Bảng mã lỗi và kịch bản xử lý lỗi (Error Responses):* Mã HTTP | Mã lỗi ứng dụng (`App Error Code`) | Thông điệp thông báo | Nguyên nhân phát sinh | Hướng xử lý phía Frontend.
  6. *Sơ đồ tuần tự (Sequence Diagram) cho API:* Bắt buộc dóng thẳng trực giao chuẩn UML, mô hình hóa luồng xử lý giữa Client → API Gateway → Backend Service → Cache/Database → External Service.
  7. *Chỉ số phi chức năng (NFR của API):* Thời gian phản hồi kỳ vọng (P95 < 500ms), thông lượng TPS.

### Section 5: Logic nghiệp vụ, Thuật toán & Tiến trình nền
* **Sơ đồ tuần tự nghiệp vụ tổng thể (Sequence Diagram):** Mô tả toàn bộ luồng xử lý từ khi người dùng bắt đầu đến khi hoàn tất, bao gồm cả luồng thành công và luồng xử lý ngoại lệ.
* **Quy tắc tính toán và Thuật toán nghiệp vụ:**
  * Mã quy tắc nghiệp vụ.
  * Mã giả (Pseudocode) hoặc công thức toán học rõ ràng.
  * **Ví dụ tính toán số học cụ thể:** Phải có số liệu giả lập thực tế minh họa từng bước tính toán.
  * Danh sách các trường hợp biên (Edge Cases) bắt buộc xử lý.
* **Cơ chế chống trùng lặp và xử lý phân tán (Idempotency & Concurrency):**
  * Khóa phân tán (Distributed Lock qua Redis/Redisson) hoặc khóa lạc quan (`@Version`).
  * Khóa tự sinh và thời gian sống (TTL).
* **Tiến trình chạy ngầm và Tác vụ định kỳ (Background Jobs & Schedulers):**
  * Biểu thức kích hoạt (Cron expression).
  * Điều kiện lọc dữ liệu đầu vào (SQL WHERE clause).
  * Các bước xử lý từng bước (Step-by-step logic).
  * Kết quả cập nhật và cơ chế ghi log kiểm toán.

### Section 6: Sự kiện hàng đợi thông điệp (Kafka Events)
* **Sự kiện phát đi (Published Events):**
  * Bảng: Tên Topic | Tên Schema | Điều kiện kích hoạt | Phân hệ phát | Phân hệ nhận.
  * Cấu trúc Payload JSON đầy đủ (`event_id`, `event_type`, `occurred_at`, `payload`).
* **Sự kiện tiếp nhận (Consumed Events):**
  * Bảng: Tên Topic | Nguồn phát | Lớp xử lý tiếp nhận | Logic xử lý khi nhận thông điệp | Cơ chế chống xử lý lặp lại (Consumer Idempotency).

### Section 7: Cấu trúc thành phần giao diện (Frontend Components)
* **Cấu trúc thư mục tính năng theo kiến trúc chuẩn (FSD / Feature-based):**
  * Vị trí tệp: `api/`, `components/`, `hooks/`, `types/`, `store/`.
* **Khai báo giao diện kiểu dữ liệu TypeScript (TypeScript Interfaces):** Định nghĩa rõ ràng props của các component chính, không dùng kiểu `any`.
* **Lược đồ kiểm tra tính hợp lệ form (Zod Validation Schema):** Khai báo chi tiết từng trường dữ liệu với thông báo lỗi tiếng Việt tương ứng.
* **Hooks tương tác dữ liệu (Data Fetching Hooks):** Các hook truy vấn dữ liệu (`useQuery`) và cập nhật dữ liệu (`useMutation`) qua TanStack Query hoặc SWR.

### Section 8: An toàn thông tin & Ma trận phân quyền
* **Ma trận phân quyền vai trò (RBAC Matrix):** Bảng phân quyền chi tiết giữa các vai trò (Chuyên viên, Thẩm tra viên, Thủ trưởng, Quản trị viên) trên từng API và nút thao tác.
* **Phân quyền theo phạm vi dữ liệu (Row-Level Security):** Quy tắc lọc dữ liệu theo đơn vị, chi nhánh, cây phòng ban (`shoppath` / `department_id`).
* **Bảo vệ dữ liệu định danh cá nhân (PII Protection):**
  * Danh mục các cột cần mã hóa trong CSDL (CCCD, Số điện thoại, Số tài khoản ngân hàng).
  * Quy định che dấu dữ liệu (Masking) khi hiển thị trên giao diện người dùng.

### Section 9: Ma trận kịch bản kiểm thử (Test Matrix & Acceptance Criteria)
* Bảng danh mục kịch bản kiểm thử (tối thiểu 15-20 kịch bản bao phủ đầy đủ):
  * Nhóm P0: Luồng nghiệp vụ chính thành công (Happy Path).
  * Nhóm P0: Kiểm tra ràng buộc và từ chối dữ liệu sai (Negative Validation).
  * Nhóm P0: Kiểm tra quy tắc nghiệp vụ và công thức tính toán.
  * Nhóm P1: Xử lý trường hợp biên (Edge Cases & Boundaries).
  * Nhóm P1: Kiểm tra an ninh (Security: JWT hết hạn, truy cập trái quyền, chặn leo thang đặc quyền).
  * Nhóm P2: Kiểm tra bẫy tranh chấp dữ liệu đồng thời và Idempotency.

### Section 10: Yêu cầu phi chức năng (NFR)
* Bảng cam kết chỉ số:
  * Thời gian phản hồi API tra cứu (P95 ≤ 500ms).
  * Thời gian phản hồi API ghi nhận / cập nhật (P95 ≤ 800ms).
  * Năng lực chịu tải đồng thời (Throughput RPS / Concurrency).
  * Tính toàn vẹn dữ liệu: 0% thất thoát giao dịch, 0% gạch nợ trùng.
  * Độ sẵn sàng hệ thống (Uptime ≥ 99.9%).

### Section 11: Danh mục tiêu chí hoàn tất (Definition of Done - DoD)
* **Tiêu chí Backend:** Entity có đủ ràng buộc, Service có Unit Test bao phủ ≥ 80%, API có Swagger/OpenAPI đầy đủ, xử lý Transactional an toàn, ghi Audit Log đầy đủ.
* **Tiêu chí Frontend:** Zod schema kiểm tra 100% trường, xử lý đủ các trạng thái giao diện (Loading, Error, Empty, Success), responsive trên mọi độ phân giải màn hình, đa ngôn ngữ `vi.json`.
* **Tiêu chí QA/QC:** Pass 100% kịch bản kiểm thử P0/P1, kiểm thử cross-browser và nghiệm thử an ninh phân quyền.
