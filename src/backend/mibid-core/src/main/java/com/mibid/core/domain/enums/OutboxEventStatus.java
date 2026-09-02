package com.mibid.core.domain.enums;

public enum OutboxEventStatus {
    PENDING,
    PUBLISHED,
    DLQ,
    FAILED
}
