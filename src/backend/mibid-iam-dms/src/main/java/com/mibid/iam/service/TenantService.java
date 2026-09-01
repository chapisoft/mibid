package com.mibid.iam.service;

import com.mibid.core.exception.AppException;
import com.mibid.core.exception.ErrorCode;
import com.mibid.iam.domain.Tenant;
import com.mibid.iam.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;

    @Transactional(readOnly = true)
    public List<Tenant> getAllTenants() {
        return tenantRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Tenant getTenantById(UUID id) {
        return tenantRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy doanh nghiệp: " + id));
    }

    @Transactional
    public Tenant createTenant(Tenant tenant) {
        if (tenantRepository.findByCode(tenant.getCode()).isPresent()) {
            throw new AppException(ErrorCode.RESOURCE_CONFLICT, "Mã doanh nghiệp đã tồn tại: " + tenant.getCode());
        }
        tenant.setStatus("ACTIVE");
        return tenantRepository.save(tenant);
    }

    @Transactional
    public Tenant updateTenant(UUID id, Tenant updates) {
        Tenant existing = getTenantById(id);
        if (updates.getName() != null) existing.setName(updates.getName());
        if (updates.getTaxCode() != null) existing.setTaxCode(updates.getTaxCode());
        if (updates.getContactEmail() != null) existing.setContactEmail(updates.getContactEmail());
        if (updates.getContactPhone() != null) existing.setContactPhone(updates.getContactPhone());
        if (updates.getStatus() != null) existing.setStatus(updates.getStatus());
        if (updates.getStorageQuotaGb() > 0) existing.setStorageQuotaGb(updates.getStorageQuotaGb());
        return tenantRepository.save(existing);
    }

    @Transactional
    public void deleteTenant(UUID id) {
        Tenant existing = getTenantById(id);
        tenantRepository.delete(existing);
    }
}
