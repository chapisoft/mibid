---
name: loadtest-concurrency-writer
description: >-
  Kỹ năng chuyên sâu để thiết kế kịch bản, sinh mã đo kiểm tải cao (k6 / JMeter)
  và thiết kế các bài bẫy toàn vẹn dữ liệu đồng thời (Concurrency Data Integrity).
  Sử dụng kỹ năng này khi người dùng yêu cầu: viết kịch bản test tải, thiết kế kịch bản k6,
  bẫy lỗi gạch nợ trùng Webhook, bẫy tranh chấp số dư tài chính, đo kiểm cạn kiệt Connection Pool HikariCP,
  hoặc lập báo cáo nghiệm thu hiệu năng phi chức năng.
---

# KỸ NĂNG: THIẾT KẾ KỊCH BẢN ĐO KIỂM TẢI CAO VÀ BẪY TOÀN VẸN DỮ LIỆU (LOADTEST-CONCURRENCY-WRITER)

Kỹ năng này cung cấp phương pháp luận và các mẫu kịch bản đo kiểm tải cao trên công cụ **k6** và **JMeter**, tập trung cốt lõi vào việc phát hiện các lỗi tranh chấp dữ liệu đồng thời, nghẽn kết nối cơ sở dữ liệu và bảo đảm toàn vẹn số dư tài chính.

---

## 1. NGUYÊN TẮC BẮT BUỘC KHI KIỂM THỬ TẢI

1. **Khẳng định Toàn vẹn Dữ liệu (Data Integrity Assertion):**
   * Mọi bài đo kiểm tải không chỉ đo lường thời gian đáp ứng (Latency) và số lượng yêu cầu mỗi giây (RPS), mà **bắt buộc phải có câu lệnh SQL kiểm tra đối soát CSDL sau khi bài test kết thúc**.
   * Ví dụ: Bắn 100 Webhook thanh toán trùng mã giao dịch → CSDL bắt buộc chỉ có đúng 1 bản ghi được gạch nợ, 99 request sau bị từ chối an toàn.
2. **Nguyên tắc Bằng chứng Thực chứng:**
   * Mọi báo cáo tải phải đính kèm: (1) Tệp mã nguồn k6 (`.js`) hoặc JMeter (`.jmx`), (2) Cấu hình phần cứng môi trường đo kiểm, (3) Tệp nhật ký log đo kiểm thực tế.

---

## 2. QUY TRÌNH THIẾT KẾ BÀI TEST TẢI 4 BƯỚC

```mermaid
flowchart LR
    subgraph S_STEP_12 ["BƯỚC 1 & 2: THIẾT LẬP MÔ HÌNH VÀ KỊCH BẢN"]
        direction TB
        ST1["BƯỚC 1: XÁC ĐỊNH MỤC TIÊU & CHỈ SỐ NFR<br/>• Thông lượng mục tiêu (Ví dụ: 1.000 RPS)<br/>• Ngưỡng thời gian đáp ứng (P95 < 200ms, Error < 0.1%)<br/>• Điểm nghẽn tài nguyên cần bẫy (DB Pool, Cache, Lock)"]
        ST2["BƯỚC 2: THIẾT KẾ KỊCH BẢN TẢI K6<br/>• Cấu hình Ramping Stages (Warm up → Peak → Cooldown)<br/>• Tạo dữ liệu kiểm thử giả lập (Mock Data Payload)<br/>• Gắn Headers xác thực JWT và Idempotency Key"]
        ST1 --> ST2
    end

    subgraph S_STEP_34 ["BƯỚC 3 & 4: THỰC THI VÀ ĐỐI SOÁT TOÀN VẸN"]
        direction TB
        ST3["BƯỚC 3: THỰC THI & GIÁM SÁT HẠ TẦNG<br/>• Giám sát Connection Pool HikariCP (active/pending)<br/>• Giám sát CPU, RAM, Thread Dump và Deadlock CSDL<br/>• Thu thập Metrics độ trễ chi tiết"]
        ST4["BƯỚC 4: ĐỐI SOÁT CSDL & XUẤT BÁO CÁO<br/>• Chạy câu lệnh SQL kiểm tra không gạch nợ trùng<br/>• Kiểm tra tổng số dư sổ cái khớp 100%<br/>• Đóng gói báo cáo kỹ thuật kèm bằng chứng thực chứng"]
        ST3 --> ST4
    end

    ST2 --> ST3
```

---

## 3. BỐN BÀI BẪY DỮ LIỆU ĐỒNG THỜI CHUẨN MỰC

1. **Bẫy 1: Gạch nợ trùng lặp (Duplicate Webhook Stress Test):**
   * Bắn 100 requests Webhook có cùng `transaction_code` trong 100ms từ 100 Virtual Users (VUs) song song.
   * Kiểm tra Khóa phân tán Redisson và Unique Constraint CSDL.
2. **Bẫy 2: Tranh chấp số dư tài chính (Balance Race Condition):**
   * 500 VUs đồng thời ghi nhận giao dịch và cập nhật số dư cho cùng một tài khoản.
   * Kiểm tra Pessimistic Lock (`SELECT ... FOR UPDATE`) và Isolation Level.
3. **Bẫy 3: Cạn kiệt Connection Pool (HikariCP Exhaustion):**
   * Bắn tải 1.000 RPS liên tục 15 phút với các câu truy vấn phức tạp.
   * Đảm bảo `pending connections = 0`, không phát sinh `ConnectionTimeoutException`.
4. **Bẫy 4: Đứt kết nối bất đồng bộ (Outbox Partition Stress Test):**
   * Giả lập ngắt kết nối dịch vụ ngoài 30 phút khi đang nhận tải lớn.
   * Đảm bảo sự kiện được lưu an toàn trong bảng `outbox_events` và tự động gửi bù khi kết nối trở lại.
