/**
 * Định nghĩa Enum và Interface cho phân hệ Integration Hub.
 * TUÂN THỦ NGUYÊN TẮC ZERO-HARDCODE: Dùng Enum thay thế string literal.
 */

export enum SystemType {
  SAP_ERP = 'SAP_ERP',
  ORACLE_ERP = 'ORACLE_ERP',
  BRAVO_ERP = 'BRAVO_ERP',
  FAST_ERP = 'FAST_ERP',
  VNACCS_CUSTOMS = 'VNACCS_CUSTOMS',
  WMS_LOGISTICS = 'WMS_LOGISTICS',
  CUSTOM_REST = 'CUSTOM_REST',
}

export enum IntegrationMode {
  KAFKA_STREAMING = 'KAFKA_STREAMING',
  WEBHOOK_HMAC = 'WEBHOOK_HMAC',
  SFTP_BATCH = 'SFTP_BATCH',
  REST_PULL = 'REST_PULL',
}

export enum IntegrationSyncStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
}

export enum KafkaTopicHealthStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  CRITICAL = 'CRITICAL',
}

export enum OutboxEventStatus {
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  DLQ = 'DLQ',
  FAILED = 'FAILED',
}

export enum FileSyncStatus {
  SUCCESS = 'SUCCESS',
  PARTIAL_ERROR = 'PARTIAL_ERROR',
  FAILED = 'FAILED',
}

export enum FileSyncType {
  RFQ_LINE_ITEMS_IMPORT = 'RFQ_LINE_ITEMS_IMPORT',
  VENDOR_CATALOG_SYNC = 'VENDOR_CATALOG_SYNC',
  PO_CONTRACT_EXPORT = 'PO_CONTRACT_EXPORT',
  CUSTOMS_DECLARATION = 'CUSTOMS_DECLARATION',
}

export enum KafkaTopicDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}

export interface IntegrationEndpoint {
  id: string;
  name: string;
  systemType: SystemType;
  integrationMode: IntegrationMode;
  endpointUrl?: string;
  authConfig?: string;
  mappingSchema?: string;
  isActive: boolean;
  lastSyncAt: string;
  syncStatus: IntegrationSyncStatus;
}

export interface KafkaTopicInfo {
  topic: string;
  type: KafkaTopicDirection;
  messagesTotal: number;
  lag: number;
  status: KafkaTopicHealthStatus;
}

export interface IntegrationHubStats {
  activeEndpointsCount: number;
  totalKafkaEventsToday: number;
  kafkaConsumerLag: number;
  p99LatencyMs: number;
  sftpJobsSuccessCount: number;
  sftpJobsTotalCount: number;
  hmacValidityRate: number;
  dlqEventsCount: number;
  activeTopics: KafkaTopicInfo[];
}

export interface OutboxDlqEvent {
  id: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: string;
  status: OutboxEventStatus;
  retryCount: number;
  createdAt: string;
}

export interface FileSyncLog {
  id: string;
  name: string;
  fileType: FileSyncType;
  totalRecords: number;
  successCount: number;
  errorCount: number;
  status: FileSyncStatus;
  errorLogJson?: string;
  createdAt: string;
}
