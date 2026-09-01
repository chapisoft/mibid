# SỔ TAY HƯỚNG DẪN CÀI ĐẶT VÀ VẬN HÀNH HỆ THỐNG (RUNBOOK)
## DỰ ÁN NỀN TẢNG QUẢN LÝ GÓI THẦU VÀ HỒ SƠ THẦU XUẤT NHẬP KHẨU: MIBID
### MÃ TÀI LIỆU: MIBID_HDCD_VH_v1.0 (QUY CHUẨN VẬN HÀNH TẬP ĐOÀN VIETTEL)

---

## 1. TỔNG QUAN HỆ THỐNG VÀ DANH MỤC THÔNG SỐ MÁY CHỦ

| STT | Tên thành phần dịch vụ | Địa chỉ IP máy chủ | Cổng mạng (Port) | Ghi chú cấu hình |
| :---: | :--- | :--- | :---: | :--- |
| 1 | Cổng Reverse Proxy & WAF | `10.20.10.11` (VIP) | `80`, `443` | Nginx 1.24 + ModSecurity WAF |
| 2 | Nút Backend Worker 1 | `10.20.10.12` | `8080`, `8081` | Spring Boot 3 Java 17 |
| 3 | Nút Backend Worker 2 | `10.20.10.13` | `8080`, `8081` | Spring Boot 3 Java 17 |
| 4 | Cụm Bộ nhớ đệm Redis | `10.20.10.14` | `6379`, `26379` | Redis Sentinel Master-Slave |
| 5 | Máy chủ CSDL PostgreSQL Chính | `10.20.10.15` | `5432` | PostgreSQL 15+ Master (Read-Write) |
| 6 | Máy chủ CSDL PostgreSQL Phụ | `10.20.10.16` | `5432` | PostgreSQL 15+ Standby (Read-Only) |

---

## 2. QUY TRÌNH KHỞI ĐỘNG, DỪNG VÀ KIỂM TRA DỊCH VỤ

### 2.1. Kiểm tra trạng thái toàn bộ dịch vụ
```bash
# Kiểm tra trạng thái Pods Backend trên Kubernetes
kubectl get pods -n mibid-prod -o wide
# Kiểm tra trạng thái tiến trình Nginx
sudo systemctl status nginx
# Kiểm tra cụm CSDL PostgreSQL
sudo -u postgres patronictl -c /etc/patroni/config.yml topology
```

### 2.2. Quy trình khởi động lại dịch vụ Backend
```bash
# Khởi động lại mượt mà các Pods Backend (Rolling Restart)
kubectl rollout restart deployment/mibid-backend -n mibid-prod
```

---

## 3. QUY TRÌNH SAO LƯU VÀ PHỤC HỒI DỮ LIỆU ĐỊNH KỲ

* **Sao lưu CSDL toàn vẹn hằng ngày:** Thực hiện tự động lúc 02:00 AM mỗi sáng bằng tiến trình `cron`:
  ```bash
  0 2 * * * /deploy/scripts/backup_postgres.sh >> /var/log/mibid/backup.log 2>&1
  ```
* **Sao lưu liên tục WAL (Write-Ahead Logging):** Sử dụng `pgBackRest` đồng bộ liên tục từng đoạn log giao dịch lên cụm kho lưu trữ đám mây S3 bảo đảm RPO < 5 phút.

---

## 4. GIÁM SÁT HỆ THỐNG VÀ CẢNH BÁO THỜI GIAN THỰC

* **Hạ tầng giám sát:** Prometheus thu thập thông số kỹ thuật (Metrics) mỗi 15 giây từ Endpoint `/actuator/prometheus`.
* **Bảng điều khiển trực quan:** Grafana hiển thị thời gian phản hồi (Latency P95/P99), số yêu cầu mỗi giây (RPS), lượng kết nối CSDL (HikariCP Active Connections), tỷ lệ sử dụng RAM và CPU.
* **Kênh nhận cảnh báo:** Tích hợp AlertManager tự động gửi cảnh báo khẩn cấp tới nhóm trực vận hành qua Telegram Bot và Email trực ban.

---

## 5. BẢNG MÃ LỖI HỆ THỐNG TIÊU CHUẨN 9 CỘT CHUẨN VIETTEL

| STT | Mã lỗi | Tên lỗi | Phân hệ | Mức cảnh báo | Nguyên nhân gốc rễ | Hướng xử lý L1 | Hướng xử lý L2 / L3 | Thời gian MTTR |
| :---: | :--- | :--- | :---: | :---: | :--- | :--- | :--- | :---: |
| 1 | `ERR_DB_HIKARI_TIMEOUT` | Cạn kiệt Connection Pool | Core | **CRITICAL** | Quá tải kết nối CSDL do có truy vấn chậm khóa dòng. | Tải lại trang, báo L2 kiểm tra số kết nối active. | Kiểm tra slow query bằng `pg_stat_activity`, tăng pool size nếu cần. | < 15 phút |
| 2 | `ERR_GATEKEEPER_BLOCKED` | Vi phạm chốt chặn chuyển bước | Phân hệ 2 | **MINOR** | Người dùng kéo thẻ nhưng dự án chưa đủ chứng từ duyệt. | Hướng dẫn người dùng kiểm tra danh mục tài liệu còn thiếu. | Kiểm tra lại cấu hình quy tắc bước trong bảng `stage_doc_rules`. | < 5 phút |
| 3 | `ERR_MAGICLINK_EXPIRED` | Liên kết Magic Link hết hạn | Phân hệ 3 | **MINOR** | Nhà cung cấp mở link sau khi đã quá hạn chót nộp giá. | Hướng dẫn đối tác liên hệ cán bộ mua hàng cấp link mới. | Cán bộ mua hàng bấm "Gửi lại link" trên giao diện quản trị RFQ. | < 5 phút |
| 4 | `ERR_S3_STORAGE_UNAVAILABLE`| Lỗi kết nối kho tệp S3 | Phân hệ 1 | **MAJOR** | Mất kết nối từ Backend tới cụm lưu trữ S3/MinIO. | Báo cáo L2 kiểm tra kết nối mạng hạ tầng. | Kiểm tra AccessKey S3, khởi động lại dịch vụ MinIO Gateway. | < 30 phút |
| 5 | `ERR_REDIS_LOCK_TIMEOUT` | Tranh chấp khóa phân tán | Phân hệ 2 | **MAJOR** | Hai người dùng cùng thao tác đồng thời trên cùng 1 dự án. | Yêu cầu người dùng chờ 3 giây rồi tải lại trang. | Kiểm tra Redis Cluster, kiểm tra key timeout trong Redisson. | < 10 phút |

---

## 6. KỊCH BẢN ỨNG PHÓ SỰ CỐ KHẨN CẤP (INCIDENT PLAYBOOKS)

### 6.1. Sự cố 1: Cạn kiệt Connection Pool cơ sở dữ liệu (`ERR_DB_HIKARI_TIMEOUT`)
1. **Dấu hiệu:** Endpoint `/actuator/health` báo trạng thái `DOWN`, log xuất hiện `ConnectionTimeoutException`.
2. **Hành động khẩn cấp:**
   * Truy cập CSDL kiểm tra các truy vấn đang chạy trên 10 giây:
     ```sql
     SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state 
     FROM pg_stat_activity 
     WHERE state != 'idle' AND (now() - pg_stat_activity.query_start) > interval '10 seconds';
     ```
   * Hủy các truy vấn treo gây nghẽn: `SELECT pg_terminate_backend(<pid>);`.

### 6.2. Sự cố 2: Phân vùng ổ cứng máy chủ đạt ngưỡng 95%
1. **Dấu hiệu:** AlertManager phát cảnh báo mức `CRITICAL: Disk Space Usage > 95%`.
2. **Hành động khẩn cấp:**
   * Quét tìm tệp dung lượng lớn: `sudo find /var/log -type f -size +1G`.
   * Thực hiện nén và thu dọn các tệp nhật ký cũ quá 30 ngày: `sudo journalctl --vacuum-time=7d`.

---

## 7. THÔNG TIN LIÊN HỆ ĐỘI NGŨ HỖ TRỢ VẬN HÀNH

* **Trực ban Vận hành Cấp 1 (L1 Helpdesk 24/7):**
  * Thư điện tử: `noc@mibid.vn`
  * Đường dây nóng: `1900 8824`
* **Đội ngũ Quản trị Hạ tầng Cấp 2 (L2 DevOps / SysAdmin):**
  * Đầu mối kỹ thuật: Kỹ sư Quản trị Cụm Máy chủ
  * Số điện thoại khẩn cấp: `0988 123 456`
* **Đội ngũ Chuyên gia Phát triển Cấp 3 (L3 Core Dev):**
  * Đầu mối giải pháp: Kiến trúc sư Hệ thống & Trưởng nhóm Phát triển
  * Kênh trao đổi nội bộ: Nhóm Telegram `#mibid-prod-incidents`
