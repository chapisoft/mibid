package com.mibid.outbox.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntegrationHubStatsDto {
    private int activeEndpointsCount;
    private long totalKafkaEventsToday;
    private int kafkaConsumerLag;
    private double p99LatencyMs;
    private int sftpJobsSuccessCount;
    private int sftpJobsTotalCount;
    private double hmacValidityRate;
    private long dlqEventsCount;
    private List<KafkaTopicInfoDto> activeTopics;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KafkaTopicInfoDto {
        private String topic;
        private String type; // INBOUND, OUTBOUND
        private long messagesTotal;
        private int lag;
        private String status; // HEALTHY, DEGRADED, CRITICAL
    }
}
