/**
 * KỊCH BẢN KIỂM THỬ TẢI CAO VÀ BẪY TOÀN VẸN DỮ LIỆU ĐỒNG THỜI (CONCURRENCY DATA INTEGRITY)
 * DỰ ÁN: NỀN TẢNG QUẢN LÝ GÓI THẦU VÀ HỒ SƠ THẦU XNK (MIBID)
 * CÔNG CỤ: k6 (Grafana Labs)
 * TẢI MỤC TIÊU: 1.000 RPS | P95 < 200ms | Tỷ lệ lỗi < 0.1%
 * 
 * =========================================================================================
 * HƯỚNG DẪN THỰC THI TRÊN MÔI TRƯỜNG STAGING / PRE-PRODUCTION:
 * 1. Chạy bài kiểm thử tải:
 *    k6 run --env BASE_URL=https://staging-api.mibid.vn docs/19-k6-loadtest.js
 * 
 * 2. CÂU LỆNH SQL ĐỐI SOÁT DỮ LIỆU ĐỒNG THỜI SAU KHI CHẠY (POST-LOAD VERIFICATION SQL):
 *    -- Bài 1: Đối soát chống rẽ nhánh bước đôi trên Kanban:
 *    SELECT project_id, COUNT(*) as active_stages 
 *    FROM projects 
 *    GROUP BY project_id HAVING COUNT(DISTINCT current_stage_id) > 1;
 *    --> KẾT QUẢ KỲ VỌNG: 0 rows (Không có dự án nào có 2 trạng thái cùng lúc)
 * 
 *    -- Bài 2: Đối soát chống nộp trùng báo giá Magic Link:
 *    SELECT rfq_id, vendor_email, COUNT(*) as submission_count 
 *    FROM quotations 
 *    GROUP BY rfq_id, vendor_email HAVING COUNT(*) > 1;
 *    --> KẾT QUẢ KỲ VỌNG: 0 rows (Không có nhà cung cấp nào nộp báo giá trùng lặp)
 * 
 *    -- Bài 3: Đối soát chống phê duyệt kép 2 Vendor cùng trúng:
 *    SELECT rfq_id, COUNT(*) as approved_count 
 *    FROM quotations 
 *    WHERE status = 'APPROVED' 
 *    GROUP BY rfq_id HAVING COUNT(*) > 1;
 *    --> KẾT QUẢ KỲ VỌNG: 0 rows (Mỗi RFQ chỉ có tối đa đúng 1 báo giá được duyệt)
 * 
 *    -- Bài 4: Đối soát giám sát Connection Pool HikariCP & Deadlock PostgreSQL:
 *    SELECT count(*) as active_connections, state FROM pg_stat_activity GROUP BY state;
 *    SELECT * FROM pg_stat_database_conflicts WHERE datname = 'mibid_staging';
 * =========================================================================================
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Định nghĩa các chỉ số đo kiểm tùy biến
const ErrorRate = new Rate('error_rate');
const TransitionDuration = new Trend('transition_duration_ms');
const MagicLinkDuration = new Trend('magiclink_submit_duration_ms');
const ApprovalDuration = new Trend('approval_duration_ms');

const SuccessTransitions = new Counter('concurrency_transition_success');
const BlockedTransitions = new Counter('concurrency_transition_blocked');

const SuccessMagicSubmits = new Counter('concurrency_magiclink_success');
const DuplicateMagicSubmits = new Counter('concurrency_magiclink_duplicate_blocked');

// Cấu hình các kịch bản kiểm thử tải dồn dập
export const options = {
  scenarios: {
    // Kịch bản 1: Đo kiểm năng lực chịu tải thường trực 1.000 RPS
    sustained_load: {
      executor: 'ramping-arrival-rate',
      startRate: 100,
      timeUnit: '1s',
      preAllocatedVUs: 200,
      maxVUs: 1000,
      stages: [
        { duration: '30s', target: 500 },   // Khởi động tăng tải lên 500 RPS
        { duration: '1m',  target: 1000 },  // Đạt đỉnh 1.000 RPS
        { duration: '2m',  target: 1000 },  // Duy trì tải 1.000 RPS trong 2 phút
        { duration: '30s', target: 0 },     // Hạ tải an toàn
      ],
      exec: 'testSustainedTraffic',
    },

    // Kịch bản 2: Bài bẫy Concurrency 1 - Xung đột kéo thẻ Kanban đồng thời (100 VUs cùng kéo 1 thẻ)
    trap_kanban_transition: {
      executor: 'per-vu-iterations',
      vus: 100,
      iterations: 1,
      startTime: '4m30s',
      exec: 'testKanbanConcurrencyTrap',
    },

    // Kịch bản 3: Bài bẫy Concurrency 2 - Nộp trùng báo giá Magic Link (50 VUs cùng nộp 1 token)
    trap_magiclink_double_submission: {
      executor: 'per-vu-iterations',
      vus: 50,
      iterations: 1,
      startTime: '5m',
      exec: 'testMagicLinkDoubleSubmitTrap',
    },

    // Kịch bản 4: Bài bẫy Concurrency 3 - Phê duyệt kép 2 Vendor cùng lúc (20 VUs duyệt chéo)
    trap_double_approval: {
      executor: 'per-vu-iterations',
      vus: 20,
      iterations: 1,
      startTime: '5m30s',
      exec: 'testDoubleApprovalTrap',
    }
  },
  thresholds: {
    // Tiêu chuẩn nghiệm thu phi chức năng Viettel
    'http_req_duration': ['p(95)<200', 'p(99)<500'], // 95% request phải phản hồi dưới 200ms
    'error_rate': ['rate<0.001'],                     // Tỷ lệ lỗi HTTP dưới 0.1%
    'concurrency_transition_success': ['count==1'],    // Đúng 1 giao dịch chuyển bước thành công
    'concurrency_magiclink_success': ['count==1'],     // Đúng 1 lượt nộp báo giá thành công
    'concurrency_magiclink_duplicate_blocked': ['count==49'], // 49 lượt còn lại bị chặn an toàn
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://staging-api.mibid.vn';
const AUTH_TOKEN = __ENV.JWT_TOKEN || 'Bearer mock_test_token';

// -------------------------------------------------------------
// 1. Hàm thực thi Kịch bản 1: Tải thường trực 1.000 RPS
// -------------------------------------------------------------
export function testSustainedTraffic() {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': AUTH_TOKEN,
  };

  // Giả lập truy vấn dữ liệu Bảng Kanban và Danh sách dự án
  const res = http.get(`${BASE_URL}/api/v1/projects?status=IN_PROGRESS`, { headers });
  
  const isOk = check(res, {
    'Sustained status 200': (r) => r.status === 200,
    'Sustained latency < 200ms': (r) => r.timings.duration < 200,
  });

  ErrorRate.add(!isOk);
}

// -------------------------------------------------------------
// 2. Hàm thực thi Bài bẫy 1: Xung đột kéo thẻ Kanban đồng thời
// -------------------------------------------------------------
export function testKanbanConcurrencyTrap() {
  const projectId = 'c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f';
  const targetStageId = 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e';

  const payload = JSON.stringify({
    target_stage_id: targetStageId,
    force_warning: false,
    transition_note: 'Kiểm thử tải đồng thời 100 VUs',
  });

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': AUTH_TOKEN,
  };

  const start = Date.now();
  const res = http.post(`${BASE_URL}/api/v1/projects/${projectId}/transitions`, payload, { headers });
  TransitionDuration.add(Date.now() - start);

  if (res.status === 200) {
    SuccessTransitions.add(1);
  } else if (res.status === 409 || res.status === 423) {
    BlockedTransitions.add(1);
  } else {
    ErrorRate.add(1);
  }

  check(res, {
    'Trap 1: Status hợp lệ (200 hoặc 409/423)': (r) => [200, 409, 423].includes(r.status),
  });
}

// -------------------------------------------------------------
// 3. Hàm thực thi Bài bẫy 2: Nộp trùng báo giá Magic Link
// -------------------------------------------------------------
export function testMagicLinkDoubleSubmitTrap() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.magic_link_test_token';
  
  const payload = JSON.stringify({
    token: token,
    currency: 'USD',
    freight_cost: 350.0,
    insurance_cost: 40.0,
    eta_date: '2026-09-25',
    items: [
      {
        line_item_id: 'e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b',
        unit_price: 52.0,
        lead_time_days: 10,
      }
    ]
  });

  const headers = {
    'Content-Type': 'application/json',
  };

  const start = Date.now();
  const res = http.post(`${BASE_URL}/api/v1/portal/quotations`, payload, { headers });
  MagicLinkDuration.add(Date.now() - start);

  if (res.status === 200 || res.status === 201) {
    SuccessMagicSubmits.add(1);
  } else if (res.status === 409) {
    DuplicateMagicSubmits.add(1);
  } else {
    ErrorRate.add(1);
  }

  check(res, {
    'Trap 2: Chỉ 1 request được ghi nhận (201/409)': (r) => [200, 201, 409].includes(r.status),
  });
}

// -------------------------------------------------------------
// 4. Hàm thực thi Bài bẫy 3: Phê duyệt kép 2 Vendor cùng lúc
// -------------------------------------------------------------
export function testDoubleApprovalTrap() {
  const quotationId = __VU % 2 === 0 
    ? 'q1111111-2222-3333-4444-555555555555' 
    : 'q9999999-8888-7777-6666-555555555555';

  const payload = JSON.stringify({
    note: 'Kiểm thử phê duyệt đồng thời từ 2 Manager',
  });

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': AUTH_TOKEN,
  };

  const start = Date.now();
  const res = http.post(`${BASE_URL}/api/v1/quotations/${quotationId}/approve`, payload, { headers });
  ApprovalDuration.add(Date.now() - start);

  check(res, {
    'Trap 3: Trạng thái duyệt hợp lệ (200 hoặc 409)': (r) => [200, 409].includes(r.status),
  });
}
