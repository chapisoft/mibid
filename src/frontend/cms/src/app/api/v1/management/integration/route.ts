import { NextResponse } from 'next/server';

let endpointsStore = [
  {
    id: 'EP-SAP-S4HANA-PR',
    name: 'Cổng SAP S/4HANA Purchase Request & Cost Center',
    systemType: 'SAP_ERP',
    integrationMode: 'KAFKA_STREAMING',
    endpointUrl: 'kafka-broker.enterprise.mibid:9092',
    authConfig: '{"sasl_mechanism":"PLAIN","username":"mibid_producer"}',
    mappingSchema: '{"BANFN":"rfq_code","MATNR":"item_code","MENGE":"target_qty"}',
    isActive: true,
    lastSyncAt: new Date().toISOString(),
    syncStatus: 'CONNECTED'
  },
  {
    id: 'EP-VNACCS-CUSTOMS',
    name: 'Cổng Hải Quan Điện Tử VNACCS/VCIS',
    systemType: 'VNACCS_CUSTOMS',
    integrationMode: 'WEBHOOK_HMAC',
    endpointUrl: 'https://customs.gov.vn/api/v2/declarations/webhook',
    authConfig: '{"secret_key_sha256":"hmac_sec_vnaccs_8877665544332211"}',
    mappingSchema: '{"decl_no":"customs_declaration_no","bl_no":"bl_number","status":"clearance_status"}',
    isActive: true,
    lastSyncAt: new Date().toISOString(),
    syncStatus: 'CONNECTED'
  },
  {
    id: 'EP-ORACLE-PO-SYNC',
    name: 'Cổng Oracle Cloud ERP PO Contract Sync',
    systemType: 'ORACLE_ERP',
    integrationMode: 'KAFKA_STREAMING',
    endpointUrl: 'kafka-oracle.corp.mibid:9092',
    authConfig: '{"ssl_truststore":"/etc/ssl/oracle_mibid_trust.jks"}',
    mappingSchema: '{"PO_HEADER_ID":"contract_code","VENDOR_ID":"vendor_code"}',
    isActive: true,
    lastSyncAt: new Date().toISOString(),
    syncStatus: 'CONNECTED'
  },
  {
    id: 'EP-SFTP-RFQ-DROPZONE',
    name: 'Cổng Dropzone SFTP RFQ Line Items & Vendor Catalog',
    systemType: 'FAST_ERP',
    integrationMode: 'SFTP_BATCH',
    endpointUrl: 'sftp://sftp.mibid-dropzone.vn:22/inbound/rfq-items',
    authConfig: '{"auth_type":"SSH_KEY_ED25519","key_fingerprint":"SHA256:8kQ5m..."}',
    mappingSchema: '{"col_1":"rfq_code","col_2":"line_no","col_3":"spec_detail"}',
    isActive: true,
    lastSyncAt: new Date().toISOString(),
    syncStatus: 'CONNECTED'
  }
];

let dlqStore: any[] = [];
let fileLogsStore = [
  {
    id: 'FS-MIBID-01',
    name: 'RFQ_IMPORT_PROJECT_POWERPLANT_20260901.csv',
    fileType: 'RFQ_LINE_ITEMS_IMPORT',
    totalRecords: 860,
    successCount: 860,
    errorCount: 0,
    status: 'SUCCESS',
    createdAt: new Date(Date.now() - 14400000).toISOString()
  },
  {
    id: 'FS-MIBID-02',
    name: 'GLOBAL_VENDOR_CATALOG_SYNC_20260901.xml',
    fileType: 'VENDOR_CATALOG_SYNC',
    totalRecords: 240,
    successCount: 239,
    errorCount: 1,
    status: 'PARTIAL_ERROR',
    errorLogJson: '[{"line":88,"error":"Thiếu mã SWIFT/BIC cho nhà thầu quốc tế VEND-SIEMENS-DE"}]',
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'FS-MIBID-03',
    name: 'PO_CONTRACT_AWARD_EXPORT_20260831.csv',
    fileType: 'PO_CONTRACT_EXPORT',
    totalRecords: 42,
    successCount: 42,
    errorCount: 0,
    status: 'SUCCESS',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'stats') {
    return NextResponse.json({
      success: true,
      data: {
        activeEndpointsCount: endpointsStore.filter(e => e.isActive).length,
        totalKafkaEventsToday: 412580,
        kafkaConsumerLag: 12,
        p99LatencyMs: 18.4,
        sftpJobsSuccessCount: fileLogsStore.filter(f => f.status === 'SUCCESS').length,
        sftpJobsTotalCount: fileLogsStore.length,
        hmacValidityRate: 100.0,
        dlqEventsCount: dlqStore.length,
        activeTopics: [
          { topic: 'mibid.rfq.inbound', type: 'INBOUND', messagesTotal: 148200, lag: 8, status: 'HEALTHY' },
          { topic: 'mibid.awarded-bid.outbound', type: 'OUTBOUND', messagesTotal: 92450, lag: 0, status: 'HEALTHY' },
          { topic: 'mibid.customs.status.inbound', type: 'INBOUND', messagesTotal: 110500, lag: 4, status: 'HEALTHY' },
          { topic: 'mibid.po-sync.outbound', type: 'OUTBOUND', messagesTotal: 61430, lag: 0, status: 'HEALTHY' }
        ]
      }
    });
  }

  if (action === 'endpoints') {
    return NextResponse.json({ success: true, data: endpointsStore });
  }

  if (action === 'dlq') {
    return NextResponse.json({ success: true, data: dlqStore });
  }

  if (action === 'file_logs') {
    return NextResponse.json({ success: true, data: fileLogsStore });
  }

  return NextResponse.json({ success: true, data: endpointsStore });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'save_endpoint') {
      const endpoint = body.endpoint;
      const index = endpointsStore.findIndex(e => e.id === endpoint.id);
      if (index >= 0) {
        endpointsStore[index] = { ...endpointsStore[index], ...endpoint, lastSyncAt: new Date().toISOString() };
        return NextResponse.json({ success: true, data: endpointsStore[index] });
      } else {
        const newEp = {
          id: endpoint.id || `EP-MIBID-${Date.now().toString().slice(-4)}`,
          name: endpoint.name,
          systemType: endpoint.systemType || 'CUSTOM_REST',
          integrationMode: endpoint.integrationMode || 'WEBHOOK_HMAC',
          endpointUrl: endpoint.endpointUrl || '',
          authConfig: endpoint.authConfig || '{}',
          mappingSchema: endpoint.mappingSchema || '{}',
          isActive: true,
          lastSyncAt: new Date().toISOString(),
          syncStatus: 'CONNECTED'
        };
        endpointsStore.unshift(newEp);
        return NextResponse.json({ success: true, data: newEp });
      }
    }

    if (action === 'test_connection') {
      return NextResponse.json({ success: true, data: { success: true, latencyMs: 14.8 } });
    }

    if (action === 'retry_dlq') {
      dlqStore = [];
      return NextResponse.json({ success: true, message: 'Retried all DLQ events successfully' });
    }

    if (action === 'trigger_file_sync') {
      const newLog = {
        id: `FS-${Date.now()}`,
        name: `MANUAL_SYNC_${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)}.csv`,
        fileType: body.fileType || 'RFQ_LINE_ITEMS_IMPORT',
        totalRecords: 350,
        successCount: 350,
        errorCount: 0,
        status: 'SUCCESS',
        createdAt: new Date().toISOString()
      };
      fileLogsStore.unshift(newLog);
      return NextResponse.json({ success: true, data: newLog });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (id) {
    endpointsStore = endpointsStore.filter(e => e.id !== id);
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });
}
