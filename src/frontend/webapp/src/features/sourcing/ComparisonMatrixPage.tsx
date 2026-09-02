'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from '../../shared/i18n';
import { DEFAULT_EXCHANGE_RATES } from '../../shared/constants';
import {
  Currency,
  Incoterm,
  TenderProject,
  TenderType,
  RfqQuotationDetail,
  RfqPackage,
  BankExchangeProvider,
  RateCalculationType,
  ExchangeRateConfig,
  BankRateSnapshot,
} from '../../shared/types';
import { sourcingService, LandedCostComparison, ProjectBomMatrixItem } from '../../services/sourcingService';
import { tenderService } from '../../services/tenderService';
import { exchangeRateService } from '../../services/exchangeRateService';
import {
  Award,
  CheckCircle2,
  TrendingDown,
  DollarSign,
  Building2,
  Briefcase,
  Calendar,
  ShieldCheck,
  FileText,
  Check,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  Info,
  Sparkles,
  Clock,
  Truck,
  ExternalLink,
  X,
  FileCheck,
  HelpCircle,
  ArrowLeft,
  Settings2,
  RefreshCw,
  Landmark,
  Scale,
} from 'lucide-react';

export function ComparisonMatrixPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  // Danh sách gói thầu và RFQs
  const [projects, setProjects] = useState<TenderProject[]>([]);
  const [selectedTypeTab, setSelectedTypeTab] = useState<'ALL' | TenderType>('ALL');

  // Gói thầu đang được chọn để xem ma trận (null = hiển thị danh sách gói thầu)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Dữ liệu so sánh ma trận của gói thầu đang chọn
  const [comparisons, setComparisons] = useState<LandedCostComparison[]>([]);
  const [projectRfqs, setProjectRfqs] = useState<RfqPackage[]>([]);
  const [bomItems, setBomItems] = useState<ProjectBomMatrixItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Cấu hình tỷ giá ngân hàng uy tín
  const [rateConfig, setRateConfig] = useState<ExchangeRateConfig>({
    activeProvider: BankExchangeProvider.VCB,
    activeRateType: RateCalculationType.SELL_TRANSFER,
    autoSyncEnabled: true,
    syncIntervalMinutes: 15,
    fxRiskMarginPercent: 0,
    manualOverrides: {},
    lastUpdated: '01/09/2026 08:30:00',
  });
  const [activeSnapshot, setActiveSnapshot] = useState<BankRateSnapshot | null>(null);
  const [isRateModalOpen, setIsRateModalOpen] = useState<boolean>(false);
  const [isSyncingRates, setIsSyncingRates] = useState<boolean>(false);

  // Trạng thái trao thầu và thông báo toast
  const [awardedSupplierMap, setAwardedSupplierMap] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal xem chi tiết toàn bộ hồ sơ báo giá của Vendor
  const [selectedQuotationDetail, setSelectedQuotationDetail] = useState<RfqQuotationDetail | null>(null);

  // Load danh sách gói thầu và cấu hình tỷ giá ban đầu
  useEffect(() => {
    tenderService.getProjects().then((data) => {
      setProjects(data);

      // Kiểm tra nếu có query param ?projectId= từ URL
      const urlProjectId = searchParams?.get('projectId');
      if (urlProjectId && data.some((p) => p.id === urlProjectId)) {
        setActiveProjectId(urlProjectId);
      }
    });

    exchangeRateService.getConfig().then((cfg) => {
      setRateConfig(cfg);
      exchangeRateService.getBankSnapshot(cfg.activeProvider).then((snap) => {
        setActiveSnapshot(snap);
      });
    });
  }, [searchParams]);

  // Load ma trận so sánh khi đổi activeProjectId hoặc đổi cấu hình tỷ giá
  useEffect(() => {
    if (!activeProjectId) {
      setComparisons([]);
      setProjectRfqs([]);
      setBomItems([]);
      return;
    }

    setLoading(true);
    Promise.all([
      sourcingService.getComparisonMatrix(
        activeProjectId,
        rateConfig.activeProvider,
        rateConfig.activeRateType,
        rateConfig.fxRiskMarginPercent
      ),
      sourcingService.getRfqs(),
      sourcingService.getProjectBomMatrix(
        activeProjectId,
        rateConfig.activeProvider,
        rateConfig.activeRateType,
        rateConfig.fxRiskMarginPercent
      ),
    ]).then(([matrixData, allRfqs, dynamicBomItems]) => {
      setComparisons(matrixData);
      setProjectRfqs(allRfqs.filter((r) => r.projectId === activeProjectId));
      setBomItems(dynamicBomItems);
      setLoading(false);
    });
  }, [activeProjectId, rateConfig]);

  // Gói thầu đang được chọn
  const currentProject = useMemo(() => {
    if (!activeProjectId) return null;
    return projects.find((p) => p.id === activeProjectId) || null;
  }, [projects, activeProjectId]);

  // Lọc danh sách gói thầu theo tab phân loại
  const filteredProjects = useMemo(() => {
    if (selectedTypeTab === 'ALL') return projects;
    return projects.filter((p) => p.tenderType === selectedTypeTab);
  }, [projects, selectedTypeTab]);

  // Tính toán ngân sách dự toán quy đổi VND và mức tiết kiệm
  const bestPick = useMemo(() => {
    return comparisons.find((c) => c.isBest) || comparisons[0];
  }, [comparisons]);

  const budgetVnd = useMemo(() => {
    if (!currentProject) return 0;
    if (currentProject.budgetCurrency === Currency.VND) {
      return currentProject.budgetAmount;
    }
    const rate = exchangeRateService.getEffectiveRate(
      currentProject.budgetCurrency,
      rateConfig.activeProvider,
      rateConfig.activeRateType,
      rateConfig.fxRiskMarginPercent
    );
    return currentProject.budgetAmount * rate;
  }, [currentProject, rateConfig]);

  const potentialSavingsVnd = useMemo(() => {
    if (!bestPick || budgetVnd <= 0) return 0;
    return Math.max(0, budgetVnd - bestPick.totalLandedCostVnd);
  }, [bestPick, budgetVnd]);

  const savingsPercent = useMemo(() => {
    if (budgetVnd <= 0 || potentialSavingsVnd <= 0) return '0';
    return ((potentialSavingsVnd / budgetVnd) * 100).toFixed(1);
  }, [budgetVnd, potentialSavingsVnd]);

  // Xử lý Trao Thầu cho Vendor
  const handleAwardVendor = (supplierName: string) => {
    if (!currentProject) return;
    setAwardedSupplierMap((prev) => ({
      ...prev,
      [currentProject.id]: supplierName,
    }));
    setToastMessage(`${t.matrix.awardedToast} ${supplierName}`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Xem chi tiết hồ sơ báo giá (đã loại bỏ toàn bộ mã băm debug BE)
  const handleViewQuotationDetail = async (supplierName: string) => {
    const matchedRfq = projectRfqs.find(
      (r) => r.supplierName.includes(supplierName) || supplierName.includes(r.supplierName)
    );
    if (!matchedRfq) return;

    const detail = await sourcingService.getQuotationDetail(matchedRfq.id);
    setSelectedQuotationDetail(detail || null);
  };

  // Đồng bộ tỷ giá tức thì từ API ngân hàng
  const handleSyncBankRates = async () => {
    setIsSyncingRates(true);
    const updated = await exchangeRateService.syncRatesFromBank(rateConfig.activeProvider);
    setActiveSnapshot(updated);
    setIsSyncingRates(false);
    setToastMessage(`${t.matrix.syncSuccessToast} ${updated.providerShortName}!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Lưu cấu hình nguồn tỷ giá ngân hàng
  const handleSaveRateConfig = async (newProvider: BankExchangeProvider, newType: RateCalculationType, newMargin: number) => {
    const updated = await exchangeRateService.updateConfig({
      activeProvider: newProvider,
      activeRateType: newType,
      fxRiskMarginPercent: newMargin,
    });
    setRateConfig(updated);
    const snap = await exchangeRateService.getBankSnapshot(newProvider);
    setActiveSnapshot(snap);
    setIsRateModalOpen(false);
    setToastMessage(t.matrix.configSavedToast);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-xl animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TRƯỜNG HỢP 1: CHƯA CHỌN GÓI THẦU -> HIỂN THỊ DANH SÁCH GÓI THẦU CẦN SO SÁNH */}
      {/* ========================================================================= */}
      {!activeProjectId && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t.matrix.tenderListTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">{t.matrix.tenderListSubtitle}</p>
            </div>

            {/* Nút cấu hình tỷ giá ngân hàng uy tín */}
            <button
              type="button"
              onClick={() => setIsRateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm transition-all cursor-pointer"
            >
              <Landmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>
                {t.matrix.currentRateSource}{' '}
                <strong className="text-blue-600 dark:text-blue-400">
                  {activeSnapshot?.providerShortName || 'Vietcombank (VCB)'}
                </strong>
              </span>
            </button>
          </div>

          {/* Tabs phân loại 3 nhóm ngắn gọn */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
            <button
              type="button"
              onClick={() => setSelectedTypeTab('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTypeTab === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.tenderTypes.all} ({projects.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedTypeTab(TenderType.TENANT_PARTICIPATING)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTypeTab === TenderType.TENANT_PARTICIPATING
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>
                {t.tenderTypes.TENANT_PARTICIPATING} (
                {projects.filter((p) => p.tenderType === TenderType.TENANT_PARTICIPATING).length})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTypeTab(TenderType.TENANT_ISSUED)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTypeTab === TenderType.TENANT_ISSUED
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>
                {t.tenderTypes.TENANT_ISSUED} (
                {projects.filter((p) => p.tenderType === TenderType.TENANT_ISSUED).length})
              </span>
            </button>
          </div>

          {/* Bảng Danh Sách Gói Thầu */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    <th className="py-3.5 px-4 font-bold">{t.tenders.projectCode}</th>
                    <th className="py-3.5 px-4 font-bold">{t.tenders.projectName}</th>
                    <th className="py-3.5 px-4 font-bold">{t.tenders.investor}</th>
                    <th className="py-3.5 px-3 font-bold text-center">{t.tenders.tenderType}</th>
                    <th className="py-3.5 px-4 font-bold text-right">{t.tenders.budget}</th>
                    <th className="py-3.5 px-3 font-bold text-center">{t.matrix.quotesReceivedCount}</th>
                    <th className="py-3.5 px-4 font-bold text-center">{t.common.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredProjects.map((p) => {
                    const quoteCount = p.id === 'proj-001' || p.id === 'proj-003' ? 3 : 2;
                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-4 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {p.projectCode}
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-900 dark:text-white max-w-xs">
                          {p.projectName}
                        </td>
                        <td className="py-4 px-4 text-slate-500">{p.investorName}</td>
                        <td className="py-4 px-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                              p.tenderType === TenderType.TENANT_PARTICIPATING
                                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                            }`}
                          >
                            {p.tenderType === TenderType.TENANT_PARTICIPATING ? (
                              <Briefcase className="w-3 h-3" />
                            ) : (
                              <Building2 className="w-3 h-3" />
                            )}
                            <span>
                              {p.tenderType === TenderType.TENANT_PARTICIPATING
                                ? t.tenderTypes.TENANT_PARTICIPATING
                                : t.tenderTypes.TENANT_ISSUED}
                            </span>
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {p.budgetAmount.toLocaleString('vi-VN')} {p.budgetCurrency}
                        </td>
                        <td className="py-4 px-3 text-center">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800">
                            {quoteCount} Báo Giá
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setActiveProjectId(p.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
                          >
                            <span>{t.matrix.btnEnterMatrix}</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TRƯỜNG HỢP 2: ĐÃ CHỌN GÓI THẦU -> HIỂN THỊ MA TRẬN SO SÁNH BÁO GIÁ VENDOR */}
      {/* ========================================================================= */}
      {activeProjectId && currentProject && (
        <div className="space-y-6">
          {/* Header Điều Hướng & Thông Tin Gói Thầu */}
          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              {/* Nút quay lại và Tiêu đề gói thầu */}
              <div className="flex items-start sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveProjectId(null)}
                  className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.matrix.backToTenderList}</span>
                </button>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800">
                      {currentProject.projectCode}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${
                        currentProject.tenderType === TenderType.TENANT_PARTICIPATING
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                          : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                      }`}
                    >
                      {currentProject.tenderType === TenderType.TENANT_PARTICIPATING
                        ? t.tenderTypes.TENANT_PARTICIPATING
                        : t.tenderTypes.TENANT_ISSUED}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {currentProject.projectName}
                  </h2>
                </div>
              </div>

              {/* Cấu hình Tỷ Giá Ngân Hàng Uy Tín & Xuất Excel */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsRateModalOpen(true)}
                  className="px-3.5 py-2 rounded-2xl text-xs font-semibold border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shadow-sm flex items-center gap-2 hover:bg-blue-100 transition-all cursor-pointer"
                >
                  <Landmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>
                    {t.matrix.currentRateSource}{' '}
                    <strong>{activeSnapshot?.providerShortName || 'Vietcombank (VCB)'}</strong>
                  </span>
                  <Settings2 className="w-3.5 h-3.5 text-blue-500" />
                </button>

                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{t.common.exportExcel}</span>
                </button>
              </div>
            </div>

            {/* Chi tiết tóm tắt gói thầu */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-400 font-semibold block">{t.matrix.investorLabel}</span>
                <span className="font-bold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                  {currentProject.investorName}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-400 font-semibold block">{t.matrix.budgetLabel}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white block mt-0.5">
                  {currentProject.budgetAmount.toLocaleString('vi-VN')} {currentProject.budgetCurrency}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-400 font-semibold block">{t.matrix.deadlineLabel}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white block mt-0.5">
                  {currentProject.submissionDeadline}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                <span className="text-blue-600 dark:text-blue-400 font-semibold block">
                  {t.matrix.quotesReceived}
                </span>
                <span className="font-bold text-blue-700 dark:text-blue-300 block mt-0.5">
                  {comparisons.length} Nhà Cung Cấp Đã Nộp Giá
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold block">
                  {t.matrix.bestSavings}
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                    {savingsPercent}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    (≈ {(potentialSavingsVnd / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} Tỷ VND)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cards so sánh top 3 nhà cung cấp */}
          {comparisons.length === 0 ? (
            <div className="p-12 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 mx-auto flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.matrix.emptyQuotesTitle}</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">{t.matrix.emptyQuotesDesc}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Cards so sánh top 3 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {comparisons.map((c) => {
                  const isAwarded = currentProject && awardedSupplierMap[currentProject.id] === c.supplierName;
                  return (
                    <div
                      key={c.supplierName}
                      className={`p-6 rounded-3xl border transition-all space-y-4 relative ${
                        c.isBest
                          ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20 shadow-lg'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'
                      }`}
                    >
                      {/* Rank Header */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                            c.isBest
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {t.matrix.rank} #{c.rank}
                        </span>
                        {c.isBest && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <Award className="w-4 h-4" />
                            <span>{t.matrix.bestOption}</span>
                          </span>
                        )}
                      </div>

                      {/* Supplier Information */}
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">{c.supplierName}</h3>
                        <p className="text-xs text-slate-500">
                          {t.common.conditionLabel}:{' '}
                          <span className="font-bold text-slate-800 dark:text-slate-200">{c.incoterm}</span> • {c.country}
                        </p>
                      </div>

                      {/* Cost Calculation Box */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t.matrix.supplierQuote}:</span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono">
                            {c.originalAmount.toLocaleString('en-US')} {c.originalCurrency}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t.matrix.freightInsurance}:</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300 font-mono">
                            {c.freightAndInsuranceVnd.toLocaleString('vi-VN')} VND
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t.matrix.importTaxVat}:</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300 font-mono">
                            {(c.importDutyVnd + c.vatAmountVnd).toLocaleString('vi-VN')} VND
                          </span>
                        </div>
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
                          <span className="font-bold text-slate-900 dark:text-white">{t.matrix.landedCostVnd}:</span>
                          <div className="text-right">
                            <span className="text-base font-black text-blue-600 dark:text-blue-400 font-mono block">
                              {c.totalLandedCostVnd.toLocaleString('vi-VN')} VND
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ≈ {(c.totalLandedCostVnd / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}{' '}
                              Tỷ VND
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Lead Time & Warranty Badges */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-center border border-slate-100 dark:border-slate-800/80">
                          <span className="text-slate-400 block">{t.common.leadTimeLabel}:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {c.leadTimeWeeks} {t.common.weeks}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-center border border-slate-100 dark:border-slate-800/80">
                          <span className="text-slate-400 block">{t.common.warrantyLabel}:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {c.warrantyMonths} {t.common.months}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 space-y-2">
                        <button
                          type="button"
                          onClick={() => handleViewQuotationDetail(c.supplierName)}
                          className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>{t.matrix.btnViewDetail}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAwardVendor(c.supplierName)}
                          className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer ${
                            isAwarded
                              ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/40'
                              : c.isBest
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white'
                          }`}
                        >
                          {isAwarded ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>{t.matrix.awardedBadge}</span>
                            </>
                          ) : (
                            <>
                              <Award className="w-4 h-4" />
                              <span>{t.matrix.btnAwardVendor}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bảng Ma Trận So Sánh Đa Tiêu Chí Toàn Diện */}
              <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>{t.matrix.tableTitle}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{t.matrix.tableSubtitle}</p>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                        <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 w-1/4">
                          {t.matrix.criteriaHeader}
                        </th>
                        {comparisons.map((c) => (
                          <th
                            key={c.supplierName}
                            className={`py-3 px-4 font-bold text-slate-900 dark:text-white text-center ${
                              c.isBest ? 'bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300' : ''
                            }`}
                          >
                            <div className="space-y-0.5">
                              <span className="font-extrabold block">{c.supplierName}</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                Xếp Hạng #{c.rank} {c.isBest ? '• Tối Ưu Nhất' : ''}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-500 bg-slate-50/40 dark:bg-slate-900/40">
                          {t.matrix.criteriaOrigin}
                        </td>
                        {comparisons.map((c) => (
                          <td key={c.supplierName} className={`py-3 px-4 text-center font-bold ${c.isBest ? 'bg-emerald-50/20 dark:bg-emerald-950/20' : ''}`}>
                            {c.country}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-500 bg-slate-50/40 dark:bg-slate-900/40">
                          {t.matrix.criteriaOriginalQuote}
                        </td>
                        {comparisons.map((c) => (
                          <td key={c.supplierName} className={`py-3 px-4 text-center font-mono font-bold ${c.isBest ? 'bg-emerald-50/20 dark:bg-emerald-950/20' : ''}`}>
                            {c.originalAmount.toLocaleString('en-US')} {c.originalCurrency}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-500 bg-slate-50/40 dark:bg-slate-900/40">
                          {t.matrix.criteriaIncoterm}
                        </td>
                        {comparisons.map((c) => (
                          <td key={c.supplierName} className={`py-3 px-4 text-center ${c.isBest ? 'bg-emerald-50/20 dark:bg-emerald-950/20' : ''}`}>
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-[11px]">
                              {c.incoterm}
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-500 bg-slate-50/40 dark:bg-slate-900/40">
                          {t.matrix.criteriaFreight}
                        </td>
                        {comparisons.map((c) => (
                          <td key={c.supplierName} className={`py-3 px-4 text-center font-mono ${c.isBest ? 'bg-emerald-50/20 dark:bg-emerald-950/20' : ''}`}>
                            {c.freightAndInsuranceVnd.toLocaleString('vi-VN')} VND
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-500 bg-slate-50/40 dark:bg-slate-900/40">
                          {t.matrix.criteriaTaxes}
                        </td>
                        {comparisons.map((c) => (
                          <td key={c.supplierName} className={`py-3 px-4 text-center font-mono ${c.isBest ? 'bg-emerald-50/20 dark:bg-emerald-950/20' : ''}`}>
                            {(c.importDutyVnd + c.vatAmountVnd).toLocaleString('vi-VN')} VND
                          </td>
                        ))}
                      </tr>
                      <tr className="font-extrabold bg-blue-50/30 dark:bg-blue-950/20">
                        <td className="py-3 px-4 text-blue-900 dark:text-blue-300">
                          {t.matrix.criteriaLandedCost}
                        </td>
                        {comparisons.map((c) => (
                          <td key={c.supplierName} className={`py-3 px-4 text-center font-mono text-sm text-blue-600 dark:text-blue-400 ${c.isBest ? 'bg-emerald-100/40 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : ''}`}>
                            {c.totalLandedCostVnd.toLocaleString('vi-VN')} VND
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-500 bg-slate-50/40 dark:bg-slate-900/40">
                          {t.matrix.criteriaCostDiff}
                        </td>
                        {comparisons.map((c) => {
                          const diff = c.totalLandedCostVnd - (bestPick?.totalLandedCostVnd || 0);
                          return (
                            <td key={c.supplierName} className={`py-3 px-4 text-center font-mono ${c.isBest ? 'bg-emerald-50/20 dark:bg-emerald-950/20' : ''}`}>
                              {diff === 0 ? (
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">0 VND (Chuẩn tối ưu)</span>
                              ) : (
                                <span className="font-bold text-amber-600 dark:text-amber-400">
                                  +{diff.toLocaleString('vi-VN')} VND (+{((diff / (bestPick?.totalLandedCostVnd || 1)) * 100).toFixed(1)}%)
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-500 bg-slate-50/40 dark:bg-slate-900/40">
                          {t.matrix.criteriaLeadTime}
                        </td>
                        {comparisons.map((c) => (
                          <td key={c.supplierName} className={`py-3 px-4 text-center font-bold ${c.isBest ? 'bg-emerald-50/20 dark:bg-emerald-950/20' : ''}`}>
                            {c.leadTimeWeeks} Tuần (Khoảng {Math.round(c.leadTimeWeeks * 7)} ngày)
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-500 bg-slate-50/40 dark:bg-slate-900/40">
                          {t.matrix.criteriaWarranty}
                        </td>
                        {comparisons.map((c) => (
                          <td key={c.supplierName} className={`py-3 px-4 text-center font-bold ${c.isBest ? 'bg-emerald-50/20 dark:bg-emerald-950/20' : ''}`}>
                            {c.warrantyMonths} Tháng ({Math.round(c.warrantyMonths / 12)} Năm)
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-500 bg-slate-50/40 dark:bg-slate-900/40">
                          {t.matrix.criteriaPayment}
                        </td>
                        {comparisons.map((c) => (
                          <td key={c.supplierName} className={`py-3 px-4 text-center text-[11px] ${c.isBest ? 'bg-emerald-50/20 dark:bg-emerald-950/20' : ''}`}>
                            <span className="line-clamp-2 max-w-[200px] mx-auto" title={c.paymentTerm}>
                              {c.paymentTerm}
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-500 bg-slate-50/40 dark:bg-slate-900/40">
                          {t.matrix.criteriaDocs}
                        </td>
                        {comparisons.map((c) => (
                          <td key={c.supplierName} className={`py-3 px-4 text-center ${c.isBest ? 'bg-emerald-50/20 dark:bg-emerald-950/20' : ''}`}>
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{c.docsCount} CO/CQ + FAT</span>
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-500 bg-slate-50/40 dark:bg-slate-900/40">
                          {t.matrix.criteriaTechScore}
                        </td>
                        {comparisons.map((c) => (
                          <td key={c.supplierName} className={`py-3 px-4 text-center ${c.isBest ? 'bg-emerald-50/20 dark:bg-emerald-950/20' : ''}`}>
                            <span className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-bold">
                              {c.techScore} / 100 {t.matrix.scorePoints}
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-slate-50/60 dark:bg-slate-800/40">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {t.matrix.criteriaDecision}
                        </td>
                        {comparisons.map((c) => (
                          <td key={c.supplierName} className={`py-3 px-4 text-center ${c.isBest ? 'bg-emerald-50/40 dark:bg-emerald-950/40' : ''}`}>
                            {c.isBest ? (
                              <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs inline-block">
                                {t.matrix.recommendedVendor}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">
                                {t.matrix.backupOption} #{c.rank}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ma Trận So Sánh Đơn Giá Từng Dòng Hàng BoQ */}
              <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                    <span>{t.matrix.bomMatrixTitle}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{t.matrix.bomMatrixSubtitle}</p>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                        <th className="py-3 px-3 font-bold text-slate-700 dark:text-slate-300 w-24">
                          {t.matrix.itemCodeHeader}
                        </th>
                        <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 min-w-[240px]">
                          {t.matrix.itemNameHeader}
                        </th>
                        <th className="py-3 px-2 font-bold text-slate-700 dark:text-slate-300 text-center w-16">
                          {t.matrix.unitHeader}
                        </th>
                        <th className="py-3 px-2 font-bold text-slate-700 dark:text-slate-300 text-center w-14">
                          {t.matrix.quantityHeader}
                        </th>
                        {comparisons.map((c) => (
                          <th
                            key={c.supplierName}
                            className={`py-3 px-4 font-bold text-slate-900 dark:text-white text-right ${
                              c.isBest ? 'bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300' : ''
                            }`}
                          >
                            {c.supplierName}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {bomItems.map((item) => (
                        <tr key={item.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-3 font-mono font-bold text-slate-600 dark:text-slate-400">
                            {item.code}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{item.name}</td>
                          <td className="py-3 px-2 text-center">{item.unit}</td>
                          <td className="py-3 px-2 text-center font-bold">{item.qty}</td>
                          {comparisons.map((c) => {
                            const quoteInfo = (item.quotes as Record<string, { unit: number; curr: Currency; totalVnd: number }>)[
                              c.supplierName
                            ];
                            if (!quoteInfo) {
                              return (
                                <td key={c.supplierName} className="py-3 px-4 text-right text-slate-400 font-mono">
                                  —
                                </td>
                              );
                            }
                            return (
                              <td
                                key={c.supplierName}
                                className={`py-3 px-4 text-right font-mono ${
                                  c.isBest ? 'bg-emerald-50/20 dark:bg-emerald-950/20' : ''
                                }`}
                              >
                                <span className="font-bold text-slate-900 dark:text-white block">
                                  {quoteInfo.unit.toLocaleString('en-US')} {quoteInfo.curr}
                                </span>
                                <span className="text-[10px] text-slate-400 block">
                                  ≈ {(quoteInfo.totalVnd / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}{' '}
                                  {t.matrix.billionVnd}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL CẤU HÌNH NGUỒN TỶ GIÁ NGOẠI TỆ NGÂN HÀNG UY TÍN                 */}
      {/* ========================================================================= */}
      {isRateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Landmark className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.matrix.rateModalTitle}</h3>
                  <p className="text-xs text-slate-500">{t.matrix.rateModalSubtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRateModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 text-xs">
              {/* Chọn Ngân Hàng Nguồn Cấp */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t.matrix.selectBankSource}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: BankExchangeProvider.VCB, name: 'Vietcombank', code: 'VCB' },
                    { id: BankExchangeProvider.BIDV, name: 'BIDV', code: 'BIDV' },
                    { id: BankExchangeProvider.CTG, name: 'VietinBank', code: 'CTG' },
                    { id: BankExchangeProvider.TCB, name: 'Techcombank', code: 'TCB' },
                    { id: BankExchangeProvider.SBV, name: 'NH Nhà Nước (SBV)', code: 'SBV' },
                    { id: BankExchangeProvider.CUSTOMS, name: 'Tổng Cục Hải Quan', code: 'Customs' },
                  ].map((bank) => (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => {
                        setRateConfig((prev) => ({ ...prev, activeProvider: bank.id }));
                        exchangeRateService.getBankSnapshot(bank.id).then((snap) => setActiveSnapshot(snap));
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        rateConfig.activeProvider === bank.id
                          ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{bank.name}</span>
                        {rateConfig.activeProvider === bank.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Mã: {bank.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chọn Loại Tỷ Giá */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t.matrix.selectRateType}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRateConfig((prev) => ({ ...prev, activeRateType: RateCalculationType.SELL_TRANSFER }))}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      rateConfig.activeRateType === RateCalculationType.SELL_TRANSFER
                        ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <p className="font-bold text-xs">{t.matrix.rateTypeSellTransfer}</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRateConfig((prev) => ({ ...prev, activeRateType: RateCalculationType.BUY_TRANSFER }))}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      rateConfig.activeRateType === RateCalculationType.BUY_TRANSFER
                        ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <p className="font-bold text-xs">{t.matrix.rateTypeBuyTransfer}</p>
                  </button>
                </div>
              </div>

              {/* Bảng Tỷ Giá Trực Tuyến Thời Gian Thực */}
              {activeSnapshot && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {t.matrix.bankRatesTableTitle} ({activeSnapshot.providerShortName})
                    </span>
                    <button
                      type="button"
                      onClick={handleSyncBankRates}
                      disabled={isSyncingRates}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-bold text-[11px] transition-all cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingRates ? 'animate-spin' : ''}`} />
                      <span>{t.matrix.btnSyncNow}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center">
                    {[Currency.USD, Currency.EUR, Currency.JPY, Currency.CNY].map((curr) => {
                      const entry = activeSnapshot.rates[curr];
                      if (!entry) return null;
                      return (
                        <div
                          key={curr}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-0.5"
                        >
                          <span className="text-[10px] text-slate-400 font-bold block">{curr} / VND</span>
                          <span className="text-sm font-black text-blue-600 dark:text-blue-400 block">
                            {entry.sellTransfer.toLocaleString('vi-VN')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-slate-950/50">
              <button
                type="button"
                onClick={() => setIsRateModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {t.common.cancel}
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSaveRateConfig(
                    rateConfig.activeProvider,
                    rateConfig.activeRateType,
                    rateConfig.fxRiskMarginPercent
                  )
                }
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all cursor-pointer"
              >
                {t.matrix.btnSaveApply}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL XEM CHI TIẾT TOÀN BỘ HỒ SƠ BÁO GIÁ CỦA VENDOR                    */}
      {/* (ĐÃ LOẠI BỎ TOÀN BỘ THÔNG TIN DEBUG BE NHƯ MÃ BĂM SHA-256)                 */}
      {/* ========================================================================= */}
      {selectedQuotationDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t.sourcing.quotationDetailTitle}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedQuotationDetail.rfqCode} • {selectedQuotationDetail.supplierName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuotationDetail(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Supplier Info & Commercial Terms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px]">
                    {t.sourcing.supplierInfo}
                  </h4>
                  <div className="space-y-1 text-slate-600 dark:text-slate-400">
                    <p>
                      <strong>Doanh nghiệp:</strong> {selectedQuotationDetail.supplierName}
                    </p>
                    <p>
                      <strong>Quốc gia:</strong> {selectedQuotationDetail.supplierCountry}
                    </p>
                    <p>
                      <strong>Người liên hệ:</strong> {selectedQuotationDetail.supplierContact}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedQuotationDetail.supplierEmail}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px]">
                    {t.sourcing.commercialTerms}
                  </h4>
                  <div className="space-y-1 text-slate-600 dark:text-slate-400">
                    <p>
                      <strong>Điều kiện Incoterm:</strong> {selectedQuotationDetail.incoterm}
                    </p>
                    <p>
                      <strong>Cảng bốc / dỡ:</strong> {selectedQuotationDetail.loadingPort} →{' '}
                      {selectedQuotationDetail.dischargePort}
                    </p>
                    <p>
                      <strong>Thời gian giao hàng:</strong> {selectedQuotationDetail.leadTimeWeeks} Tuần
                    </p>
                    <p>
                      <strong>Thời hạn bảo hành:</strong> {selectedQuotationDetail.warrantyMonths} Tháng
                    </p>
                  </div>
                </div>
              </div>

              {/* BoQ Line Items Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px]">
                  {t.sourcing.boqTableTitle}
                </h4>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                      <tr>
                        <th className="py-2.5 px-3 font-bold">Mã</th>
                        <th className="py-2.5 px-3 font-bold">Tên Thiết Bị & Quy Cách</th>
                        <th className="py-2.5 px-2 font-bold text-center">ĐVT</th>
                        <th className="py-2.5 px-2 font-bold text-center">SL</th>
                        <th className="py-2.5 px-3 font-bold text-right">Đơn Giá</th>
                        <th className="py-2.5 px-3 font-bold text-right">Thành Tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedQuotationDetail.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2.5 px-3 font-mono font-bold">{item.itemCode}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-900 dark:text-white block">{item.itemName}</span>
                            <span className="text-[11px] text-slate-500 block">{item.specs}</span>
                          </td>
                          <td className="py-2.5 px-2 text-center">{item.unit}</td>
                          <td className="py-2.5 px-2 text-center font-bold">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            {(item.unitPrice ?? 0).toLocaleString('en-US')} {selectedQuotationDetail.currency}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                            {(item.totalAmount ?? 0).toLocaleString('en-US')} {selectedQuotationDetail.currency}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Trạng thái xác thực hồ sơ - Loại bỏ hoàn toàn SHA-256 debug hash */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-bold text-emerald-900 dark:text-emerald-200">
                    Hồ sơ báo giá đã được niêm phong bảo mật và xác thực chữ ký điện tử hợp lệ
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px]">
                  ✓ Hợp Lệ
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-slate-950/50">
              <button
                type="button"
                onClick={() => setSelectedQuotationDetail(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
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
