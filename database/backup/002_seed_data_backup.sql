-- ============================================================
-- MIBID - SEED DATA (Dữ liệu khởi tạo ban đầu)
-- Chạy sau khi đã chạy 001_init_schema.sql
-- ============================================================

-- 1. Tạo tài khoản Super Admin mặc định
-- Password mặc định: Mibid@2026 (bcrypt hash)
INSERT INTO users (id, email, password_hash, full_name, system_role) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'admin@mibid.vn', '$2a$12$LJ3et7vOJnTjVp5JDXjXke8YEjL8pZcxUHOOb7sXkGj6QaZrH0xKK', 'System Admin', 'SUPER_ADMIN');

-- 2. Danh mục Loại Tài liệu (Doc Types) - Chuẩn XNK
INSERT INTO doc_types (id, name, code, description, category, allowed_extensions, max_file_size_mb) VALUES
    ('d0000000-0000-0000-0000-000000000001', 'Hợp đồng (Contract)',            'CONTRACT',     'Hợp đồng mua bán giữa các bên',                'Thương mại', '{pdf,docx}', 20),
    ('d0000000-0000-0000-0000-000000000002', 'Hóa đơn thương mại (Invoice)',    'INVOICE',      'Commercial Invoice cho lô hàng',                'Thương mại', '{pdf,xlsx}', 10),
    ('d0000000-0000-0000-0000-000000000003', 'Phiếu đóng gói (Packing List)',   'PACKING_LIST', 'Chi tiết đóng gói từng kiện hàng',              'Thương mại', '{pdf,xlsx}', 10),
    ('d0000000-0000-0000-0000-000000000004', 'Giấy chứng nhận xuất xứ (C/O)',   'CO',           'Certificate of Origin',                         'Pháp lý',    '{pdf,jpg,png}', 15),
    ('d0000000-0000-0000-0000-000000000005', 'Vận đơn (Bill of Lading)',        'BL',           'Vận đơn đường biển hoặc đường hàng không',      'Vận tải',    '{pdf}', 10),
    ('d0000000-0000-0000-0000-000000000006', 'Giấy phép xuất/nhập khẩu',        'LICENSE',      'Giấy phép do cơ quan nhà nước cấp',             'Pháp lý',    '{pdf,jpg,png}', 20),
    ('d0000000-0000-0000-0000-000000000007', 'Chứng thư giám định (Survey)',    'SURVEY',       'Báo cáo giám định chất lượng',                  'Kiểm định',  '{pdf}', 30),
    ('d0000000-0000-0000-0000-000000000008', 'Bảo hiểm hàng hóa (Insurance)',   'INSURANCE',    'Chứng nhận bảo hiểm lô hàng',                   'Tài chính',  '{pdf}', 10),
    ('d0000000-0000-0000-0000-000000000009', 'Phụ lục Hợp đồng (Annex)',        'ANNEX',        'Phụ lục bổ sung, sửa đổi hợp đồng',            'Thương mại', '{pdf,docx}', 20),
    ('d0000000-0000-0000-0000-000000000010', 'Tài liệu khác (Other)',           'OTHER',        'Tài liệu nằm ngoài danh mục',                  NULL,         '{pdf,docx,xlsx,jpg,png}', 30);

-- ============================================================
-- 3. Workflow Template: Luồng XNK Tiêu chuẩn
-- ============================================================
INSERT INTO workflows (id, name, description, created_by) VALUES
    ('w0000000-0000-0000-0000-000000000001', 'Luồng XNK Tiêu chuẩn', 'Quy trình 5 bước chuẩn cho mọi dự án Xuất nhập khẩu', 'a0000000-0000-0000-0000-000000000001');

-- 3.1 Workflow Version
INSERT INTO workflow_versions (id, workflow_id, version_number, version_label, status, published_at, published_by) VALUES
    ('v0000000-0000-0000-0000-000000000001', 'w0000000-0000-0000-0000-000000000001', 1, 'v1.0', 'PUBLISHED', NOW(), 'a0000000-0000-0000-0000-000000000001');

-- 3.2 Workflow Stages (5 bước)
INSERT INTO workflow_stages (id, workflow_id, version_id, code, name, sequence, stage_type, color, sla_days, sla_warning_days, sla_action, is_initial, is_terminal, terminal_type) VALUES
    ('s0000000-0000-0000-0000-000000000001', 'w0000000-0000-0000-0000-000000000001', 'v0000000-0000-0000-0000-000000000001', 'PREPARING',  'Chuẩn bị Hồ sơ',      1, 'MANUAL',    '#6B7280', 7,  2, 'WARN',     TRUE,  FALSE, NULL),
    ('s0000000-0000-0000-0000-000000000002', 'w0000000-0000-0000-0000-000000000001', 'v0000000-0000-0000-0000-000000000001', 'SOURCING',   'Thu mua & Báo giá',    2, 'MANUAL',    '#3B82F6', 14, 3, 'ESCALATE', FALSE, FALSE, NULL),
    ('s0000000-0000-0000-0000-000000000003', 'w0000000-0000-0000-0000-000000000001', 'v0000000-0000-0000-0000-000000000001', 'BIDDING',    'Đấu thầu',             3, 'APPROVAL',  '#F59E0B', 21, 5, 'ESCALATE', FALSE, FALSE, NULL),
    ('s0000000-0000-0000-0000-000000000004', 'w0000000-0000-0000-0000-000000000001', 'v0000000-0000-0000-0000-000000000001', 'WON',        'Trúng thầu',           4, 'MILESTONE', '#10B981', NULL, NULL, 'WARN', FALSE, TRUE,  'SUCCESS'),
    ('s0000000-0000-0000-0000-000000000005', 'w0000000-0000-0000-0000-000000000001', 'v0000000-0000-0000-0000-000000000001', 'LOST',       'Trượt thầu',           5, 'MILESTONE', '#EF4444', NULL, NULL, 'WARN', FALSE, TRUE,  'FAILURE'),
    ('s0000000-0000-0000-0000-000000000006', 'w0000000-0000-0000-0000-000000000001', 'v0000000-0000-0000-0000-000000000001', 'OPERATIONS', 'Vận hành Logistics',   6, 'MANUAL',    '#8B5CF6', 30, 7, 'ESCALATE', FALSE, FALSE, NULL);

-- 3.3 Workflow Transitions (Đồ thị chuyển bước)
INSERT INTO workflow_transitions (workflow_id, version_id, from_stage_id, to_stage_id, name, condition_type, check_documents, check_tasks, allowed_roles, requires_comment) VALUES
    -- Luồng chính (Tiến)
    ('w0000000-0000-0000-0000-000000000001', 'v0000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000002', 'Chuyển sang Sourcing',     'ALL_DOCS',   TRUE,  FALSE, '{OWNER,SOURCING_LEAD}', FALSE),
    ('w0000000-0000-0000-0000-000000000001', 'v0000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000002', 's0000000-0000-0000-0000-000000000003', 'Chuyển sang Bidding',      'ALL_TASKS',  FALSE, TRUE,  '{OWNER,SALES_EXEC}',    FALSE),
    ('w0000000-0000-0000-0000-000000000001', 'v0000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000003', 's0000000-0000-0000-0000-000000000004', 'Đánh dấu Trúng thầu',     'APPROVAL_GRANTED', FALSE, FALSE, '{OWNER}', TRUE),
    ('w0000000-0000-0000-0000-000000000001', 'v0000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000003', 's0000000-0000-0000-0000-000000000005', 'Đánh dấu Trượt thầu',     'NONE',       FALSE, FALSE, '{OWNER}', TRUE),
    ('w0000000-0000-0000-0000-000000000001', 'v0000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000004', 's0000000-0000-0000-0000-000000000006', 'Bắt đầu Vận hành',        'ALL_DOCS',   TRUE,  FALSE, '{OWNER,LOGISTICS_EXEC}', FALSE),
    -- Luồng quay lại (Lùi)
    ('w0000000-0000-0000-0000-000000000001', 'v0000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000002', 's0000000-0000-0000-0000-000000000001', 'Quay lại Chuẩn bị',       'NONE',       FALSE, FALSE, '{OWNER}', TRUE),
    ('w0000000-0000-0000-0000-000000000001', 'v0000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000003', 's0000000-0000-0000-0000-000000000002', 'Quay lại Sourcing',       'NONE',       FALSE, FALSE, '{OWNER}', TRUE);

-- 3.4 Gatekeeper Doc Rules
INSERT INTO stage_doc_rules (stage_id, doc_type_id, requires_approval, is_hard_stop, description) VALUES
    -- Vào SOURCING: Phải có Hợp đồng (Hard Stop, Cần duyệt)
    ('s0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', TRUE,  TRUE,  'Hợp đồng phải được Manager duyệt trước khi chuyển sang Sourcing'),
    -- Vào BIDDING: Phải có Invoice (Soft Warning)
    ('s0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', FALSE, FALSE, 'Invoice nên có nhưng không bắt buộc'),
    -- Vào OPERATIONS: Phải có B/L + C/O (Hard Stop, Cần duyệt)
    ('s0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000005', TRUE,  TRUE,  'B/L phải được duyệt trước khi vận hành'),
    ('s0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000004', TRUE,  TRUE,  'C/O phải được duyệt trước khi vận hành');

-- 3.5 Checklist Items mẫu
INSERT INTO stage_checklist_items (stage_id, title, is_required, sort_order) VALUES
    ('s0000000-0000-0000-0000-000000000001', 'Đã khảo sát thị trường và xác định nhu cầu',              TRUE,  1),
    ('s0000000-0000-0000-0000-000000000001', 'Đã ước tính ngân sách sơ bộ',                               TRUE,  2),
    ('s0000000-0000-0000-0000-000000000002', 'Đã xác nhận giá với ít nhất 3 Vendor qua điện thoại',       TRUE,  1),
    ('s0000000-0000-0000-0000-000000000002', 'Đã kiểm tra năng lực sản xuất Vendor',                      FALSE, 2),
    ('s0000000-0000-0000-0000-000000000003', 'Hồ sơ thầu đã được Legal review',                           TRUE,  1),
    ('s0000000-0000-0000-0000-000000000006', 'Đã đặt booking tàu',                                         TRUE,  1),
    ('s0000000-0000-0000-0000-000000000006', 'Đã mua bảo hiểm hàng hóa',                                   TRUE,  2);

-- 3.6 Notification Config mẫu
INSERT INTO stage_notifications (stage_id, event_type, target_role, channel, subject_template, body_template) VALUES
    ('s0000000-0000-0000-0000-000000000002', 'ON_ENTER',     'SOURCING_LEAD', 'BOTH', 'Dự án {{project_name}} đã chuyển sang Sourcing',     'Bạn được gán xử lý. Vui lòng tạo RFQ trong vòng {{sla_days}} ngày.'),
    ('s0000000-0000-0000-0000-000000000003', 'ON_ENTER',     'SALES_EXEC',    'BOTH', 'Dự án {{project_name}} cần lập Hồ sơ thầu',           'Hồ sơ thầu cần hoàn thành trước {{deadline}}.'),
    ('s0000000-0000-0000-0000-000000000006', 'ON_ENTER',     'LOGISTICS_EXEC','BOTH', 'Dự án {{project_name}} vào giai đoạn Vận hành',        'Vui lòng tạo Lô hàng và cập nhật ETD/ETA.'),
    ('s0000000-0000-0000-0000-000000000002', 'SLA_WARNING',  'OWNER',         'EMAIL','⚠️ Dự án {{project_name}} sắp hết SLA tại Sourcing', 'Còn {{remaining_days}} ngày. Vui lòng kiểm tra tiến độ.'),
    ('s0000000-0000-0000-0000-000000000006', 'SLA_BREACH',   'OWNER',         'BOTH', '🔴 Dự án {{project_name}} đã vượt SLA tại Operations','Dự án đã nằm tại bước Operations quá {{sla_days}} ngày.');

-- ============================================================
-- 4. Template Task tự động khi chuyển bước
-- ============================================================
INSERT INTO workflow_stage_tasks (stage_id, title, default_role, priority, due_days_offset) VALUES
    -- Khi vào SOURCING
    ('s0000000-0000-0000-0000-000000000002', 'Lập danh sách Vendor tiềm năng',     'SOURCING_LEAD', 'HIGH', 2),
    ('s0000000-0000-0000-0000-000000000002', 'Tạo RFQ và gửi Magic Link',          'SOURCING_LEAD', 'HIGH', 3),
    ('s0000000-0000-0000-0000-000000000002', 'Thu thập và đối chiếu báo giá',       'SOURCING_LEAD', 'MEDIUM', 7),
    -- Khi vào BIDDING
    ('s0000000-0000-0000-0000-000000000003', 'Lập hồ sơ dự thầu',                  'SALES_EXEC',    'HIGH', 5),
    ('s0000000-0000-0000-0000-000000000003', 'Nộp hồ sơ thầu cho Chủ đầu tư',      'SALES_EXEC',    'HIGH', 7),
    -- Khi vào OPERATIONS
    ('s0000000-0000-0000-0000-000000000006', 'Đặt tàu / Booking Freight',            'LOGISTICS_EXEC','HIGH', 2),
    ('s0000000-0000-0000-0000-000000000006', 'Làm thủ tục Hải quan',                 'LOGISTICS_EXEC','MEDIUM', 5),
    ('s0000000-0000-0000-0000-000000000006', 'Theo dõi Vận đơn và Giao hàng',        'LOGISTICS_EXEC','MEDIUM', 10),
    ('s0000000-0000-0000-0000-000000000006', 'Kiểm hàng tại cảng đích',              'LOGISTICS_EXEC','HIGH', 12);
