package com.mibid.sourcing.repository;

import com.mibid.sourcing.domain.RfqSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RfqSubmissionRepository extends JpaRepository<RfqSubmission, UUID> {

    Optional<RfqSubmission> findTopByRfqIdOrderBySubmittedAtDesc(UUID rfqId);

    Optional<RfqSubmission> findTopByRfqIdAndVendorEmailOrderBySubmittedAtDesc(UUID rfqId, String vendorEmail);
}
