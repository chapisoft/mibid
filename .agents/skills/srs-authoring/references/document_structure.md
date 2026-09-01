# HƯỚNG DẪN CẤU TRÚC KHUNG TÀI LIỆU SRS / THIẾT KẾ CHI TIẾT

Tài liệu này hướng dẫn chi tiết quy cách xây dựng toàn bộ khung sườn của một Tài liệu Đặc tả Yêu cầu Phần mềm (SRS) hoặc Tài liệu Thiết kế Chi tiết (TKCT).

---

## 1. CẤU TRÚC PHẦN MỞ ĐẦU (DOCUMENT METADATA & CONTROL)

### 1.1. Trang bìa tiêu chuẩn
* **Đơn vị chủ quản cấp 1:** Tên Tập đoàn / Bộ ngành / Cơ quan chủ quản (In hoa, đậm).
* **Đơn vị thực hiện / Phát triển cấp 2:** Tên Tổng công ty / Đơn vị thực hiện (In hoa, đậm).
* **Tên hệ thống phần mềm:** (Cỡ chữ lớn, in hoa, nổi bật).
* **Tên tài liệu:** `TÀI LIỆU THIẾT KẾ CHI TIẾT` hoặc `TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)`.
* **Phân hệ nghiệp vụ:** Tên phân hệ thực hiện.
* **Mã hiệu dự án:** Mã quản lý dự án nội bộ.
* **Mã hiệu tài liệu:** Mã số theo quy chuẩn quản lý tài liệu kỹ thuật.
* **Địa điểm và Năm phát hành:** Ví dụ: *Hà Nội, 2026*.

### 1.2. Bảng ghi nhận thay đổi tài liệu (Change Log)
Bắt buộc có bảng theo dõi 7 cột tiêu chuẩn:

| Ngày thay đổi | Vị trí thay đổi | A*, M, D | Nguồn gốc | Phiên bản cũ | Mô tả thay đổi | Phiên bản mới |
| :--- | :--- | :---: | :--- | :---: | :--- | :---: |
| 20/03/2026 | Toàn bộ tài liệu | A* | Đề xuất ban đầu | N/A | Tạo mới tài liệu thiết kế chi tiết | V1.0 |
| 24/03/2026 | Mục 2.3, 2.5 | M | Yêu cầu nghiệp vụ | V1.0 | Bổ sung luồng duyệt phân cấp trung gian | V1.1 |

*Quy ước:*
* `A*` (Add): Tạo mới.
* `M` (Modify): Sửa đổi.
* `D` (Delete): Xóa bỏ.

### 1.3. Trang ký duyệt (Sign-off Matrix)
Bảng xác nhận trách nhiệm và thẩm quyền phê duyệt:

| Vai trò | Họ và tên | Chức danh / Đơn vị | Chữ ký / Xác nhận | Ngày ký |
| :--- | :--- | :--- | :--- | :--- |
| **Người lập** | Nguyễn Văn A | Kỹ sư Phân tích nghiệp vụ (BA) | | 20/03/2026 |
| **Người xem xét** | Trần Văn B | Kiến trúc sư Giải pháp (SA) | | 22/03/2026 |
| **Người phê duyệt** | Lê Văn C | Giám đốc Dự án (PM) | | 24/03/2026 |

### 1.4. Danh mục từ viết tắt và thuật ngữ
Bảng giải nghĩa các thuật ngữ kỹ thuật và nghiệp vụ xuất hiện trong tài liệu:

| Thuật ngữ viết tắt | Diễn giải tiếng Việt | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- |
| **SRS** | Đặc tả yêu cầu phần mềm | Software Requirements Specification |
| **TKCT** | Thiết kế chi tiết | Detailed Design Document |
| **CSDL** | Cơ sở dữ liệu | Database |
| **CCCD / CMND** | Căn cước công dân / Chứng minh nhân dân | Số định danh cá nhân công dân |
| **RBAC** | Kiểm soát truy cập dựa trên vai trò | Role-Based Access Control |
| **API** | Giao diện lập trình ứng dụng | Application Programming Interface |

### 1.5. Liên kết thiết kế Figma
* **Liên kết tổng thể:** URL dẫn tới tệp thiết kế giao diện trên Figma.
* **Liên kết khung màn hình (Frame Links):** Danh sách URL chi tiết đến từng màn hình và luồng thao tác.

---

## 2. CẤU TRÚC PHẦN THÂN (CHI TIẾT CÁC PHÂN HỆ VÀ CHỨC NĂNG)

Phần thân được tổ chức theo cấp đề mục chuẩn:
* **Heading 1:** `THIẾT KẾ CHI TIẾT` (hoặc `TỔNG QUAN HỆ THỐNG`).
* **Heading 2:** `TÊN PHÂN HỆ / MODULE` (Ví dụ: `QUẢN LÝ THÔNG TIN LIỆT SĨ`).
* **Heading 3:** `TÊN CHỨC NĂNG NGHIỆP VỤ` (Ví dụ: `Thêm mới thông tin Liệt sĩ`).
* **Heading 4 (4 Thành phần bắt buộc trong mỗi chức năng):**
  1. `Thông tin chung chức năng`
  2. `Màn hình`
  3. `Mô tả chi tiết các thành phần`
  4. `Luồng nghiệp vụ`

---

## 3. DANH MỤC 22 CHỨC NĂNG MẪU CHUẨN CỦA MỘT PHÂN HỆ QUẢN LÝ

Một phân hệ quản lý dữ liệu tiêu chuẩn thường bao gồm 22 chức năng được phân nhóm khoa học theo chu trình sống:

### Nhóm 1: Xem và Tra cứu danh sách
1. Xem danh sách mặc định (Default Tab).
2. Tìm kiếm nhanh trên danh sách mặc định.
3. Tìm kiếm nâng cao trên danh sách mặc định.
4. Xem danh sách theo Tab chuyên biệt 1 (Ví dụ: Đối tượng tại chức).
5. Tìm kiếm nhanh trên Tab chuyên biệt 1.
6. Tìm kiếm nâng cao trên Tab chuyên biệt 1.
7. Xem danh sách theo Tab chuyên biệt 2 (Ví dụ: Đối tượng tồn đọng).
8. Tìm kiếm nhanh trên Tab chuyên biệt 2.
9. Tìm kiếm nâng cao trên Tab chuyên biệt 2.
10. Xem chi tiết thông tin đối tượng.

### Nhóm 2: Nhập liệu và Chỉnh sửa hồ sơ
11. Thêm mới thông tin đối tượng.
12. Chỉnh sửa thông tin đối tượng (quản lý phiên bản dữ liệu).
13. Xóa thông tin đối tượng (xóa mềm).

### Nhóm 3: Trao đổi dữ liệu hàng loạt (Import / Export)
14. Xuất danh sách đối tượng ra tệp Excel (Export).
15. Nhập danh sách đối tượng từ tệp Excel (Import kèm kiểm tra dữ liệu lỗi).

### Nhóm 4: Quy trình phê duyệt phân cấp (Workflow Approval)
16. Gửi phê duyệt hồ sơ (xử lý đơn lẻ và hàng loạt).
17. Từ chối hồ sơ ở cấp phòng/ban trung gian.
18. Từ chối hồ sơ ở cấp lãnh đạo phê duyệt.
19. Phê duyệt (xác nhận) hồ sơ ở cấp phòng/ban trung gian.
20. Phê duyệt chính thức hồ sơ ở cấp lãnh đạo.
21. Phản hồi / Trao đổi thông tin về hồ sơ.

### Nhóm 5: Quản trị và Kiểm soát dữ liệu
22. Khóa và Mở khóa bản ghi đối tượng.

---

## 4. CẤU TRÚC PHẦN PHỤ LỤC (APPENDIX & REFERENCES)

* **Heading 1: PHỤ LỤC**
* Bảng danh mục tài liệu tham chiếu:

| Tên tài liệu | Mã hiệu / Phiên bản | Ngày phát hành | Nguồn / Đường dẫn | Ghi chú |
| :--- | :---: | :---: | :--- | :--- |
| **Tài liệu Phân tích yêu cầu (PTYC)** | PTYC-HPQD-V1.0 | 15/02/2026 | Kho tài liệu dự án | Tài liệu yêu cầu đầu vào |
| **Tài liệu Thiết kế cơ sở dữ liệu** | DB-HPQD-V1.0 | 01/03/2026 | Kho tài liệu dự án | Chi tiết bảng, trường, index |
| **Ma trận phân quyền chức năng** | RBAC-HPQD-V1.0 | 05/03/2026 | Kho tài liệu dự án | Bảng ma trận vai trò người dùng |
| **Quy định thiết kế dùng chung (Common)** | COMMON-TKCT-V1.0 | 10/03/2026 | Kho tài liệu dự án | Chuẩn log, giao diện, toast |
| **Danh mục dữ liệu dùng chung** | MASTER-DATA-V1.0 | 15/03/2026 | Cổng danh mục dùng chung | Hành chính, cấp bậc, đơn vị |
