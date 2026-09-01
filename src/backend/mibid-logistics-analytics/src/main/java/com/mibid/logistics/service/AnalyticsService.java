package com.mibid.logistics.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AnalyticsService {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BiGoalTargetDto {
        private BigDecimal biddingRevenueTargetVnd;
        private BigDecimal biddingRevenueActualVnd;
        private Double biddingRevenueProgressPercent;
        private Double winRateTarget;
        private Double winRateActual;
        private Double winRateDiffPercent;
        private BigDecimal sourcingSavingsTargetVnd;
        private BigDecimal sourcingSavingsActualVnd;
        private Double sourcingSavingsProgressPercent;
        private Integer tenderCycleTargetDays;
        private Integer tenderCycleActualDays;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuarterlyWinTrendDto {
        private String quarter;
        private Integer submittedCount;
        private Integer wonCount;
        private Double winRatePercent;
        private BigDecimal revenueWonVnd;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IndustrySectorShareDto {
        private String sectorCode;
        private String sectorName;
        private Integer count;
        private BigDecimal totalValueVnd;
        private Double percentage;
        private String colorHex;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemizedTenderPerformanceDto {
        private String id;
        private String projectCode;
        private String projectName;
        private String tenderType;
        private String industrySector;
        private String investorName;
        private String status;
        private BigDecimal budgetVnd;
        private BigDecimal bidAwardValueVnd;
        private BigDecimal savingsVnd;
        private Double savingsPercent;
        private String winningVendor;
        private String leadTimeStatus;
        private String completionQuarter;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategorySpendDto {
        private String categoryCode;
        private String categoryName;
        private BigDecimal totalSpendVnd;
        private Integer rfqCount;
        private Integer participatingVendorsCount;
        private Double avgSavingsPercent;
        private String primaryVendor;
        private String riskStatus;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VendorPerformanceDto {
        private String vendorId;
        private String vendorCode;
        private String vendorName;
        private String country;
        private Integer rfqsSubmitted;
        private Integer awardedCount;
        private Double winRatePercent;
        private Double fatPassRatePercent;
        private Double onTimeDeliveryRatePercent;
        private BigDecimal totalContractValueUsd;
        private Double overallScore;
        private String ratingTier;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentWorkloadItemDto {
        private String departmentCode;
        private String departmentName;
        private Integer tasksTotal;
        private Integer tasksCompleted;
        private Double onTimePercent;
        private Double avgResponseHours;
        private Double clarificationRatePercent;
    }

    public BiGoalTargetDto getGoalTargets(UUID tenantId) {
        return BiGoalTargetDto.builder()
                .biddingRevenueTargetVnd(new BigDecimal("200000000000"))
                .biddingRevenueActualVnd(new BigDecimal("186000000000"))
                .biddingRevenueProgressPercent(93.0)
                .winRateTarget(75.0)
                .winRateActual(78.5)
                .winRateDiffPercent(3.5)
                .sourcingSavingsTargetVnd(new BigDecimal("15000000000"))
                .sourcingSavingsActualVnd(new BigDecimal("14800000000"))
                .sourcingSavingsProgressPercent(98.6)
                .tenderCycleTargetDays(30)
                .tenderCycleActualDays(28)
                .build();
    }

    public List<QuarterlyWinTrendDto> getQuarterlyTrends(UUID tenantId) {
        List<QuarterlyWinTrendDto> list = new ArrayList<>();
        list.add(new QuarterlyWinTrendDto("Q3/2025", 12, 9, 75.0, new BigDecimal("32000000000")));
        list.add(new QuarterlyWinTrendDto("Q4/2025", 16, 12, 75.0, new BigDecimal("48000000000")));
        list.add(new QuarterlyWinTrendDto("Q1/2026", 14, 11, 78.6, new BigDecimal("45000000000")));
        list.add(new QuarterlyWinTrendDto("Q2/2026", 18, 14, 77.8, new BigDecimal("61000000000")));
        list.add(new QuarterlyWinTrendDto("Q3/2026 (YTD)", 10, 8, 80.0, new BigDecimal("38000000000")));
        return list;
    }

    public List<IndustrySectorShareDto> getSectorShares(UUID tenantId) {
        List<IndustrySectorShareDto> list = new ArrayList<>();
        list.add(new IndustrySectorShareDto("ENERGY_POWER", "Năng Lượng & Điện Lực (EVN)", 6, new BigDecimal("86000000000"), 46.2, "#3b82f6"));
        list.add(new IndustrySectorShareDto("OIL_GAS", "Dầu Khí & Hóa Chất (PVN)", 3, new BigDecimal("42000000000"), 22.6, "#8b5cf6"));
        list.add(new IndustrySectorShareDto("TELECOM_DC", "Viễn Thông & Trung Tâm Dữ Liệu", 3, new BigDecimal("38000000000"), 20.4, "#06b6d4"));
        list.add(new IndustrySectorShareDto("INDUSTRY_WATER", "Công Nghiệp & Xử Lý Nước", 2, new BigDecimal("20000000000"), 10.8, "#10b981"));
        return list;
    }

    public List<ItemizedTenderPerformanceDto> getItemizedTenders(UUID tenantId, String tenderType, String sector, String quarter) {
        List<ItemizedTenderPerformanceDto> list = new ArrayList<>();

        list.add(ItemizedTenderPerformanceDto.builder()
                .id("ten-001")
                .projectCode("BID-2026-EVN-001")
                .projectName("Cung cấp Máy biến áp 220kV TBA Tây Hà Nội")
                .tenderType("TENANT_PARTICIPATING")
                .industrySector("ENERGY_POWER")
                .investorName("Tổng Công Ty Truyền Tải Điện Quốc Gia (EVNNPT)")
                .status("WON")
                .budgetVnd(new BigDecimal("48000000000"))
                .bidAwardValueVnd(new BigDecimal("41353725000"))
                .savingsVnd(new BigDecimal("6646275000"))
                .savingsPercent(13.8)
                .winningVendor("TBEA Co., Ltd (Trung Quốc)")
                .leadTimeStatus("ON_TIME")
                .completionQuarter("Q2/2026")
                .build());

        list.add(ItemizedTenderPerformanceDto.builder()
                .id("ten-002")
                .projectCode("BID-2026-PVN-008")
                .projectName("Cung cấp Thiết bị Van điều khiển Nhà máy Đạm Cà Mau")
                .tenderType("TENANT_PARTICIPATING")
                .industrySector("OIL_GAS")
                .investorName("Công ty Cổ phần Phân bón Dầu khí Cà Mau (PVCFC)")
                .status("WON")
                .budgetVnd(new BigDecimal("22500000000"))
                .bidAwardValueVnd(new BigDecimal("19250000000"))
                .savingsVnd(new BigDecimal("3250000000"))
                .savingsPercent(14.4)
                .winningVendor("Flowserve Corporation (Hà Lan)")
                .leadTimeStatus("EARLY")
                .completionQuarter("Q2/2026")
                .build());

        list.add(ItemizedTenderPerformanceDto.builder()
                .id("ten-003")
                .projectCode("TEN-2026-BUY-012")
                .projectName("Mua Sắm Vật Tư Cáp Điện Trung Thế & Tủ Phân Phối")
                .tenderType("TENANT_ISSUED")
                .industrySector("ENERGY_POWER")
                .investorName("Ban Quản Lý Dự Án Lưới Điện Miền Bắc")
                .status("WON")
                .budgetVnd(new BigDecimal("9500000000"))
                .bidAwardValueVnd(new BigDecimal("7800000000"))
                .savingsVnd(new BigDecimal("1700000000"))
                .savingsPercent(17.9)
                .winningVendor("Công Ty Cổ Phần Dây Cáp Điện Việt Nam (CADIVI)")
                .leadTimeStatus("ON_TIME")
                .completionQuarter("Q3/2026")
                .build());

        list.add(ItemizedTenderPerformanceDto.builder()
                .id("ten-004")
                .projectCode("BID-2026-VTL-015")
                .projectName("Hạ tầng Trạm Nguồn Điện Trung Tâm Dữ liệu Viettel Cloud")
                .tenderType("TENANT_PARTICIPATING")
                .industrySector("TELECOM_DC")
                .investorName("Tổng Công Ty Mạng Lưới Viettel (Viettel Networks)")
                .status("IN_PROGRESS")
                .budgetVnd(new BigDecimal("38000000000"))
                .bidAwardValueVnd(new BigDecimal("34500000000"))
                .savingsVnd(new BigDecimal("3500000000"))
                .savingsPercent(9.2)
                .winningVendor("Schneider Electric SE (Pháp)")
                .leadTimeStatus("ON_TIME")
                .completionQuarter("Q3/2026")
                .build());

        if (tenderType != null && !tenderType.equalsIgnoreCase("ALL")) {
            list.removeIf(item -> !item.getTenderType().equalsIgnoreCase(tenderType));
        }
        if (sector != null && !sector.equalsIgnoreCase("ALL")) {
            list.removeIf(item -> !item.getIndustrySector().equalsIgnoreCase(sector));
        }
        if (quarter != null && !quarter.equalsIgnoreCase("ALL")) {
            list.removeIf(item -> !item.getCompletionQuarter().contains(quarter));
        }

        return list;
    }

    public List<CategorySpendDto> getCategorySpend(UUID tenantId) {
        List<CategorySpendDto> list = new ArrayList<>();
        list.add(new CategorySpendDto("CAT-POWER-TRAFO", "Máy Biến Áp Lực & Thiết Bị Cao Thế (220kV/110kV)", new BigDecimal("86000000000"), 14, 5, 12.5, "Siemens Energy AG / TBEA Co., Ltd", "LOW"));
        list.add(new CategorySpendDto("CAT-OIL-VALVE", "Hệ Thống Van Điều Khiển Áp Suất Cao & Đo Lường Khí", new BigDecimal("42000000000"), 8, 4, 14.4, "Emerson Electric / Flowserve Corporation", "LOW"));
        list.add(new CategorySpendDto("CAT-TELECOM-GENSET", "Máy Phát Điện Dự Phòng & Tủ Nguồn Trung Tâm Dữ Liệu", new BigDecimal("38000000000"), 6, 3, 9.2, "Cummins Inc. / Schneider Electric", "MEDIUM"));
        list.add(new CategorySpendDto("CAT-CABLE-SWITCH", "Cáp Điện Trung Thế & Tủ Phân Phối Trung Thế RMU", new BigDecimal("20000000000"), 5, 4, 17.9, "CADIVI / LS Cable & System", "LOW"));
        return list;
    }

    public List<VendorPerformanceDto> getVendorPerformance(UUID tenantId) {
        List<VendorPerformanceDto> list = new ArrayList<>();
        list.add(new VendorPerformanceDto("vnd-siemens", "VND-SIEMENS-DE", "Siemens Energy AG (CHLB Đức)", "CHLB Đức", 16, 13, 81.3, 100.0, 96.5, new BigDecimal("1450000"), 94.8, "TIER_1_STRATEGIC"));
        list.add(new VendorPerformanceDto("vnd-tbea", "VND-TBEA-CN", "TBEA Co., Ltd (Trung Quốc)", "Trung Quốc", 14, 11, 78.6, 98.2, 94.0, new BigDecimal("1820000"), 92.5, "TIER_1_STRATEGIC"));
        list.add(new VendorPerformanceDto("vnd-emerson", "VND-EMERSON-US", "Emerson Electric Co. (Hoa Kỳ)", "Hoa Kỳ", 10, 8, 80.0, 100.0, 91.0, new BigDecimal("980000"), 91.0, "TIER_1_STRATEGIC"));
        list.add(new VendorPerformanceDto("vnd-lscable", "VND-LSCABLE-KR", "LS Cable & System Ltd (Hàn Quốc)", "Hàn Quốc", 12, 9, 75.0, 100.0, 98.0, new BigDecimal("820000"), 93.2, "TIER_1_STRATEGIC"));
        list.add(new VendorPerformanceDto("vnd-abb", "VND-ABB-CH", "ABB Power Grids Switzerland Ltd (Thụy Sĩ)", "Thụy Sĩ", 9, 7, 77.8, 97.5, 95.5, new BigDecimal("640000"), 90.5, "TIER_2_PREFERRED"));
        list.add(new VendorPerformanceDto("vnd-mibidheavy", "VND-MIBID-HEAVY", "MIBID Heavy Industries (Việt Nam)", "Việt Nam", 8, 7, 87.5, 100.0, 100.0, new BigDecimal("750000"), 96.0, "TIER_1_STRATEGIC"));
        return list;
    }

    public List<DepartmentWorkloadItemDto> getDepartmentWorkload(UUID tenantId) {
        List<DepartmentWorkloadItemDto> list = new ArrayList<>();
        list.add(new DepartmentWorkloadItemDto("TECHNICAL", "Phòng Kỹ Thuật & Giải Pháp", 48, 46, 95.8, 4.2, 2.1));
        list.add(new DepartmentWorkloadItemDto("COMMERCIAL", "Phòng Thương Mại & Mua Sắm Sourcing", 64, 60, 93.8, 5.6, 3.5));
        list.add(new DepartmentWorkloadItemDto("FINANCE", "Phòng Tài Chính Kế Toán & Bảo Lãnh", 36, 35, 97.2, 2.8, 0.0));
        list.add(new DepartmentWorkloadItemDto("LEGAL", "Phòng Pháp Chế & Quản Trị Hợp Đồng", 28, 26, 92.9, 5.1, 1.8));
        return list;
    }
}
