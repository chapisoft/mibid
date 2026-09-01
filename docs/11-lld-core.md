# THIẾT KẾ CHI TIẾT CẤP THẤP (LOW-LEVEL DESIGN - LLD) — PHẦN TỔNG QUAN
## KIẾN TRÚC LỤC GIÁC CORE, NỀN TẢNG ĐA KHÁCH THUÊ VÀ OUTBOX PATTERN
### MÃ TÀI LIỆU: MIBID_LLD_CORE_v1.0

---

## 1. TỔNG QUAN VÀ MÔ HÌNH KIẾN TRÚC LỤC GIÁC (HEXAGONAL ARCHITECTURE)

Hệ thống Backend Mibid được xây dựng trên nền tảng Java 17 và Spring Boot 3 theo mô hình Kiến trúc Lục giác (Hexagonal Architecture / Ports and Adapters) kết hợp thiết kế hướng miền (Domain-Driven Design - DDD). Mô hình này cô lập tuyệt đối lõi nghiệp vụ (Domain Core) khỏi các phụ thuộc bên ngoài như cơ sở dữ liệu quan hệ, bộ nhớ đệm Redis, giao thức HTTP hoặc các cổng dịch vụ bên thứ ba.

```mermaid
flowchart LR
    subgraph S_DRIVING ["TẦNG CỔNG VÀO (INBOUND PORTS & ADAPTERS)"]
        direction TB
        A_REST["Web REST Controller (Spring MVC)"]
        A_PORTAL["Vendor Portal Controller (Magic Link)"]
        A_CRON["ShedLock Scheduled Tasks (8:00 AM Cron)"]
    end

    subgraph S_CORE ["LÕI MIỀN NGHIỆP VỤ (DOMAIN CORE & PORTS)"]
        direction TB
        P_IN["Inbound Use Case Ports (Service Interfaces)"]
        CORE_LOGIC["Domain Entities, Value Objects & Domain Services"]
        P_OUT["Outbound Ports (Repository & Gateway Interfaces)"]
        P_IN --> CORE_LOGIC --> P_OUT
    end

    subgraph S_DRIVEN ["TẦNG CỔNG RA (OUTBOUND PORTS & ADAPTERS)"]
        direction TB
        A_JPA["PostgreSQL Spring Data JPA & RLS Adapter"]
        A_REDIS["Redis Distributed Lock & Cache Adapter"]
        A_S3["Amazon S3 Pre-signed URL Storage Adapter"]
        A_SMTP["JavaMail SMTP Notification Gateway Adapter"]
    end

    A_REST --> P_IN
    A_PORTAL --> P_IN
    A_CRON --> P_IN

    P_OUT --> A_JPA
    P_OUT --> A_REDIS
    P_OUT --> A_S3
    P_OUT --> A_SMTP
```

---

## 2. CƠ CHẾ CÁCH LY ĐA KHÁCH THUÊ (MULTI-TENANCY CONTEXT)

Hệ thống áp dụng mô hình chia sẻ cơ sở dữ liệu và chia sẻ bảng (Shared Database, Shared Schema) nhưng cách ly tuyệt đối dữ liệu bằng khóa ngoại `tenant_id` kết hợp cơ chế Row-Level Security (RLS) của PostgreSQL.

```mermaid
sequenceDiagram
    autonumber
    actor Client as Người Dùng
    participant Filter as TenantContextFilter
    participant Context as ThreadLocal TenantContext
    participant JPA as Hibernate TenantAwareInterceptor
    participant DB as PostgreSQL 15+ Session

    Client->>Filter: Gửi HTTP Request kèm Header [Authorization: Bearer <JWT>]
    activate Filter
    Filter->>Filter: Giải mã JWT Token, trích xuất tenant_id và user_id
    Filter->>Context: Thiết lập TenantContext.setCurrentTenant(tenantId)
    activate Context
    Filter->>JPA: Tiếp tục luồng xử lý Service nghiệp vụ
    activate JPA
    JPA->>DB: Thực thi câu lệnh gán biến phiên: SET LOCAL app.current_tenant_id = '...'
    activate DB
    DB-->>JPA: Xác nhận phiên làm việc đã được cách ly theo Tenant
    JPA->>DB: Thực thi truy vấn dữ liệu nghiệp vụ (Tự động lọc qua chính sách RLS)
    DB-->>JPA: Trả về tập kết quả thuộc riêng tenant hiện tại
    deactivate DB
    JPA-->>Filter: Trả kết quả về cho Controller
    deactivate JPA
    Filter->>Context: Xóa dữ liệu ThreadLocal: TenantContext.clear()
    deactivate Context
    Filter-->>Client: Trả về HTTP Response an toàn
    deactivate Filter
```

---

## 3. LỚP THỰC THỂ NỀN TẢNG DÙNG CHUNG (BASE ENTITIES)

Tất cả các thực thể nghiệp vụ trong hệ thống đều kế thừa từ lớp `BaseEntity` dùng chung nhằm đảm bảo tính thống nhất về quản lý khóa chính UUID v4 và thời gian kiểm toán:

```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "tenant_id", updatable = false, nullable = false)
    private UUID tenantId;

    @CreatedDate
    @Column(name = "created_at", updatable = false, nullable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Long version; // Khóa lạc quan (Optimistic Locking) chống Lost Update

    // Getters and Setters tiêu chuẩn
}
```

---

## 4. MÔ HÌNH BẢO ĐẢM TOÀN VẸN SỰ KIỆN PHÂN TÁN (TRANSACTIONAL OUTBOX PATTERN)

Khi một giao dịch nghiệp vụ làm thay đổi trạng thái gói thầu thành công (ví dụ: chuyển bước dự án hoặc phê duyệt báo giá), hệ thống không gọi trực tiếp các dịch vụ thông báo hoặc gửi email trong cùng tiến trình để tránh rủi ro treo giao dịch khi mạng chập chờn. Thay vào đó, sự kiện được ghi vào bảng `outbox_events` trong cùng một giao dịch nguyên tử cơ sở dữ liệu:

```mermaid
flowchart LR
    subgraph S_TX ["GIAO DỊCH NGUYÊN TỬ (ATOMIC LOCAL TRANSACTION)"]
        direction TB
        CMD["Lệnh Chuyển Bước / Duyệt Báo Giá"]
        BIZ_UPDATE["1. Cập nhật bảng nghiệp vụ (projects / quotations)"]
        OUTBOX_INSERT["2. Chèn sự kiện vào bảng outbox_events"]
        CMD --> BIZ_UPDATE --> OUTBOX_INSERT
    end

    subgraph S_DISPATCHER ["TIẾN TRÌNH NỀN (OUTBOX POLLING / DEBEZIUM)"]
        direction TB
        POLL["Bộ điều phối quét định kỳ các sự kiện CHƯA XỬ LÝ (PENDING)"]
        DISPATCH["Chuyển tiếp sự kiện tới WebSocket và Cổng SMTP Email"]
        MARK_DONE["Đánh dấu trạng thái sự kiện = PROCESSED"]
        POLL --> DISPATCH --> MARK_DONE
    end

    S_TX -->|Lưu CSDL| S_DISPATCHER
```

---

## 5. CƠ CHẾ CHỊU LỖI VÀ KHÓA PHÂN TÁN (RESILIENCE4J & REDIS LOCK)

1. **Khóa phân tán (Redis Distributed Lock):** Sử dụng thư viện Redisson để khóa định danh tài nguyên nhạy cảm (ví dụ `lock:project:transition:{projectId}`) với thời gian sống TTL tối đa 10 giây. Ngăn chặn triệt để 2 nhân viên cùng kéo 1 thẻ dự án sang 2 bước khác nhau đồng thời.
2. **Khả năng chịu lỗi và ngắt mạch (Resilience4j Circuit Breaker):**
   * Đối với các cổng dịch vụ bên ngoài như cổng gửi thư điện tử SMTP hoặc kho lưu trữ S3, hệ thống cấu hình bộ ngắt mạch: Nếu tỷ lệ lỗi vượt quá 50% trong 20 yêu cầu liên tiếp, Circuit Breaker sẽ chuyển sang trạng thái `OPEN`, tự động kích hoạt cơ chế thử lại (Retry with Exponential Backoff) và chuyển vào hàng đợi chờ xử lý sau.
