# TẬP ĐOÀN CÔNG NGHIỆP - VIỄN THÔNG QUÂN ĐỘI
## [TÊN ĐƠN VỊ THÀNH VIÊN / THỊ TRƯỜNG NƯỚC NGOÀI]

---

# [TÊN DỰ ÁN / HỆ THỐNG PHẦN MỀM]
# TÀI LIỆU HƯỚNG DẪN CÀI ĐẶT VÀ VẬN HÀNH

**Mã hiệu dự án:** [PROJECT_CODE]  
**Mã hiệu tài liệu:** HDCD_VH_[PROJECT_CODE]_v1.0  
**Địa danh & Thời gian:** Hanoi, [MM/YYYY]  

---

## BẢNG KÝ DUYỆT TÀI LIỆU

| Vai trò | Họ và tên | Chức danh / Đơn vị | Chữ ký | Ngày ký |
| :--- | :--- | :--- | :---: | :---: |
| **Người lập (The establishment)** | [Họ tên kỹ sư triển khai] | Kỹ sư DevOps / Phát triển Hệ thống | | [DD/MM/YYYY] |
| **Người xem xét (Reviewer)** | [Họ tên chuyên gia thẩm tra]| Trưởng nhóm Kỹ thuật / Technical Lead | | [DD/MM/YYYY] |
| **Người phê duyệt (Approver)** | [Họ tên lãnh đạo phê duyệt] | Giám đốc Trung tâm / Trưởng ban Vận hành | | [DD/MM/YYYY] |

---

## BẢNG GHI NHẬN THAY ĐỔI TÀI LIỆU

*Ghi chú ký hiệu:* `A*` – Tạo mới (Add), `M` – Sửa đổi (Modify), `D` – Xóa bỏ (Delete).

| Ngày thay đổi | Vị trí thay đổi | A*, M, D | Nguồn gốc | Phiên bản cũ | Mô tả thay đổi | Phiên bản mới |
| :--- | :--- | :---: | :--- | :---: | :--- | :---: |
| [DD/MM/YYYY] | Toàn bộ tài liệu | A* | Khởi tạo ban đầu | N/A | Khởi tạo tài liệu Hướng dẫn Cài đặt và Vận hành | V1.0 |

---

## PHẦN 1: GIỚI THIỆU

### 1.1. Mục đích và Ý nghĩa của Tài liệu
Tài liệu này được biên soạn nhằm cung cấp hướng dẫn chi tiết về các yêu cầu phần cứng, phần mềm và từng bước thao tác cài đặt, triển khai, cấu hình, giám sát và ứng cứu sự cố hệ thống [Tên Dự án]. Đối tượng sử dụng tài liệu bao gồm:
* Đội ngũ Quản trị Hệ thống (SysAdmin/DevOps) trực tiếp triển khai và nâng cấp hệ thống.
* Đội ngũ Giám sát và Vận hành (NOC / IT Operations) thực hiện theo dõi sức khỏe và xử lý sự cố hàng ngày.
* Đội ngũ Kỹ sư Phát triển phục vụ việc bàn giao sản phẩm phần mềm cho đơn vị vận hành.

### 1.2. Phạm vi Tài liệu
Tài liệu áp dụng cho toàn bộ các thành phần của hệ thống [Tên Dự án], bao gồm hạ tầng Cơ sở dữ liệu, Cụm bộ nhớ đệm Redis, Hệ thống cân bằng tải NGINX, các dịch vụ Cổng API Gateway, Dịch vụ Nhắn tin/Tiến trình ngầm và Hệ thống Quản trị Web CMS.

### 1.3. Thuật ngữ và Từ viết tắt

| Thuật ngữ / Viết tắt | Định nghĩa / Diễn giải | Ghi chú |
| :--- | :--- | :--- |
| **HDCD_VH** | Hướng dẫn Cài đặt và Vận hành hệ thống. | Chuẩn tài liệu Viettel |
| **CSDL** | Cơ sở Dữ liệu (Database Management System). | Oracle / PostgreSQL |
| **APIGW** | Cổng Giao diện Lập trình Ứng dụng (API Gateway). | Backend Gateway |
| **SMSGW** | Cổng gửi nhận tin nhắn viễn thông (SMS Gateway). | Tích hợp SMS Brandname |
| **VIP** | Địa chỉ IP ảo dùng cho cân bằng tải dự phòng (Virtual IP). | Keepalived HA |
| **MTTR** | Thời gian trung bình để khắc phục sự cố (Mean Time To Recovery). | SLA cam kết |

### 1.4. Cấu trúc Tài liệu
* **Phần 1 - Giới thiệu:** Mục đích, phạm vi và thuật ngữ viết tắt.
* **Phần 2 – Giới thiệu chung về hệ thống:** Danh sách IP máy chủ, Port dịch vụ và yêu cầu tài nguyên phần cứng.
* **Phần 3 – Hướng dẫn các thao tác vận hành:** Chi tiết từng bước cài đặt CSDL, Redis, NGINX, Runtime và Deploy các dịch vụ.
* **Phần 4 – Hướng dẫn giám sát hệ thống:** Công cụ giám sát APM, Log và Bảng mã lỗi hệ thống chuẩn 9 cột.
* **Phần 5 – Các sự cố liên quan đến vận hành & Cách khắc phục:** Ma trận kịch bản xử lý sự cố khẩn cấp 3 tầng.
* **Phần 6 – Quy trình sao lưu, phục hồi & Nâng cấp:** Kịch bản backup, kịch bản khôi phục DR và quy trình Rolling Update/Rollback.
* **Phần 7 – Hướng dẫn khai thác hệ thống:** Mô hình khai thác và ma trận tài liệu hướng dẫn sử dụng.

---

## PHẦN 2: GIỚI THIỆU CHUNG VỀ HỆ THỐNG

### 2.1. Kiến trúc Hệ thống & Danh Sách Máy Chủ Triển Khai

| STT | Thành phần dịch vụ | Địa chỉ IP máy chủ | Port dịch vụ | Database Name / Username | Mục đích & Vai trò triển khai |
| :---: | :--- | :--- | :---: | :--- | :--- |
| 1 | **Database Server (Primary)** | `10.228.102.157` | `1521` | `ORCL_PROD` / `mascom` | Cơ sở dữ liệu chính (Active Node) |
| 2 | **Database Server (Standby)** | `10.228.102.159` | `1521` | `ORCL_PROD` / `mascom` | Cơ sở dữ liệu dự phòng nóng (Standby Node) |
| 3 | **Cân bằng tải NGINX (Node 1)**| `10.228.102.175` | `80, 443` | N/A | Cân bằng tải ngoài (VIP: `10.228.102.170`) |
| 4 | **Cân bằng tải NGINX (Node 2)**| `10.228.102.176` | `80, 443` | N/A | Dự phòng cân bằng tải Keepalived |
| 5 | **End-User APIGW (Node 1)** | `10.228.102.177` | `8080, 8081` | N/A | Dịch vụ API dành cho khách hàng End-User |
| 6 | **Agent APIGW & CMS (Node 2)**| `10.228.102.178` | `8082, 8083` | N/A | Dịch vụ API Đại lý và Web CMS Admin |
| 7 | **Redis Cache Cluster** | `10.228.102.180` | `6179, 7179` | Auth Password: `***` | Bộ nhớ đệm phân tán & Sentinel HA |
| 8 | **Hàng đợi Apache Kafka** | `10.228.102.185` | `9092` | Cluster: `kafka-prod` | Hàng đợi sự kiện bất đồng bộ |

### 2.2. Yêu Cầu Tài Nguyên Phần Cứng & Môi Trường
* **Hệ điều hành:** CentOS Linux release 7.9 (Core) 64-bit hoặc Red Hat Enterprise Linux (RHEL) 8.x.
* **Cấu hình tối thiểu mỗi máy chủ ứng dụng:** CPU 4 Cores 2.6 GHz, RAM 16 GB, SSD 200 GB.
* **Cấu hình máy chủ Cơ sở dữ liệu:** CPU 8 Cores 2.6 GHz, RAM 32 GB, SSD NVMe 500 GB.
* **Quy chuẩn thư mục triển khai:** Toàn bộ mã nguồn, cấu hình và log được lưu trữ tại phân vùng `/u01/ewallet_mobile/`.

---

## PHẦN 3: HƯỚNG DẪN CÁC THAO TÁC CÀI ĐẶT VÀ VẬN HÀNH (RUNBOOK)

### 3.1. Cài Đặt và Thiết Lập Cơ Sở Dữ Liệu
1. Đăng nhập vào máy chủ Database bằng tài khoản `oracle`:
   ```bash
   sqlplus sys/password@ORCL_PROD as sysdba
   ```
2. Thực thi script khởi tạo Tablespace, User và Bảng dữ liệu theo thứ tự:
   ```bash
   @/u01/setup/db_scripts/01_create_tablespace.sql
   @/u01/setup/db_scripts/02_create_user_schema.sql
   @/u01/setup/db_scripts/03_create_tables.sql
   @/u01/setup/db_scripts/04_create_indexes_constraints.sql
   @/u01/setup/db_scripts/05_create_procedures_packages.sql
   ```
3. Kiểm tra số lượng bảng đã khởi tạo thành công:
   ```sql
   SELECT count(*) FROM user_tables;
   -- Kết quả mong muốn: Trả về đúng số lượng bảng theo DBDD
   ```

### 3.2. Cài Đặt và Cấu Hình Redis Cache & Sentinel
1. Cài đặt các gói phụ thuộc:
   ```bash
   yum install -y gcc make tcl
   ```
2. Giải nén và biên dịch Redis:
   ```bash
   cd /u01/ewallet_mobile/setup
   tar -xvzf redis-6.2.6.tar.gz
   cd redis-6.2.6
   make PREFIX=/u01/ewallet_mobile/build/redis install
   ```
3. Tạo cấu hình Redis Instance và Sentinel:
   ```bash
   mkdir -p /u01/ewallet_mobile/build/redis/node-6179/conf
   cp redis.conf /u01/ewallet_mobile/build/redis/node-6179/conf/redis.conf
   cp sentinel.conf /u01/ewallet_mobile/build/redis/node-6179/conf/sentinel.conf
   ```
4. Khởi động dịch vụ Redis và kiểm tra:
   ```bash
   /u01/ewallet_mobile/build/redis/bin/redis-server /u01/ewallet_mobile/build/redis/node-6179/conf/redis.conf
   redis-cli -p 6179 -a 'SecretPass@2026' ping
   -- Kết quả mong muốn: PONG
   ```

### 3.3. Cài Đặt và Cấu Hình Cân Bằng Tải NGINX
1. Biên dịch NGINX với module SSL:
   ```bash
   cd /u01/ewallet_mobile/setup/nginx-1.20.2
   ./configure --prefix=/u01/ewallet_mobile/build/nginx \
               --with-http_ssl_module \
               --with-http_v2_module \
               --with-http_realip_module \
               --with-http_stub_status_module
   make && make install
   ```
2. Cấu hình Virtual Host và kiểm tra cú pháp:
   ```bash
   /u01/ewallet_mobile/build/nginx/sbin/nginx -t
   -- Kết quả mong muốn: nginx: configuration file syntax is ok
   ```
3. Khởi động NGINX:
   ```bash
   /u01/ewallet_mobile/build/nginx/sbin/nginx
   ```

### 3.4. Cài Đặt Môi Trường Runtime (OpenJDK & Oracle Client)
1. Cài đặt Java OpenJDK 21:
   ```bash
   yum install -y java-21-openjdk java-21-openjdk-devel
   java -version
   ```
2. Cài đặt Oracle Instant Client:
   ```bash
   rpm -ivh oracle-instantclient19.10-basic-19.10.0.0.0-1.x86_64.rpm
   rpm -ivh oracle-instantclient19.10-devel-19.10.0.0.0-1.x86_64.rpm
   echo /usr/lib/oracle/19.10/client64/lib > /etc/ld.so.conf.d/oracle-instantclient.conf
   ldconfig
   ```

### 3.5. Hướng Dẫn Build và Deploy Vi Dịch Vụ Backend (APIGW)
1. Đóng gói mã nguồn từ máy chủ Build / CI:
   ```bash
   mvn clean package -DskipTests
   -- Sinh ra file target/natcash-enduser-apigw-1.0.jar
   ```
2. Triển khai file JAR lên máy chủ vận hành:
   ```bash
   cp target/natcash-enduser-apigw-1.0.jar /u01/ewallet_mobile/natcash-enduser-apigw/lib/
   ```
3. Cập nhật thông số cấu hình tại `/u01/ewallet_mobile/natcash-enduser-apigw/etc/config.yml`:
   * Thiết lập chuỗi kết nối Database URL, Username, Password.
   * Thiết lập Redis Host, Port, Auth Password.
   * Thiết lập Port lắng nghe HTTP API (`8080`).
4. Khởi động và kiểm tra trạng thái dịch vụ:
   ```bash
   systemctl restart natcash-enduser-apigw
   systemctl status natcash-enduser-apigw
   curl -I http://localhost:8080/health
   -- Kết quả mong muốn: HTTP/1.1 200 OK
   ```

---

## PHẦN 4: HƯỚNG DẪN GIÁM SÁT HỆ THỐNG & XỬ LÝ CẢNH BÁO

### 4.1. Hướng Dẫn Giám Sát Hệ Thống
* **Giám sát Tài nguyên Phần cứng:** Sử dụng Node Exporter và Grafana Dashboard theo dõi CPU Usage (ngưỡng cảnh báo > 80%), Memory Usage (> 85%), Disk Usage (> 80%).
* **Giám sát Hiệu năng Dịch vụ (APM):** Giám sát Thông lượng giao dịch (TPS), Thời gian phản hồi P95/P99 và Tỷ lệ lỗi HTTP 5xx (ngưỡng cảnh báo > 1%).
* **Giám sát Log Tập trung:** Tra cứu log lỗi tại giao diện OpenSearch Dashboard qua câu truy vấn `level: ERROR AND module: apigw`.

### 4.2. Bảng Mã Lỗi Hệ Thống Chuẩn Viettel

| STT | Loại lỗi | Tên module | Mã lỗi | Ý nghĩa mã lỗi | Mức độ | Nguyên nhân chính | Cách khắc phục | SLA MTTR |
| :---: | :--- | :--- | :---: | :--- | :---: | :--- | :--- | :---: |
| 1 | Hệ thống | `APIGW_EU` | `ERR_001` | Mất kết nối CSDL | Critical | Cạn Pool kết nối hoặc CSDL quá tải | Khởi động lại dịch vụ, kiểm tra listener DB | ≤ 5 phút |
| 2 | Nghiệp vụ| `APIGW_AGENT`| `ERR_002` | Timeout kết nối Core Ví | Major | Kênh truyền Socket ISO 8583 bị nghẽn | Tra soát log kết nối Core, liên hệ NOC Core | ≤ 10 phút |
| 3 | Tích hợp | `MESSAGING` | `ERR_003` | Lỗi gửi tin qua SMSGW | Major | SMS Gateway nhà mạng từ chối xác thực | Kiểm tra tài khoản SMS Brandname, tra log | ≤ 15 phút |
| 4 | Caching | `ALL_MODULES`| `ERR_004` | Không kết nối được Redis | Major | Tiến trình Redis Server bị dừng | Kiểm tra Redis Sentinel và restart Redis | ≤ 5 phút |
| 5 | Xác thực | `ALL_MODULES`| `ERR_401` | Token JWT hết hạn | Minor | Phiên đăng nhập của người dùng đã hết hạn | Ứng dụng tự động gọi Refresh Token | Tự động |

---

## PHẦN 5: CÁC SỰ CỐ LIÊN QUAN ĐẾN VẬN HÀNH & CÁCH KHẮC PHỤC

### 5.1. Sự Cố Tầng Ứng Dụng (Application Incidents)

| STT | Tên sự cố | Hiện tượng & Dấu hiệu nhận biết | Các bước thực hiện xử lý dòng lệnh (Runbook Steps) | Cách kiểm tra sau xử lý | Thời gian xử lý |
| :---: | :--- | :--- | :--- | :--- | :---: |
| 1 | **Người dùng không nhận được OTP SMS** | Người dùng bấm gửi OTP nhưng không nhận được tin nhắn | 1. Kiểm tra bảng `MESSAGE_LOG` xem đã lưu bản tin chưa.<br/>2. Tra log module `natcash-messaging`: `tail -n 200 /u01/ewallet_mobile/logs/messaging.log \| grep ERROR`<br/>3. Nếu mất kết nối SMSGW, restart service: `systemctl restart natcash-messaging` | Gửi thử 1 giao dịch yêu cầu OTP, kiểm tra `MESSAGE_LOG` có `STATUS = 1` | ≤ 10 phút |
| 2 | **Lỗi gạch nợ giao dịch BCCS Viễn thông** | Người dùng nạp tiền điện thoại bị trừ tiền nhưng chưa nhận được tiền | 1. Tra soát bảng `TRANSACTION` và `TRANS_PARTNER`.<br/>2. Gọi API đối soát trạng thái sang BCCS.<br/>3. Nếu BCCS chưa nhận, thực thi tool hoàn tiền tự động (Refund Tool). | Kiểm tra số dư tài khoản người dùng và trạng thái giao dịch cập nhật thành công/hoàn tiền | ≤ 15 phút |

### 5.2. Sự Cố Tầng Máy Chủ & Mạng (Server & Network Incidents)

| STT | Tên sự cố | Hiện tượng & Dấu hiệu nhận biết | Các bước thực hiện xử lý dòng lệnh (Runbook Steps) | Cách kiểm tra sau xử lý | Thời gian xử lý |
| :---: | :--- | :--- | :--- | :--- | :---: |
| 1 | **Ứng dụng bị chậm, phản hồi Timeout** | Thao tác quay lâu, giao diện báo Timeout > 30s | 1. Kiểm tra tải CPU/RAM: `top -c`<br/>2. Kiểm tra dung lượng Disk: `df -h`<br/>3. Kiểm tra số lượng kết nối mạng: `netstat -an \| grep 8080 \| wc -l`<br/>4. Restart dịch vụ nếu bị tràn Heap/Thread: `systemctl restart natcash-enduser-apigw` | Gửi request kiểm tra độ trễ: `curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8080/health` (< 100ms) | ≤ 5 phút |
| 2 | **Tiến trình Ứng dụng bị dừng (Process Crash)** | NGINX trả về lỗi `502 Bad Gateway` | 1. Kiểm tra log sự cố: `journalctl -u natcash-enduser-apigw -n 100 --no-pager`<br/>2. Kiểm tra log Out-Of-Memory của OS: `dmesg \| grep -i oom`<br/>3. Tăng tham số `-Xmx` trong cấu hình khởi động và start lại dịch vụ: `systemctl start natcash-enduser-apigw` | Kiểm tra tiến trình hoạt động: `ps -ef \| grep natcash-enduser-apigw` | ≤ 5 phút |

### 5.3. Sự Cố Tầng Cơ Sở Dữ Liệu (Database Incidents)

| STT | Tên sự cố | Hiện tượng & Dấu hiệu nhận biết | Các bước thực hiện xử lý dòng lệnh (Runbook Steps) | Cách kiểm tra sau xử lý | Thời gian xử lý |
| :---: | :--- | :--- | :--- | :--- | :---: |
| 1 | **Khóa chết dữ liệu (Deadlock)** | Giao dịch tài chính bị treo, log báo `ORA-00060: deadlock detected` | 1. Tra soát Session gây khóa qua câu lệnh SQL.<br/>2. Thực hiện kill session bị treo: `ALTER SYSTEM KILL SESSION 'sid,serial#' IMMEDIATE;`<br/>3. Kiểm tra lại Connection Pool trên Backend. | Không còn session ở trạng thái `ENQ: TX - row lock contention` | ≤ 10 phút |
| 2 | **Đầy dung lượng Tablespace** | Log báo lỗi `ORA-01653: unable to extend table` | 1. Kiểm tra dung lượng Tablespace: Chạy script `check_tablespace.sql`<br/>2. Bổ sung thêm Datafile vào Tablespace: `ALTER TABLESPACE APP_DATA_TS ADD DATAFILE '/u01/app/oracle/oradata/PROD/app_data02.dbf' SIZE 10G AUTOEXTEND ON;` | Dung lượng Free của Tablespace > 20% | ≤ 15 phút |

---

## PHẦN 6: QUY TRÌNH SAO LƯU, PHỤC HỒI & NÂNG CẤP HỆ THỐNG

### 6.1. Quy Trình Sao Lưu & Khôi Phục Thảm Họa (Backup & Restore)
* **Kịch bản Sao lưu CSDL Tự động Hàng ngày (Shell Script):**
  ```bash
  #!/bin/bash
  # Đường dẫn: /u01/scripts/backup_db.sh
  BACKUP_DIR="/u01/backups/db"
  DATE=$(date +%Y%m%d_%H%M%S)
  expdp mascom/SecretPass@ORCL_PROD schemas=mascom directory=DATA_PUMP_DIR dumpfile=backup_mascom_${DATE}.dmp logfile=backup_mascom_${DATE}.log
  # Nén và xóa bản sao lưu cũ hơn 30 ngày
  gzip ${BACKUP_DIR}/backup_mascom_${DATE}.dmp
  find ${BACKUP_DIR} -name "*.dmp.gz" -mtime +30 -exec rm -f {} \;
  ```
* **Kịch bản Khôi phục Thảm họa (Disaster Recovery):**
  1. Dừng toàn bộ các dịch vụ Backend APIGW để tránh phát sinh dữ liệu mới.
  2. Thực hiện import bản sao lưu gần nhất bằng `impdp`.
  3. Kiểm tra tính toàn vẹn dữ liệu và khởi động lại dịch vụ theo thứ tự: Database → Redis → APIGW → NGINX.

### 6.2. Quy Trình Nâng Cấp Phiên Bản Không Gián Đoạn (Zero-Downtime Rollout & Rollback)
1. **Quy trình Rolling Update từng node:**
   * Bước 1: Tách Node 1 khỏi NGINX Upstream (`disable` trong `upstream_backend.conf` và reload NGINX).
   * Bước 2: Dừng dịch vụ trên Node 1, deploy bản JAR mới, chạy script cập nhật CSDL (nếu có).
   * Bước 3: Khởi động lại Node 1, thực hiện Healthcheck kiểm tra chất lượng.
   * Bước 4: Mở lại Node 1 trên NGINX Upstream và lặp lại quy trình với Node 2.
2. **Kịch bản Rollback Khẩn cấp:**
   * Trong trường hợp phiên bản mới phát sinh lỗi nghiêm trọng, thực hiện trỏ lại đường dẫn file JAR về phiên bản cũ (backup tại `/u01/ewallet_mobile/backup_versions/`), restart dịch vụ và reload NGINX trong vòng dưới 3 phút.

---

## PHẦN 7: HƯỚNG DẪN KHAI THÁC HỆ THỐNG

### 7.1. Mô Hình Hệ Thống Khai Thác Thực Tế
Toàn bộ các phân hệ phần mềm được khai thác tập trung thông qua cổng NGINX Reverse Proxy và hệ thống mạng nội bộ phân quyền của Viettel.

### 7.2. Bảng Phân Quyền và Danh Mục Tài Liệu Hướng Dẫn Sử Dụng

| STT | Phân hệ / Module | Chức năng nghiệp vụ chính | Đối tượng sử dụng | Tài liệu HDSD tương ứng |
| :---: | :--- | :--- | :--- | :--- |
| 1 | **End-User APIGW** | Cung cấp toàn bộ API nghiệp vụ Ví cho người dùng cuối | Khách hàng cá nhân | Tài liệu Hướng dẫn sử dụng App End-User |
| 2 | **Agent APIGW** | Cung cấp API nghiệp vụ cho điểm đại lý / Merchant | Đại lý / Điểm chấp nhận TT | Tài liệu Hướng dẫn sử dụng App Agent |
| 3 | **Web CMS Admin** | Quản trị cấu hình, duyệt KYC, quản lý tin tức khuyến mãi | Nhân viên vận hành / CSKH | Tài liệu Hướng dẫn sử dụng Web CMS |
| 4 | **Messaging Service** | Xử lý tiến trình gửi tin SMS Brandname và Push Notification| Hệ thống tự động | Sổ tay Vận hành Tiến trình ngầm |
