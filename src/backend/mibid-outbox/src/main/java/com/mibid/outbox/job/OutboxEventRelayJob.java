package com.mibid.outbox.job;

import com.mibid.outbox.domain.OutboxEvent;
import com.mibid.outbox.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxEventRelayJob {

    private final OutboxEventRepository outboxRepo;

    @Scheduled(fixedDelay = 3000) // Quét mỗi 3 giây
    @SchedulerLock(name = "MibidOutboxEventRelayJob", lockAtMostFor = "5s", lockAtLeastFor = "1s")
    @Transactional
    public void relayPendingEvents() {
        List<OutboxEvent> pendingEvents = outboxRepo.findTop50ByStatusOrderByCreatedAtAsc("PENDING");
        if (pendingEvents.isEmpty()) {
            return;
        }

        log.info("MIBID Outbox: Đang điều phối {} sự kiện sang Kafka / Webhook đối tác...", pendingEvents.size());
        for (OutboxEvent event : pendingEvents) {
            try {
                // Giả lập điều phối sự kiện sang Kafka Topic / Webhook đối tác
                event.setStatus("PUBLISHED");
                event.setProcessedAt(LocalDateTime.now());
            } catch (Exception ex) {
                log.error("MIBID Outbox: Lỗi điều phối sự kiện ID {}: {}", event.getId(), ex.getMessage());
                event.setRetryCount(event.getRetryCount() + 1);
                if (event.getRetryCount() >= 5) {
                    event.setStatus("DLQ");
                }
            }
            outboxRepo.save(event);
        }
    }
}
