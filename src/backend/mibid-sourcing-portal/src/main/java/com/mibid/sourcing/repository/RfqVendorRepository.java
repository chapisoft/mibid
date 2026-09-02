package com.mibid.sourcing.repository;

import com.mibid.sourcing.domain.RfqVendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RfqVendorRepository extends JpaRepository<RfqVendor, UUID> {

    @Query("SELECT rv FROM RfqVendor rv WHERE rv.isDeleted = false AND rv.invitationCode = :invitationCode")
    Optional<RfqVendor> findByInvitationCodeAndIsDeletedFalse(@Param("invitationCode") String invitationCode);

    @Query("SELECT rv FROM RfqVendor rv WHERE rv.isDeleted = false AND rv.rfqId = :rfqId AND rv.vendorEmail = :email")
    Optional<RfqVendor> findByRfqIdAndVendorEmailAndIsDeletedFalse(@Param("rfqId") UUID rfqId, @Param("email") String email);

    @Query("SELECT rv FROM RfqVendor rv WHERE rv.isDeleted = false AND rv.rfqId = :rfqId")
    List<RfqVendor> findByRfqIdAndIsDeletedFalse(@Param("rfqId") UUID rfqId);
}
