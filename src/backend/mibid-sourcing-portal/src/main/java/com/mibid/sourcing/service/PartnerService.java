package com.mibid.sourcing.service;

import com.mibid.core.domain.enums.OnboardingStatus;
import com.mibid.core.domain.enums.PartnerStatus;
import com.mibid.core.domain.enums.TicketStatus;
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
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.partner.notFound"));
    }

    @Transactional
    public SupplierPartner createPartner(SupplierPartner partner, UUID tenantId) {
        if (tenantId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "error.partner.tenantIdRequired");
        }
        partner.setTenantId(tenantId);
        if (partner.getCode() == null || partner.getCode().isBlank()) {
            partner.setCode("PART-" + (int)(1000 + Math.random() * 9000));
        }
        if (partner.getStatus() == null || partner.getStatus().isBlank()) {
            partner.setStatus(PartnerStatus.ACTIVE.name());
        }
        if (partner.getTotalQuotesSubmitted() == null) {
            partner.setTotalQuotesSubmitted(0);
        }
        if (partner.getTotalWonBids() == null) {
            partner.setTotalWonBids(0);
        }
        // rating và isoCertified để null, vendor tự cập nhật sau khi có dữ liệu thực tế
        return partnerRepository.save(partner);
    }

    @Transactional
    @SuppressWarnings("null")
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
    @SuppressWarnings("null")
    public void approveOnboarding(UUID id, UUID tenantId) {
        PartnerOnboardingRequest req = onboardingRepository.findByIdAndTenantIdAndIsDeletedFalse(id, tenantId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.partner.onboardingNotFound"));
        req.setStatus(OnboardingStatus.APPROVED.name());
        onboardingRepository.save(req);

        // Tạo SupplierPartner mới từ dữ liệu hồ sơ đăng ký thực tế
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
                .status(PartnerStatus.ACTIVE.name())
                .totalQuotesSubmitted(0)
                .totalWonBids(0)
                // rating và isoCertified để null, cập nhật sau khi có dữ liệu đánh giá thực tế
                .build();
        partnerRepository.save(newPartner);
    }

    @Transactional
    public void rejectOnboarding(UUID id, UUID tenantId) {
        PartnerOnboardingRequest req = onboardingRepository.findByIdAndTenantIdAndIsDeletedFalse(id, tenantId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.partner.onboardingNotFound"));
        req.setStatus(OnboardingStatus.REJECTED.name());
        onboardingRepository.save(req);
    }

    @Transactional(readOnly = true)
    public List<PartnerSupportTicket> getSupportTickets(UUID tenantId) {
        return ticketRepository.findByTenantIdAndIsDeletedFalse(tenantId);
    }

    @Transactional
    public void resolveTicket(UUID id, UUID tenantId) {
        PartnerSupportTicket ticket = ticketRepository.findByIdAndTenantIdAndIsDeletedFalse(id, tenantId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.partner.ticketNotFound"));
        ticket.setStatus(TicketStatus.RESOLVED.name());
        ticketRepository.save(ticket);
    }

    @Transactional
    public boolean resendMagicLink(UUID ticketId, UUID tenantId) {
        PartnerSupportTicket ticket = ticketRepository.findByIdAndTenantIdAndIsDeletedFalse(ticketId, tenantId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "error.partner.ticketNotFound"));
        // Sinh mã PIN mới 6 số ngỪu nhiên
        String newPin = String.valueOf((int)(100000 + Math.random() * 900000));
        ticket.setCurrentPin(newPin);
        ticket.setStatus(TicketStatus.RESOLVED.name());
        ticketRepository.save(ticket);
        log.info("Reissued magic link for partner support ticket ID: {}, email: {}", ticket.getId(), ticket.getPartnerEmail());
        return true;
    }
}
