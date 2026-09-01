# QUY CHUẨN THIẾT KẾ CHI TIẾT DỮ LIỆU (DATABASE DESIGN / VIETTEL BM.03.QT.00.CNTT.28)

Tài liệu này quy định hệ thống nguyên tắc, cấu trúc 6 phần bắt buộc theo quy trình phát triển phần mềm Tập đoàn Viettel (`BM.03.QT.00.CNTT.28` - Tài liệu Thiết kế Chi tiết Dữ liệu / Database Design Document), tiêu chuẩn bảng mô tả trường dữ liệu 8 cột, thiết kế ràng buộc (Constraint), chỉ mục (Index), Trigger, Thủ tục lưu trữ (Stored Procedure/Function/Package), thiết kế tệp tin giao tiếp, quy tắc sinh mã nghiệp vụ và thiết kế vật lý (Tablespace & Table Partitioning).

---

## 1. NGUYÊN TẮC CỐT LÕI KHI THIẾT KẾ CƠ SỞ DỮ LIỆU

* **Tuân thủ Chuẩn mực Viettel `BM.03.QT.00.CNTT.28`:**
  * Toàn bộ tài liệu Thiết kế Cơ sở Dữ liệu phải có đủ 6 phần:
    * Phần 1: Giới thiệu (Mục tiêu, thuật ngữ viết tắt, tài liệu tham khảo, mô tả chung).
    * Phần 2: Cơ sở dữ liệu (Sơ đồ ERD, Danh mục bảng, Chi tiết từng bảng 8 cột, Constraint, Index, Trigger, Stored Procedure, Package).
    * Phần 3: Thiết kế tệp tin (Danh mục tệp, Cấu trúc tệp CSV, Cấu trúc tệp Độ dài cố định).
    * Phần 4: Thiết kế mã (Danh mục mã, Quy tắc sinh mã và Pattern cấu trúc mã).
    * Phần 5: Thiết kế vật lý (Bảng Tablespace/Datafile dung lượng Max Size, Chiến lược Table Partitioning Range/List/Hash).
    * Phần 6: Phụ lục (Quy chuẩn ký hiệu khuôn dạng dữ liệu).
* **Chuẩn hóa Dữ liệu và Toàn vẹn Dữ liệu (Normalization & Integrity):**
  * Thiết kế đạt chuẩn 3NF (Third Normal Form) cho các bảng giao dịch tài chính để triệt tiêu trùng lặp và dị thường cập nhật.
  * Thiết lập đầy đủ khóa chính (Primary Key - `PK_`), khóa ngoại (Foreign Key - `FK_`) và ràng buộc kiểm tra (Check Constraint - `CHK_`).
* **Chiến lược Đánh Chỉ mục Tối ưu (Indexing Strategy):**
  * 100% các cột khóa ngoại, cột tìm kiếm thường xuyên (`WHERE`), cột sắp xếp (`ORDER BY`) và cột điều kiện phân vùng phải được tạo Index (`IDX_`).
  * Tránh tạo Index dư thừa trên các bảng có tần suất ghi cao (`INSERT`/`UPDATE` liên tục).
* **Chiến lược Phân vùng Bảng Lớn (Table Partitioning Strategy):**
  * Các bảng có dung lượng lớn hơn 10 triệu bản ghi/năm hoặc trên 100.000 giao dịch/ngày (như `TRANSACTION`, `API_LOG`, `MESSAGE_LOG`, `AUDIT_LOG`) bắt buộc phải phân vùng (Partitioning theo Tháng/Quý `RANGE (CREATE_TIME)`).
* **Quy chuẩn Đặt tên Thực thể & Trường (Naming Conventions):**
  * Tên bảng và tên cột viết hoa, phân cách bằng dấu gạch dưới (ví dụ: `APP_USER`, `USER_ID`, `CREATE_TIME`, `STATUS`).
  * Khóa chính quy ước: `PK_<TÊN_BẢNG>`, Khóa ngoại: `FK_<BẢNG_NGUỒN>_<BẢNG_ĐÍCH>`, Index: `IDX_<TÊN_BẢNG>_<TÊN_CỘT>`, Trigger: `TRG_<TÊN_BẢNG>_<SỰ_KIỆN>`.
* **Quy chuẩn Trực quan hóa & Cấm đưa chỉ dẫn định dạng vào nội dung:**
  * Sơ đồ ERD thể hiện các thực thể chính và liên kết cốt lõi, không nhồi nhét toàn bộ thuộc tính chi tiết vào khối Mermaid ERD. Toàn bộ chi tiết trường được trình bày bằng Bảng Markdown chuẩn 8 cột.
  * Tuyệt đối không đưa câu chữ chỉ dẫn định dạng vào nội dung văn bản.

---

## 2. CẤU TRÚC 6 PHẦN CHUẨN VIETTEL BM.03 (`BM.03.QT.00.CNTT.28`)

```text
Tài liệu Thiết kế Chi tiết Dữ liệu (Database_Design_Document.md)
├── Trang Bìa & Quản trị: Mã hiệu dự án, Mã tài liệu (BM.03.QT.00.CNTT.28), Bảng ký duyệt 3 cấp, Bảng thay đổi tài liệu
├── Phần 1: GIỚI THIỆU
│   ├── 1.1. Mục tiêu tài liệu
│   ├── 1.2. Định nghĩa thuật ngữ và các từ viết tắt
│   ├── 1.3. Tài liệu tham khảo
│   └── 1.4. Mô tả chung (Bố cục tài liệu)
├── Phần 2: CƠ SỞ DỮ LIỆU
│   ├── 2.1. Các mô hình quan hệ dữ liệu (Sơ đồ ERD & Bảng danh mục bảng)
│   ├── 2.2. Chi tiết từng bảng (Bảng <TÊN_BẢNG_1>, Bảng <TÊN_BẢNG_2>...)
│   │   ├── Bảng đặc tả cấu trúc trường chuẩn 8 cột
│   │   ├── 2.2.1. Ràng buộc (Constraint - PK, FK, Check, Unique)
│   │   ├── 2.2.2. Chỉ mục (Index - B-Tree, Composite, Unique Index)
│   │   └── 2.2.3. Trigger (Trigger - Before/After Insert/Update)
│   ├── 2.3. Thủ tục lưu trữ & Hàm (Stored Procedures / Functions)
│   └── 2.4. Gói lưu trữ (Package Specification & Package Body)
├── Phần 3: THIẾT KẾ TỆP TIN (FILE INTERFACE DESIGN)
│   ├── 3.1. Danh mục các tệp tin giao tiếp / tệp đối soát / tệp dữ liệu
│   └── 3.2. Cấu trúc chi tiết từng tệp tin (CSV / Fixed-Length File)
├── Phần 4: THIẾT KẾ MÃ (CODE SYSTEM DESIGN)
│   ├── 4.1. Danh mục các bộ mã định danh trong hệ thống
│   └── 4.2. Cấu trúc chi tiết và Quy tắc sinh mã (Pattern)
├── Phần 5: THIẾT KẾ VẬT LÝ (PHYSICAL DATABASE DESIGN)
│   ├── 5.1. Bảng phân bổ không gian lưu trữ (Tablespaces & Datafiles)
│   └── 5.2. Phân vùng dữ liệu lớn & Chính sách lưu trữ (Table Partitioning Strategy)
└── Phần 6: PHỤ LỤC
    └── 6.1. Biểu tượng khuôn dạng dữ liệu chuẩn
```

---

## 3. CÁC BIỂU MẪU BẢNG ĐẶC TẢ CHUẨN VIETTEL BM.03

### 3.1. Bảng Danh mục Bảng Dữ liệu (Mục 2.1)

| STT | Tên bảng | Mô tả chức năng & Nghiệp vụ |
| :---: | :--- | :--- |
| 1 | `APP_USER` | Lưu trữ thông tin tài khoản người dùng ứng dụng di động |
| 2 | `TRANSACTION` | Lưu trữ thông tin chi tiết các giao dịch tài chính của hệ thống |
| 3 | `API_LOG` | Ghi nhận nhật ký request và response của các lời gọi API |

### 3.2. Bảng Đặc tả Cấu trúc Trường Chi tiết 8 Cột (Mục 2.2)

| STT | Tên trường | Kiểu dữ liệu và độ dài | Nullable | Unique | P/F Key | Mặc định | Mô tả & Ràng buộc |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| 01 | `ID` | `NUMBER(19,0)` / `BIGINT` | No | X | P | Auto-increment | Khóa chính duy nhất của bản ghi |
| 02 | `USER_CODE` | `VARCHAR2(50)` | No | X | | | Mã định danh người dùng duy nhất |
| 03 | `FULL_NAME` | `VARCHAR2(255)` | No | | | | Họ và tên đầy đủ của người dùng |
| 04 | `PHONE_NUMBER` | `VARCHAR2(20)` | No | X | | | Số điện thoại đăng ký (định dạng MSISDN) |
| 05 | `STATUS` | `NUMBER(2,0)` | No | | | `1` | Trạng thái tài khoản: 1-Hoạt động, 0-Khóa |
| 06 | `CREATE_TIME` | `TIMESTAMP` / `DATE` | No | | | `CURRENT_TIMESTAMP` | Thời điểm tạo bản ghi |
| 07 | `UPDATE_TIME` | `TIMESTAMP` / `DATE` | Yes | | | | Thời điểm cập nhật bản ghi gần nhất |

*Ghi chú cột:* `Nullable` (Yes/No), `Unique` (X nếu là duy nhất), `P/F Key` (`P`: Primary Key, `F`: Foreign Key, `PF`: Primary & Foreign Key).

### 3.3. Bảng Ràng buộc (Constraint - Mục 2.2.1)

| STT | Tên Constraint | Kiểu ràng buộc | Cột áp dụng | Bảng tham chiếu | Mô tả điều kiện |
| :---: | :--- | :--- | :--- | :--- | :--- |
| 1 | `PK_APP_USER` | Primary Key | `ID` | N/A | Khóa chính xác định bản ghi người dùng |
| 2 | `UQ_APP_USER_PHONE` | Unique Key | `PHONE_NUMBER` | N/A | Đảm bảo không trùng số điện thoại |
| 3 | `CHK_APP_USER_STATUS`| Check Constraint | `STATUS` | N/A | `STATUS IN (0, 1, 2, 3)` |

### 3.4. Bảng Chỉ mục (Index - Mục 2.2.2)

| STT | Tên Index | Kiểu Index | Bảng áp dụng | Danh sách cột lập chỉ mục | Mục đích & Ý nghĩa tối ưu hóa |
| :---: | :--- | :--- | :--- | :--- | :--- |
| 1 | `IDX_APP_USER_PHONE` | B-Tree Index | `APP_USER` | `PHONE_NUMBER` | Tối ưu truy vấn đăng nhập và tìm kiếm theo số điện thoại |
| 2 | `IDX_TRANS_USER_TIME`| Composite Index | `TRANSACTION` | `USER_ID, CREATE_TIME DESC`| Tối ưu truy vấn lịch sử giao dịch của người dùng theo thời gian |

### 3.5. Bảng Trigger (Trigger - Mục 2.2.3)

| STT | Tên Trigger | Sự kiện kích hoạt | Bảng áp dụng | Ý nghĩa & Logic xử lý |
| :---: | :--- | :--- | :--- | :--- |
| 1 | `TRG_APP_USER_AUDIT` | `BEFORE UPDATE` | `APP_USER` | Tự động cập nhật `UPDATE_TIME = SYSTIMESTAMP` trước khi sửa đổi bản ghi |

### 3.6. Bảng Thiết kế Vật lý Tablespace & Partitioning (Phần 5)

#### Bảng Phân bổ Tablespace & Datafiles (Mục 5.1):

| STT | Tablespace | Data file path | Dung lượng ban đầu | Tự mở rộng | Max Size | Mô tả mục đích sử dụng |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| 1 | `DATA_TS` | `/u01/app/oracle/oradata/DB/data01.dbf` | 10 GB | YES | 32 GB | Lưu trữ dữ liệu các bảng nghiệp vụ chính |
| 2 | `INDEX_TS` | `/u01/app/oracle/oradata/DB/index01.dbf` | 5 GB | YES | 32 GB | Lưu trữ toàn bộ chỉ mục (Indexes) của hệ thống |

#### Bảng Phân vùng Dữ liệu Lớn (Mục 5.2):

| STT | Tên bảng | Tablespace | Kiểu phân vùng | Cột điều kiện Partition | Chính sách lưu trữ & Dọn dẹp |
| :---: | :--- | :--- | :--- | :--- | :--- |
| 1 | `TRANSACTION` | `DATA_TS` | `RANGE` theo Tháng | `CREATE_TIME` | Phân vùng theo từng tháng (`PART_TRANS_YYYYMM`), lưu trữ trực tuyến 2 năm, sau đó chuyển sang Archive |
| 2 | `API_LOG` | `DATA_TS` | `RANGE` theo Ngày | `CREATE_TIME` | Phân vùng theo từng ngày, lưu trữ trực tuyến 90 ngày, sau 90 ngày tự động Purge |
