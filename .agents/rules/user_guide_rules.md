# QUY CHUẨN SOẠN THẢO TÀI LIỆU HƯỚNG DẪN SỬ DỤNG (USER GUIDE / VIETTEL HDSD)

Tài liệu này quy định hệ thống nguyên tắc, cấu trúc 5 phần chuẩn mực theo quy trình phát triển và bàn giao phần mềm Tập đoàn Viettel (`HDSD_<TÊN_DỰ_ÁN>_v1.0` - Tài liệu Hướng dẫn Sử dụng / User Guide Document), cấu trúc bảng hướng dẫn thao tác từng bước trực quan, minh họa giao diện và hướng dẫn người dùng cuối (End-User) hoặc quản trị viên (Admin/Operator) khai thác tối đa tính năng của phần mềm.

---

## 1. NGUYÊN TẮC CỐT LÕI KHI SOẠN THẢO TÀI LIỆU HƯỚNG DẪN SỬ DỤNG

* **Ngôn Ngữ Thân Thiện, Tường Minh & Hướng Tới Người Dùng:**
  * Sử dụng tiếng Việt rõ ràng, dễ hiểu, tránh các thuật ngữ kỹ thuật backend/database phức tạp đối với tài liệu người dùng cuối. Hướng dẫn tập trung vào hành động thực tế của người dùng: *"Nhấn vào...", "Nhập thông tin...", "Chọn...", "Xác nhận..."*.
  * Tuyệt đối không chèn tiếng Anh đệm/dịch nghĩa thừa bên cạnh từ tiếng Việt trong nội dung.
* **Cấu trúc 5 Phần Chuẩn mực Viettel `HDSD`:**
  * **Phần 1: Giới thiệu:** Mục đích, phạm vi áp dụng, thuật ngữ từ viết tắt, cấu trúc tài liệu.
  * **Phần 2: Tổng quan sản phẩm:** Giới thiệu tổng quan, đầu mối hỗ trợ (Hotline/Email/CSKH), hướng dẫn tải và cài đặt ứng dụng.
  * **Phần 3: Giới thiệu danh mục chức năng:** Bảng danh mục chức năng phân hệ (`STT | Chức năng | Mô tả | Đối tượng sử dụng`).
  * **Phần 4: Hướng dẫn sử dụng chi tiết từng chức năng:** Từng bước thao tác theo bảng 3 cột (`Bước | Giao diện hiển thị / Mockup | Thao tác thực hiện & Mô tả chi tiết`).
  * **Phần 5: Phụ lục & Câu hỏi thường gặp:** Biểu phí, hạn mức giao dịch và hướng dẫn giải quyết các thắc mắc/lỗi thường gặp.
* **Quy chuẩn Bảng Hướng dẫn Thao tác Từng bước:**
  * Mỗi chức năng nghiệp vụ phải được hướng dẫn theo trình tự thời gian logic:
    * Bước 1: Điều hướng / Truy cập từ Màn hình chính (Home / Dashboard).
    * Bước 2: Nhập liệu các trường thông tin bắt buộc / Chọn từ danh sách.
    * Bước 3: Xác nhận thông tin giao dịch (Màn hình Popup Confirmation).
    * Bước 4: Xác thực bảo mật (Mã PIN / OTP / Sinh trắc học FaceID / Vân tay).
    * Bước 5: Nhận kết quả giao dịch (Màn hình Thành công Receipt / Thất bại).
* **Minh Họa Trực Quan & Rõ Ràng:**
  * Mỗi bước thao tác đều phải có mô tả vị trí nút bấm, trường nhập liệu và hình ảnh giao diện mockup tương ứng để người dùng dễ dàng đối chiếu.

---

## 2. CẤU TRÚC 5 PHẦN CHUẨN VIETTEL HDSD

```text
Tài liệu Hướng dẫn Sử dụng (User_Guide_Document.md)
├── Trang Bìa & Quản trị: Mã hiệu dự án, Mã tài liệu (HDSD_v1.0), Bảng ký duyệt 3 cấp, Bảng thay đổi tài liệu
├── Phần 1: GIỚI THIỆU
│   ├── 1.1. Mục đích và ý nghĩa của tài liệu
│   ├── 1.2. Phạm vi áp dụng
│   ├── 1.3. Các thuật ngữ và từ viết tắt
│   └── 1.4. Cấu trúc tài liệu
├── Phần 2: TỔNG QUAN SẢN PHẨM & CÀI ĐẶT
│   ├── 2.1. Giới thiệu tổng quan sản phẩm / ứng dụng
│   ├── 2.2. Đầu mối hỗ trợ dịch vụ & Chăm sóc khách hàng (Hotline, Email, Tổng đài)
│   └── 2.3. Hướng dẫn tải và cài đặt ứng dụng (iOS App Store, Android Google Play, Web Portal)
├── Phần 3: DANH MỤC CHỨC NĂNG HỆ THỐNG
│   └── Bảng danh mục chức năng phân hệ (STT, Chức năng, Mô tả, Đối tượng sử dụng)
├── Phần 4: HƯỚNG DẪN SỬ DỤNG CHI TIẾT TỪNG CHỨC NĂNG
│   ├── 4.1. Chức năng Đăng nhập & Đăng ký tài khoản (Kèm OTP và Sinh trắc học)
│   ├── 4.2. Cấp quyền ứng dụng (Danh bạ, Vị trí định vị, Camera)
│   ├── 4.3. Các chức năng Giao dịch tài chính (Chuyển tiền, Nạp tiền, Thanh toán hóa đơn, Mua Data)
│   ├── 4.4. Nạp tiền & Rút tiền tại Điểm đại lý (Cash-in / Cash-out)
│   ├── 4.5. Quét mã QR Code thanh toán (My QR, Scan Merchant QR)
│   ├── 4.6. Tra cứu Lịch sử giao dịch & Biến động số dư
│   └── 4.7. Quản lý Tài khoản, Đổi mã PIN & Cài đặt tiện ích
└── Phần 5: PHỤ LỤC & CÂU HỎI THƯỜNG GẶP
    ├── 5.1. Bảng biểu phí và Hạn mức giao dịch
    └── 5.2. Các câu hỏi thường gặp & Hướng dẫn xử lý sự cố người dùng
```

---

## 3. CÁC BIỂU MẪU ĐẶC TẢ HƯỚNG DẪN SỬ DỤNG CHUẨN VIETTEL

### 3.1. Bảng Danh mục Chức năng Hệ thống (Phần 3)

| STT | Tên chức năng | Mô tả tóm tắt nghiệp vụ | Đối tượng sử dụng |
| :---: | :--- | :--- | :--- |
| 1 | **Đăng nhập & Đăng ký** | Đăng nhập bằng số điện thoại/mã PIN, đăng ký tài khoản mới và kích hoạt OTP | Khách hàng cá nhân (End-User) |
| 2 | **Chuyển tiền Ví – Ví** | Chuyển tiền tức thì giữa các tài khoản ví qua số điện thoại hoặc mã QR | Khách hàng cá nhân (End-User) |
| 3 | **Nạp tiền điện thoại** | Nạp tiền trực tiếp vào tài khoản di động trả trước và trả sau | Khách hàng cá nhân (End-User) |
| 4 | **Thanh toán hóa đơn** | Thanh toán cước viễn thông, tiền điện, nước, internet định kỳ | Khách hàng cá nhân (End-User) |
| 5 | **Nạp / Rút tiền Đại lý**| Nạp tiền vào ví hoặc rút tiền mặt tại mạng lưới điểm đại lý ủy quyền | Khách hàng cá nhân (End-User) |
| 6 | **Quét mã QR Code** | Thanh toán nhanh hóa đơn mua sắm tại quầy bằng mã QR | Khách hàng cá nhân (End-User) |
| 7 | **Lịch sử giao dịch** | Tra cứu chi tiết các biến động số dư và sao kê giao dịch theo thời gian | Khách hàng cá nhân (End-User) |
| 8 | **Đổi mã PIN & Cài đặt** | Đổi mã PIN bảo mật, bật/tắt sinh trắc học FaceID và đổi ngôn ngữ | Khách hàng cá nhân (End-User) |

### 3.2. Bảng Hướng dẫn Thao tác Từng bước Chuẩn Viettel (Phần 4)

Mỗi chức năng trong Phần 4 bắt buộc sử dụng bảng mẫu 3 cột:

| Bước | Giao diện hiển thị (Mockup / Screenshot) | Thao tác thực hiện & Mô tả chi tiết |
| :---: | :--- | :--- |
| **1** | `[Hình ảnh: Màn hình Trang chủ - Home]` | Tại màn hình chính, nhấn chọn biểu tượng chức năng **Chuyển tiền** để bắt đầu giao dịch. |
| **2** | `[Hình ảnh: Màn hình Nhập thông tin chuyển tiền]` | **Bước 1:** Nhập số điện thoại người nhận hoặc chọn từ Danh bạ máy.<br/>**Bước 2:** Nhập số tiền cần chuyển (tối thiểu 10.000 VNĐ).<br/>**Bước 3:** Nhập nội dung chuyển tiền (tối đa 100 ký tự).<br/>**Bước 4:** Nhấn nút **Tiếp tục** để chuyển sang bước xác nhận. |
| **3** | `[Hình ảnh: Màn hình Xác nhận thông tin giao dịch]` | Kiểm tra lại toàn bộ thông tin: Người nhận, Số tiền, Phí giao dịch và Tổng tiền thanh toán.<br/>Nhấn nút **Xác nhận** để tiến hành bảo mật. |
| **4** | `[Hình ảnh: Màn hình Nhập mã PIN & OTP]` | Nhập mã PIN gồm 6 chữ số hoặc xác thực bằng FaceID / Vân tay để phê duyệt lệnh chuyển tiền. |
| **5** | `[Hình ảnh: Màn hình Thông báo Giao dịch Thành công]` | Hệ thống hiển thị biên lai giao dịch thành công (Mã giao dịch, Thời gian, Số dư mới).<br/>Người dùng có thể chọn **Lưu ảnh biên lai** hoặc nhấn **Về trang chủ**. |
