package com.mibid.redis.lock;

import com.mibid.core.exception.AppException;
import com.mibid.core.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

/**
 * Trình bao bọc Khóa phân tán Redisson Lock bảo vệ tính toàn vẹn dữ liệu trong môi trường song song.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RedissonLockManager {

    private final RedissonClient redissonClient;

    public <T> T executeWithLock(String lockKey, long waitTimeSec, long leaseTimeSec, Supplier<T> supplier) {
        RLock lock = redissonClient.getLock(lockKey);
        boolean acquired = false;
        try {
            acquired = lock.tryLock(waitTimeSec, leaseTimeSec, TimeUnit.SECONDS);
            if (!acquired) {
                log.warn("Không thể chiếm giữ khóa phân tán [Key: {}] sau {}s", lockKey, waitTimeSec);
                throw new AppException(ErrorCode.GATEKEEPER_LOCK_BUSY);
            }
            log.debug("Đã chiếm giữ khóa phân tán thành công: {}", lockKey);
            return supplier.get();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "error.lock.interrupted", e);
        } finally {
            if (acquired && lock.isHeldByCurrentThread()) {
                lock.unlock();
                log.debug("Đã giải phóng khóa phân tán: {}", lockKey);
            }
        }
    }

    public void executeWithLock(String lockKey, long waitTimeSec, long leaseTimeSec, Runnable runnable) {
        executeWithLock(lockKey, waitTimeSec, leaseTimeSec, () -> {
            runnable.run();
            return null;
        });
    }
}
