package com.mibid.logistics.controller;

import com.mibid.core.context.TenantContextHolder;
import com.mibid.core.dto.ResultResponse;
import com.mibid.logistics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/goals")
    public ResponseEntity<ResultResponse<AnalyticsService.BiGoalTargetDto>> getGoalTargets() {
        UUID tenantId = TenantContextHolder.getTenantId();
        return ResponseEntity.ok(ResultResponse.success(analyticsService.getGoalTargets(tenantId)));
    }

    @GetMapping("/trends")
    public ResponseEntity<ResultResponse<List<AnalyticsService.QuarterlyWinTrendDto>>> getQuarterlyTrends() {
        UUID tenantId = TenantContextHolder.getTenantId();
        return ResponseEntity.ok(ResultResponse.success(analyticsService.getQuarterlyTrends(tenantId)));
    }

    @GetMapping("/sectors")
    public ResponseEntity<ResultResponse<List<AnalyticsService.IndustrySectorShareDto>>> getSectorShares() {
        UUID tenantId = TenantContextHolder.getTenantId();
        return ResponseEntity.ok(ResultResponse.success(analyticsService.getSectorShares(tenantId)));
    }

    @GetMapping("/tenders")
    public ResponseEntity<ResultResponse<List<AnalyticsService.ItemizedTenderPerformanceDto>>> getItemizedTenders(
            @RequestParam(required = false) String tenderType,
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) String quarter) {
        UUID tenantId = TenantContextHolder.getTenantId();
        return ResponseEntity.ok(ResultResponse.success(analyticsService.getItemizedTenders(tenantId, tenderType, sector, quarter)));
    }

    @GetMapping("/category-spend")
    public ResponseEntity<ResultResponse<List<AnalyticsService.CategorySpendDto>>> getCategorySpend() {
        UUID tenantId = TenantContextHolder.getTenantId();
        return ResponseEntity.ok(ResultResponse.success(analyticsService.getCategorySpend(tenantId)));
    }

    @GetMapping("/vendors")
    public ResponseEntity<ResultResponse<List<AnalyticsService.VendorPerformanceDto>>> getVendorPerformance() {
        UUID tenantId = TenantContextHolder.getTenantId();
        return ResponseEntity.ok(ResultResponse.success(analyticsService.getVendorPerformance(tenantId)));
    }

    @GetMapping("/workload")
    public ResponseEntity<ResultResponse<List<AnalyticsService.DepartmentWorkloadItemDto>>> getDepartmentWorkload() {
        UUID tenantId = TenantContextHolder.getTenantId();
        return ResponseEntity.ok(ResultResponse.success(analyticsService.getDepartmentWorkload(tenantId)));
    }
}
