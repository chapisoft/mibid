'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../shared/i18n';
import { DataTable, Column } from '../../shared/components/DataTable';
import { Building2, Users, Plus, Shield, X, Edit3, Trash2, Search, AlertTriangle, CheckCircle, Mail, Phone, Lock } from 'lucide-react';
import { Department, TenantAccount, UserAccount, UserRole } from '../../shared/types';
import { DEPARTMENT_LIST, ROLE_LIST } from '../../shared/constants';
import { adminService } from '../../services/adminService';

export function TenantUserManagementPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'users' | 'tenants'>('users');
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [tenants, setTenants] = useState<TenantAccount[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state for Users
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<UserAccount | null>(null);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserAccount | null>(null);

  // Form states for Create User
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>(UserRole.BID_MANAGER);
  const [newDept, setNewDept] = useState<Department>(Department.COMMERCIAL);

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
    adminService.getUsers().then((data) => setUsers(data));
    adminService.getTenants().then((data) => setTenants(data));
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newFullName) return;

    const created = await adminService.addUser({
      username: newUsername,
      fullName: newFullName,
      email: newEmail || `${newUsername}@mibid.vn`,
      role: newRole,
      department: newDept,
    });

    setUsers([created, ...users]);
    setIsUserModalOpen(false);
    setNewUsername('');
    setNewFullName('');
    setNewEmail('');
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updated = await adminService.updateUser(editingUser.id, editingUser);
    setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
    setEditingUser(null);
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    await adminService.deleteUser(deletingUser.id);
    setUsers(users.filter((u) => u.id !== deletingUser.id));
    setSelectedIds(selectedIds.filter((id) => id !== deletingUser.id));
    setDeletingUser(null);
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantCode || !newTenantName) return;

    const newT: TenantAccount = {
      id: `tenant-${Date.now()}`,
      tenantCode: newTenantCode,
      tenantName: newTenantName,
      taxCode: newTaxCode || '0100100079',
      subscriptionPlan: newPlan,
      userCount: 1,
      activeProjects: 0,
      status: 'ACTIVE',
    };

    setTenants([newT, ...tenants]);
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

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTenants = tenants.filter(
    (t) =>
      t.tenantCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.taxCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userColumns: Column<UserAccount>[] = [
    {
      key: 'username',
      header: t.admin.username,
      width: '160px',
      render: (item) => (
        <button
          type="button"
          onClick={() => setViewingUser(item)}
          className="font-mono text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 text-left cursor-pointer transition-colors"
        >
          {item.username}
        </button>
      ),
    },
    {
      key: 'fullName',
      header: t.admin.fullName,
      render: (item) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">{item.fullName}</p>
          <p className="text-xs text-slate-400">{item.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: t.admin.role,
      width: '240px',
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
          {t.roles[item.role] || item.role}
        </span>
      ),
    },
    {
      key: 'department',
      header: t.common.department,
      width: '180px',
      render: (item) => (
        <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
          {t.departments[item.department] || item.department}
        </span>
      ),
    },
    {
      key: 'status',
      header: t.common.status,
      width: '130px',
      align: 'center',
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap border shadow-2xs ${
            item.status === 'INACTIVE'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300'
              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
          }`}
        >
          {item.status === 'INACTIVE' ? 'Tạm khóa' : t.common.activeStatus}
        </span>
      ),
    },
  ];

  const tenantColumns: Column<TenantAccount>[] = [
    {
      key: 'tenantCode',
      header: t.admin.tenantCode,
      width: '150px',
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
          <p className="text-xs text-slate-400">{t.admin.taxCodePrefix} {item.taxCode}</p>
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
      width: '120px',
      align: 'center',
      render: (item) => (
        <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
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
        <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
          {item.activeProjects} {t.common.packages}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {activeTab === 'users' ? t.admin.userTitle : t.admin.tenantTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {activeTab === 'users' ? t.admin.userSubtitle : t.admin.tenantSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-full bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'users'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.nav.users}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tenants')}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'tenants'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.nav.tenants}
            </button>
          </div>

          <button
            type="button"
            onClick={() => (activeTab === 'users' ? setIsUserModalOpen(true) : setIsTenantModalOpen(true))}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{activeTab === 'users' ? t.admin.addUser : t.admin.addTenant}</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeTab === 'users' ? 'Tìm theo họ tên, tài khoản, email...' : 'Tìm theo mã doanh nghiệp, tên công ty, MST...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main DataTable */}
      {activeTab === 'users' ? (
        <DataTable<UserAccount>
          columns={userColumns}
          data={filteredUsers}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          renderActions={(item) => (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setEditingUser({ ...item })}
                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors"
                title={t.common.edit}
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setDeletingUser(item)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
                title={t.common.delete}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />
      ) : (
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
      )}

      {/* Modal 1: Add User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.admin.addUser}</h3>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.admin.username}</label>
                <input
                  type="text"
                  required
                  placeholder="VD: minh.pt"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.admin.fullName}</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Phạm Minh Tuấn"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Doanh Nghiệp</label>
                <input
                  type="email"
                  placeholder="VD: tuan.pm@mibid.vn"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.admin.role}</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-semibold"
                  >
                    {ROLE_LIST.map((r) => (
                      <option key={r} value={r}>
                        {t.roles[r] || r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phòng Ban</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value as Department)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-semibold"
                  >
                    {DEPARTMENT_LIST.map((d) => (
                      <option key={d} value={d}>
                        {t.departments[d] || d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
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

      {/* Modal 2: View Detail User Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded border border-blue-200/80 dark:border-blue-800">
                  @{viewingUser.username}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">
                  {viewingUser.fullName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">Địa Chỉ Email</span>
                <p className="text-xs font-mono font-bold text-slate-900 dark:text-white break-all">{viewingUser.email}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">Trạng Thái Tài Khoản</span>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {viewingUser.status === 'INACTIVE' ? 'Tạm khóa' : 'Đang hoạt động'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">Vai Trò Hệ Thống</span>
                <p className="text-xs font-bold text-blue-700 dark:text-blue-300">{t.roles[viewingUser.role] || viewingUser.role}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">Phòng Ban Phụ Trách</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t.departments[viewingUser.department] || viewingUser.department}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setEditingUser({ ...viewingUser });
                  setViewingUser(null);
                }}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 hover:bg-blue-100"
              >
                {t.common.edit}
              </button>
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Chỉnh Sửa Tài Khoản</h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.admin.username}</label>
                <input
                  type="text"
                  disabled
                  value={editingUser.username}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.admin.fullName}</label>
                <input
                  type="text"
                  required
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Doanh Nghiệp</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.admin.role}</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-semibold"
                  >
                    {ROLE_LIST.map((r) => (
                      <option key={r} value={r}>
                        {t.roles[r] || r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phòng Ban</label>
                  <select
                    value={editingUser.department}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value as Department })}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-semibold"
                  >
                    {DEPARTMENT_LIST.map((d) => (
                      <option key={d} value={d}>
                        {t.departments[d] || d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Trạng Thái Tài Khoản</label>
                <select
                  value={editingUser.status || 'ACTIVE'}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-semibold"
                >
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="INACTIVE">Tạm khóa</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
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

      {/* Modal 4: Delete User Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Xác Nhận Xóa Tài Khoản</h3>
                <p className="text-xs text-slate-500">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Bạn có chắc chắn muốn xóa tài khoản người dùng <strong className="text-slate-900 dark:text-white">{deletingUser.fullName}</strong> (@{deletingUser.username})?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20"
              >
                {t.common.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Add Tenant Modal */}
      {isTenantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.admin.addTenant}</h3>
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
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-semibold"
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

      {/* Modal 6: View Detail Tenant Modal */}
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

      {/* Modal 7: Edit Tenant Modal */}
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
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-semibold"
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

      {/* Modal 8: Delete Tenant Modal */}
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
