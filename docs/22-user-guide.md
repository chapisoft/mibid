# TÀI LIỆU HƯỚNG DẪN SỬ DỤNG HỆ THỐNG (USER GUIDE)
## DỰ ÁN NỀN TẢNG QUẢN LÝ GÓI THẦU VÀ HỒ SƠ THẦU XUẤT NHẬP KHẨU: MIBID
### MÃ TÀI LIỆU: MIBID_HDSD_v1.0 (QUY CHUẨN TÀI LIỆU NGƯỜI DÙNG TẬP ĐOÀN VIETTEL)

---

## 1. GIỚI THIỆU CHUNG VÀ YÊU CẦU CẤU HÌNH THIẾT BỊ ĐẦU CUỐI

### 1.1. Mục Tiêu Tài Liệu
Tài liệu này cung cấp hướng dẫn thao tác chi tiết từng bước cho người sử dụng nền tảng Mibid, bao gồm cán bộ quản lý doanh nghiệp, chuyên viên mua hàng, nhân viên đấu thầu, chuyên viên logistics và các nhà cung cấp quốc tế tham gia báo giá qua cổng không chạm.

### 1.2. Yêu Cầu Thiết Bị Và Môi Trường Trình Duyệt
* **Thiết bị máy tính văn phòng:** Máy tính để bàn hoặc máy tính xách tay có kết nối mạng Internet ổn định, độ phân giải màn hình khuyến nghị từ $1366 \times 768$ trở lên.
* **Thiết bị di động:** Điện thoại thông minh (iOS / Android) phục vụ truy cập Cổng báo giá Magic Link qua mạng 4G/5G hoặc Wi-Fi.
* **Trình duyệt khuyến nghị:** Google Chrome (phiên bản 100+), Mozilla Firefox (phiên bản 100+), Microsoft Edge hoặc Apple Safari.

---

## 2. MA TRẬN PHÂN QUYỀN VÀ TRÁCH NHIỆM THEO VAI TRÒ

| Vai trò người dùng | Trách nhiệm chính | Phạm vi chức năng truy cập |
| :--- | :--- | :--- |
| **Giám đốc Doanh nghiệp** *(Manager)* | Điều hành gói thầu, phê duyệt giá vốn nhà cung cấp, xem báo cáo BI | Toàn quyền xem và phê duyệt trên tất cả các dự án của doanh nghiệp |
| **Trưởng nhóm Mua hàng** *(Sourcing Lead)* | Lập RFQ, quản lý danh sách Vendor, theo dõi tiến độ nộp giá qua Magic Link | Quản trị phân hệ Mua hàng, Báo giá và Ma trận so sánh |
| **Chuyên viên Đấu thầu** *(Sales Exec)* | Thu thập hồ sơ năng lực, chuẩn bị báo lãnh, đóng gói hồ sơ dự thầu | Quản trị thẻ dự án, công việc vi mô và xuất hồ sơ thầu ZIP |
| **Chuyên viên Vận hành** *(Logistics Exec)* | Theo dõi vận đơn Bill of Lading, cập nhật các mốc giao nhận ETA/ETD | Quản trị phân hệ Vận tải và bảng kê chi phí logistics |
| **Nhà cung cấp Quốc tế** *(Vendor)* | Xem danh mục hàng hóa, nhập đơn giá và tải file catalog báo giá | Truy cập Cổng báo giá Magic Link không cần tài khoản |

---

## 3. HƯỚNG DẪN THAO TÁC CHI TIẾT TỪNG PHÂN HỆ

### 3.1. Phân Hệ 2: Quản Lý Bảng Kanban Và Kéo Thẻ Chuyển Bước Dự Án

![Bảng điều khiển và Kanban Dự án Mibid](file:///Users/micro/Source/erp/mibid/docs/assets/dashboard_ui_1781665934940.png)

| Bước | Thao tác chi tiết của người dùng | Kết quả hiển thị trên màn hình |
| :---: | :--- | :--- |
| 1 | Tại màn hình chính, nhấp chọn mục `Bảng Kanban Dự án` trên thanh điều hướng. | Màn hình hiển thị các cột trạng thái quy trình: Chuẩn bị, Hỏi giá vốn, Nộp thầu, Trúng/Trượt thầu, Giao hàng. |
| 2 | Nhấn giữ chuột trái vào thẻ dự án cần chuyển bước (ví dụ: thẻ `DA-2026-XNK01`). | Thẻ dự án nổi lên, các cột đích hợp lệ sáng màu xanh nhạt. |
| 3 | Kéo và thả thẻ dự án sang cột trạng thái kế tiếp (ví dụ: cột `Hỏi giá vốn`). | Hệ thống kích hoạt kiểm tra chốt chặn Gatekeeper tự động trong 300ms. |
| 4a | **Trường hợp hồ sơ đầy đủ:** Thẻ dự án được thả thành công. | Thẻ cố định ở cột mới, thanh tiến độ tài liệu cập nhật màu xanh, hiển thị thông báo "Chuyển bước thành công". |
| 4b | **Trường hợp thiếu chứng từ bắt buộc (Hard Stop):** Thẻ dự án bị từ chối. | Thẻ rung lắc và tự động giật lùi về cột cũ, màn hình bật thông báo màu đỏ: *"Thiếu chứng từ bắt buộc CO/CQ"*. |

---

### 3.2. Phân Hệ 3: Cổng Nhà Cung Cấp Nộp Báo Giá Không Chạm (Magic Link)

![Cổng nộp báo giá Magic Link dành cho đối tác](file:///Users/micro/Source/erp/mibid/docs/assets/magic_link_form_1781665957533.png)

| Bước | Thao tác chi tiết của người dùng (Nhà cung cấp) | Kết quả hiển thị trên màn hình |
| :---: | :--- | :--- |
| 1 | Mở hòm thư điện tử, tìm thư mời có tiêu đề *"Mibid - Mời tham gia báo giá gói vật tư XNK"*. | Hiển thị nội dung thư kèm nút bấm `[Tham Gia Báo Giá]` và mã PIN xác thực 4 số. |
| 2 | Nhấp vào đường dẫn liên kết trong thư mời. | Trình duyệt web (trên máy tính hoặc điện thoại) mở ra màn hình nhập mã xác thực. |
| 3 | Nhập mã PIN 4 chữ số được cấp trong thư và bấm nút `[Xác Thực]`. | Hệ thống mở khóa biểu mẫu báo giá chi tiết, hiển thị danh mục các mặt hàng cần hỏi giá. |
| 4 | Nhập đơn giá cho từng dòng sản phẩm, chọn đồng tiền (USD), nhập cước biển và chọn ngày giao hàng dự kiến. | Hệ thống tự động tính toán tổng thành tiền theo thời gian thực (Subtotal & Grand Total). |
| 5 | Kéo thả tệp báo giá chính thức hoặc catalog kỹ thuật định dạng PDF vào ô đính kèm. | Tệp được tải lên an toàn, hiển thị tên tệp và kích thước dung lượng. |
| 6 | Bấm nút `[Nộp Báo Giá]` ở cuối màn hình. | Màn hình hiển thị thông điệp cảm ơn màu xanh: *"Báo giá của bạn đã được ghi nhận thành công!"*. |

---

### 3.3. Phân Hệ 3: Sử Dụng Ma Trận So Sánh Báo Giá Và Phê Duyệt Giá Vốn

| Bước | Thao tác chi tiết của người dùng (Cán bộ Quản lý) | Kết quả hiển thị trên màn hình |
| :---: | :--- | :--- |
| 1 | Mở chi tiết gói thầu, nhấp vào thẻ `Tab Ma Trận So Sánh Báo Giá`. | Hiển thị bảng lưới ma trận so sánh các nhà cung cấp nộp giá cạnh tranh song song. |
| 2 | Kiểm tra tỷ giá quy đổi cơ sở (ví dụ: 1 USD = 25.400 VND). | Toàn bộ đơn giá ngoại tệ tự động quy đổi về đồng tiền cơ sở VND. Dòng có đơn giá rẻ nhất được tô màu xanh lá mạ nổi bật. |
| 3 | Xem xét các yếu tố kỹ thuật, thời gian giao hàng và nhấp nút `[Phê duyệt Chọn Nhà Cung Cấp Này]`. | Hiển thị hộp thoại xác nhận phê duyệt kèm cảnh báo đóng gói hỏi giá. |
| 4 | Bấm `[Xác nhận Phê duyệt]`. | Cột nhà cung cấp được chọn chuyển sang màu xanh duyệt (APPROVED), hệ thống tự động đánh dấu các bên khác là REJECTED. |

---

## 4. XỬ LÝ CÁC TÌNH HUỐNG THƯỜNG GẶP (FAQ)

### Câu hỏi 1: Tại sao thẻ dự án của tôi không thể kéo sang cột bước tiếp theo?
* **Giải thích:** Dự án đang bị chặn bởi chốt chặn kỹ thuật Gatekeeper do thiếu các chứng từ bắt buộc (ví dụ: chưa có Chứng chỉ chất lượng CO/CQ hoặc chưa có Giấy phép bán hàng của nhà sản xuất).
* **Cách khắc phục:** Vào mục `Hồ sơ Chứng từ`, tải lên đầy đủ các chứng từ yêu cầu và liên hệ người phụ trách phê duyệt trước khi kéo lại thẻ.

### Câu hỏi 2: Nhà cung cấp báo rằng đường dẫn Magic Link không mở được hoặc báo lỗi hết hạn?
* **Giải thích:** Mỗi liên kết Magic Link chỉ có thời hạn hiệu lực nhất định (mặc định 72 giờ hoặc theo hạn chót nộp giá của RFQ). Nếu quá thời hạn hoặc đã từng nộp giá, liên kết sẽ tự động bị khóa để bảo đảm an toàn.
* **Cách khắc phục:** Cán bộ mua hàng vào màn hình chi tiết RFQ, tìm tên nhà cung cấp tương ứng và nhấp nút `[Gửi lại Liên kết Mới]`.

---

## 5. ĐẦU MỐI HỖ TRỢ NGƯỜI DÙNG

Trong quá trình sử dụng hệ thống Mibid, nếu phát sinh sự cố kỹ thuật hoặc cần hỗ trợ nghiệp vụ, người dùng vui lòng liên hệ:
* **Tổng đài Hỗ trợ Nghiệp vụ:** `1900 8824` (Nhánh 1)
* **Hộp thư Điện tử Hỗ trợ:** `support@mibid.vn`
* **Hệ thống gửi phiếu yêu cầu hỗ trợ trực tuyến:** Truy cập `https://support.mibid.vn`
