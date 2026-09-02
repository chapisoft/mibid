import json
import subprocess

# 1. WF-EEMC-2026-v2.1: Quy Trình Máy Biến Áp 220kV EEMC
eemc_nodes = [
    {
        "id": "node-eemc-start",
        "type": "START",
        "x": 80,
        "y": 240,
        "data": {
            "code": "START_EEMC",
            "title": "Khởi Động Gói Thầu 220kV",
            "subtitle": "Kích hoạt hồ sơ dự thầu trạm 220kV Đông Anh",
            "department": "BID_MANAGEMENT",
            "slaDays": 1,
            "description": "Tiếp nhận thông báo mời thầu và kiểm tra điều kiện pháp lý tiên quyết",
            "gatekeeper": {"layer1DocChecklist": {"enabled": False}, "layer2Financial": {"enabled": False}, "layer3Approval": {"enabled": False}, "layer4DistributedLock": {"enabled": False}},
            "assignedRoles": ["BID_MANAGER"]
        }
    },
    {
        "id": "node-eemc-prep",
        "type": "STAGE",
        "x": 300,
        "y": 240,
        "data": {
            "code": "STAGE_PREP_TECH",
            "title": "Bóc Tách BoQ & Thẩm Định Kỹ Thuật",
            "subtitle": "Đánh giá thông số tổn hao Po, Pk & Dung lượng 250MVA",
            "department": "TECHNICAL",
            "slaDays": 3,
            "description": "Phân tích bản vẽ kết cấu ruột máy, tính toán tổn hao theo tiêu chuẩn IEC 60076",
            "gatekeeper": {"layer1DocChecklist": {"enabled": True, "docCount": 3}, "layer2Financial": {"enabled": False}, "layer3Approval": {"enabled": False}, "layer4DistributedLock": {"enabled": False}},
            "assignedRoles": ["TECHNICAL_LEAD"]
        }
    },
    {
        "id": "node-eemc-cond-fat",
        "type": "CONDITION",
        "x": 560,
        "y": 240,
        "data": {
            "code": "COND_FAT_KEMA",
            "title": "Phân Loại Thử Nghiệm FAT",
            "subtitle": "Đoản mạch đặc biệt KEMA hay Chuẩn xuất xưởng?",
            "department": "TECHNICAL",
            "slaDays": 1,
            "description": "Xác định gói thầu có bắt buộc chứng chỉ ngắn mạch phòng thí nghiệm độc lập quốc tế KEMA",
            "gatekeeper": {"layer1DocChecklist": {"enabled": False}, "layer2Financial": {"enabled": False}, "layer3Approval": {"enabled": False}, "layer4DistributedLock": {"enabled": False}},
            "conditionBranches": [
                {"id": "b-kema", "label": "Yêu Cầu Thử Ngắn Mạch KEMA", "expression": "is_kema_required == true", "targetNodeId": "node-eemc-kema-task"},
                {"id": "b-std", "label": "FAT Nhà Máy Tiêu Chuẩn", "expression": "is_kema_required == false", "targetNodeId": "node-eemc-sourcing"}
            ],
            "assignedRoles": ["TECHNICAL_LEAD"]
        }
    },
    {
        "id": "node-eemc-kema-task",
        "type": "TASK",
        "x": 800,
        "y": 100,
        "data": {
            "code": "TASK_KEMA_INSPECT",
            "title": "Kế Hoạch Kiểm Định KEMA Quốc Tế",
            "subtitle": "Thu xếp chứng thư kiểm định ngắn mạch tại Hà Lan",
            "department": "TECHNICAL",
            "slaDays": 5,
            "description": "Liên hệ đại diện KEMA Arnhem để phê duyệt quy trình đo xung sét 1050kV và quá áp liên tục",
            "gatekeeper": {"layer1DocChecklist": {"enabled": True, "docCount": 2}, "layer2Financial": {"enabled": True, "maxBudget": 500000000}, "layer3Approval": {"enabled": False}, "layer4DistributedLock": {"enabled": False}},
            "assignedRoles": ["TECHNICAL_LEAD"]
        }
    },
    {
        "id": "node-eemc-sourcing",
        "type": "STAGE",
        "x": 1040,
        "y": 240,
        "data": {
            "code": "STAGE_SOURCING_MATERIALS",
            "title": "Sourcing Vật Tư Cốt Lõi (Sứ Xuyên, Tôn Silic)",
            "subtitle": "Phát hành RFQ chào giá 3 hãng G7",
            "department": "PROCUREMENT",
            "slaDays": 4,
            "description": "Lựa chọn bộ Sứ xuyên RIP 220kV, Bộ đổi nấc dưới tải OLTC Reinhausen và Dầu máy biến áp",
            "gatekeeper": {"layer1DocChecklist": {"enabled": True, "docCount": 4}, "layer2Financial": {"enabled": True, "maxBudget": 45000000000}, "layer3Approval": {"enabled": False}, "layer4DistributedLock": {"enabled": False}},
            "assignedRoles": ["PROCUREMENT_LEAD"]
        }
    },
    {
        "id": "node-eemc-gatekeeper",
        "type": "GATEKEEPER",
        "x": 1300,
        "y": 240,
        "data": {
            "code": "GATE_QUALITY_4LAYERS",
            "title": "Quality Gate 4 Tầng & Chống Thầu Ảo",
            "subtitle": "Khóa phân tán Redisson + Đối soát số dư bảo lãnh",
            "department": "BID_MANAGEMENT",
            "slaDays": 1,
            "description": "Kiểm tra 100% hồ sơ pháp lý, ngân sách Landed Cost và chặn trùng lặp gói thầu trên Redis",
            "gatekeeper": {
                "layer1DocChecklist": {"enabled": True, "docCount": 6},
                "layer2Financial": {"enabled": True, "maxBudget": 60000000000},
                "layer3Approval": {"enabled": True, "approvalMode": "ALL_PARALLEL"},
                "layer4DistributedLock": {"enabled": True, "redissonLockKey": "lock:eemc:tender:220kv"}
            },
            "assignedRoles": ["BID_MANAGER", "CFO"]
        }
    },
    {
        "id": "node-eemc-approval",
        "type": "APPROVAL",
        "x": 1560,
        "y": 240,
        "data": {
            "code": "APPROVAL_BOD_CFO",
            "title": "Phê Duyệt Song Song: HĐQT & Giám Đốc Tài Chính",
            "subtitle": "Ký số token PKI & Phê duyệt giá nộp thầu",
            "department": "BOARD_OF_DIRECTORS",
            "slaDays": 2,
            "description": "Ban Giám đốc phê duyệt phương án giá dự thầu, CFO phê duyệt hạn mức bảo lãnh ngân hàng BIDV",
            "gatekeeper": {"layer1DocChecklist": {"enabled": False}, "layer2Financial": {"enabled": False}, "layer3Approval": {"enabled": True, "approvalMode": "ALL_PARALLEL"}, "layer4DistributedLock": {"enabled": False}},
            "assignedRoles": ["CEO", "CFO"]
        }
    },
    {
        "id": "node-eemc-webhook",
        "type": "WEBHOOK",
        "x": 1800,
        "y": 240,
        "data": {
            "code": "WEBHOOK_SAP_ERP",
            "title": "Đồng Bộ Dự Toán Sang SAP S/4HANA",
            "subtitle": "Webhook REST API hạch toán Process Code 992",
            "department": "FINANCE",
            "slaDays": 1,
            "description": "Đẩy số liệu chi phí định mức BOM và kế hoạch giải ngân vốn sang hệ thống ERP doanh nghiệp",
            "gatekeeper": {"layer1DocChecklist": {"enabled": False}, "layer2Financial": {"enabled": False}, "layer3Approval": {"enabled": False}, "layer4DistributedLock": {"enabled": False}},
            "assignedRoles": ["CFO"]
        }
    },
    {
        "id": "node-eemc-end",
        "type": "END",
        "x": 2040,
        "y": 240,
        "data": {
            "code": "END_SUBMITTED",
            "title": "Nộp Thầu Thành Công & Lưu Trữ Mã Hóa",
            "subtitle": "Niêm phong hồ sơ số trên Cổng Đấu thầu Quốc gia",
            "department": "BID_MANAGEMENT",
            "slaDays": 1,
            "description": "Ghi nhận biên lai nộp thầu thành công, lưu trữ khóa bí mật và chuyển sang trạng thái theo dõi chấm thầu",
            "gatekeeper": {"layer1DocChecklist": {"enabled": False}, "layer2Financial": {"enabled": False}, "layer3Approval": {"enabled": False}, "layer4DistributedLock": {"enabled": False}},
            "assignedRoles": ["BID_MANAGER"]
        }
    }
]

eemc_edges = [
    {"id": "e-eemc-1", "sourceNodeId": "node-eemc-start", "targetNodeId": "node-eemc-prep", "label": "Bắt đầu khảo sát"},
    {"id": "e-eemc-2", "sourceNodeId": "node-eemc-prep", "targetNodeId": "node-eemc-cond-fat", "label": "Chuyển thẩm định FAT"},
    {"id": "e-eemc-3", "sourceNodeId": "node-eemc-cond-fat", "targetNodeId": "node-eemc-kema-task", "label": "Cần thử nghiệm KEMA", "color": "#8b5cf6"},
    {"id": "e-eemc-4", "sourceNodeId": "node-eemc-cond-fat", "targetNodeId": "node-eemc-sourcing", "label": "FAT nhà máy đạt chuẩn", "color": "#10b981"},
    {"id": "e-eemc-5", "sourceNodeId": "node-eemc-kema-task", "targetNodeId": "node-eemc-sourcing", "label": "Chứng chỉ KEMA hoàn tất"},
    {"id": "e-eemc-6", "sourceNodeId": "node-eemc-sourcing", "targetNodeId": "node-eemc-gatekeeper", "label": "Đầy đủ báo giá NCC"},
    {"id": "e-eemc-7", "sourceNodeId": "node-eemc-gatekeeper", "targetNodeId": "node-eemc-approval", "label": "Vượt qua Gatekeeper", "color": "#10b981"},
    {"id": "e-eemc-8", "sourceNodeId": "node-eemc-gatekeeper", "targetNodeId": "node-eemc-prep", "label": "Bị từ chối / Hoàn trả làm rõ BoQ", "color": "#ef4444"},
    {"id": "e-eemc-9", "sourceNodeId": "node-eemc-approval", "targetNodeId": "node-eemc-webhook", "label": "HĐQT phê duyệt"},
    {"id": "e-eemc-10", "sourceNodeId": "node-eemc-webhook", "targetNodeId": "node-eemc-end", "label": "Đồng bộ ERP hoàn tất", "color": "#10b981"}
]

# 2. WF-EPC-LOGISTICS-2026: Dự Án EPC Nhơn Trạch 3 & 4 (PVN)
pvn_nodes = [
    {
        "id": "node-pvn-start",
        "type": "START",
        "x": 80,
        "y": 240,
        "data": {
            "code": "START_EPC_FIDIC",
            "title": "Khởi Động Gói Thầu EPC Quốc Tế",
            "subtitle": "Kích hoạt hợp đồng mẫu FIDIC Silver Book",
            "department": "BID_MANAGEMENT",
            "slaDays": 2,
            "description": "Nghiên cứu yêu cầu kỹ thuật nhà máy điện Nhơn Trạch 3&4 và các mốc tiến độ COD cam kết",
            "gatekeeper": {"layer1DocChecklist": {"enabled": False}, "layer2Financial": {"enabled": False}, "layer3Approval": {"enabled": False}, "layer4DistributedLock": {"enabled": False}},
            "assignedRoles": ["BID_MANAGER"]
        }
    },
    {
        "id": "node-pvn-prep",
        "type": "STAGE",
        "x": 300,
        "y": 240,
        "data": {
            "code": "STAGE_CONSORTIUM_SETUP",
            "title": "Thành Lập Liên Danh EPC Quốc Tế",
            "subtitle": "Thỏa thuận phân chia trách nhiệm Leader & Member",
            "department": "LEGAL",
            "slaDays": 5,
            "description": "Ký kết thỏa thuận liên danh (JVA), bảo lãnh chéo và cơ chế giải quyết tranh chấp trọng tài SIAC",
            "gatekeeper": {"layer1DocChecklist": {"enabled": True, "docCount": 4}, "layer2Financial": {"enabled": False}, "layer3Approval": {"enabled": False}, "layer4DistributedLock": {"enabled": False}},
            "assignedRoles": ["LEGAL_COUNSEL"]
        }
    },
    {
        "id": "node-pvn-cond-lc",
        "type": "CONDITION",
        "x": 560,
        "y": 240,
        "data": {
            "code": "COND_FINANCING_LC",
            "title": "Phương Thức Thanh Toán & Tín Dụng",
            "subtitle": "Thư tín dụng L/C trả chậm hay Bảo lãnh Swift MT760?",
            "department": "FINANCE",
            "slaDays": 2,
            "description": "Xác định cơ cấu nguồn vốn tài trợ xuất khẩu ECA từ ngân hàng JBIC / K-EXIM",
            "gatekeeper": {"layer1DocChecklist": {"enabled": False}, "layer2Financial": {"enabled": False}, "layer3Approval": {"enabled": False}, "layer4DistributedLock": {"enabled": False}},
            "conditionBranches": [
                {"id": "b-eca", "label": "Tài Trợ Quốc Tế ECA / L/C 360 Days", "expression": "is_eca_financing == true", "targetNodeId": "node-pvn-swift-task"},
                {"id": "b-dom", "label": "Bảo Lãnh Ngân Hàng Nội Địa Vietcombank", "expression": "is_eca_financing == false", "targetNodeId": "node-pvn-sourcing"}
            ],
            "assignedRoles": ["CFO"]
        }
    },
    {
        "id": "node-pvn-swift-task",
        "type": "TASK",
        "x": 800,
        "y": 100,
        "data": {
            "code": "TASK_SWIFT_MT760",
            "title": "Phát Hành Điện Swift MT760 & Thẩm Định ECA",
            "subtitle": "Xác thực qua mạng viễn thông tài chính quốc tế",
            "department": "FINANCE",
            "slaDays": 4,
            "description": "Đàm phán phí xác nhận L/C, lãi suất SOFR + margin và cam kết bảo lãnh thực hiện hợp đồng",
            "gatekeeper": {"layer1DocChecklist": {"enabled": True, "docCount": 3}, "layer2Financial": {"enabled": True, "maxBudget": 2000000000}, "layer3Approval": {"enabled": False}, "layer4DistributedLock": {"enabled": False}},
            "assignedRoles": ["CFO"]
        }
    },
    {
        "id": "node-pvn-sourcing",
        "type": "STAGE",
        "x": 1040,
        "y": 240,
        "data": {
            "code": "STAGE_TURBINE_HRSG",
            "title": "Sourcing Tua Bin H-Class & Lò HRSG ASME",
            "subtitle": "Đàm phán chào giá với GE Vernova & Doosan",
            "department": "PROCUREMENT",
            "slaDays": 7,
            "description": "Đối soát công suất phát 1500MW, cam kết phát thải môi trường và bảo hành 3 năm sau COD",
            "gatekeeper": {"layer1DocChecklist": {"enabled": True, "docCount": 5}, "layer2Financial": {"enabled": True, "maxBudget": 1200000000000}, "layer3Approval": {"enabled": False}, "layer4DistributedLock": {"enabled": False}},
            "assignedRoles": ["PROCUREMENT_LEAD"]
        }
    },
    {
        "id": "node-pvn-gatekeeper",
        "type": "GATEKEEPER",
        "x": 1300,
        "y": 240,
        "data": {
            "code": "GATE_CAR_INSURANCE",
            "title": "Quality Gate Bảo Hiểm CAR & Giấy Phép Khí Thải",
            "subtitle": "Kiểm tra điều kiện tiên quyết trước khi ký hợp đồng",
            "department": "BID_MANAGEMENT",
            "slaDays": 2,
            "description": "Thẩm tra bảo hiểm mọi rủi ro xây dựng lắp đặt CAR hạn mức 500M USD và tiêu chuẩn QCVN 05:2023/BTNMT",
            "gatekeeper": {
                "layer1DocChecklist": {"enabled": True, "docCount": 8},
                "layer2Financial": {"enabled": True, "maxBudget": 1500000000000},
                "layer3Approval": {"enabled": True, "approvalMode": "ALL_PARALLEL"},
                "layer4DistributedLock": {"enabled": True, "redissonLockKey": "lock:pvn:epc:nt34"}
            },
            "assignedRoles": ["BID_MANAGER", "LEGAL_COUNSEL"]
        }
    },
    {
        "id": "node-pvn-approval",
        "type": "APPROVAL",
        "x": 1560,
        "y": 240,
        "data": {
            "code": "APPROVAL_PVN_BOARD",
            "title": "Phê Duyệt HĐQT Tập Đoàn & Ủy Ban Quản Lý Vốn",
            "subtitle": "Nghị quyết phê duyệt nộp hồ sơ tài chính EPC",
            "department": "BOARD_OF_DIRECTORS",
            "slaDays": 3,
            "description": "Hội đồng Thành viên Tập đoàn Dầu khí Việt Nam phê duyệt hạn mức bảo lãnh và thư cam kết EPC",
            "gatekeeper": {"layer1DocChecklist": {"enabled": False}, "layer2Financial": {"enabled": False}, "layer3Approval": {"enabled": True, "approvalMode": "ALL_PARALLEL"}, "layer4DistributedLock": {"enabled": False}},
            "assignedRoles": ["CEO", "CFO"]
        }
    },
    {
        "id": "node-pvn-webhook",
        "type": "WEBHOOK",
        "x": 1800,
        "y": 240,
        "data": {
            "code": "WEBHOOK_VNACCS_CUSTOMS",
            "title": "Đồng Bộ Hệ Thống Hải Quan Điện Tử VNACCS",
            "subtitle": "Tự động đăng ký danh mục thiết bị siêu trường siêu trọng",
            "department": "LOGISTICS",
            "slaDays": 1,
            "description": "Khai báo tờ khai tạm nhập tái xuất và danh mục miễn thuế máy móc tạo tài sản cố định",
            "gatekeeper": {"layer1DocChecklist": {"enabled": False}, "layer2Financial": {"enabled": False}, "layer3Approval": {"enabled": False}, "layer4DistributedLock": {"enabled": False}},
            "assignedRoles": ["LOGISTICS_LEAD"]
        }
    },
    {
        "id": "node-pvn-end",
        "type": "END",
        "x": 2040,
        "y": 240,
        "data": {
            "code": "END_EPC_SUBMITTED",
            "title": "Hoàn Tất Nộp Thầu EPC Quốc Tế",
            "subtitle": "Niêm phong thùng hồ sơ kỹ thuật & tài chính",
            "department": "BID_MANAGEMENT",
            "slaDays": 1,
            "description": "Bàn giao hồ sơ tại Ban Quản lý Dự án Điện Nhơn Trạch, nhận biên bản mở thầu công khai",
            "gatekeeper": {"layer1DocChecklist": {"enabled": False}, "layer2Financial": {"enabled": False}, "layer3Approval": {"enabled": False}, "layer4DistributedLock": {"enabled": False}},
            "assignedRoles": ["BID_MANAGER"]
        }
    }
]

pvn_edges = [
    {"id": "e-pvn-1", "sourceNodeId": "node-pvn-start", "targetNodeId": "node-pvn-prep", "label": "Khởi động liên danh"},
    {"id": "e-pvn-2", "sourceNodeId": "node-pvn-prep", "targetNodeId": "node-pvn-cond-lc", "label": "Thẩm tra tài chính"},
    {"id": "e-pvn-3", "sourceNodeId": "node-pvn-cond-lc", "targetNodeId": "node-pvn-swift-task", "label": "Vốn vay ECA / L/C quốc tế", "color": "#8b5cf6"},
    {"id": "e-pvn-4", "sourceNodeId": "node-pvn-cond-lc", "targetNodeId": "node-pvn-sourcing", "label": "Bảo lãnh nội địa", "color": "#10b981"},
    {"id": "e-pvn-5", "sourceNodeId": "node-pvn-swift-task", "targetNodeId": "node-pvn-sourcing", "label": "Khớp điện MT760 thành công"},
    {"id": "e-pvn-6", "sourceNodeId": "node-pvn-sourcing", "targetNodeId": "node-pvn-gatekeeper", "label": "Chốt cấu hình Tua bin"},
    {"id": "e-pvn-7", "sourceNodeId": "node-pvn-gatekeeper", "targetNodeId": "node-pvn-approval", "label": "Đủ điều kiện bảo hiểm CAR", "color": "#10b981"},
    {"id": "e-pvn-8", "sourceNodeId": "node-pvn-gatekeeper", "targetNodeId": "node-pvn-sourcing", "label": "Yêu cầu đàm phán lại giá thiết bị", "color": "#ef4444"},
    {"id": "e-pvn-9", "sourceNodeId": "node-pvn-approval", "targetNodeId": "node-pvn-webhook", "label": "Nghị quyết HĐQT ban hành"},
    {"id": "e-pvn-10", "sourceNodeId": "node-pvn-webhook", "targetNodeId": "node-pvn-end", "label": "Khai báo hải quan thành công", "color": "#10b981"}
]

# 3. WF-FAST-TRACK-2026: Sứ Xuyên & Cáp Ngầm 110kV Miền Bắc (EVN)
evn_nodes = [
    {
        "id": "node-evn-start",
        "type": "START",
        "x": 80,
        "y": 240,
        "data": {
            "code": "START_FAST_TRACK",
            "title": "Khởi Động Thầu Khẩn Cấp Fast-Track",
            "subtitle": "Đáp ứng tiến độ đóng điện cấp bách 110kV",
            "department": "BID_MANAGEMENT",
            "slaDays": 1,
            "description": "Áp dụng cơ chế rút gọn theo điều 23 Luật Đấu thầu 2023 cho gói thầu mua sắm thay thế khẩn cấp",
            "gatekeeper": {"layer1DocChecklist": {"enabled": False}, "layer2Financial": {"enabled": False}, "layer3Approval": {"enabled": False}, "layer4DistributedLock": {"enabled": False}},
            "assignedRoles": ["BID_MANAGER"]
        }
    },
    {
        "id": "node-evn-prep",
        "type": "STAGE",
        "x": 320,
        "y": 240,
        "data": {
            "code": "STAGE_CABLE_SOIL",
            "title": "Đo Kiểm Điện Trở Suất Đất & Chiều Dài Tuyến",
            "subtitle": "Khảo sát thực địa tuyến cáp ngầm 110kV Tây Bắc",
            "department": "TECHNICAL",
            "slaDays": 2,
            "description": "Lập bản đồ rải cáp, xác định vị trí đặt hộp nối cáp chống nước và nối đất tiếp địa trạm",
            "gatekeeper": {"layer1DocChecklist": {"enabled": True, "docCount": 2}, "layer2Financial": {"enabled": False}, "layer3Approval": {"enabled": False}, "layer4DistributedLock": {"enabled": False}},
            "assignedRoles": ["TECHNICAL_LEAD"]
        }
    },
    {
        "id": "node-evn-sourcing",
        "type": "STAGE",
        "x": 600,
        "y": 240,
        "data": {
            "code": "STAGE_RFQ_FAST",
            "title": "Chào Giá Sourcing Nhanh Cáp XLPE 110kV",
            "subtitle": "Ưu tiên sẵn hàng trong kho (LS Cable, Prysmian)",
            "department": "PROCUREMENT",
            "slaDays": 2,
            "description": "Yêu cầu cam kết giao hàng trong 14 ngày làm việc và chứng nhận thử nghiệm điện áp cao",
            "gatekeeper": {"layer1DocChecklist": {"enabled": True, "docCount": 3}, "layer2Financial": {"enabled": True, "maxBudget": 28000000000}, "layer3Approval": {"enabled": False}, "layer4DistributedLock": {"enabled": False}},
            "assignedRoles": ["PROCUREMENT_LEAD"]
        }
    },
    {
        "id": "node-evn-gatekeeper",
        "type": "GATEKEEPER",
        "x": 880,
        "y": 240,
        "data": {
            "code": "GATE_EMERGENCY_CHECK",
            "title": "Gatekeeper Kiểm Tra Sự Cố & Tiến Độ",
            "subtitle": "Xác nhận tính cấp bách và cam kết tiến độ",
            "department": "BID_MANAGEMENT",
            "slaDays": 1,
            "description": "Chốt chặn kiểm soát không vượt trần dự toán và văn bản phê duyệt mua sắm khẩn cấp của EVN",
            "gatekeeper": {
                "layer1DocChecklist": {"enabled": True, "docCount": 4},
                "layer2Financial": {"enabled": True, "maxBudget": 30000000000},
                "layer3Approval": {"enabled": True, "approvalMode": "ANY"},
                "layer4DistributedLock": {"enabled": True, "redissonLockKey": "lock:evn:fasttrack:110kv"}
            },
            "assignedRoles": ["BID_MANAGER"]
        }
    },
    {
        "id": "node-evn-approval",
        "type": "APPROVAL",
        "x": 1160,
        "y": 240,
        "data": {
            "code": "APPROVAL_QUICK_CEO",
            "title": "Phê Duyệt Nhanh: Tổng Giám Đốc",
            "subtitle": "Ký điện tử trong vòng 4 giờ làm việc",
            "department": "BOARD_OF_DIRECTORS",
            "slaDays": 1,
            "description": "Ký duyệt quyết định chỉ định thầu rút gọn hoặc phê duyệt kết quả chào giá cạnh tranh",
            "gatekeeper": {"layer1DocChecklist": {"enabled": False}, "layer2Financial": {"enabled": False}, "layer3Approval": {"enabled": True, "approvalMode": "ANY"}, "layer4DistributedLock": {"enabled": False}},
            "assignedRoles": ["CEO"]
        }
    },
    {
        "id": "node-evn-webhook",
        "type": "WEBHOOK",
        "x": 1420,
        "y": 240,
        "data": {
            "code": "WEBHOOK_EVN_PORTAL",
            "title": "Công Khai Kết Quả Lên Cổng EVN Portal",
            "subtitle": "Đồng bộ API minh bạch kết quả mua sắm",
            "department": "FINANCE",
            "slaDays": 1,
            "description": "Tự động đăng tải thông báo kết quả lựa chọn nhà thầu và tạo đơn đặt hàng PO",
            "gatekeeper": {"layer1DocChecklist": {"enabled": False}, "layer2Financial": {"enabled": False}, "layer3Approval": {"enabled": False}, "layer4DistributedLock": {"enabled": False}},
            "assignedRoles": ["BID_MANAGER"]
        }
    },
    {
        "id": "node-evn-end",
        "type": "END",
        "x": 1660,
        "y": 240,
        "data": {
            "code": "END_FAST_DELIVERY",
            "title": "Phát Lệnh Giao Hàng & Bàn Giao",
            "subtitle": "Chuyển giao cáp ngầm tới công trường",
            "department": "LOGISTICS",
            "slaDays": 1,
            "description": "Hoàn tất nghiệm thu tiếp nhận tại công trường, chuẩn bị thi công kéo rải cáp",
            "gatekeeper": {"layer1DocChecklist": {"enabled": False}, "layer2Financial": {"enabled": False}, "layer3Approval": {"enabled": False}, "layer4DistributedLock": {"enabled": False}},
            "assignedRoles": ["LOGISTICS_LEAD"]
        }
    }
]

evn_edges = [
    {"id": "e-evn-1", "sourceNodeId": "node-evn-start", "targetNodeId": "node-evn-prep", "label": "Khảo sát nhanh"},
    {"id": "e-evn-2", "sourceNodeId": "node-evn-prep", "targetNodeId": "node-evn-sourcing", "label": "Có thông số tuyến cáp"},
    {"id": "e-evn-3", "sourceNodeId": "node-evn-sourcing", "targetNodeId": "node-evn-gatekeeper", "label": "Nhận báo giá 48h"},
    {"id": "e-evn-4", "sourceNodeId": "node-evn-gatekeeper", "targetNodeId": "node-evn-approval", "label": "Đạt chốt chặn khẩn cấp", "color": "#10b981"},
    {"id": "e-evn-5", "sourceNodeId": "node-evn-gatekeeper", "targetNodeId": "node-evn-sourcing", "label": "Giá vượt hạn mức cho phép", "color": "#ef4444"},
    {"id": "e-evn-6", "sourceNodeId": "node-evn-approval", "targetNodeId": "node-evn-webhook", "label": "Ký số ban hành"},
    {"id": "e-evn-7", "sourceNodeId": "node-evn-webhook", "targetNodeId": "node-evn-end", "label": "Đăng tải hoàn tất", "color": "#10b981"}
]

# 4. WF-SPARE-PARTS-2026: Thiết Bị Tín Hiệu Metro Hà Nội
metro_nodes = [
    {
        "id": "node-metro-start",
        "type": "START",
        "x": 80,
        "y": 240,
        "data": {
            "code": "START_METRO",
            "title": "Khởi Động Gói Thầu Tín Hiệu Metro",
            "subtitle": "Kích hoạt tiêu chuẩn đường sắt đô thị EN 50126",
            "department": "BID_MANAGEMENT",
            "slaDays": 1,
            "description": "Nghiên cứu yêu cầu kỹ thuật hệ thống điều khiển tàu tự động CBTC tuyến Metro số 3",
            "gatekeeper": {"layer1DocChecklist": {"enabled": False}, "layer2Financial": {"enabled": False}, "layer3Approval": {"enabled": False}, "layer4DistributedLock": {"enabled": False}},
            "assignedRoles": ["BID_MANAGER"]
        }
    },
    {
        "id": "node-metro-rams",
        "type": "TASK",
        "x": 300,
        "y": 240,
        "data": {
            "code": "TASK_RAMS_AUDIT",
            "title": "Đánh Giá Độ An Toàn RAMS (SIL-4)",
            "subtitle": "Thẩm tra độ tin cậy, sẵn sàng, bảo trì & an toàn",
            "department": "TECHNICAL",
            "slaDays": 4,
            "description": "Yêu cầu chứng chỉ TÜV Rheinland cho thiết bị vi xử lý điều khiển trung tâm OCC",
            "gatekeeper": {"layer1DocChecklist": {"enabled": True, "docCount": 3}, "layer2Financial": {"enabled": False}, "layer3Approval": {"enabled": False}, "layer4DistributedLock": {"enabled": False}},
            "assignedRoles": ["TECHNICAL_LEAD"]
        }
    },
    {
        "id": "node-metro-emc",
        "type": "TASK",
        "x": 560,
        "y": 240,
        "data": {
            "code": "TASK_EMC_TEST",
            "title": "Thử Nghiệm Tương Thích Điện Từ EMC",
            "subtitle": "Chống can nhiễu từ trường sóng vô tuyến",
            "department": "TECHNICAL",
            "slaDays": 3,
            "description": "Đo kiểm khả năng chống nhiễu từ đường ray thứ 3 điện áp 750V DC sang cáp tín hiệu",
            "gatekeeper": {"layer1DocChecklist": {"enabled": True, "docCount": 2}, "layer2Financial": {"enabled": False}, "layer3Approval": {"enabled": False}, "layer4DistributedLock": {"enabled": False}},
            "assignedRoles": ["TECHNICAL_LEAD"]
        }
    },
    {
        "id": "node-metro-sourcing",
        "type": "STAGE",
        "x": 820,
        "y": 240,
        "data": {
            "code": "STAGE_ATO_SOURCING",
            "title": "Sourcing Thiết Bị Lắp Trên Đoàn Tàu (On-board ATO)",
            "subtitle": "Chào giá từ Alstom, Siemens, Hitachi Rail",
            "department": "PROCUREMENT",
            "slaDays": 5,
            "description": "Lựa chọn ăng-ten thu nhận tín hiệu balise và bộ điều khiển phanh khẩn cấp tự động",
            "gatekeeper": {"layer1DocChecklist": {"enabled": True, "docCount": 4}, "layer2Financial": {"enabled": True, "maxBudget": 75000000000}, "layer3Approval": {"enabled": False}, "layer4DistributedLock": {"enabled": False}},
            "assignedRoles": ["PROCUREMENT_LEAD"]
        }
    },
    {
        "id": "node-metro-gatekeeper",
        "type": "GATEKEEPER",
        "x": 1080,
        "y": 240,
        "data": {
            "code": "GATE_METRO_SAFETY",
            "title": "Gatekeeper Kiểm Định An Toàn Cục Đường Sắt",
            "subtitle": "Đạt 100% tiêu chí an toàn trước khi tích hợp",
            "department": "LEGAL",
            "slaDays": 2,
            "description": "Hồ sơ thẩm định phải có chữ ký của Tư vấn độc lập ISA (Independent Safety Assessor)",
            "gatekeeper": {
                "layer1DocChecklist": {"enabled": True, "docCount": 5},
                "layer2Financial": {"enabled": True, "maxBudget": 80000000000},
                "layer3Approval": {"enabled": True, "approvalMode": "ALL_PARALLEL"},
                "layer4DistributedLock": {"enabled": True, "redissonLockKey": "lock:metro:cbtc:safety"}
            },
            "assignedRoles": ["LEGAL_COUNSEL", "BID_MANAGER"]
        }
    },
    {
        "id": "node-metro-approval",
        "type": "APPROVAL",
        "x": 1340,
        "y": 240,
        "data": {
            "code": "APPROVAL_METRO_BOARD",
            "title": "Phê Duyệt Ban Quản Lý Đường Sắt Đô Thị (MRB)",
            "subtitle": "Hội đồng nghiệm thu kỹ thuật phê duyệt",
            "department": "BOARD_OF_DIRECTORS",
            "slaDays": 2,
            "description": "Ký kết nghiệm thu bàn giao hồ sơ thiết kế kỹ thuật thi công và phương án chạy thử",
            "gatekeeper": {"layer1DocChecklist": {"enabled": False}, "layer2Financial": {"enabled": False}, "layer3Approval": {"enabled": True, "approvalMode": "ALL_PARALLEL"}, "layer4DistributedLock": {"enabled": False}},
            "assignedRoles": ["CEO"]
        }
    },
    {
        "id": "node-metro-webhook",
        "type": "WEBHOOK",
        "x": 1580,
        "y": 240,
        "data": {
            "code": "WEBHOOK_TRAIN_TEST",
            "title": "Kích Hoạt Kịch Bản Chạy Thử Liên Động (Trial Run)",
            "subtitle": "Gửi tín hiệu Webhook tới trung tâm điều hành OCC",
            "department": "TECHNICAL",
            "slaDays": 1,
            "description": "Lập lịch chạy thử 5.000 km không tải để kiểm tra tỷ lệ đúng giờ và khoảng cách dừng đỗ",
            "gatekeeper": {"layer1DocChecklist": {"enabled": False}, "layer2Financial": {"enabled": False}, "layer3Approval": {"enabled": False}, "layer4DistributedLock": {"enabled": False}},
            "assignedRoles": ["TECHNICAL_LEAD"]
        }
    },
    {
        "id": "node-metro-end",
        "type": "END",
        "x": 1820,
        "y": 240,
        "data": {
            "code": "END_METRO_COMMISSION",
            "title": "Nghiệm Thu Đưa Vào Vận Hành Thương Mại",
            "subtitle": "Bàn giao chìa khóa trao tay cho Hanoi Metro",
            "department": "BID_MANAGEMENT",
            "slaDays": 1,
            "description": "Cấp chứng chỉ nghiệm thu bàn giao tạm thời PAC và chuyển sang giai đoạn bảo hành 2 năm",
            "gatekeeper": {"layer1DocChecklist": {"enabled": False}, "layer2Financial": {"enabled": False}, "layer3Approval": {"enabled": False}, "layer4DistributedLock": {"enabled": False}},
            "assignedRoles": ["BID_MANAGER"]
        }
    }
]

metro_edges = [
    {"id": "e-metro-1", "sourceNodeId": "node-metro-start", "targetNodeId": "node-metro-rams", "label": "Khảo sát an toàn"},
    {"id": "e-metro-2", "sourceNodeId": "node-metro-rams", "targetNodeId": "node-metro-emc", "label": "Đạt chuẩn SIL-4"},
    {"id": "e-metro-3", "sourceNodeId": "node-metro-emc", "targetNodeId": "node-metro-sourcing", "label": "Đạt chống nhiễu EMC"},
    {"id": "e-metro-4", "sourceNodeId": "node-metro-sourcing", "targetNodeId": "node-metro-gatekeeper", "label": "Chốt nhà thầu Alstom"},
    {"id": "e-metro-5", "sourceNodeId": "node-metro-gatekeeper", "targetNodeId": "node-metro-approval", "label": "Tư vấn ISA chấp thuận", "color": "#10b981"},
    {"id": "e-metro-6", "sourceNodeId": "node-metro-gatekeeper", "targetNodeId": "node-metro-rams", "label": "Yêu cầu kiểm tra lại RAMS", "color": "#ef4444"},
    {"id": "e-metro-7", "sourceNodeId": "node-metro-approval", "targetNodeId": "node-metro-webhook", "label": "MRB thông qua"},
    {"id": "e-metro-8", "sourceNodeId": "node-metro-webhook", "targetNodeId": "node-metro-end", "label": "Trial run 5000km thành công", "color": "#10b981"}
]

workflows = [
    {
        "code": "WF-EEMC-2026-v2.1",
        "nodes": eemc_nodes,
        "edges": eemc_edges
    },
    {
        "code": "WF-EPC-LOGISTICS-2026",
        "nodes": pvn_nodes,
        "edges": pvn_edges
    },
    {
        "code": "WF-FAST-TRACK-2026",
        "nodes": evn_nodes,
        "edges": evn_edges
    },
    {
        "code": "WF-SPARE-PARTS-2026",
        "nodes": metro_nodes,
        "edges": metro_edges
    }
]

# Thực hiện cập nhật vào PostgreSQL
for wf in workflows:
    code = wf["code"]
    nodes_str = json.dumps(wf["nodes"], ensure_ascii=False)
    edges_str = json.dumps(wf["edges"], ensure_ascii=False)
    
    # Escape single quote for SQL
    nodes_sql = nodes_str.replace("'", "''")
    edges_sql = edges_str.replace("'", "''")
    
    sql = f"""
    UPDATE workflow_definitions
    SET nodes_json = '{nodes_sql}',
        edges_json = '{edges_sql}',
        updated_at = NOW()
    WHERE code = '{code}';
    """
    
    cmd = ["docker", "exec", "-i", "mibid-postgres", "psql", "-U", "mibid_admin", "-d", "mibid_prod"]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    out, err = p.communicate(input=sql)
    if p.returncode != 0:
        print(f"Error updating {code}: {err}")
    else:
        print(f"Successfully updated {code}: {out.strip()}")

print("All rich workflows seeded successfully!")
