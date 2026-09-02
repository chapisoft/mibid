package com.mibid.iam.repository;

import com.mibid.iam.domain.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Kho lưu trữ truy vấn cấu hình hệ thống tập trung từ bảng {@code system_config}.
 */
@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfig, String> {

    Optional<SystemConfig> findByConfigKeyAndActiveTrue(String configKey);

    Optional<SystemConfig> findByConfigKey(String configKey);

    default Optional<String> findValueByKey(String configKey) {
        return findByConfigKeyAndActiveTrue(configKey).map(c -> c.getConfigValue());
    }

    default String getStringValue(String configKey, String fallback) {
        return findValueByKey(configKey).orElse(fallback);
    }

    default int getIntValue(String configKey, int fallback) {
        return findValueByKey(configKey)
                .map(val -> {
                    try {
                        return Integer.parseInt(val.trim());
                    } catch (NumberFormatException e) {
                        return fallback;
                    }
                })
                .orElse(fallback);
    }
}
