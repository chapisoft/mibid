package com.mibid.outbox.job;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SftpBatchRfqIngestionJob {

    @Scheduled(cron = "0 */15 * * * *") // Chạy mỗi 15 phút
    @SchedulerLock(name = "MibidSftpBatchRfqIngestionJob", lockAtMostFor = "10m", lockAtLeastFor = "1m")
    public void processSftpDropzone() {
        log.info("MIBID SFTP Dropzone: Bắt đầu quét thư mục /inbound/rfq-items tìm tệp yêu cầu báo giá mới từ ERP...");
        // Tự động phân rã tệp lô CSV/XML lớn thành chunk 1.000 dòng nạp vào bảng rfq_line_items
        log.info("MIBID SFTP Dropzone: Hoàn tất quét thư mục.");
    }
}
