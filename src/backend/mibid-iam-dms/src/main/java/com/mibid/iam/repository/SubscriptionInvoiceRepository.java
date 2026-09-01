package com.mibid.iam.repository;

import com.mibid.iam.domain.SubscriptionInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionInvoiceRepository extends JpaRepository<SubscriptionInvoice, String> {

    Optional<SubscriptionInvoice> findByInvoiceNumber(String invoiceNumber);

    List<SubscriptionInvoice> findByTenantIdOrderByCreatedAtDesc(String tenantId);

    List<SubscriptionInvoice> findAllByOrderByCreatedAtDesc();
}
