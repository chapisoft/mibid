package com.mibid.sourcing.domain;

import com.mibid.core.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "rfq_vendors")
public class RfqVendor extends BaseEntity {

    @Column(name = "rfq_id", nullable = false)
    private UUID rfqId;

    @Column(name = "vendor_email", nullable = false, length = 150)
    private String vendorEmail;

    @Column(name = "vendor_name", length = 200)
    private String vendorName;

    @Column(name = "company_name", length = 255)
    private String companyName;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "invitation_code", length = 64)
    private String invitationCode;

    @Column(name = "pin_hash", length = 255)
    private String pinHash;

    @Column(name = "pin_salt", length = 64)
    private String pinSalt;

    @Column(name = "pin_attempts")
    private Integer pinAttempts;

    @Column(name = "pin_locked_until")
    private LocalDateTime pinLockedUntil;

    @Column(name = "invited_at")
    private LocalDateTime invitedAt;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    @Column(name = "decline_reason", columnDefinition = "TEXT")
    private String declineReason;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
