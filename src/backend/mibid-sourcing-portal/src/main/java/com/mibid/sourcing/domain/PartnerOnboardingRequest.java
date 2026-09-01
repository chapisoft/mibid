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
@Table(name = "partner_onboarding_requests")
public class PartnerOnboardingRequest extends BaseEntity {

    @Column(name = "company_name", nullable = false, length = 255)
    private String companyName;

    @Column(name = "tax_code", length = 50)
    private String taxCode;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "contact_person", length = 150)
    private String contactPerson;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "cert_file_name", length = 255)
    private String certFileName;

    @Column(name = "status", nullable = false, length = 32)
    private String status; // PENDING_APPROVAL, APPROVED, REJECTED, NEED_CLARIFICATION

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;
}
