package com.mibid.workflow.service;

import com.mibid.core.exception.AppException;
import com.mibid.core.exception.ErrorCode;
import com.mibid.workflow.domain.Project;
import com.mibid.workflow.engine.GatekeeperInterceptor;
import com.mibid.workflow.repository.ProjectRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkflowService {

    private final ProjectRepository projectRepository;
    private final GatekeeperInterceptor gatekeeperInterceptor;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StageChecklistItemDto {
        private String id;
        private String stage;
        private String title;
        private String description;
        private boolean isRequired;
        private String docCode;
        private String assigneeRole;
    }

    @Transactional(readOnly = true)
    public List<Project> getProjects(UUID tenantId) {
        return projectRepository.findByTenantId(tenantId);
    }

    @Transactional(readOnly = true)
    public Project getProjectById(UUID id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy dự án: " + id));
    }

    @Transactional
    public Project createProject(Project project, UUID tenantId) {
        if (tenantId == null) {
            tenantId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        }
        project.setTenantId(tenantId);
        if (project.getCode() == null || project.getCode().isBlank()) {
            project.setCode("PROJ-" + System.currentTimeMillis());
        }
        if (project.getStatus() == null || project.getStatus().isBlank()) {
            project.setStatus("IN_PROGRESS");
        }
        if (project.getStageEnum() == null || project.getStageEnum().isBlank()) {
            project.setStageEnum("STAGE_PREPARATION");
        }
        return projectRepository.save(project);
    }

    @Transactional
    public Project updateProject(UUID id, Project updates, UUID tenantId) {
        Project existing = getProjectById(id);

        if (updates.getCode() != null) existing.setCode(updates.getCode());
        if (updates.getName() != null) existing.setName(updates.getName());
        if (updates.getTenderType() != null) existing.setTenderType(updates.getTenderType());
        if (updates.getInvestorType() != null) existing.setInvestorType(updates.getInvestorType());
        if (updates.getInvestorName() != null) existing.setInvestorName(updates.getInvestorName());
        if (updates.getIndustrySector() != null) existing.setIndustrySector(updates.getIndustrySector());
        if (updates.getProcurementMethod() != null) existing.setProcurementMethod(updates.getProcurementMethod());
        if (updates.getEstimatedBudget() != null) existing.setEstimatedBudget(updates.getEstimatedBudget());
        if (updates.getCurrency() != null) existing.setCurrency(updates.getCurrency());
        if (updates.getStageEnum() != null) existing.setStageEnum(updates.getStageEnum());
        if (updates.getBidSubmissionDeadline() != null) existing.setBidSubmissionDeadline(updates.getBidSubmissionDeadline());
        if (updates.getManagerId() != null) existing.setManagerId(updates.getManagerId());
        if (updates.getManagerName() != null) existing.setManagerName(updates.getManagerName());
        if (updates.getCompletedTasks() != null) existing.setCompletedTasks(updates.getCompletedTasks());
        if (updates.getTotalTasks() != null) existing.setTotalTasks(updates.getTotalTasks());
        if (updates.getStatus() != null) existing.setStatus(updates.getStatus());

        return projectRepository.save(existing);
    }

    @Transactional
    public void deleteProject(UUID id, UUID tenantId) {
        Project existing = getProjectById(id);
        existing.setDeleted(true);
        projectRepository.save(existing);
    }

    @Transactional
    public Project transitionStage(UUID tenantId, UUID projectId, UUID targetStageId, String bypassReason) {
        Project project = getProjectById(projectId);

        // Đánh giá 4 lớp Gatekeeper + Redisson Lock phân tán
        gatekeeperInterceptor.evaluateTransitionGate(tenantId, projectId, project.getCurrentStageId(), targetStageId, bypassReason);

        project.setCurrentStageId(targetStageId);
        return projectRepository.save(project);
    }

    public List<StageChecklistItemDto> getStageRequirements(String stage) {
        List<StageChecklistItemDto> list = new ArrayList<>();
        if ("STAGE_PREPARATION".equalsIgnoreCase(stage)) {
            list.add(new StageChecklistItemDto("chk-prep-1", "STAGE_PREPARATION", "Tải về và phân tích Hồ Sơ Mời Thầu (HSMT / RFP)", "Nghiên cứu kỹ các điều kiện tiên quyết, tiêu chuẩn đánh giá kỹ thuật và thương mại", true, "HSMT_ANALYSIS_01", "Tổ trưởng Đấu thầu (Bid Manager)"));
            list.add(new StageChecklistItemDto("chk-prep-2", "STAGE_PREPARATION", "Thành lập Tổ chuyên gia Đấu thầu & Phân công nhiệm vụ", "Chỉ định Phụ trách Kỹ thuật, Phụ trách Tài chính và Điều phối Sourcing", true, "BID_TEAM_DECISION", "Ban Giám Đốc"));
            list.add(new StageChecklistItemDto("chk-prep-3", "STAGE_PREPARATION", "Khảo sát thực địa và lập Biên bản làm rõ hiện trường", "Làm việc với Chủ đầu tư để xác nhận điều kiện địa hình, đấu nối hạ tầng kỹ thuật", false, "SITE_SURVEY_REPORT", "Kỹ sư Hiện trường"));
            list.add(new StageChecklistItemDto("chk-prep-4", "STAGE_PREPARATION", "Quyết định Phê duyệt tham gia dự thầu (Bid/No-Bid Decision)", "Đánh giá tính khả thi, phân tích rủi ro và phê duyệt chủ trương nộp thầu", true, "BID_DECISION_MATRIX", "Hội đồng Quản trị / Giám đốc"));
        } else if ("STAGE_SOURCING".equalsIgnoreCase(stage)) {
            list.add(new StageChecklistItemDto("chk-src-1", "STAGE_SOURCING", "Bóc tách bảng khối lượng vật tư (BOM / MTO)", "Chiết xuất đầy đủ danh mục máy móc, thiết bị, quy cách kỹ thuật và xuất xứ yêu cầu", true, "BOM_MTO_SPEC", "Chuyên viên Bóc tách Kỹ thuật"));
            list.add(new StageChecklistItemDto("chk-src-2", "STAGE_SOURCING", "Phát hành yêu cầu báo giá (RFQs) cho tối thiểu 3 Nhà cung cấp", "Gửi yêu cầu chào giá qua Cổng Vendor Portal và theo dõi phản hồi", true, "RFQ_DISPATCH_LOG", "Chuyên viên Thu mua (Sourcing Specialist)"));
            list.add(new StageChecklistItemDto("chk-src-3", "STAGE_SOURCING", "So sánh ma trận giá & Lựa chọn Nhà cung cấp tối ưu", "Đánh giá tổng chi phí TCO, thời gian giao hàng và điều kiện thanh toán", true, "VENDOR_COMPARISON_MATRIX", "Trưởng phòng Cung ứng"));
            list.add(new StageChecklistItemDto("chk-src-4", "STAGE_SOURCING", "Cam kết kỹ thuật & Thư ủy quyền bán hàng từ Hãng sản xuất (MAF)", "Thu thập Manufacturer Authorization Form (MAF) và bảo hành chính hãng", true, "MAF_AUTH_LETTER", "Nhà cung cấp / Đối tác"));
        } else if ("STAGE_DOSSIER_PREP".equalsIgnoreCase(stage) || "STAGE_DOSSIER".equalsIgnoreCase(stage)) {
            list.add(new StageChecklistItemDto("chk-dos-1", "STAGE_DOSSIER_PREP", "Hoàn thiện Hồ sơ Năng lực & Pháp lý Doanh nghiệp", "Bao gồm Đăng ký kinh doanh, Báo cáo tài chính 3 năm, Chứng chỉ ISO và Hợp đồng tương tự", true, "CORP_LEGAL_DOSSIER", "Pháp chế Doanh nghiệp"));
            list.add(new StageChecklistItemDto("chk-dos-2", "STAGE_DOSSIER_PREP", "Lập Hồ sơ Đề xuất Kỹ thuật & Biện pháp thi công lắp đặt", "Thuyết minh kỹ thuật, bản vẽ biện pháp thi công, tiến độ thực hiện và sơ đồ nhân sự", true, "TECH_PROPOSAL_DOC", "Trưởng nhóm Kỹ thuật (Technical Lead)"));
            list.add(new StageChecklistItemDto("chk-dos-3", "STAGE_DOSSIER_PREP", "Lập Bảng chào giá Dự thầu & Dự toán chi phí chi tiết", "Bảng tổng hợp giá dự thầu, chi phí nhân công, vận chuyển, thuế nhập khẩu và dự phòng", true, "FIN_BID_PROPOSAL", "Trưởng phòng Tài chính - Kế toán"));
            list.add(new StageChecklistItemDto("chk-dos-4", "STAGE_DOSSIER_PREP", "Phát hành Chứng thư Bảo lãnh dự thầu qua Ngân hàng (Bid Bond)", "Đăng ký phát hành bảo lãnh dự thầu với tỷ lệ và thời hạn theo đúng yêu cầu của HSMT", true, "BANK_BID_BOND_CERT", "Kế toán Tài chính / Ngân hàng"));
        } else if ("STAGE_INTERNAL_REVIEW".equalsIgnoreCase(stage) || "STAGE_BID_BOND".equalsIgnoreCase(stage)) {
            list.add(new StageChecklistItemDto("chk-rev-1", "STAGE_INTERNAL_REVIEW", "Thẩm định Kỹ thuật nội bộ (Technical Lead Review)", "Kiểm tra 100% sự đáp ứng của thiết bị với các thông số kỹ thuật tối thiểu trong HSMT", true, "INTERNAL_TECH_EVAL", "Trưởng phòng Kỹ thuật"));
            list.add(new StageChecklistItemDto("chk-rev-2", "STAGE_INTERNAL_REVIEW", "Thẩm định Tài chính & Dòng tiền dự án (Finance Lead Review)", "Kiểm tra tỷ suất lợi nhuận gộp, dòng tiền thanh toán và biên độ rủi ro tỷ giá", true, "INTERNAL_FIN_EVAL", "Giám đốc Tài chính (CFO)"));
            list.add(new StageChecklistItemDto("chk-rev-3", "STAGE_INTERNAL_REVIEW", "Rà soát Điều khoản Hợp đồng & Rủi ro Pháp lý (Legal Review)", "Đánh giá các điều khoản phạt vi phạm, bất khả kháng và cơ chế giải quyết tranh chấp", true, "LEGAL_RISK_REPORT", "Luật sư / Pháp chế"));
            list.add(new StageChecklistItemDto("chk-rev-4", "STAGE_INTERNAL_REVIEW", "Ban Giám đốc phê duyệt Hồ sơ dự thầu chính thức", "Ký duyệt tờ trình giá dự thầu cuối cùng và quyết định nộp hồ sơ", true, "BOD_APPROVAL_SIGN", "Tổng Giám Đốc (CEO)"));
        } else if ("STAGE_SUBMISSION".equalsIgnoreCase(stage)) {
            list.add(new StageChecklistItemDto("chk-sub-1", "STAGE_SUBMISSION", "Ký số Token USB / Chữ ký số HSM lên toàn bộ tệp tin hồ sơ", "Ký số pháp lý đại diện theo pháp luật lên từng file PDF hồ sơ dự thầu", true, "DIGITAL_SIGNATURE_LOG", "Người đại diện Pháp luật"));
            list.add(new StageChecklistItemDto("chk-sub-2", "STAGE_SUBMISSION", "Nộp Hồ sơ lên Hệ thống Mạng Đấu thầu Quốc gia hoặc niêm phong bản cứng", "Tải toàn bộ file mã hóa lên Cổng Đấu thầu hoặc đóng gói niêm phong theo quy định", true, "BID_SUBMIT_CONFIRM", "Chuyên viên Đấu thầu"));
            list.add(new StageChecklistItemDto("chk-sub-3", "STAGE_SUBMISSION", "Xác nhận Biên lai nộp thầu thành công trước thời điểm đóng thầu", "Lưu trữ mã số biên lai, thời gian nộp thầu chính xác và xác nhận hệ thống ghi nhận", true, "SUBMISSION_RECEIPT", "Tổ trưởng Đấu thầu"));
            list.add(new StageChecklistItemDto("chk-sub-4", "STAGE_SUBMISSION", "Nộp bản gốc Thư Bảo lãnh dự thầu cho Bên mời thầu (nếu yêu cầu)", "Bàn giao trực tiếp thư bảo lãnh ngân hàng gốc kèm biên bản giao nhận có ký nhận", true, "HANDOVER_BID_BOND_MINUTES", "Nhân viên Pháp chế / Hiện trường"));
        } else {
            list.add(new StageChecklistItemDto("chk-awd-1", "STAGE_AWARD_LOGISTICS", "Tham dự Lễ mở thầu & Ghi nhận Biên bản mở thầu (Opening Minutes)", "Ghi nhận danh sách nhà thầu tham gia, giá dự thầu và thời gian hiệu lực", true, "BID_OPENING_MINUTES", "Đại diện Nhà thầu"));
            list.add(new StageChecklistItemDto("chk-awd-2", "STAGE_AWARD_LOGISTICS", "Nhận Quyết định Phê duyệt Kết quả Trúng thầu từ Chủ đầu tư", "Thông báo trúng thầu chính thức và thư mời thương thảo hoàn thiện hợp đồng", true, "AWARD_DECISION_LETTER", "Ban Giám Đốc"));
            list.add(new StageChecklistItemDto("chk-awd-3", "STAGE_AWARD_LOGISTICS", "Ký kết Hợp đồng Kinh tế & Phát hành Bảo lãnh thực hiện hợp đồng (5-10%)", "Ký hợp đồng chính thức và cung cấp bảo lãnh thực hiện hợp đồng qua ngân hàng", true, "SIGNED_CONTRACT_DOC", "Tổng Giám Đốc / Pháp chế"));
            list.add(new StageChecklistItemDto("chk-awd-4", "STAGE_AWARD_LOGISTICS", "Kích hoạt Quy trình Logistics, Xuất nhập khẩu & Vận đơn giao hàng", "Khởi tạo đơn đặt hàng PO, đặt tàu vận tải quốc tế và làm thủ tục thông quan hải quan", true, "LOGISTICS_DISPATCH_ORDER", "Bộ phận Logistics & Xuất Nhập Khẩu"));
        }
        return list;
    }
}
