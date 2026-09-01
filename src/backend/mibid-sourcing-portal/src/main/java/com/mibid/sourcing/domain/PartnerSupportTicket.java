package com.mibid.sourcing.domain;

import com.mibid.core.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "partner_support_tickets")
public class PartnerSupportTicket extends BaseEntity {

    @Column(name = "ticket_code", nullable = false, length = 64)
    private String ticketCode;

    @Column(name = "partner_name", nullable = false, length = 255)
    private String partnerName;

    @Column(name = "partner_email", nullable = false, length = 150)
    private String partnerEmail;

    @Column(name = "rfq_code", length = 64)
    private String rfqCode;

    @Column(name = "issue_type", nullable = false, length = 64)
    private String issueType; // FORGOT_PIN, EXPIRED_LINK, ATTACHMENT_ERROR, TECHNICAL_QUESTION

    @Column(name = "status", nullable = false, length = 32)
    private String status; // OPEN, IN_PROGRESS, RESOLVED

    @Column(name = "requested_at")
    private LocalDateTime requestedAt;

    @Column(name = "current_pin", length = 20)
    private String currentPin;
}
