-- ============================================================
-- MIBID - TENANT MEMBERS, SUBSCRIPTION QUOTA & AUTH UPGRADE
-- Version: 1.1.0
-- ============================================================

-- 1. Bổ sung cột last_login_tenant_id vào bảng users
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL;

-- 2. Tạo bảng quan hệ phân quyền đa Tenant (tenant_members)
CREATE TABLE IF NOT EXISTS tenant_members (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role        VARCHAR(64) NOT NULL DEFAULT 'VIEWER',
    is_default  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_member UNIQUE (tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tm_tenant_id ON tenant_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tm_user_id ON tenant_members(user_id);

-- 3. Chuẩn hóa hạn mức quota cho subscription_plans
UPDATE subscription_plans SET max_users = 2, is_active = true WHERE id = 'PLAN-STARTER' OR code = 'STARTER';
UPDATE subscription_plans SET max_users = 20, is_active = true WHERE id = 'PLAN-PRO' OR code = 'PROFESSIONAL';
UPDATE subscription_plans SET max_users = 500, is_active = true WHERE id = 'PLAN-ENTERPRISE' OR code = 'ENTERPRISE';

-- 4. Gán gói dịch vụ cho Tenant:
-- EEMC: Gói ENTERPRISE (Hạn mức 500 users)
-- PVN: Gói STARTER (Hạn mức 2 users - Hiện đã có 2 users: admin.pvn & tech.pvn. Khi thêm user thứ 3 sẽ chạm trần Quota ngay lập tức!)
UPDATE tenant_subscriptions 
SET plan_id = 'PLAN-ENTERPRISE', current_user_count = 2, status = 'ACTIVE' 
WHERE tenant_id = '11111111-1111-1111-1111-111111111111';

UPDATE tenant_subscriptions 
SET plan_id = 'PLAN-STARTER', current_user_count = 2, status = 'ACTIVE' 
WHERE tenant_id = '22222222-2222-2222-2222-222222222222';

-- 5. Cập nhật và Seed danh sách Users mẫu với mật khẩu BCrypt MibidSecure2026!
-- Hash chuẩn BCrypt 12 cho "MibidSecure2026!": $2a$12$LJ3et7vOJnTjVp5JDXjXke8YEjL8pZcxUHOOb7sXkGj6QaZrH0xKK

-- User 1: Quản trị viên EEMC
UPDATE users SET 
    username = 'admin.eemc',
    email = 'admin@eemc.mibid.vn',
    password_hash = '$2a$12$LJ3et7vOJnTjVp5JDXjXke8YEjL8pZcxUHOOb7sXkGj6QaZrH0xKK',
    full_name = 'Nguyễn Văn Hùng (EEMC Admin)',
    role = 'ADMIN',
    status = 'ACTIVE',
    department = 'Ban Điều Hành',
    position = 'Giám Đốc Đấu Thầu'
WHERE id = '11111111-1111-1111-1111-111111111101';

-- User 2: Chuyên viên Mua sắm EEMC
UPDATE users SET 
    username = 'sourcing.eemc',
    email = 'sourcing@eemc.mibid.vn',
    password_hash = '$2a$12$LJ3et7vOJnTjVp5JDXjXke8YEjL8pZcxUHOOb7sXkGj6QaZrH0xKK',
    full_name = 'Trần Thị Mai (EEMC Sourcing Lead)',
    role = 'BID_MANAGER',
    status = 'ACTIVE',
    department = 'Phòng Mua Sắm & Cung Ứng',
    position = 'Trưởng Nhóm Sourcing'
WHERE id = '11111111-1111-1111-1111-111111111102';

-- User 3: Quản trị viên PVN
INSERT INTO users (id, tenant_id, username, email, password_hash, full_name, role, status, department, position, is_active)
VALUES (
    '22222222-1111-1111-1111-111111111101',
    '22222222-2222-2222-2222-222222222222',
    'admin.pvn',
    'admin@pvn.mibid.vn',
    '$2a$12$LJ3et7vOJnTjVp5JDXjXke8YEjL8pZcxUHOOb7sXkGj6QaZrH0xKK',
    'Lê Hoàng Long (PVN Admin)',
    'ADMIN',
    'ACTIVE',
    'Ban Quản Lý Dự Án Điện',
    'Trưởng Ban Quản Lý',
    true
) ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    status = 'ACTIVE';

-- User 4: Chuyên viên Kỹ thuật PVN (PVN đủ 2 users = maxUsers của gói Starter!)
INSERT INTO users (id, tenant_id, username, email, password_hash, full_name, role, status, department, position, is_active)
VALUES (
    '22222222-1111-1111-1111-111111111102',
    '22222222-2222-2222-2222-222222222222',
    'tech.pvn',
    'tech@pvn.mibid.vn',
    '$2a$12$LJ3et7vOJnTjVp5JDXjXke8YEjL8pZcxUHOOb7sXkGj6QaZrH0xKK',
    'Phạm Quốc Tuấn (PVN Technical Lead)',
    'TECHNICAL_LEAD',
    'ACTIVE',
    'Phòng Kỹ Thuật Dự Án',
    'Kỹ Sư Trưởng',
    true
) ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    status = 'ACTIVE';

-- User 5: Super Admin Hệ Thống (Có quyền vào cả 2 Tenant EEMC và PVN)
INSERT INTO users (id, tenant_id, username, email, password_hash, full_name, role, status, department, position, is_active)
VALUES (
    '99999999-9999-9999-9999-999999999999',
    '11111111-1111-1111-1111-111111111111',
    'superadmin',
    'superadmin@mibid.vn',
    '$2a$12$LJ3et7vOJnTjVp5JDXjXke8YEjL8pZcxUHOOb7sXkGj6QaZrH0xKK',
    'Tổng Quản Trị Hệ Thống (Super Admin)',
    'ADMIN',
    'ACTIVE',
    'Khối Công Nghệ & Vận Hành',
    'Hệ Thống SaaS MIBID',
    true
) ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    status = 'ACTIVE';

-- 6. Phân quyền thành viên đa Tenant trong bảng tenant_members
INSERT INTO tenant_members (tenant_id, user_id, role, is_default) VALUES
    ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111101', 'ADMIN', true),
    ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111102', 'BID_MANAGER', true),
    ('11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 'ADMIN', true)
ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = EXCLUDED.role;

INSERT INTO tenant_members (tenant_id, user_id, role, is_default) VALUES
    ('22222222-2222-2222-2222-222222222222', '22222222-1111-1111-1111-111111111101', 'ADMIN', true),
    ('22222222-2222-2222-2222-222222222222', '22222222-1111-1111-1111-111111111102', 'TECHNICAL_LEAD', true),
    ('22222222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999999', 'ADMIN', false)
ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = EXCLUDED.role;
