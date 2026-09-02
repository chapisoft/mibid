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
  Building,
  CheckCircle2,
  UserPlus,
  Sparkles,
  Check,
} from 'lucide-react';
import { TenantAccount, UserRole, SubscriptionPlan } from '../../shared/types';
import { adminService } from '../../services/adminService';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../../shared/toast/ToastContext';

interface TenantMemberData {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  department?: string;
  position?: string;
  status: string;
  default?: boolean;
}

interface TenantMembersResponse {
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  planCode: string;
  planName: string;
  currentUserCount: number;
  maxUsers: number;
  quotaExceeded: boolean;
  members: TenantMemberData[];
}

export function TenantManagementPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [tenants, setTenants] = useState<TenantAccount[]>([]);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('ALL');

  // Modals state for Tenants
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [viewingTenant, setViewingTenant] = useState<TenantAccount | null>(null);
  const [editingTenant, setEditingTenant] = useState<TenantAccount | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<TenantAccount | null>(null);

  // States cho Thành viên & Quota Hạn mức
  const [membersData, setMembersData] = useState<TenantMembersResponse | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Form states cho thêm Thành viên - KHỞI TẠO RỖNG, ZERO-HARDCODE
  const [newMemberFullName, setNewMemberFullName] = useState('');
  const [newMemberUsername, setNewMemberUsername] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<UserRole>(UserRole.BID_MANAGER);
  const [newMemberDept, setNewMemberDept] = useState('');
  const [newMemberPos, setNewMemberPos] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Form states for Create Tenant - KHỞI TẠO RỖNG, ZERO-HARDCODE
  const [newTenantCode, setNewTenantCode] = useState('');
  const [newTenantName, setNewTenantName] = useState('');
  const [newTaxCode, setNewTaxCode] = useState('');
  const [newPlan, setNewPlan] = useState<string>('');

  useEffect(() => {
    adminService.getTenants().then(setTenants);
    adminService.getSubscriptionPlans().then((plans) => {
      setAvailablePlans(plans);
      if (plans.length > 0) {
        setNewPlan(plans[0].name);
      }
    });
  }, []);

  const loadTenantMembers = async (tenantId: string) => {
    setLoadingMembers(true);
    try {
      const res = await apiClient.get<TenantMembersResponse>(`/tenants/${tenantId}/members`);
      setMembersData(res);
    } catch {
      setMembersData(null);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleOpenViewingTenant = (tenantItem: TenantAccount) => {
    setViewingTenant(tenantItem);
    loadTenantMembers(tenantItem.id);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingTenant || !newMemberUsername.trim() || !newMemberFullName.trim()) return;

    if (membersData && membersData.currentUserCount >= membersData.maxUsers) {
      showToast(
        t.admin.quotaExceededDesc
          ? t.admin.quotaExceededDesc.replace('{max}', String(membersData.maxUsers))
          : `Doanh nghiệp đã đạt tối đa ${membersData.maxUsers} người dùng. Vui lòng nâng cấp gói để tiếp tục!`,
        'error'
      );
      setIsUpgradeModalOpen(true);
      return;
    }

    setAddingMember(true);
    try {
      const generatedEmail =
        newMemberEmail.trim() ||
        `${newMemberUsername.trim().toLowerCase()}@${viewingTenant.tenantCode.toLowerCase()}.mibid.vn`;

      await apiClient.post(`/tenants/${viewingTenant.id}/members`, {
        fullName: newMemberFullName.trim(),
        username: newMemberUsername.trim().toLowerCase(),
        email: generatedEmail,
        role: newMemberRole,
        department: newMemberDept.trim(),
        position: newMemberPos.trim(),
      });

      showToast(
        `${t.admin.saveMember || 'Lưu thành công'}: ${newMemberFullName}`,
        'success'
      );
      setIsAddMemberModalOpen(false);
      setNewMemberFullName('');
      setNewMemberUsername('');
      setNewMemberEmail('');
      setNewMemberDept('');
      setNewMemberPos('');
      await loadTenantMembers(viewingTenant.id);

      const updatedTenants = await adminService.getTenants();
      setTenants(updatedTenants);
    } catch (err: any) {
      const msg = err?.message || 'Không thể thêm thành viên';
      showToast(msg, 'error');
      if (msg.includes('đạt giới hạn') || msg.includes('nâng cấp gói') || msg.includes('Quota')) {
        setIsUpgradeModalOpen(true);
      }
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId: string, memberName: string) => {
    if (!viewingTenant) return;
    const confirmMsg = `${t.common.delete || 'Xóa'} thành viên ${memberName}?`;
    if (typeof window !== 'undefined' && !window.confirm(confirmMsg)) return;

    setDeletingUserId(userId);
    try {
      await apiClient.delete(`/tenants/${viewingTenant.id}/members/${userId}`);
      showToast(`${t.common.delete || 'Đã xóa'}: ${memberName}`, 'success');
      await loadTenantMembers(viewingTenant.id);

      const updatedTenants = await adminService.getTenants();
      setTenants(updatedTenants);
    } catch (err: any) {
      showToast(err?.message || 'Không thể xóa thành viên', 'error');
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleUpgradePlan = (targetPlan: SubscriptionPlan) => {
    if (!viewingTenant) return;
    showToast(
      `${t.admin.upgradeNow || 'Nâng cấp'}: ${targetPlan.name} (${targetPlan.maxUsers} ${t.admin.userCountHeader || 'thành viên'})`,
      'success'
    );
    setIsUpgradeModalOpen(false);
    setTenants((prev) =>
      prev.map((tItem) => (tItem.id === viewingTenant.id ? { ...tItem, subscriptionPlan: targetPlan.name } : tItem))
    );
    setViewingTenant((prev) => (prev ? { ...prev, subscriptionPlan: targetPlan.name } : null));
    if (membersData) {
      setMembersData({
        ...membersData,
        planCode: targetPlan.code,
        planName: targetPlan.name,
        maxUsers: targetPlan.maxUsers,
        quotaExceeded: membersData.currentUserCount > targetPlan.maxUsers,
      });
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantCode.trim() || !newTenantName.trim()) return;

    const created = await adminService.addTenant({
      tenantCode: newTenantCode.trim().toUpperCase(),
      tenantName: newTenantName.trim(),
      taxCode: newTaxCode.trim(),
      subscriptionPlan: newPlan,
    });

    setTenants([created, ...tenants]);
    setIsTenantModalOpen(false);
    setNewTenantCode('');
    setNewTenantName('');
    setNewTaxCode('');
    showToast(t.common.save, 'success');
  };

  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;

    const updated = await adminService.updateTenant(editingTenant.id, editingTenant);
    setTenants(tenants.map((tItem) => (tItem.id === updated.id ? updated : tItem)));
    setEditingTenant(null);
    showToast(t.common.save, 'success');
  };

  const handleDeleteTenant = async () => {
    if (!deletingTenant) return;
    await adminService.deleteTenant(deletingTenant.id);
    setTenants(tenants.filter((tItem) => tItem.id !== deletingTenant.id));
    setSelectedIds(selectedIds.filter((id) => id !== deletingTenant.id));
    setDeletingTenant(null);
    showToast(t.common.delete, 'success');
  };

  const filteredTenants = tenants
    .filter((tItem) => (selectedPlanFilter === 'ALL' ? true : tItem.subscriptionPlan.includes(selectedPlanFilter)))
    .filter(
      (tItem) =>
        tItem.tenantCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tItem.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tItem.taxCode.toLowerCase().includes(searchQuery.toLowerCase())
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
          onClick={() => handleOpenViewingTenant(item)}
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
      width: '200px',
      render: (item) => {
        const planText = item.subscriptionPlan || 'Gói Khởi Động Đấu Thầu (Starter)';
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60">
            {planText}
          </span>
        );
      },
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
      render: () => (
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
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.admin.addTenant}</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>{t.admin.totalTenants}</span>
            <Building className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{tenants.length}</p>
          <p className="text-[11px] text-emerald-600 font-medium">{t.admin.activeTenantsRate}</p>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>{t.admin.totalUsers}</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalUsers}</p>
          <p className="text-[11px] text-slate-400 font-medium">{t.admin.totalUsersDesc}</p>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>{t.admin.totalProjects}</span>
            <Briefcase className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalProjects}</p>
          <p className="text-[11px] text-purple-600 font-medium">{t.admin.totalProjectsDesc}</p>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>{t.admin.securityRls}</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{t.admin.securityRlsTitle}</p>
          <p className="text-[11px] text-slate-400 font-medium">{t.admin.securityRlsDesc}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.admin.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-400 font-semibold whitespace-nowrap">{t.admin.planFilter}</label>
          <select
            value={selectedPlanFilter}
            onChange={(e) => setSelectedPlanFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 shadow-2xs hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          >
            <option value="ALL">{t.admin.allPlans}</option>
            {availablePlans.map((p) => (
              <option key={p.id} value={p.code}>
                {p.name}
              </option>
            ))}
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
              onClick={() => handleOpenViewingTenant(item)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={t.common.viewDetails}
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setEditingTenant({ ...item })}
              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={t.common.edit}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeletingTenant(item)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
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
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.admin.taxCodeLabel}</label>
                <input
                  type="text"
                  value={newTaxCode}
                  onChange={(e) => setNewTaxCode(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.admin.saasPlanLabel}</label>
                <select
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                >
                  {availablePlans.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTenantModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: View Detail Tenant Modal with Member Management & Quota */}
      {viewingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
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
                onClick={() => {
                  setViewingTenant(null);
                  setMembersData(null);
                }}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Thẻ Thông tin tổng quan */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block">{t.admin.taxCode}</span>
                  <p className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                    {viewingTenant.taxCode || '—'}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block">{t.admin.plan}</span>
                  <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-0.5 truncate">
                    {membersData?.planName || viewingTenant.subscriptionPlan}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block">{t.admin.activeProjectsHeader}</span>
                  <p className="text-xs font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                    {viewingTenant.activeProjects} {t.common.packages}
                  </p>
                </div>
              </div>

              {/* KHỐI QUOTA HẠN MỨC NGƯỜI DÙNG */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {t.admin.memberQuota}
                    </span>
                  </div>
                  <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full ${
                    membersData?.quotaExceeded
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    {membersData
                      ? `${membersData.currentUserCount} / ${membersData.maxUsers} ${t.admin.userCountHeader}`
                      : `${viewingTenant.userCount} ${t.admin.userCountHeader}`}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      membersData?.quotaExceeded ? 'bg-rose-500' : 'bg-blue-600'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(
                          ((membersData?.currentUserCount ?? viewingTenant.userCount) /
                            (membersData?.maxUsers ?? 10)) *
                            100
                        )
                      )}%`,
                    }}
                  />
                </div>

                {/* Cảnh báo Quota Exceeded */}
                {membersData?.quotaExceeded && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 flex items-start justify-between gap-3 animate-in fade-in">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
                          {t.admin.quotaExceededTitle}
                        </p>
                        <p className="text-[11px] text-rose-600/90 dark:text-rose-400">
                          {t.admin.quotaExceededDesc.replace('{max}', String(membersData.maxUsers))}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsUpgradeModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shrink-0 cursor-pointer shadow-sm transition-all"
                    >
                      {t.admin.upgradeNow}
                    </button>
                  </div>
                )}
              </div>

              {/* KHỐI DANH SÁCH THÀNH VIÊN */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    {t.admin.memberList} ({membersData?.members.length ?? viewingTenant.userCount})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      if (membersData?.quotaExceeded) {
                        showToast(
                          t.admin.quotaExceededDesc.replace('{max}', String(membersData.maxUsers)),
                          'error'
                        );
                        setIsUpgradeModalOpen(true);
                      } else {
                        setIsAddMemberModalOpen((prev) => !prev);
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer shadow-sm transition-all ${
                      isAddMemberModalOpen
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isAddMemberModalOpen ? (
                      <>
                        <X className="w-3.5 h-3.5" />
                        <span>{t.common.cancel}</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>{t.admin.addMember}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* FORM THÊM THÀNH VIÊN TRỰC TIẾP (INLINE FORM CARD) */}
                {isAddMemberModalOpen && (
                  <form
                    onSubmit={handleAddMember}
                    className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-3 animate-in fade-in duration-150"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-blue-100 dark:border-blue-900/40">
                      <span className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                        <UserPlus className="w-4 h-4 text-blue-600" />
                        <span>{t.admin.addMember} — {viewingTenant.tenantCode}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAddMemberModalOpen(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {t.admin.memberFullName} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newMemberFullName}
                          onChange={(e) => setNewMemberFullName(e.target.value)}
                          placeholder="Ví dụ: Nguyễn Văn A"
                          className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {t.admin.memberUsername} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newMemberUsername}
                          onChange={(e) => setNewMemberUsername(e.target.value.toLowerCase())}
                          placeholder="nguyenvana"
                          className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {t.admin.memberEmail}
                        </label>
                        <input
                          type="email"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          placeholder={`${newMemberUsername ? newMemberUsername : 'user'}@${viewingTenant.tenantCode.toLowerCase()}.mibid.vn`}
                          className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {t.admin.memberRole}
                        </label>
                        <select
                          value={newMemberRole}
                          onChange={(e) => setNewMemberRole(e.target.value as UserRole)}
                          className="w-full h-9 px-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
                        >
                          {Object.values(UserRole).map((role) => (
                            <option key={role} value={role}>
                              {(t.roles as Record<string, string>)[role] || role}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {t.admin.memberDept}
                        </label>
                        <input
                          type="text"
                          value={newMemberDept}
                          onChange={(e) => setNewMemberDept(e.target.value)}
                          placeholder="Phòng Đấu Thầu"
                          className="w-full h-9 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-100 dark:border-blue-900/40">
                      <button
                        type="button"
                        onClick={() => setIsAddMemberModalOpen(false)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        {t.common.cancel}
                      </button>
                      <button
                        type="submit"
                        disabled={addingMember}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
                      >
                        {addingMember ? '...' : t.admin.saveMember}
                      </button>
                    </div>
                  </form>
                )}

                {loadingMembers ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    {t.admin.loadingMembers}
                  </div>
                ) : membersData && membersData.members.length > 0 ? (
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
                    {membersData.members.map((member) => (
                      <div key={member.userId} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                            {member.fullName ? member.fullName.split(' ').pop()?.charAt(0) : 'U'}
                          </div>
                          <div className="min-w-0 truncate">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {member.fullName}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              @{member.username} {member.email ? `• ${member.email}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                            {(t.roles as Record<string, string>)[member.role] || member.role}
                          </span>
                          <span className="text-[11px] text-emerald-600 font-semibold hidden sm:inline">
                            {t.common.activeStatus}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member.userId, member.fullName)}
                            disabled={deletingUserId === member.userId}
                            className="p-1.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer disabled:opacity-50"
                            title={t.common.delete || 'Xóa thành viên'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    {t.admin.noMembers}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-slate-950/50">
              <button
                type="button"
                onClick={() => {
                  setViewingTenant(null);
                  setMembersData(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 cursor-pointer"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Bảng Giá Đề Nghị Nâng Gói Thuê Bao - LẤY 100% TỪ CSDL */}
      {isUpgradeModalOpen && viewingTenant && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-150"
          style={{ zIndex: 9999 }}
        >
          <div className="w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span>{t.admin.upgradeModalTitle}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t.admin.upgradeModalSubtitle} cho {viewingTenant.tenantName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsUpgradeModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availablePlans.map((plan) => {
                const isSelectedCurrent = (membersData?.planCode || viewingTenant.subscriptionPlan).toLowerCase().includes(plan.code.toLowerCase());
                const isPopular = plan.code === 'PROFESSIONAL';

                return (
                  <div
                    key={plan.id}
                    className={`p-4 rounded-2xl space-y-3 flex flex-col justify-between ${
                      isPopular
                        ? 'border-2 border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 shadow-lg'
                        : 'border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
                    }`}
                  >
                    <div className="space-y-2">
                      <span className={`text-xs font-bold uppercase tracking-wider ${isPopular ? 'text-blue-600' : 'text-slate-500'}`}>
                        {plan.code}
                      </span>
                      <p className="text-base font-black text-slate-900 dark:text-white leading-tight">
                        {plan.name}
                      </p>
                      <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.monthlyPrice)} / tháng
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {plan.description}
                      </p>
                      <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>Tối đa {plan.maxUsers} {t.admin.userCountHeader}</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{plan.maxStorageGb} GB dung lượng lưu trữ</span>
                        </li>
                      </ul>
                    </div>
                    <button
                      type="button"
                      disabled={isSelectedCurrent}
                      onClick={() => handleUpgradePlan(plan)}
                      className={`w-full py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        isSelectedCurrent
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                          : isPopular
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                          : 'border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {isSelectedCurrent
                        ? 'Gói Hiện Tại'
                        : t.admin.upgradeThisPlan}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Edit Tenant Modal */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.admin.editTenantTitle}
              </h3>
              <button
                type="button"
                onClick={() => setEditingTenant(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
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
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-mono font-bold opacity-70 cursor-not-allowed uppercase"
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
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.admin.taxCodeLabel}</label>
                <input
                  type="text"
                  value={editingTenant.taxCode}
                  onChange={(e) => setEditingTenant({ ...editingTenant, taxCode: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.admin.saasPlanLabel}</label>
                <select
                  value={editingTenant.subscriptionPlan}
                  onChange={(e) => setEditingTenant({ ...editingTenant, subscriptionPlan: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                >
                  {availablePlans.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 cursor-pointer"
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
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.common.confirm}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t.admin.deleteTenantConfirm
                    ? t.admin.deleteTenantConfirm.replace('{code}', deletingTenant.tenantCode)
                    : `Xóa vĩnh viễn doanh nghiệp ${deletingTenant.tenantCode}?`}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingTenant(null)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleDeleteTenant}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 cursor-pointer"
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
