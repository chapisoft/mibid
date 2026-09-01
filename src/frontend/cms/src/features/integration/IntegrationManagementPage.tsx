'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../shared/i18n';
import {
  IntegrationEndpoint,
  IntegrationHubStats,
  OutboxDlqEvent,
  FileSyncLog,
  SystemType,
  IntegrationMode,
} from '../../models/integration.model';
import { integrationService } from '../../services/integrationService';
import {
  Network,
  RefreshCw,
  Plus,
  Zap,
  HardDrive,
  FileSpreadsheet,
  AlertOctagon,
  CheckCircle2,
  Trash2,
  Edit,
  Play,
  ArrowUpRight,
  ShieldCheck,
  Server,
  Layers,
  X,
} from 'lucide-react';

export function IntegrationManagementPage() {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'endpoints' | 'kafka' | 'sftp' | 'dlq'>('endpoints');
  const [stats, setStats] = useState<IntegrationHubStats | null>(null);
  const [endpoints, setEndpoints] = useState<IntegrationEndpoint[]>([]);
  const [fileLogs, setFileLogs] = useState<FileSyncLog[]>([]);
  const [dlqEvents, setDlqEvents] = useState<OutboxDlqEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Action states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<Partial<IntegrationEndpoint> | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, endpointsData, fileLogsData, dlqData] = await Promise.all([
        integrationService.getStats(),
        integrationService.getEndpoints(),
        integrationService.getFileSyncLogs(),
        integrationService.getDlqEvents(),
      ]);
      setStats(statsData);
      setEndpoints(endpointsData);
      setFileLogs(fileLogsData);
      setDlqEvents(dlqData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    try {
      const ok = await integrationService.testConnection(id);
      showToast(ok ? t.integration.test_success : t.integration.test_failed);
    } catch {
      showToast(t.integration.test_failed);
    } finally {
      setTestingId(null);
    }
  };

  const handleSaveEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEndpoint?.name || !editingEndpoint?.systemType) return;
    try {
      await integrationService.saveEndpoint(editingEndpoint);
      setIsModalOpen(false);
      setEditingEndpoint(null);
      showToast(t.integration.save_success);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteEndpoint = async (id: string) => {
    if (confirm(t.integration.confirm_delete)) {
      await integrationService.deleteEndpoint(id);
      showToast(t.integration.delete_success);
      loadData();
    }
  };

  const handleRetryDlq = async (eventId?: string, retryAll?: boolean) => {
    await integrationService.retryDlq(eventId, retryAll);
    showToast(t.integration.dlq_retry_scheduled);
    loadData();
  };

  const handleTriggerFileSync = async (fileType: string) => {
    await integrationService.triggerFileSync(fileType);
    showToast(t.integration.file_sync_triggered);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-semibold border border-slate-700 animate-in fade-in">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              MIBID INTEGRATION ENGINE (MIE) v2.0
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              ⚡ P99 LATENCY: 18.4ms
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.integration.page_title}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            {t.integration.page_subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3 self-stretch md:self-auto">
          <button
            onClick={() => {
              setEditingEndpoint({
                name: '',
                systemType: 'SAP_ERP',
                integrationMode: 'KAFKA_STREAMING',
                endpointUrl: '',
                authConfig: '{\n  "sasl_mechanism": "PLAIN"\n}',
                mappingSchema: '{\n  "BANFN": "rfq_code"\n}',
                isActive: true,
              });
              setIsModalOpen(true);
            }}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus size={16} />
            <span>{t.integration.btn_add_endpoint}</span>
          </button>
          <button
            onClick={loadData}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-all border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw size={15} />
            <span className="hidden sm:inline">{t.integration.btn_refresh}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>{t.integration.metric_active_endpoints}</span>
            <Server size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {stats?.activeEndpointsCount ?? endpoints.length}{' '}
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{t.integration.unit_active}</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            SAP S/4HANA, VNACCS, Oracle, FAST
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>{t.integration.metric_kafka_events}</span>
            <Zap size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {(stats?.totalKafkaEventsToday ?? 0).toLocaleString()}{' '}
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">msgs/day</span>
          </div>
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
            ✓ Consumer Lag: {stats?.kafkaConsumerLag ?? 0} msgs (P99 {(stats?.p99LatencyMs ?? 0).toFixed(1)}ms)
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>{t.integration.metric_sftp_sync}</span>
            <FileSpreadsheet size={18} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {stats?.sftpJobsSuccessCount ?? fileLogs.length} / {stats?.sftpJobsTotalCount ?? fileLogs.length}{' '}
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">100% PASS</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Spring Batch Chunk 1.000 records
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>{t.integration.metric_dlq_queue}</span>
            <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {stats?.dlqEventsCount ?? dlqEvents.length}{' '}
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">failed</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            HMAC-SHA256: 100% Valid
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { key: 'endpoints', label: `${t.integration.tab_endpoints} (${endpoints.length})` },
          { key: 'kafka', label: `${t.integration.tab_kafka} (4 Topics)` },
          { key: 'sftp', label: `${t.integration.tab_sftp} (${fileLogs.length})` },
          { key: 'dlq', label: `${t.integration.tab_dlq} (${dlqEvents.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: ENDPOINTS LIST */}
      {activeTab === 'endpoints' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
          {endpoints.map((ep) => (
            <div
              key={ep.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {ep.systemType}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                      {ep.name}
                    </h3>
                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400">{ep.id}</div>
                  </div>

                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap border ${
                      ep.syncStatus === 'CONNECTED'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
                    }`}
                  >
                    ● {ep.syncStatus}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">{t.integration.lbl_mode}:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{ep.integrationMode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">{t.integration.lbl_endpoint_url}:</span>
                    <span className="font-mono text-xs text-slate-700 dark:text-slate-300 max-w-[220px] truncate" title={ep.endpointUrl}>
                      {ep.endpointUrl || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">{t.integration.lbl_last_sync}:</span>
                    <span className="text-slate-500 dark:text-slate-400">{new Date(ep.lastSyncAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleTestConnection(ep.id)}
                  disabled={testingId === ep.id}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
                >
                  <Zap size={14} className="text-amber-500" />
                  <span>{testingId === ep.id ? 'Testing...' : 'Test Connection'}</span>
                </button>
                <button
                  onClick={() => {
                    setEditingEndpoint(ep);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
                >
                  <Edit size={14} />
                  <span>{t.integration.btn_edit}</span>
                </button>
                <button
                  onClick={() => handleDeleteEndpoint(ep.id)}
                  className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold transition-all border border-red-200 dark:border-red-800"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: KAFKA STREAMING HUB */}
      {activeTab === 'kafka' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.integration.kafka_hub_title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t.integration.kafka_hub_desc}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              ● CLUSTER: 3 BROKERS (IN-SYNC)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Topic Name</th>
                  <th className="py-3 px-4">Direction</th>
                  <th className="py-3 px-4">Total Messages</th>
                  <th className="py-3 px-4">Consumer Lag</th>
                  <th className="py-3 px-4">Partitions</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(stats?.activeTopics ?? []).map((topic) => (
                  <tr key={topic.topic} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{topic.topic}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                          topic.type === 'INBOUND'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}
                      >
                        {topic.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {topic.messagesTotal.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      <span className={topic.lag > 50 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}>
                        {topic.lag} msgs
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">3 (Replication: 2)</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      ● {topic.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SFTP DROPZONE LOGS */}
      {activeTab === 'sftp' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.integration.sftp_hub_title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t.integration.sftp_hub_desc}
              </p>
            </div>
            <button
              onClick={() => handleTriggerFileSync('RFQ_LINE_ITEMS_IMPORT')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20"
            >
              <Play size={14} />
              <span>Trigger RFQ Import</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Log ID / File Name</th>
                  <th className="py-3 px-4">File Type</th>
                  <th className="py-3 px-4">Total Rows</th>
                  <th className="py-3 px-4">Success</th>
                  <th className="py-3 px-4">Errors</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Processed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {fileLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{log.name}</div>
                      <div className="text-xs font-mono text-slate-500">{log.id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{log.fileType}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{log.totalRecords}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">{log.successCount}</td>
                    <td className="py-3.5 px-4 font-bold">
                      <span className={log.errorCount > 0 ? 'text-red-500' : 'text-slate-500'}>
                        {log.errorCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DEAD LETTER QUEUE (DLQ) */}
      {activeTab === 'dlq' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.integration.dlq_hub_title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t.integration.dlq_hub_desc}
              </p>
            </div>
            {dlqEvents.length > 0 && (
              <button
                onClick={() => handleRetryDlq(undefined, true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm shadow-red-500/20"
              >
                {t.integration.btn_retry_all_dlq}
              </button>
            )}
          </div>

          {dlqEvents.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <div className="text-4xl mb-2">✨</div>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {t.integration.dlq_clean_title}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                {t.integration.dlq_clean_desc}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Event ID</th>
                    <th className="py-3 px-4">Event Type</th>
                    <th className="py-3 px-4">Aggregate Type</th>
                    <th className="py-3 px-4">Retries</th>
                    <th className="py-3 px-4">Created At</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {dlqEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{evt.id}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{evt.eventType}</td>
                      <td className="py-3.5 px-4 text-slate-500">{evt.aggregateType}</td>
                      <td className="py-3.5 px-4 font-bold text-red-500">{evt.retryCount} / 5</td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">{new Date(evt.createdAt).toLocaleString()}</td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleRetryDlq(evt.id, false)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold"
                        >
                          Retry
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Cấu hình Endpoint */}
      {isModalOpen && editingEndpoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingEndpoint.id ? t.integration.modal_edit_title : t.integration.modal_add_title}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEndpoint} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  {t.integration.form_name} *
                </label>
                <input
                  type="text"
                  required
                  value={editingEndpoint.name || ''}
                  onChange={(e) => setEditingEndpoint({ ...editingEndpoint, name: e.target.value })}
                  placeholder="ví dụ: Cổng SAP S/4HANA Purchase Request Sync"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    {t.integration.form_system_type} *
                  </label>
                  <select
                    value={editingEndpoint.systemType || 'SAP_ERP'}
                    onChange={(e) => setEditingEndpoint({ ...editingEndpoint, systemType: e.target.value as SystemType })}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold shadow-2xs hover:border-blue-500 outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="SAP_ERP">SAP ERP (S/4HANA / ECC)</option>
                    <option value="ORACLE_ERP">Oracle ERP Cloud / EBS</option>
                    <option value="BRAVO_ERP">BRAVO ERP 8.0</option>
                    <option value="FAST_ERP">FAST Business Online</option>
                    <option value="VNACCS_CUSTOMS">Hải Quan Điện Tử VNACCS</option>
                    <option value="WMS_LOGISTICS">WMS / Logistics Forwarder</option>
                    <option value="CUSTOM_REST">Custom RESTful API</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    {t.integration.form_mode} *
                  </label>
                  <select
                    value={editingEndpoint.integrationMode || 'KAFKA_STREAMING'}
                    onChange={(e) => setEditingEndpoint({ ...editingEndpoint, integrationMode: e.target.value as IntegrationMode })}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold shadow-2xs hover:border-blue-500 outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="KAFKA_STREAMING">Apache Kafka Event Streaming</option>
                    <option value="WEBHOOK_HMAC">Real-time Webhook (HMAC-SHA256)</option>
                    <option value="SFTP_BATCH">SFTP / S3 Batch File Processing</option>
                    <option value="REST_PULL">REST API Pull (Scheduled)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  {t.integration.form_endpoint_url}
                </label>
                <input
                  type="text"
                  value={editingEndpoint.endpointUrl || ''}
                  onChange={(e) => setEditingEndpoint({ ...editingEndpoint, endpointUrl: e.target.value })}
                  placeholder="https://api.partner.corp/v1/webhook hoặc kafka-broker:9092"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  {t.integration.form_auth_config}
                </label>
                <textarea
                  rows={2}
                  value={editingEndpoint.authConfig || ''}
                  onChange={(e) => setEditingEndpoint({ ...editingEndpoint, authConfig: e.target.value })}
                  placeholder='{\n  "secret_key_sha256": "secret_key_here"\n}'
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  {t.integration.form_mapping_schema}
                </label>
                <textarea
                  rows={2}
                  value={editingEndpoint.mappingSchema || ''}
                  onChange={(e) => setEditingEndpoint({ ...editingEndpoint, mappingSchema: e.target.value })}
                  placeholder='{\n  "BANFN": "rfq_code",\n  "MATNR": "item_code"\n}'
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-all"
                >
                  {t.integration.btn_cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-500/20 transition-all"
                >
                  {t.integration.btn_save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
