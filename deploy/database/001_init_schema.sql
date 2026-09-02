-- ============================================================
-- MIBID - DATABASE SCHEMA (PostgreSQL 15+)
-- Hệ thống Quản lý Gói thầu và Hồ sơ thầu XNK
-- Version: 1.0.0
-- ============================================================
-- Quy ước:
--   • Mọi PK dùng UUID v4 (gen_random_uuid()).
--   • Mọi bảng có created_at / updated_at audit tự động.
--   • Tên bảng: snake_case số nhiều.  Tên cột: snake_case.
--   • FK cascade luôn đặt ở mức ON DELETE phù hợp nghiệp vụ.
--   • CHECK constraint bảo vệ ENUM ở tầng DB.
-- ============================================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PHÂN HỆ 0: GLOBAL SAAS (NO RLS)
-- ============================================================

CREATE TABLE saas_modules (
    code            VARCHAR(50)  PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE saas_features (
    code            VARCHAR(50)  PRIMARY KEY,
    module_code     VARCHAR(50)  NOT NULL,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    CONSTRAINT fk_sf_module FOREIGN KEY (module_code) REFERENCES saas_modules(code) ON DELETE CASCADE
);

CREATE TABLE subscription_plans (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    max_users       INT          NOT NULL DEFAULT 10,
    max_storage_gb  INT          NOT NULL DEFAULT 10,
    price           DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency        VARCHAR(10)  NOT NULL DEFAULT 'USD',
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE plan_features (
    plan_id         UUID         NOT NULL,
    feature_code    VARCHAR(50)  NOT NULL,
    PRIMARY KEY (plan_id, feature_code),
    CONSTRAINT fk_pf_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE,
    CONSTRAINT fk_pf_feature FOREIGN KEY (feature_code) REFERENCES saas_features(code) ON DELETE CASCADE
);

CREATE TABLE tenants (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    domain          VARCHAR(255),
    status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_domain UNIQUE (domain),
    CONSTRAINT chk_tenant_status CHECK (status IN ('ACTIVE','SUSPENDED','CANCELLED'))
);

CREATE TABLE tenant_subscriptions (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    plan_id         UUID         NOT NULL,
    start_date      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_date        TIMESTAMP WITH TIME ZONE,
    status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_ts_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_ts_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
    CONSTRAINT chk_ts_status CHECK (status IN ('ACTIVE','EXPIRED','CANCELLED'))
);

-- ============================================================
-- PHÂN HỆ 1: QUẢN TRỊ NỀN TẢNG (IAM + WORKFLOW + DMS)
-- ============================================================

-- -------------------------------------------------------
-- 1.0  roles & role_permissions – Vai trò nội bộ (Tenant-scoped)
-- -------------------------------------------------------
CREATE TABLE roles (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    is_system       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_roles_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT uq_roles_name UNIQUE (tenant_id, name)
);

CREATE TABLE role_permissions (
    role_id         UUID         NOT NULL,
    feature_code    VARCHAR(50)  NOT NULL,
    PRIMARY KEY (role_id, feature_code),
    CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_rp_feature FOREIGN KEY (feature_code) REFERENCES saas_features(code) ON DELETE CASCADE
);

-- -------------------------------------------------------
-- 1.1  users  –  Tài khoản hệ thống (Production-grade)
-- -------------------------------------------------------
CREATE TABLE users (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    email           VARCHAR(150) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(150) NOT NULL,
    phone           VARCHAR(20),
    avatar_url      VARCHAR(500),

    -- Tổ chức
    department      VARCHAR(100),                              -- Phòng ban (VD: Sourcing, Sales, Logistics)
    position        VARCHAR(100),                              -- Chức vụ (VD: Trưởng phòng, Nhân viên)
    employee_code   VARCHAR(50),                               -- Mã nhân viên nội bộ
    direct_manager_id UUID,                                    -- Quản lý trực tiếp (Cho luồng Escalation)

    -- Phân quyền
    role_id         UUID         NOT NULL,                     -- Phân quyền thông qua Role

    -- Bảo mật
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    is_2fa_enabled  BOOLEAN      NOT NULL DEFAULT FALSE,       -- Bật xác thực 2 bước
    two_fa_secret   VARCHAR(100),                              -- TOTP Secret
    password_changed_at TIMESTAMP WITH TIME ZONE,              -- Thời điểm đổi mật khẩu cuối
    failed_login_count INT       NOT NULL DEFAULT 0,           -- Đếm số lần đăng nhập sai liên tiếp
    locked_until    TIMESTAMP WITH TIME ZONE,                  -- Khóa TK đến thời điểm nào (Auto-lock sau 5 lần sai)
    last_login_at   TIMESTAMP WITH TIME ZONE,
    last_login_ip   INET,

    -- Preferences
    locale          VARCHAR(10)  NOT NULL DEFAULT 'vi',        -- Ngôn ngữ giao diện
    timezone        VARCHAR(50)  NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    email_notifications BOOLEAN  NOT NULL DEFAULT TRUE,        -- Nhận email thông báo?

    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_users_tenant      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_users_role        FOREIGN KEY (role_id) REFERENCES roles(id),
    CONSTRAINT uq_users_email       UNIQUE (tenant_id, email),
    CONSTRAINT fk_users_manager     FOREIGN KEY (direct_manager_id) REFERENCES users(id)
);

CREATE INDEX idx_users_email       ON users (tenant_id, email);
CREATE INDEX idx_users_role_id     ON users (role_id);
CREATE INDEX idx_users_department  ON users (department);
CREATE INDEX idx_users_manager     ON users (direct_manager_id) WHERE direct_manager_id IS NOT NULL;

COMMENT ON TABLE  users IS 'Tài khoản hệ thống Mibid. Hỗ trợ 2FA, Auto-lock, Escalation qua direct_manager_id';
COMMENT ON COLUMN users.failed_login_count IS 'Sau 5 lần sai, locked_until = NOW() + 30 phút. Reset về 0 khi login thành công';

-- -------------------------------------------------------
-- 1.2  workflows  –  Định nghĩa Luồng công việc
-- -------------------------------------------------------
CREATE TABLE workflows (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_by      UUID         NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_workflows_tenant  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_workflows_creator FOREIGN KEY (created_by) REFERENCES users(id)
);

COMMENT ON TABLE workflows IS 'Mỗi record là một Template Luồng công việc (VD: Luồng XNK Thép, Luồng XNK Nông sản)';

-- -------------------------------------------------------
-- 1.3  workflow_versions  –  Quản lý phiên bản Luồng
-- -------------------------------------------------------
-- Khi Admin sửa Workflow đang có Dự án chạy, hệ thống tạo Version mới.
-- Dự án cũ tiếp tục chạy trên Version cũ, Dự án mới dùng Version mới.
CREATE TABLE workflow_versions (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    workflow_id     UUID         NOT NULL,
    version_number  INT          NOT NULL,
    version_label   VARCHAR(50),                                   -- VD: "v1.0", "v2.0-hotfix"
    status          VARCHAR(20)  NOT NULL DEFAULT 'DRAFT',
    change_log      TEXT,                                          -- Ghi chú thay đổi
    published_at    TIMESTAMP WITH TIME ZONE,
    published_by    UUID,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_wv_tenant      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_wv_workflow    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
    CONSTRAINT fk_wv_publisher   FOREIGN KEY (published_by) REFERENCES users(id),
    CONSTRAINT uq_wv_version     UNIQUE (tenant_id, workflow_id, version_number),
    CONSTRAINT chk_wv_status     CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED','DEPRECATED'))
);

CREATE INDEX idx_wv_workflow ON workflow_versions (workflow_id);

COMMENT ON TABLE  workflow_versions IS 'Versioning: Sửa workflow không ảnh hưởng dự án đang chạy trên version cũ';

-- -------------------------------------------------------
-- 1.4  workflow_stages  –  Các bước trong Luồng (Production-grade)
-- -------------------------------------------------------
CREATE TABLE workflow_stages (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    workflow_id     UUID         NOT NULL,
    version_id      UUID,                                          -- Thuộc phiên bản nào
    code            VARCHAR(50)  NOT NULL,                         -- Mã định danh bước (VD: PREPARING, SOURCING)
    name            VARCHAR(100) NOT NULL,                         -- Tên hiển thị
    description     TEXT,
    sequence        INT          NOT NULL,

    -- Loại bước
    stage_type      VARCHAR(20)  NOT NULL DEFAULT 'MANUAL',        -- Loại xử lý

    -- Giao diện
    color           VARCHAR(20)  DEFAULT '#3B82F6',                -- Mã màu HEX hiển thị trên Kanban
    icon            VARCHAR(50),                                   -- Icon class (VD: "folder", "truck")

    -- SLA & Thời hạn
    sla_days        INT,                                           -- Thời gian tối đa được nằm ở bước này (Ngày)
    sla_warning_days INT,                                          -- Số ngày trước khi hết SLA sẽ cảnh báo vàng
    sla_action      VARCHAR(30)  DEFAULT 'WARN',                   -- Hành động khi quá SLA

    -- Cấu hình xử lý
    is_initial      BOOLEAN      NOT NULL DEFAULT FALSE,           -- Có phải bước khởi tạo ban đầu?
    is_terminal     BOOLEAN      NOT NULL DEFAULT FALSE,           -- Có phải bước kết thúc? (WON, LOST)
    terminal_type   VARCHAR(20),                                   -- Nếu is_terminal: 'SUCCESS' hoặc 'FAILURE'
    allow_skip      BOOLEAN      NOT NULL DEFAULT FALSE,           -- Có cho phép bỏ qua bước này?
    allow_return    BOOLEAN      NOT NULL DEFAULT TRUE,            -- Có cho phép quay lại bước trước?
    require_all_tasks BOOLEAN    NOT NULL DEFAULT FALSE,           -- Bắt buộc hoàn thành 100% Tasks mới đi tiếp?
    require_approval BOOLEAN     NOT NULL DEFAULT FALSE,           -- Cần Manager duyệt mới được chuyển bước?
    approval_role   VARCHAR(30),                                   -- Role nào được duyệt (VD: OWNER)

    -- Tự động
    auto_assign_role VARCHAR(30),                                  -- Role tự động gán xử lý khi vào bước
    on_enter_webhook VARCHAR(500),                                 -- URL Webhook gọi khi vào bước (Tích hợp bên ngoài)
    on_exit_webhook  VARCHAR(500),                                 -- URL Webhook gọi khi rời bước

    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_wfstages_tenant   FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_wfstages_workflow FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
    CONSTRAINT fk_wfstages_version  FOREIGN KEY (version_id)  REFERENCES workflow_versions(id),
    CONSTRAINT uq_wfstages_seq     UNIQUE (tenant_id, workflow_id, version_id, sequence),
    CONSTRAINT uq_wfstages_code    UNIQUE (tenant_id, workflow_id, version_id, code),
    CONSTRAINT chk_wfs_type        CHECK (stage_type IN ('MANUAL','AUTOMATIC','APPROVAL','PARALLEL','MILESTONE')),
    CONSTRAINT chk_wfs_sla_action  CHECK (sla_action IN ('WARN','ESCALATE','AUTO_MOVE','BLOCK')),
    CONSTRAINT chk_wfs_terminal    CHECK (terminal_type IS NULL OR terminal_type IN ('SUCCESS','FAILURE'))
);

CREATE INDEX idx_wfstages_workflow ON workflow_stages (workflow_id);
CREATE INDEX idx_wfstages_version  ON workflow_stages (version_id);

COMMENT ON TABLE  workflow_stages IS 'Định nghĩa bước trong Workflow. Hỗ trợ SLA, Auto-assign, Approval gate, Webhook integration';
COMMENT ON COLUMN workflow_stages.stage_type IS 'MANUAL = User kéo thẻ. AUTOMATIC = Tự chuyển khi đủ điều kiện. APPROVAL = Cần duyệt. MILESTONE = Mốc đánh dấu';
COMMENT ON COLUMN workflow_stages.sla_action IS 'WARN = Cảnh báo vàng. ESCALATE = Gửi lên Manager. AUTO_MOVE = Tự chuyển bước. BLOCK = Khóa dự án';

-- -------------------------------------------------------
-- 1.5  workflow_transitions  –  Đồ thị Chuyển bước (Transition Graph)
-- -------------------------------------------------------
-- Thay vì chỉ cho phép chuyển tuần tự (1→2→3), bảng này cho phép
-- cấu hình bất kỳ cung nào trong đồ thị (VD: 3→1 quay lại, 2→4 bỏ qua).
CREATE TABLE workflow_transitions (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    workflow_id     UUID         NOT NULL,
    version_id      UUID,
    from_stage_id   UUID         NOT NULL,                         -- Bước gốc
    to_stage_id     UUID         NOT NULL,                         -- Bước đích
    name            VARCHAR(100),                                  -- Tên hành động (VD: "Chuyển sang Sourcing")
    description     TEXT,

    -- Điều kiện chuyển
    condition_type  VARCHAR(30)  NOT NULL DEFAULT 'NONE',          -- Loại điều kiện
    condition_config JSONB,                                        -- Cấu hình điều kiện động

    -- Quyền & Xác nhận
    allowed_roles   TEXT[],                                        -- Mảng roles được phép (VD: '{OWNER,SOURCING_LEAD}')
    requires_confirmation BOOLEAN NOT NULL DEFAULT TRUE,           -- Hiển thị popup xác nhận?
    requires_comment BOOLEAN     NOT NULL DEFAULT FALSE,           -- Bắt buộc nhập lý do?

    -- Gatekeeper tài liệu (Kế thừa từ stage_doc_rules nhưng gắn vào Transition)
    check_documents BOOLEAN      NOT NULL DEFAULT FALSE,           -- Có kiểm tra tài liệu không?
    check_tasks     BOOLEAN      NOT NULL DEFAULT FALSE,           -- Có kiểm tra tasks hoàn thành không?

    -- Auto-actions khi chuyển
    auto_actions    JSONB,                                         -- Mảng hành động tự động

    sort_order      INT          NOT NULL DEFAULT 0,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_wt_tenant      FOREIGN KEY (tenant_id)    REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_wt_workflow    FOREIGN KEY (workflow_id)  REFERENCES workflows(id) ON DELETE CASCADE,
    CONSTRAINT fk_wt_version     FOREIGN KEY (version_id)   REFERENCES workflow_versions(id),
    CONSTRAINT fk_wt_from        FOREIGN KEY (from_stage_id) REFERENCES workflow_stages(id) ON DELETE CASCADE,
    CONSTRAINT fk_wt_to          FOREIGN KEY (to_stage_id)   REFERENCES workflow_stages(id) ON DELETE CASCADE,
    CONSTRAINT uq_wt_from_to     UNIQUE (tenant_id, workflow_id, version_id, from_stage_id, to_stage_id),
    CONSTRAINT chk_wt_cond       CHECK (condition_type IN ('NONE','ALL_DOCS','ALL_TASKS','CUSTOM_RULE','APPROVAL_GRANTED','AND','OR')),
    CONSTRAINT chk_wt_no_self    CHECK (from_stage_id != to_stage_id)
);

CREATE INDEX idx_wt_workflow ON workflow_transitions (workflow_id);
CREATE INDEX idx_wt_from     ON workflow_transitions (from_stage_id);
CREATE INDEX idx_wt_to       ON workflow_transitions (to_stage_id);

COMMENT ON TABLE  workflow_transitions IS 'Đồ thị chuyển bước: Cung (Edge) nối 2 Stage. Cho phép cấu hình phi tuyến tính (VD: quay lại, bỏ qua)';
COMMENT ON COLUMN workflow_transitions.condition_config IS 'JSONB cấu hình điều kiện. VD: {"min_task_completion_pct": 80, "required_doc_types": ["uuid1","uuid2"]}';
COMMENT ON COLUMN workflow_transitions.auto_actions IS 'JSONB mảng hành động tự động. VD: [{"type":"SEND_EMAIL","template":"rfq_closed"},{"type":"CREATE_TASK","title":"Kiểm tra HĐ"}]';

-- -------------------------------------------------------
-- 1.6  doc_types  –  Danh mục Loại tài liệu
-- -------------------------------------------------------
CREATE TABLE doc_types (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(50),                                   -- Mã rút gọn (VD: CONTRACT, BL, CO)
    description     TEXT,
    category        VARCHAR(50),                                   -- Nhóm phân loại (VD: "Thương mại", "Vận tải", "Pháp lý")
    allowed_extensions TEXT[]    DEFAULT '{pdf,docx,xlsx,jpg,png}', -- Định dạng file cho phép
    max_file_size_mb INT         DEFAULT 20,                       -- Dung lượng tối đa (MB)
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    sort_order      INT          NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_doc_types_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT uq_doc_types_name UNIQUE (tenant_id, name)
);

COMMENT ON TABLE doc_types IS 'Danh mục loại tài liệu XNK: Có cấu hình file extension cho phép và dung lượng tối đa';

-- -------------------------------------------------------
-- 1.7  stage_doc_rules  –  Cấu hình Gatekeeper Tài liệu
-- -------------------------------------------------------
CREATE TABLE stage_doc_rules (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID         NOT NULL,
    stage_id            UUID         NOT NULL,
    doc_type_id         UUID         NOT NULL,
    requires_approval   BOOLEAN      NOT NULL DEFAULT FALSE,       -- Tài liệu phải status = APPROVED?
    is_hard_stop        BOOLEAN      NOT NULL DEFAULT TRUE,        -- TRUE = Chặn cứng, FALSE = Cảnh báo mềm
    min_version         INT          DEFAULT 1,                    -- Phiên bản tối thiểu (VD: V2 mới được)
    max_age_days        INT,                                       -- Tài liệu không được cũ quá X ngày
    description         TEXT,                                      -- Mô tả yêu cầu
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_sdr_tenant    FOREIGN KEY (tenant_id)   REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_sdr_stage     FOREIGN KEY (stage_id)    REFERENCES workflow_stages(id) ON DELETE CASCADE,
    CONSTRAINT fk_sdr_doc_type  FOREIGN KEY (doc_type_id) REFERENCES doc_types(id)       ON DELETE CASCADE,
    CONSTRAINT uq_sdr_stage_doc UNIQUE (tenant_id, stage_id, doc_type_id)
);

COMMENT ON TABLE  stage_doc_rules IS 'Gatekeeper Rule gắn vào Stage: Để vào bước X phải có tài liệu loại Y với điều kiện Z';
COMMENT ON COLUMN stage_doc_rules.max_age_days IS 'Tài liệu phải mới. VD: CO không được cũ quá 90 ngày kể từ ngày upload';

-- -------------------------------------------------------
-- 1.8  stage_checklist_items  –  Danh sách kiểm tra (Dynamic Checklist)
-- -------------------------------------------------------
-- Ngoài tài liệu (stage_doc_rules), một bước có thể yêu cầu hoàn thành
-- danh sách kiểm tra (checklist) trước khi đi tiếp.
CREATE TABLE stage_checklist_items (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    stage_id        UUID         NOT NULL,
    title           VARCHAR(255) NOT NULL,                         -- VD: "Đã xác nhận giá với Vendor qua điện thoại"
    description     TEXT,
    is_required     BOOLEAN      NOT NULL DEFAULT TRUE,            -- Bắt buộc tick hay tùy chọn
    sort_order      INT          NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_sci_tenant    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_sci_stage     FOREIGN KEY (stage_id) REFERENCES workflow_stages(id) ON DELETE CASCADE
);

CREATE INDEX idx_sci_stage ON stage_checklist_items (stage_id);

COMMENT ON TABLE stage_checklist_items IS 'Checklist cấu hình theo Stage. User phải tick hết items required mới được chuyển bước';

-- -------------------------------------------------------
-- 1.9  stage_notifications  –  Cấu hình Thông báo theo Bước
-- -------------------------------------------------------
CREATE TABLE stage_notifications (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    stage_id        UUID         NOT NULL,
    event_type      VARCHAR(30)  NOT NULL,                         -- Sự kiện kích hoạt
    target_role     VARCHAR(30)  NOT NULL,                         -- Gửi cho Role nào
    channel         VARCHAR(20)  NOT NULL DEFAULT 'BOTH',          -- Kênh gửi
    subject_template VARCHAR(255),                                 -- Template tiêu đề
    body_template   TEXT,                                          -- Template nội dung (Có biến {{project_name}})
    delay_minutes   INT          NOT NULL DEFAULT 0,               -- Gửi trễ bao nhiêu phút (0 = ngay lập tức)
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_sn_tenant     FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_sn_stage      FOREIGN KEY (stage_id) REFERENCES workflow_stages(id) ON DELETE CASCADE,
    CONSTRAINT chk_sn_event     CHECK (event_type IN ('ON_ENTER','ON_EXIT','SLA_WARNING','SLA_BREACH','TASK_OVERDUE','DOC_UPLOADED','DOC_REJECTED')),
    CONSTRAINT chk_sn_channel   CHECK (channel IN ('IN_APP','EMAIL','BOTH'))
);

CREATE INDEX idx_sn_stage ON stage_notifications (stage_id);

COMMENT ON TABLE stage_notifications IS 'Cấu hình thông báo tự động: Khi vào bước X, gửi email cho Role Y với nội dung Template Z';

-- -------------------------------------------------------
-- 1.10  projects  –  Dự án / Gói thầu
-- -------------------------------------------------------
CREATE TABLE projects (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         UUID         NOT NULL,
    project_code      VARCHAR(50)  NOT NULL,
    name              VARCHAR(255) NOT NULL,
    description       TEXT,
    investor_name     VARCHAR(255),
    tender_type       VARCHAR(50)  DEFAULT 'TENANT_PARTICIPATING',
    estimated_budget  NUMERIC(18,2) DEFAULT 0,
    currency          VARCHAR(8)   DEFAULT 'VND',
    workflow_id       UUID,
    workflow_version_id UUID,                                      -- Dự án ghim vào version nào
    current_stage_id  UUID,
    stage_enum        VARCHAR(50)  DEFAULT 'STAGE_PREPARATION',
    stage_entered_at  TIMESTAMP WITH TIME ZONE,                    -- Thời điểm vào bước hiện tại (Tính SLA)
    bid_submission_deadline TIMESTAMP WITH TIME ZONE,
    manager_id        UUID,
    manager_name      VARCHAR(150),
    completed_tasks   INT          DEFAULT 0,
    total_tasks       INT          DEFAULT 0,
    status            VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_by        UUID,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_projects_tenant     FOREIGN KEY (tenant_id)           REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT uq_projects_code       UNIQUE (tenant_id, project_code),
    CONSTRAINT fk_projects_workflow   FOREIGN KEY (workflow_id)         REFERENCES workflows(id),
    CONSTRAINT fk_projects_wf_version FOREIGN KEY (workflow_version_id) REFERENCES workflow_versions(id),
    CONSTRAINT fk_projects_stage      FOREIGN KEY (current_stage_id)    REFERENCES workflow_stages(id),
    CONSTRAINT fk_projects_creator    FOREIGN KEY (created_by)          REFERENCES users(id)
);

CREATE INDEX idx_projects_workflow ON projects (workflow_id);
CREATE INDEX idx_projects_status   ON projects (status);
CREATE INDEX idx_projects_stage    ON projects (current_stage_id);

COMMENT ON TABLE  projects IS 'Dự án đấu thầu XNK. Ghim vào workflow_version_id cụ thể, không bị ảnh hưởng khi Admin sửa Workflow';
COMMENT ON COLUMN projects.stage_entered_at IS 'Thời điểm chuyển vào bước hiện tại. Dùng để tính SLA = NOW() - stage_entered_at';

-- -------------------------------------------------------
-- 1.11  project_checklist_status  –  Trạng thái Checklist theo Dự án
-- -------------------------------------------------------
CREATE TABLE project_checklist_status (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    project_id      UUID         NOT NULL,
    checklist_item_id UUID       NOT NULL,
    is_checked      BOOLEAN      NOT NULL DEFAULT FALSE,
    checked_by      UUID,
    checked_at      TIMESTAMP WITH TIME ZONE,

    notes           TEXT,

    CONSTRAINT fk_pcs_project   FOREIGN KEY (project_id)       REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_pcs_item      FOREIGN KEY (checklist_item_id) REFERENCES stage_checklist_items(id) ON DELETE CASCADE,
    CONSTRAINT fk_pcs_user      FOREIGN KEY (checked_by)       REFERENCES users(id),
    CONSTRAINT uq_pcs_proj_item UNIQUE (project_id, checklist_item_id)
);

CREATE INDEX idx_pcs_project ON project_checklist_status (project_id);

COMMENT ON TABLE project_checklist_status IS 'Ghi nhận trạng thái tick/untick checklist cho từng Dự án cụ thể';

-- -------------------------------------------------------
-- 1.12  project_members  –  Gán User vào Dự án (ABAC)
-- -------------------------------------------------------
CREATE TABLE project_members (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    project_id      UUID         NOT NULL,
    user_id         UUID         NOT NULL,
    project_role    VARCHAR(30)  NOT NULL,
    is_primary      BOOLEAN      NOT NULL DEFAULT FALSE,       -- Người chịu trách nhiệm chính cho Role này
    can_edit        BOOLEAN      NOT NULL DEFAULT TRUE,        -- Được phép sửa dữ liệu Dự án
    can_approve     BOOLEAN      NOT NULL DEFAULT FALSE,       -- Được phép duyệt tài liệu/báo giá
    can_transition  BOOLEAN      NOT NULL DEFAULT FALSE,       -- Được phép kéo thẻ Kanban
    notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,       -- Nhận thông báo Dự án này?
    joined_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    removed_at      TIMESTAMP WITH TIME ZONE,                  -- NULL = đang hoạt động
    added_by        UUID,

    CONSTRAINT fk_pm_tenant      FOREIGN KEY (tenant_id)  REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_pm_project     FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_pm_user        FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT fk_pm_added_by    FOREIGN KEY (added_by)   REFERENCES users(id),
    CONSTRAINT uq_pm_project_user UNIQUE (tenant_id, project_id, user_id),
    CONSTRAINT chk_pm_role       CHECK (project_role IN ('OWNER','SOURCING_LEAD','SALES_EXEC','LOGISTICS_EXEC','FINANCE','QC','MEMBER'))
);

CREATE INDEX idx_pm_project ON project_members (project_id);
CREATE INDEX idx_pm_user    ON project_members (user_id);
CREATE INDEX idx_pm_active  ON project_members (project_id) WHERE removed_at IS NULL;

COMMENT ON TABLE  project_members IS 'ABAC: Gán User vào Dự án kèm quyền hành động cụ thể (edit/approve/transition)';

-- -------------------------------------------------------
-- 1.13  project_documents  –  Kho Tài liệu DMS (Production-grade)
-- -------------------------------------------------------
CREATE TABLE project_documents (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    project_id      UUID         NOT NULL,
    doc_type_id     UUID         NOT NULL,
    parent_id       UUID,                                      -- Tham chiếu bản trước (Version chain)

    -- File info
    file_name       VARCHAR(255) NOT NULL,
    original_name   VARCHAR(255),                              -- Tên gốc từ máy User
    file_url        VARCHAR(500) NOT NULL,                     -- S3 / Cloud Storage URL
    file_size_bytes BIGINT       NOT NULL DEFAULT 0,
    mime_type       VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
    checksum_sha256 VARCHAR(64),                               -- Hash kiểm tra toàn vẹn file
    version         INT          NOT NULL DEFAULT 1,

    -- Metadata
    document_date   DATE,                                      -- Ngày trên tài liệu (VD: Ngày ký HĐ)
    expiry_date     DATE,                                      -- Ngày hết hiệu lực
    reference_number VARCHAR(100),                              -- Số hiệu tài liệu (VD: HĐ-2026-001)
    tags            TEXT[],                                    -- Tags phân loại tự do
    description     TEXT,

    -- Quy trình Phê duyệt
    status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    uploaded_by     UUID         NOT NULL,
    reviewed_by     UUID,
    reviewed_at     TIMESTAMP WITH TIME ZONE,
    review_comment  TEXT,
    rejection_count INT          NOT NULL DEFAULT 0,           -- Số lần bị từ chối (Tracking chất lượng)

    -- Truy cập
    is_confidential BOOLEAN      NOT NULL DEFAULT FALSE,       -- Tài liệu mật (Chỉ OWNER xem)
    download_count  INT          NOT NULL DEFAULT 0,

    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_pd_tenant     FOREIGN KEY (tenant_id)   REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_pd_project    FOREIGN KEY (project_id)  REFERENCES projects(id)  ON DELETE CASCADE,
    CONSTRAINT fk_pd_doc_type   FOREIGN KEY (doc_type_id) REFERENCES doc_types(id),
    CONSTRAINT fk_pd_parent     FOREIGN KEY (parent_id)   REFERENCES project_documents(id),
    CONSTRAINT fk_pd_uploader   FOREIGN KEY (uploaded_by) REFERENCES users(id),
    CONSTRAINT fk_pd_reviewer   FOREIGN KEY (reviewed_by) REFERENCES users(id),
    CONSTRAINT chk_pd_status    CHECK (status IN ('PENDING','APPROVED','REJECTED','SUPERSEDED','EXPIRED'))
);

CREATE INDEX idx_pd_project     ON project_documents (project_id);
CREATE INDEX idx_pd_status      ON project_documents (status);
CREATE INDEX idx_pd_doc_type    ON project_documents (doc_type_id);
CREATE INDEX idx_pd_expiry      ON project_documents (expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_pd_parent      ON project_documents (parent_id)   WHERE parent_id IS NOT NULL;

COMMENT ON TABLE  project_documents IS 'DMS: Quản lý tài liệu với version chain, hạn hiệu lực, mật, và hash toàn vẹn';
COMMENT ON COLUMN project_documents.parent_id IS 'Khi upload lại bản mới, bản cũ chuyển SUPERSEDED, bản mới trỏ parent_id về bản cũ';

-- -------------------------------------------------------
-- 1.14  document_audit_logs  –  Lịch sử Phê duyệt (Production-grade)
-- -------------------------------------------------------
CREATE TABLE document_audit_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    document_id     UUID         NOT NULL,
    action          VARCHAR(20)  NOT NULL,
    old_status      VARCHAR(20),                               -- Trạng thái trước
    new_status      VARCHAR(20),                               -- Trạng thái sau
    performed_by    UUID         NOT NULL,
    comment         TEXT,
    ip_address      INET,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_dal_tenant    FOREIGN KEY (tenant_id)    REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_dal_doc       FOREIGN KEY (document_id)  REFERENCES project_documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_dal_user      FOREIGN KEY (performed_by) REFERENCES users(id),
    CONSTRAINT chk_dal_action   CHECK (action IN ('UPLOADED','APPROVED','REJECTED','RE_UPLOADED','SUPERSEDED','DOWNLOADED','EXPIRED'))
);

CREATE INDEX idx_dal_document ON document_audit_logs (document_id);
CREATE INDEX idx_dal_created  ON document_audit_logs (created_at DESC);

COMMENT ON TABLE document_audit_logs IS 'Full audit trail: Ghi lại old/new status, IP, comment cho mọi hành động trên tài liệu';

-- -------------------------------------------------------
-- 1.15  project_transition_logs  –  Log chuyển bước Kanban (Production-grade)
-- -------------------------------------------------------
CREATE TABLE project_transition_logs (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         UUID         NOT NULL,
    project_id        UUID         NOT NULL,
    transition_id     UUID,                                    -- Tham chiếu workflow_transitions (cung nào)
    from_stage_id     UUID,
    to_stage_id       UUID         NOT NULL,
    transitioned_by   UUID         NOT NULL,

    -- Context
    is_forced         BOOLEAN      NOT NULL DEFAULT FALSE,     -- User bấm Force qua Soft Stop
    comment           TEXT,                                    -- Lý do chuyển bước (nếu requires_comment)
    duration_hours    DECIMAL(10,2),                           -- Số giờ đã nằm ở bước cũ (Auto-calculate)
    blocked_reasons   JSONB,                                   -- Nếu bị chặn, lưu danh sách lý do
    checklist_snapshot JSONB,                                  -- Snapshot checklist tại thời điểm chuyển
    doc_compliance    JSONB,                                   -- Snapshot compliance tài liệu

    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_ptl_tenant     FOREIGN KEY (tenant_id)       REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_ptl_project    FOREIGN KEY (project_id)      REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_ptl_transition FOREIGN KEY (transition_id)   REFERENCES workflow_transitions(id),
    CONSTRAINT fk_ptl_from       FOREIGN KEY (from_stage_id)   REFERENCES workflow_stages(id),
    CONSTRAINT fk_ptl_to         FOREIGN KEY (to_stage_id)     REFERENCES workflow_stages(id),
    CONSTRAINT fk_ptl_user       FOREIGN KEY (transitioned_by) REFERENCES users(id)
);

CREATE INDEX idx_ptl_project    ON project_transition_logs (project_id);
CREATE INDEX idx_ptl_created    ON project_transition_logs (created_at);
CREATE INDEX idx_ptl_stages     ON project_transition_logs (from_stage_id, to_stage_id);

COMMENT ON TABLE  project_transition_logs IS 'Full audit mỗi lần kéo thẻ: duration, snapshot checklist, doc compliance. Dùng cho Dashboard Cycle Time';

-- -------------------------------------------------------
-- 1.16  project_comments  –  Bình luận / Trao đổi trong Dự án
-- -------------------------------------------------------
CREATE TABLE project_comments (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    project_id      UUID         NOT NULL,
    parent_id       UUID,                                      -- Reply thread
    author_id       UUID         NOT NULL,
    content         TEXT         NOT NULL,
    attachment_urls  TEXT[],
    is_internal     BOOLEAN      NOT NULL DEFAULT TRUE,        -- TRUE = Chỉ nội bộ, FALSE = Vendor cũng thấy
    is_edited       BOOLEAN      NOT NULL DEFAULT FALSE,
    edited_at       TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_pc_tenant     FOREIGN KEY (tenant_id)  REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_pc_project    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_pc_parent     FOREIGN KEY (parent_id)  REFERENCES project_comments(id),
    CONSTRAINT fk_pc_author     FOREIGN KEY (author_id)  REFERENCES users(id)
);

CREATE INDEX idx_pc_project ON project_comments (project_id);
CREATE INDEX idx_pc_created ON project_comments (created_at DESC);

COMMENT ON TABLE project_comments IS 'Hệ thống bình luận / trao đổi nội bộ trong Dự án. Hỗ trợ Reply thread';

-- ============================================================
-- PHÂN HỆ 2: SOURCING & MAGIC LINK
-- ============================================================

-- -------------------------------------------------------
-- 2.1  rfqs  –  Yêu cầu Báo giá (Production-grade)
-- -------------------------------------------------------
CREATE TABLE rfqs (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID         NOT NULL,
    project_id          UUID         NOT NULL,
    rfq_code            VARCHAR(50)  NOT NULL,
    title               VARCHAR(255) NOT NULL,
    description         TEXT,

    -- Điều khoản Thương mại
    incoterms           VARCHAR(10)  NOT NULL,
    currency            VARCHAR(10)  NOT NULL DEFAULT 'USD',
    payment_terms       VARCHAR(100),                              -- VD: "T/T 30% deposit, 70% before shipment"
    shipping_method     VARCHAR(30)  NOT NULL DEFAULT 'SEA',       -- Phương thức vận chuyển

    -- Thời hạn
    deadline            TIMESTAMP WITH TIME ZONE NOT NULL,         -- Hạn chót nộp báo giá
    required_delivery_date DATE,                                   -- Ngày mong muốn nhận hàng
    quote_validity_days INT          NOT NULL DEFAULT 30,           -- Báo giá có hiệu lực bao nhiêu ngày

    -- Nơi giao / nhận
    delivery_port       VARCHAR(200),                              -- Cảng đích (VD: "Cát Lái, HCM")
    delivery_address    TEXT,                                      -- Địa chỉ giao hàng cuối
    origin_country      VARCHAR(100),                              -- Nước xuất xứ yêu cầu (VD: Trung Quốc)

    -- Yêu cầu đặc biệt
    requires_sample     BOOLEAN      NOT NULL DEFAULT FALSE,       -- Có yêu cầu gửi mẫu trước không
    requires_factory_audit BOOLEAN   NOT NULL DEFAULT FALSE,       -- Có yêu cầu kiểm nhà máy không
    special_requirements TEXT,                                      -- Yêu cầu đặc thù (Chứng nhận ISO, Halal...)

    -- Ngân sách & Đánh giá
    budget_amount       DECIMAL(15,2),                             -- Ngân sách dự kiến (Nội bộ, Vendor không thấy)
    evaluation_method   VARCHAR(30)  NOT NULL DEFAULT 'LOWEST_PRICE', -- Phương pháp đánh giá
    rfq_round           INT          NOT NULL DEFAULT 1,           -- Vòng đấu giá thứ mấy (Multi-round)
    parent_rfq_id       UUID,                                      -- FK tự tham chiếu nếu là RFQ vòng 2+

    -- Trạng thái & Audit
    status              VARCHAR(20)  NOT NULL DEFAULT 'DRAFT',
    published_at        TIMESTAMP WITH TIME ZONE,                  -- Thời điểm Publish
    closed_at           TIMESTAMP WITH TIME ZONE,                  -- Thời điểm đóng RFQ
    closed_reason       TEXT,                                      -- Lý do đóng sớm
    created_by          UUID         NOT NULL,
    approved_by         UUID,                                      -- Ai duyệt để Publish (Nội bộ)
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_rfqs_tenant     FOREIGN KEY (tenant_id)    REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT uq_rfqs_code       UNIQUE (tenant_id, rfq_code),
    CONSTRAINT fk_rfqs_project    FOREIGN KEY (project_id)    REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_rfqs_creator    FOREIGN KEY (created_by)    REFERENCES users(id),
    CONSTRAINT fk_rfqs_approver   FOREIGN KEY (approved_by)   REFERENCES users(id),
    CONSTRAINT fk_rfqs_parent     FOREIGN KEY (parent_rfq_id) REFERENCES rfqs(id),
    CONSTRAINT chk_rfqs_status    CHECK (status IN ('DRAFT','PENDING_APPROVAL','PUBLISHED','EVALUATING','CLOSED','CANCELLED')),
    CONSTRAINT chk_rfqs_inco      CHECK (incoterms IN ('FOB','CIF','EXW','CFR','CIP','DDP','DAP','FCA','CPT','FAS')),
    CONSTRAINT chk_rfqs_ship      CHECK (shipping_method IN ('SEA','AIR','RAIL','ROAD','MULTIMODAL','EXPRESS')),
    CONSTRAINT chk_rfqs_eval      CHECK (evaluation_method IN ('LOWEST_PRICE','BEST_VALUE','WEIGHTED_SCORE','NEGOTIATION'))
);

CREATE INDEX idx_rfqs_project    ON rfqs (project_id);
CREATE INDEX idx_rfqs_status     ON rfqs (status);
CREATE INDEX idx_rfqs_deadline   ON rfqs (deadline);
CREATE INDEX idx_rfqs_parent     ON rfqs (parent_rfq_id) WHERE parent_rfq_id IS NOT NULL;

COMMENT ON TABLE  rfqs IS 'Yêu cầu Báo giá chuẩn XNK. Hỗ trợ Multi-round bidding, Multiple evaluation methods';
COMMENT ON COLUMN rfqs.budget_amount IS 'Chỉ hiển thị nội bộ. Vendor KHÔNG được phép thấy trường này';
COMMENT ON COLUMN rfqs.evaluation_method IS 'LOWEST_PRICE = Giá thấp nhất thắng. WEIGHTED_SCORE = Chấm điểm đa tiêu chí';

-- -------------------------------------------------------
-- 2.2  rfq_evaluation_criteria  –  Tiêu chí chấm điểm
-- -------------------------------------------------------
CREATE TABLE rfq_evaluation_criteria (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    rfq_id          UUID         NOT NULL,
    name            VARCHAR(100) NOT NULL,                         -- VD: "Giá", "Thời gian giao hàng", "Chất lượng"
    weight_pct      DECIMAL(5,2) NOT NULL,                         -- Trọng số % (VD: 40.00)
    description     TEXT,
    sort_order      INT          NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_rec_tenant    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_rec_rfq       FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE,
    CONSTRAINT chk_rec_weight   CHECK (weight_pct >= 0 AND weight_pct <= 100)
);

CREATE INDEX idx_rec_rfq ON rfq_evaluation_criteria (rfq_id);

COMMENT ON TABLE rfq_evaluation_criteria IS 'Bảng tiêu chí khi evaluation_method = WEIGHTED_SCORE. Tổng weight_pct = 100%';

-- -------------------------------------------------------
-- 2.3  rfq_line_items  –  Hàng hóa cần mua (Production-grade)
-- -------------------------------------------------------
CREATE TABLE rfq_line_items (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID         NOT NULL,
    rfq_id              UUID         NOT NULL,

    -- Thông tin Mặt hàng
    item_code           VARCHAR(50),                               -- Mã nội bộ (SKU)
    hs_code             VARCHAR(20),                               -- Mã HS Code (Hải quan, VD: 7208.51)
    description         TEXT         NOT NULL,                     -- Mô tả hàng hóa chi tiết
    brand_manufacturer  VARCHAR(200),                              -- Thương hiệu / Nhà sản xuất yêu cầu
    model_number        VARCHAR(100),                              -- Mã Model / Part Number
    origin_country      VARCHAR(100),                              -- Nước xuất xứ yêu cầu

    -- Số lượng & Đơn vị
    quantity            DECIMAL(12,2) NOT NULL,                    -- Số lượng yêu cầu mua
    uom                 VARCHAR(20)  NOT NULL,                     -- Đơn vị tính
    min_order_qty       DECIMAL(12,2),                             -- Số lượng đặt tối thiểu chấp nhận
    max_order_qty       DECIMAL(12,2),                             -- Số lượng đặt tối đa chấp nhận

    -- Quy cách & Tiêu chuẩn
    specifications      TEXT,                                      -- Thông số kỹ thuật chi tiết
    quality_standard    VARCHAR(100),                              -- Tiêu chuẩn chất lượng (ISO 9001, JIS, ASTM...)
    packaging_req       TEXT,                                      -- Yêu cầu đóng gói
    certification_req   TEXT,                                      -- Chứng nhận yêu cầu (CE, FDA, Halal...)

    -- Mẫu
    sample_required     BOOLEAN      NOT NULL DEFAULT FALSE,       -- Có cần gửi mẫu?
    sample_qty          INT,                                       -- Số lượng mẫu cần gửi

    -- Ngân sách (Nội bộ)
    target_unit_price   DECIMAL(15,2),                             -- Giá mục tiêu nội bộ (Vendor KHÔNG thấy)

    -- File đính kèm (Bản vẽ kỹ thuật, Hình ảnh mẫu)
    attachment_urls     TEXT[],                                    -- Array URL files trên S3

    sort_order          INT          NOT NULL DEFAULT 0,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_rli_tenant     FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_rli_rfq        FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE,
    CONSTRAINT chk_rli_qty       CHECK (quantity > 0),
    CONSTRAINT chk_rli_minmax    CHECK (min_order_qty IS NULL OR min_order_qty > 0),
    CONSTRAINT chk_rli_maxmin    CHECK (max_order_qty IS NULL OR max_order_qty >= min_order_qty)
);

CREATE INDEX idx_rli_rfq     ON rfq_line_items (rfq_id);
CREATE INDEX idx_rli_hs_code ON rfq_line_items (hs_code) WHERE hs_code IS NOT NULL;

COMMENT ON TABLE  rfq_line_items IS 'Danh sách hàng hóa cần mua. Mỗi dòng = 1 mặt hàng với đầy đủ specs kỹ thuật XNK';
COMMENT ON COLUMN rfq_line_items.hs_code IS 'Harmonized System Code - Mã phân loại hàng hóa Hải quan quốc tế';
COMMENT ON COLUMN rfq_line_items.target_unit_price IS 'Chỉ nội bộ, Vendor KHÔNG thấy. Dùng để so sánh giá Vendor báo với ngân sách';

-- -------------------------------------------------------
-- 2.4  rfq_vendors  –  Danh sách Vendor được mời báo giá
-- -------------------------------------------------------
CREATE TABLE rfq_vendors (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    rfq_id          UUID         NOT NULL,
    vendor_email    VARCHAR(150) NOT NULL,
    vendor_name     VARCHAR(200),
    company_name    VARCHAR(255),
    phone           VARCHAR(30),
    country         VARCHAR(100),
    category        VARCHAR(50),                                   -- VD: "Manufacturer", "Trader", "Agent"
    status          VARCHAR(20)  NOT NULL DEFAULT 'INVITED',       -- Trạng thái tham gia
    invited_at      TIMESTAMP WITH TIME ZONE,
    responded_at    TIMESTAMP WITH TIME ZONE,
    decline_reason  TEXT,                                          -- Lý do từ chối báo giá
    notes           TEXT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_rv_tenant     FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_rv_rfq        FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE,
    CONSTRAINT uq_rv_rfq_email  UNIQUE (tenant_id, rfq_id, vendor_email),
    CONSTRAINT chk_rv_status    CHECK (status IN ('INVITED','LINK_SENT','VIEWED','SUBMITTED','DECLINED','DISQUALIFIED'))
);

CREATE INDEX idx_rv_rfq    ON rfq_vendors (rfq_id);
CREATE INDEX idx_rv_status ON rfq_vendors (status);

COMMENT ON TABLE rfq_vendors IS 'Theo dõi chi tiết từng Vendor được mời vào RFQ. Biết ai đã xem, ai đã nộp, ai từ chối';

-- -------------------------------------------------------
-- 2.5  magic_links  –  Quản lý Link JWT gửi Vendor
-- -------------------------------------------------------
CREATE TABLE magic_links (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    rfq_id          UUID         NOT NULL,
    rfq_vendor_id   UUID,                                          -- Tham chiếu tới rfq_vendors
    vendor_email    VARCHAR(150) NOT NULL,
    vendor_name     VARCHAR(200),
    token           VARCHAR(1000) NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    expires_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at         TIMESTAMP WITH TIME ZONE,
    first_opened_at TIMESTAMP WITH TIME ZONE,                      -- Lần đầu Vendor mở link
    used_at         TIMESTAMP WITH TIME ZONE,                      -- Lúc Submit báo giá
    ip_address      INET,                                          -- IP khi Submit
    user_agent      TEXT,                                          -- Browser info
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_ml_tenant     FOREIGN KEY (tenant_id)    REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT uq_ml_token      UNIQUE (tenant_id, token),
    CONSTRAINT fk_ml_rfq        FOREIGN KEY (rfq_id)       REFERENCES rfqs(id)       ON DELETE CASCADE,
    CONSTRAINT fk_ml_vendor     FOREIGN KEY (rfq_vendor_id) REFERENCES rfq_vendors(id),
    CONSTRAINT chk_ml_status    CHECK (status IN ('ACTIVE','USED','EXPIRED','REVOKED'))
);

CREATE INDEX idx_ml_rfq         ON magic_links (rfq_id);
CREATE INDEX idx_ml_token       ON magic_links USING hash (token);
CREATE INDEX idx_ml_status      ON magic_links (status);

COMMENT ON TABLE  magic_links IS 'JWT Magic Link. Ghi nhận cả IP và thời điểm mở link để audit bảo mật';

-- -------------------------------------------------------
-- 2.6  quotations  –  Báo giá Vendor gửi về (Production-grade)
-- -------------------------------------------------------
CREATE TABLE quotations (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID         NOT NULL,
    rfq_id              UUID         NOT NULL,
    magic_link_id       UUID,
    rfq_vendor_id       UUID,
    quotation_code      VARCHAR(50),                               -- Mã nội bộ hệ thống sinh

    -- Thông tin Vendor
    vendor_email        VARCHAR(150) NOT NULL,
    vendor_name         VARCHAR(200),
    vendor_company      VARCHAR(255),
    vendor_phone        VARCHAR(30),
    vendor_address      TEXT,

    -- Tổng giá trị & Đồng tiền
    currency            VARCHAR(10)  NOT NULL DEFAULT 'USD',
    exchange_rate       DECIMAL(12,6) DEFAULT 1.000000,            -- Tỉ giá so với base currency
    subtotal            DECIMAL(15,2) NOT NULL DEFAULT 0,          -- Tổng tiền hàng (trước thuế/phí)
    discount_pct        DECIMAL(5,2)  NOT NULL DEFAULT 0,          -- Chiết khấu tổng (%)
    discount_amount     DECIMAL(15,2) NOT NULL DEFAULT 0,          -- Chiết khấu tổng (tiền)
    tax_pct             DECIMAL(5,2)  NOT NULL DEFAULT 0,          -- Thuế VAT (%)
    tax_amount          DECIMAL(15,2) NOT NULL DEFAULT 0,          -- Thuế VAT (tiền)
    shipping_cost       DECIMAL(15,2) NOT NULL DEFAULT 0,          -- Phí vận chuyển
    insurance_cost      DECIMAL(15,2) NOT NULL DEFAULT 0,          -- Phí bảo hiểm
    other_charges       DECIMAL(15,2) NOT NULL DEFAULT 0,          -- Phí phát sinh khác
    grand_total         DECIMAL(15,2) NOT NULL,                    -- TỔNG CỘNG CUỐI CÙNG

    -- Điều khoản
    payment_terms       VARCHAR(200),                              -- "T/T 30/70", "L/C at sight"...
    incoterms_offered   VARCHAR(10),                               -- Incoterms Vendor đề xuất
    delivery_terms      TEXT,                                      -- Điều kiện giao hàng chi tiết
    warranty_terms      TEXT,                                      -- Điều kiện bảo hành
    warranty_months     INT,                                       -- Số tháng bảo hành

    -- Thời gian
    lead_time_days      INT,                                       -- Thời gian sản xuất (ngày)
    eta_date            DATE         NOT NULL,                     -- Ngày giao hàng dự kiến
    quote_valid_until   DATE,                                      -- Hiệu lực báo giá đến ngày

    -- Năng lực Vendor
    moq                 DECIMAL(12,2),                             -- Minimum Order Quantity
    production_capacity TEXT,                                      -- Năng lực sản xuất
    certifications      TEXT,                                      -- Các chứng nhận có (ISO, CE, FDA...)
    origin_country      VARCHAR(100),                              -- Nước sản xuất / xuất xứ thực tế

    -- File đính kèm (Hồ sơ năng lực, Catalog, CO mẫu...)
    document_ids        UUID[],                                    -- Array tham chiếu project_documents
    attachment_urls     TEXT[],                                    -- Array URL files trực tiếp

    -- Chấm điểm (Nội bộ - Vendor không thấy)
    internal_score      DECIMAL(5,2),                              -- Điểm đánh giá tổng hợp (0-100)
    score_breakdown     JSONB,                                     -- {"price": 35, "quality": 28, "delivery": 22}
    internal_notes      TEXT,                                      -- Ghi chú nội bộ của Purchaser
    comparison_rank     INT,                                       -- Thứ hạng (1 = tốt nhất)

    -- Trạng thái & Audit
    status              VARCHAR(20)  NOT NULL DEFAULT 'SUBMITTED',
    rejection_reason    TEXT,                                      -- Lý do bị loại
    approved_by         UUID,
    approved_at         TIMESTAMP WITH TIME ZONE,
    submitted_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_q_tenant       FOREIGN KEY (tenant_id)     REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_q_rfq          FOREIGN KEY (rfq_id)        REFERENCES rfqs(id) ON DELETE CASCADE,
    CONSTRAINT fk_q_magic_link   FOREIGN KEY (magic_link_id)  REFERENCES magic_links(id),
    CONSTRAINT fk_q_rfq_vendor   FOREIGN KEY (rfq_vendor_id)  REFERENCES rfq_vendors(id),
    CONSTRAINT fk_q_approver     FOREIGN KEY (approved_by)    REFERENCES users(id),
    CONSTRAINT chk_q_status      CHECK (status IN ('SUBMITTED','UNDER_REVIEW','SHORTLISTED','APPROVED','REJECTED','WITHDRAWN')),
    CONSTRAINT chk_q_grand_total CHECK (grand_total >= 0),
    CONSTRAINT chk_q_subtotal    CHECK (subtotal >= 0),
    CONSTRAINT chk_q_disc_pct    CHECK (discount_pct >= 0 AND discount_pct <= 100),
    CONSTRAINT chk_q_tax_pct     CHECK (tax_pct >= 0 AND tax_pct <= 100),
    CONSTRAINT chk_q_shipping    CHECK (shipping_cost >= 0),
    CONSTRAINT chk_q_insurance   CHECK (insurance_cost >= 0),
    CONSTRAINT chk_q_score       CHECK (internal_score IS NULL OR (internal_score >= 0 AND internal_score <= 100))
);

CREATE INDEX idx_q_rfq        ON quotations (rfq_id);
CREATE INDEX idx_q_status     ON quotations (status);
CREATE INDEX idx_q_vendor     ON quotations (rfq_vendor_id);
CREATE INDEX idx_q_rank       ON quotations (rfq_id, comparison_rank) WHERE comparison_rank IS NOT NULL;

COMMENT ON TABLE  quotations IS 'Báo giá chuẩn XNK. Phân tách rõ subtotal/tax/shipping/insurance/grand_total. Có scoring nội bộ';
COMMENT ON COLUMN quotations.exchange_rate IS 'Tỉ giá quy đổi về base currency của RFQ. VD: RFQ dùng USD, Vendor báo VND thì lưu rate ở đây';
COMMENT ON COLUMN quotations.score_breakdown IS 'JSONB chứa điểm chi tiết theo từng tiêu chí đánh giá. VD: {"price": 35, "quality": 28}';

-- -------------------------------------------------------
-- 2.7  quotation_line_items  –  Chi tiết Báo giá (Production-grade)
-- -------------------------------------------------------
CREATE TABLE quotation_line_items (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID         NOT NULL,
    quotation_id        UUID         NOT NULL,
    rfq_item_id         UUID         NOT NULL,

    -- Giá & Số lượng
    quantity_offered    DECIMAL(12,2),                              -- SL Vendor đáp ứng (Có thể khác SL yêu cầu)
    unit_price          DECIMAL(15,4) NOT NULL,                    -- Đơn giá (4 decimal cho hàng giá nhỏ)
    discount_pct        DECIMAL(5,2)  NOT NULL DEFAULT 0,          -- Chiết khấu dòng (%)
    tax_pct             DECIMAL(5,2)  NOT NULL DEFAULT 0,          -- Thuế dòng (%)
    total_price         DECIMAL(15,2) NOT NULL,                    -- Thành tiền cuối cùng

    -- Thông tin sản phẩm Vendor đề xuất
    brand_offered       VARCHAR(200),                              -- Thương hiệu Vendor báo
    model_offered       VARCHAR(100),                              -- Model Vendor báo
    origin_country      VARCHAR(100),                              -- Nước SX thực tế
    hs_code             VARCHAR(20),                               -- HS Code thực tế

    -- Quy cách
    packaging_details   TEXT,                                      -- Chi tiết đóng gói Vendor đề xuất
    weight_kg           DECIMAL(12,3),                             -- Trọng lượng (Kg)
    dimensions_cm       VARCHAR(100),                              -- Kích thước (DxRxC cm)
    cbm                 DECIMAL(10,4),                             -- Thể tích (m3) - Quan trọng cho tính cước tàu

    -- Thời gian & Năng lực
    lead_time_days      INT,                                       -- Thời gian SX cho dòng hàng này
    moq                 DECIMAL(12,2),                             -- MOQ cho dòng hàng này
    warranty_months     INT,                                       -- Bảo hành riêng cho dòng hàng

    -- Ghi chú & File
    notes               TEXT,
    attachment_urls     TEXT[],                                    -- Hình ảnh sản phẩm, Datasheet

    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_qli_tenant     FOREIGN KEY (tenant_id)    REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_qli_quotation  FOREIGN KEY (quotation_id) REFERENCES quotations(id)      ON DELETE CASCADE,
    CONSTRAINT fk_qli_rfq_item   FOREIGN KEY (rfq_item_id)  REFERENCES rfq_line_items(id)  ON DELETE CASCADE,
    CONSTRAINT chk_qli_price     CHECK (unit_price >= 0),
    CONSTRAINT chk_qli_total     CHECK (total_price >= 0),
    CONSTRAINT chk_qli_disc      CHECK (discount_pct >= 0 AND discount_pct <= 100),
    CONSTRAINT chk_qli_tax       CHECK (tax_pct >= 0 AND tax_pct <= 100),
    CONSTRAINT uq_qli_quot_item  UNIQUE (tenant_id, quotation_id, rfq_item_id)
);

CREATE INDEX idx_qli_quotation ON quotation_line_items (quotation_id);
CREATE INDEX idx_qli_rfq_item  ON quotation_line_items (rfq_item_id);

COMMENT ON TABLE  quotation_line_items IS 'Chi tiết báo giá từng mặt hàng. Bao gồm specs thực tế Vendor đề xuất, trọng lượng, CBM cho logistics';
COMMENT ON COLUMN quotation_line_items.unit_price IS 'Dùng DECIMAL(15,4) vì hàng XNK giá nhỏ (VD: ốc vít $0.0035/pc)';
COMMENT ON COLUMN quotation_line_items.cbm IS 'Cubic Meter - Thể tích. Rất quan trọng khi tính cước container (FCL/LCL)';

-- ============================================================
-- PHÂN HỆ 3: BIDDING, OPERATIONS & REPORTING
-- ============================================================

-- -------------------------------------------------------
-- 3.1  workflow_stage_tasks  –  Cấu hình Task tự động sinh (Production-grade)
-- -------------------------------------------------------
CREATE TABLE workflow_stage_tasks (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    stage_id        UUID         NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,                                      -- Mô tả chi tiết công việc
    default_role    VARCHAR(30)  NOT NULL,
    priority        VARCHAR(20)  NOT NULL DEFAULT 'MEDIUM',
    due_days_offset INT          NOT NULL DEFAULT 3,
    depends_on_task_id UUID,                                   -- Task phải hoàn thành trước (Dependency chain)
    is_blocking     BOOLEAN      NOT NULL DEFAULT FALSE,       -- TRUE = Chặn chuyển bước nếu chưa Done
    auto_assign_to  VARCHAR(30),                               -- 'PRIMARY' = Gán cho is_primary member của Role
    sort_order      INT          NOT NULL DEFAULT 0,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_wst_tenant    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_wst_stage     FOREIGN KEY (stage_id) REFERENCES workflow_stages(id) ON DELETE CASCADE,
    CONSTRAINT fk_wst_depends   FOREIGN KEY (depends_on_task_id) REFERENCES workflow_stage_tasks(id),
    CONSTRAINT chk_wst_role     CHECK (default_role IN ('OWNER','SOURCING_LEAD','SALES_EXEC','LOGISTICS_EXEC','FINANCE','QC','MEMBER')),
    CONSTRAINT chk_wst_priority CHECK (priority IN ('LOW','MEDIUM','HIGH','URGENT'))
);

CREATE INDEX idx_wst_stage ON workflow_stage_tasks (stage_id);

COMMENT ON TABLE  workflow_stage_tasks IS 'Template Task tự động sinh khi chuyển bước. Hỗ trợ dependency chain và blocking';
COMMENT ON COLUMN workflow_stage_tasks.due_days_offset IS 'Deadline = ngày chuyển bước + offset ngày. VD: 3 = hạn 3 ngày sau khi vào Stage';
COMMENT ON COLUMN workflow_stage_tasks.is_blocking IS 'TRUE = Nếu task này chưa DONE thì không được chuyển sang Stage tiếp theo';

-- -------------------------------------------------------
-- 3.2  project_tasks  –  Công việc Vi mô (Production-grade)
-- -------------------------------------------------------
CREATE TABLE project_tasks (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    project_id      UUID         NOT NULL,
    stage_id        UUID,
    parent_id       UUID,                                      -- Sub-task: Task con thuộc Task cha
    task_code       VARCHAR(50),                               -- Mã định danh (VD: TASK-001)

    -- Nội dung
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    category        VARCHAR(50),                               -- Phân loại (VD: Procurement, Legal, Logistics)

    -- Phân công
    assignee_id     UUID,
    reviewer_id     UUID,                                      -- Người kiểm tra kết quả
    watchers        UUID[],                                    -- Mảng user IDs theo dõi

    -- Trạng thái & Ưu tiên
    priority        VARCHAR(20)  NOT NULL DEFAULT 'MEDIUM',
    status          VARCHAR(20)  NOT NULL DEFAULT 'TODO',
    is_auto_generated BOOLEAN    NOT NULL DEFAULT FALSE,       -- TRUE = Sinh từ workflow_stage_tasks
    source_template_id UUID,                                   -- Tham chiếu workflow_stage_tasks gốc

    -- Thời gian
    start_date      TIMESTAMP WITH TIME ZONE,                  -- Ngày bắt đầu thực tế
    due_date        TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at    TIMESTAMP WITH TIME ZONE,
    estimated_hours DECIMAL(6,1),                              -- Ước tính (giờ)
    actual_hours    DECIMAL(6,1),                              -- Thực tế (giờ)

    -- Đính kèm & Kết quả
    attachment_urls  TEXT[],
    result_notes    TEXT,                                      -- Ghi chú kết quả khi Done
    comments_count  INT          NOT NULL DEFAULT 0,           -- Denormalized count

    created_by      UUID,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_pt_tenant     FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_pt_project    FOREIGN KEY (project_id)  REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_pt_stage      FOREIGN KEY (stage_id)    REFERENCES workflow_stages(id),
    CONSTRAINT fk_pt_parent     FOREIGN KEY (parent_id)   REFERENCES project_tasks(id),
    CONSTRAINT fk_pt_assignee   FOREIGN KEY (assignee_id) REFERENCES users(id),
    CONSTRAINT fk_pt_reviewer   FOREIGN KEY (reviewer_id) REFERENCES users(id),
    CONSTRAINT fk_pt_creator    FOREIGN KEY (created_by)  REFERENCES users(id),
    CONSTRAINT fk_pt_template   FOREIGN KEY (source_template_id) REFERENCES workflow_stage_tasks(id),
    CONSTRAINT chk_pt_priority  CHECK (priority IN ('LOW','MEDIUM','HIGH','URGENT')),
    CONSTRAINT chk_pt_status    CHECK (status IN ('TODO','DOING','IN_REVIEW','DONE','CANCELLED','OVERDUE','BLOCKED'))
);

CREATE INDEX idx_pt_project   ON project_tasks (project_id);
CREATE INDEX idx_pt_assignee  ON project_tasks (assignee_id);
CREATE INDEX idx_pt_status    ON project_tasks (status);
CREATE INDEX idx_pt_due_date  ON project_tasks (due_date);
CREATE INDEX idx_pt_parent    ON project_tasks (parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_pt_overdue   ON project_tasks (due_date, status) WHERE status NOT IN ('DONE','CANCELLED');

COMMENT ON TABLE project_tasks IS 'Task management production-grade: Sub-tasks, Watchers, Time tracking, Review flow, Blocking chain';

-- -------------------------------------------------------
-- 3.3  shipments  –  Lô hàng / Vận đơn (Production-grade)
-- -------------------------------------------------------
CREATE TABLE shipments (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    project_id      UUID         NOT NULL,
    shipment_code   VARCHAR(50),                               -- Mã nội bộ (VD: SH-2026-001)

    -- Vận đơn
    bl_number       VARCHAR(100),                              -- Số Bill of Lading
    bl_type         VARCHAR(30),                               -- Loại B/L
    booking_number  VARCHAR(100),                              -- Mã Booking hãng tàu

    -- Tàu & Container
    vessel_name     VARCHAR(200),
    voyage_number   VARCHAR(50),
    container_no    VARCHAR(50),
    container_type  VARCHAR(30),                               -- 20GP, 40GP, 40HC, 20RF...
    container_count INT          DEFAULT 1,
    seal_number     VARCHAR(50),                               -- Số seal container

    -- Hành trình
    shipping_method VARCHAR(30)  NOT NULL DEFAULT 'SEA',
    origin_port     VARCHAR(200),
    origin_country  VARCHAR(100),
    destination_port VARCHAR(200),
    destination_country VARCHAR(100),
    transit_ports   TEXT[],                                     -- Mảng cảng trung chuyển

    -- Hàng hóa tổng quan
    cargo_description TEXT,
    total_packages  INT,
    gross_weight_kg DECIMAL(12,3),
    net_weight_kg   DECIMAL(12,3),
    total_cbm       DECIMAL(10,4),
    hs_codes        TEXT[],                                    -- Danh sách HS code trong lô

    -- Đơn vị vận chuyển (Forwarder)
    forwarder_name  VARCHAR(255),
    forwarder_contact VARCHAR(150),
    forwarder_email VARCHAR(150),
    shipping_line   VARCHAR(200),                              -- Hãng tàu (Maersk, MSC, Evergreen...)

    -- Bảo hiểm
    insurance_provider VARCHAR(200),
    insurance_policy_no VARCHAR(100),
    insured_value   DECIMAL(15,2),
    insurance_currency VARCHAR(10) DEFAULT 'USD',

    -- Hải quan
    customs_broker  VARCHAR(200),                              -- Đơn vị khai hải quan
    customs_declaration_no VARCHAR(100),                        -- Số tờ khai
    customs_cleared_at TIMESTAMP WITH TIME ZONE,

    -- Trạng thái & Audit
    status          VARCHAR(30)  NOT NULL DEFAULT 'DRAFT',
    assigned_to     UUID,                                      -- Logistics Exec phụ trách
    notes           TEXT,
    created_by      UUID         NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_s_tenant      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_s_project     FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_s_creator     FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_s_assignee    FOREIGN KEY (assigned_to) REFERENCES users(id),
    CONSTRAINT uq_s_bl          UNIQUE (tenant_id, bl_number),
    CONSTRAINT chk_s_status     CHECK (status IN ('DRAFT','BOOKING','BOOKED','GATE_IN','DEPARTED','IN_TRANSIT','ARRIVED','CUSTOMS','DELIVERING','DELIVERED','CANCELLED')),
    CONSTRAINT chk_s_ship_method CHECK (shipping_method IN ('SEA','AIR','RAIL','ROAD','MULTIMODAL','EXPRESS')),
    CONSTRAINT chk_s_bl_type    CHECK (bl_type IS NULL OR bl_type IN ('ORIGINAL','SURRENDERED','SEAWAY_BILL','TELEX_RELEASE','EXPRESS'))
);

CREATE INDEX idx_s_project ON shipments (project_id);
CREATE INDEX idx_s_status  ON shipments (status);
CREATE INDEX idx_s_bl      ON shipments (bl_number) WHERE bl_number IS NOT NULL;
CREATE INDEX idx_s_booking ON shipments (booking_number) WHERE booking_number IS NOT NULL;

COMMENT ON TABLE  shipments IS 'Lô hàng XNK: Full thông tin vận đơn, container, hải quan, bảo hiểm, forwarder';
COMMENT ON COLUMN shipments.bl_type IS 'ORIGINAL = B/L gốc. SURRENDERED = Đã thu hồi. TELEX_RELEASE = Giải phóng điện tử';

-- -------------------------------------------------------
-- 3.4  shipment_milestones  –  Các Mốc Thời gian (Production-grade)
-- -------------------------------------------------------
CREATE TABLE shipment_milestones (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    shipment_id     UUID         NOT NULL,
    milestone_type  VARCHAR(50)  NOT NULL,
    sequence        INT          NOT NULL DEFAULT 0,

    -- Thời gian
    planned_date    DATE         NOT NULL,
    revised_date    DATE,                                      -- Ngày điều chỉnh (Tàu delay...)
    actual_date     DATE,                                      -- Ngày thực tế hoàn thành
    is_completed    BOOLEAN      NOT NULL DEFAULT FALSE,

    -- Trách nhiệm
    responsible_role VARCHAR(30),                               -- Role phụ trách mốc này
    completed_by    UUID,

    -- Trễ hạn
    delay_days      INT,                                       -- Số ngày trễ so với planned_date (Auto-calc)
    delay_reason    TEXT,                                      -- Lý do trễ
    delay_category  VARCHAR(30),                               -- Phân loại trễ

    -- Bằng chứng
    evidence_urls   TEXT[],                                    -- Ảnh chụp / Scan chứng từ xác nhận
    location        VARCHAR(200),                              -- Vị trí thực tế (VD: Cảng Cát Lái)
    notes           TEXT,

    updated_by      UUID,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_sm_tenant     FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_sm_shipment   FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE,
    CONSTRAINT fk_sm_updater    FOREIGN KEY (updated_by)  REFERENCES users(id),
    CONSTRAINT fk_sm_completer  FOREIGN KEY (completed_by) REFERENCES users(id),
    CONSTRAINT chk_sm_type      CHECK (milestone_type IN ('BOOKING_CONFIRMED','CARGO_READY','GATE_IN','LOADED','ETD','IN_TRANSIT','TRANSSHIPMENT','ETA','ARRIVED','CUSTOMS_CLEARANCE','DELIVERY_ORDER','DELIVERED','EMPTY_RETURN')),
    CONSTRAINT chk_sm_delay_cat CHECK (delay_category IS NULL OR delay_category IN ('WEATHER','PORT_CONGESTION','CUSTOMS_HOLD','VESSEL_DELAY','DOCUMENTATION','FORCE_MAJEURE','INTERNAL','OTHER'))
);

CREATE INDEX idx_sm_shipment     ON shipment_milestones (shipment_id);
CREATE INDEX idx_sm_planned      ON shipment_milestones (planned_date);
CREATE INDEX idx_sm_overdue      ON shipment_milestones (planned_date, is_completed) WHERE is_completed = FALSE;

COMMENT ON TABLE  shipment_milestones IS 'Full Logistics Tracking: 13 milestone types, delay tracking, evidence uploads, auto delay-days';
COMMENT ON COLUMN shipment_milestones.delay_days IS 'Auto-calculate: actual_date - planned_date. Nếu > 0 = Trễ. Cronjob 8AM quét chưa hoàn thành -> Alert';

-- -------------------------------------------------------
-- 3.5  shipment_costs  –  Chi phí Lô hàng (Phân tích P&L)
-- -------------------------------------------------------
CREATE TABLE shipment_costs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    shipment_id     UUID         NOT NULL,
    cost_type       VARCHAR(50)  NOT NULL,                     -- Loại chi phí
    description     VARCHAR(255) NOT NULL,
    currency        VARCHAR(10)  NOT NULL DEFAULT 'USD',
    amount          DECIMAL(15,2) NOT NULL,
    exchange_rate   DECIMAL(12,6) DEFAULT 1.000000,
    amount_base     DECIMAL(15,2),                             -- Quy đổi về base currency
    vendor_name     VARCHAR(200),                              -- Đơn vị cung cấp dịch vụ
    invoice_number  VARCHAR(100),
    invoice_date    DATE,
    is_estimated    BOOLEAN      NOT NULL DEFAULT TRUE,        -- TRUE = Dự toán, FALSE = Thực tế
    notes           TEXT,
    created_by      UUID         NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_sc_tenant     FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_sc_shipment   FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE,
    CONSTRAINT fk_sc_creator    FOREIGN KEY (created_by)  REFERENCES users(id),
    CONSTRAINT chk_sc_amount    CHECK (amount >= 0),
    CONSTRAINT chk_sc_type      CHECK (cost_type IN ('FREIGHT','THC','CUSTOMS_FEE','INSURANCE','TRUCKING','WAREHOUSING','DOCUMENTATION','INSPECTION','DEMURRAGE','DETENTION','PORT_CHARGES','OTHER'))
);

CREATE INDEX idx_sc_shipment ON shipment_costs (shipment_id);

COMMENT ON TABLE shipment_costs IS 'Chi phí chi tiết từng lô hàng. Dùng tính P&L, so sánh Estimated vs Actual. Báo cáo chi phí logistics';


-- ============================================================
-- PHÂN HỆ PHỤ TRỢ: NOTIFICATIONS & SYSTEM
-- ============================================================

-- -------------------------------------------------------
-- 4.1  notifications  –  Thông báo In-app & Email Queue (Production-grade)
-- -------------------------------------------------------
CREATE TABLE notifications (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    recipient_id    UUID         NOT NULL,
    title           VARCHAR(255) NOT NULL,
    body            TEXT,
    type            VARCHAR(30)  NOT NULL,
    priority        VARCHAR(10)  NOT NULL DEFAULT 'NORMAL',    -- Mức độ ưu tiên

    -- Tham chiếu đối tượng
    reference_type  VARCHAR(50),                               -- VD: 'PROJECT', 'TASK', 'RFQ', 'SHIPMENT'
    reference_id    UUID,
    action_url      VARCHAR(500),                              -- Deep link đến trang liên quan

    -- Trạng thái
    is_read         BOOLEAN      NOT NULL DEFAULT FALSE,
    read_at         TIMESTAMP WITH TIME ZONE,
    is_archived     BOOLEAN      NOT NULL DEFAULT FALSE,

    -- Kênh gửi
    channel         VARCHAR(20)  NOT NULL DEFAULT 'IN_APP',
    email_sent_at   TIMESTAMP WITH TIME ZONE,                  -- NULL = chưa gửi email
    email_status    VARCHAR(20),                               -- PENDING, SENT, FAILED, BOUNCED

    -- Nhóm thông báo
    group_key       VARCHAR(100),                              -- Gom nhóm: VD 'rfq_123_quotes' để badge count

    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_n_tenant      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_n_recipient   FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_n_type       CHECK (type IN ('TASK_ASSIGNED','TASK_OVERDUE','QUOTE_RECEIVED','QUOTE_APPROVED','DOC_UPLOADED','DOC_APPROVED','DOC_REJECTED','DOC_EXPIRED','OVERDUE_ALERT','SLA_WARNING','SLA_BREACH','STAGE_CHANGED','RFQ_PUBLISHED','RFQ_CLOSED','SHIPMENT_UPDATE','MILESTONE_OVERDUE','COMMENT_MENTION','SYSTEM')),
    CONSTRAINT chk_n_channel    CHECK (channel IN ('IN_APP','EMAIL','BOTH')),
    CONSTRAINT chk_n_priority   CHECK (priority IN ('LOW','NORMAL','HIGH','URGENT')),
    CONSTRAINT chk_n_email_st   CHECK (email_status IS NULL OR email_status IN ('PENDING','SENT','FAILED','BOUNCED'))
);

CREATE INDEX idx_n_recipient    ON notifications (recipient_id, is_read);
CREATE INDEX idx_n_created      ON notifications (created_at DESC);
CREATE INDEX idx_n_unread       ON notifications (recipient_id, created_at DESC) WHERE is_read = FALSE;
CREATE INDEX idx_n_group        ON notifications (group_key) WHERE group_key IS NOT NULL;

COMMENT ON TABLE notifications IS 'Notification center: WebSocket push (IN_APP), Email queue (EMAIL), priority-based, group badge counting';

-- -------------------------------------------------------
-- 4.2  activity_logs  –  Nhật ký Hoạt động (Audit Trail toàn cục)
-- -------------------------------------------------------
CREATE TABLE activity_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    user_id         UUID,
    session_id      VARCHAR(100),                              -- Session ID để trace chuỗi hành động
    action          VARCHAR(50)  NOT NULL,                     -- VD: CREATE, UPDATE, DELETE, LOGIN, EXPORT
    entity_type     VARCHAR(50)  NOT NULL,                     -- VD: PROJECT, RFQ, QUOTATION, SHIPMENT
    entity_id       UUID,
    project_id      UUID,                                      -- Denormalized: Truy vấn nhanh theo Dự án
    description     TEXT,                                      -- Mô tả hành động dạng readable
    old_values      JSONB,                                     -- Giá trị trước thay đổi
    new_values      JSONB,                                     -- Giá trị sau thay đổi
    metadata        JSONB,                                     -- Dữ liệu bổ sung
    ip_address      INET,
    user_agent      VARCHAR(500),                              -- Browser / API Client info
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_al_tenant     FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_al_user       FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_al_project    FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE INDEX idx_al_entity      ON activity_logs (entity_type, entity_id);
CREATE INDEX idx_al_user        ON activity_logs (user_id);
CREATE INDEX idx_al_project     ON activity_logs (project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_al_created     ON activity_logs (created_at DESC);
CREATE INDEX idx_al_session     ON activity_logs (session_id) WHERE session_id IS NOT NULL;

COMMENT ON TABLE  activity_logs IS 'Full audit trail: old/new values diff, session tracing, project-scoped queries';

-- -------------------------------------------------------
-- 4.3  user_sessions  –  Quản lý Phiên đăng nhập
-- -------------------------------------------------------
CREATE TABLE user_sessions (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    user_id         UUID         NOT NULL,
    session_token   VARCHAR(500) NOT NULL,
    refresh_token   VARCHAR(500),
    device_info     VARCHAR(300),                              -- VD: Chrome 120 / macOS 14
    ip_address      INET,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    expires_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at      TIMESTAMP WITH TIME ZONE,
    revoked_reason  VARCHAR(50),                               -- LOGOUT, EXPIRED, ADMIN_REVOKE, SECURITY
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_us_tenant     FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_us_user       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_us_session    UNIQUE (tenant_id, session_token),
    CONSTRAINT chk_us_revoke    CHECK (revoked_reason IS NULL OR revoked_reason IN ('LOGOUT','EXPIRED','ADMIN_REVOKE','SECURITY','PASSWORD_CHANGED'))
);

CREATE INDEX idx_us_user    ON user_sessions (user_id);
CREATE INDEX idx_us_token   ON user_sessions USING hash (session_token);
CREATE INDEX idx_us_active  ON user_sessions (user_id, is_active) WHERE is_active = TRUE;

COMMENT ON TABLE user_sessions IS 'Session management: Multi-device, force logout, security audit. Admin có thể revoke bất kỳ session nào';

-- -------------------------------------------------------
-- 4.4  system_settings  –  Cấu hình Hệ thống (Key-Value Store)
-- -------------------------------------------------------
CREATE TABLE system_settings (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    setting_key     VARCHAR(100) NOT NULL,
    setting_value   TEXT         NOT NULL,
    value_type      VARCHAR(20)  NOT NULL DEFAULT 'STRING',    -- Kiểu dữ liệu
    category        VARCHAR(50)  NOT NULL DEFAULT 'GENERAL',   -- Nhóm cấu hình
    description     TEXT,
    is_public       BOOLEAN      NOT NULL DEFAULT FALSE,       -- TRUE = FE có thể đọc
    updated_by      UUID,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_ss_tenant     FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT uq_ss_key        UNIQUE (tenant_id, setting_key),
    CONSTRAINT fk_ss_updater    FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT chk_ss_type      CHECK (value_type IN ('STRING','NUMBER','BOOLEAN','JSON','DATE'))
);

COMMENT ON TABLE system_settings IS 'Key-Value store cho cấu hình toàn hệ thống. VD: company_name, default_currency, smtp_host...';

-- -------------------------------------------------------
-- 4.5  file_attachments  –  Bảng File tổng quát (Polymorphic)
-- -------------------------------------------------------
CREATE TABLE file_attachments (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    entity_type     VARCHAR(50)  NOT NULL,                     -- 'TASK', 'COMMENT', 'SHIPMENT'...
    entity_id       UUID         NOT NULL,
    file_name       VARCHAR(255) NOT NULL,
    original_name   VARCHAR(255),
    file_url        VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT       NOT NULL DEFAULT 0,
    mime_type       VARCHAR(100),
    uploaded_by     UUID         NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_fa_tenant     FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_fa_uploader   FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE INDEX idx_fa_entity ON file_attachments (entity_type, entity_id);

COMMENT ON TABLE file_attachments IS 'Bảng file đính kèm dùng chung (Polymorphic). Không dùng FK cứng vì đa entity_type';

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger 1: Tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT table_name FROM information_schema.columns
        WHERE column_name = 'updated_at'
          AND table_schema = 'public'
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()',
            tbl, tbl
        );
    END LOOP;
END;
$$;

-- Trigger 2: Tự động tính delay_days trên shipment_milestones
CREATE OR REPLACE FUNCTION fn_calc_delay_days()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.actual_date IS NOT NULL AND NEW.planned_date IS NOT NULL THEN
        NEW.delay_days = NEW.actual_date - NEW.planned_date;
    END IF;
    IF NEW.actual_date IS NOT NULL THEN
        NEW.is_completed = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_milestone_delay
    BEFORE INSERT OR UPDATE ON shipment_milestones
    FOR EACH ROW EXECUTE FUNCTION fn_calc_delay_days();

-- Trigger 3: Tự động tính duration_hours trên project_transition_logs
CREATE OR REPLACE FUNCTION fn_calc_transition_duration()
RETURNS TRIGGER AS $$
DECLARE
    v_entered_at TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT stage_entered_at INTO v_entered_at
    FROM projects WHERE id = NEW.project_id;
    IF v_entered_at IS NOT NULL THEN
        NEW.duration_hours = EXTRACT(EPOCH FROM (NOW() - v_entered_at)) / 3600.0;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_transition_duration
    BEFORE INSERT ON project_transition_logs
    FOR EACH ROW EXECUTE FUNCTION fn_calc_transition_duration();

-- ============================================================
-- VIEWS: Báo cáo & Dashboard
-- ============================================================

-- View: Tổng quan SLA từng Dự án
CREATE OR REPLACE VIEW v_project_sla_status AS
SELECT
    p.id AS project_id,
    p.project_code,
    p.name AS project_name,
    ws.name AS current_stage,
    ws.sla_days,
    p.stage_entered_at,
    EXTRACT(DAY FROM NOW() - p.stage_entered_at)::INT AS days_in_stage,
    CASE
        WHEN ws.sla_days IS NULL THEN 'NO_SLA'
        WHEN EXTRACT(DAY FROM NOW() - p.stage_entered_at) > ws.sla_days THEN 'BREACHED'
        WHEN EXTRACT(DAY FROM NOW() - p.stage_entered_at) > (ws.sla_days - COALESCE(ws.sla_warning_days, 0)) THEN 'WARNING'
        ELSE 'ON_TRACK'
    END AS sla_status
FROM projects p
JOIN workflow_stages ws ON p.current_stage_id = ws.id
WHERE p.status = 'ACTIVE';

-- View: Overdue Milestones cho Cronjob
CREATE OR REPLACE VIEW v_overdue_milestones AS
SELECT
    sm.id AS milestone_id,
    sm.milestone_type,
    sm.planned_date,
    (CURRENT_DATE - sm.planned_date) AS overdue_days,
    s.shipment_code,
    s.bl_number,
    s.project_id,
    p.project_code,
    p.name AS project_name
FROM shipment_milestones sm
JOIN shipments s ON sm.shipment_id = s.id
JOIN projects p ON s.project_id = p.id
WHERE sm.is_completed = FALSE
  AND sm.planned_date < CURRENT_DATE
  AND s.status NOT IN ('DELIVERED','CANCELLED');

-- ============================================================
-- PHÂN HỆ 6: TRUNG TÂM ĐIỀU PHỐI VÀ TÍCH HỢP NGOẠI VI (MIBID INTEGRATION ENGINE)
-- ============================================================

-- Bảng 31: integration_endpoints
CREATE TABLE integration_endpoints (
    id                  VARCHAR(64)     PRIMARY KEY,
    tenant_id           UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name                VARCHAR(255)    NOT NULL,
    system_type         VARCHAR(64)     NOT NULL, -- 'SAP_ERP', 'ORACLE_ERP', 'BRAVO_ERP', 'FAST_ERP', 'VNACCS_CUSTOMS', 'WMS_LOGISTICS', 'CUSTOM_REST'
    integration_mode    VARCHAR(64)     NOT NULL, -- 'KAFKA_STREAMING', 'WEBHOOK_HMAC', 'SFTP_BATCH', 'REST_PULL'
    endpoint_url        VARCHAR(1024),
    auth_config         TEXT,                     -- JSON AES-256
    mapping_schema      TEXT,                     -- JSON field mapping schema
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    sync_status         VARCHAR(32)     NOT NULL DEFAULT 'CONNECTED', -- 'CONNECTED', 'DISCONNECTED', 'ERROR'
    last_sync_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Bảng 32: outbox_events (Transactional Outbox Pattern)
CREATE TABLE outbox_events (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    aggregate_type      VARCHAR(64)     NOT NULL, -- 'RFQ', 'QUOTATION', 'PROJECT', 'SHIPMENT', 'PO_CONTRACT'
    aggregate_id        UUID            NOT NULL,
    event_type          VARCHAR(128)    NOT NULL, -- 'mibid.rfq.inbound', 'mibid.awarded-bid.outbound', etc.
    payload             TEXT            NOT NULL,
    status              VARCHAR(32)     NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PROCESSING', 'PUBLISHED', 'FAILED', 'DLQ'
    retry_count         INT             NOT NULL DEFAULT 0,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    processed_at        TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_outbox_events_status_created ON outbox_events(status, created_at);
CREATE INDEX idx_outbox_events_tenant_aggregate ON outbox_events(tenant_id, aggregate_type, aggregate_id);

-- Bảng 33: webhook_deliveries (Audit Log Webhook 2 chiều)
CREATE TABLE webhook_deliveries (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    endpoint_id         VARCHAR(64)     REFERENCES integration_endpoints(id) ON DELETE SET NULL,
    event_type          VARCHAR(128)    NOT NULL,
    direction           VARCHAR(16)     NOT NULL DEFAULT 'OUTBOUND', -- 'INBOUND', 'OUTBOUND'
    payload             TEXT            NOT NULL,
    response_code       INT,
    response_body       TEXT,
    latency_ms          BIGINT,
    status              VARCHAR(32)     NOT NULL DEFAULT 'SUCCESS', -- 'SUCCESS', 'FAILED', 'RETRYING'
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_deliveries_tenant_created ON webhook_deliveries(tenant_id, created_at DESC);

-- Bảng 34: file_sync_logs (Nhật ký xử lý tệp theo lô SFTP / S3 Dropzone)
CREATE TABLE file_sync_logs (
    id                  VARCHAR(64)     PRIMARY KEY,
    tenant_id           UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name                VARCHAR(255)    NOT NULL,
    file_type           VARCHAR(64)     NOT NULL, -- 'RFQ_LINE_ITEMS_IMPORT', 'VENDOR_CATALOG_SYNC', 'PO_CONTRACT_EXPORT', 'CUSTOMS_DECLARATION'
    total_records       INT             NOT NULL DEFAULT 0,
    success_count       INT             NOT NULL DEFAULT 0,
    error_count         INT             NOT NULL DEFAULT 0,
    status              VARCHAR(32)     NOT NULL DEFAULT 'SUCCESS', -- 'SUCCESS', 'PARTIAL_ERROR', 'FAILED'
    error_log_json      TEXT,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_file_sync_logs_tenant_created ON file_sync_logs(tenant_id, created_at DESC);

-- Bảng 35: idempotent_event_logs (Chống trùng lặp sự kiện phân tán)
CREATE TABLE idempotent_event_logs (
    id                  VARCHAR(128)    PRIMARY KEY, -- Idempotency Key (SHA-256 hoặc UUID từ Event Header)
    tenant_id           UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    source_system       VARCHAR(64)     NOT NULL,
    event_type          VARCHAR(128)    NOT NULL,
    processed_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expire_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX idx_idempotent_event_logs_expire_at ON idempotent_event_logs(expire_at);

-- ============================================================
-- THỐNG KÊ SCHEMA
-- ============================================================
-- Tổng: 35 bảng + 3 triggers + 2 views
--
-- PHÂN HỆ 1 - Nền tảng (16 bảng)
-- PHÂN HỆ 2 - Sourcing (7 bảng)
-- PHÂN HỆ 3 - Operations (4 bảng)
-- PHÂN HỆ 4 - System (5 bảng)
-- PHÂN HỆ 6 - Enterprise Integration Hub (5 bảng):
--   integration_endpoints, outbox_events, webhook_deliveries,
--   file_sync_logs, idempotent_event_logs
-- ============================================================

-- ============================================================
-- PHÂN HỆ 7: ROW LEVEL SECURITY (RLS)
-- ============================================================

DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN
        SELECT unnest(ARRAY[
            'roles', 'users', 'workflows', 'workflow_versions',
            'workflow_stages', 'workflow_transitions', 'doc_types', 'stage_doc_rules',
            'stage_checklist_items', 'project_checklist_status', 'stage_notifications',
            'projects', 'project_members', 'project_documents', 'document_audit_logs',
            'project_transition_logs', 'project_comments', 'rfqs', 'rfq_evaluation_criteria',
            'rfq_line_items', 'rfq_vendors', 'magic_links', 'quotations', 'quotation_line_items',
            'workflow_stage_tasks', 'project_tasks', 'shipments', 'shipment_milestones',
            'shipment_costs', 'notifications', 'activity_logs', 'user_sessions',
            'system_settings', 'file_attachments',
            'integration_endpoints', 'outbox_events', 'webhook_deliveries',
            'file_sync_logs', 'idempotent_event_logs'
        ])
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format(
            'CREATE POLICY tenant_isolation_policy ON %I FOR ALL USING (tenant_id = current_setting(''app.current_tenant_id'', true)::uuid);',
            t
        );
    END LOOP;
END;
$$;


