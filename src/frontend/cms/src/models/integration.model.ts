export type SystemType =
  | 'SAP_ERP'
  | 'ORACLE_ERP'
  | 'BRAVO_ERP'
  | 'FAST_ERP'
  | 'VNACCS_CUSTOMS'
  | 'WMS_LOGISTICS'
  | 'CUSTOM_REST';

export type IntegrationMode =
  | 'KAFKA_STREAMING'
  | 'WEBHOOK_HMAC'
  | 'SFTP_BATCH'
  | 'REST_PULL';

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
  syncStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
}

export interface KafkaTopicInfo {
  topic: string;
  type: 'INBOUND' | 'OUTBOUND';
  messagesTotal: number;
  lag: number;
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
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
  status: 'DLQ' | 'PENDING' | 'PUBLISHED' | 'FAILED';
  retryCount: number;
  createdAt: string;
}

export interface FileSyncLog {
  id: string;
  name: string;
  fileType: 'RFQ_LINE_ITEMS_IMPORT' | 'VENDOR_CATALOG_SYNC' | 'PO_CONTRACT_EXPORT' | 'CUSTOMS_DECLARATION';
  totalRecords: number;
  successCount: number;
  errorCount: number;
  status: 'SUCCESS' | 'PARTIAL_ERROR' | 'FAILED';
  errorLogJson?: string;
  createdAt: string;
}
