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
    allowed_modules JSONB NOT NULL DEFAULT '[]',
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
