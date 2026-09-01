package com.mibid.workflow.repository;

import com.mibid.workflow.domain.WorkflowDefinitionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkflowDefinitionRepository extends JpaRepository<WorkflowDefinitionEntity, UUID> {

    @Query("SELECT w FROM WorkflowDefinitionEntity w WHERE w.deleted = false AND (:tenantId IS NULL OR w.tenantId = :tenantId OR w.tenantId IS NULL OR w.isTemplate = true) ORDER BY w.createdAt DESC")
    List<WorkflowDefinitionEntity> findAllByTenantIdOrTemplates(@Param("tenantId") UUID tenantId);

    @Query("SELECT w FROM WorkflowDefinitionEntity w WHERE w.deleted = false AND w.isTemplate = true ORDER BY w.createdAt ASC")
    List<WorkflowDefinitionEntity> findAllTemplates();

    Optional<WorkflowDefinitionEntity> findByIdAndDeletedFalse(UUID id);

    Optional<WorkflowDefinitionEntity> findByCodeAndDeletedFalse(String code);
}
