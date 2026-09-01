# TÀI LIỆU GIẢI PHÁP TỔNG THỂ HỆ THỐNG (MASTER SOLUTION ARCHITECTURE)

**DỰ ÁN:** [TÊN HỆ THỐNG / CHƯƠNG TRÌNH CHUYỂN ĐỔI SỐ]  
**CHỦ ĐẦU TƯ / ĐƠN VỊ THỤ HƯỞNG:** [TÊN ĐƠN VỊ]  
**ĐƠN VỊ TƯ VẤN KIẾN TRÚC:** [TÊN ĐƠN VỊ THIẾT KẾ]  
**PHIÊN BẢN:** V1.0  
**NGÀY PHÁT HÀNH:** [NGÀY/THÁNG/NĂM]  

---

## BẢNG GHI NHẬN THAY ĐỔI TÀI LIỆU

| Ngày thay đổi | Vị trí thay đổi | A*, M, D | Nguồn gốc | Phiên bản cũ | Mô tả thay đổi | Phiên bản mới |
| :--- | :--- | :---: | :--- | :---: | :--- | :---: |
| [DD/MM/YYYY] | Toàn bộ tài liệu | A* | Thiết kế ban đầu | N/A | Khởi tạo tài liệu Giải pháp Tổng thể 4 trụ cột | V1.0 |

*Ghi chú ký hiệu thao tác:* `A*` – Tạo mới (Add), `M` – Sửa đổi (Modify), `D` – Xóa bỏ (Delete).

---

## PHẦN 0: TỔNG QUAN ĐIỀU HÀNH & BỐI CẢNH CHIẾN LƯỢC

### 0.1. Bối cảnh và Tầm nhìn Chiến lược
[Mô tả bối cảnh ngành, định hướng phát triển tổng thể, yêu cầu cải cách hành chính và chuẩn hóa dữ liệu tập trung.]

### 0.2. Phạm vi và Đối tượng Thụ hưởng
[Nêu rõ phạm vi nghiệp vụ, các nhóm cơ quan/đơn vị tham gia và đối tượng thụ hưởng dịch vụ trực tiếp.]

---

## TRỤ CỘT 1: GIẢI PHÁP NGHIỆP VỤ TỔNG THỂ (BUSINESS SOLUTION)

### 1.1. Bản đồ Năng lực Nghiệp vụ (Business Capability Map)

```mermaid
flowchart TD
    %% TẦNG GỐC: KHUNG NĂNG LỰC TỔNG THỂ
    ROOT["BẢN ĐỒ NĂNG LỰC NGHIỆP VỤ DOANH NGHIỆP"]

    %% TẦNG 1: CÁC TRỤ CỘT NĂNG LỰC
    ROOT --> CAP_STRAT["1. NĂNG LỰC CHIẾN LƯỢC<br/>& QUẢN TRỊ"]
    ROOT --> CAP_CORE["2. NĂNG LỰC TÁC NGHIỆP<br/>CỐT LÕI"]
    ROOT --> CAP_SUPP["3. NĂNG LỰC HỖ TRỢ<br/>& NỀN TẢNG"]

    %% TẦNG 2: CÁC NĂNG LỰC THÀNH PHẦN PHÂN RÃ
    CAP_STRAT --> S1["1.1. Quản lý Chỉ tiêu KPI & Giám sát"]
    CAP_STRAT --> S2["1.2. Kiểm toán Vết Luồng Nghiệp vụ"]
    CAP_STRAT --> S3["1.3. Quản trị Chính sách Bảo mật"]

    CAP_CORE --> C1["2.1. Tiếp nhận & Xác thực Định danh"]
    CAP_CORE --> C2["2.2. Thẩm định & Đối soát Tự động"]
    CAP_CORE --> C3["2.3. Phê duyệt & Ký số Phân cấp"]
    CAP_CORE --> C4["2.4. Thanh toán & Trả kết quả"]

    CAP_SUPP --> P1["3.1. Quản lý Danh mục Dùng chung"]
    CAP_SUPP --> P2["3.2. Trục Liên thông & Tích hợp API"]
    CAP_SUPP --> P3["3.3. Kho Dữ liệu & Báo cáo BI"]
```

### 1.2. Khung Quy trình Nghiệp vụ Đầu cuối (End-to-End Process Landscape)

```mermaid
sequenceDiagram
    autonumber
    actor U as Người dùng / Công dân
    participant FE as Cổng Dịch vụ Trực tuyến
    participant GW as Cổng API Gateway
    participant CORE as Dịch vụ Xử lý Nghiệp vụ
    participant EXT as CSDL Quốc gia / Đối tác Ngoài
    participant DB as Cụm Dữ liệu Tập trung

    U->>FE: 1. Nộp hồ sơ và ký số điện tử
    FE->>GW: 2. Gửi yêu cầu tiếp nhận hồ sơ
    GW->>CORE: 3. Điều phối xử lý nghiệp vụ
    CORE->>EXT: 4. Đối soát thông tin định danh công dân
    EXT-->>CORE: 5. Xác thực thông tin hợp lệ
    CORE->>DB: 6. Ghi nhận hồ sơ vào CSDL (status = PROCESSING)
    CORE-->>FE: 7. Trả mã số tiếp nhận hồ sơ
    FE-->>U: 8. Hiển thị thông báo tiếp nhận thành công
```

### 1.3. Mô hình Hành trình Người dùng & Phân cấp Tác nhân

| Nhóm tác nhân | Điểm chạm (Touchpoints) | Hành trình tác nghiệp chính | Kỳ vọng trải nghiệm |
| :--- | :--- | :--- | :--- |
| **Công dân / Doanh nghiệp** | Web Portal, Ứng dụng Di động | Đăng nhập VNeID → Chọn thủ tục → Điền biểu mẫu thông minh → Ký số → Nộp hồ sơ → Tra cứu tiến độ | Đơn giản, tự động điền thông tin, xử lý dưới 5 phút |
| **Chuyên viên Xử lý** | Web Back-Office Nội bộ | Nhận thông báo hồ sơ mới → Thẩm tra hồ sơ → Đối soát tự động → Lập biên bản thẩm định → Trình duyệt | Giao diện tập trung, cảnh báo trùng lặp, gợi ý tự động |
| **Lãnh đạo Phê duyệt** | Web Back-Office / Mobile App | Xem tờ trình tổng hợp → Thẩm định hồ sơ đính kèm → Ký số phê duyệt (Cloud HSM) → Ban hành | Thao tác 1 chạm, hỗ trợ phê duyệt hàng loạt an toàn |

---

## TRỤ CỘT 2: GIẢI PHÁP KIẾN TRÚC TỔNG THỂ (ARCHITECTURE BLUEPRINT)

### 2.1. Kiến trúc Hệ thống Microservices Đa tầng 6 Khối Chuẩn Mực

```mermaid
flowchart LR
    subgraph S_INGRESS_GATEWAY ["TẦNG 1, 2 & 3: TRUY CẬP, BIÊN VÀ CỔNG API"]
        direction TB
        subgraph G_CLIENTS ["1. TẦNG CLIENT ĐA KÊNH"]
            direction LR
            C_WEB["Trình duyệt Web<br/>• Web Portal & Web CMS"]
            C_MOB["Ứng dụng Di động<br/>• App Khách hàng & Đại lý"]
            C_PC["Máy tính / POS / Kiosk"]
        end

        subgraph G_EDGE ["2. TẦNG BIÊN & CÂN BẰNG TẢI"]
            direction TB
            CDN_NODE["Mạng Phân phối Nội dung (CDN)<br/>• Tải nội dung tĩnh (Static Content)<br/>• Giảm tải 80% lưu lượng máy chủ"]
            LB_NODE["Cân bằng tải (Load Balancer)<br/>• Phân phối lưu lượng L4/L7 đa vùng"]
        end

        subgraph G_GW_SEC ["3. CỔNG API & ĐỊNH DANH"]
            direction TB
            GW_NODE["Cổng API (API Gateway)<br/>• Định tuyến động, Rate Limiting"]
            IDP_NODE["Nhà cung cấp Định danh (IDP)<br/>• Keycloak / OAuth2 / OIDC"]
        end

        C_WEB & C_MOB & C_PC -.->|"Tải tĩnh"| CDN_NODE
        C_WEB & C_MOB & C_PC -->|"Gửi yêu cầu"| LB_NODE
        LB_NODE --> GW_NODE
        GW_NODE <-->|"Xác thực"| IDP_NODE
    end

    subgraph S_SERVICES_DATA ["TẦNG 4, 5 & 6: QUẢN TRỊ, VI DỊCH VỤ VÀ DỮ LIỆU"]
        direction TB
        subgraph G_DISCOVERY_COORD ["4. QUẢN TRỊ & ĐIỀU PHỐI PHÂN TÁN"]
            direction LR
            REG_NODE["Đăng ký & Khám phá<br/>(Service Registry)<br/>• Eureka / Consul"]
            COORD_NODE["Điều phối Cụm Dịch vụ<br/>(Service Coordination)<br/>• Apache Zookeeper / etcd"]
        end

        subgraph G_DOMAINS ["5. TẦNG VI DỊCH VỤ THEO MIỀN (DDD)"]
            direction TB
            subgraph DOM1 ["Miền Nghiệp vụ 1 (Core Domain)"]
                direction TB
                D1_SA["Dịch vụ Nghiệp vụ A"]
                D1_SB["Dịch vụ Nghiệp vụ B"]
            end

            subgraph DOM2 ["Miền Nghiệp vụ 2 (Supporting Domain)"]
                direction TB
                D2_SA["Dịch vụ Báo cáo & Thống kê"]
                D2_SB["Dịch vụ Thông báo đa kênh"]
            end
        end

        subgraph G_EVENT_DB ["6. TRUYỀN THÔNG BẤT ĐỒNG BỘ & CƠ SỞ DỮ LIỆU"]
            direction TB
            MB_NODE["Hàng đợi Thông điệp (Kafka Broker)<br/>• Sự kiện Bất đồng bộ & Outbox Pattern"]
            subgraph G_DBS ["Cơ sở Dữ liệu Độc lập (Database per Service)"]
                direction LR
                DB1[("Cơ sở Dữ liệu Miền 1")]
                DB2[("Cơ sở Dữ liệu Miền 2")]
            end
        end

        GW_NODE --> DOM1 & DOM2
        DOM1 & DOM2 -.->|"Đăng ký"| REG_NODE
        DOM1 & DOM2 -.->|"Điều phối"| COORD_NODE
        DOM1 -->|"Phát sự kiện"| MB_NODE
        MB_NODE -->|"Tiêu thụ"| DOM2
        DOM1 --> DB1
        DOM2 --> DB2
    end

    S_INGRESS_GATEWAY --> S_SERVICES_DATA
```

### 2.2. Kiến trúc Dữ liệu & Quản trị Dữ liệu Doanh nghiệp
* **Dữ liệu Giao dịch Trực tuyến (OLTP):** Thiết kế chuẩn hóa quan hệ (3NF), sử dụng khóa ngoại chặt chẽ, tối ưu hóa chỉ mục B-Tree và phân vùng dữ liệu theo năm.
* **Dữ liệu Danh mục Dùng chung (Master Data Management - MDM):** Quản lý tập trung các bảng danh mục hành chính, danh mục chức danh, đồng bộ tự động tới các vi dịch vụ qua Kafka Topic.
* **Chính sách Vòng đời Dữ liệu (Data Lifecycle Management):** Dữ liệu hoạt động (0-2 năm) lưu trữ trên ổ đĩa tốc độ cao NVMe (Hot Storage); Dữ liệu lịch sử (> 2 năm) chuyển sang lưu trữ dài hạn (Cold Storage) để tối ưu chi phí.

### 2.3. Kiến trúc Tích hợp & Liên thông Hệ thống
* **Tích hợp Đồng bộ Tốc độ cao:** Giao thức gRPC Protobuf kết nối giữa các vi dịch vụ nội bộ (độ trễ < 5ms).
* **Tích hợp Bất đồng bộ Hướng sự kiện:** Apache Kafka phục vụ truyền thông điệp sự kiện nghiệp vụ và đồng bộ dữ liệu Outbox.
* **Tích hợp Trục Liên thông Quốc gia (NDXP / LGSP):** Xây dựng module kết nối chuẩn hóa, ký số thông điệp XML/JSON theo quy chuẩn kỹ thuật quốc gia.

---

## TRỤ CỘT 3: GIẢI PHÁP VẬN HÀNH & QUẢN TRỊ (OPERATIONS & GOVERNANCE)

### 3.1. Mô hình Vận hành & Hỗ trợ Kỹ thuật ITIL Phân cấp

| Cấp hỗ trợ | Đơn vị phụ trách | Trách nhiệm chính | Cam kết thời gian (SLA) |
| :--- | :--- | :--- | :--- |
| **Cấp 1 (L1 - Service Desk)** | Đội ngũ Hỗ trợ Vận hành | • Tiếp nhận yêu cầu/sự cố 24/7 qua Hotline/Portal<br/>• Hướng dẫn thao tác người dùng<br/>• Phân loại và chuyển tiếp sự cố đúng đầu mối | Tiếp nhận trong 5 phút, xử lý ngay trong 15 phút với yêu cầu phổ biến |
| **Cấp 2 (L2 - Application Ops)** | Đội ngũ Quản trị Ứng dụng & Hệ thống | • Kiểm tra log lỗi, truy vết sự cố phân tán<br/>• Khởi động lại dịch vụ hoặc điều chỉnh cấu hình<br/>• Khắc phục lỗi sai lệch dữ liệu nghiệp vụ | Phản hồi trong 15 phút, xử lý trong 2 - 4 giờ |
| **Cấp 3 (L3 - Core Engineering)** | Nhóm Chuyên gia & Kiến trúc sư | • Sửa lỗi mã nguồn (Source code fix)<br/>• Phát hành bản vá nóng (Hotfix release)<br/>• Tối ưu hiệu năng kiến trúc và cơ sở dữ liệu | Khắc phục trong 4 - 8 giờ đối với sự cố nghiêm trọng |

### 3.2. Giám sát Toàn diện & Trung tâm Điều hành An ninh (APM & SOC 24/7)
* **Số liệu Hệ thống (Metrics):** Prometheus thu thập tự động các chỉ số hạ tầng (CPU, RAM, Disk I/O) và chỉ số ứng dụng (RPS, Latency P95/P99, Error Rate), hiển thị trên Dashboard Grafana.
* **Nhật ký Tập trung (Centralized Logging):** Thu thập toàn bộ log ứng dụng về cụm Elasticsearch / OpenSearch, cấu hình cảnh báo tự động khi xuất hiện mẫu lỗi bất thường.
* **Truy vết Phân tán (Distributed Tracing):** Tích hợp OpenTelemetry gắn mã `trace_id` xuyên suốt từ Gateway qua các vi dịch vụ đến CSDL.

### 3.3. Kế hoạch Kinh doanh Liên tục & Khôi phục Thảm họa (BCP & DRP)
* **Mô hình Triển khai DC / DR:**
  * Trung tâm Dữ liệu Chính (Primary DC): Vận hành tải 100%.
  * Trung tâm Dữ liệu Dự phòng (DR Site): Cấu hình sẵn sàng nóng, đồng bộ dữ liệu liên tục qua mạng truyền dẫn chuyên dụng.
* **Chỉ số Mục tiêu Khôi phục:**
  * Thời gian Khôi phục Mục tiêu: `RTO ≤ 15 phút`.
  * Điểm Khôi phục Mục tiêu: `RPO = 0` (Bảo đảm không mất dữ liệu giao dịch đã ghi nhận).
* **Quy trình Chuyển đổi Khẩn cấp (Failover Procedure):** Tự động chuyển hướng DNS/BGP sang Trung tâm DR khi Trung tâm DC chính mất kết nối quá 3 phút.

---

## TRỤ CỘT 4: GIẢI PHÁP TRIỂN KHAI & CHUYỂN ĐỔI (DEPLOYMENT & MIGRATION)

### 4.1. Lộ trình Phân kỳ Triển khai Tổng thể (Phasing Roadmap)

```mermaid
flowchart LR
    subgraph S_PHASE_1 ["GIAI ĐOẠN 1 & 2: THIẾT KẾ VÀ THÍ ĐIỂM"]
        direction TB
        P1["GIAI ĐOẠN 1: THIẾT KẾ & HẠ TẦNG (Tháng 1 - 2)<br/>• Phê duyệt thiết kế chi tiết và kiến trúc<br/>• Thiết lập môi trường hạ tầng DC/DR và CI/CD"]
        P2["GIAI ĐOẠN 2: TRIỂN KHAI THÍ ĐIỂM (Tháng 3 - 5)<br/>• Triển khai các dịch vụ cốt lõi tại 2 đơn vị thí điểm<br/>• Đánh giá hiệu năng và hiệu chỉnh nghiệp vụ"]
        P1 --> P2
    end

    subgraph S_PHASE_2 ["GIAI ĐOẠN 3 & 4: NHÂN RỘNG VÀ BÀN GIAO"]
        direction TB
        P3["GIAI ĐOẠN 3: NHÂN RỘNG TOÀN QUỐC (Tháng 6 - 8)<br/>• Chuyển đổi dữ liệu toàn bộ các đơn vị thành viên<br/>• Đào tạo tập trung người dùng và chuyển đổi hệ thống"]
        P4["GIAI ĐOẠN 4: VẬN HÀNH CHÍNH THỨC (Tháng 9 - 12)<br/>• Vận hành chính thức toàn hệ thống<br/>• Bàn giao quản trị và bảo hành bảo trì"]
        P3 --> P4
    end

    P2 --> P3
```

### 4.2. Kế hoạch Chuyển đổi Dữ liệu Kế thừa (Legacy Data Migration)
1. **Bước 1 (Khảo sát & Trích xuất):** Khảo sát cấu trúc cơ sở dữ liệu cũ, trích xuất dữ liệu thô sang vùng lưu trữ tạm (Staging Area).
2. **Bước 2 (Làm sạch & Chuẩn hóa):** Loại bỏ bản ghi trùng lặp, chuẩn hóa định dạng số CCCD, ngày tháng, danh mục hành chính theo chuẩn mới.
3. **Bước 3 (Nạp & Ánh xạ Lược đồ):** Chạy chương trình ETL nạp dữ liệu vào cơ sở dữ liệu mới theo cấu trúc chuẩn.
4. **Bước 4 (Đối soát Chéo 100%):** Chạy script kiểm tra số học: `Tổng số bản ghi`, `Tổng số tiền`, `Tổng số hồ sơ theo trạng thái` giữa hệ thống cũ và mới phải khớp 100%.
5. **Bước 5 (Ký Biên bản Nghiệm thu Dữ liệu):** Các bên liên quan ký xác nhận tính chính xác của dữ liệu đã chuyển đổi.

### 4.3. Kế hoạch Chuyển đổi Hệ thống (Go-Live Cutover Plan)
* **Khung giờ Chuyển đổi (Cutover Window):** Thực hiện từ 22h00 tối Thứ Sáu đến 06h00 sáng Thứ Hai để không ảnh hưởng hoạt động nghiệp vụ thường nhật.
* **Kịch bản Quay lui (Rollback Plan):** Nếu phát sinh sự cố nghiêm trọng không thể khắc phục trước 04h00 sáng Thứ Hai, Ban Chỉ đạo sẽ ra quyết định phục hồi nguyên trạng hệ thống cũ từ bản sao lưu trước giờ Cutover.
