'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../shared/i18n';
import { DataTable, Column } from '../../shared/components/DataTable';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Award,
  ArrowUpRight,
  Clock,
  Users,
  Target,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Building,
  Building2,
  Calendar,
  Briefcase,
  PieChart,
  ShieldCheck,
  ChevronRight,
  X,
  ExternalLink,
  Percent,
} from 'lucide-react';
import {
  analyticsService,
  BiGoalTarget,
  CategorySpendAnalytics,
  DepartmentWorkloadItem,
  IndustrySectorShare,
  ItemizedTenderPerformance,
  QuarterlyWinTrend,
  VendorScorecardItem,
} from '../../services/analyticsService';
import { TenderType } from '../../shared/types';

export function BiAnalyticsPage() {
  const { t } = useTranslation();

  // Data states
  const [goalTarget, setGoalTarget] = useState<BiGoalTarget | null>(null);
  const [trends, setTrends] = useState<QuarterlyWinTrend[]>([]);
  const [sectorShares, setSectorShares] = useState<IndustrySectorShare[]>([]);
  const [itemizedTenders, setItemizedTenders] = useState<ItemizedTenderPerformance[]>([]);
  const [categorySpends, setCategorySpends] = useState<CategorySpendAnalytics[]>([]);
  const [vendorScorecards, setVendorScorecards] = useState<VendorScorecardItem[]>([]);
  const [deptWorkloads, setDeptWorkloads] = useState<DepartmentWorkloadItem[]>([]);

  // Filter states
  const [selectedQuarter, setSelectedQuarter] = useState<string>('ALL');
  const [selectedTenderType, setSelectedTenderType] = useState<string>('ALL');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TENDERS' | 'SPEND' | 'VENDORS'>('OVERVIEW');

  // Modal Detail State
  const [viewingTender, setViewingTender] = useState<ItemizedTenderPerformance | null>(null);
  const [showExportToast, setShowExportToast] = useState(false);

  useEffect(() => {
    Promise.all([
      analyticsService.getGoalTargets(),
      analyticsService.getQuarterlyTrends(),
      analyticsService.getSectorShares(),
      analyticsService.getItemizedTenders(),
      analyticsService.getCategorySpend(),
      analyticsService.getVendorScorecards(),
      analyticsService.getDepartmentWorkload(),
    ]).then(([targets, trendsData, sectorsData, tendersData, spendData, vendorsData, deptsData]) => {
      setGoalTarget(targets);
      setTrends(trendsData);
      setSectorShares(sectorsData);
      setItemizedTenders(tendersData);
      setCategorySpends(spendData);
      setVendorScorecards(vendorsData);
      setDeptWorkloads(deptsData);
    });
  }, []);

  // Filtered Itemized Tenders
  const filteredTenders = useMemo(() => {
    return itemizedTenders.filter((item) => {
      if (selectedTenderType !== 'ALL' && item.tenderType !== selectedTenderType) {
        return false;
      }
      if (selectedSector !== 'ALL' && item.industrySector !== selectedSector) {
        return false;
      }
      if (selectedQuarter !== 'ALL' && !item.completionQuarter.includes(selectedQuarter)) {
        return false;
      }
      return true;
    });
  }, [itemizedTenders, selectedTenderType, selectedSector, selectedQuarter]);

  // Handle Export Report
  const handleExportReport = () => {
    setShowExportToast(true);
    setTimeout(() => setShowExportToast(false), 3500);
  };

  // Columns for Itemized Tenders Table
  const tenderColumns: Column<ItemizedTenderPerformance>[] = [
    {
      key: 'projectCode',
      header: 'Mã & Tên Gói Thầu',
      width: '320px',
      render: (item) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border shadow-2xs ${
                item.tenderType === TenderType.TENANT_PARTICIPATING
                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300'
              }`}
            >
              {item.tenderType === TenderType.TENANT_PARTICIPATING ? 'Đi Dự Thầu' : 'Mua Sắm Sourcing'}
            </span>
            <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
              {item.projectCode}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setViewingTender(item)}
            className="text-xs font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 text-left line-clamp-2 transition-colors cursor-pointer"
          >
            {item.projectName}
          </button>
          <div className="text-[11px] text-slate-500">Chủ đầu tư: {item.investorName}</div>
        </div>
      ),
    },
    {
      key: 'budgetVnd',
      header: 'Ngân Sách & Giá Cuối (VND)',
      width: '230px',
      render: (item) => (
        <div className="space-y-1 font-mono">
          <div className="text-xs text-slate-500">
            Dự toán: <strong>{(item.budgetVnd / 1000000000).toFixed(2)} Tỷ</strong>
          </div>
          <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
            Trúng thầu: {(item.finalPriceVnd / 1000000000).toFixed(2)} Tỷ
          </div>
          <div className="text-[11px] text-emerald-600 font-sans font-semibold">
            Tiết kiệm: {item.savingsOrMarginPercent}% (
            {(((item.budgetVnd - item.finalPriceVnd) / 1000000000)).toFixed(2)} Tỷ)
          </div>
        </div>
      ),
    },
    {
      key: 'primaryVendorOrPartner',
      header: 'Đối Tác / Nhà Cung Cấp',
      width: '220px',
      render: (item) => (
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {item.primaryVendorOrPartner}
          </div>
          <div className="text-[11px] text-slate-400">Quý hoàn thành: {item.completionQuarter}</div>
        </div>
      ),
    },
    {
      key: 'biddingStatus',
      header: 'Kết Quả & Chu Kỳ',
      width: '180px',
      align: 'center',
      render: (item) => {
        const isWon = item.biddingStatus === 'WON' || item.biddingStatus === 'SOURCING_COMPLETED';
        return (
          <div className="space-y-1">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                isWon
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
              }`}
            >
              {isWon ? '✓ Trúng Thầu / Đạt' : '⏳ Đang Xét Thầu'}
            </span>
            <div className="text-[11px] font-mono text-slate-500">Chu kỳ: {item.cycleDays} ngày</div>
          </div>
        );
      },
    },
  ];

  // Columns for Category Spend Table
  const spendColumns: Column<CategorySpendAnalytics>[] = [
    {
      key: 'categoryName',
      header: 'Danh Mục Thiết Bị BoQ',
      width: '320px',
      render: (item) => (
        <div className="space-y-1">
          <span className="font-mono text-[10px] font-bold text-slate-500">{item.categoryCode}</span>
          <div className="text-xs font-bold text-slate-900 dark:text-white">{item.categoryName}</div>
          <div className="text-[11px] text-slate-500">Đối tác cung ứng chính: {item.primaryVendor}</div>
        </div>
      ),
    },
    {
      key: 'totalSpendVnd',
      header: 'Tổng Chi Phí Mua Sắm (VND)',
      width: '220px',
      render: (item) => (
        <div className="space-y-0.5 font-mono">
          <div className="text-sm font-black text-slate-900 dark:text-white">
            {(item.totalSpendVnd / 1000000000).toFixed(1)} Tỷ VND
          </div>
          <div className="text-[11px] text-slate-400 font-sans">
            Đã phát hành {item.rfqCount} gói RFQ
          </div>
        </div>
      ),
    },
    {
      key: 'participatingVendorsCount',
      header: 'Vendor Tham Gia',
      width: '160px',
      align: 'center',
      render: (item) => (
        <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
          {item.participatingVendorsCount} Nhà Cung Cấp
        </div>
      ),
    },
    {
      key: 'avgSavingsPercent',
      header: 'Mức Tiết Kiệm Sourcing',
      width: '180px',
      render: (item) => (
        <div className="space-y-1">
          <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
            Giảm {item.avgSavingsPercent}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{ width: `${item.avgSavingsPercent * 8}%` }}
            />
          </div>
        </div>
      ),
    },
  ];

  // Columns for Vendor Scorecard Table
  const vendorColumns: Column<VendorScorecardItem>[] = [
    {
      key: 'vendorName',
      header: 'Nhà Cung Cấp & Quốc Gia',
      width: '300px',
      render: (item) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              {item.vendorCode}
            </span>
            <span className="text-[10px] font-semibold text-slate-500">{item.country}</span>
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">{item.vendorName}</div>
        </div>
      ),
    },
    {
      key: 'rfqsSubmitted',
      header: 'Tỷ Lệ Trúng Thầu Sourcing',
      width: '200px',
      render: (item) => (
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold">
            <span>{item.awardedCount}/{item.rfqsSubmitted} gói</span>
            <span className="font-bold text-blue-600">{item.winRatePercent}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${item.winRatePercent}%` }} />
          </div>
        </div>
      ),
    },
    {
      key: 'fatPassRatePercent',
      header: 'Chất Lượng & Giao Hàng',
      width: '200px',
      render: (item) => (
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Đạt FAT xưởng:</span>
            <span className="font-bold text-emerald-600">{item.fatPassRatePercent}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Đúng hạn giao:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {item.onTimeDeliveryRatePercent}%
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'overallScore',
      header: 'Điểm Scorecard & Hạng',
      width: '190px',
      align: 'center',
      render: (item) => (
        <div className="space-y-1">
          <div className="text-base font-black text-slate-900 dark:text-white font-mono">
            {item.overallScore} <span className="text-[10px] text-slate-400 font-sans">/ 100</span>
          </div>
          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {item.ratingTier === 'TIER_1_STRATEGIC' ? '⭐ Tier 1 Chiến Lược' : 'Tier 2 Ưu Tiên'}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Alert for Export */}
      {showExportToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{t.analytics.exportSuccess}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{t.analytics.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.analytics.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>{t.analytics.exportReportBtn}</span>
          </button>
        </div>
      </div>

      {/* Multidimensional Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Lọc Khung Thời Gian */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                <Calendar className="w-3.5 h-3.5 inline mr-1 text-blue-600" />
                {t.analytics.filterTimeLabel}
              </label>
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
                className="px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white shadow-2xs hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">📅 Năm 2026 (Toàn Bộ YTD)</option>
                <option value="Q3/2026">Quý 3/2026</option>
                <option value="Q2/2026">Quý 2/2026</option>
                <option value="Q1/2026">Quý 1/2026</option>
                <option value="2025">Năm 2025</option>
              </select>
            </div>

            {/* Lọc Phân Hệ Nghiệp Vụ */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                <Briefcase className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
                {t.analytics.filterTenderTypeLabel}
              </label>
              <select
                value={selectedTenderType}
                onChange={(e) => setSelectedTenderType(e.target.value)}
                className="px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white shadow-2xs hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">{t.analytics.allTenderTypes}</option>
                <option value={TenderType.TENANT_PARTICIPATING}>Đi Dự Thầu (Dự Thầu Bên Ngoài)</option>
                <option value={TenderType.TENANT_ISSUED}>Mua Sắm & Sourcing (Mở RFQ Nội Bộ)</option>
              </select>
            </div>

            {/* Lọc Lĩnh Vực / Ngành */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                <Building className="w-3.5 h-3.5 inline mr-1 text-purple-600" />
                {t.analytics.filterSectorLabel}
              </label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white shadow-2xs hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">{t.analytics.allSectors}</option>
                <option value="POWER">Điện Lực & Năng Lượng (EVN/NPT)</option>
                <option value="OIL_GAS">Dầu Khí & Hóa Chất (PVN)</option>
                <option value="TELECOM">Viễn Thông & CNTT (Viettel)</option>
                <option value="EXPORT_OVERSEAS">Ngoại Thương Quốc Tế (Lào/Đông Nam Á)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end lg:self-center">
            <span className="text-xs text-slate-500">
              Đang hiển thị <strong>{filteredTenders.length}</strong> gói thầu phù hợp
            </span>
          </div>
        </div>
      </div>

      {/* Strategic Goal Board: 4 KPI Cards With Target vs Actual Progress */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-600" />
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {t.analytics.targetTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Goal 1: Doanh Số Trúng Thầu */}
          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>{t.analytics.targetBiddingRevenue}</span>
              <div className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {goalTarget ? `${(goalTarget.biddingRevenueActualVnd / 1000000000).toFixed(0)} Tỷ` : '186 Tỷ'}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                <span>{t.analytics.targetLabel} 200 Tỷ VND</span>
                <span className="font-bold text-blue-600">
                  {goalTarget ? `${goalTarget.biddingRevenueProgressPercent}%` : '93%'} {t.analytics.achievedLabel}
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${goalTarget?.biddingRevenueProgressPercent || 93}%` }}
              />
            </div>
          </div>

          {/* Goal 2: Tỷ Lệ Thắng Thầu */}
          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>{t.analytics.targetWinRate}</span>
              <div className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600 font-mono">
                {goalTarget ? `${goalTarget.winRateActual}%` : '78.5%'}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                <span>{t.analytics.targetLabel} 75.0%</span>
                <span className="font-bold text-emerald-600">
                  +{goalTarget?.winRateDiffPercent || 3.5}% {t.analytics.exceededLabel}
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full"
                style={{ width: `${((goalTarget?.winRateActual || 78.5) / 100) * 100}%` }}
              />
            </div>
          </div>

          {/* Goal 3: Tiết Kiệm Chi Phí Sourcing */}
          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>{t.analytics.targetSourcingSavings}</span>
              <div className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-purple-600 font-mono">
                {goalTarget ? `${(goalTarget.sourcingSavingsActualVnd / 1000000000).toFixed(1)} Tỷ` : '14.8 Tỷ'}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                <span>{t.analytics.targetLabel} 15.0 Tỷ VND</span>
                <span className="font-bold text-purple-600">
                  {goalTarget ? `${goalTarget.sourcingSavingsProgressPercent}%` : '98.6%'}
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${goalTarget?.sourcingSavingsProgressPercent || 98.6}%` }}
              />
            </div>
          </div>

          {/* Goal 4: Chu Kỳ Hoàn Thành Gói Thầu */}
          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>{t.analytics.targetCycleDays}</span>
              <div className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-amber-600 font-mono">
                {goalTarget ? `${goalTarget.tenderCycleActualDays} Ngày` : '28 Ngày'}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                <span>{t.analytics.targetLabel} &lt; 30 Ngày</span>
                <span className="font-bold text-emerald-600">Rút ngắn 2 ngày</span>
              </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: '92%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main 4 Perspective Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'OVERVIEW'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>{t.analytics.tabOverview}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TENDERS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'TENDERS'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>{t.analytics.tabItemizedTenders}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            {filteredTenders.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SPEND')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'SPEND'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>{t.analytics.tabCategorySpend}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('VENDORS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'VENDORS'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>{t.analytics.tabVendorScorecard}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
            {vendorScorecards.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Báo Cáo Tổng Hợp & Xu Hướng */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quarterly Trend Chart */}
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  {t.analytics.trendChart}
                </h3>
              </div>

              <div className="space-y-3 pt-2">
                {trends.map((item) => (
                  <div key={item.quarter} className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{item.quarter}</span>
                      <span className="font-mono text-blue-600 dark:text-blue-400">
                        {item.wonCount}/{item.submittedCount} {t.analytics.wonPackagesSub} (
                        <strong>{item.winRatePercent}%</strong>) • {(item.revenueWonVnd / 1000000000).toFixed(1)} Tỷ
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${item.winRatePercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Industry Sector Shares */}
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-purple-600" />
                {t.analytics.sectorShareTitle}
              </h3>

              <div className="space-y-3 pt-2">
                {sectorShares.map((sector) => (
                  <div key={sector.sectorCode} className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-800 dark:text-slate-200">{sector.sectorName}</span>
                      <span className="font-mono font-bold text-purple-600">
                        {(sector.totalValueVnd / 1000000000).toFixed(1)} Tỷ ({sector.sharePercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${sector.sharePercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Department Workload & SLA Breakdown */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              {t.analytics.deptWorkloadTitle}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {deptWorkloads.map((dept) => (
                <div
                  key={dept.departmentCode}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2"
                >
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {dept.departmentName}
                  </p>
                  <div className="space-y-1 text-xs text-slate-500">
                    <div className="flex justify-between">
                      <span>Nhiệm vụ:</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {dept.tasksCompleted}/{dept.tasksTotal}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>SLA Phản hồi:</span>
                      <strong className="text-blue-600">{dept.avgResponseHours} giờ</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Đúng hạn:</span>
                      <strong className="text-emerald-600 font-bold">{dept.onTimePercent}%</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Chi Tiết Từng Gói Thầu */}
      {activeTab === 'TENDERS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {t.analytics.itemizedTenderTitle} ({filteredTenders.length} Gói Thầu)
            </h3>
          </div>
          <DataTable<ItemizedTenderPerformance>
            columns={tenderColumns}
            data={filteredTenders}
            renderActions={(item) => (
              <button
                type="button"
                onClick={() => setViewingTender(item)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Xem Chi Tiết Phân Tích Gói Thầu"
              >
                <ExternalLink className="w-4 h-4 text-blue-600" />
              </button>
            )}
          />
        </div>
      )}

      {/* Tab 3: Phân Tích Mua Sắm & Thiết Bị BoQ */}
      {activeTab === 'SPEND' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {t.analytics.categorySpendTitle} (5 Danh Mục Thiết Bị Cốt Lõi)
            </h3>
          </div>
          <DataTable<CategorySpendAnalytics> columns={spendColumns} data={categorySpends} />
        </div>
      )}

      {/* Tab 4: Đánh Giá & Xếp Hạng Nhà Cung Cấp */}
      {activeTab === 'VENDORS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {t.analytics.vendorScorecardTitle} (6 Nhà Cung Cấp Quốc Tế)
            </h3>
          </div>
          <DataTable<VendorScorecardItem> columns={vendorColumns} data={vendorScorecards} />
        </div>
      )}

      {/* Modal Chi Tiết Phân Tích Gói Thầu */}
      {viewingTender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                    {viewingTender.projectCode}
                  </span>
                  <span className="text-xs font-bold text-emerald-600">
                    {viewingTender.biddingStatus === 'WON' ? '✓ Trúng Thầu' : 'Đang Triển Khai'}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {viewingTender.projectName}
                </h3>
                <p className="text-xs text-slate-500">Chủ đầu tư: {viewingTender.investorName}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewingTender(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block">Dự Toán / Ngân Sách:</span>
                <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                  {(viewingTender.budgetVnd / 1000000000).toFixed(2)} Tỷ VND
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Giá Trúng Thầu / Chào:</span>
                <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                  {(viewingTender.finalPriceVnd / 1000000000).toFixed(2)} Tỷ VND
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Tiết Kiệm / Margin:</span>
                <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {viewingTender.savingsOrMarginPercent}% (
                  {(((viewingTender.budgetVnd - viewingTender.finalPriceVnd) / 1000000000)).toFixed(2)} Tỷ)
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950">
                <span className="text-slate-500">Nhà cung cấp / Đối tác chính:</span>
                <strong className="text-slate-900 dark:text-white">{viewingTender.primaryVendorOrPartner}</strong>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950">
                <span className="text-slate-500">Chu kỳ xử lý hoàn thành:</span>
                <strong className="text-slate-900 dark:text-white">{viewingTender.cycleDays} ngày</strong>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950">
                <span className="text-slate-500">Quý hoàn thành & ghi nhận doanh số:</span>
                <strong className="text-blue-600">{viewingTender.completionQuarter}</strong>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setViewingTender(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
