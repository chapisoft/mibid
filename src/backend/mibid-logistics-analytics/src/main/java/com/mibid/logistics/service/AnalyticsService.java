package com.mibid.logistics.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final JdbcTemplate jdbcTemplate;

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

    @Transactional(readOnly = true)
    public BiGoalTargetDto getGoalTargets(UUID tenantId) {
        // 1. Tính doanh thu thực tế từ các gói thầu thắng và tỷ lệ thắng từ bảng projects
        final String projectSql = """
                SELECT 
                    COALESCE(SUM(CASE WHEN status = 'WON' THEN estimated_budget ELSE 0 END), 0) AS revenue_won,
                    COUNT(*) AS total_projects,
                    COUNT(CASE WHEN status = 'WON' THEN 1 END) AS won_projects
                FROM projects 
                WHERE (?::uuid IS NULL OR tenant_id = ?::uuid)
                  AND is_deleted = false
                """;

        BigDecimal revenueActual = BigDecimal.ZERO;
        double winRateActual = 0.0;

        try {
            var row = jdbcTemplate.queryForMap(
                    java.util.Objects.requireNonNull(projectSql),
                    tenantId,
                    tenantId
            );
            Number rev = (Number) row.get("revenue_won");
            Number total = (Number) row.get("total_projects");
            Number won = (Number) row.get("won_projects");

            if (rev != null) {
                revenueActual = new BigDecimal(rev.toString());
            }
            long totalCount = total != null ? total.longValue() : 0;
            long wonCount = won != null ? won.longValue() : 0;
            if (totalCount > 0) {
                winRateActual = Math.round((wonCount * 100.0 / totalCount) * 10.0) / 10.0;
            }
        } catch (Exception e) {
            log.warn("Could not query project goal metrics from DB: {}", e.getMessage());
        }

        // 2. Tính tiết kiệm mua sắm thực tế từ bảng rfqs
        final String rfqSql = """
                SELECT 
                    COALESCE(SUM(CASE WHEN budget_amount > total_quote_amount AND total_quote_amount > 0 
                                      THEN (budget_amount - total_quote_amount) ELSE 0 END), 0) AS savings
                FROM rfqs
                WHERE (?::uuid IS NULL OR tenant_id = ?::uuid)
                  AND is_deleted = false
                """;

        BigDecimal savingsActual = BigDecimal.ZERO;
        try {
            var row = jdbcTemplate.queryForMap(
                    java.util.Objects.requireNonNull(rfqSql),
                    tenantId,
                    tenantId
            );
            Number sav = (Number) row.get("savings");
            if (sav != null) {
                savingsActual = new BigDecimal(sav.toString());
            }
        } catch (Exception e) {
            log.warn("Could not query rfq savings metrics from DB: {}", e.getMessage());
        }

        // 3. Đọc chỉ tiêu kế hoạch (Target) từ bảng cấu hình system_config
        BigDecimal revenueTarget = getConfigDecimal("analytics.target.bidding_revenue", BigDecimal.ZERO);
        Double winRateTarget = getConfigDouble("analytics.target.win_rate", 0.0);
        BigDecimal savingsTarget = getConfigDecimal("analytics.target.sourcing_savings", BigDecimal.ZERO);
        Integer cycleTarget = getConfigInt("analytics.target.cycle_days", 0);

        Double revenueProgress = revenueTarget.compareTo(BigDecimal.ZERO) > 0
                ? Math.round(revenueActual.multiply(BigDecimal.valueOf(100)).divide(revenueTarget, 1, RoundingMode.HALF_UP).doubleValue() * 10.0) / 10.0
                : 0.0;

        Double savingsProgress = savingsTarget.compareTo(BigDecimal.ZERO) > 0
                ? Math.round(savingsActual.multiply(BigDecimal.valueOf(100)).divide(savingsTarget, 1, RoundingMode.HALF_UP).doubleValue() * 10.0) / 10.0
                : 0.0;

        return BiGoalTargetDto.builder()
                .biddingRevenueTargetVnd(revenueTarget)
                .biddingRevenueActualVnd(revenueActual)
                .biddingRevenueProgressPercent(revenueProgress)
                .winRateTarget(winRateTarget)
                .winRateActual(winRateActual)
                .winRateDiffPercent(Math.round((winRateActual - winRateTarget) * 10.0) / 10.0)
                .sourcingSavingsTargetVnd(savingsTarget)
                .sourcingSavingsActualVnd(savingsActual)
                .sourcingSavingsProgressPercent(savingsProgress)
                .tenderCycleTargetDays(cycleTarget)
                .tenderCycleActualDays(0)
                .build();
    }

    @Transactional(readOnly = true)
    public List<QuarterlyWinTrendDto> getQuarterlyTrends(UUID tenantId) {
        String sql = """
                SELECT 
                    to_char(created_at, 'YYYY-"Q"Q') AS quarter_code,
                    COUNT(*) AS submitted_count,
                    COUNT(CASE WHEN status = 'WON' THEN 1 END) AS won_count,
                    COALESCE(SUM(CASE WHEN status = 'WON' THEN estimated_budget ELSE 0 END), 0) AS revenue_won
                FROM projects
                WHERE (? IS NULL OR tenant_id = ?)
                  AND is_deleted = false
                GROUP BY quarter_code
                ORDER BY quarter_code DESC
                LIMIT 8
                """;

        List<QuarterlyWinTrendDto> list = new ArrayList<>();
        try {
            jdbcTemplate.query(sql, ps -> {
                ps.setObject(1, tenantId);
                ps.setObject(2, tenantId);
            }, rs -> {
                String q = rs.getString("quarter_code");
                int submitted = rs.getInt("submitted_count");
                int won = rs.getInt("won_count");
                double winRate = submitted > 0 ? Math.round((won * 100.0 / submitted) * 10.0) / 10.0 : 0.0;
                BigDecimal rev = rs.getBigDecimal("revenue_won");

                list.add(new QuarterlyWinTrendDto(q, submitted, won, winRate, rev));
            });
        } catch (Exception e) {
            log.warn("Error fetching quarterly trends: {}", e.getMessage());
        }
        return list;
    }

    @Transactional(readOnly = true)
    public List<IndustrySectorShareDto> getSectorShares(UUID tenantId) {
        String sql = """
                SELECT 
                    COALESCE(industry_sector, 'OTHER') AS sector_code,
                    COUNT(*) AS project_count,
                    COALESCE(SUM(estimated_budget), 0) AS total_val
                FROM projects
                WHERE (? IS NULL OR tenant_id = ?)
                  AND is_deleted = false
                GROUP BY industry_sector
                ORDER BY total_val DESC
                """;

        List<IndustrySectorShareDto> list = new ArrayList<>();
        try {
            BigDecimal grandTotal = BigDecimal.ZERO;
            List<IndustrySectorShareDto> rawList = new ArrayList<>();

            List<java.util.Map<String, Object>> rows = jdbcTemplate.queryForList(sql, tenantId, tenantId);
            for (var row : rows) {
                String sector = (String) row.get("sector_code");
                int cnt = ((Number) row.get("project_count")).intValue();
                BigDecimal val = new BigDecimal(row.get("total_val").toString());
                grandTotal = grandTotal.add(val);

                rawList.add(IndustrySectorShareDto.builder()
                        .sectorCode(sector)
                        .sectorName(sector)
                        .count(cnt)
                        .totalValueVnd(val)
                        .colorHex("#3b82f6")
                        .build());
            }

            for (var item : rawList) {
                double pct = grandTotal.compareTo(BigDecimal.ZERO) > 0
                        ? item.getTotalValueVnd().multiply(BigDecimal.valueOf(100)).divide(grandTotal, 1, RoundingMode.HALF_UP).doubleValue()
                        : 0.0;
                item.setPercentage(pct);
                list.add(item);
            }
        } catch (Exception e) {
            log.warn("Error fetching sector shares: {}", e.getMessage());
        }
        return list;
    }

    @Transactional(readOnly = true)
    public List<ItemizedTenderPerformanceDto> getItemizedTenders(UUID tenantId, String tenderType, String sector, String quarter) {
        StringBuilder sql = new StringBuilder("""
                SELECT 
                    id,
                    code,
                    name,
                    tender_type,
                    industry_sector,
                    investor_name,
                    status,
                    estimated_budget,
                    to_char(created_at, 'YYYY-"Q"Q') AS completion_quarter
                FROM projects
                WHERE (? IS NULL OR tenant_id = ?)
                  AND is_deleted = false
                """);

        List<Object> params = new ArrayList<>();
        params.add(tenantId);
        params.add(tenantId);

        if (tenderType != null && !tenderType.equalsIgnoreCase("ALL") && !tenderType.isBlank()) {
            sql.append(" AND UPPER(tender_type) = UPPER(?) ");
            params.add(tenderType);
        }
        if (sector != null && !sector.equalsIgnoreCase("ALL") && !sector.isBlank()) {
            sql.append(" AND UPPER(industry_sector) = UPPER(?) ");
            params.add(sector);
        }
        if (quarter != null && !quarter.equalsIgnoreCase("ALL") && !quarter.isBlank()) {
            sql.append(" AND to_char(created_at, 'YYYY-\"Q\"Q') LIKE ? ");
            params.add("%" + quarter + "%");
        }

        sql.append(" ORDER BY created_at DESC LIMIT 50 ");

        List<ItemizedTenderPerformanceDto> list = new ArrayList<>();
        try {
            jdbcTemplate.query(java.util.Objects.requireNonNull(sql.toString()), ps -> {
                for (int i = 0; i < params.size(); i++) {
                    ps.setObject(i + 1, params.get(i));
                }
            }, rs -> {
                list.add(ItemizedTenderPerformanceDto.builder()
                        .id(rs.getString("id"))
                        .projectCode(rs.getString("code"))
                        .projectName(rs.getString("name"))
                        .tenderType(rs.getString("tender_type"))
                        .industrySector(rs.getString("industry_sector"))
                        .investorName(rs.getString("investor_name"))
                        .status(rs.getString("status"))
                        .budgetVnd(rs.getBigDecimal("estimated_budget"))
                        .bidAwardValueVnd(rs.getBigDecimal("estimated_budget"))
                        .savingsVnd(BigDecimal.ZERO)
                        .savingsPercent(0.0)
                        .winningVendor(null)
                        .leadTimeStatus("ON_TRACK")
                        .completionQuarter(rs.getString("completion_quarter"))
                        .build());
            });
        } catch (Exception e) {
            log.warn("Error fetching itemized tenders: {}", e.getMessage());
        }
        return list;
    }

    @Transactional(readOnly = true)
    public List<CategorySpendDto> getCategorySpend(UUID tenantId) {
        String sql = """
                SELECT 
                    COALESCE(incoterm, 'STANDARD') AS category_code,
                    COUNT(*) AS rfq_count,
                    COALESCE(SUM(total_quote_amount), 0) AS total_spend
                FROM rfqs
                WHERE (? IS NULL OR tenant_id = ?)
                  AND is_deleted = false
                GROUP BY incoterm
                ORDER BY total_spend DESC
                """;

        List<CategorySpendDto> list = new ArrayList<>();
        try {
            jdbcTemplate.query(sql, ps -> {
                ps.setObject(1, tenantId);
                ps.setObject(2, tenantId);
            }, rs -> {
                String code = rs.getString("category_code");
                int count = rs.getInt("rfq_count");
                BigDecimal spend = rs.getBigDecimal("total_spend");

                list.add(new CategorySpendDto(
                        code,
                        code,
                        spend,
                        count,
                        0,
                        0.0,
                        null,
                        "LOW"
                ));
            });
        } catch (Exception e) {
            log.warn("Error fetching category spend: {}", e.getMessage());
        }
        return list;
    }

    @Transactional(readOnly = true)
    public List<VendorPerformanceDto> getVendorPerformance(UUID tenantId) {
        String sql = """
                SELECT 
                    id,
                    code,
                    name,
                    country,
                    total_quotes_submitted,
                    total_won_bids,
                    rating
                FROM supplier_partners
                WHERE (? IS NULL OR tenant_id = ?)
                  AND is_deleted = false
                ORDER BY total_won_bids DESC, rating DESC
                LIMIT 20
                """;

        List<VendorPerformanceDto> list = new ArrayList<>();
        try {
            jdbcTemplate.query(sql, ps -> {
                ps.setObject(1, tenantId);
                ps.setObject(2, tenantId);
            }, rs -> {
                int submitted = rs.getInt("total_quotes_submitted");
                int won = rs.getInt("total_won_bids");
                double winRate = submitted > 0 ? Math.round((won * 100.0 / submitted) * 10.0) / 10.0 : 0.0;
                double rating = rs.getDouble("rating");

                list.add(new VendorPerformanceDto(
                        rs.getString("id"),
                        rs.getString("code"),
                        rs.getString("name"),
                        rs.getString("country"),
                        submitted,
                        won,
                        winRate,
                        100.0,
                        100.0,
                        BigDecimal.ZERO,
                        rating * 20.0,
                        rating >= 4.5 ? "TIER_1_STRATEGIC" : "TIER_2_PREFERRED"
                ));
            });
        } catch (Exception e) {
            log.warn("Error fetching vendor performance: {}", e.getMessage());
        }
        return list;
    }

    @Transactional(readOnly = true)
    public List<DepartmentWorkloadItemDto> getDepartmentWorkload(UUID tenantId) {
        String sql = """
                SELECT 
                    department_code,
                    COUNT(*) AS tasks_total,
                    COUNT(CASE WHEN UPPER(status) IN ('DONE', 'COMPLETED') THEN 1 END) AS tasks_completed
                FROM tasks
                WHERE (? IS NULL OR tenant_id = ?)
                  AND is_deleted = false
                GROUP BY department_code
                ORDER BY tasks_total DESC
                """;

        List<DepartmentWorkloadItemDto> list = new ArrayList<>();
        try {
            jdbcTemplate.query(sql, ps -> {
                ps.setObject(1, tenantId);
                ps.setObject(2, tenantId);
            }, rs -> {
                String dept = rs.getString("department_code");
                int total = rs.getInt("tasks_total");
                int completed = rs.getInt("tasks_completed");
                double onTime = total > 0 ? Math.round((completed * 100.0 / total) * 10.0) / 10.0 : 0.0;

                list.add(new DepartmentWorkloadItemDto(
                        dept,
                        dept,
                        total,
                        completed,
                        onTime,
                        0.0,
                        0.0
                ));
            });
        } catch (Exception e) {
            log.warn("Error fetching department workload: {}", e.getMessage());
        }
        return list;
    }

    private BigDecimal getConfigDecimal(String key, BigDecimal defaultValue) {
        try {
            String val = jdbcTemplate.queryForObject(
                    "SELECT config_value FROM system_config WHERE config_key = ? AND is_active = true",
                    String.class,
                    key
            );
            return val != null && !val.isBlank() ? new BigDecimal(val.trim()) : defaultValue;
        } catch (Exception e) {
            return defaultValue;
        }
    }

    private Double getConfigDouble(String key, Double defaultValue) {
        try {
            String val = jdbcTemplate.queryForObject(
                    "SELECT config_value FROM system_config WHERE config_key = ? AND is_active = true",
                    String.class,
                    key
            );
            return val != null && !val.isBlank() ? Double.parseDouble(val.trim()) : defaultValue;
        } catch (Exception e) {
            return defaultValue;
        }
    }

    private Integer getConfigInt(String key, Integer defaultValue) {
        try {
            String val = jdbcTemplate.queryForObject(
                    "SELECT config_value FROM system_config WHERE config_key = ? AND is_active = true",
                    String.class,
                    key
            );
            return val != null && !val.isBlank() ? Integer.parseInt(val.trim()) : defaultValue;
        } catch (Exception e) {
            return defaultValue;
        }
    }
}
