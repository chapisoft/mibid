import { TenderStage } from '../types';
import { Translations } from '../i18n';
import { apiClient } from '../../services/apiClient';

export interface StageChecklistItem {
  id: string;
  stage: TenderStage;
  title: string;
  description: string;
  isRequired: boolean;
  docCode: string;
  assigneeRole: string;
}

export const fetchStageRequirementsFromApi = async (
  stage: TenderStage,
  t?: Translations
): Promise<StageChecklistItem[]> => {
  try {
    const list = await apiClient.get<any[]>(`/projects/stage-requirements?stage=${encodeURIComponent(stage)}`);
    if (list && list.length > 0) {
      return list.map((item) => {
        const itemI18n = t?.checklist ? (t.checklist as any)?.[item.id] : undefined;
        return {
          id: item.id,
          stage: item.stage as TenderStage,
          title: itemI18n?.title || item.title,
          description: itemI18n?.description || item.description,
          isRequired: item.isRequired,
          docCode: item.docCode,
          assigneeRole: itemI18n?.assigneeRole || item.assigneeRole,
        };
      });
    }
  } catch {
    // fallback to local definitions
  }
  return getStageRequirements(t || ({} as any), stage);
};

export const getStageRequirements = (t: Translations, stage: TenderStage): StageChecklistItem[] => {
  const baseList = STAGE_REQUIREMENTS[stage] || [];
  if (!t || !t.checklist) return baseList;

  return baseList.map((item) => {
    const itemI18n = (t.checklist as any)?.[item.id];
    return {
      ...item,
      title: itemI18n?.title || item.title,
      description: itemI18n?.description || item.description,
      assigneeRole: itemI18n?.assigneeRole || item.assigneeRole,
    };
  });
};

export const STAGE_REQUIREMENTS: Record<TenderStage, StageChecklistItem[]> = {
  [TenderStage.STAGE_PREPARATION]: [
    {
      id: 'chk-prep-1',
      stage: TenderStage.STAGE_PREPARATION,
      title: 'Tải về và phân tích Hồ Sơ Mời Thầu (HSMT / RFP)',
      description: 'Nghiên cứu kỹ các điều kiện tiên quyết, tiêu chuẩn đánh giá kỹ thuật và thương mại',
      isRequired: true,
      docCode: 'HSMT_ANALYSIS_01',
      assigneeRole: 'Tổ trưởng Đấu thầu (Bid Manager)',
    },
    {
      id: 'chk-prep-2',
      stage: TenderStage.STAGE_PREPARATION,
      title: 'Thành lập Tổ chuyên gia Đấu thầu & Phân công nhiệm vụ',
      description: 'Chỉ định Phụ trách Kỹ thuật, Phụ trách Tài chính và Điều phối Sourcing',
      isRequired: true,
      docCode: 'BID_TEAM_DECISION',
      assigneeRole: 'Ban Giám Đốc',
    },
    {
      id: 'chk-prep-3',
      stage: TenderStage.STAGE_PREPARATION,
      title: 'Khảo sát thực địa và lập Biên bản làm rõ hiện trường',
      description: 'Làm việc với Chủ đầu tư để xác nhận điều kiện địa hình, đấu nối hạ tầng kỹ thuật',
      isRequired: false,
      docCode: 'SITE_SURVEY_REPORT',
      assigneeRole: 'Kỹ sư Hiện trường',
    },
    {
      id: 'chk-prep-4',
      stage: TenderStage.STAGE_PREPARATION,
      title: 'Quyết định Phê duyệt tham gia dự thầu (Bid/No-Bid Decision)',
      description: 'Đánh giá tính khả thi, phân tích rủi ro và phê duyệt chủ trương nộp thầu',
      isRequired: true,
      docCode: 'BID_DECISION_MATRIX',
      assigneeRole: 'Hội đồng Quản trị / Giám đốc',
    },
  ],
  [TenderStage.STAGE_SOURCING]: [
    {
      id: 'chk-src-1',
      stage: TenderStage.STAGE_SOURCING,
      title: 'Bóc tách bảng khối lượng vật tư (BOM / MTO)',
      description: 'Chiết xuất đầy đủ danh mục máy móc, thiết bị, quy cách kỹ thuật và xuất xứ yêu cầu',
      isRequired: true,
      docCode: 'BOM_MTO_SPEC',
      assigneeRole: 'Chuyên viên Bóc tách Kỹ thuật',
    },
    {
      id: 'chk-src-2',
      stage: TenderStage.STAGE_SOURCING,
      title: 'Phát hành yêu cầu báo giá (RFQs) cho tối thiểu 3 Nhà cung cấp',
      description: 'Gửi yêu cầu chào giá qua Cổng Vendor Portal và theo dõi phản hồi',
      isRequired: true,
      docCode: 'RFQ_DISPATCH_LOG',
      assigneeRole: 'Chuyên viên Thu mua (Sourcing Specialist)',
    },
    {
      id: 'chk-src-3',
      stage: TenderStage.STAGE_SOURCING,
      title: 'So sánh ma trận giá & Lựa chọn Nhà cung cấp tối ưu',
      description: 'Đánh giá tổng chi phí TCO, thời gian giao hàng và điều kiện thanh toán',
      isRequired: true,
      docCode: 'VENDOR_COMPARISON_MATRIX',
      assigneeRole: 'Trưởng phòng Cung ứng',
    },
    {
      id: 'chk-src-4',
      stage: TenderStage.STAGE_SOURCING,
      title: 'Cam kết kỹ thuật & Thư ủy quyền bán hàng từ Hãng sản xuất (MAF)',
      description: 'Thu thập Manufacturer Authorization Form (MAF) và bảo hành chính hãng',
      isRequired: true,
      docCode: 'MAF_AUTH_LETTER',
      assigneeRole: 'Nhà cung cấp / Đối tác',
    },
  ],
  [TenderStage.STAGE_DOSSIER_PREP]: [
    {
      id: 'chk-dos-1',
      stage: TenderStage.STAGE_DOSSIER_PREP,
      title: 'Hoàn thiện Hồ sơ Năng lực & Pháp lý Doanh nghiệp',
      description: 'Bao gồm Đăng ký kinh doanh, Báo cáo tài chính 3 năm, Chứng chỉ ISO và Hợp đồng tương tự',
      isRequired: true,
      docCode: 'CORP_LEGAL_DOSSIER',
      assigneeRole: 'Pháp chế Doanh nghiệp',
    },
    {
      id: 'chk-dos-2',
      stage: TenderStage.STAGE_DOSSIER_PREP,
      title: 'Lập Hồ sơ Đề xuất Kỹ thuật & Biện pháp thi công lắp đặt',
      description: 'Thuyết minh kỹ thuật, bản vẽ biện pháp thi công, tiến độ thực hiện và sơ đồ nhân sự',
      isRequired: true,
      docCode: 'TECH_PROPOSAL_DOC',
      assigneeRole: 'Trưởng nhóm Kỹ thuật (Technical Lead)',
    },
    {
      id: 'chk-dos-3',
      stage: TenderStage.STAGE_DOSSIER_PREP,
      title: 'Lập Bảng chào giá Dự thầu & Dự toán chi phí chi tiết',
      description: 'Bảng tổng hợp giá dự thầu, chi phí nhân công, vận chuyển, thuế nhập khẩu và dự phòng',
      isRequired: true,
      docCode: 'FIN_BID_PROPOSAL',
      assigneeRole: 'Trưởng phòng Tài chính - Kế toán',
    },
    {
      id: 'chk-dos-4',
      stage: TenderStage.STAGE_DOSSIER_PREP,
      title: 'Phát hành Chứng thư Bảo lãnh dự thầu qua Ngân hàng (Bid Bond)',
      description: 'Đăng ký phát hành bảo lãnh dự thầu với tỷ lệ và thời hạn theo đúng yêu cầu của HSMT',
      isRequired: true,
      docCode: 'BANK_BID_BOND_CERT',
      assigneeRole: 'Kế toán Tài chính / Ngân hàng',
    },
  ],
  [TenderStage.STAGE_INTERNAL_REVIEW]: [
    {
      id: 'chk-rev-1',
      stage: TenderStage.STAGE_INTERNAL_REVIEW,
      title: 'Thẩm định Kỹ thuật nội bộ (Technical Lead Review)',
      description: 'Kiểm tra 100% sự đáp ứng của thiết bị với các thông số kỹ thuật tối thiểu trong HSMT',
      isRequired: true,
      docCode: 'INTERNAL_TECH_EVAL',
      assigneeRole: 'Trưởng phòng Kỹ thuật',
    },
    {
      id: 'chk-rev-2',
      stage: TenderStage.STAGE_INTERNAL_REVIEW,
      title: 'Thẩm định Tài chính & Dòng tiền dự án (Finance Lead Review)',
      description: 'Kiểm tra tỷ suất lợi nhuận gộp, dòng tiền thanh toán và biên độ rủi ro tỷ giá',
      isRequired: true,
      docCode: 'INTERNAL_FIN_EVAL',
      assigneeRole: 'Giám đốc Tài chính (CFO)',
    },
    {
      id: 'chk-rev-3',
      stage: TenderStage.STAGE_INTERNAL_REVIEW,
      title: 'Rà soát Điều khoản Hợp đồng & Rủi ro Pháp lý (Legal Review)',
      description: 'Đánh giá các điều khoản phạt vi phạm, bất khả kháng và cơ chế giải quyết tranh chấp',
      isRequired: true,
      docCode: 'LEGAL_RISK_REPORT',
      assigneeRole: 'Luật sư / Pháp chế',
    },
    {
      id: 'chk-rev-4',
      stage: TenderStage.STAGE_INTERNAL_REVIEW,
      title: 'Ban Giám đốc phê duyệt Hồ sơ dự thầu chính thức',
      description: 'Ký duyệt tờ trình giá dự thầu cuối cùng và quyết định nộp hồ sơ',
      isRequired: true,
      docCode: 'BOD_APPROVAL_SIGN',
      assigneeRole: 'Tổng Giám Đốc (CEO)',
    },
  ],
  [TenderStage.STAGE_SUBMISSION]: [
    {
      id: 'chk-sub-1',
      stage: TenderStage.STAGE_SUBMISSION,
      title: 'Ký số Token USB / Chữ ký số HSM lên toàn bộ tệp tin hồ sơ',
      description: 'Ký số pháp lý đại diện theo pháp luật lên từng file PDF hồ sơ dự thầu',
      isRequired: true,
      docCode: 'DIGITAL_SIGNATURE_LOG',
      assigneeRole: 'Người đại diện Pháp luật',
    },
    {
      id: 'chk-sub-2',
      stage: TenderStage.STAGE_SUBMISSION,
      title: 'Nộp Hồ sơ lên Hệ thống Mạng Đấu thầu Quốc gia hoặc niêm phong bản cứng',
      description: 'Tải toàn bộ file mã hóa lên Cổng Đấu thầu hoặc đóng gói niêm phong theo quy định',
      isRequired: true,
      docCode: 'BID_SUBMIT_CONFIRM',
      assigneeRole: 'Chuyên viên Đấu thầu',
    },
    {
      id: 'chk-sub-3',
      stage: TenderStage.STAGE_SUBMISSION,
      title: 'Xác nhận Biên lai nộp thầu thành công trước thời điểm đóng thầu',
      description: 'Lưu trữ mã số biên lai, thời gian nộp thầu chính xác và xác nhận hệ thống ghi nhận',
      isRequired: true,
      docCode: 'SUBMISSION_RECEIPT',
      assigneeRole: 'Tổ trưởng Đấu thầu',
    },
    {
      id: 'chk-sub-4',
      stage: TenderStage.STAGE_SUBMISSION,
      title: 'Nộp bản gốc Thư Bảo lãnh dự thầu cho Bên mời thầu (nếu yêu cầu)',
      description: 'Bàn giao trực tiếp thư bảo lãnh ngân hàng gốc kèm biên bản giao nhận có ký nhận',
      isRequired: true,
      docCode: 'HANDOVER_BID_BOND_MINUTES',
      assigneeRole: 'Nhân viên Pháp chế / Hiện trường',
    },
  ],
  [TenderStage.STAGE_AWARD_LOGISTICS]: [
    {
      id: 'chk-awd-1',
      stage: TenderStage.STAGE_AWARD_LOGISTICS,
      title: 'Tham dự Lễ mở thầu & Ghi nhận Biên bản mở thầu (Opening Minutes)',
      description: 'Ghi nhận danh sách nhà thầu tham gia, giá dự thầu và thời gian hiệu lực',
      isRequired: true,
      docCode: 'BID_OPENING_MINUTES',
      assigneeRole: 'Đại diện Nhà thầu',
    },
    {
      id: 'chk-awd-2',
      stage: TenderStage.STAGE_AWARD_LOGISTICS,
      title: 'Nhận Quyết định Phê duyệt Kết quả Trúng thầu từ Chủ đầu tư',
      description: 'Thông báo trúng thầu chính thức và thư mời thương thảo hoàn thiện hợp đồng',
      isRequired: true,
      docCode: 'AWARD_DECISION_LETTER',
      assigneeRole: 'Ban Giám Đốc',
    },
    {
      id: 'chk-awd-3',
      stage: TenderStage.STAGE_AWARD_LOGISTICS,
      title: 'Ký kết Hợp đồng Kinh tế & Phát hành Bảo lãnh thực hiện hợp đồng (5-10%)',
      description: 'Ký hợp đồng chính thức và cung cấp bảo lãnh thực hiện hợp đồng qua ngân hàng',
      isRequired: true,
      docCode: 'SIGNED_CONTRACT_DOC',
      assigneeRole: 'Tổng Giám Đốc / Pháp chế',
    },
    {
      id: 'chk-awd-4',
      stage: TenderStage.STAGE_AWARD_LOGISTICS,
      title: 'Kích hoạt Quy trình Logistics, Xuất nhập khẩu & Vận đơn giao hàng',
      description: 'Khởi tạo đơn đặt hàng PO, đặt tàu vận tải quốc tế và làm thủ tục thông quan hải quan',
      isRequired: true,
      docCode: 'LOGISTICS_DISPATCH_ORDER',
      assigneeRole: 'Bộ phận Logistics & Xuất Nhập Khẩu',
    },
  ],
};
