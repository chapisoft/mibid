package com.mibid.iam.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Thực thể Cảnh báo và Nhắc cước hết hạn tự động cho MIBID.
 */
@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "subscription_notifications")
public class SubscriptionNotification {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "tenant_id", length = 50, nullable = false)
    private String tenantId;

    @Column(name = "subscription_id", length = 50)
    private String subscriptionId;

    @Column(name = "notification_type", length = 50, nullable = false)
    private String notificationType;

    @Column(name = "recipient_email", length = 255)
    private String recipientEmail;

    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "days_remaining")
    private Integer daysRemaining;

    @CreationTimestamp
    @Column(name = "sent_at", nullable = false, updatable = false)
    private LocalDateTime sentAt;

    @Column(name = "status", length = 20, nullable = false)
    private String status; // SENT, FAILED, PENDING
}
