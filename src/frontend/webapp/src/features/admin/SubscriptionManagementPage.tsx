'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../shared/i18n';
import { DataTable, Column } from '../../shared/components/DataTable';
import {
  CreditCard,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  DollarSign,
  Send,
  Building2,
  Calendar,
  Layers,
  X,
  Save,
  Check,
  Edit3,
  Trash2,
  Search,
  ExternalLink,
  ShieldCheck,
  Zap,
  Eye,
} from 'lucide-react';
import { subscriptionService } from '../../services/subscriptionService';
import {
  ISubscriptionPlan,
  ITenantSubscription,
  ISubscriptionInvoice,
  ISubscriptionNotification,
  SubscriptionStatus,
  InvoiceStatus,
  BillingCycle,
} from '../../models/subscription.model';

export function SubscriptionManagementPage() {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'SUBSCRIPTIONS' | 'PLANS' | 'INVOICES' | 'NOTIFICATIONS'>('SUBSCRIPTIONS');

  const [subscriptions, setSubscriptions] = useState<ITenantSubscription[]>([]);
  const [plans, setPlans] = useState<ISubscriptionPlan[]>([]);
  const [invoices, setInvoices] = useState<ISubscriptionInvoice[]>([]);
  const [notifications, setNotifications] = useState<ISubscriptionNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state for Subscriptions
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<ITenantSubscription | null>(null);
  const [viewingSub, setViewingSub] = useState<ITenantSubscription | null>(null);
  const [editingSub, setEditingSub] = useState<ITenantSubscription | null>(null);
  const [deletingSub, setDeletingSub] = useState<ITenantSubscription | null>(null);

  // Modals state for Plans
  const [isCreatePlanModalOpen, setIsCreatePlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ISubscriptionPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<ISubscriptionPlan | null>(null);

  // Form states for Create / Edit Plan
  const [planCode, setPlanCode] = useState('');
  const [planName, setPlanName] = useState('');
  const [planDesc, setPlanDesc] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState(2500000);
  const [yearlyPrice, setYearlyPrice] = useState(25000000);
  const [maxUsers, setMaxUsers] = useState(20);
  const [maxStorage, setMaxStorage] = useState(50);

  // Form state for Renew
  const [renewForm, setRenewForm] = useState({
    planId: '',
    billingCycle: BillingCycle.YEARLY,
    paymentMethod: 'BANK_TRANSFER',
    transactionReference: '',
    notes: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subsData, plansData, invData, notifData] = await Promise.all([
        subscriptionService.getAllSubscriptions(),
        subscriptionService.getAllPlans(),
        subscriptionService.getAllInvoices(),
        subscriptionService.getNotifications(),
      ]);
      setSubscriptions(subsData);
      setPlans(plansData);
      setInvoices(invData);
      setNotifications(notifData);
    } catch (err) {
      console.error('Lỗi tải dữ liệu gói cước và thuê bao:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenRenewModal = (sub: ITenantSubscription) => {
    setSelectedSub(sub);
    setRenewForm({
      planId: sub.planId,
      billingCycle: sub.billingCycle || BillingCycle.YEARLY,
      paymentMethod: 'BANK_TRANSFER',
      transactionReference: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
      notes: '',
    });
    setIsRenewModalOpen(true);
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    try {
      const updated = await subscriptionService.renewSubscription(selectedSub.tenantId, renewForm);
      setSubscriptions(subscriptions.map((s) => (s.tenantId === updated.tenantId ? updated : s)));
      setIsRenewModalOpen(false);
      showToast(`${t.subscriptions.toastRenewed} ${selectedSub.tenantName}`);
      // Refresh invoices
      const invData = await subscriptionService.getAllInvoices();
      setInvoices(invData);
    } catch (err) {
      console.error('Lỗi gia hạn:', err);
    }
  };

  const handleSaveSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;

    try {
      const payload: Partial<ITenantSubscription> = {
        planId: editingSub.planId,
        billingCycle: editingSub.billingCycle,
        startDate: editingSub.startDate,
        endDate: editingSub.endDate,
        gracePeriodDays: Number(editingSub.gracePeriodDays),
        status: editingSub.status,
        autoRenew: Boolean(editingSub.autoRenew),
      };
      const updated = await subscriptionService.updateSubscription(editingSub.id, payload);
      setSubscriptions(subscriptions.map((s) => (s.id === updated.id ? updated : s)));
      setEditingSub(null);
      showToast(`Cập nhật hợp đồng thuê bao thành công: ${updated.tenantName || updated.tenantCode || updated.tenantId}`);
    } catch (err) {
      console.error('Lỗi cập nhật thuê bao:', err);
      showToast('Không thể cập nhật hợp đồng thuê bao. Vui lòng thử lại.');
    }
  };

  const handleDeleteSub = async () => {
    if (!deletingSub) return;
    try {
      await subscriptionService.deleteSubscription(deletingSub.id);
      setSubscriptions(subscriptions.filter((s) => s.id !== deletingSub.id));
      setDeletingSub(null);
      showToast('Đã chấm dứt hợp đồng thuê bao thành công!');
    } catch (err) {
      console.error('Lỗi xóa thuê bao:', err);
      showToast('Không thể xóa hợp đồng thuê bao. Vui lòng thử lại.');
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName) return;

    try {
      const newPlan = await subscriptionService.createPlan({
        code: planCode || `PLAN_${Date.now()}`,
        name: planName,
        description: planDesc,
        monthlyPrice,
        yearlyPrice,
        maxUsers,
        maxStorageGb: maxStorage,
        allowedModules: ['SOURCING', 'BIDDING', 'LOGISTICS', 'DMS', 'DASHBOARD'],
      });

      setPlans([newPlan, ...plans]);
      setIsCreatePlanModalOpen(false);
      showToast(`${t.subscriptions.toastPlanCreated} ${newPlan.name}`);

      // Reset form
      setPlanCode('');
      setPlanName('');
      setPlanDesc('');
    } catch (err) {
      console.error('Lỗi tạo gói cước:', err);
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    try {
      const payload: Partial<ISubscriptionPlan> = {
        name: editingPlan.name,
        description: editingPlan.description,
        monthlyPrice: Number(editingPlan.monthlyPrice),
        yearlyPrice: Number(editingPlan.yearlyPrice),
        maxUsers: Number(editingPlan.maxUsers),
        maxMachines: Number(editingPlan.maxMachines || 0),
        maxStorageGb: Number(editingPlan.maxStorageGb),
        allowedModules: editingPlan.allowedModules,
        isActive: Boolean(editingPlan.isActive),
      };
      const updated = await subscriptionService.updatePlan(editingPlan.id, payload);
      setPlans(plans.map((p) => (p.id === updated.id ? updated : p)));
      setEditingPlan(null);
      showToast(`${t.subscriptions.toastPlanCreated} ${updated.name}`);
    } catch (err) {
      console.error('Lỗi cập nhật gói cước:', err);
    }
  };

  const handleDeletePlan = async () => {
    if (!deletingPlan) return;
    try {
      await subscriptionService.deletePlan(deletingPlan.id);
      setPlans(plans.filter((p) => p.id !== deletingPlan.id));
      setDeletingPlan(null);
    } catch (err) {
      console.error('Lỗi xóa gói cước:', err);
    }
  };

  const handlePayInvoice = async (invoiceId: string) => {
    try {
      const txn = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
      const updated = await subscriptionService.payInvoice(invoiceId, txn, 'BANK_TRANSFER');
      setInvoices(invoices.map((i) => (i.id === updated.id ? updated : i)));
      showToast(`${t.subscriptions.toastInvoicePaid} ${updated.invoiceNumber}`);
    } catch (err) {
      console.error('Lỗi thanh toán hóa đơn:', err);
    }
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  // Mapping tenantId sang tenantCode ngắn gọn (EEMC, PVN,...)
  const tenantCodeMap = useMemo(() => {
    const map: Record<string, string> = {};
    subscriptions.forEach((s) => {
      if (s.tenantId && s.tenantCode) {
        map[s.tenantId] = s.tenantCode;
      }
    });
    return map;
  }, [subscriptions]);

  // Filter Subscriptions
  const filteredSubs = useMemo(() => {
    return subscriptions.filter(
      (sub) =>
        (sub.tenantCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.tenantId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.tenantName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.planName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [subscriptions, searchQuery]);

  // KPI Computations
  const totalSubCount = subscriptions.length;
  const activeSubCount = subscriptions.filter((s) => s.status === SubscriptionStatus.ACTIVE).length;
  const expiringSubCount = subscriptions.filter(
    (s) => s.status === SubscriptionStatus.EXPIRING_SOON || s.daysRemaining <= 30
  ).length;
  const totalRevenue = invoices
    .filter((i) => i.status === InvoiceStatus.PAID)
    .reduce((acc, cur) => acc + cur.amount, 0);

  // DataTable Columns for Subscriptions
  const subColumns: Column<ITenantSubscription>[] = [
    {
      key: 'tenantCode',
      header: t.subscriptions.tenantIdHeader,
      width: '120px',
      render: (item) => (
        <button
          type="button"
          onClick={() => setViewingSub(item)}
          className="inline-flex items-center px-2.5 py-1 rounded-lg font-mono text-xs font-black bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
          title={`Mã Tenant: ${item.tenantCode || item.tenantId} • ${item.tenantName || ''}`}
        >
          {item.tenantCode || (item.tenantId ? item.tenantId.substring(0, 4).toUpperCase() : 'TNT')}
        </button>
      ),
    },
    {
      key: 'tenantName',
      header: t.subscriptions.tenantNameHeader,
      width: '280px',
      render: (item) => (
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{item.tenantName}</div>
          <div className="text-[11px] text-slate-400">
            {item.currentUserCount}/{item.maxUsers} Users • {item.currentMachineCount}/{item.maxMachines} Thiết bị
          </div>
        </div>
      ),
    },
    {
      key: 'planName',
      header: t.subscriptions.planHeader,
      width: '240px',
      render: (item) => (
        <div className="space-y-0.5">
          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
            {item.planName}
          </span>
          <div className="text-[10px] font-mono text-slate-400">Mã: {item.planCode}</div>
        </div>
      ),
    },
    {
      key: 'billingCycle',
      header: t.subscriptions.cycleHeader,
      width: '120px',
      render: (item) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {item.billingCycle === BillingCycle.YEARLY ? t.subscriptions.yearlyCycle : t.subscriptions.monthlyCycle}
        </span>
      ),
    },
    {
      key: 'endDate',
      header: t.subscriptions.contractRangeHeader,
      width: '210px',
      render: (item) => (
        <div className="text-xs font-mono text-slate-700 dark:text-slate-300">
          <div>Từ: {item.startDate}</div>
          <div>Đến: <strong>{item.endDate}</strong></div>
        </div>
      ),
    },
    {
      key: 'daysRemaining',
      header: t.subscriptions.daysLeftHeader,
      width: '150px',
      align: 'center',
      render: (item) => (
        <span
          className={`font-mono text-xs font-bold ${
            item.daysRemaining <= 30 ? 'text-amber-600 dark:text-amber-400 animate-pulse' : 'text-slate-800 dark:text-slate-200'
          }`}
        >
          {item.daysRemaining} {t.subscriptions.daysUnit}
        </span>
      ),
    },
    {
      key: 'status',
      header: t.subscriptions.statusHeader,
      width: '140px',
      align: 'center',
      render: (item) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
            item.status === SubscriptionStatus.ACTIVE
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
          }`}
        >
          {item.status === SubscriptionStatus.ACTIVE ? t.subscriptions.activeStatus : t.subscriptions.expiringStatus}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{t.subscriptions.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.subscriptions.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeTab === 'PLANS' && (
            <button
              type="button"
              onClick={() => setIsCreatePlanModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.subscriptions.createPlanBtn}</span>
            </button>
          )}

          <button
            type="button"
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
            <span>{t.subscriptions.refreshBtn}</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Tổng Thuê Bao */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>{t.subscriptions.kpiTotalSubs}</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalSubCount} <span className="text-sm font-bold text-slate-400 font-sans">{t.subscriptions.kpiTotalSubsUnit}</span>
          </div>
        </div>

        {/* KPI 2: Đang Hiệu Lực */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>{t.subscriptions.kpiActiveSubs}</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {activeSubCount} / {totalSubCount}
          </div>
        </div>

        {/* KPI 3: Sắp Hết Hạn */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>{t.subscriptions.kpiExpiringSubs}</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {expiringSubCount} <span className="text-sm font-bold text-slate-400 font-sans">{t.subscriptions.kpiExpiringSubsUnit}</span>
          </div>
        </div>

        {/* KPI 4: Doanh Thu Kỳ */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>{t.subscriptions.kpiTotalRevenue}</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 font-mono truncate">
            {formatVND(totalRevenue)}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-x-auto">
        {[
          { key: 'SUBSCRIPTIONS', label: t.subscriptions.tabSubscriptions, icon: Building2, count: subscriptions.length },
          { key: 'PLANS', label: t.subscriptions.tabPlans, icon: Layers, count: plans.length },
          { key: 'INVOICES', label: t.subscriptions.tabInvoices, icon: FileText, count: invoices.length },
          { key: 'NOTIFICATIONS', label: t.subscriptions.tabNotifications, icon: Send, count: notifications.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SUBSCRIPTIONS */}
      {activeTab === 'SUBSCRIPTIONS' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.subscriptions.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <DataTable<ITenantSubscription>
            columns={subColumns}
            data={filteredSubs}
            renderActions={(item) => (
              <div className="flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => setEditingSub({ ...item })}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Chỉnh sửa hợp đồng thuê bao"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenRenewModal(item)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title={t.subscriptions.renewBtn}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewingSub(item)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Xem chi tiết hợp đồng"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            )}
          />
        </div>
      )}

      {/* TAB 2: PLANS */}
      {activeTab === 'PLANS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-400 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {plan.code}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                    <CheckCircle size={14} /> Active
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 dark:text-white">{plan.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{plan.description}</p>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <div className="text-2xl font-black text-blue-600 font-mono">
                    {formatVND(plan.yearlyPrice)}
                    <span className="text-xs font-normal text-slate-400 font-sans"> /năm</span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {formatVND(plan.monthlyPrice)} /tháng
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tài khoản tối đa:</span>
                    <strong>{plan.maxUsers} Users</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dung lượng DMS:</span>
                    <strong>{plan.maxStorageGb} GB</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phân hệ:</span>
                    <strong className="text-blue-600">{plan.allowedModules?.length || 5} Modules</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPlan({ ...plan })}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors"
                >
                  <Edit3 size={13} />
                  <span>{t.common.edit}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingPlan({ ...plan })}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 flex items-center gap-1 transition-colors"
                >
                  <Trash2 size={13} />
                  <span>{t.common.delete}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: INVOICES */}
      {activeTab === 'INVOICES' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">{t.subscriptions.invoiceNumHeader}</th>
                <th className="p-3.5">{t.subscriptions.tenantIdHeader}</th>
                <th className="p-3.5 text-right">{t.subscriptions.amountHeader}</th>
                <th className="p-3.5">{t.subscriptions.paymentDateHeader}</th>
                <th className="p-3.5">{t.subscriptions.paymentMethodHeader}</th>
                <th className="p-3.5">{t.subscriptions.txnRefHeader}</th>
                <th className="p-3.5 text-center">{t.subscriptions.statusHeader}</th>
                <th className="p-3.5 text-right">{t.subscriptions.actionsHeader}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="p-3.5 font-mono font-bold text-blue-600">{inv.invoiceNumber}</td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-xs font-black bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60">
                      {inv.tenantCode || tenantCodeMap[inv.tenantId] || (inv.tenantId ? inv.tenantId.substring(0, 4).toUpperCase() : 'TNT')}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {formatVND(inv.amount)}
                  </td>
                  <td className="p-3.5 text-slate-500">{inv.paymentDate?.split('T')[0] || inv.dueDate}</td>
                  <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">
                    {inv.paymentMethod === 'BANK_TRANSFER' ? t.subscriptions.bankTransfer : t.subscriptions.creditCard}
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-500">{inv.transactionReference}</td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === InvoiceStatus.PAID
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                      }`}
                    >
                      {inv.status === InvoiceStatus.PAID ? t.subscriptions.paidStatus : t.subscriptions.pendingStatus}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    {inv.status !== InvoiceStatus.PAID && (
                      <button
                        type="button"
                        onClick={() => handlePayInvoice(inv.id)}
                        className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-500/20"
                      >
                        {t.subscriptions.payInvoiceBtn}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: NOTIFICATIONS */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            {t.subscriptions.autoNotifDesc}
          </p>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">{t.subscriptions.notifTypeHeader}</th>
                  <th className="p-3.5">{t.subscriptions.tenantIdHeader}</th>
                  <th className="p-3.5">{t.subscriptions.targetHeader}</th>
                  <th className="p-3.5">{t.subscriptions.contentHeader}</th>
                  <th className="p-3.5 text-right">{t.subscriptions.sentAtHeader}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map((notif) => (
                  <tr key={notif.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {notif.notificationType}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-xs font-black bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60">
                        {notif.tenantCode || tenantCodeMap[notif.tenantId] || (notif.tenantId ? notif.tenantId.substring(0, 4).toUpperCase() : 'TNT')}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      <div className="font-semibold">{notif.recipientEmail}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {notif.subscriptionId}</div>
                    </td>
                    <td className="p-3.5 text-slate-800 dark:text-slate-200">
                      <div className="font-bold text-xs">{notif.title}</div>
                      <div className="text-[11px] text-slate-500">{notif.message}</div>
                    </td>
                    <td className="p-3.5 text-right font-mono text-slate-400">
                      {notif.sentAt?.replace('T', ' ').slice(0, 16)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Gia Hạn Hợp Đồng Thuê Bao */}
      {isRenewModalOpen && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {t.subscriptions.renewModalTitle}
              </h3>
              <button
                type="button"
                onClick={() => setIsRenewModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRenewSubmit} className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs space-y-1">
                <div className="text-slate-500">Doanh nghiệp:</div>
                <div className="font-bold text-slate-900 dark:text-white">{selectedSub.tenantName}</div>
                <div className="text-slate-400 font-mono">Mã Tenant: <strong className="text-blue-600 dark:text-blue-400 font-bold">{selectedSub.tenantCode || selectedSub.tenantId}</strong></div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t.subscriptions.selectPlanField}
                </label>
                <select
                  value={renewForm.planId}
                  onChange={(e) => setRenewForm({ ...renewForm, planId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-semibold"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatVND(p.yearlyPrice)} /năm)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.subscriptions.billingCycleField}
                  </label>
                  <select
                    value={renewForm.billingCycle}
                    onChange={(e) =>
                      setRenewForm({ ...renewForm, billingCycle: e.target.value as BillingCycle })
                    }
                    className="w-full px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-semibold"
                  >
                    <option value="YEARLY">{t.subscriptions.yearlyCycle}</option>
                    <option value="MONTHLY">{t.subscriptions.monthlyCycle}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.subscriptions.paymentMethodField}
                  </label>
                  <select
                    value={renewForm.paymentMethod}
                    onChange={(e) => setRenewForm({ ...renewForm, paymentMethod: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-semibold"
                  >
                    <option value="BANK_TRANSFER">{t.subscriptions.bankTransfer}</option>
                    <option value="CREDIT_CARD">{t.subscriptions.creditCard}</option>
                    <option value="QR_CODE">{t.subscriptions.qrPayment}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t.subscriptions.txnRefField}
                </label>
                <input
                  type="text"
                  value={renewForm.transactionReference}
                  onChange={(e) => setRenewForm({ ...renewForm, transactionReference: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRenewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  {t.subscriptions.renewBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Tạo Gói Cước Mới */}
      {isCreatePlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {t.subscriptions.createPlanModalTitle}
              </h3>
              <button
                type="button"
                onClick={() => setIsCreatePlanModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.subscriptions.planCodeField}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: STARTER_2026"
                    value={planCode}
                    onChange={(e) => setPlanCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.subscriptions.planNameField}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Gói Doanh Nghiệp Mới"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.subscriptions.monthlyPriceField}
                  </label>
                  <input
                    type="number"
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.subscriptions.yearlyPriceField}
                  </label>
                  <input
                    type="number"
                    value={yearlyPrice}
                    onChange={(e) => setYearlyPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.subscriptions.maxUsersField}
                  </label>
                  <input
                    type="number"
                    value={maxUsers}
                    onChange={(e) => setMaxUsers(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.subscriptions.maxStorageField}
                  </label>
                  <input
                    type="number"
                    value={maxStorage}
                    onChange={(e) => setMaxStorage(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t.subscriptions.planDescField}
                </label>
                <textarea
                  rows={2}
                  value={planDesc}
                  onChange={(e) => setPlanDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatePlanModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Chỉnh Sửa Gói Cước */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 size={16} className="text-blue-500" />
                <span>Chỉnh Sửa Gói Cước: {editingPlan.code}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdatePlan} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.subscriptions.planCodeField}
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editingPlan.code}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-mono text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.subscriptions.planNameField}
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.subscriptions.monthlyPriceField} (VND)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={100000}
                    value={editingPlan.monthlyPrice}
                    onChange={(e) => setEditingPlan({ ...editingPlan, monthlyPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.subscriptions.yearlyPriceField} (VND)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={100000}
                    value={editingPlan.yearlyPrice}
                    onChange={(e) => setEditingPlan({ ...editingPlan, yearlyPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.subscriptions.maxUsersField}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingPlan.maxUsers}
                    onChange={(e) => setEditingPlan({ ...editingPlan, maxUsers: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.subscriptions.maxStorageField} (GB)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingPlan.maxStorageGb}
                    onChange={(e) => setEditingPlan({ ...editingPlan, maxStorageGb: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t.subscriptions.planDescField}
                </label>
                <textarea
                  rows={2}
                  value={editingPlan.description || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={editingPlan.isActive}
                    onChange={(e) => setEditingPlan({ ...editingPlan, isActive: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Đang hoạt động (Kích hoạt)</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingPlan(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                  >
                    <Save size={14} />
                    <span>{t.common.save}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Xác Nhận Xóa Gói Cước */}
      {deletingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Xác Nhận Xóa Gói Cước</h3>
              <p className="text-xs text-slate-500">
                Bạn có chắc chắn muốn xóa gói cước <strong className="text-slate-900 dark:text-white">{deletingPlan.name}</strong>? Gói cước này sẽ bị hủy kích hoạt.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPlan(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleDeletePlan}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20"
              >
                {t.common.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Chi Tiết Thuê Bao */}
      {viewingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Chi Tiết Hợp Đồng Thuê Bao
              </h3>
              <button
                type="button"
                onClick={() => setViewingSub(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 space-y-1">
                <span className="text-slate-400">Doanh nghiệp khách thuê:</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{viewingSub.tenantName}</div>
                <div className="font-mono text-slate-500">Mã Tenant: <strong className="text-blue-600 dark:text-blue-400 font-bold">{viewingSub.tenantCode || viewingSub.tenantId}</strong></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950">
                  <span className="text-slate-400">Gói dịch vụ:</span>
                  <div className="font-bold text-blue-600">{viewingSub.planName}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950">
                  <span className="text-slate-400">Chu kỳ:</span>
                  <div className="font-bold">{viewingSub.billingCycle}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950">
                  <span className="text-slate-400">Thời hạn:</span>
                  <div className="font-mono font-bold">{viewingSub.startDate} → {viewingSub.endDate}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950">
                  <span className="text-slate-400">Số ngày còn lại:</span>
                  <div className="font-mono font-bold text-emerald-600">{viewingSub.daysRemaining} ngày</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setViewingSub(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Chỉnh Sửa Thuê Bao Doanh Nghiệp */}
      {editingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-500" />
                  <span>Chỉnh Sửa Hợp Đồng Thuê Bao</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Doanh nghiệp: <strong className="text-slate-700 dark:text-slate-200">{editingSub.tenantName}</strong> ({editingSub.tenantCode || editingSub.tenantId})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingSub(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSub} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Gói Dịch Vụ (Plan)</label>
                  <select
                    value={editingSub.planId}
                    onChange={(e) => {
                      const selectedPlan = plans.find((p) => p.id === e.target.value);
                      setEditingSub({
                        ...editingSub,
                        planId: e.target.value,
                        planName: selectedPlan?.name || editingSub.planName,
                        planCode: selectedPlan?.code || editingSub.planCode,
                      });
                    }}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Chu Kỳ Thanh Toán</label>
                  <select
                    value={editingSub.billingCycle}
                    onChange={(e) => setEditingSub({ ...editingSub, billingCycle: e.target.value as BillingCycle })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={BillingCycle.YEARLY}>Theo Năm (Yearly)</option>
                    <option value={BillingCycle.MONTHLY}>Theo Tháng (Monthly)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Ngày Bắt Đầu</label>
                  <input
                    type="date"
                    required
                    value={editingSub.startDate}
                    onChange={(e) => setEditingSub({ ...editingSub, startDate: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Ngày Hết Hạn</label>
                  <input
                    type="date"
                    required
                    value={editingSub.endDate}
                    onChange={(e) => setEditingSub({ ...editingSub, endDate: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Trạng Thái Hợp Đồng</label>
                  <select
                    value={editingSub.status}
                    onChange={(e) => setEditingSub({ ...editingSub, status: e.target.value as SubscriptionStatus })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={SubscriptionStatus.ACTIVE}>Đang Kích Hoạt (ACTIVE)</option>
                    <option value={SubscriptionStatus.EXPIRING_SOON}>Sắp Hết Hạn (EXPIRING_SOON)</option>
                    <option value={SubscriptionStatus.GRACE_PERIOD}>Thời Gian Ân Hạn (GRACE_PERIOD)</option>
                    <option value={SubscriptionStatus.SUSPENDED}>Tạm Khóa (SUSPENDED)</option>
                    <option value={SubscriptionStatus.CANCELLED}>Đã Hủy (CANCELLED)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Số Ngày Ân Hạn</label>
                  <input
                    type="number"
                    min={0}
                    max={90}
                    value={editingSub.gracePeriodDays}
                    onChange={(e) => setEditingSub({ ...editingSub, gracePeriodDays: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Tự Động Gia Hạn (Auto-Renew)</span>
                  <p className="text-[11px] text-slate-400">Tự sinh hóa đơn khi hết hạn chu kỳ hợp đồng</p>
                </div>
                <input
                  type="checkbox"
                  checked={editingSub.autoRenew}
                  onChange={(e) => setEditingSub({ ...editingSub, autoRenew: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSub(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
