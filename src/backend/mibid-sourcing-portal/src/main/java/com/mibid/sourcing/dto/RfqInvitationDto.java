package com.mibid.sourcing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RfqInvitationDto {

    private UUID rfqId;
    private String rfqCode;
    private UUID projectId;
    private String projectName;
    private UUID vendorId;
    private String vendorName;
    private String vendorEmail;
    private String companyName;
    private String country;
    private String incoterm;
    private String currency;
    private Integer itemCount;
    private String invitationCode;
    private String securityPin; // Raw PIN 6 số, chỉ trả về một lần khi phát hành thành công
    private String portalUrl;
    private String status;
    private LocalDateTime invitedAt;
}
