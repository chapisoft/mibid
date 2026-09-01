package com.mibid.outbox.repository;

import com.mibid.outbox.domain.FileSyncLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FileSyncLogRepository extends JpaRepository<FileSyncLogEntity, String> {

    @Query("SELECT f FROM FileSyncLogEntity f WHERE (:tenantId IS NULL OR f.tenantId = :tenantId) ORDER BY f.createdAt DESC")
    List<FileSyncLogEntity> findAllByTenantIdOrderByCreatedAtDesc(@Param("tenantId") UUID tenantId);
}
