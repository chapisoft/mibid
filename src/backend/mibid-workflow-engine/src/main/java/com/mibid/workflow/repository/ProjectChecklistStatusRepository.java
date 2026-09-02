package com.mibid.workflow.repository;

import com.mibid.workflow.domain.ProjectChecklistStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectChecklistStatusRepository extends JpaRepository<ProjectChecklistStatus, UUID> {

    List<ProjectChecklistStatus> findByProjectId(UUID projectId);

    Optional<ProjectChecklistStatus> findByProjectIdAndChecklistItemId(UUID projectId, UUID checklistItemId);

    void deleteByProjectIdAndChecklistItemId(UUID projectId, UUID checklistItemId);
}
