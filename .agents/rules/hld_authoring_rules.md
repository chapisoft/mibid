# QUY CHUẨN SOẠN THẢO TÀI LIỆU THIẾT KẾ TỔNG THỂ (HLD / VIETTEL BM.02.QT.00.CNTT.28)

Tài liệu này quy định hệ thống nguyên tắc, cấu trúc 4 phần bắt buộc theo quy trình phát triển phần mềm Tập đoàn Viettel (`BM.02.QT.00.CNTT.28` - Tài liệu Thiết kế Tổng thể / High-Level Design), bảng định cỡ tải hệ thống (Capacity Sizing), bảng cấu hình phần cứng máy chủ (Server Hardware Sizing Dải Trong / Dải Ngoài), mô hình kiến trúc Microservices 6 tầng và kiến trúc An toàn Thông tin (ATTT Viettel).

---

## 1. NGUYÊN TẮC CỐT LÕI KHI SOẠN THẢO HLD

* **Tuân thủ Tuyệt đối Chuẩn mực Viettel `BM.02.QT.00.CNTT.28`:**
  * Toàn bộ tài liệu Thiết kế Tổng thể (HLD) phải tuân theo cấu trúc 4 phần chặt chẽ:
    * Phần I: Giới thiệu (Mục đích, phạm vi, khái niệm thuật ngữ, tài liệu tham khảo, bố cục).
    * Phần II: Các yêu cầu ảnh hưởng đến kiến trúc (Yêu cầu phi chức năng, năng lực xử lý, ràng buộc công nghệ/môi trường).
    * Phần III: Kiến trúc ứng dụng (Mô hình phân lớp, phân rã chức năng/phân hệ, giao tiếp tích hợp hệ thống ngoài, bảng định cỡ tải và cấu hình máy chủ).
    * Phần IV: Các giải pháp kiến trúc khác (Kiến trúc bảo mật ATTT Viettel cho Client và Backend Server, sao lưu phục hồi dữ liệu và xử lý tải cao).
* **Tính sẵn sàng cao và Không điểm lỗi đơn lẻ (High Availability & Zero Single Point of Failure):**
  * Triển khai tối thiểu 2 nodes cho mọi dịch vụ cốt lõi, áp dụng mô hình phân tải (Load Balancing), gom cụm (Clustering) và tự động chuyển đổi dự phòng (Failover).
* **Phân vùng An ninh Mạng Dải Trong và Dải Ngoài (Network Zoning):**
  * Tách biệt rõ ràng giữa Dải Ngoài (Vùng DMZ: WAF, Load Balancer NGINX, Public API Gateway) và Dải Trong (Internal Zone: Microservices, Core Services, Database, Message Broker, Redis).
* **Định lượng Năng lực Tải & Cấu hình Phần cứng (Capacity & Server Sizing):**
  * Bắt buộc có bảng định lượng các chỉ số: Số lượng người dùng hoạt động (Active users), Tổng số giao dịch/ngày, Số người dùng đồng thời (Concurrent users), Thông lượng giao dịch/giây (TPS).
  * Lập bảng cấu hình phần cứng chi tiết (RAM, CPU Cores, SSD, OS) phân bổ theo từng node máy chủ dải trong và dải ngoài.
* **Nguyên tắc Trừu tượng Hóa Kiến trúc & Cấm Trình Bày Chi Tiết Mã Nguồn:**
  * HLD là tài liệu thiết kế kiến trúc cấp cao, tập trung vào phân rã phân hệ/vi dịch vụ, giao thức kết nối, luồng tích hợp, sizing máy chủ và an toàn thông tin.
  * **Tuyệt đối KHÔNG trình bày chi tiết cấp mã nguồn (Code-level):** Cấm viết tên class, tên file controller (ví dụ: `SmartOtpController.java`, `AuthController`), tên service class, repository class. Hãy gọi tên theo dịch vụ nghiệp vụ logic (ví dụ: *Dịch vụ Smart OTP*, *Dịch vụ Xác thực IAM*).
  * **Tuyệt đối KHÔNG viết tên file màn hình giao diện Mobile/Web:** Cấm viết tên file mã nguồn như `SmartOtpScreen.tsx`, `OtpVerificationView.dart`, `LoginFragment.kt`, `AndroidManifest.xml`. Thay vào đó, mô tả theo chức năng kênh tương tác người dùng (ví dụ: *Ứng dụng Di động Khách hàng*, *Cổng thông tin Web Portal*, *Trang Quản trị Web CMS*).
  * Chi tiết cấu trúc bảng CSDL 8 cột, DTO request/response, schema validation hoặc pseudocode thuộc về tài liệu DBDD (`BM.03`), LLD (11 phần) hoặc SRS.
* **Quy chuẩn Trực quan hóa & Cấm đưa chỉ dẫn định dạng vào nội dung:**
  * **Chỉ trình bày duy nhất 1 sơ đồ phù hợp nhất** trực tiếp dưới mỗi tiêu đề kiến trúc (Khuyến nghị sơ đồ Mermaid `flowchart LR` 2 cột chuẩn 4:3 cho kiến trúc hoặc `flowchart LR` 3 tầng chuẩn mực cho phân rã chức năng).
  * **Tuyệt đối CẤM** đưa các câu chữ, nhãn tiêu đề chỉ dẫn định dạng (như *"Phương thức 1 / 2 / 3"*, *"Ký tự Unicode Chuẩn (Đảm bảo hiển thị trọn vẹn 100%...)"*, *"Theo quy chuẩn docsbase"*,...) vào văn bản tài liệu. Văn bản chỉ tập trung thuần túy vào giải pháp nghiệp vụ và kiến trúc kỹ thuật.

---

## 2. CẤU TRÚC 4 PHẦN CHUẨN VIETTEL HLD (`BM.02.QT.00.CNTT.28`)

```text
Tài liệu Thiết kế Tổng thể (High_Level_Design_Document.md)
├── Trang Bìa & Quản trị: Mã hiệu dự án, Mã tài liệu (BM.02.QT.00.CNTT.28), Bảng ký duyệt 3 cấp, Bảng thay đổi tài liệu
├── Phần I: GIỚI THIỆU
│   ├── 1.1. Mục đích
│   ├── 1.2. Phạm vi
│   ├── 1.3. Khái niệm, thuật ngữ và từ viết tắt
│   ├── 1.4. Tài liệu tham khảo
│   └── 1.5. Mô tả tài liệu (Bố cục chung)
├── Phần II: CÁC YÊU CẦU ẢNH HƯỞNG ĐẾN KIẾN TRÚC
│   ├── 2.1. Yêu cầu phi chức năng và Năng lực xử lý hệ thống
│   └── 2.2. Các ràng buộc về công nghệ, môi trường và pháp lý
├── Phần III: KIẾN TRÚC ỨNG DỤNG
│   ├── 3.1. Mô hình Phân lớp Kiến trúc Hệ thống (Microservices 6 Tầng)
│   ├── 3.2. Mô hình Phân rã Chức năng / Phân hệ (Decomposition)
│   │   ├── 3.2.1. Mô hình chức năng tổng thể
│   │   ├── 3.2.2. Phân hệ quản lý danh mục và dịch vụ dùng chung
│   │   ├── 3.2.3. Phân hệ xử lý nghiệp vụ cốt lõi (Giao dịch, Ví, Smart OTP)
│   │   ├── 3.2.4. Phân hệ báo cáo thống kê và đối soát
│   │   └── 3.2.5. Phân hệ quản trị hệ thống và phân quyền người dùng (VSA Admin)
│   ├── 3.3. Giao tiếp với các hệ thống khác (System Integration)
│   │   ├── 3.3.1. Giao tiếp với hệ thống xác thực tập trung (VSA Admin / Keycloak)
│   │   ├── 3.3.2. Giao tiếp với hệ thống tin nhắn viễn thông (SMS Gateway / Brandname)
│   │   └── 3.3.3. Giao tiếp với hệ thống Core (Core Banking / Core eWallet / BCCS)
│   ├── 3.4. Kiến trúc & Quy hoạch Mạng Tổng thể (Overall Network Topology & Zoning)
│   └── 3.5. Định cỡ Hệ thống & Bảng Giả thiết Thiết lập Địa chỉ IP Đề xuất (Capacity Sizing & Proposed IP Allocation)
└── Phần IV: CÁC GIẢI PHÁP KIẾN TRÚC KHÁC
    ├── 4.1. Kiến trúc Bảo mật Hệ thống - An toàn Thông tin (ATTT Viettel)
    │   ├── 4.1.1. Bảo mật tầng ứng dụng Client (Cross-platform, RSA, Obfuscation)
    │   └── 4.1.2. Bảo mật tầng Backend Server (WAF, Dải Trong/Ngoài, JWT, Filter)
    ├── 4.2. Kiến trúc Sao lưu và Phục hồi Dữ liệu (Backup & Disaster Recovery)
    └── 4.3. Giải pháp Xử lý Tải cao và Kết nối Đồng thời Lớn (High Concurrency)
```

---

## 3. CHI TIẾT CÁC BẢNG ĐỊNH CỠ VÀ BẢNG IP ĐỀ XUẤT CHUẨN VIETTEL

### 3.1. Bảng Định cỡ Tải Hệ Thống (Capacity Sizing Table - Mục 3.5.1)

| STT | Chỉ số năng lực hệ thống | Đơn vị tính | Số lượng định mức | Ghi chú & Diễn giải kỹ thuật |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Người dùng hoạt động (Active users) | Người dùng | 2.000.000 | Tổng số thuê bao/người dùng có phát sinh giao dịch trong tháng |
| 2 | Tổng số giao dịch trong ngày | Giao dịch / Ngày | 1.000.000 | Dung lượng giao dịch xử lý hàng ngày |
| 3 | Người dùng đồng thời (Concurrent users) | Phiên kết nối | 10.000 | Số lượng kết nối đồng thời tại khung giờ cao điểm |
| 4 | Thông lượng giao dịch (Throughput TPS) | Giao dịch / Giây | 20 - 50 | Tốc độ xử lý giao dịch tức thời trung bình và đỉnh tải |
| 5 | Số lượng node triển khai tối thiểu | Node | ≥ 2 | Triển khai tối thiểu 2 nodes cho mỗi dịch vụ để đảm bảo HA |
| 6 | Cơ chế đảm bảo tính sẵn sàng cao | Chuẩn HA | Load Balancing, Cluster, Failover | Phân tải tự động, chịu lỗi và không gián đoạn dịch vụ |

### 3.2. Bảng Cấu hình Phần cứng Máy chủ & Giả thiết Thiết lập Địa chỉ IP Đề xuất (Mục 3.5.2)

| STT | Phân vùng mạng | Node máy chủ (Hostname) | Dịch vụ cài đặt | Cấu hình phần cứng tối thiểu | Địa chỉ IP Đề xuất (Giả định) * | VIP Cân bằng tải | Port mở | Trạng thái IP |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| 1 | **Dải Ngoài (DMZ)** | `gw-app-01` | Cổng API Gateway & NGINX Load Balancer 01 | 16 GB RAM, 4 Cores, 200 GB SSD, CentOS 7+ | `10.60.10.11` | `10.60.10.10` | 80, 443 | IP đề xuất (Cập nhật khi cấp IP thật) |
| 2 | **Dải Ngoài (DMZ)** | `gw-app-02` | Cổng API Gateway & NGINX Load Balancer 02 | 16 GB RAM, 4 Cores, 200 GB SSD, CentOS 7+ | `10.60.10.12` | `10.60.10.10` | 80, 443 | IP đề xuất (Cập nhật khi cấp IP thật) |
| 3 | **Dải Trong (Internal)** | `core-srv-01` | Cụm Vi dịch vụ Nghiệp vụ Backend Node 01 | 16 GB RAM, 4 Cores, 200 GB SSD, CentOS 7+ | `10.60.20.21` | - | 8080, 8443 | IP đề xuất (Cập nhật khi cấp IP thật) |
| 4 | **Dải Trong (Internal)** | `core-srv-02` | Cụm Vi dịch vụ Nghiệp vụ Backend Node 02 | 16 GB RAM, 4 Cores, 200 GB SSD, CentOS 7+ | `10.60.20.22` | - | 8080, 8443 | IP đề xuất (Cập nhật khi cấp IP thật) |
| 5 | **Dải Trong (Internal)** | `kafka-broker-01` | Hàng đợi Thông điệp Apache Kafka & Zookeeper | 16 GB RAM, 4 Cores, 300 GB SSD, CentOS 7+ | `10.60.20.25` | - | 9092, 2181 | IP đề xuất (Cập nhật khi cấp IP thật) |
| 6 | **Dải Trong (DB Zone)** | `db-master-01` | CSDL Quan hệ Chính (Master Database RAC/Patroni) | 32 GB RAM, 8 Cores, 500 GB NVMe, CentOS 7+ | `10.60.30.31` | `10.60.30.30` | 5432 / 1521 | IP đề xuất (Cập nhật khi cấp IP thật) |
| 7 | **Dải Trong (DB Zone)** | `db-standby-02` | CSDL Quan hệ Dự phòng (Standby Database HA) | 32 GB RAM, 8 Cores, 500 GB NVMe, CentOS 7+ | `10.60.30.32` | `10.60.30.30` | 5432 / 1521 | IP đề xuất (Cập nhật khi cấp IP thật) |
| 8 | **Dải Trong (DB Zone)** | `redis-cluster-01` | Bộ nhớ đệm phân tán Redis Cluster Node 01 | 16 GB RAM, 4 Cores, 100 GB SSD, CentOS 7+ | `10.60.30.35` | - | 6379 | IP đề xuất (Cập nhật khi cấp IP thật) |
| 9 | **Dải Trong (DB Zone)** | `redis-cluster-02` | Bộ nhớ đệm phân tán Redis Cluster Node 02 | 16 GB RAM, 4 Cores, 100 GB SSD, CentOS 7+ | `10.60.30.36` | - | 6379 | IP đề xuất (Cập nhật khi cấp IP thật) |
| 10 | **Vùng OAM (Quản trị)** | `oam-mon-01` | Bastion Host, Giám sát Prometheus & Log ELK | 16 GB RAM, 4 Cores, 300 GB SSD, CentOS 7+ | `10.60.40.41` | - | 22, 9090, 3000 | IP đề xuất (Cập nhật khi cấp IP thật) |

> **Lưu ý quan trọng (*):** Toàn bộ địa chỉ IP trong bảng trên là địa chỉ IP giả định được thiết lập theo quy hoạch mạng đề xuất phục vụ thiết kế kiến trúc tổng thể. Các địa chỉ này sẽ được đội ngũ triển khai cập nhật chính xác 100% sang dải IP thực tế ngay sau khi Trung tâm Hạ tầng / Ban CNTT phê duyệt và cấp phát chính thức trước khi bắt đầu cài đặt trên môi trường Staging/Production.

### 3.3. Khung An toàn Thông tin ATTT Chuẩn Viettel (Mục 4.1)
1. **Bảo mật Tầng Ứng dụng Client (Mobile App & Web):**
   * *Mã hóa dữ liệu nhạy cảm:* Sử dụng thuật toán bất đối xứng RSA với cặp khóa 2048-bit để mã hóa mật khẩu, mã PIN, dữ liệu sinh trắc học trước khi truyền qua mạng.
   * *Xác thực nguồn gọi:* Định danh client qua App Token và Device Token riêng biệt cho từng nền tảng iOS, Android.
   * *Chống dịch ngược mã nguồn (Obfuscation):* Sử dụng ProGuard / DexGuard cho Android và mã hóa bitcode cho iOS khi đóng gói ứng dụng.
   * *Xác thực đa yếu tố:* 100% các giao dịch tài chính bắt buộc có xác thực OTP / Smart OTP.
2. **Bảo mật Tầng Backend Server:**
   * *Phân vùng an ninh Dải Trong - Dải Ngoài:* Mọi kết nối từ Internet chỉ được dừng lại ở Dải Ngoài (DMZ), kết nối vào Dải Trong phải qua tường lửa chuyên dụng và Cổng API có xác thực.
   * *Bảo vệ kênh truyền:* Toàn bộ giao tiếp bắt buộc qua HTTPS (TLS 1.3).
   * *Bộ lọc xác thực phân quyền:* Sử dụng Spring Security Filter kiểm tra Token JWT, kiểm tra IP whitelist và Device ID trên từng request.
   * *Nhật ký kiểm toán (Audit Logging):* Ghi nhận đầy đủ nhật ký mọi thao tác thay đổi dữ liệu phục vụ đối soát và điều tra an ninh mạng.

---

## 4. MÔ HÌNH KIẾN TRÚC MICROSERVICES 6 TẦNG CHUẨN MỰC

```mermaid
flowchart LR
    subgraph S_INGRESS_GATEWAY ["TẦNG 1, 2 & 3: TRUY CẬP, BIÊN VÀ CỔNG API"]
        direction TB
        subgraph G_CLIENTS ["1. TẦNG CLIENT ĐA KÊNH"]
            direction LR
            C_WEB["Trình duyệt Web<br/>• Web CMS & Portal"]
            C_MOB["Ứng dụng Di động<br/>• App Khách hàng & Đại lý"]
            C_PC["Máy tính / POS / USSD"]
        end

        subgraph G_EDGE ["2. TẦNG BIÊN & CÂN BẰNG TẢI"]
            direction TB
            CDN_NODE["Mạng CDN & Tĩnh<br/>• Tải HTML/CSS/JS, Ảnh<br/>• Giảm tải 80% máy chủ"]
            LB_NODE["Cân bằng tải (Load Balancer)<br/>• Phân phối lưu lượng L4/L7"]
        end

        subgraph G_GW_SEC ["3. CỔNG API & ĐỊNH DANH"]
            direction TB
            GW_NODE["Cổng API (API Gateway)<br/>• Định tuyến động, Rate Limit"]
            IDP_NODE["Nhà cung cấp Định danh (IDP)<br/>• Keycloak / VSA Admin / JWT"]
        end

        C_WEB & C_MOB & C_PC -.->|"Tải tĩnh"| CDN_NODE
        C_WEB & C_MOB & C_PC -->|"Gửi API"| LB_NODE
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
            subgraph DOM1 ["Miền Nghiệp vụ 1 (Ví & Thanh toán)"]
                direction TB
                D1_SA["Dịch vụ Xử lý Giao dịch"]
                D1_SB["Dịch vụ Quản lý Tài khoản"]
            end

            subgraph DOM2 ["Miền Nghiệp vụ 2 (Đối tác & Viễn thông)"]
                direction TB
                D2_SA["Dịch vụ Quản lý Merchant"]
                D2_SB["Dịch vụ BCCS Viễn thông"]
            end
        end

        subgraph G_EVENT_DB ["6. TRUYỀN THÔNG BẤT ĐỒNG BỘ & CƠ SỞ DỮ LIỆU"]
            direction TB
            MB_NODE["Hàng đợi Thông điệp (Kafka)<br/>• Sự kiện Bất đồng bộ & Outbox"]
            subgraph G_DBS ["Cơ sở Dữ liệu Độc lập"]
                direction LR
                DB1[("CSDL Miền 1 (Oracle / PostgreSQL)")]
                DB2[("CSDL Miền 2 (Oracle / PostgreSQL)")]
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

---

## 4.5. MÔ HÌNH PHÂN RÃ CHỨC NĂNG DẠNG CÂY (FUNCTIONAL DECOMPOSITION TREE)

Mục 3.2 (Mô hình Phân rã Chức năng / Phân hệ) bắt buộc sử dụng **Sơ đồ Flowchart Dạng Cây Ngang 3 Tầng (`flowchart LR`)** đáp ứng các tiêu chuẩn kỹ thuật sau:

* **Bố cục 3 Tầng phân cấp độc lập:**
  * **Tầng 0:** Gốc hệ thống tổng thể (Cột 1 bên trái).
  * **Tầng 1:** 4 phân hệ cốt lõi (Cột 2 ở giữa). **Bắt buộc đồng bộ độ dài ký tự và không dùng thẻ ngắt dòng `<br/>`** để mép phải của 4 ô phân hệ có toạ độ X bằng nhau, giúp dóng thẳng tắp lề trái của toàn bộ cột chức năng con.
  * **Tầng 2:** 100% các chức năng con được tách riêng vào từng ô độc lập (Cột 3 bên phải).
* **Quy chuẩn thông số đồ thị và khoảng đệm (Balanced Padding):**
  * `rankSpacing: 140`: Mở rộng khoảng cách ngang giữa các tầng giúp sơ đồ thoáng đãng, mũi tên dài và uốn cong tự nhiên.
  * `nodeSpacing: 8`: Thu hẹp khoảng cách dọc giúp sơ đồ vừa vặn trong 1 khung nhìn duy nhất.
  * `curve: 'basis'`: Đường nối uốn lượn mượt mà, chạm khít vào mép viền ô.
  * Khoảng đệm nội bộ: Cấp 0 (`padding: 6px 16px`), Cấp 1 (`padding: 5px 14px`), Cấp 2 (`padding: 4px 10px`).
* **Điều cấm kỵ:** Cấm dùng liên kết ẩn `~~~`, cấm set cố định CSS `width: ...px` trong classDef, cấm dùng khung bao `subgraph` viền nền vàng.

```mermaid
%%{init: {'flowchart': {'nodeSpacing': 8, 'rankSpacing': 140, 'padding': 3, 'curve': 'basis'}}}%%
flowchart LR
    %% GỐC HỆ THỐNG (CẤP 0)
    ROOT["HỆ THỐNG XÁC THỰC SMART OTP"]:::cLevel0

    %% PHÂN HỆ CỐT LÕI (CẤP 1 - ĐỒNG BỘ TUYỆT ĐỐI ĐỘ DÀI)
    MOD1["1. PHÂN HỆ NỀN TẢNG LÕI"]:::cLevel1
    MOD2["2. PHÂN HỆ CỔNG TÍCH HỢP"]:::cLevel1
    MOD3["3. PHÂN HỆ QUẢN TRỊ CMS"]:::cLevel1
    MOD4["4. PHÂN HỆ APP CLIENT"]:::cLevel1

    %% CHỨC NĂNG CON PHÂN HỆ 1 (CẤP 2)
    F1_1["1.1. Mật mã OCRA RFC 6287"]:::cLevel2
    F1_2["1.2. Mã hóa Vault KMS Transit"]:::cLevel2
    F1_3["1.3. Khóa cứng 5 lần sai PIN"]:::cLevel2
    F1_4["1.4. Đối soát & Chống Replay"]:::cLevel2

    %% CHỨC NĂNG CON PHÂN HỆ 2 (CẤP 2)
    F2_1["2.1. Xác thực HMAC-SHA256"]:::cLevel2
    F2_2["2.2. Phân nhánh qua Redis"]:::cLevel2
    F2_3["2.3. Fallback sang SMS OTP"]:::cLevel2
    F2_4["2.4. Phủ 28 Dịch vụ Ví Natcash"]:::cLevel2

    %% CHỨC NĂNG CON PHÂN HỆ 3 (CẤP 2)
    F3_1["3.1. Bảng Giám sát Realtime TPS"]:::cLevel2
    F3_2["3.2. Quản lý Thiết bị & Reset"]:::cLevel2
    F3_3["3.3. Thu hồi Khóa Silent Push"]:::cLevel2
    F3_4["3.4. Sandbox & Live Simulator"]:::cLevel2

    %% CHỨC NĂNG CON PHÂN HỆ 4 (CẤP 2)
    F4_1["4.1. Ký số Face ID On-Device"]:::cLevel2
    F4_2["4.2. Lưu trữ Keychain & TEE"]:::cLevel2
    F4_3["4.3. Tự vệ RASP Chống Root"]:::cLevel2
    F4_4["4.4. Cờ Chống chụp FLAG_SECURE"]:::cLevel2

    %% LIÊN KẾT TỪ GỐC SANG 4 PHÂN HỆ
    ROOT --> MOD1
    ROOT --> MOD2
    ROOT --> MOD3
    ROOT --> MOD4

    %% LIÊN KẾT TỪ PHÂN HỆ SANG CÁC CHỨC NĂNG CON ĐỘC LẬP
    MOD1 --> F1_1 & F1_2 & F1_3 & F1_4
    MOD2 --> F2_1 & F2_2 & F2_3 & F2_4
    MOD3 --> F3_1 & F3_2 & F3_3 & F3_4
    MOD4 --> F4_1 & F4_2 & F4_3 & F4_4

    %% ĐỊNH DẠNG Ô CÂN ĐỐI TRÊN DƯỚI VÀ 2 BÊN
    classDef cLevel0 font-size:12px,font-weight:bold,padding:6px 16px;
    classDef cLevel1 font-size:11px,font-weight:bold,padding:5px 14px;
    classDef cLevel2 font-size:10px,padding:4px 10px;
```

---

## 5. MÔ HÌNH GIAO TIẾP HỆ THỐNG NGOÀI (SYSTEM INTEGRATION FLOWCHART)

Mục 3.3 (Giao tiếp với các hệ thống khác) bắt buộc sử dụng **Sơ đồ Flowchart (`flowchart LR`)** thể hiện kiến trúc **Điều phối Trung tâm (API Gateway Orchestration)**: Kênh App/CMS gửi request đến Cổng BE Gateway, BE Gateway điều hướng tuần tự sang các dịch vụ chuyên biệt (Smart OTP Core, Wallet Core, SMS Gateway, BCCS); các dịch vụ này **hoàn toàn độc lập và không gọi trực tiếp chéo nhau**:

```mermaid
flowchart LR
    subgraph S_CHANNELS ["1. TẦNG CLIENT & ĐIỀU PHỐI CỔNG APIGATEWAY"]
        direction TB
        C_APP["Ứng dụng Di động Khách hàng (Mobile App)<br/>• Gửi yêu cầu giao dịch tài chính & viễn thông"]
        BE_APP["CỔNG APIGATEWAY CỦA APP (BE APP)<br/>• Bộ Điều Hướng Dịch Vụ Trung Tâm (Orchestrator)<br/>• Điều phối luồng Smart OTP, Wallet, SMS, BCCS<br/>• Quản lý phiên giao dịch & Cache Redis"]
        C_CMS["Cổng Quản trị Doanh nghiệp Web CMS<br/>• Quản trị viên, Vận hành viên & CSKH"]
        BE_CMS["CỔNG BACKEND CMS (BE CMS)<br/>• Điều phối tác vụ Tra cứu, Reset, Đối soát"]
        C_APP -->|"1. API Request"| BE_APP
        C_CMS -->|"Truy cập Quản trị (LAN/VPN)"| BE_CMS
    end

    subgraph S_SERVICES ["2. CÁC DỊCH VỤ CHUYÊN BIỆT ĐỘC LẬP (DECOUPLED SERVICES)"]
        direction TB
        SOTP_CORE["DỊCH VỤ SMART OTP CORE (XÁC THỰC)<br/>• Động cơ Mật mã OCRA RFC 6287<br/>• Mã hóa Phong bì HashiCorp Vault KMS<br/>• Quản lý Khóa cứng & Vòng đời Thiết bị"]
        WALLET_CORE["WALLET CORE & CORE BANKING NATCASH<br/>• Quản lý Tài khoản & Biến động Số dư<br/>• Hạch toán Sổ cái Giao dịch Tài chính"]
        SMSGW_CORE["CỔNG SMS GATEWAY NATCOM (SMSC)<br/>• Gửi tin nhắn SMS Brandname kích hoạt<br/>• Phát sinh mã OTP SMS khi Fallback"]
        BCCS_CORE["HỆ THỐNG BCCS VIỄN THÔNG NATCOM<br/>• Gạch cước, Nạp tiền TopUp, Mua gói Data<br/>• Quản lý Gói cước Thuê bao Di động"]
        EXT_VSA["HỆ THỐNG XÁC THỰC VSA ADMIN VIETTEL<br/>• Xác thực tập trung SSO/CAS Quản trị viên<br/>• Phân quyền Menu & Chức năng Web CMS"]
    end

    %% ĐIỀU HƯỚNG TỪ BE APP SANG CÁC DỊCH VỤ ĐỘC LẬP
    BE_APP -->|"1. Xác thực OTP & Chữ ký (RESTful)"| SOTP_CORE
    BE_APP -->|"2. Hạch toán Giao dịch (TCP Socket ISO 8583)"| WALLET_CORE
    BE_APP -->|"3. Gửi SMS OTP / Fallback (SMPP/REST)"| SMSGW_CORE
    BE_APP -->|"4. Nạp tiền & Gói Data (RESTful HTTPS)"| BCCS_CORE

    %% ĐIỀU HƯỚNG TỪ BE CMS SANG CÁC DỊCH VỤ ĐỘC LẬP
    BE_CMS -->|"Xác thực SSO"| EXT_VSA
    BE_CMS -->|"Tra cứu & Reset Thiết bị"| SOTP_CORE
    BE_CMS -->|"Đối soát Giao dịch"| WALLET_CORE
    BE_CMS -->|"Tra cứu Thuê bao"| BCCS_CORE
```

---

## 6. MÔ HÌNH KIẾN TRÚC AN TOÀN THÔNG TIN VÀ SAO LƯU DR (FLOWCHART)

Mục 4.1 (An toàn thông tin ATTT) và Mục 4.2 (Sao lưu và Phục hồi dữ liệu) bắt buộc sử dụng **Sơ đồ Flowchart (`flowchart LR`)**:

### Sơ đồ Kiến trúc Bảo mật ATTT Viettel (Mục 4.1):
```mermaid
flowchart LR
    subgraph S_SEC_CLIENT ["BẢO MẬT TẦNG CLIENT"]
        direction TB
        C_ENC["Mã hóa Dữ liệu Nhạy cảm<br/>• RSA 2048-bit Key Pair<br/>• Mã hóa PIN & Dữ liệu mật"]
        C_INTEG["Toàn vẹn & Chống Dịch ngược<br/>• Obfuscation ProGuard / Bitcode<br/>• Định danh Device & App Token"]
        C_ENC --> C_INTEG
    end

    subgraph S_SEC_NETWORK ["BẢO MẬT BIÊN & MẠNG (DMZ)"]
        direction TB
        N_WAF["Tường lửa WAF & Anti-DDoS<br/>• Lọc mã độc SQLi, XSS, Botnet<br/>• Giới hạn lưu lượng Rate Limiting"]
        N_TLS["Bảo vệ Kênh truyền<br/>• Giao thức TLS 1.3 / HTTPS<br/>• Pinning chứng chỉ số SSL"]
        N_WAF --> N_TLS
    end

    subgraph S_SEC_BACKEND ["BẢO MẬT NỘI BỘ & CSDL (INTERNAL)"]
        direction TB
        B_AUTH["Xác thực & Phân quyền<br/>• Spring Security & JWT Token<br/>• Whitelist IP & RBAC Viettel"]
        B_DATA["Bảo mật Dữ liệu & Kiểm toán<br/>• Mã hóa AES-256 Storage<br/>• Nhật ký Kiểm toán Audit Log"]
        B_AUTH --> B_DATA
    end

    S_SEC_CLIENT -->|"HTTPS / TLS 1.3"| S_SEC_NETWORK
    S_SEC_NETWORK -->|"Tường lửa Dải Trong"| S_SEC_BACKEND
```

### Sơ đồ Kiến trúc Sao lưu và Khôi phục Thảm họa (Mục 4.2):
```mermaid
flowchart LR
    subgraph S_DC_PRIMARY ["TRUNG TÂM DỮ LIỆU CHÍNH (DC PRODUCTION)"]
        direction TB
        PRI_APP["Cụm Ứng dụng Active-Active<br/>• Kubernetes Nodes & Microservices<br/>• NGINX Load Balancing"]
        PRI_DB[("Cụm CSDL Chính (Master DB)<br/>• Oracle RAC / PostgreSQL Patroni<br/>• Đọc / Ghi giao dịch 24/7")]
        PRI_APP --> PRI_DB
    end

    subgraph S_DR_SITE ["TRUNG TÂM DỰ PHÒNG THẢM HỌA (DR SITE)"]
        direction TB
        DR_APP["Cụm Ứng dụng Dự phòng<br/>• Sẵn sàng nhận lưu lượng DNS<br/>• RTO ≤ 15 phút khi chuyển mạch"]
        DR_DB[("Cụm CSDL Dự phòng (Standby DB)<br/>• Đồng bộ Bán đồng bộ RPO = 0<br/>• Data Guard / Physical Replication")]
        DR_APP --> DR_DB
    end

    subgraph S_BACKUP_STORAGE ["HẠ TẦNG LƯU TRỮ SAO LƯU ĐỘC LẬP"]
        direction TB
        BK_FULL["Bản Sao lưu Toàn phần (Full Backup)<br/>• Tự động 02:00 Chủ nhật hàng tuần<br/>• Lưu trữ an toàn ≥ 6 tháng"]
        BK_INC["Sao lưu Gia tăng & Archive Log<br/>• Tự động liên tục hàng ngày<br/>• Sẵn sàng Point-in-time Recovery"]
        BK_FULL --- BK_INC
    end

    PRI_DB ==>|"Đồng bộ Bán đồng bộ (RPO = 0)"| DR_DB
    PRI_DB -.->|"Sao lưu tự động định kỳ"| S_BACKUP_STORAGE
```


