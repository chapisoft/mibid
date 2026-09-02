package com.mibid.workflow.repository;

import com.mibid.workflow.domain.StageChecklistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StageChecklistItemRepository extends JpaRepository<StageChecklistItem, UUID> {

    List<StageChecklistItem> findByStageIdOrderBySortOrderAsc(UUID stageId);

    List<StageChecklistItem> findByProjectIdAndStageCodeOrderBySortOrderAsc(UUID projectId, String stageCode);

    List<StageChecklistItem> findByProjectIdOrderBySortOrderAsc(UUID projectId);

    List<StageChecklistItem> findByStageCodeOrderBySortOrderAsc(String stageCode);
}
