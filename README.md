# MIBID — NỀN TẢNG KHÔNG GIAN CỘNG TÁC SỐ QUẢN LÝ GÓI THẦU & HỒ SƠ THẦU XUẤT NHẬP KHẨU

<div align="center">
  <img src="docs/assets/mibid_logo_brand.jpg" alt="MIBID Logo" width="600"/>
  <p><strong>Digital Collaboration Workspace for Import-Export Bidding & Sourcing</strong></p>
</div>

---

## 1. TỔNG QUAN HỆ THỐNG

**Mibid** là nền tảng số tinh gọn, giải quyết triệt để các rào cản và độ trễ trong quy trình đấu thầu, tìm kiếm nguồn hàng và vận hành giao nhận cho các doanh nghiệp Thương mại - Xuất nhập khẩu (XNK) vừa và nhỏ:

* **Không rào cản tài khoản (Frictionless Magic Link):** Nhà cung cấp trong và ngoài nước (Vendors) báo giá trực tiếp qua liên kết mã hóa JWT bảo mật mà không cần tạo tài khoản hay cài đặt phần mềm.
* **Ma trận so sánh báo giá tự động (Comparison Matrix):** Tự động quy đổi tỷ giá đa ngoại tệ về tiền tệ cơ sở, so sánh chi tiết từng dòng hàng (Line Item), chi phí vận chuyển, bảo hiểm và thời gian giao hàng.
* **Quy trình luồng công việc động (Dynamic Workflow Engine):** Tự do khai báo và tùy biến quy trình theo từng nhóm Chủ đầu tư (Nhà nước, EPC, FDI, Tư nhân); hỗ trợ Quản lý dự án ghi đè quy trình riêng (Workflow Tailoring) trên từng gói thầu cụ thể.
* **Kiểm soát chuyển bước dự án đa tầng (Multi-tier Transition Gatekeeper):** Chốt chặn 4 lớp an toàn cho hồ sơ thầu (Chứng từ logic AND/OR, Tiêu chí checklist bắt buộc, Điều kiện tài chính/thương mại, Phê duyệt cấp quản lý) với 3 chế độ kiểm soát (Hard Stop, Soft Warning, Manager Bypass).
* **Điều phối công việc vi mô thông minh (Dynamic Task Dispatcher):** Tự động nhận diện thuộc tính gói thầu để sinh đúng danh mục công việc cần làm, tính toán hạn SLA động và hỗ trợ thêm việc đột xuất (Ad-hoc tasks).
* **Kho tài liệu số tập trung (DMS):** Quản lý tài liệu pháp lý, năng lực công ty và hồ sơ thầu có kiểm soát phiên bản và phân quyền chặt chẽ.
* **Theo dõi tiến độ lô hàng (Shipment Milestone Tracking):** Cảnh báo tự động các mốc ETD/ETA, thông quan hải quan, ngăn ngừa rủi ro trễ hạn giao hàng đã cam kết.

---

## 2. NHẬN DIỆN THƯƠNG HIỆU & BIỂU TƯỢNG ỨNG DỤNG

### Phương Án Thiết Kế: "THE CONTINUOUS COLLABORATION LOOP M"

* **Biểu tượng Một Nét Vẽ Liền Mạch (Single Continuous Monoline):** Biểu trưng được tạo thành từ 1 đường nét hình học khép kín uốn lượn duy nhất, định hình chữ **M** (Mibid) với **nút thắt liên kết số (Collaboration & Magic Link Node)** tinh tế ở trung tâm.
* **Đơn giản — Thoáng đãng — Tinh tế (Zero Visual Clutter):**
  * Loại bỏ hoàn toàn các hình khối 3D phức tạp, bóng đổ, gradient dày đặc, khung viền rườm rà.
  * Đường nét có độ dày đồng nhất (Consistent Line Weight), tỷ lệ hình học chuẩn xác theo phong cách Swiss Design tối giản (tương tự như Airbnb, Linear, Spotify).
* **Tối ưu hiển thị Favicon (100% Legibility at 16×16 px):**
  * Độ tương phản cực đại giữa nét vẽ trắng tinh khiết (`#FFFFFF`) trên nền xanh đen không gian (`#0F172A`).
  * Khi thu nhỏ về kích thước Favicon trình duyệt (`16×16 px`, `32×32 px`), biểu tượng vẫn giữ nguyên độ sắc nét, dứt khoát và nhận diện rõ ràng 100%.

| Biểu trưng Thương hiệu (Brand Logo 16:9) | Biểu tượng Ứng dụng & Favicon (App Icon 1:1) |
| :---: | :---: |
| <img src="docs/assets/mibid_logo_brand.jpg" width="380" alt="Logo Mibid"/> | <img src="docs/assets/mibid_app_icon.jpg" width="180" alt="App Icon Mibid"/> |
| *Logo nhận diện thương hiệu B2B SaaS Mibid* | *Icon ứng dụng di động & Web Favicon 1:1* |

---

## 3. CẤU TRÚC THƯ MỤC CHUẨN HÓA CỦA DỰ ÁN

```text
mibid/
├── .agents/                                        # Bộ quy chuẩn (15 rules) và Kỹ năng (15 skills)
├── .gemini/                                        # Cấu hình trợ lý trí tuệ nhân tạo Gemini / Antigravity
│   ├── GEMINI.md                                   # Quy tắc dự án trung tâm
│   ├── agents/                                     # Mạng lưới trợ lý chuyên trách
│   ├── ecc-install-state.json                      # Trạng thái cài đặt mibid
│   ├── mcp-configs/                                # Cấu hình MCP servers
│   └── scripts/                                    # Scripts tiện ích
├── database/                                       # Cơ sở dữ liệu PostgreSQL 15+
│   ├── 001_init_schema.sql                         # Khởi tạo 38 bảng CSDL chuẩn Multi-tenant RLS
│   ├── 002_seed_data.sql                           # Dữ liệu khởi tạo mẫu
│   └── backup/                                     # Lưu trữ các tệp sao lưu sơ bộ
├── deploy/                                         # Cấu hình đóng gói và triển khai
│   ├── docker-compose.yml                          # Môi trường chạy trọn cụm dịch vụ phân tán
│   ├── .env                                        # Biến môi trường thực thi
│   ├── env/                                        # Biến môi trường mẫu
│   ├── nginx/                                      # Cấu hình reverse proxy và SSL
│   └── scripts/                                    # Kịch bản sao lưu và triển khai tự động
├── docs/                                           # Bộ 23 hồ sơ kỹ thuật chuẩn SDLC
│   ├── assets/                                     # Hình ảnh logo, icon, mockup giao diện
│   ├── archive/                                    # Lưu trữ các bản nháp sơ khai cũ
│   ├── 00-product-rd.md                            # Nghiên cứu sản phẩm & Yêu cầu gốc
│   ├── 01-solution-proposal.md                     # Hồ sơ Đề xuất Giải pháp (Proposal 7 phần)
│   ├── 02-master-solution.md                       # Giải pháp Tổng thể (4 trụ cột)
│   ├── 03-hld-mibid.md                             # Thiết kế Tổng thể HLD BM.02 Viettel
│   ├── 04-srs-core.md                              # Đặc tả Yêu cầu Tổng quan & Kiến trúc Chung
│   ├── 05-srs-iam-dms.md                           # SRS Phân hệ 1: SaaS Multi-tenant, IAM & DMS
│   ├── 06-srs-workflow-gatekeeper.md               # SRS Phân hệ 2: Workflow Engine & Gatekeeper
│   ├── 07-srs-sourcing-magiclink.md                # SRS Phân hệ 3: Mua hàng & Magic Link
│   ├── 08-srs-bidding-tasks.md                     # SRS Phân hệ 4: Công việc Vi mô & Bidding
│   ├── 09-srs-logistics-analytics.md               # SRS Phân hệ 5: Lô hàng & Báo cáo BI
│   ├── 10-db-design-mibid.md                       # Thiết kế CSDL DBDD BM.03 (38 bảng 8 cột)
│   ├── 11-lld-core.md                              # LLD Tổng quan: Kiến trúc Lục giác Core
│   ├── 12-lld-iam-dms.md                           # LLD Phân hệ 1: SaaS Multi-tenant, IAM & DMS
│   ├── 13-lld-workflow-gatekeeper.md               # LLD Phân hệ 2: Workflow & Gatekeeper
│   ├── 14-lld-sourcing-magiclink.md                # LLD Phân hệ 3: Mua hàng & Magic Link
│   ├── 15-lld-bidding-tasks.md                     # LLD Phân hệ 4: Task Engine & Bidding Ops
│   ├── 16-lld-logistics-analytics.md               # LLD Phân hệ 5: Logistics & BI
│   ├── 17-estimation-mibid.xlsx                    # Bảng Ước lượng Nỗ lực chuẩn Viettel
│   ├── 18-uat-mibid.xlsx                           # Kịch bản & Dashboard Nghiệm thu UAT
│   ├── 19-k6-loadtest.js                           # Kịch bản k6 1.000 RPS & 4 bài bẫy Concurrency
│   ├── 20-upcode-guide.md                          # Sổ tay Hướng dẫn Upcode HDUP 6 phần
│   ├── 21-operations-guide.md                      # Sổ tay Cài đặt & Vận hành HDCD_VH 7 phần
│   └── 22-user-guide.md                            # Tài liệu Hướng dẫn Sử dụng HDSD 5 phần
├── plan/                                           # Bảng điều phối và quản trị tiến độ
│   ├── docs-plan.md                                # Kế hoạch Chuẩn hóa Hồ sơ Tài liệu 6 Cổng
│   └── dev-plan.md                                 # Kế hoạch Phát triển Mã nguồn chi tiết (tham chiếu smart-otp)
├── src/                                            # Mã nguồn ứng dụng
│   ├── backend/                                    # Backend Java 17 / Spring Boot 3
│   └── frontend/                                   # Frontend Next.js 14 / TypeScript
├── tests/                                          # Không gian kiểm thử tự động & nghiệm thu
│   ├── k6/k6_loadtest.js                           # Kịch bản đo kiểm tải cao 1.000 RPS
│   └── uat/uat_test_cases.xlsx                     # Bộ kịch bản nghiệm thu người dùng
├── .gitignore                                      # Cấu hình loại trừ file tạm
└── README.md                                       # Tài liệu tổng quan dự án
```
