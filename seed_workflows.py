import json
import subprocess

nodes_standard = [
    {
        "id": "node-start",
        "type": "START",
        "x": 80,
        "y": 200,
        "data": {
            "title": "Bắt Đầu Gói Thầu",
            "subtitle": "Khai báo thông tin dự án",
            "code": "START_NODE",
            "stageKey": "STAGE_PREPARATION",
            "department": "BID_MANAGER",
            "slaDays": 1,
            "description": "Tiếp nhận thông báo mời thầu từ hệ thống mạng đấu thầu quốc gia hoặc chủ đầu tư",
            "gatekeeper": {
                "layer1DocChecklist": {"enabled": True, "mandatoryDocumentKeys": ["HSMT_GOC", "QUYET_DINH_MO_THAU"], "minimumFilesCount": 1},
                "layer2Financial": {"enabled": False},
                "layer3Approval": {"enabled": False},
                "layer4DistributedLock": {"enabled": False}
            }
        }
    },
    {
        "id": "node-prep",
        "type": "STAGE",
        "x": 340,
        "y": 200,
        "data": {
            "title": "Khảo Sát Yêu Cầu HSMT",
            "subtitle": "Bóc tách BoQ & Kỹ thuật",
            "code": "STAGE_PREP",
            "stageKey": "STAGE_PREPARATION",
            "department": "TECHNICAL",
            "slaDays": 3,
            "description": "Rà soát tiêu chuẩn kỹ thuật thiết bị 220kV, bảng dữ liệu kỹ thuật và yêu cầu nghiệm thu",
            "gatekeeper": {
                "layer1DocChecklist": {"enabled": True, "mandatoryDocumentKeys": ["BANG_BOC_TACH_BOQ", "BIEN_BAN_KHAO_SAT"], "minimumFilesCount": 2},
                "layer2Financial": {"enabled": False},
                "layer3Approval": {"enabled": True, "requiredApproverRoles": ["TECHNICAL_LEAD"], "minApprovalLevel": 1},
                "layer4DistributedLock": {"enabled": False}
            }
        }
    },
    {
        "id": "node-sourcing",
        "type": "STAGE",
        "x": 600,
        "y": 200,
        "data": {
            "title": "Sourcing & Báo Giá NCC",
            "subtitle": "Phát hành Magic Link RFQ",
            "code": "STAGE_SOURCING",
            "stageKey": "STAGE_SOURCING",
            "department": "COMMERCIAL",
            "slaDays": 5,
            "description": "Phát hành RFQ tới các nhà chế tạo quốc tế (Siemens, Hitachi, TBEA, Hyosung) và tổng hợp so sánh Landed Cost",
            "gatekeeper": {
                "layer1DocChecklist": {"enabled": True, "mandatoryDocumentKeys": ["BAO_GIA_NCC_CIF", "BANG_SO_SANH_LANDED_COST"], "minimumFilesCount": 2},
                "layer2Financial": {"enabled": True, "maxBudgetThresholdVnd": 185000000000, "minBidBondPercentage": 1.5, "targetProfitMargin": 12.5},
                "layer3Approval": {"enabled": True, "requiredApproverRoles": ["SOURCING_DIRECTOR"], "minApprovalLevel": 2},
                "layer4DistributedLock": {"enabled": False}
            }
        }
    },
    {
        "id": "node-dossier",
        "type": "STAGE",
        "x": 860,
        "y": 200,
        "data": {
            "title": "Lập Hồ Sơ Dự Thầu (HSDT)",
            "subtitle": "Kỹ thuật, Tài chính & Pháp lý",
            "code": "STAGE_DOSSIER",
            "stageKey": "STAGE_DOSSIER_PREP",
            "department": "BID_MANAGER",
            "slaDays": 4,
            "description": "Hoàn thiện đề xuất kỹ thuật, đơn dự thầu, bảo lãnh dự thầu ngân hàng Swift MT760 và hồ sơ năng lực kinh nghiệm",
            "gatekeeper": {
                "layer1DocChecklist": {"enabled": True, "mandatoryDocumentKeys": ["DON_DU_THAU", "BAO_LANH_NGAN_HANG", "HO_SO_KY_THUAT"], "minimumFilesCount": 3},
                "layer2Financial": {"enabled": True, "maxBudgetThresholdVnd": 185000000000, "minBidBondPercentage": 2.0, "targetProfitMargin": 10.0},
                "layer3Approval": {"enabled": True, "requiredApproverRoles": ["LEGAL_CHIEF", "CFO"], "minApprovalLevel": 2},
                "layer4DistributedLock": {"enabled": False}
            }
        }
    },
    {
        "id": "node-approval",
        "type": "APPROVAL",
        "x": 1120,
        "y": 200,
        "data": {
            "title": "Hội Đồng Phê Duyệt Chốt Giá",
            "subtitle": "Ban Tổng Giám Đốc",
            "code": "STAGE_APPROVAL",
            "stageKey": "STAGE_INTERNAL_REVIEW",
            "department": "BOARD_OF_DIRECTORS",
            "slaDays": 1,
            "description": "Chốt giá dự thầu cuối cùng, tỷ lệ giảm giá, phương án thanh toán và ký số phê duyệt",
            "gatekeeper": {
                "layer1DocChecklist": {"enabled": True, "mandatoryDocumentKeys": ["TO_TRINH_PHE_DUYET_GIA", "BIEN_BAN_HOP_HDQT"], "minimumFilesCount": 1},
                "layer2Financial": {"enabled": True, "maxBudgetThresholdVnd": 185000000000, "minBidBondPercentage": 2.0, "targetProfitMargin": 10.0},
                "layer3Approval": {"enabled": True, "requiredApproverRoles": ["CEO", "DEPUTY_CEO_TECH"], "minApprovalLevel": 3},
                "layer4DistributedLock": {"enabled": True, "lockKey": "LOCK_FINAL_BID_SUBMISSION", "leaseTimeSeconds": 300, "retryAttempts": 5}
            }
        }
    },
    {
        "id": "node-end",
        "type": "END",
        "x": 1380,
        "y": 200,
        "data": {
            "title": "Nộp Thầu Thành Công",
            "subtitle": "Niêm phong số & Biên lai nộp",
            "code": "END_NODE",
            "stageKey": "STAGE_SUBMITTED",
            "department": "BID_MANAGER",
            "slaDays": 0,
            "description": "Hồ sơ dự thầu đã được mã hóa bằng chứng thư số công cộng và nộp thành công lên hệ thống đấu thầu",
            "gatekeeper": {
                "layer1DocChecklist": {"enabled": True, "mandatoryDocumentKeys": ["BIEN_LAI_NOP_THAU_SO"], "minimumFilesCount": 1},
                "layer2Financial": {"enabled": False},
                "layer3Approval": {"enabled": False},
                "layer4DistributedLock": {"enabled": False}
            }
        }
    }
]

edges_standard = [
    {
        "id": "edge-1",
        "sourceNodeId": "node-start",
        "targetNodeId": "node-prep",
        "sourceHandle": "right",
        "targetHandle": "left",
        "label": "Bàn giao HSMT",
        "color": "#3b82f6"
    },
    {
        "id": "edge-2",
        "sourceNodeId": "node-prep",
        "targetNodeId": "node-sourcing",
        "sourceHandle": "right",
        "targetHandle": "left",
        "label": "BoQ đã chốt",
        "color": "#10b981"
    },
    {
        "id": "edge-3",
        "sourceNodeId": "node-sourcing",
        "targetNodeId": "node-dossier",
        "sourceHandle": "right",
        "targetHandle": "left",
        "label": "Báo giá NCC đầy đủ",
        "color": "#6366f1"
    },
    {
        "id": "edge-4",
        "sourceNodeId": "node-dossier",
        "targetNodeId": "node-approval",
        "sourceHandle": "right",
        "targetHandle": "left",
        "label": "Trình phê duyệt",
        "color": "#f59e0b"
    },
    {
        "id": "edge-5",
        "sourceNodeId": "node-approval",
        "targetNodeId": "node-end",
        "sourceHandle": "right",
        "targetHandle": "left",
        "label": "Đã phê duyệt",
        "color": "#8b5cf6"
    }
]

nodes_json_str = json.dumps(nodes_standard, ensure_ascii=False)
edges_json_str = json.dumps(edges_standard, ensure_ascii=False)

# Escape single quotes for SQL
nodes_sql = nodes_json_str.replace("'", "''")
edges_sql = edges_json_str.replace("'", "''")

sql = f"""
UPDATE workflow_definitions
SET nodes_json = '{nodes_sql}',
    edges_json = '{edges_sql}',
    tenant_id = '11111111-1111-1111-1111-111111111111',
    updated_at = NOW();
"""

with open("/tmp/update_wf.sql", "w", encoding="utf-8") as f:
    f.write(sql)

print("Saved SQL update script to /tmp/update_wf.sql")
