-- ============================================================
-- MIBID - SEED DATA (Dữ liệu khởi tạo ban đầu cho SaaS)
-- Chạy sau khi đã chạy 001_init_schema.sql
-- ============================================================

-- ============================================================
-- 1. GLOBAL SAAS DATA (NO RLS)
-- ============================================================

-- 1.1 Modules
INSERT INTO saas_modules (code, name, description) VALUES
    ('SOURCING', 'Thu mua & Cung ứng', 'Quản lý RFQ, Vendor, Quotations'),
    ('BIDDING', 'Đấu thầu', 'Quản lý dự án thầu, hồ sơ dự thầu'),
    ('LOGISTICS', 'Vận hành Logistics', 'Quản lý vận tải, hải quan, lô hàng'),
    ('FINANCE', 'Tài chính & Thanh toán', 'Quản lý thanh toán, P&L lô hàng');

-- 1.2 Features
INSERT INTO saas_features (code, module_code, name, description) VALUES
    ('SOURCING_BASE', 'SOURCING', 'Thu mua cơ bản', 'Tạo RFQ 1 vòng'),
    ('SOURCING_PRO', 'SOURCING', 'Thu mua nâng cao', 'Đấu giá nhiều vòng (Multi-round)'),
    ('LOGISTICS_BASE', 'LOGISTICS', 'Logistics cơ bản', 'Theo dõi vận đơn'),
    ('LOGISTICS_COST', 'FINANCE', 'Phân tích Chi phí', 'Tính toán P&L cho từng Shipment');

-- 1.3 Subscription Plans
INSERT INTO subscription_plans (id, name, max_users, max_storage_gb, price) VALUES
    ('p0000000-0000-0000-0000-000000000001', 'Mibid Basic', 10, 50, 99.00),
    ('p0000000-0000-0000-0000-000000000002', 'Mibid Enterprise', 500, 1000, 499.00);

-- 1.4 Plan Features Mapping
INSERT INTO plan_features (plan_id, feature_code) VALUES
    -- Basic Plan
    ('p0000000-0000-0000-0000-000000000001', 'SOURCING_BASE'),
    ('p0000000-0000-0000-0000-000000000001', 'LOGISTICS_BASE'),
    -- Enterprise Plan (Full features)
    ('p0000000-0000-0000-0000-000000000002', 'SOURCING_BASE'),
    ('p0000000-0000-0000-0000-000000000002', 'SOURCING_PRO'),
    ('p0000000-0000-0000-0000-000000000002', 'LOGISTICS_BASE'),
    ('p0000000-0000-0000-0000-000000000002', 'LOGISTICS_COST');

-- 1.5 Tenants (Khách hàng đăng ký sử dụng)
INSERT INTO tenants (id, name, domain, status) VALUES
    ('t0000000-0000-0000-0000-000000000001', 'Công ty Cổ phần Alpha XNK', 'alpha.mibid.vn', 'ACTIVE'),
    ('t0000000-0000-0000-0000-000000000002', 'Tập đoàn Logistics Beta', 'beta.mibid.vn', 'ACTIVE');

-- 1.6 Tenant Subscriptions
INSERT INTO tenant_subscriptions (tenant_id, plan_id, end_date) VALUES
    ('t0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000002', NOW() + INTERVAL '1 year'), -- Alpha dùng Enterprise
    ('t0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000001', NOW() + INTERVAL '1 year'); -- Beta dùng Basic

-- ============================================================
-- 2. TENANT A (ALPHA) DATA (Tenant-scoped)
-- ============================================================

-- Set RLS session context cho Tenant A
SET session_replication_role = 'replica'; -- Tạm tắt trigger khi seed data (nếu cần)

-- 2.1 Roles cho Tenant A
INSERT INTO roles (id, tenant_id, name, is_system) VALUES
    ('r0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 'Super Admin', TRUE),
    ('r0000000-0000-0000-0000-000000000002', 't0000000-0000-0000-0000-000000000001', 'Sourcing Manager', FALSE);

-- 2.2 User mặc định cho Tenant A (Password mặc định: Mibid@2026)
INSERT INTO users (id, tenant_id, role_id, email, password_hash, full_name) VALUES
    ('u0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 'r0000000-0000-0000-0000-000000000001', 'admin@alpha.mibid.vn', '$2a$12$LJ3et7vOJnTjVp5JDXjXke8YEjL8pZcxUHOOb7sXkGj6QaZrH0xKK', 'Alpha Admin');

-- 2.3 Doc Types (Được copy mẫu cho Tenant A)
INSERT INTO doc_types (id, tenant_id, name, code, description, category, allowed_extensions, max_file_size_mb) VALUES
    ('d0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 'Hợp đồng (Contract)',            'CONTRACT',     'Hợp đồng mua bán giữa các bên',                'Thương mại', '{pdf,docx}', 20),
    ('d0000000-0000-0000-0000-000000000002', 't0000000-0000-0000-0000-000000000001', 'Hóa đơn thương mại (Invoice)',    'INVOICE',      'Commercial Invoice cho lô hàng',                'Thương mại', '{pdf,xlsx}', 10),
    ('d0000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000001', 'Phiếu đóng gói (Packing List)',   'PACKING_LIST', 'Chi tiết đóng gói từng kiện hàng',              'Thương mại', '{pdf,xlsx}', 10),
    ('d0000000-0000-0000-0000-000000000004', 't0000000-0000-0000-0000-000000000001', 'Giấy chứng nhận xuất xứ (C/O)',   'CO',           'Certificate of Origin',                         'Pháp lý',    '{pdf,jpg,png}', 15),
    ('d0000000-0000-0000-0000-000000000005', 't0000000-0000-0000-0000-000000000001', 'Vận đơn (Bill of Lading)',        'BL',           'Vận đơn đường biển hoặc đường hàng không',      'Vận tải',    '{pdf}', 10);

-- 2.4 Workflow Template cho Tenant A
INSERT INTO workflows (id, tenant_id, name, description, created_by) VALUES
    ('w0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 'Luồng XNK Tiêu chuẩn Alpha', 'Quy trình chuẩn cho XNK công ty Alpha', 'u0000000-0000-0000-0000-000000000001');

INSERT INTO workflow_versions (id, tenant_id, workflow_id, version_number, version_label, status, published_at, published_by) VALUES
    ('v0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 'w0000000-0000-0000-0000-000000000001', 1, 'v1.0', 'PUBLISHED', NOW(), 'u0000000-0000-0000-0000-000000000001');

INSERT INTO workflow_stages (id, tenant_id, workflow_id, version_id, code, name, sequence, stage_type, color, sla_days, sla_warning_days, sla_action, is_initial, is_terminal, terminal_type) VALUES
    ('s0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 'w0000000-0000-0000-0000-000000000001', 'v0000000-0000-0000-0000-000000000001', 'PREPARING',  'Chuẩn bị Hồ sơ',      1, 'MANUAL',    '#6B7280', 7,  2, 'WARN',     TRUE,  FALSE, NULL),
    ('s0000000-0000-0000-0000-000000000002', 't0000000-0000-0000-0000-000000000001', 'w0000000-0000-0000-0000-000000000001', 'v0000000-0000-0000-0000-000000000001', 'SOURCING',   'Thu mua & Báo giá',    2, 'MANUAL',    '#3B82F6', 14, 3, 'ESCALATE', FALSE, FALSE, NULL),
    ('s0000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000001', 'w0000000-0000-0000-0000-000000000001', 'v0000000-0000-0000-0000-000000000001', 'BIDDING',    'Đấu thầu',             3, 'APPROVAL',  '#F59E0B', 21, 5, 'ESCALATE', FALSE, FALSE, NULL),
    ('s0000000-0000-0000-0000-000000000004', 't0000000-0000-0000-0000-000000000001', 'w0000000-0000-0000-0000-000000000001', 'v0000000-0000-0000-0000-000000000001', 'WON',        'Trúng thầu',           4, 'MILESTONE', '#10B981', NULL, NULL, 'WARN', FALSE, TRUE,  'SUCCESS'),
    ('s0000000-0000-0000-0000-000000000005', 't0000000-0000-0000-0000-000000000001', 'w0000000-0000-0000-0000-000000000001', 'v0000000-0000-0000-0000-000000000001', 'OPERATIONS', 'Vận hành Logistics',   5, 'MANUAL',    '#8B5CF6', 30, 7, 'ESCALATE', FALSE, FALSE, NULL);

INSERT INTO workflow_transitions (tenant_id, workflow_id, version_id, from_stage_id, to_stage_id, name, condition_type, check_documents, check_tasks, allowed_roles, requires_comment) VALUES
    ('t0000000-0000-0000-0000-000000000001', 'w0000000-0000-0000-0000-000000000001', 'v0000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000002', 'Chuyển sang Sourcing',     'ALL_DOCS',   TRUE,  FALSE, '{OWNER,SOURCING_LEAD}', FALSE),
    ('t0000000-0000-0000-0000-000000000001', 'w0000000-0000-0000-0000-000000000001', 'v0000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000002', 's0000000-0000-0000-0000-000000000003', 'Chuyển sang Bidding',      'ALL_TASKS',  FALSE, TRUE,  '{OWNER,SALES_EXEC}',    FALSE),
    ('t0000000-0000-0000-0000-000000000001', 'w0000000-0000-0000-0000-000000000001', 'v0000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000003', 's0000000-0000-0000-0000-000000000004', 'Đánh dấu Trúng thầu',     'APPROVAL_GRANTED', FALSE, FALSE, '{OWNER}', TRUE),
    ('t0000000-0000-0000-0000-000000000001', 'w0000000-0000-0000-0000-000000000001', 'v0000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000004', 's0000000-0000-0000-0000-000000000005', 'Bắt đầu Vận hành',        'ALL_DOCS',   TRUE,  FALSE, '{OWNER,LOGISTICS_EXEC}', FALSE);

INSERT INTO stage_doc_rules (tenant_id, stage_id, doc_type_id, requires_approval, is_hard_stop, description) VALUES
    ('t0000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', TRUE,  TRUE,  'Hợp đồng phải được Manager duyệt trước khi chuyển sang Sourcing');

INSERT INTO stage_checklist_items (tenant_id, stage_id, title, is_required, sort_order) VALUES
    ('t0000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000001', 'Đã khảo sát thị trường', TRUE,  1),
    ('t0000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000002', 'Đã check năng lực Vendor', FALSE, 1);

INSERT INTO workflow_stage_tasks (tenant_id, stage_id, title, default_role, priority, due_days_offset) VALUES
    ('t0000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000002', 'Tạo RFQ và gửi link', 'SOURCING_LEAD', 'HIGH', 2);

SET session_replication_role = 'origin'; -- Bật lại trigger
