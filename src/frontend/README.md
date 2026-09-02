# MIBID FRONTEND WEB APPLICATION

Hệ thống Frontend MIBID hợp nhất toàn diện phân hệ Quản Trị Mua Sắm (Staff CMS) và Cổng Nhà Cung Cấp (Vendor Portal) thành **một ứng dụng Next.js 14 WebApp duy nhất** (`@mibid/webapp`):

## Cấu Trúc & Phân Hệ Trong `webapp/`

- **Trang chủ (`/`)**: Khối điều hướng **Dual Portal Selector** cho phép người dùng chọn truy cập theo đúng vai trò:
  1. **Không Gian Làm Việc Nội Bộ (Staff CMS)**: Dành cho Cán bộ Mua sắm, Kỹ thuật, Tài chính và Ban Điều hành (`/login`, `/dashboard`, `/kanban`, `/projects`, `/sourcing`, `/matrix`, `/logistics`, `/dms`,...).
  2. **Cổng Thông Tin Nhà Cung Cấp (Vendor Portal)**: Dành cho Nhà sản xuất & Nhà phân phối nộp báo giá trực tiếp theo liên kết bảo mật Magic Link Token (`/vendor`, `/vendor/register`, `/vendor/rfq/[token]`).

## Dữ Liệu Kiểm Thử Nhanh (Demo / UAT Credentials)

### 1. Trải Nghiệm Cổng Nhà Cung Cấp (Vendor Portal)
- **Đường dẫn Cổng:** `http://localhost:3000/vendor`
- **Nhà cung cấp:** `Siemens AG (Đức / EU)`
- **Mã Mời Thầu (Invitation Code):** `RFQ-2026-MBA-SIEMENS`
- **Mã PIN Bảo Mật (6 số):** `882109`
- **Đường dẫn Magic Link trực tiếp:** 
  `http://localhost:3000/vendor/rfq/RFQ-2026-MBA-SIEMENS`
- **Kịch bản kiểm thử bảo mật:**
  - Nhập đúng PIN `882109`: Mở khóa biểu mẫu Báo giá, điền đơn giá, chọn Incoterms, đính kèm CO/CQ và nộp hồ sơ.
  - Nhập sai PIN 1 – 2 lần: Hệ thống báo lỗi và đếm lùi số lần thử còn lại.
  - Nhập sai PIN lần 3: Tự động kích hoạt lớp xác thực bảo vệ CAPTCHA.
  - Nhập sai PIN 5 lần: Tự động khóa truy cập tạm thời 15 – 30 phút.

### 2. Trải Nghiệm Không Gian Nội Bộ (Staff CMS)
- **Đường dẫn đăng nhập:** `http://localhost:3000/login`
- **Tài khoản:** `admin@mibid.vn`
- **Mật khẩu:** `admin123`

## Khởi Chạy & Vận Hành

- **Port mặc định:** 3000
- **Khởi chạy môi trường phát triển:** `cd src/frontend/webapp && npm run dev`
- **Biên dịch sản phẩm:** `cd src/frontend/webapp && npm run build`
- **Chạy bản sản phẩm:** `cd src/frontend/webapp && npm run start`
- **Giải phóng cổng khi cần:** `lsof -ti:3000 | xargs kill -9`