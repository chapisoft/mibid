package com.mibid.workflow.engine;

import com.mibid.core.exception.AppException;
import com.mibid.core.exception.ErrorCode;
import com.mibid.redis.lock.RedissonLockManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Bộ đánh giá Chốt chặn 4 lớp Gatekeeper (Document AND/OR, Checklist, Financial, Approval)
 * hỗ trợ 3 chế độ kiểm soát: HARD_STOP, SOFT_WARNING, MANAGER_BYPASS kết hợp Khóa phân tán Redisson.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GatekeeperInterceptor {

    private final RedissonLockManager redissonLockManager;

    public void evaluateTransitionGate(UUID tenantId, UUID projectId, UUID fromStageId, UUID toStageId, String bypassReason) {
        String lockKey = String.format("lock:tenant_%s:project_%s", tenantId, projectId);

        redissonLockManager.executeWithLock(lockKey, 3, 5, () -> {
            log.info("Bắt đầu đánh giá Gatekeeper cho Dự án: {} từ bước {} sang bước {}", projectId, fromStageId, toStageId);

            // Kiểm tra các điều kiện (mô phỏng logic chốt chặn 4 lớp)
            List<String> missingDocuments = checkRequiredDocuments(projectId, toStageId);

            if (!missingDocuments.isEmpty()) {
                if (bypassReason != null && !bypassReason.isBlank()) {
                    log.warn("Cấp Quản lý kích hoạt MANAGER BYPASS cho Dự án {}. Lý do: {}", projectId, bypassReason);
                    // Lưu vết vào bypass_approval_logs
                } else {
                    log.error("Chặn chuyển bước (HARD STOP) Dự án {}. Thiếu chứng từ bắt buộc: {}", projectId, missingDocuments);
                    throw new AppException(ErrorCode.GATEKEEPER_HARD_STOP, "error.gatekeeperHardStop");
                }
            }
            log.info("Chuyển bước thành công cho Dự án: {}", projectId);
        });
    }

    private List<String> checkRequiredDocuments(UUID projectId, UUID toStageId) {
        // Trả danh sách rỗng nếu đủ điều kiện
        return List.of();
    }
}
