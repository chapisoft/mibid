package com.mibid.sourcing.repository;

import com.mibid.sourcing.domain.RfqLineItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RfqLineItemRepository extends JpaRepository<RfqLineItem, UUID> {

    @Query("SELECT rli FROM RfqLineItem rli WHERE rli.isDeleted = false AND rli.rfqId = :rfqId ORDER BY rli.sortOrder ASC")
    List<RfqLineItem> findByRfqIdAndIsDeletedFalse(@Param("rfqId") UUID rfqId);
}
