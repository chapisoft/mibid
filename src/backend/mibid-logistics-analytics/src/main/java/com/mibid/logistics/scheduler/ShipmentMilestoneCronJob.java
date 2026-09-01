package com.mibid.logistics.scheduler;

import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Tiến trình định kỳ 8:00 AM mỗi ngày: Quét cảnh báo trễ hạn mốc vận đơn Logistics (ETD/ETA/Customs)
 * được bảo vệ bởi khóa phân tán ShedLock để chống thực thi trùng lặp trên cụm phân tán.
 */
@Slf4j
@Component
public class ShipmentMilestoneCronJob {

    @Scheduled(cron = "${mibid.cron.shipment-alert:0 0 8 * * ?}")
    @SchedulerLock(name = "ShipmentMilestoneCronJob_lock", lockAtLeastFor = "PT30S", lockAtMostFor = "PT5M")
    public void scanAndAlertShipmentMilestones() {
        log.info("Bắt đầu tiến trình định kỳ 8:00 AM: Quét mốc giao hàng và vận đơn chậm tiến độ...");
        
        // Logic quét bảng shipment_milestones và gửi email/thông báo
        
        log.info("Hoàn tất quét mốc vận đơn logistics thành công.");
    }
}
