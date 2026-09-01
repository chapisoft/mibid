# THIẾT KẾ CHI TIẾT CẤP THẤP (LLD) — PHÂN HỆ 5
## THEO DÕI VẬN TẢI VÀ BÁO CÁO PHÂN TÍCH (LOGISTICS & BI ANALYTICS)
### MÃ TÀI LIỆU: MIBID_LLD_MOD05_v1.0

---

## 1. TỔNG QUAN PHÂN HỆ VÀ RANH GIỚI TRÁCH NHIỆM

Phân hệ 5 quản lý thông tin lô hàng vận tải đường biển/hàng không, theo dõi các mốc tiến độ giao nhận cam kết với chủ đầu tư (ETA/ETD), tích hợp tiến trình chạy ngầm định kỳ 8:00 AM với khóa phân tán ShedLock để tự động cảnh báo vi phạm thời hạn, đồng thời cung cấp các truy vấn tổng hợp báo cáo kinh doanh phục vụ ban giám đốc.

---

## 2. CỔNG VÀO (INBOUND PORTS) VÀ ĐẶC TẢ DTO

```java
public interface ShipmentManagementUseCase {
    ShipmentResponse createShipment(UUID projectId, CreateShipmentRequest request);
    void updateMilestoneStatus(UUID milestoneId, boolean isCompleted, LocalDate actualDate);
}

public interface MilestoneAlertSchedulerUseCase {
    void executeDailyMilestoneScan(); // Chạy lúc 8:00 AM hằng ngày
}

public interface AnalyticsQueryUseCase {
    WinLossReportResponse getWinLossReport(DateRangeRequest request);
    BottleneckReportResponse getBottleneckReport(DateRangeRequest request);
}
```

---

## 3. CỔNG RA (OUTBOUND PORTS)

```java
public interface ShipmentRepositoryPort {
    Optional<Shipment> findByBlNumber(String blNumber);
    Shipment save(Shipment shipment);
}

public interface MilestoneRepositoryPort {
    List<ShipmentMilestone> findPendingMilestonesBefore(LocalDate targetDate);
    ShipmentMilestone save(ShipmentMilestone milestone);
}

public interface AnalyticsRepositoryPort {
    WinLossDataDTO aggregateWinLossStats(UUID tenantId, LocalDate fromDate, LocalDate toDate);
    List<StageDwellTimeDTO> calculateBottlenecks(UUID tenantId, LocalDate fromDate, LocalDate toDate);
}
```

---

## 4. ĐẶC TẢ RESTFUL API CONTRACTS & OPENAPI SCHEMAS

### 4.1. Endpoint Lấy Báo Cáo Tỷ Lệ Trúng/Trượt Thầu
* **Đường dẫn:** `GET /api/v1/analytics/win-loss?from_date=2026-01-01&to_date=2026-09-01`
* **Response Payload (200 OK):**
```json
{
  "total_projects": 45,
  "won_count": 28,
  "lost_count": 17,
  "win_rate_percent": 62.22,
  "total_won_budget": 12500000000.0,
  "lost_reasons": [
    {
      "reason": "HIGH_PRICE",
      "count": 10,
      "percentage": 58.82
    },
    {
      "reason": "LEAD_TIME_TOO_LONG",
      "count": 5,
      "percentage": 29.41
    },
    {
      "reason": "MISSING_SPECIFICATION",
      "count": 2,
      "percentage": 11.77
    }
  ]
}
```

---

## 5. LOGIC TIẾN TRÌNH CHẠY NGẦM 8:00 AM VỚI SHEDLOCK

Tiến trình chạy ngầm được lập lịch kích hoạt vào đúng 8:00 AM mỗi sáng. Nhằm tránh việc nhiều nút máy chủ trong cụm Kubernetes cùng chạy trùng lặp một tác vụ gửi cảnh báo nhiều lần, hệ thống tích hợp thư viện ShedLock sử dụng cơ sở dữ liệu làm chốt khóa phân tán:

```java
@Component
public class DailyMilestoneAlertScheduler implements MilestoneAlertSchedulerUseCase {

    private final MilestoneRepositoryPort milestoneRepository;
    private final NotificationPort notificationPort;

    @Scheduled(cron = "0 0 8 * * *", zone = "Asia/Ho_Chi_Minh")
    @SchedulerLock(name = "DailyMilestoneAlert_Task", lockAtLeastFor = "5m", lockAtMostFor = "15m")
    @Transactional
    public void executeDailyMilestoneScan() {
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);

        // Truy vấn các mốc chưa hoàn thành có hạn kế hoạch đến ngày mai
        List<ShipmentMilestone> milestones = milestoneRepository.findPendingMilestonesBefore(tomorrow);

        for (ShipmentMilestone ms : milestones) {
            if (ms.getPlannedDate().isBefore(today)) {
                // Đã quá hạn so với kế hoạch -> Báo động đỏ
                notificationPort.sendInAppNotification(
                    ms.getAssignedUserId(),
                    "BÁO ĐỘNG ĐỎ: Lô hàng quá hạn mốc giao nhận",
                    String.format("Lô hàng BL %s đang bị trễ mốc %s (Kế hoạch: %s)", ms.getBlNumber(), ms.getMilestoneType(), ms.getPlannedDate()),
                    "/shipments/" + ms.getShipmentId()
                );
            } else if (ms.getPlannedDate().isEqual(tomorrow)) {
                // Sắp đến hạn vào ngày mai -> Nhắc nhở
                notificationPort.sendInAppNotification(
                    ms.getAssignedUserId(),
                    "Nhắc nhở: Lô hàng sắp đến mốc quan trọng",
                    String.format("Lô hàng BL %s sẽ đến mốc %s vào ngày mai (%s)", ms.getBlNumber(), ms.getMilestoneType(), ms.getPlannedDate()),
                    "/shipments/" + ms.getShipmentId()
                );
            }
        }
    }
}
```

---

## 6. MA TRẬN MÃ LỖI NGHIỆP VỤ PHÂN HỆ 5

| Mã lỗi hệ thống | Mã HTTP | Mô tả nguyên nhân nghiệp vụ | Hướng xử lý phía Client |
| :--- | :---: | :--- | :--- |
| `SHIPMENT_BL_DUPLICATE` | 409 | Số vận đơn Bill of Lading đã tồn tại trên hệ thống. | Kiểm tra lại số BL từ hãng tàu. |
| `MILESTONE_DATE_INVALID` | 400 | Ngày thực tế trước ngày xuất xưởng hoặc không hợp lệ. | Nhập đúng trình tự logic thời gian. |
| `ANALYTICS_DATE_RANGE_INVALID` | 400 | Khoảng thời gian lọc không hợp lệ (Ngày bắt đầu > kết thúc). | Chọn lại khoảng ngày hợp lệ. |
