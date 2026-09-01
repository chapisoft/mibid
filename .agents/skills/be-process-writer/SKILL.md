---
name: be-process-writer
description: >-
  Kỹ năng chuyên sâu để thiết kế và đặc tả kiến trúc Backend Java Spring Boot,
  các luồng xử lý tiến trình ngầm (Cronjob, Batch Processing, Kafka Consumer/Publisher),
  áp dụng kiến trúc Hexagonal (Ports & Adapters) và các mẫu thiết kế chịu lỗi (Resilience Patterns).
  Sử dụng kỹ năng này khi người dùng yêu cầu: đặc tả luồng xử lý backend, thiết kế tiến trình batch import file lớn,
  thiết kế Outbox Pattern, cấu hình Circuit Breaker / ShedLock, hoặc chuẩn hóa cấu trúc mã nguồn backend.
---

# KỸ NĂNG: ĐẶC TẢ KIẾN TRÚC BACKEND VÀ TIẾN TRÌNH HỆ THỐNG (BE-PROCESS-WRITER)

Kỹ năng này hướng dẫn quy trình chuẩn hóa để đặc tả và triển khai các thành phần xử lý Backend Java Spring Boot (Java 21 / Spring Boot 3.x), bảo đảm tính toàn vẹn giao dịch cơ sở dữ liệu, khả năng mở rộng và khả năng phục hồi lỗi phân tán.

---

## 1. QUY TRÌNH THIẾT KẾ BACKEND 5 BƯỚC

```mermaid
flowchart LR
    subgraph S_HEX_LAYER ["BƯỚC 1 & 2: PHÂN RÃ THEO KIẾN TRÚC LỤC GIÁC"]
        direction TB
        ST1["BƯỚC 1: XÁC ĐỊNH PHẠM VI TIẾN TRÌNH<br/>• Phân loại: API đồng bộ, Cronjob hay Xử lý sự kiện<br/>• Xác định dịch vụ đảm nhiệm (Core, Scheduler, Report)"]
        ST2["BƯỚC 2: THIẾT KẾ DOMAIN & APPLICATION LAYER<br/>• Thiết kế Entity/Aggregate POJO thuần túy<br/>• Thiết kế Use Case Interfaces (Inbound Ports)<br/>• Thiết kế Repository & Publisher Interfaces (Outbound Ports)"]
        ST1 --> ST2
    end

    subgraph S_ADAPT_RESIL ["BƯỚC 3, 4 & 5: ADAPTERS VÀ CHỊU LỖI"]
        direction TB
        ST3["BƯỚC 3: THIẾT KẾ ADAPTERS IN & OUT<br/>• Adapter In: REST Controller, Kafka Consumer, Scheduler<br/>• Adapter Out: Spring Data JPA, Feign Client, Outbox"]
        ST4["BƯỚC 4: ÁP DỤNG CÁC RESILIENCE PATTERNS<br/>• Transactional Outbox Pattern cho sự kiện Kafka<br/>• Resilience4j Circuit Breaker & Retry khi gọi đối tác<br/>• Khóa phân tán ShedLock và Consumer Idempotency"]
        ST5["BƯỚC 5: XỬ LÝ LÔ (BATCH) VÀ KIỂM ĐỊNH<br/>• Cắt nhỏ danh sách xử lý theo Chunk (Batch Insert)<br/>• Rà soát Zero-Hardcode và Clean Imports 4 nhóm<br/>• Đóng gói đặc tả kỹ thuật hoàn chỉnh"]
        ST3 --> ST4
        ST4 --> ST5
    end

    ST2 --> ST3
```

---

## 2. QUY CHUẨN CẤU TRÚC GÓI MÃ NGUỒN (HEXAGONAL ARCHITECTURE)

```text
com.mascom.system.[feature_name]/
├── domain/                  # TẦNG TRUNG TÂM (Độc lập Framework)
│   ├── model/               # Thực thể nghiệp vụ POJO
│   ├── exception/           # Ngoại lệ nghiệp vụ (Business Exceptions)
│   └── repository/          # Cổng giao tiếp xuất (Outbound Ports Interface)
├── application/             # TẦNG USE CASE (Logic điều phối)
│   ├── dto/                 # Request DTO, Response DTO
│   ├── port/in/             # Use Case Interfaces (Inbound Ports)
│   └── service/             # Cài đặt Use Case, quản lý @Transactional
└── adapter/                 # TẦNG GIAO TIẾP HẠ TẦNG
    ├── in/                  # Đầu vào
    │   ├── web/             # Spring @RestController
    │   ├── consumer/        # @KafkaListener (Idempotent)
    │   └── scheduler/       # @Scheduled (ShedLock)
    └── out/                 # Đầu ra
        ├── persistence/     # Spring Data JPA Repository & MapStruct
        ├── api/             # Feign Client tích hợp đối tác
        └── publisher/       # Outbox Table Publisher
```

---

## 3. CHECKLIST KIỂM ĐỊNH MÃ NGUỒN BACKEND

- [ ] **Phân tầng:** Tách biệt rõ ràng 3 lớp `domain`, `application`, `adapter`. Không để lộ JPA Entity ra RestController.
- [ ] **Transaction:** Quản lý `@Transactional` chính xác. Tác vụ đọc dùng `@Transactional(readOnly = true)`.
- [ ] **Xử lý bất đồng bộ:** Áp dụng Transactional Outbox Pattern khi vừa ghi CSDL vừa đẩy sự kiện Kafka.
- [ ] **Chống trùng lặp:** Mọi Kafka Consumer và Webhook Controller đều có bẫy Idempotency kiểm tra `event_id` / `request_id`.
- [ ] **Clean Code:** Không dùng Fully Qualified Names (FQN) trong thân code. Gom nhóm import chuẩn 4 nhóm.
- [ ] **Zero-Hardcode:** 100% mã trạng thái và tham số nghiệp vụ được định nghĩa bằng Domain Enums / Constants.
