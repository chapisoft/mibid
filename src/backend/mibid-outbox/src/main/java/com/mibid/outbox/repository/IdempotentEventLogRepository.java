package com.mibid.outbox.repository;

import com.mibid.outbox.domain.IdempotentEventLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface IdempotentEventLogRepository extends JpaRepository<IdempotentEventLogEntity, String> {
    void deleteAllByExpireAtBefore(LocalDateTime now);
}
