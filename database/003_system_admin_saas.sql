-- ============================================================
-- MIBID - DATABASE SCHEMA EXTENSION: DYNAMIC MENUS & SAAS BILLING
-- ============================================================

-- Table: app_menus (Quản lý Danh mục Menu / Route Động toàn hệ thống)
CREATE TABLE IF NOT EXISTS app_menus (
    id VARCHAR(50) PRIMARY KEY,
    parent_id VARCHAR(50) REFERENCES app_menus(id) ON DELETE SET NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL,
    path VARCHAR(100) NOT NULL,
    icon VARCHAR(50) DEFAULT 'LayoutDashboard',
    module_code VARCHAR(50) NOT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_system BOOLEAN DEFAULT FALSE,
    required_permission VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: tenant_menu_permissions (Phân quyền Menu cho từng Tenant trong mô hình SaaS)
CREATE TABLE IF NOT EXISTS tenant_menu_permissions (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    menu_id VARCHAR(50) NOT NULL REFERENCES app_menus(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT TRUE,
    custom_label VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_menu UNIQUE (tenant_id, menu_id)
);

-- Table: subscription_plans (Bảng Danh mục Gói cước SaaS)
CREATE TABLE IF NOT EXISTS subscription_plans (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    monthly_price NUMERIC(15, 2) DEFAULT 0,
    yearly_price NUMERIC(15, 2) DEFAULT 0,
    max_users INT DEFAULT 10,
    max_machines INT DEFAULT 5,
    max_storage_gb INT DEFAULT 20,
    allowed_modules TEXT NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: tenant_subscriptions (Bảng Hợp đồng & Đăng ký Thuê bao của Nhà máy / Doanh nghiệp)
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    plan_id VARCHAR(50) NOT NULL REFERENCES subscription_plans(id),
    billing_cycle VARCHAR(20) DEFAULT 'YEARLY',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    grace_period_days INT DEFAULT 7,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    auto_renew BOOLEAN DEFAULT FALSE,
    current_user_count INT DEFAULT 0,
    current_machine_count INT DEFAULT 0,
    last_notification_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: subscription_invoices (Hóa đơn & Lịch sử Thanh toán Gia hạn)
CREATE TABLE IF NOT EXISTS subscription_invoices (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    subscription_id VARCHAR(50) REFERENCES tenant_subscriptions(id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'VND',
    status VARCHAR(30) DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    payment_date TIMESTAMP WITH TIME ZONE,
    due_date DATE NOT NULL,
    transaction_reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: subscription_notifications (Lịch sử Cảnh báo Nhắc cước & Hết hạn Tự động)
CREATE TABLE IF NOT EXISTS subscription_notifications (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    subscription_id VARCHAR(50) REFERENCES tenant_subscriptions(id),
    notification_type VARCHAR(50) NOT NULL,
    recipient_email VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    days_remaining INT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'SENT'
);

-- Chỉ mục
CREATE INDEX IF NOT EXISTS idx_mibid_app_menus_module ON app_menus(module_code);
CREATE INDEX IF NOT EXISTS idx_mibid_tenant_menu_perm_tenant ON tenant_menu_permissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mibid_tenant_subs_tenant ON tenant_subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mibid_subs_invoices_tenant ON subscription_invoices(tenant_id);

-- Dữ liệu Master Menus khởi tạo cho MIBID
INSERT INTO app_menus (id, parent_id, code, title, path, icon, module_code, sort_order, is_active, is_system, required_permission) VALUES
('MENU-DASHBOARD', NULL, 'dashboard', 'Tổng Quan Báo Cáo', '/dashboard', 'LayoutDashboard', 'CORE', 1, TRUE, TRUE, 'DASHBOARD:VIEW'),
('MENU-PROJECTS', NULL, 'projects', 'Danh Sách Gói Thầu', '/projects', 'Briefcase', 'BIDDING', 2, TRUE, FALSE, 'PROJECT:VIEW'),
('MENU-KANBAN', NULL, 'kanban', 'Bảng Tiến Độ Thầu (Kanban)', '/kanban', 'Kanban', 'BIDDING', 3, TRUE, FALSE, 'KANBAN:VIEW'),
('MENU-WORKFLOW', NULL, 'workflow', 'Quy Trình & Hồ Sơ Thầu (6 Bước)', '/workflow', 'SplitSquareVertical', 'BIDDING', 4, TRUE, FALSE, 'WORKFLOW:VIEW'),
('MENU-SOURCING', NULL, 'sourcing', 'Sourcing & Báo Giá NCC (RFQ)', '/sourcing', 'FileSpreadsheet', 'SOURCING', 5, TRUE, FALSE, 'SOURCING:VIEW'),
('MENU-MATRIX', NULL, 'matrix', 'Ma Trận So Sánh Báo Giá', '/matrix', 'Layers', 'SOURCING', 6, TRUE, FALSE, 'MATRIX:VIEW'),
('MENU-TASKS', NULL, 'tasks', 'Phân Công & Nhiệm Vụ', '/tasks', 'CheckSquare', 'BIDDING', 7, TRUE, FALSE, 'TASK:VIEW'),
('MENU-LOGISTICS', NULL, 'logistics', 'Vận Đơn & Chi Phí XNK', '/logistics', 'Truck', 'LOGISTICS', 8, TRUE, FALSE, 'LOGISTICS:VIEW'),
('MENU-DMS', NULL, 'dms', 'Kho Hồ Sơ & Tài Liệu Số (DMS)', '/dms', 'FolderLock', 'DMS', 9, TRUE, FALSE, 'DMS:VIEW'),
('MENU-ANALYTICS', NULL, 'analytics', 'Phân Tích Thống Kê & Tỷ Lệ Trúng', '/analytics', 'BarChart3', 'ANALYTICS', 10, TRUE, FALSE, 'ANALYTICS:VIEW'),
('MENU-USERS', NULL, 'users', 'Quản Trị Người Dùng & Nhân Sự', '/users', 'Users', 'SYSTEM_ADMIN', 11, TRUE, TRUE, 'SYS:USER:VIEW'),
('MENU-ROLES', NULL, 'roles', 'Nhóm Quyền & Ma Trận Phân Quyền', '/roles', 'Shield', 'SYSTEM_ADMIN', 12, TRUE, TRUE, 'SYS:ROLE:VIEW'),
('MENU-TENANTS', NULL, 'tenants', 'Cấu Hình Doanh Nghiệp (Tenants)', '/tenants', 'Building2', 'SYSTEM_ADMIN', 13, TRUE, TRUE, 'SYS:TENANT:VIEW'),
('MENU-MENUS', NULL, 'menus', 'Quản Lý Menu & Route Động', '/menus', 'FolderTree', 'SYSTEM_ADMIN', 14, TRUE, TRUE, 'SYS:MENU:VIEW'),
('MENU-SUBSCRIPTIONS', NULL, 'subscriptions', 'Gói Cước & Thuê Bao SaaS', '/subscriptions', 'CreditCard', 'SAAS_BILLING', 15, TRUE, TRUE, 'SYS:SUBSCRIPTION:VIEW'),
('MENU-INTEGRATION', NULL, 'integration', 'Cổng Tích Hợp Ngoại Vi & ERP', '/integration', 'Network', 'SYSTEM_ADMIN', 16, TRUE, FALSE, 'SYS:INTEGRATION:VIEW')
ON CONFLICT (code) DO NOTHING;

-- Dữ liệu Master Gói cước SaaS cho MIBID
INSERT INTO subscription_plans (id, code, name, description, monthly_price, yearly_price, max_users, max_machines, max_storage_gb, allowed_modules, is_active) VALUES
('PLAN-STARTER', 'STARTER', 'Gói Khởi Động Đấu Thầu (Starter)', 'Dành cho doanh nghiệp vừa và nhỏ tham gia dưới 10 gói thầu/năm', 3000000, 30000000, 10, 0, 50, '["CORE", "BIDDING", "SOURCING"]'::jsonb, TRUE),
('PLAN-PRO', 'PROFESSIONAL', 'Gói Chuyên Nghiệp (Professional Bid)', 'Đầy đủ tính năng phân tích HSMT, Sourcing đa tiền tệ và kho tài liệu DMS', 8000000, 80000000, 50, 0, 300, '["CORE", "BIDDING", "SOURCING", "LOGISTICS", "DMS", "ANALYTICS"]'::jsonb, TRUE),
('PLAN-ENTERPRISE', 'ENTERPRISE', 'Gói Doanh Nghiệp Cao Cấp (Enterprise XNK)', 'Không giới hạn dung lượng, tích hợp Hải quan / ERP, bảo mật cấp độ cao và SLA 99.99%', 20000000, 200000000, 500, 0, 2000, '["CORE", "BIDDING", "SOURCING", "LOGISTICS", "DMS", "ANALYTICS", "SYSTEM_ADMIN", "SAAS_BILLING"]'::jsonb, TRUE)
ON CONFLICT (code) DO NOTHING;

-- Table: system_config (Cấu hình hệ thống tập trung - Zero-Hardcode)
CREATE TABLE IF NOT EXISTS system_config (
    config_key VARCHAR(200) PRIMARY KEY,
    config_value VARCHAR(2000) NOT NULL,
    description VARCHAR(500),
    data_type VARCHAR(50) DEFAULT 'STRING',
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mở rộng bảng stage_checklist_items lưu mã tài liệu và vai trò phụ trách
ALTER TABLE stage_checklist_items ADD COLUMN IF NOT EXISTS doc_code VARCHAR(100);
ALTER TABLE stage_checklist_items ADD COLUMN IF NOT EXISTS assignee_role VARCHAR(100);

-- Đồng bộ kiểu dữ liệu bảng gói cước sang VARCHAR(50)
ALTER TABLE plan_features DROP CONSTRAINT IF EXISTS fk_pf_plan;
ALTER TABLE tenant_subscriptions DROP CONSTRAINT IF EXISTS fk_ts_plan;
ALTER TABLE tenant_subscriptions DROP CONSTRAINT IF EXISTS fk_ts_tenant;
ALTER TABLE tenant_subscriptions DROP CONSTRAINT IF EXISTS chk_ts_status;
ALTER TABLE subscription_plans ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE subscription_plans ALTER COLUMN allowed_modules TYPE TEXT USING allowed_modules::text;
ALTER TABLE tenant_subscriptions ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE tenant_subscriptions ALTER COLUMN tenant_id TYPE VARCHAR(50);
ALTER TABLE tenant_subscriptions ALTER COLUMN plan_id TYPE VARCHAR(50);
ALTER TABLE tenant_subscriptions ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20) DEFAULT 'YEARLY';
ALTER TABLE tenant_subscriptions ADD COLUMN IF NOT EXISTS grace_period_days INT DEFAULT 7;
ALTER TABLE tenant_subscriptions ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT TRUE;
ALTER TABLE tenant_subscriptions ADD COLUMN IF NOT EXISTS current_user_count INT DEFAULT 0;
ALTER TABLE tenant_subscriptions ADD COLUMN IF NOT EXISTS current_machine_count INT DEFAULT 0;
ALTER TABLE tenant_subscriptions ADD COLUMN IF NOT EXISTS last_notification_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tenant_subscriptions ALTER COLUMN start_date TYPE DATE USING start_date::date;
ALTER TABLE tenant_subscriptions ALTER COLUMN end_date TYPE DATE USING COALESCE(end_date::date, (CURRENT_DATE + INTERVAL '1 year')::date);
ALTER TABLE tenant_subscriptions ADD CONSTRAINT fk_ts_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE;
ALTER TABLE subscription_plans ADD CONSTRAINT uq_sub_plans_code UNIQUE (code);

INSERT INTO system_config (config_key, config_value, description, data_type, is_active) VALUES
('subscription.default.plan.code', 'ENTERPRISE', 'Mã gói cước dịch vụ mặc định', 'STRING', TRUE),
('subscription.default.billing.cycle', 'YEARLY', 'Chu kỳ thanh toán mặc định (MONTHLY, QUARTERLY, YEARLY)', 'STRING', TRUE),
('subscription.default.grace.period.days', '7', 'Số ngày ân hạn mặc định sau khi hết hạn thuê bao', 'INTEGER', TRUE),
('subscription.invoice.due.days', '15', 'Số ngày đến hạn thanh toán hóa đơn gia hạn', 'INTEGER', TRUE),
('subscription.default.currency', 'VND', 'Đơn vị tiền tệ hạch toán thuê bao mặc định', 'STRING', TRUE),
('subscription.default.payment.method', 'BANK_TRANSFER', 'Phương thức thanh toán mặc định', 'STRING', TRUE),
('subscription.notification.renewal.title', 'Gia hạn dịch vụ MIBID thành công', 'Tiêu đề thông báo gia hạn thuê bao', 'STRING', TRUE),
('subscription.notification.renewal.message', 'Hợp đồng thuê bao gói {planName} đã được gia hạn đến ngày {endDate}', 'Mẫu nội dung thông báo gia hạn thuê bao', 'STRING', TRUE)
ON CONFLICT (config_key) DO NOTHING;

INSERT INTO tenant_subscriptions (
    id, tenant_id, plan_id, billing_cycle, start_date, end_date, grace_period_days, status, auto_renew, current_user_count, current_machine_count
) VALUES 
('SUB-EEMC-2026', '11111111-1111-1111-1111-111111111111', 'PLAN-PRO', 'YEARLY', '2026-01-01', '2026-12-31', 7, 'ACTIVE', TRUE, 15, 0),
('SUB-PVN-2026', '22222222-2222-2222-2222-222222222222', 'PLAN-ENTERPRISE', 'YEARLY', '2026-01-01', '2026-12-31', 14, 'ACTIVE', TRUE, 85, 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO subscription_invoices (
    id, tenant_id, subscription_id, invoice_number, amount, currency, status, payment_method, payment_date, due_date, transaction_reference
) VALUES
('INV-2026-001', '11111111-1111-1111-1111-111111111111', 'SUB-EEMC-2026', 'INV-EEMC-2026-01', 80000000.00, 'VND', 'PAID', 'BANK_TRANSFER', '2026-01-02 09:30:00+07', '2026-01-15', 'TXN-VCB-883921'),
('INV-2026-002', '22222222-2222-2222-2222-222222222222', 'SUB-PVN-2026', 'INV-PVN-2026-01', 200000000.00, 'VND', 'PAID', 'BANK_TRANSFER', '2026-01-03 14:15:00+07', '2026-01-20', 'TXN-BIDV-991283')
ON CONFLICT (id) DO NOTHING;

INSERT INTO subscription_notifications (
    id, tenant_id, subscription_id, notification_type, recipient_email, title, message, days_remaining, status
) VALUES
('NOTIF-001', '11111111-1111-1111-1111-111111111111', 'SUB-EEMC-2026', 'RENEWAL_CONFIRMATION', 'contact@eemc.com.vn', 'Gia hạn dịch vụ MIBID thành công', 'Hợp đồng thuê bao gói Professional Bid đã được kích hoạt đến 31/12/2026', 120, 'SENT'),
('NOTIF-002', '22222222-2222-2222-2222-222222222222', 'SUB-PVN-2026', 'RENEWAL_CONFIRMATION', 'bidding@pvn.vn', 'Kích hoạt gói dịch vụ Enterprise', 'Chào mừng PVN sử dụng gói Enterprise XNK không giới hạn của MIBID', 120, 'SENT')
ON CONFLICT (id) DO NOTHING;
