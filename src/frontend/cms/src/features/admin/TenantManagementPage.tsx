'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../shared/i18n';
import { DataTable, Column } from '../../shared/components/DataTable';
import {
  Building2,
  Plus,
  X,
  Edit3,
  Trash2,
  Search,
  AlertTriangle,
  Users,
  Briefcase,
  ShieldCheck,
  CreditCard,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { TenantAccount } from '../../shared/types';
import { adminService } from '../../services/adminService';

export function TenantManagementPage() {
  const { t } = useTranslation();
  const [tenants, setTenants] = useState<TenantAccount[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('ALL');

  // Modals state for Tenants
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [viewingTenant, setViewingTenant] = useState<TenantAccount | null>(null);
  const [editingTenant, setEditingTenant] = useState<TenantAccount | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<TenantAccount | null>(null);

  // Form states for Create Tenant
  const [newTenantCode, setNewTenantCode] = useState('');
  const [newTenantName, setNewTenantName] = useState('');
  const [newTaxCode, setNewTaxCode] = useState('');
  const [newPlan, setNewPlan] = useState('Enterprise Tier');

  useEffect(() => {
    adminService.getTenants().then((data) => setTenants(data));
  }, []);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantCode || !newTenantName) return;

    const created = await adminService.addTenant({
      tenantCode: newTenantCode.toUpperCase(),
      tenantName: newTenantName,
      taxCode: newTaxCode,
      subscriptionPlan: newPlan,
    });

    setTenants([created, ...tenants]);
    setIsTenantModalOpen(false);
    setNewTenantCode('');
    setNewTenantName('');
    setNewTaxCode('');
  };

  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;

    const updated = await adminService.updateTenant(editingTenant.id, editingTenant);
    setTenants(tenants.map((t) => (t.id === updated.id ? updated : t)));
    setEditingTenant(null);
  };

  const handleDeleteTenant = async () => {
    if (!deletingTenant) return;
    await adminService.deleteTenant(deletingTenant.id);
    setTenants(tenants.filter((t) => t.id !== deletingTenant.id));
    setSelectedIds(selectedIds.filter((id) => id !== deletingTenant.id));
    setDeletingTenant(null);
  };

  const filteredTenants = tenants
    .filter((t) => (selectedPlanFilter === 'ALL' ? true : t.subscriptionPlan.includes(selectedPlanFilter)))
    .filter(
      (t) =>
        t.tenantCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.taxCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const totalUsers = tenants.reduce((acc, curr) => acc + curr.userCount, 0);
  const totalProjects = tenants.reduce((acc, curr) => acc + curr.activeProjects, 0);

  const tenantColumns: Column<TenantAccount>[] = [
    {
      key: 'tenantCode',
      header: t.admin.tenantCode,
      width: '180px',
      render: (item) => (
        <button
          type="button"
          onClick={() => setViewingTenant(item)}
          className="font-mono text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 text-left cursor-pointer transition-colors whitespace-nowrap"
        >
          {item.tenantCode}
        </button>
      ),
    },
    {
      key: 'tenantName',
      header: t.admin.tenantName,
      render: (item) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">{item.tenantName}</p>
          <p className="text-xs text-slate-400 font-mono">{t.admin.taxCodePrefix} {item.taxCode}</p>
        </div>
      ),
    },
    {
      key: 'subscriptionPlan',
      header: t.admin.plan,
      width: '180px',
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60">
          {item.subscriptionPlan}
        </span>
      ),
    },
    {
      key: 'userCount',
      header: t.admin.userCountHeader,
      width: '140px',
      align: 'center',
      render: (item) => (
        <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 font-mono">
          {item.userCount} {t.common.members}
        </span>
      ),
    },
    {
      key: 'activeProjects',
      header: t.admin.activeProjectsHeader,
      width: '140px',
      align: 'center',
      render: (item) => (
        <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 font-mono">
          {item.activeProjects} {t.common.packages}
        </span>
      ),
    },
    {
      key: 'status',
      header: t.common.status,
      width: '140px',
      align: 'center',
      render: (item) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{t.common.activeStatus}</span>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span>{t.admin.tenantTitle}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.admin.tenantSubtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsTenantModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.admin.addTenant}</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Tổng Doanh Nghiệp</span>
            <Building className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{tenants.length}</p>
          <p className="text-[11px] text-emerald-600 font-medium">100% Đang hoạt động</p>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Tổng Nhân Sự</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalUsers}</p>
          <p className="text-[11px] text-slate-400 font-medium">Thành viên trên hệ thống</p>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Gói Thầu Đang Dự</span>
            <Briefcase className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalProjects}</p>
          <p className="text-[11px] text-purple-600 font-medium">Gói thầu phân bổ các Tenant</p>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Bảo Mật & Cách Ly</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">Multi-tenant RLS</p>
          <p className="text-[11px] text-slate-400 font-medium">Cô lập Schema & Tenant ID</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã doanh nghiệp, tên công ty, MST..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-400 font-semibold whitespace-nowrap">Gói cước:</label>
          <select
            value={selectedPlanFilter}
            onChange={(e) => setSelectedPlanFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 shadow-2xs hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          >
            <option value="ALL">Tất cả gói</option>
            <option value="Enterprise">Enterprise Tier</option>
            <option value="Professional">Professional Tier</option>
            <option value="Starter">Starter Tier</option>
          </select>
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable<TenantAccount>
        columns={tenantColumns}
        data={filteredTenants}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        renderActions={(item) => (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setEditingTenant({ ...item })}
              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors"
              title={t.common.edit}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeletingTenant(item)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
              title={t.common.delete}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* Modal 1: Add Tenant Modal */}
      {isTenantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>{t.admin.addTenant}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsTenantModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.admin.tenantCode}</label>
                <input
                  type="text"
                  required
                  placeholder="VD: VIETTEL_SOLUTIONS"
                  value={newTenantCode}
                  onChange={(e) => setNewTenantCode(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.admin.tenantName}</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Tổng Công ty Giải pháp Doanh nghiệp Viettel"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mã Số Thuế (MST)</label>
                <input
                  type="text"
                  placeholder="VD: 0100109106"
                  value={newTaxCode}
                  onChange={(e) => setNewTaxCode(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Gói Thuê Bao SaaS</label>
                <select
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium"
                >
                  <option value="Enterprise Tier">Enterprise Tier</option>
                  <option value="Professional Tier">Professional Tier</option>
                  <option value="Starter Tier">Starter Tier</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTenantModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: View Detail Tenant Modal */}
      {viewingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded border border-blue-200/80 dark:border-blue-800">
                  {viewingTenant.tenantCode}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">
                  {viewingTenant.tenantName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingTenant(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">Mã Số Thuế</span>
                <p className="text-xs font-mono font-bold text-slate-900 dark:text-white">{viewingTenant.taxCode}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">Gói Thuê Bao</span>
                <p className="text-xs font-bold text-purple-600 dark:text-purple-400">{viewingTenant.subscriptionPlan}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">Tổng Số Thành Viên</span>
                <p className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">{viewingTenant.userCount} người dùng</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">Gói Thầu Đang Chạy</span>
                <p className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">{viewingTenant.activeProjects} gói thầu</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setEditingTenant({ ...viewingTenant });
                  setViewingTenant(null);
                }}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 hover:bg-blue-100"
              >
                {t.common.edit}
              </button>
              <button
                type="button"
                onClick={() => setViewingTenant(null)}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Edit Tenant Modal */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Chỉnh Sửa Doanh Nghiệp</h3>
              <button
                type="button"
                onClick={() => setEditingTenant(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTenant} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.admin.tenantCode}</label>
                <input
                  type="text"
                  disabled
                  value={editingTenant.tenantCode}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.admin.tenantName}</label>
                <input
                  type="text"
                  required
                  value={editingTenant.tenantName}
                  onChange={(e) => setEditingTenant({ ...editingTenant, tenantName: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mã Số Thuế (MST)</label>
                <input
                  type="text"
                  value={editingTenant.taxCode}
                  onChange={(e) => setEditingTenant({ ...editingTenant, taxCode: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Gói Thuê Bao SaaS</label>
                <select
                  value={editingTenant.subscriptionPlan}
                  onChange={(e) => setEditingTenant({ ...editingTenant, subscriptionPlan: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium"
                >
                  <option value="Enterprise Tier">Enterprise Tier</option>
                  <option value="Professional Tier">Professional Tier</option>
                  <option value="Starter Tier">Starter Tier</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Delete Tenant Modal */}
      {deletingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Xác Nhận Xóa Doanh Nghiệp</h3>
                <p className="text-xs text-slate-500">Toàn bộ dữ liệu thành viên và gói thầu sẽ bị ảnh hưởng</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Bạn có chắc chắn muốn xóa doanh nghiệp <strong className="text-slate-900 dark:text-white">{deletingTenant.tenantName}</strong> ({deletingTenant.tenantCode})?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingTenant(null)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleDeleteTenant}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20"
              >
                {t.common.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
