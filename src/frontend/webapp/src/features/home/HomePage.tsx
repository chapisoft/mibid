'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CmsScreen } from '../../shared/types';
import { useAuth } from '../../shared/auth/AuthContext';
import { useTranslation } from '../../shared/i18n';
import {
  Briefcase,
  Kanban,
  FileSpreadsheet,
  SplitSquareVertical,
  CheckSquare,
  Truck,
  FolderLock,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Zap,
  Globe2,
  Lock,
  Building2,
  UserCheck,
  Store,
  UserPlus,
  FileText,
  Layers,
  ChevronRight,
  Check,
  CreditCard,
  HardDrive,
  Users,
  CheckCircle2,
  Star,
  Loader2,
} from 'lucide-react';

import { MibidLogo, MibidAppIcon } from '../../shared/ui/MibidLogo';
import { subscriptionService } from '../../services/subscriptionService';
import { ISubscriptionPlan, BillingCycle } from '../../models/subscription.model';

interface HomePageProps {
  onNavigate: (screen: CmsScreen) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  // State quản lý danh mục gói cước nạp trực tiếp từ API Backend
  const [plans, setPlans] = useState<ISubscriptionPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(BillingCycle.YEARLY);

  useEffect(() => {
    let isMounted = true;
    async function fetchPlans() {
      setIsLoadingPlans(true);
      try {
        const data = await subscriptionService.getPublicPlans();
        if (isMounted) {
          setPlans(data);
        }
      } catch (err) {
        console.error('Failed to load subscription plans:', err);
      } finally {
        if (isMounted) {
          setIsLoadingPlans(false);
        }
      }
    }
    fetchPlans();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatVnd = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
  };

  const parseModules = (modules: string[] | string | undefined): string[] => {
    if (!modules) return [];
    if (Array.isArray(modules)) return modules;
    try {
      const parsed = JSON.parse(modules);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const MODULE_LABELS: Record<string, string> = {
    CORE: 'Báo cáo tổng quan & Core Workspace',
    BIDDING: 'Quản lý Gói thầu & Kanban 6 bước',
    SOURCING: 'Sourcing RFQ & Báo giá Magic Link',
    LOGISTICS: 'Vận đơn XNK & Giám sát tiến độ tàu',
    DMS: 'Kho tài liệu & Hồ sơ năng lực số',
    ANALYTICS: 'Phân tích BI & Dự báo tỷ lệ trúng thầu',
    SYSTEM_ADMIN: 'Quản trị nhân sự & Đa chi nhánh',
    SAAS_BILLING: 'Cổng thanh toán & Hóa đơn tự động',
  };

  const features = [
    {
      icon: Kanban,
      title: t.home.feature1Title,
      description: t.home.feature1Desc,
      color: 'from-blue-600 to-indigo-600',
    },
    {
      icon: FileSpreadsheet,
      title: t.home.feature2Title,
      description: t.home.feature2Desc,
      color: 'from-emerald-600 to-teal-600',
    },
    {
      icon: SplitSquareVertical,
      title: t.home.feature3Title,
      description: t.home.feature3Desc,
      color: 'from-purple-600 to-pink-600',
    },
    {
      icon: FolderLock,
      title: t.home.feature4Title,
      description: t.home.feature4Desc,
      color: 'from-amber-600 to-orange-600',
    },
    {
      icon: Truck,
      title: t.home.feature5Title,
      description: t.home.feature5Desc,
      color: 'from-cyan-600 to-blue-600',
    },
    {
      icon: BarChart3,
      title: t.home.feature6Title,
      description: t.home.feature6Desc,
      color: 'from-rose-600 to-red-600',
    },
  ];

  const workflowSteps = [
    { step: '01', name: t.home.step1Name, desc: t.home.step1Desc },
    { step: '02', name: t.home.step2Name, desc: t.home.step2Desc },
    { step: '03', name: t.home.step3Name, desc: t.home.step3Desc },
    { step: '04', name: t.home.step4Name, desc: t.home.step4Desc },
    { step: '05', name: t.home.step5Name, desc: t.home.step5Desc },
    { step: '06', name: t.home.step6Name, desc: t.home.step6Desc },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-slate-800 p-8 sm:p-12 lg:p-16 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/95 dark:bg-white p-2 rounded-xl shadow-sm">
              <MibidLogo size="sm" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-xs font-semibold text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.home.badge}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {t.home.heroTitlePrefix}{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              {t.home.heroTitleHighlight}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            {t.home.heroDesc}
          </p>
        </div>
      </div>

      {/* Dual Portal Entry Selector - Bộ chọn lối vào phân hệ */}
      <div className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <Layers className="w-3.5 h-3.5" />
            <span>PORTAL ACCESS SELECTOR</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Chọn Lối Vào Không Gian Làm Việc
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Truy cập phân hệ phù hợp với vai trò của bạn trong hệ sinh thái đấu thầu & cung ứng MIBID
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Card 1: Phân Hệ Nhân Viên MIBID (Staff / CMS Workspace) */}
          <div className="relative rounded-3xl border-2 border-blue-500/30 dark:border-blue-500/20 bg-gradient-to-b from-white to-blue-50/40 dark:from-slate-900 dark:to-slate-900/90 p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:border-blue-500/60 transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Dành cho Cán bộ Mua sắm
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Không Gian Làm Việc Nội Bộ</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                    Staff CMS
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Dành cho Ban Điều hành, Chuyên viên Mua sắm, Kỹ thuật và Tài chính quản lý trọn vòng đời gói thầu, kiểm soát chuyển bước Gatekeeper, so sánh ma trận báo giá và điều hành Kanban.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Điều hành Kanban 6 bước & Chốt chặn an toàn Gatekeeper</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Ma trận so sánh báo giá tự động & Quy đổi tỷ giá ngoại tệ</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Kho tài liệu số DMS & Theo dõi lộ trình lô hàng Logistics</span>
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-2.5">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-blue-600 hover:bg-blue-700 active:scale-98 text-white shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Vào Bàn Làm Việc (Dashboard)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-blue-600 hover:bg-blue-700 active:scale-98 text-white shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Đăng Nhập Tài Khoản Nhân Viên</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => onNavigate('kanban')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50/80 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-center gap-1.5"
              >
                <Kanban className="w-3.5 h-3.5 text-blue-500" />
                <span>Xem Trực Quan Bảng Kanban Gói Thầu</span>
              </button>
            </div>
          </div>

          {/* Card 2: Phân Hệ Nhà Cung Cấp (Vendor Portal) */}
          <div className="relative rounded-3xl border-2 border-emerald-500/30 dark:border-emerald-500/20 bg-gradient-to-b from-white to-emerald-50/40 dark:from-slate-900 dark:to-slate-900/90 p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:border-emerald-500/60 transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                  <Store className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Dành cho Nhà Cung Cấp
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Cổng Thông Tin Nhà Cung Cấp</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 font-mono">
                    Vendor Portal
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Dành cho Nhà sản xuất & Nhà phân phối nộp báo giá trực tiếp qua Magic Link an toàn không cần đăng ký tài khoản, gửi hồ sơ kỹ thuật CO/CQ và đăng ký đối tác chuỗi cung ứng.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Báo giá trực tiếp không cần mật khẩu qua mã PIN 6 số an toàn</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Hỗ trợ đa tiền tệ (USD, EUR, RMB, JPY, VND) & Incoterms 2020</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Chứng thực số hợp lệ và bảo mật dữ liệu tuyệt đối</span>
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-2.5">
              <Link
                href="/vendor"
                className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Store className="w-4 h-4" />
                <span>{t.portal?.openSampleBtn ? `Vào Cổng ${t.portal.openSampleBtn}` : 'Truy Cập Cổng Báo Giá'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/vendor/register"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-emerald-50/80 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-center gap-1.5 border border-slate-200/80 dark:border-slate-800"
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t.portal?.registerPartnerBtn ? `${t.portal.registerPartnerBtn} Nhà Cung Cấp Mới` : 'Đăng Ký Nhà Cung Cấp Mới'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Features Grid */}
      <div className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t.home.coreCapabilitiesTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t.home.coreCapabilitiesSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm hover:shadow-xl transition-all duration-200 space-y-4 group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${f.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{f.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SaaS Subscription Pricing Plans Section - Nạp 100% từ Database API */}
      <div className="space-y-8">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            <CreditCard className="w-3.5 h-3.5" />
            <span>{t.home.pricingBadge || 'BẢNG GIÁ DỊCH VỤ SAAS'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.home.pricingTitle || 'Gói Cước Linh Hoạt Cho Mọi Quy Mô'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {t.home.pricingSubtitle || 'Từ nhà thầu độc lập đến tổng công ty xây lắp & xuất nhập khẩu quy mô lớn'}
          </p>

          {/* Toggle Chu kỳ thanh toán Tháng / Năm */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 mt-3 shadow-inner">
            <button
              type="button"
              onClick={() => setBillingCycle(BillingCycle.MONTHLY)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                billingCycle === BillingCycle.MONTHLY
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.home.billingCycleMonthly || 'Thanh toán Tháng'}
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle(BillingCycle.YEARLY)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === BillingCycle.YEARLY
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{t.home.billingCycleYearly || 'Thanh toán Năm'}</span>
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                billingCycle === BillingCycle.YEARLY
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
              }`}>
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Trạng thái Loading hoặc Danh sách các Card gói cước */}
        {isLoadingPlans ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs text-slate-500">{t.home.loadingPlans || 'Đang tải danh mục gói cước từ máy chủ...'}</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center p-12 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800">
            <CreditCard className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              {t.home.noPlansFound || 'Hiện chưa có gói cước nào được công bố.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {plans.map((plan) => {
              const isPopular = plan.code === 'PROFESSIONAL';
              const isEnterprise = plan.code === 'ENTERPRISE';
              const modules = parseModules(plan.allowedModules);
              const price = billingCycle === BillingCycle.YEARLY ? plan.yearlyPrice : plan.monthlyPrice;
              const periodSuffix = billingCycle === BillingCycle.YEARLY 
                ? (t.home.perYearText || '/năm') 
                : (t.home.perMonthText || '/tháng');

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl flex flex-col justify-between transition-all duration-300 p-8 ${
                    isPopular
                      ? 'border-2 border-blue-500 dark:border-blue-400 bg-gradient-to-b from-white via-blue-50/30 to-white dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900 shadow-2xl scale-105 z-10'
                      : isEnterprise
                      ? 'border border-purple-300/80 dark:border-purple-800/80 bg-gradient-to-b from-white via-purple-50/20 to-white dark:from-slate-900 dark:via-purple-950/20 dark:to-slate-900 shadow-lg hover:shadow-xl'
                      : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-md hover:shadow-xl'
                  }`}
                >
                  {/* Badge Phổ biến nhất */}
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-1.5">
                      <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                      <span>{t.home.popularBadge || 'Phổ Biến Nhất'}</span>
                    </div>
                  )}

                  {/* Header Gói Cước */}
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400">
                          {plan.code}
                        </span>
                        {isEnterprise && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            Cao Cấp
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    {/* Mức Giá */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                          {formatVnd(price)}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {periodSuffix}
                        </span>
                      </div>
                      {billingCycle === BillingCycle.YEARLY && plan.monthlyPrice > 0 && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                          Tương đương {formatVnd(Math.round(plan.yearlyPrice / 12))}/tháng
                        </p>
                      )}
                    </div>

                    {/* Giới Hạn Phần Cứng & Dung Lượng (Database Driven) */}
                    <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                      <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                        <Users className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="font-semibold">
                          {(t.home.usersLimitText || 'Tối đa {count} tài khoản người dùng').replace('{count}', String(plan.maxUsers))}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                        <HardDrive className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="font-semibold">
                          {plan.maxStorageGb >= 2000
                            ? (t.home.unlimitedStorage || 'Không giới hạn dung lượng lưu trữ')
                            : (t.home.storageLimitText || '{count} GB lưu trữ hồ sơ DMS').replace('{count}', String(plan.maxStorageGb))}
                        </span>
                      </div>
                    </div>

                    {/* Danh sách Phân hệ được cấp phép */}
                    <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        {t.home.allowedModulesLabel || 'Phân hệ được kích hoạt:'}
                      </span>
                      <ul className="space-y-2 text-xs">
                        {modules.map((mCode) => (
                          <li key={mCode} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>{MODULE_LABELS[mCode] || mCode}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Nút Đăng Ký / Chọn Gói */}
                  <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => {
                        if (isAuthenticated) {
                          onNavigate('subscriptions');
                        } else {
                          onNavigate('login');
                        }
                      }}
                      className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                        isPopular
                          ? 'bg-blue-600 hover:bg-blue-700 active:scale-98 text-white shadow-lg shadow-blue-500/25'
                          : isEnterprise
                          ? 'bg-purple-600 hover:bg-purple-700 active:scale-98 text-white shadow-lg shadow-purple-500/25'
                          : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>
                        {isEnterprise
                          ? (t.home.contactSales || 'Liên Hệ Doanh Nghiệp')
                          : (t.home.choosePlan || 'Đăng Ký Gói Này')}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Standard 6-Stage Tender Workflow */}
      <div className="p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-8">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.home.workflowTitle}</h3>
          <p className="text-xs text-slate-500">{t.home.workflowSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {workflowSteps.map((ws, i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 space-y-2">
              <span className="text-xs font-black text-blue-600 dark:text-blue-400 font-mono">{t.common.step} {ws.step}</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ws.name}</h4>
              <p className="text-[11px] text-slate-400 leading-snug">{ws.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
