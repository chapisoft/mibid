# Formal SRS: Phân hệ Bidding, Operations & Reporting
**Tài liệu Đặc tả Yêu cầu Kỹ thuật dành cho Developer (Phase 3)**

---

## 1. TỪ ĐIỂN DỮ LIỆU (DATA DICTIONARY)

### 1.1 Phân hệ Bidding (Quản lý Hồ sơ thầu)

*(Lưu ý: Bảng `projects` đã được định nghĩa ở Phase 1. Các bảng dưới đây bổ sung chi tiết cho Bidding).*

#### Bảng `project_tasks` (Quản lý Công việc vi mô)
| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `task_id` | UUID | PK, Not Null | |
| `project_id` | UUID | FK, Not Null | Thuộc dự án nào. |
| `stage_id` | UUID | FK, Not Null | Thuộc Bước nào trong Workflow. |
| `task_name` | VARCHAR(255) | Not Null | Tên công việc (VD: Lập bảng giá dự thầu). |
| `assignee_id` | UUID | FK, Nullable | Người được giao việc. |
| `deadline` | TIMESTAMP | Not Null | Hạn chót hoàn thành task. |
| `status` | ENUM | Default: 'TODO' | ['TODO', 'DOING', 'DONE', 'OVERDUE']. |
| `is_auto_generated`| BOOLEAN | Default: FALSE| Được sinh tự động từ cấu hình Workflow hay tạo tay. |

#### Bảng `clients` (Quản lý Khách hàng / Chủ đầu tư)
| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `client_id` | UUID | PK, Not Null | |
| `company_name`| VARCHAR(255) | Unique, Not Null| Tên công ty khách hàng. |
| `tax_code` | VARCHAR(50) | Unique | Mã số thuế. |
| `contact_email`| VARCHAR(255) | Nullable | Email liên hệ. |

### 1.2 Phân hệ Operations (Vận hành & Tracking)

#### Bảng `shipments` (Quản lý Lô hàng / Vận đơn)
| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `shipment_id` | UUID | PK, Not Null | |
| `project_id` | UUID | FK, Not Null | Lô hàng của dự án nào. (1 Dự án có thể có nhiều Shipment). |
| `vendor_id` | UUID | FK, Nullable | Liên kết bảng Vendor (nếu cần tracking riêng). |
| `forwarder_id`| UUID | FK, Nullable | Đơn vị vận chuyển (Bảng partners). |
| `bl_number` | VARCHAR(100) | Unique, Nullable| Mã Vận đơn (Bill of Lading). |
| `status` | ENUM | Default: 'PENDING'| ['PENDING', 'IN_TRANSIT', 'CUSTOMS', 'DELIVERED']. |

#### Bảng `shipment_milestones` (Theo dõi mốc thời gian giao hàng)
| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `milestone_id`| UUID | PK, Not Null | |
| `shipment_id` | UUID | FK, Not Null | |
| `milestone_type`| ENUM | Not Null | ['PAYMENT_DEPOSIT', 'ETD', 'ETA', 'CUSTOMS_CLEARANCE']. |
| `planned_date`| DATE | Not Null | Ngày dự kiến. |
| `actual_date` | DATE | Nullable | Ngày thực tế hoàn thành. Nếu Null và quá Planned Date -> Trễ. |
| `is_completed`| BOOLEAN | Default: FALSE| Đánh dấu Done. |

#### Bảng `chat_rooms` (Phòng Chat Contextual)
| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `room_id` | UUID | PK, Not Null | |
| `shipment_id` | UUID | FK, Not Null | Chat room gắn liền với 1 Lô hàng cụ thể. |
| `participants`| JSONB | Not Null | Mảng chứa User_ID (Logistics), Vendor_Contact, Forwarder_Contact. |

### 1.3 Phân hệ Reporting (Dữ liệu phục vụ Báo cáo)

*Hệ thống không tạo bảng riêng cho Báo cáo (trừ các bảng Materialized Views để tăng tốc độ query), dữ liệu sẽ được Aggregation từ các bảng nghiệp vụ.*

---

## 2. USE CASE SPECIFICATION (ĐẶC TẢ USE CASE)

### UC_BID_01: Sinh Task Tự động khi Chuyển Bước
**1. Triggers:** Được gọi nội bộ (Internal Trigger) ngay sau khi `UC_WF_01: Chuyển bước Dự án` thực hiện thành công.

**2. Normal Flow:**
1. Lấy thông tin `target_stage_id` vừa chuyển tới.
2. Query bảng `workflow_stage_tasks` (Bảng cấu hình Task mẫu của Workflow).
3. Vòng lặp qua các Task mẫu:
   - Tạo bản ghi mới trong bảng `project_tasks`.
   - `assignee_id`: Gán tự động dựa trên Role cấu hình (VD: Gán cho người có role SOURCING_LEAD trong dự án).
   - `deadline`: Bằng `NOW()` cộng với `sla_hours` của bước đó.
   - `is_auto_generated` = TRUE.
4. Gửi Notification "Bạn có task mới" cho những người được gán.

### UC_OP_01: Cảnh báo Mốc Thời Gian Vận Hành (Cronjob)
**1. Triggers:** Background Job chạy mỗi 8h sáng (Cron `0 8 * * *`).

**2. Normal Flow:**
1. Server query bảng `shipment_milestones`.
2. Lọc các bản ghi có `is_completed = FALSE` VÀ `planned_date = CURDATE() + INTERVAL 1 DAY` (Sắp đến hạn ngày mai).
3. Lấy thông tin `shipment_id` -> Lấy danh sách thành viên dự án có role `LOGISTICS_EXEC`.
4. Gửi Notification / Email nhắc nhở: "Cảnh báo: Mốc {Milestone_Type} của Lô hàng {BL_Number} sẽ đến hạn vào ngày mai".
5. Lọc tiếp các bản ghi `is_completed = FALSE` VÀ `planned_date < CURDATE()` (Đã trễ hạn).
6. Gửi cảnh báo Overdue (Màu đỏ) cho Logistics Exec và Project Manager.

### UC_REP_01: Thống kê Tỷ lệ Thắng/Trượt Thầu (Win/Loss Ratio)
**1. Triggers:** API Call `GET /api/v1/reports/win-loss?start_date=...&end_date=...`

**2. Normal Flow:**
1. Query bảng `projects`. Lọc các dự án có ngày tạo nằm trong khoảng `start_date` đến `end_date`.
2. Group by `current_stage_id` (Hoặc thêm trường `project_status` Enum: WON, LOST, IN_PROGRESS).
3. Đếm số lượng (`COUNT(project_id)`) cho mỗi trạng thái.
4. Tính toán Tỷ lệ % Thắng = (Số lượng WON / Tổng số dự án WON + LOST) * 100.
5. Trả về JSON:
```json
{
  "total_projects": 150,
  "won": 45,
  "lost": 55,
  "in_progress": 50,
  "win_rate_percentage": 45.0
}
```
6. Frontend dùng dữ liệu này vẽ biểu đồ tròn (Pie Chart).
