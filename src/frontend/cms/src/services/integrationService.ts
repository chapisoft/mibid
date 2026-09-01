/**
 * Dịch vụ Quản Trị Tích Hợp Đa Hệ Thống (NIE Integration Hub & SFTP / Outbox)
 * Kết nối 100% với Spring Boot Backend REST API (/api/v1/management/integration/*)
 */

import {
  IntegrationEndpoint,
  FileSyncLog,
  OutboxDlqEvent,
  IntegrationHubStats,
  SystemType,
  IntegrationMode,
  KafkaTopicInfo,
} from '../models/integration.model';
import { apiClient } from './apiClient';

export type {
  IntegrationEndpoint,
  FileSyncLog,
  OutboxDlqEvent,
  IntegrationHubStats,
  SystemType,
  IntegrationMode,
  KafkaTopicInfo,
};

class IntegrationService {
  async getStats(): Promise<IntegrationHubStats> {
    try {
      const res = await apiClient.get<IntegrationHubStats>('/management/integration/stats');
      return res || this.getDefaultStats();
    } catch {
      return this.getDefaultStats();
    }
  }

  async getEndpoints(): Promise<IntegrationEndpoint[]> {
    try {
      const res = await apiClient.get<IntegrationEndpoint[]>('/management/integration/endpoints');
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  }

  async saveEndpoint(endpoint: Partial<IntegrationEndpoint>): Promise<IntegrationEndpoint> {
    return await apiClient.post<IntegrationEndpoint>('/management/integration/endpoints', endpoint);
  }

  async deleteEndpoint(endpointId: string): Promise<boolean> {
    await apiClient.delete(`/management/integration/endpoints/${encodeURIComponent(endpointId)}`);
    return true;
  }

  async testConnection(endpointId: string): Promise<{ success: boolean; latencyMs: number; message: string }> {
    return await apiClient.post<{ success: boolean; latencyMs: number; message: string }>(
      `/management/integration/endpoints/${encodeURIComponent(endpointId)}/test`,
      {}
    );
  }

  async triggerManualSync(endpointId: string): Promise<{ success: boolean; message: string }> {
    return await apiClient.post<{ success: boolean; message: string }>(
      `/management/integration/endpoints/${encodeURIComponent(endpointId)}/trigger-sync`,
      {}
    );
  }

  async getFileSyncLogs(): Promise<FileSyncLog[]> {
    try {
      const res = await apiClient.get<FileSyncLog[]>('/management/integration/files');
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  }

  async triggerFileSync(fileType: string): Promise<FileSyncLog> {
    return await apiClient.post<FileSyncLog>('/management/integration/files/import', { fileType });
  }

  async getDlqEvents(): Promise<OutboxDlqEvent[]> {
    try {
      const res = await apiClient.get<OutboxDlqEvent[]>('/management/integration/dlq');
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  }

  async retryDlq(eventId?: string, retryAll?: boolean): Promise<boolean> {
    if (retryAll) {
      await apiClient.post('/management/integration/dlq/retry-all', {});
    } else if (eventId) {
      await apiClient.post(`/management/integration/dlq/${encodeURIComponent(eventId)}/retry`, {});
    }
    return true;
  }

  async discardDlqEvent(eventId: string): Promise<boolean> {
    await apiClient.delete(`/management/integration/dlq/${encodeURIComponent(eventId)}`);
    return true;
  }

  private getDefaultStats(): IntegrationHubStats {
    return {
      activeEndpointsCount: 0,
      totalKafkaEventsToday: 0,
      kafkaConsumerLag: 0,
      p99LatencyMs: 0,
      sftpJobsSuccessCount: 0,
      sftpJobsTotalCount: 0,
      hmacValidityRate: 100,
      dlqEventsCount: 0,
      activeTopics: [],
    };
  }
}

export const integrationService = new IntegrationService();
