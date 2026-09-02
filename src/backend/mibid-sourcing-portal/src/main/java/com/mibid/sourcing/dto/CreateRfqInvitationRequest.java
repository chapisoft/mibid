package com.mibid.sourcing.dto;

import com.mibid.core.domain.enums.Currency;
import com.mibid.core.domain.enums.Incoterm;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRfqInvitationRequest {

    @NotNull(message = "projectId must not be null")
    private UUID projectId;

    private String projectCode;

    private String projectName;

    private String rfqCode;

    private String title;

    @NotNull(message = "vendorId must not be null")
    private UUID vendorId;

    private Incoterm incoterm;

    private Currency currency;

    private Integer itemCount;

    private java.time.LocalDateTime submissionDeadline;
}
