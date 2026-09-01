package com.mibid.sourcing.service;

import com.mibid.core.exception.AppException;
import com.mibid.core.exception.ErrorCode;
import com.mibid.sourcing.domain.PartnerOnboardingRequest;
import com.mibid.sourcing.domain.PartnerSupportTicket;
import com.mibid.sourcing.domain.SupplierPartner;
import com.mibid.sourcing.repository.PartnerOnboardingRepository;
import com.mibid.sourcing.repository.PartnerSupportTicketRepository;
import com.mibid.sourcing.repository.SupplierPartnerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PartnerService {

    private final SupplierPartnerRepository partnerRepository;
    private final PartnerOnboardingRepository onboardingRepository;
    private final PartnerSupportTicketRepository ticketRepository;

    @Transactional(readOnly = true)
    public List<SupplierPartner> getPartners(UUID tenantId) {
        return partnerRepository.findByTenantIdAndIsDeletedFalse(tenantId);
    }

    @Transactional(readOnly = true)
    public SupplierPartner getPartnerById(UUID id, UUID tenantId) {
        return partnerRepository.findByIdAndTenantIdAndIsDeletedFalse(id, tenantId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đối tác: " + id));
    }

    @Transactional
    public SupplierPartner createPartner(SupplierPartner partner, UUID tenantId) {
        if (tenantId != null) {
            partner.setTenantId(tenantId);
        } else {
            partner.setTenantId(UUID.fromString("11111111-1111-1111-1111-111111111111"));
        }
        if (partner.getCode() == null || partner.getCode().isBlank()) {
            partner.setCode("PART-" + (int)(1000 + Math.random() * 9000));
        }
        if (partner.getStatus() == null || partner.getStatus().isBlank()) {
            partner.setStatus("ACTIVE");
        }
        if (partner.getRating() == null) {
            partner.setRating(BigDecimal.valueOf(5.0));
        }
        if (partner.getTotalQuotesSubmitted() == null) {
            partner.setTotalQuotesSubmitted(0);
        }
        if (partner.getTotalWonBids() == null) {
            partner.setTotalWonBids(0);
        }
        if (partner.getIsoCertified() == null) {
            partner.setIsoCertified(true);
        }
        return partnerRepository.save(partner);
    }

    @Transactional
    public SupplierPartner updatePartner(UUID id, SupplierPartner updates, UUID tenantId) {
        SupplierPartner existing = getPartnerById(id, tenantId);
        if (updates.getName() != null) existing.setName(updates.getName());
        if (updates.getTaxCode() != null) existing.setTaxCode(updates.getTaxCode());
        if (updates.getCountry() != null) existing.setCountry(updates.getCountry());
        if (updates.getCategory() != null) existing.setCategory(updates.getCategory());
        if (updates.getContactPerson() != null) existing.setContactPerson(updates.getContactPerson());
        if (updates.getEmail() != null) existing.setEmail(updates.getEmail());
        if (updates.getPhone() != null) existing.setPhone(updates.getPhone());
        if (updates.getStatus() != null) existing.setStatus(updates.getStatus());
        if (updates.getRating() != null) existing.setRating(updates.getRating());
        return partnerRepository.save(existing);
    }

    @Transactional
    public void deletePartner(UUID id, UUID tenantId) {
        SupplierPartner existing = getPartnerById(id, tenantId);
        existing.setDeleted(true);
        partnerRepository.save(existing);
    }

    @Transactional(readOnly = true)
    public List<PartnerOnboardingRequest> getOnboardingRequests(UUID tenantId) {
        return onboardingRepository.findByTenantIdAndIsDeletedFalse(tenantId);
    }

    @Transactional
    public void approveOnboarding(UUID id, UUID tenantId) {
        PartnerOnboardingRequest req = onboardingRepository.findByIdAndTenantIdAndIsDeletedFalse(id, tenantId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hồ sơ đăng ký: " + id));
        req.setStatus("APPROVED");
        onboardingRepository.save(req);

        // Tạo SupplierPartner mới
        SupplierPartner newPartner = SupplierPartner.builder()
                .tenantId(req.getTenantId())
                .code("PART-" + (int)(1000 + Math.random() * 9000))
                .name(req.getCompanyName())
                .taxCode(req.getTaxCode())
                .country(req.getCountry())
                .category(req.getCategory())
                .contactPerson(req.getContactPerson())
                .email(req.getEmail())
                .phone(req.getPhone())
                .status("ACTIVE")
                .rating(BigDecimal.valueOf(5.0))
                .totalQuotesSubmitted(0)
                .totalWonBids(0)
                .isoCertified(true)
                .build();
        partnerRepository.save(newPartner);
    }

    @Transactional
    public void rejectOnboarding(UUID id, UUID tenantId) {
        PartnerOnboardingRequest req = onboardingRepository.findByIdAndTenantIdAndIsDeletedFalse(id, tenantId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hồ sơ đăng ký: " + id));
        req.setStatus("REJECTED");
        onboardingRepository.save(req);
    }

    @Transactional(readOnly = true)
    public List<PartnerSupportTicket> getSupportTickets(UUID tenantId) {
        return ticketRepository.findByTenantIdAndIsDeletedFalse(tenantId);
    }

    @Transactional
    public void resolveTicket(UUID id, UUID tenantId) {
        PartnerSupportTicket ticket = ticketRepository.findByIdAndTenantIdAndIsDeletedFalse(id, tenantId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy ticket hỗ trợ: " + id));
        ticket.setStatus("RESOLVED");
        ticketRepository.save(ticket);
    }

    @Transactional
    public boolean resendMagicLink(UUID ticketId, UUID tenantId) {
        PartnerSupportTicket ticket = ticketRepository.findByIdAndTenantIdAndIsDeletedFalse(ticketId, tenantId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy ticket hỗ trợ: " + ticketId));
        // Sinh mã PIN mới 6 số ngẫu nhiên
        String newPin = String.valueOf((int)(100000 + Math.random() * 900000));
        ticket.setCurrentPin(newPin);
        ticket.setStatus("RESOLVED");
        ticketRepository.save(ticket);
        log.info("Đã tái phát hành Magic Link và PIN {} cho đối tác {}", newPin, ticket.getPartnerEmail());
        return true;
    }
}
