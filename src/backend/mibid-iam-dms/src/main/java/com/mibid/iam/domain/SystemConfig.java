package com.mibid.iam.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Bảng cấu hình hệ thống tập trung.
 *
 * <p>Thay thế toàn bộ giá trị magic number và tham số nghiệp vụ hardcoded trong code.
 * Mọi tham số vận hành phải được lưu tại đây và truy xuất qua {@link SystemConfigRepository}.
 *
 * <p>Bảng: {@code system_config}
 *
 * <p>Ví dụ các key được dùng:
 * <ul>
 *   <li>{@code subscription.default.plan.code} — mã gói dịch vụ mặc định khi tạo mới</li>
 *   <li>{@code subscription.default.billing.cycle} — chu kỳ thanh toán mặc định (MONTHLY/YEARLY)</li>
 *   <li>{@code subscription.default.grace.period.days} — số ngày ân hạn mặc định</li>
 *   <li>{@code subscription.invoice.due.days} — số ngày đến hạn thanh toán hóa đơn</li>
 *   <li>{@code subscription.default.currency} — đơn vị tiền tệ mặc định</li>
 * </ul>
 */
@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "system_config")
public class SystemConfig {

    @Id
    @Column(name = "config_key", length = 200, nullable = false)
    private String configKey;

    @Column(name = "config_value", length = 2000, nullable = false)
    private String configValue;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "data_type", length = 50)
    private String dataType; // STRING, INTEGER, BOOLEAN, DECIMAL

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
