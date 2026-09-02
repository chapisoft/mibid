package com.mibid.iam.repository;

import com.mibid.iam.domain.TenantMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantMemberRepository extends JpaRepository<TenantMember, UUID> {
    List<TenantMember> findByUserId(UUID userId);
    List<TenantMember> findByTenantId(UUID tenantId);
    long countByTenantId(UUID tenantId);
    Optional<TenantMember> findByTenantIdAndUserId(UUID tenantId, UUID userId);
    void deleteByTenantIdAndUserId(UUID tenantId, UUID userId);
}
