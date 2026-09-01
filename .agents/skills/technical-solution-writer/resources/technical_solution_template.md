# TẬP ĐOÀN CÔNG NGHIỆP - VIỄN THÔNG QUÂN ĐỘI
## [TÊN ĐƠN VỊ THÀNH VIÊN / TRUNG TÂM PHÁT TRIỂN]

---

# [TÊN DỰ ÁN / HỆ THỐNG PHẦN MỀM]
# TÀI LIỆU THIẾT KẾ TỔNG THỂ

**Mã hiệu dự án:** [PROJECT_CODE]  
**Mã hiệu tài liệu:** BM.02_Thiết kế tổng thể (BM.02.QT.00.CNTT.28)  
**Địa danh & Thời gian:** Hanoi, [MM/YYYY]  

---

## BẢNG KÝ DUYỆT TÀI LIỆU

| Vai trò | Họ và tên | Chức danh / Đơn vị | Chữ ký | Ngày ký |
| :--- | :--- | :--- | :---: | :---: |
| **Người lập (The establishment)** | [Họ tên kỹ sư thiết kế] | Kỹ sư Kiến trúc Phần mềm | | [DD/MM/YYYY] |
| **Người thẩm tra (Auditor)** | [Họ tên chuyên gia thẩm định]| Trưởng phòng Kiến trúc Giải pháp | | [DD/MM/YYYY] |
| **Người phê duyệt (Approver)** | [Họ tên lãnh đạo phê duyệt] | Giám đốc Trung tâm / Khối CNTT | | [DD/MM/YYYY] |

---

## BẢNG GHI NHẬN THAY ĐỔI TÀI LIỆU

*Ghi chú ký hiệu:* `A*` – Tạo mới (Add), `M` – Sửa đổi (Modify), `D` – Xóa bỏ (Delete).

| Ngày thay đổi | Vị trí thay đổi | A*, M, D | Nguồn gốc | Phiên bản cũ | Mô tả thay đổi | Phiên bản mới |
| :--- | :--- | :---: | :--- | :---: | :--- | :---: |
| [DD/MM/YYYY] | Toàn bộ tài liệu | A* | Khởi tạo ban đầu | N/A | Khởi tạo tài liệu Thiết kế Tổng thể theo chuẩn BM.02 | V1.0 |

---

## PHẦN I: GIỚI THIỆU

### 1.1. Mục đích
Tài liệu này cung cấp một bức tranh toàn cảnh về kiến trúc hệ thống thông qua các mô hình kiến trúc đa tầng nhằm miêu tả hệ thống dưới nhiều góc nhìn khác nhau (Nghiệp vụ, Phân lớp Ứng dụng, Tích hợp, Định cỡ Hạ tầng và An toàn Thông tin). Tài liệu là căn cứ để thống nhất phạm vi phát triển, nghiệm thu kỹ thuật và làm đầu vào trực tiếp cho Tài liệu Thiết kế Chi tiết (TKCT / LLD) và Thiết kế Cơ sở Dữ liệu.

### 1.2. Phạm vi
Tài liệu áp dụng cho toàn bộ các phân hệ phần mềm của dự án [Tên Dự án], bao gồm ứng dụng di động đa nền tảng (Cross-platform App), Cổng thông tin & Hệ thống Quản trị Web CMS, Cổng API Gateway, các dịch vụ xử lý nghiệp vụ Backend, hàng đợi sự kiện bất đồng bộ và cơ sở dữ liệu.

### 1.3. Khái niệm, Thuật ngữ và Từ viết tắt

| Thuật ngữ / Viết tắt | Diễn giải ý nghĩa |
| :--- | :--- |
| **HLD** | Tài liệu Thiết kế Tổng thể (High-Level Design). |
| **ATTT** | An toàn Thông tin theo quy định của Tập đoàn Viettel. |
| **DDD** | Thiết kế Hướng miền nghiệp vụ (Domain-Driven Design). |
| **VSA** | Hệ thống Quản lý Phân quyền và Xác thực tập trung của Viettel (Viettel System Authentication). |
| **BCCS** | Hệ thống Tính cước và Chăm sóc Khách hàng Viễn thông của Viettel (Business & Customer Care System). |
| **TPS** | Số lượng giao dịch xử lý trên một giây (Transactions Per Second). |
| **HA / LB** | Tính sẵn sàng cao (High Availability) / Cân bằng tải (Load Balancing). |

### 1.4. Tài liệu Tham khảo
1. Tài liệu Đặc tả Yêu cầu Người dùng (URD / SRS) phiên bản V1.0.
2. Quy định An toàn Thông tin trong phát triển phần mềm Tập đoàn Viettel.
3. Quy trình phát triển phần mềm CNTT Viettel `BM.02.QT.00.CNTT.28`.

### 1.5. Mô tả Bố cục Tài liệu
* **Phần I - Giới thiệu:** Trình bày mục đích, phạm vi và bố cục chung của tài liệu.
* **Phần II – Các yêu cầu ảnh hưởng đến kiến trúc:** Mô tả các yêu cầu phi chức năng, thông số định cỡ tải và ràng buộc kỹ thuật.
* **Phần III – Kiến trúc ứng dụng:** Mô tả mô hình phân lớp, phân rã chức năng, giao tiếp tích hợp và bảng cấu hình phần cứng máy chủ.
* **Phần IV – Các giải pháp kiến trúc khác:** Mô tả kiến trúc an toàn thông tin ATTT, chính sách sao lưu phục hồi dữ liệu và giải pháp chịu tải cao.

---

## PHẦN II: CÁC YÊU CẦU ẢNH HƯỞNG ĐẾN KIẾN TRÚC

### 2.1. Yêu cầu Phi chức năng & Năng lực Xử lý
Hệ thống phải đáp ứng các chỉ số kỹ thuật định lượng nghiêm ngặt:
* **Khối lượng người dùng:** Phục vụ tối thiểu 2.000.000 người dùng hoạt động (Active users) hàng tháng.
* **Dung lượng giao dịch:** Năng lực tiếp nhận và xử lý tối thiểu 1.000.000 giao dịch/ngày.
* **Tải đồng thời:** Chịu tải đồng thời tối thiểu 10.000 kết nối đồng thời (Concurrent users) trong khung giờ cao điểm.
* **Thông lượng xử lý:** Đạt thông lượng trung bình 20 TPS và đỉnh tải 50 TPS.
* **Thời gian phản hồi:** Thời gian phản hồi API tại ngưỡng P95 < 200ms đối với các giao dịch thông thường và < 500ms đối với giao dịch tài chính liên kết cổng thanh toán ngoài.
* **Tính sẵn sàng:** Đảm bảo độ sẵn sàng dịch vụ tối thiểu `99.9%` (thời gian ngừng hoạt động không vượt quá 8.76 giờ/năm).

### 2.2. Các Ràng buộc về Công nghệ và Môi trường
* Triển khai tối thiểu 2 nodes cho mọi dịch vụ cốt lõi, bảo đảm tính sẵn sàng cao (HA), phân tải (Load Balancing) và tự động chuyển đổi khi có lỗi (Failover).
* Tuân thủ quy hoạch phân vùng an ninh mạng của Viettel: Phân tách rạch ròi giữa Dải Ngoài (Vùng DMZ tiếp nhận Internet) và Dải Trong (Internal Zone chứa Backend và Database).
* Mã hóa dữ liệu nhạy cảm bằng thuật toán bất đối xứng RSA cặp khóa 2048-bit trên toàn bộ luồng truyền thông mạng.

---

## PHẦN III: KIẾN TRÚC ỨNG DỤNG

### 3.1. Mô hình Phân lớp Kiến trúc Hệ thống (Microservices 6 Tầng)

```mermaid
flowchart LR
    subgraph S_INGRESS_GATEWAY ["TẦNG 1, 2 & 3: TRUY CẬP, BIÊN VÀ CỔNG API"]
        direction TB
        subgraph G_CLIENTS ["1. TẦNG CLIENT ĐA KÊNH"]
            direction LR
            C_WEB["Trình duyệt Web<br/>• Web CMS Quản trị<br/>• Web Portal Dịch vụ"]
            C_MOB["Ứng dụng Di động<br/>• App Khách hàng (End-User)<br/>• App Đại lý (Agent/Merchant)"]
            C_PC["Kênh Giao tiếp Khác<br/>• Điểm chấp nhận TT (POS)<br/>• Cổng USSD Gateway"]
        end

        subgraph G_EDGE ["2. TẦNG BIÊN & CÂN BẰNG TẢI"]
            direction TB
            CDN_NODE["Mạng CDN & Nội dung tĩnh<br/>• Tải HTML/CSS/JS, Ảnh<br/>• Giảm tải 80% băng thông"]
            LB_NODE["Cân bằng tải (Load Balancer)<br/>• Phân phối lưu lượng L4/L7<br/>• Tường lửa WAF chống DDoS"]
        end

        subgraph G_GW_SEC ["3. CỔNG API & ĐỊNH DANH"]
            direction TB
            GW_NODE["Cổng API (API Gateway)<br/>• Định tuyến động, Rate Limit<br/>• Kiểm tra Token & SSL Offload"]
            IDP_NODE["Xác thực Tập trung (VSA/IDP)<br/>• Viettel VSA / Keycloak<br/>• Cấp phát & Kiểm tra Token JWT"]
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
                D1_SC["Dịch vụ Smart OTP"]
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

### 3.2. Mô hình Phân rã Chức năng / Phân hệ (Decomposition)

```mermaid
%%{init: {'flowchart': {'nodeSpacing': 8, 'rankSpacing': 140, 'padding': 3, 'curve': 'basis'}}}%%
flowchart LR
    %% GỐC HỆ THỐNG (CẤP 0)
    ROOT["HỆ THỐNG PHẦN MỀM TỔNG THỂ"]:::cLevel0

    %% PHÂN HỆ CỐT LÕI (CẤP 1 - ĐỒNG BỘ TUYỆT ĐỐI ĐỘ DÀI)
    MOD1["1. PHÂN HỆ NGHIỆP VỤ LÕI"]:::cLevel1
    MOD2["2. PHÂN HỆ DÙNG CHUNG"]:::cLevel1
    MOD3["3. PHÂN HỆ BÁO CÁO ĐỐI SOÁT"]:::cLevel1
    MOD4["4. PHÂN HỆ QUẢN TRỊ CMS"]:::cLevel1

    %% CHỨC NĂNG CON PHÂN HỆ 1 (CẤP 2)
    F1_1["1.1. Xử lý Giao dịch Tài chính"]:::cLevel2
    F1_2["1.2. Xác thực Smart OTP & Chữ ký"]:::cLevel2
    F1_3["1.3. Định danh điện tử eKYC"]:::cLevel2
    F1_4["1.4. Quản lý Tài khoản & Hạn mức"]:::cLevel2

    %% CHỨC NĂNG CON PHÂN HỆ 2 (CẤP 2)
    F2_1["2.1. Quản lý Danh mục dùng chung"]:::cLevel2
    F2_2["2.2. Đồng bộ Caching Redis"]:::cLevel2
    F2_3["2.3. Cổng thông báo Notification"]:::cLevel2
    F2_4["2.4. Tích hợp Đối tác Bên ngoài"]:::cLevel2

    %% CHỨC NĂNG CON PHÂN HỆ 3 (CẤP 2)
    F3_1["3.1. Tổng hợp Doanh thu Biến động"]:::cLevel2
    F3_2["3.2. Đối soát Tự động Core Ví"]:::cLevel2
    F3_3["3.3. Xuất Báo cáo Sao kê Định kỳ"]:::cLevel2
    F3_4["3.4. Cảnh báo Lệch số dư Realtime"]:::cLevel2

    %% CHỨC NĂNG CON PHÂN HỆ 4 (CẤP 2)
    F4_1["4.1. Phân quyền Người dùng RBAC"]:::cLevel2
    F4_2["4.2. Cấu hình Tham số Hệ thống"]:::cLevel2
    F4_3["4.3. Nhật ký Kiểm toán Audit Log"]:::cLevel2
    F4_4["4.4. Giám sát Hiệu năng & Cảnh báo"]:::cLevel2

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

* **3.2.1. Phân hệ Quản lý Danh mục và Dịch vụ Dùng chung:**
  * Quản trị các bảng danh mục hành chính, danh mục ngân hàng, danh mục điểm giao dịch.
  * Đồng bộ danh mục sang bộ nhớ đệm phân tán Redis Cluster phục vụ truy vấn tốc độ cao.
* **3.2.2. Phân hệ Xử lý Nghiệp vụ Cốt lõi (Core Business Services):**
  * *Dịch vụ Xử lý Giao dịch:* Chuyển tiền, Nạp tiền, Rút tiền, Thanh toán hóa đơn, Quét mã QR Merchant.
  * *Dịch vụ Smart OTP:* Kích hoạt thiết bị, sinh mã OTP động theo chuẩn TOTP/OCRA và xác thực chữ ký giao dịch.
  * *Dịch vụ eKYC:* Tích hợp Google Cloud Vision / AI OCR nhận diện CCCD/Hộ chiếu và so khớp khuôn mặt.
* **3.2.3. Phân hệ Báo cáo Thống kê & Đối soát:**
  * Tổng hợp doanh thu, biến động số dư, đối soát số liệu tự động cuối ngày với Core Ví và Ngân hàng.
* **3.2.4. Phân hệ Quản trị Hệ thống & Phân quyền (CMS Admin):**
  * Tích hợp hệ thống phân quyền VSA Admin của Viettel, quản lý danh sách người dùng, vai trò (RBAC) và nhật ký thao tác (Audit Log).

### 3.3. Giao tiếp với Các Hệ thống Khác (System Integration)

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

* **3.3.1. Luồng Điều hướng Giao dịch từ BE App (App API Gateway):**
  * BE App tiếp nhận yêu cầu từ Mobile App và đóng vai trò điều phối trung tâm.
  * Gọi sang Smart OTP Core qua RESTful API để kiểm tra tính hợp lệ của chữ ký giao dịch và mã OTP.
  * Sau khi xác thực thành công, BE App gọi sang Wallet Core để hạch toán số dư tài chính hoặc gọi sang BCCS để nạp thẻ/gói cước viễn thông.
  * Khi cần gửi mã xác thực dự phòng, BE App gọi sang SMS Gateway để phát hành tin nhắn SMS Brandname.
* **3.3.2. Luồng Điều hướng Quản trị từ BE CMS:**
  * BE CMS kết nối với VSA Admin qua giao thức CAS/HTTPS để xác thực cán bộ quản trị.
  * BE CMS gửi lệnh tra cứu trạng thái, mở khóa hoặc Reset Smart OTP sang Smart OTP Core.
  * Kết nối trực tiếp với SMS Gateway của nhà mạng viễn thông qua giao thức SMPP / HTTP RESTful để gửi tin nhắn SMS Brandname và mã OTP SMS dự phòng.
* **3.3.3. Giao tiếp với Hệ thống Core eWallet & BCCS:**
  * Kết nối với Core Ví điện tử qua kênh Socket TCP chuyên dụng với định dạng bản tin tài chính chuẩn ISO 8583.
  * Kết nối với hệ thống BCCS Viễn thông qua RESTful API để thực hiện các nghiệp vụ Topup nạp tiền điện thoại, mua gói cước Data và thanh toán cước viễn thông.

### 3.4. Kiến trúc & Quy hoạch Mạng Tổng thể (Overall Network Topology & Architecture)

```mermaid
flowchart TD
    %% 1. VÙNG PUBLIC INTERNET
    subgraph ZONE_PUBLIC ["1. VÙNG PUBLIC INTERNET (KÊNH KHÁCH HÀNG DI ĐỘNG)"]
        direction LR
        PUB_USER["Ứng dụng Di động Khách hàng (Mobile App)<br/>• Truy cập 4G / 5G / Internet công cộng<br/>• Ký số HMAC & Bảo vệ TLS 1.3"]
    end

    %% 2. VÙNG MẠNG RIÊNG DOANH NGHIỆP & ĐỐI TÁC (PRIVATE ZONE)
    subgraph ZONE_PRIVATE_CHANNELS ["2. VÙNG MẠNG RIÊNG DOANH NGHIỆP & ĐỐI TÁC (PRIVATE ZONE)"]
        direction LR
        subgraph PRIV_ADMIN ["Kênh Quản trị Nội bộ (Office LAN / VPN)"]
            direction TB
            ADM_CMS["Cổng Quản trị Web CMS & Portal<br/>• Quản trị viên & Cán bộ Vận hành<br/>• Xác thực tập trung VSA Admin SSO"]
        end
        subgraph PRIV_PARTNERS ["Kênh Tích hợp Đối tác (Private Leased Line / MPLS)"]
            direction TB
            EXT_CORE["Core Banking → Core Ví Điện tử<br/>• Giao thức TCP Socket ISO 8583"]
            EXT_TELCO["Hạ tầng Viễn thông (SMSC & BCCS)<br/>• Giao thức SMPP & RESTful Nội bộ"]
        end
    end

    %% 3. VÙNG DMZ (DẢI NGOÀI)
    subgraph ZONE_DMZ ["3. VÙNG DMZ / DẢI NGOÀI BIÊN (Dải IP Đề xuất: 10.60.10.0/24)"]
        direction TB
        DMZ_FW["Tường lửa Biên (External Firewall & WAF Anti-DDoS)"]
        DMZ_LB["Cân bằng tải Ngoài (NGINX Load Balancer)<br/>VIP: 10.60.10.10"]
        DMZ_GW["Cổng API Gateway Biên Tiếp nhận Mobile App<br/>gw-node-01 (10.60.10.11) | gw-node-02 (10.60.10.12)"]
        DMZ_FW --> DMZ_LB --> DMZ_GW
    end

    %% 4. VÙNG DẢI TRONG (INTERNAL SERVICES)
    subgraph ZONE_INTERNAL ["4. VÙNG DẢI TRONG / ỨNG DỤNG NGHIỆP VỤ (Dải IP Đề xuất: 10.60.20.0/24)"]
        direction TB
        INT_FW["Tường lửa Dải Trong (Internal Firewall Layer)"]
        subgraph CLUSTER_APP ["Cụm Vi dịch vụ Nghiệp vụ Lõi (Kubernetes Cluster)"]
            direction LR
            APP_NODE1["app-srv-01<br/>10.60.20.21"]
            APP_NODE2["app-srv-02<br/>10.60.20.22"]
        end
        INT_MQ["Hàng đợi Kafka & Outbox<br/>kafka-broker-01 (10.60.20.25)"]
        INT_FW --> CLUSTER_APP
        CLUSTER_APP --> INT_MQ
    end

    %% 5. VÙNG CƠ SỞ DỮ LIỆU (DATABASE ZONE)
    subgraph ZONE_DB ["5. VÙNG CƠ SỞ DỮ LIỆU & LƯU TRỮ (Dải IP Đề xuất: 10.60.30.0/24)"]
        direction TB
        subgraph CLUSTER_DB ["Cụm Cơ sở Dữ liệu Quan hệ (Master - Standby HA)"]
            direction LR
            DB_PRI[("db-master-01<br/>10.60.30.31")]
            DB_STB[("db-standby-02<br/>10.60.30.32")]
        end
        CLUSTER_CACHE["Cụm Redis Cluster Bộ đệm & Khóa<br/>redis-01 (10.60.30.35) | redis-02 (10.60.30.36)"]
        DB_PRI ==>|"Streaming Replication WAL"| DB_STB
    end

    %% 6. VÙNG QUẢN TRỊ & VẬN HÀNH (OAM ZONE)
    subgraph ZONE_OAM ["6. VÙNG QUẢN TRỊ & VẬN HÀNH PRIVATE OAM (Dải IP Đề xuất: 10.60.40.0/24)"]
        direction TB
        OAM_CMS["Web CMS Server (10.60.40.45)<br/>Chỉ mở trong mạng LAN / VPN"]
        OAM_BASTION["Bastion Host SSH<br/>10.60.40.41"]
        OAM_MON["Giám sát Prometheus / Grafana<br/>10.60.40.42"]
        OAM_LOG["Thu thập Log ELK Cluster<br/>10.60.40.43"]
    end

    %% CÁC LUỒNG TRUYỀN THÔNG
    PUB_USER -->|"1. HTTPS TLS 1.3 qua Internet (Port 443)"| DMZ_FW
    DMZ_GW -->|"2. Forward Request (Port 8080/8443)"| INT_FW
    PRIV_PARTNERS -->|"3. Private Leased Line / MPLS"| INT_FW
    PRIV_ADMIN -->|"4. Mạng Nội bộ / SSL VPN"| OAM_CMS
    OAM_CMS -->|"5. Quản trị Nghiệp vụ"| INT_FW

    CLUSTER_APP -->|"Port 5432 / 1521"| CLUSTER_DB
    CLUSTER_APP -->|"Port 6379"| CLUSTER_CACHE
    OAM_BASTION -.->|"Quản trị SSH An toàn (Port 22)"| ZONE_DMZ & ZONE_INTERNAL & ZONE_DB
```

* **Chính sách Phân vùng An ninh Mạng:**
  * *Vùng Public Internet:* Phục vụ kênh ứng dụng di động người dùng cuối, toàn bộ lưu lượng được kiểm soát chặt chẽ qua WAF và TLS 1.3.
  * *Vùng Mạng Riêng Doanh nghiệp & Đối tác (Private Zone):* Dành riêng cho kênh quản trị Web CMS nội bộ (truy cập qua LAN/VPN) và các kết nối Core Banking, Core Ví, SMS Gateway, BCCS qua đường truyền riêng biệt chuyên dụng (Leased Line / MPLS).
  * *Vùng DMZ (Dải Ngoài):* Tiếp nhận và phân phối lưu lượng từ Mobile App qua Internet, tuyệt đối không lưu trữ dữ liệu nhạy cảm hay chạy giao diện quản trị.
  * *Vùng Dải Trong (Internal Zone):* Đặt các vi dịch vụ nghiệp vụ cốt lõi, hàng đợi thông điệp Kafka, chỉ giao tiếp qua tường lửa nội bộ.
  * *Vùng CSDL (DB Zone):* Lưu trữ dữ liệu tập trung, thiết lập chính sách kiểm soát truy cập nghiêm ngặt chỉ từ các node ứng dụng backend dải trong.
  * *Vùng Quản trị & Vận hành (Private OAM Zone):* Giám sát hệ thống 24/7 và truy cập quản trị qua kênh VPN/Bastion Host có xác thực đa yếu tố.

### 3.5. Định cỡ Hệ thống & Quy hoạch Giả thiết Thiết lập Địa chỉ IP Đề xuất

#### 3.5.1. Bảng Định cỡ Tải Hệ Thống (Capacity Sizing):

| STT | Nội dung chỉ số | Đơn vị | Số lượng định mức | Ghi chú |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Người dùng hoạt động (Active users) | User | 2.000.000 | Định mức trong tháng |
| 2 | Tổng số giao dịch trong ngày | Transaction/Day | 1.000.000 | Dung lượng xử lý ngày |
| 3 | Người dùng đồng thời (Concurrent users) | Session | 10.000 | Khung giờ cao điểm |
| 4 | Thông lượng giao dịch (TPS) | TPS | 20 - 50 | Tốc độ tức thời |
| 5 | Số lượng node dịch vụ tối thiểu | Node | 2 | Triển khai mô hình HA |
| 6 | Cơ chế đảm bảo tính sẵn sàng | Chuẩn | HA, LB, Cluster, Failover | Chống điểm lỗi đơn lẻ |

#### 3.5.2. Bảng Cấu hình Phần cứng Máy chủ & Giả thiết Thiết lập Địa chỉ IP Đề xuất:

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

---

## PHẦN IV: CÁC GIẢI PHÁP KIẾN TRÚC KHÁC

### 4.1. Kiến trúc Bảo mật Hệ thống - An toàn Thông tin (ATTT Viettel)

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

* **Bảo mật Tầng Ứng dụng Client (Mobile App):**
  * *Mã hóa dữ liệu nhạy cảm:* Áp dụng mã hóa bất đối xứng RSA 2048-bit mã hóa mật khẩu, mã PIN và dữ liệu cá nhân trước khi truyền qua mạng.
  * *Xác thực nguồn gọi:* Định danh nguồn gọi API bằng App Token và Device Token riêng biệt cho từng nền tảng iOS, Android.
  * *Chống dịch ngược mã nguồn:* Sử dụng công cụ Obfuscation khi đóng gói ứng dụng (ProGuard cho Android và mã hóa bitcode cho iOS).
  * *Xác thực đa yếu tố:* 100% các giao dịch tài chính bắt buộc xác thực qua mã OTP / Smart OTP.
* **Bảo mật Tầng Backend Server:**
  * *Phân vùng an ninh Dải Trong - Dải Ngoài:* Dịch vụ dải ngoài tiếp nhận Internet không được truy cập trực tiếp vào CSDL, mọi kết nối vào Dải Trong phải qua Cổng API Gateway có kiểm tra bảo mật.
  * *Mã hóa kênh truyền:* Bắt buộc sử dụng giao thức HTTPS với chứng chỉ SSL/TLS 1.3 hợp lệ.
  * *Kiểm soát xác thực & phân quyền:* Đặt các lớp Filter Spring Security kiểm tra tính hợp lệ của Token JWT, Device ID và IP client trên từng request.
  * *Nhật ký kiểm toán (Audit Logging):* Ghi nhận tập trung toàn bộ log giao dịch và thao tác của người dùng phục vụ điều tra an ninh.

### 4.2. Kiến trúc Sao lưu và Phục hồi Dữ liệu (Backup & Disaster Recovery)

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

* **Chính sách Sao lưu (Backup Policy):**
  * Tự động sao lưu toàn phần (Full Backup) định kỳ hàng tuần vào khung giờ thấp điểm (02:00 Chủ nhật).
  * Sao lưu gia tăng (Incremental Backup) và lưu trữ tệp nhật ký Archive Log hàng ngày.
  * Toàn bộ bản sao lưu được lưu trữ trên vùng nhớ an toàn độc lập tối thiểu 6 tháng.
* **Chỉ số Cam kết Phục hồi:**
  * `RTO ≤ 15 phút` (Thời gian chuyển đổi DNS sang hệ thống dự phòng khi xảy ra sự cố).
  * `RPO = 0` (Bảo đảm không mất mát dữ liệu giao dịch thông qua cơ chế đồng bộ CSDL bán đồng bộ).

### 4.3. Giải pháp Xử lý Tải cao và Kết nối Đồng thời Lớn
* **Kiến trúc Chịu lỗi Toàn diện:** Triển khai cụm phân tán HA, Load Balancing cho toàn bộ các thành phần (Gateway, Backend Services, Database, Cache).
* **Hàng đợi Thông điệp Xử lý Bất đồng bộ (In-Memory / Distributed Queue):** Các yêu cầu gửi SMS, gửi Push Notification và ghi log kiểm toán được đẩy vào hàng đợi Apache Kafka để các bộ xử lý chạy song song đa luồng tiêu thụ, không làm nghẽn luồng xử lý giao dịch chính.
* **Bộ nhớ đệm Phân tán (Distributed Cache):** Dữ liệu cấu hình hệ thống, phiên làm việc và danh mục được lưu trữ trên Redis Cluster để giải tỏa tải đọc cho cơ sở dữ liệu quan hệ.
