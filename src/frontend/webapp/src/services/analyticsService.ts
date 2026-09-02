/**
 * Dịch vụ Báo cáo Thống kê & Phân Tích Thông Minh BI (Business Intelligence)
 * Kết nối 100% với Spring Boot Backend REST API (/api/v1/analytics/*)
 */

import { TenderType } from '../shared/types';
import { apiClient } from './apiClient';

export interface BiGoalTarget {
  biddingRevenueTargetVnd: number;
  biddingRevenueActualVnd: number;
  biddingRevenueProgressPercent: number;
  winRateTarget: number;
  winRateActual: number;
  winRateDiffPercent: number;
  sourcingSavingsTargetVnd: number;
  sourcingSavingsActualVnd: number;
  sourcingSavingsProgressPercent: number;
  tenderCycleTargetDays: number;
  tenderCycleActualDays: number;
}

export interface QuarterlyWinTrend {
  quarter: string;
  submittedCount: number;
  wonCount: number;
  winRatePercent: number;
  revenueWonVnd: number;
}

export interface IndustrySectorShare {
  sectorCode: string;
  sectorName: string;
  tenderCount: number;
  totalValueVnd: number;
  sharePercent: number;
}

export interface ItemizedTenderPerformance {
  id: string;
  projectCode: string;
  projectName: string;
  investorName: string;
  tenderType: TenderType;
  industrySector: 'POWER' | 'OIL_GAS' | 'TELECOM' | 'EXPORT_OVERSEAS';
  budgetVnd: number;
  finalPriceVnd: number;
  savingsOrMarginPercent: number;
  biddingStatus: 'WON' | 'IN_REVIEW' | 'SUBMITTED' | 'SOURCING_COMPLETED';
  cycleDays: number;
  completionQuarter: string;
  primaryVendorOrPartner: string;
}

export interface CategorySpendAnalytics {
  categoryCode: string;
  categoryName: string;
  totalSpendVnd: number;
  rfqCount: number;
  participatingVendorsCount: number;
  avgSavingsPercent: number;
  primaryVendor: string;
  riskStatus: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface VendorScorecardItem {
  vendorId: string;
  vendorCode: string;
  vendorName: string;
  country: string;
  rfqsSubmitted: number;
  awardedCount: number;
  winRatePercent: number;
  fatPassRatePercent: number;
  onTimeDeliveryRatePercent: number;
  totalContractValueUsd: number;
  overallScore: number;
  ratingTier: 'TIER_1_STRATEGIC' | 'TIER_2_PREFERRED' | 'TIER_3_QUALIFIED';
}

export interface DepartmentWorkloadItem {
  departmentCode: string;
  departmentName: string;
  tasksTotal: number;
  tasksCompleted: number;
  onTimePercent: number;
  avgResponseHours: number;
  clarificationRatePercent: number;
}

class AnalyticsService {
  async getGoalTargets(): Promise<BiGoalTarget> {
    try {
      const data = await apiClient.get<any>('/analytics/goals');
      return {
        biddingRevenueTargetVnd: Number(data.biddingRevenueTargetVnd || 0),
        biddingRevenueActualVnd: Number(data.biddingRevenueActualVnd || 0),
        biddingRevenueProgressPercent: Number(data.biddingRevenueProgressPercent || 0),
        winRateTarget: Number(data.winRateTarget || 0),
        winRateActual: Number(data.winRateActual || 0),
        winRateDiffPercent: Number(data.winRateDiffPercent || 0),
        sourcingSavingsTargetVnd: Number(data.sourcingSavingsTargetVnd || 0),
        sourcingSavingsActualVnd: Number(data.sourcingSavingsActualVnd || 0),
        sourcingSavingsProgressPercent: Number(data.sourcingSavingsProgressPercent || 0),
        tenderCycleTargetDays: Number(data.tenderCycleTargetDays || 0),
        tenderCycleActualDays: Number(data.tenderCycleActualDays || 0),
      };
    } catch {
      return {
        biddingRevenueTargetVnd: 0,
        biddingRevenueActualVnd: 0,
        biddingRevenueProgressPercent: 0,
        winRateTarget: 0,
        winRateActual: 0,
        winRateDiffPercent: 0,
        sourcingSavingsTargetVnd: 0,
        sourcingSavingsActualVnd: 0,
        sourcingSavingsProgressPercent: 0,
        tenderCycleTargetDays: 0,
        tenderCycleActualDays: 0,
      };
    }
  }

  async getQuarterlyTrends(): Promise<QuarterlyWinTrend[]> {
    try {
      const list = await apiClient.get<any[]>('/analytics/trends');
      return (list || []).map((t) => ({
        quarter: t.quarter,
        submittedCount: t.submittedCount,
        wonCount: t.wonCount,
        winRatePercent: Number(t.winRatePercent || 0),
        revenueWonVnd: Number(t.revenueWonVnd || 0),
      }));
    } catch {
      return [];
    }
  }

  async getSectorShares(): Promise<IndustrySectorShare[]> {
    try {
      const list = await apiClient.get<any[]>('/analytics/sectors');
      return (list || []).map((s) => ({
        sectorCode: s.sectorCode,
        sectorName: s.sectorName,
        tenderCount: s.count,
        totalValueVnd: Number(s.totalValueVnd || 0),
        sharePercent: Number(s.percentage || 0),
      }));
    } catch {
      return [];
    }
  }

  async getItemizedTenders(params?: {
    tenderType?: string;
    sector?: string;
    quarter?: string;
  }): Promise<ItemizedTenderPerformance[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.tenderType && params.tenderType !== 'ALL') searchParams.append('tenderType', params.tenderType);
      if (params?.sector && params.sector !== 'ALL') searchParams.append('sector', params.sector);
      if (params?.quarter && params.quarter !== 'ALL') searchParams.append('quarter', params.quarter);
      const url = searchParams.toString() ? `/analytics/tenders?${searchParams.toString()}` : '/analytics/tenders';
      const list = await apiClient.get<any[]>(url);

      return (list || []).map((item) => {
        let sector: 'POWER' | 'OIL_GAS' | 'TELECOM' | 'EXPORT_OVERSEAS' = 'POWER';
        if (item.industrySector === 'OIL_GAS') sector = 'OIL_GAS';
        else if (item.industrySector === 'TELECOM_DC' || item.industrySector === 'TELECOM') sector = 'TELECOM';
        else if (item.industrySector === 'EXPORT_OVERSEAS') sector = 'EXPORT_OVERSEAS';

        return {
          id: item.id,
          projectCode: item.projectCode,
          projectName: item.projectName,
          investorName: item.investorName,
          tenderType: (item.tenderType as TenderType) || TenderType.TENANT_PARTICIPATING,
          industrySector: sector,
          budgetVnd: Number(item.budgetVnd || 0),
          finalPriceVnd: Number(item.bidAwardValueVnd || 0),
          savingsOrMarginPercent: Number(item.savingsPercent || 0),
          biddingStatus: (item.status as any) || 'WON',
          cycleDays: Number(item.cycleDays || 0),
          completionQuarter: item.completionQuarter || '',
          primaryVendorOrPartner: item.winningVendor || '',
        };
      });
    } catch {
      return [];
    }
  }

  async getCategorySpend(): Promise<CategorySpendAnalytics[]> {
    try {
      const list = await apiClient.get<any[]>('/analytics/category-spend');
      return (list || []).map((c) => ({
        categoryCode: c.categoryCode,
        categoryName: c.categoryName,
        totalSpendVnd: Number(c.totalSpendVnd || 0),
        rfqCount: c.rfqCount,
        participatingVendorsCount: c.participatingVendorsCount,
        avgSavingsPercent: Number(c.avgSavingsPercent || 0),
        primaryVendor: c.primaryVendor,
        riskStatus: c.riskStatus,
      }));
    } catch {
      return [];
    }
  }

  async getVendorScorecards(): Promise<VendorScorecardItem[]> {
    try {
      const list = await apiClient.get<any[]>('/analytics/vendors');
      return (list || []).map((v) => ({
        vendorId: v.vendorId,
        vendorCode: v.vendorCode,
        vendorName: v.vendorName,
        country: v.country,
        rfqsSubmitted: v.rfqsSubmitted,
        awardedCount: v.awardedCount,
        winRatePercent: Number(v.winRatePercent || 0),
        fatPassRatePercent: Number(v.fatPassRatePercent || 0),
        onTimeDeliveryRatePercent: Number(v.onTimeDeliveryRatePercent || 0),
        totalContractValueUsd: Number(v.totalContractValueUsd || 0),
        overallScore: Number(v.overallScore || 0),
        ratingTier: v.ratingTier,
      }));
    } catch {
      return [];
    }
  }

  async getDepartmentWorkload(): Promise<DepartmentWorkloadItem[]> {
    try {
      const list = await apiClient.get<any[]>('/analytics/workload');
      return (list || []).map((d) => ({
        departmentCode: d.departmentCode,
        departmentName: d.departmentName,
        tasksTotal: d.tasksTotal,
        tasksCompleted: d.tasksCompleted,
        onTimePercent: Number(d.onTimePercent || 0),
        avgResponseHours: Number(d.avgResponseHours || 0),
        clarificationRatePercent: Number(d.clarificationRatePercent || 0),
      }));
    } catch {
      return [];
    }
  }
}

export const analyticsService = new AnalyticsService();
