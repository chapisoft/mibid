# MIBID FRONTEND APPLICATIONS

Thư mục chứa 2 ứng dụng Frontend độc lập xây dựng trên nền tảng Next.js 14 App Router, React 18 & TypeScript:

## 1. `cms/` — Web CMS Quản Trị (@mibid/cms)
- **Mục đích:** Bàn làm việc số, quản lý gói thầu, bảng Kanban kéo thả 6 bước, ma trận so sánh giá Landed Cost, phân bổ công việc, theo dõi vận đơn và kho hồ sơ DMS.
- **Port:** 3000
- **Khởi chạy:** `cd cms && npm run dev`
- **Build production:** `cd cms && npm run build`

## 2. `vendor/` — Cổng Báo Giá Nhà Cung Cấp (@mibid/vendor)
- **Mục đích:** Cổng nộp báo giá di động không cần tài khoản thông qua liên kết bảo mật Magic Link JWT và mã PIN 4 số.
- **Port:** 3001
- **Khởi chạy:** `cd vendor && npm run dev`
- **Build production:** `cd vendor && npm run build`

- **Kill Port:** `lsof -ti:3000 | xargs kill -9`