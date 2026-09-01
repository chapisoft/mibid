# QUY CHUẨN SOẠN THẢO TÀI LIỆU HƯỚNG DẪN CÀI ĐẶT VÀ VẬN HÀNH (OPERATIONS RUNBOOK / VIETTEL HDCD_VH)

Tài liệu này quy định hệ thống nguyên tắc, cấu trúc 7 phần chuẩn mực theo quy trình phát triển và bàn giao phần mềm Tập đoàn Viettel (`HDCD_VH_<TÊN_DỰ_ÁN>_v1.0` - Tài liệu Hướng dẫn Cài đặt, Vận hành và Khai thác Hệ thống / Operations & Installation Runbook Guide), các bảng ma trận danh sách máy chủ, quy trình cài đặt triển khai chi tiết theo lệnh Shell, bảng mã lỗi hệ thống và kịch bản xử lý sự cố khẩn cấp (Incident Troubleshooting Playbook).

---

## 1. NGUYÊN TẮC CỐT LÕI KHI SOẠN THẢO TÀI LIỆU VẬN HÀNH

* **Tính Khả Thi & Thực Chứng 100% (Reproducible & Verifiable):**
  * Mọi hướng dẫn cài đặt, cấu hình, build và deploy bắt buộc phải có câu lệnh dòng lệnh (Shell command) chính xác, đường dẫn thư mục tuyệt đối (`/u01/...`), tên tệp cấu hình thực tế và mẫu kết quả đầu ra thành công để quản trị viên (SysAdmin/DevOps/NOC) có thể sao chép và thực thi trực tiếp mà không cần suy đoán.
* **Cấu trúc 7 Phần Chuẩn mực Viettel `HDCD_VH`:**
  * Phần 1: Giới thiệu (Mục đích, phạm vi bàn giao, thuật ngữ viết tắt, cấu trúc tài liệu).
  * Phần 2: Giới thiệu chung về hệ thống (Danh sách IP máy chủ, Port, DB, Redis, Log, Big Data, yêu cầu tài nguyên).
  * Phần 3: Hướng dẫn các thao tác vận hành (Runbook cài đặt DB, Redis, NGINX, Runtime, Deploy từng service).
  * Phần 4: Hướng dẫn giám sát hệ thống & Bảng mã lỗi (Prometheus/Grafana/Log và Bảng mã lỗi 9 cột chuẩn).
  * Phần 5: Các sự cố vận hành thường gặp & Cách khắc phục (Phân tầng Ứng dụng, Máy chủ, Cơ sở dữ liệu).
  * Phần 6: Quy trình sao lưu, phục hồi & Nâng cấp (Backup script, Disaster Recovery, Zero-Downtime Rolling Update & Rollback).
  * Phần 7: Hướng dẫn khai thác hệ thống (Mô hình khai thác, ma trận phân quyền và link tài liệu HDSD).
* **Bảng Mã Lỗi & Sự Cố Định Lượng Chuẩn SLA:**
  * Bảng mã lỗi phải có đầy đủ: Mã lỗi, Ý nghĩa, Mức độ ảnh hưởng (Critical/Major/Minor), Nguyên nhân gốc rễ, Cách khắc phục và Thời gian xử lý cam kết (SLA MTTR).
  * Kịch bản xử lý sự cố phải trình bày theo 4 cột: Hiện tượng & Dấu hiệu nhận biết, Các bước thực hiện xử lý (Command line), Cách kiểm tra sau xử lý, Thời gian xử lý.
* **Quy chuẩn Ngôn ngữ & Định dạng:**
  * Sử dụng tiếng Việt kỹ thuật chuyên nghiệp, không chèn tiếng Anh đệm/dịch nghĩa thừa. Giữ lại các lệnh shell, biến môi trường và thuật ngữ quốc tế (`systemctl`, `yum`, `redis-cli`, `tar`, `grep`, `ps -ef`, `kill -9`, `curl`).
  * Không chèn icon/emoji vào tiêu đề đề mục và bảng biểu.
  * Sử dụng ký tự Unicode thuần túy thay cho công thức LaTeX chứa dấu `$`.

---

## 2. CẤU TRÚC 7 PHẦN CHUẨN VIETTEL HDCD_VH

```text
Tài liệu Hướng dẫn Cài đặt & Vận hành (Operations_Runbook_Document.md)
├── Trang Bìa & Quản trị: Mã hiệu dự án, Mã tài liệu (HDCD_VH_v1.0), Bảng ký duyệt 3 cấp, Bảng thay đổi tài liệu
├── Phần 1: GIỚI THIỆU
│   ├── 1.1. Mục đích và ý nghĩa của tài liệu
│   ├── 1.2. Phạm vi tài liệu
│   ├── 1.3. Các thuật ngữ và từ viết tắt
│   └── 1.4. Cấu trúc tài liệu
├── Phần 2: GIỚI THIỆU CHUNG VỀ HỆ THỐNG
│   ├── 2.1. Kiến trúc hệ thống và Danh sách Máy chủ triển khai (IP, Port, DB, Redis, Log)
│   └── 2.2. Yêu cầu về tài nguyên phần cứng và môi trường hệ điều hành
├── Phần 3: HƯỚNG DẪN CÁC THAO TÁC VẬN HÀNH (INSTALLATION & DEPLOYMENT RUNBOOK)
│   ├── 3.1. Cài đặt và thiết lập Cơ sở dữ liệu (Script khởi tạo Schema, Bảng, Index)
│   ├── 3.2. Cài đặt và cấu hình Hệ thống Bộ nhớ đệm (Redis Cluster & Sentinel)
│   ├── 3.3. Cài đặt và cấu hình Cân bằng tải & Web Server (NGINX Load Balancer)
│   ├── 3.4. Cài đặt Runtime & Client liên kết (Java OpenJDK, PHP-FPM, Oracle Client, OCI8)
│   ├── 3.5. Hướng dẫn Build và Deploy Vi dịch vụ Backend (End-User APIGW, Agent APIGW)
│   ├── 3.6. Hướng dẫn Build và Deploy Phân hệ Xử lý Sự kiện & Nhắn tin (Messaging Service)
│   └── 3.7. Hướng dẫn Triển khai Hệ thống Quản trị Web CMS / Frontend
├── Phần 4: HƯỚNG DẪN GIÁM SÁT HỆ THỐNG & XỬ LÝ CẢNH BÁO
│   ├── 4.1. Hướng dẫn giám sát hệ thống (APM Metrics, Server Resources, Centralized Log)
│   └── 4.2. Bảng mã lỗi hệ thống và Hướng dẫn xử lý cảnh báo (Chuẩn 9 cột)
├── Phần 5: CÁC SỰ CỐ LIÊN QUAN ĐẾN VẬN HÀNH & CÁCH KHẮC PHỤC (TROUBLESHOOTING PLAYBOOK)
│   ├── 5.1. Sự cố Tầng Ứng dụng (Application Incidents: Lỗi SMS, Lỗi Core, Lỗi Đối tác)
│   ├── 5.2. Sự cố Tầng Máy chủ & Mạng (Server & Network Incidents: Treo tải, Chậm, OOM)
│   └── 5.3. Sự cố Tầng Cơ sở Dữ liệu (Database Incidents: Deadlock, Cạn Pool, Treo Lock)
├── Phần 6: QUY TRÌNH SAO LƯU, PHỤC HỒI & NÂNG CẤP HỆ THỐNG
│   ├── 6.1. Quy trình sao lưu định kỳ & Kịch bản khôi phục thảm họa (Backup & Restore)
│   └── 6.2. Quy trình nâng cấp phiên bản không gián đoạn & Kịch bản Rollback (Rolling Update)
└── Phần 7: HƯỚNG DẪN KHAI THÁC HỆ THỐNG
    ├── 7.1. Mô hình hệ thống khai thác
    └── 7.2. Bảng phân quyền và Danh mục tài liệu Hướng dẫn sử dụng các phân hệ
```

---

## 3. CÁC BIỂU MẪU ĐẶC TẢ VẬN HÀNH CHUẨN VIETTEL

### 3.1. Bảng Danh sách Máy chủ và Thành phần Triển khai (Mục 2.1)

| STT | Thành phần hệ thống | Địa chỉ IP máy chủ | Port dịch vụ | Database Name / Username | Mục đích & Vai trò triển khai |
| :---: | :--- | :--- | :---: | :--- | :--- |
| 1 | **Database Server (Primary)** | `10.228.102.157` | `1521` | `ORCL_PROD` / `mascom` | Cơ sở dữ liệu chính (Active node) |
| 2 | **Database Server (Standby)** | `10.228.102.159` | `1521` | `ORCL_PROD` / `mascom` | Cơ sở dữ liệu dự phòng nóng (Standby) |
| 3 | **Cân bằng tải NGINX (Node 1)**| `10.228.102.175` | `80, 443` | N/A | Tiếp nhận và phân tải L4/L7 dải ngoài |
| 4 | **Cân bằng tải NGINX (Node 2)**| `10.228.102.176` | `80, 443` | N/A | Dự phòng cân bằng tải Keepalived VIP |
| 5 | **End-User APIGW (Node 1)** | `10.228.102.177` | `8080, 8081` | N/A | Xử lý API cho khách hàng End-User |
| 6 | **Agent APIGW & CMS (Node 2)**| `10.228.102.178` | `8082, 8083` | N/A | Xử lý API Đại lý và Web CMS Admin |
| 7 | **Redis Cache Cluster** | `10.228.102.180` | `6179, 7179` | Auth Password: `***` | Bộ nhớ đệm phân tán & Sentinel HA |
| 8 | **Hàng đợi Apache Kafka** | `10.228.102.185` | `9092` | Cluster: `kafka-prod` | Xương sống sự kiện bất đồng bộ |

### 3.2. Bảng Mã Lỗi Hệ Thống Chuẩn Viettel (Mục 4.2)

| STT | Loại lỗi | Tên module | Mã lỗi | Ý nghĩa mã lỗi | Mức độ | Nguyên nhân chính | Cách khắc phục | SLA MTTR |
| :---: | :--- | :--- | :---: | :--- | :---: | :--- | :--- | :---: |
| 1 | Hệ thống | `APIGW_EU` | `ERR_001` | Mất kết nối Cơ sở dữ liệu | Critical | Cạn Pool kết nối hoặc CSDL quá tải | Khởi động lại dịch vụ, kiểm tra listener DB | ≤ 5 phút |
| 2 | Nghiệp vụ| `APIGW_AGENT`| `ERR_002` | Timeout kết nối Core Ví | Major | Kênh truyền Socket ISO 8583 bị nghẽn | Tra soát log kết nối Core, liên hệ NOC Core | ≤ 10 phút |
| 3 | Tích hợp | `MESSAGING` | `ERR_003` | Lỗi gửi tin qua SMSGW | Major | SMS Gateway nhà mạng từ chối xác thực | Kiểm tra tài khoản SMS Brandname, tra log | ≤ 15 phút |
| 4 | Xác thực | `ALL_MODULES`| `ERR_401` | Token JWT hết hạn/không hợp lệ | Minor | Phiên đăng nhập của người dùng đã hết hạn | Yêu cầu ứng dụng thực hiện Refresh Token | Tự động |

### 3.3. Bảng Ma Trận Xử Lý Sự Cố Khẩn Cấp (Phần 5)

| STT | Tên sự cố | Hiện tượng & Dấu hiệu nhận biết | Các bước thực hiện xử lý dòng lệnh (Runbook Steps) | Cách kiểm tra sau xử lý | Thời gian xử lý |
| :---: | :--- | :--- | :--- | :--- | :---: |
| 1 | **Ứng dụng bị chậm, treo đơ** | Giao dịch quay lâu, phản hồi Timeout > 30s | 1. Kiểm tra tải CPU/RAM: `top -c`<br/>2. Kiểm tra tiến trình: `ps -ef \| grep apigw`<br/>3. Tra cứu log độ trễ: `tail -n 200 /u01/ewallet_mobile/logs/app.log`<br/>4. Restart dịch vụ nếu bị nghẽn luồng: `systemctl restart apigw` | Gửi request test qua `curl -I http://localhost:8080/health`, latency < 100ms | ≤ 5 phút |
| 2 | **Người dùng không nhận được OTP SMS** | Người dùng bấm gửi OTP nhưng không nhận được tin nhắn | 1. Kiểm tra bảng `MESSAGE_LOG` xem đã ghi nhận bản tin chưa.<br/>2. Tra log module `natcash-messaging` xem mã lỗi SMSGW.<br/>3. Khởi động lại kênh SMPP / kiểm tra kết nối mạng sang SMSGW. | Kiểm tra bản ghi `MESSAGE_LOG` có `STATUS = 1` (Sent thành công) | ≤ 10 phút |
| 3 | **Khóa chết Cơ sở dữ liệu (Deadlock)** | Ứng dụng báo lỗi Database Lock Timeout | 1. Chạy câu lệnh truy vấn tìm Session đang giữ Lock.<br/>2. Kill session gây treo: `ALTER SYSTEM KILL SESSION 'sid,serial#' IMMEDIATE;`<br/>3. Kiểm tra lại Connection Pool trên APIGW. | Kiểm tra ứng dụng thực hiện giao dịch mới thành công, không còn lock chờ | ≤ 15 phút |
