'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../shared/i18n';
import { DataTable, Column } from '../../shared/components/DataTable';
import {
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle,
  Calendar,
  User,
  DollarSign,
  Briefcase,
  Layers3,
  Building,
  Scale,
} from 'lucide-react';
import { Currency, TenderProject, TenderStage, TenderStatus, TenderType } from '../../shared/types';
import { tenderService } from '../../services/tenderService';

export function ProjectManagementPage() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<TenderProject[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTenderType, setFilterTenderType] = useState<string>('ALL');
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingProject, setViewingProject] = useState<TenderProject | null>(null);
  const [editingProject, setEditingProject] = useState<TenderProject | null>(null);
  const [deletingProject, setDeletingProject] = useState<TenderProject | null>(null);

  // Form states for Create
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newInvestor, setNewInvestor] = useState('');
  const [newTenderType, setNewTenderType] = useState<TenderType>(TenderType.TENANT_PARTICIPATING);
  const [newBudget, setNewBudget] = useState(30000000000);
  const [newDeadline, setNewDeadline] = useState('2026-10-15 17:00');
  const [newBidManager, setNewBidManager] = useState('Nguyễn Văn Hùng');

  const formatNumberString = (val: number | string | undefined) => {
    if (val === undefined || val === null || val === '') return '';
    const num = typeof val === 'number' ? val : Number(val.toString().replace(/,/g, ''));
    return isNaN(num) ? '' : num.toLocaleString('en-US');
  };

  const parseFormattedNumber = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    return clean ? Number(clean) : 0;
  };

  useEffect(() => {
    tenderService.getProjects().then((data) => setProjects(data));
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) return;

    const created = await tenderService.createProject({
      projectCode: newCode,
      projectName: newName,
      investorName: newInvestor || 'Tập đoàn Điện lực Việt Nam',
      tenderType: newTenderType,
      budgetAmount: newBudget,
      budgetCurrency: Currency.VND,
      submissionDeadline: newDeadline || '2026-10-15 17:00',
      bidManagerName: newBidManager || 'Nguyễn Văn Hùng',
    });

    setProjects([created, ...projects]);
    setIsCreateModalOpen(false);
    setNewCode('');
    setNewName('');
    setNewInvestor('');
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    const updated = await tenderService.updateProject(editingProject.id, editingProject);
    setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
    setEditingProject(null);
  };

  const handleDeleteProject = async () => {
    if (!deletingProject) return;

    await tenderService.deleteProject(deletingProject.id);
    setProjects(projects.filter((p) => p.id !== deletingProject.id));
    setSelectedIds(selectedIds.filter((id) => id !== deletingProject.id));
    setDeletingProject(null);
  };

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        p.projectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.investorName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType =
        filterTenderType === 'ALL' || p.tenderType === filterTenderType;

      return matchSearch && matchType;
    });
  }, [projects, searchQuery, filterTenderType]);

  const columns: Column<TenderProject>[] = [
    {
      key: 'projectCode',
      header: t.tenders.projectCode,
      width: '160px',
      render: (item) => (
        <button
          type="button"
          onClick={() => setViewingProject(item)}
          className="font-mono text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 text-left cursor-pointer transition-colors"
        >
          {item.projectCode}
        </button>
      ),
    },
    {
      key: 'projectName',
      header: t.tenders.projectName,
      render: (item) => {
        const isIssued = item.tenderType === TenderType.TENANT_ISSUED;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md uppercase ${
                  isIssued
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                }`}
              >
                {isIssued ? t.tenderTypes.issuedShort : t.tenderTypes.participatingShort}
              </span>
              <p className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">{item.projectName}</p>
            </div>
            <p className="text-xs text-slate-400">{item.investorName}</p>
          </div>
        );
      },
    },
    {
      key: 'budgetAmount',
      header: t.tenders.budget,
      width: '180px',
      render: (item) => (
        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm whitespace-nowrap font-mono">
          {item.budgetCurrency === Currency.VND
            ? `${(item.budgetAmount / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} Tỷ VND`
            : `${item.budgetAmount.toLocaleString('en-US')} ${item.budgetCurrency}`}
        </span>
      ),
    },
    {
      key: 'currentStage',
      header: t.tenders.currentStage,
      width: '260px',
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
          {t.stages[item.currentStage] || item.currentStage}
        </span>
      ),
    },
    {
      key: 'submissionDeadline',
      header: t.tenders.deadline,
      width: '160px',
      render: (item) => (
        <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
          {item.submissionDeadline}
        </span>
      ),
    },
    {
      key: 'status',
      header: t.common.status,
      width: '150px',
      align: 'center',
      render: (item) => {
        const isWon = item.status === TenderStatus.WON;
        const isSubmitted = item.status === TenderStatus.SUBMITTED;

        return (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap border shadow-2xs ${
              isWon
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : isSubmitted
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
            }`}
          >
            {t.status[item.status] || item.status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.tenders.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{t.tenders.subtitle}</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') window.location.href = '/workflow';
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-all cursor-pointer"
          >
            <Layers3 className="w-4 h-4" />
            <span>{t.kanban.flowNavigationBtn}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.tenders.createNew}</span>
          </button>
        </div>
      </div>

      {/* Tabs Phân Loại 2 Nhóm Gói Thầu */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex-wrap">
        <button
          type="button"
          onClick={() => setFilterTenderType('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterTenderType === 'ALL'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          {t.tenderTypes.all} ({projects.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterTenderType(TenderType.TENANT_PARTICIPATING)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterTenderType === TenderType.TENANT_PARTICIPATING
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>{t.tenderTypes.TENANT_PARTICIPATING}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
            {projects.filter((p) => p.tenderType === TenderType.TENANT_PARTICIPATING).length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterTenderType(TenderType.TENANT_ISSUED)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterTenderType === TenderType.TENANT_ISSUED
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>{t.tenderTypes.TENANT_ISSUED}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
            {projects.filter((p) => p.tenderType === TenderType.TENANT_ISSUED).length}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.common.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>{t.common.filter}</span>
          </button>
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable<TenderProject>
        columns={columns}
        data={filtered}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        renderActions={(item) => (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') window.location.href = `/matrix?projectId=${item.id}`;
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Mở Ma Trận So Sánh Giá & Tính Toán Landed Cost"
            >
              <Scale className="w-4 h-4 text-emerald-600" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') window.location.href = `/workflow`;
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Mở Sơ Đồ Luồng Điều Phối 3-in-1"
            >
              <Layers3 className="w-4 h-4 text-blue-600" />
            </button>
            <button
              type="button"
              onClick={() => setEditingProject({ ...item })}
              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={t.common.edit}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeletingProject(item)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={t.common.delete}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* Modal 1: Tạo Gói Thầu Mới */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.tenders.createNew}</h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              {/* Chọn loại gói thầu */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Loại Gói Thầu & Vai Trò Nghiệp Vụ <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTenderType(TenderType.TENANT_PARTICIPATING)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      newTenderType === TenderType.TENANT_PARTICIPATING
                        ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    💼 Đi Dự Thầu (Tổng Thầu)
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewTenderType(TenderType.TENANT_ISSUED)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      newTenderType === TenderType.TENANT_ISSUED
                        ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    📢 Mở Mời Thầu (Mua Sắm)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.tenders.projectCode} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="BID-2026-XXX-001"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.tenders.projectName} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.tenders.investor}
                </label>
                <input
                  type="text"
                  value={newInvestor}
                  onChange={(e) => setNewInvestor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.tenders.budget} (VND)
                </label>
                <input
                  type="text"
                  value={formatNumberString(newBudget)}
                  onChange={(e) => setNewBudget(parseFormattedNumber(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-100"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  {t.common.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Chỉnh Sửa Gói Thầu */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.common.edit}: {editingProject.projectCode}</h3>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Loại Gói Thầu
                </label>
                <select
                  value={editingProject.tenderType || TenderType.TENANT_PARTICIPATING}
                  onChange={(e) => setEditingProject({ ...editingProject, tenderType: e.target.value as TenderType })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                >
                  <option value={TenderType.TENANT_PARTICIPATING}>💼 Gói Thầu Đi Dự Thầu (Tổng Thầu)</option>
                  <option value={TenderType.TENANT_ISSUED}>📢 Gói Thầu Mở Mời Thầu (Mua Sắm Sourcing)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.tenders.projectName}
                </label>
                <input
                  type="text"
                  required
                  value={editingProject.projectName}
                  onChange={(e) => setEditingProject({ ...editingProject, projectName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.tenders.investor}
                </label>
                <input
                  type="text"
                  value={editingProject.investorName}
                  onChange={(e) => setEditingProject({ ...editingProject, investorName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.tenders.budget}
                </label>
                <input
                  type="text"
                  value={formatNumberString(editingProject.budgetAmount)}
                  onChange={(e) => setEditingProject({ ...editingProject, budgetAmount: parseFormattedNumber(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-100"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Chi Tiết Gói Thầu */}
      {viewingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Chi Tiết Gói Thầu</h3>
              <button
                type="button"
                onClick={() => setViewingProject(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Phân Loại Nghiệp Vụ:</span>
                <span className="font-bold text-blue-600">
                  {viewingProject.tenderType === TenderType.TENANT_ISSUED
                    ? t.tenderTypes.TENANT_ISSUED
                    : t.tenderTypes.TENANT_PARTICIPATING}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">{t.tenders.projectCode}:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{viewingProject.projectCode}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">{t.tenders.projectName}:</span>
                <span className="font-semibold text-slate-900 dark:text-white text-right max-w-xs">{viewingProject.projectName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">{t.tenders.investor}:</span>
                <span className="text-slate-800 dark:text-slate-200 text-right">{viewingProject.investorName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">{t.tenders.budget}:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {viewingProject.budgetCurrency === Currency.VND
                    ? `${(viewingProject.budgetAmount / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} Tỷ VND`
                    : `${viewingProject.budgetAmount.toLocaleString('en-US')} ${viewingProject.budgetCurrency}`}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">{t.tenders.currentStage}:</span>
                <span className="font-semibold text-blue-600">{t.stages[viewingProject.currentStage]}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Tiến Độ Hồ Sơ:</span>
                <span className="font-bold text-emerald-600">{viewingProject.completionRate}%</span>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3">
              <button
                type="button"
                onClick={() => setViewingProject(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Xóa Gói Thầu */}
      {deletingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Xác Nhận Xóa Gói Thầu</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Bạn có chắc chắn muốn xóa gói thầu <strong className="text-slate-800 dark:text-slate-200">[{deletingProject.projectCode}] {deletingProject.projectName}</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProject(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleDeleteProject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-xs"
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
