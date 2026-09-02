'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../shared/i18n';
import { useToast } from '../../shared/toast/ToastContext';
import {
  Currency,
  TenderProject,
  TenderStage,
  TenderStatus,
  TenderType,
} from '../../shared/types';
import {
  TENDER_STAGE_ORDER,
  STAGE_REQUIREMENTS,
  getStageRequirements,
  StageChecklistItem,
} from '../../shared/constants';
import { tenderService } from '../../services/tenderService';
import {
  ShieldCheck,
  AlertTriangle,
  Lock,
  ArrowRight,
  X,
  CheckCircle2,
  Circle,
  Plus,
  Search,
  FileText,
  Building,
  User,
  Clock,
  DollarSign,
  Edit3,
  Trash2,
  UploadCloud,
  Check,
  Sparkles,
  Layers,
  Briefcase,
  ExternalLink,
  Layers3,
} from 'lucide-react';

export function KanbanBoard() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<TenderProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterManager, setFilterManager] = useState('ALL');
  const [filterRate, setFilterRate] = useState('ALL');
  const [filterTenderType, setFilterTenderType] = useState<string>('ALL');

  // Modal State: Gatekeeper & Advance
  const [selectedProjectForGate, setSelectedProjectForGate] = useState<TenderProject | null>(null);
  const [targetStage, setTargetStage] = useState<TenderStage | null>(null);
  const [bypassReason, setBypassReason] = useState('');
  const [isAdvancing, setIsAdvancing] = useState(false);

  // Modal State: Dossier & Action Center (Hoàn thiện hồ sơ)
  const [dossierProject, setDossierProject] = useState<TenderProject | null>(null);
  const [projectCompletedItems, setProjectCompletedItems] = useState<Record<string, string[]>>({});
  const [customNote, setCustomNote] = useState('');

  // Modal State: Tạo mới & Chỉnh sửa
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<TenderProject | null>(null);
  const [deletingProject, setDeletingProject] = useState<TenderProject | null>(null);

  // Form states
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formInvestor, setFormInvestor] = useState('');
  const [formTenderType, setFormTenderType] = useState<TenderType>(TenderType.TENANT_PARTICIPATING);
  const [formBudget, setFormBudget] = useState(15000000000);
  const [formCurrency, setFormCurrency] = useState<Currency>(Currency.VND);
  const [formDeadline, setFormDeadline] = useState('2026-09-30 17:00');
  const [formManager, setFormManager] = useState('Nguyễn Văn Hùng');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await tenderService.getProjects();
      setProjects(data);

      // Khởi tạo trạng thái completed items ban đầu dựa theo completionRate
      const initialMap: Record<string, string[]> = {};
      data.forEach((p) => {
        const reqs = STAGE_REQUIREMENTS[p.currentStage] || [];
        const countToComplete = Math.round((p.completionRate / 100) * reqs.length);
        initialMap[p.id] = reqs.slice(0, countToComplete).map((r) => r.id);
      });
      setProjectCompletedItems((prev) => ({ ...initialMap, ...prev }));
    } catch (err) {
      console.error('Lỗi khi tải danh sách gói thầu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const getNextStage = (stage: TenderStage): TenderStage | null => {
    const currentIndex = TENDER_STAGE_ORDER.indexOf(stage);
    if (currentIndex >= 0 && currentIndex < TENDER_STAGE_ORDER.length - 1) {
      return TENDER_STAGE_ORDER[currentIndex + 1];
    }
    return null;
  };

  const handleOpenGateModal = (project: TenderProject, nextStage: TenderStage) => {
    setSelectedProjectForGate(project);
    setTargetStage(nextStage);
    setBypassReason('');
  };

  const handleAdvanceStage = async (useBypass: boolean) => {
    if (!selectedProjectForGate || !targetStage) return;

    if (useBypass && !bypassReason.trim()) {
      showToast(t.commandCenter.modals.bypassPlaceholder, 'warning');
      return;
    }

    try {
      setIsAdvancing(true);
      const updated = await tenderService.advanceStage(
        selectedProjectForGate.id,
        targetStage,
        bypassReason || undefined
      );

      // Tự động khởi tạo 1 item ban đầu cho stage mới
      const newStageReqs = STAGE_REQUIREMENTS[targetStage] || [];
      setProjectCompletedItems((prev) => ({
        ...prev,
        [selectedProjectForGate.id]: newStageReqs.slice(0, 1).map((r) => r.id),
      }));

      setProjects((prev) =>
        prev.map((p) => (p.id === selectedProjectForGate.id ? updated : p))
      );

      setSelectedProjectForGate(null);
      setTargetStage(null);
      setBypassReason('');
      showToast(t.commandCenter.modals.gateSuccess, 'success');
    } catch (err: any) {
      showToast(err.message || t.common.loading, 'error');
    } finally {
      setIsAdvancing(false);
    }
  };

  // Mở Action Center để hoàn thiện tài liệu
  const handleOpenDossierModal = (project: TenderProject) => {
    setDossierProject(project);
  };

  // Tích chọn tài liệu đã hoàn thành
  const handleToggleChecklistItem = async (projectId: string, itemId: string) => {
    const currentCompleted = projectCompletedItems[projectId] || [];
    const isChecked = currentCompleted.includes(itemId);
    const updatedCompleted = isChecked
      ? currentCompleted.filter((id) => id !== itemId)
      : [...currentCompleted, itemId];

    setProjectCompletedItems((prev) => ({
      ...prev,
      [projectId]: updatedCompleted,
    }));

    // Cập nhật lại completionRate cho gói thầu theo thời gian thực
    const proj = projects.find((p) => p.id === projectId);
    if (proj) {
      const stageReqs = STAGE_REQUIREMENTS[proj.currentStage] || [];
      const newRate =
        stageReqs.length > 0
          ? Math.round((updatedCompleted.length / stageReqs.length) * 100)
          : 100;

      try {
        const updated = await tenderService.updateProject(projectId, {
          completionRate: newRate,
        });
        setProjects((prev) => prev.map((p) => (p.id === projectId ? updated : p)));
      } catch (err) {
        console.error('Lỗi khi cập nhật tiến độ hồ sơ:', err);
      }
    }
  };

  const handleCompleteAllForProject = async (project: TenderProject) => {
    const stageReqs = STAGE_REQUIREMENTS[project.currentStage] || [];
    const allIds = stageReqs.map((r) => r.id);

    setProjectCompletedItems((prev) => ({
      ...prev,
      [project.id]: allIds,
    }));

    try {
      const updated = await tenderService.updateProject(project.id, {
        completionRate: 100,
      });
      setProjects((prev) => prev.map((p) => (p.id === project.id ? updated : p)));
    } catch (err) {
      console.error('Lỗi khi hoàn thiện toàn bộ hồ sơ:', err);
    }
  };

  // Tạo mới gói thầu
  const handleOpenCreateModal = () => {
    setFormCode(`BID-2026-${Math.floor(100 + Math.random() * 900)}`);
    setFormName('');
    setFormInvestor('');
    setFormTenderType(TenderType.TENANT_PARTICIPATING);
    setFormBudget(20000000000);
    setFormCurrency(Currency.VND);
    setFormDeadline('2026-10-15 17:00');
    setFormManager('Nguyễn Văn Hùng');
    setIsCreateModalOpen(true);
  };

  const handleSaveCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formName || !formInvestor) return;

    try {
      const created = await tenderService.createProject({
        projectCode: formCode,
        projectName: formName,
        investorName: formInvestor,
        tenderType: formTenderType,
        budgetAmount: Number(formBudget),
        budgetCurrency: formCurrency,
        submissionDeadline: formDeadline,
        bidManagerName: formManager,
        currentStage: TenderStage.STAGE_PREPARATION,
        status: TenderStatus.IN_PROGRESS,
        completionRate: 25,
      });

      setProjects((prev) => [created, ...prev]);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Lỗi khi tạo gói thầu:', err);
    }
  };

  const handleOpenEditModal = (proj: TenderProject) => {
    setEditingProject(proj);
    setFormCode(proj.projectCode);
    setFormName(proj.projectName);
    setFormInvestor(proj.investorName);
    setFormTenderType(proj.tenderType || TenderType.TENANT_PARTICIPATING);
    setFormBudget(proj.budgetAmount);
    setFormCurrency(proj.budgetCurrency);
    setFormDeadline(proj.submissionDeadline);
    setFormManager(proj.bidManagerName);
  };

  const handleSaveEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    try {
      const updated = await tenderService.updateProject(editingProject.id, {
        projectName: formName,
        investorName: formInvestor,
        tenderType: formTenderType,
        budgetAmount: Number(formBudget),
        budgetCurrency: formCurrency,
        submissionDeadline: formDeadline,
        bidManagerName: formManager,
      });

      setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? updated : p)));
      setEditingProject(null);
    } catch (err) {
      console.error('Lỗi khi cập nhật gói thầu:', err);
    }
  };

  const handleDeleteProject = async () => {
    if (!deletingProject) return;
    try {
      await tenderService.deleteProject(deletingProject.id);
      setProjects((prev) => prev.filter((p) => p.id !== deletingProject.id));
      setDeletingProject(null);
    } catch (err) {
      console.error('Lỗi khi xóa gói thầu:', err);
    }
  };

  // Lọc danh sách theo từ khóa, người phụ trách, tiến độ và loại gói thầu
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        searchKeyword === '' ||
        p.projectCode.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        p.projectName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        p.investorName.toLowerCase().includes(searchKeyword.toLowerCase());

      const matchManager =
        filterManager === 'ALL' || p.bidManagerName === filterManager;

      let matchRate = true;
      if (filterRate === '100') {
        matchRate = p.completionRate >= 100;
      } else if (filterRate === 'IN_PROGRESS') {
        matchRate = p.completionRate < 100;
      }

      const matchTenderType =
        filterTenderType === 'ALL' || p.tenderType === filterTenderType;

      return matchSearch && matchManager && matchRate && matchTenderType;
    });
  }, [projects, searchKeyword, filterManager, filterRate, filterTenderType]);

  // Thống kê nhanh KPI
  const totalBidsCount = projects.length;
  const inProgressCount = projects.filter(
    (p) => p.currentStage !== TenderStage.STAGE_AWARD_LOGISTICS
  ).length;
  const wonBidsCount = projects.filter((p) => p.status === TenderStatus.WON).length;
  const totalBudgetBillion = projects
    .filter((p) => p.budgetCurrency === Currency.VND)
    .reduce((acc, curr) => acc + curr.budgetAmount, 0) / 1000000000;

  const distinctManagers = Array.from(new Set(projects.map((p) => p.bidManagerName)));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {t.kanban.title || 'Không Gian Quản Lý Gói Thầu & Kanban Đấu Thầu'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.kanban.subtitle || 'Điều phối 6 giai đoạn dự thầu, kiểm soát hồ sơ theo Quality Gate 4 tầng và bảo vệ chống tranh chấp Redisson'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Nút điều hướng nhanh sang Sơ đồ Luồng 3-in-1 */}
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
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.tenders.createNew}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>{t.kanban.totalBids}</span>
            <Briefcase className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalBidsCount}</p>
          <p className="text-[11px] text-slate-400 font-medium">{t.kanban.totalBidsDesc}</p>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>{t.kanban.inProgressBids}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{inProgressCount}</p>
          <p className="text-[11px] text-slate-400 font-medium">{t.kanban.inProgressBidsDesc}</p>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>{t.kanban.wonBids}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{wonBidsCount}</p>
          <p className="text-[11px] text-slate-400 font-medium">{t.kanban.wonBidsDesc}</p>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>{t.kanban.totalBudgetValue}</span>
            <DollarSign className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
            {totalBudgetBillion.toFixed(1)} {t.commandCenter.kpi.billionUnit}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">{t.kanban.totalBudgetDesc}</p>
        </div>
      </div>

      {/* Tabs Phân Loại 2 Nhóm Gói Thầu (Tenant Đi dự thầu & Tenant Mở mời thầu) */}
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

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder={t.kanban.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Lọc theo Người phụ trách */}
          <select
            value={filterManager}
            onChange={(e) => setFilterManager(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 shadow-2xs hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
          >
            <option value="ALL">{t.kanban.filterAllManagers}</option>
            {distinctManagers.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Lọc theo Tiến độ hồ sơ */}
          <select
            value={filterRate}
            onChange={(e) => setFilterRate(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 shadow-2xs hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
          >
            <option value="ALL">{t.kanban.filterAllRates}</option>
            <option value="100">{t.kanban.filterReadyRate}</option>
            <option value="IN_PROGRESS">{t.kanban.filterIncompleteRate}</option>
          </select>
        </div>
      </div>

      {/* 6-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
        {TENDER_STAGE_ORDER.map((stageKey, idx) => {
          const stageProjects = filteredProjects.filter((p) => p.currentStage === stageKey);
          const stageTitle = t.stages[stageKey] || stageKey;
          const stageNumber = idx + 1;

          return (
            <div
              key={stageKey}
              className="flex flex-col bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-3 space-y-3 min-h-[500px]"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between px-2 pt-1">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center font-mono">
                      {stageNumber}
                    </span>
                    <h3 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">
                      {stageTitle.replace(/^\d+\.\s*/, '')}
                    </h3>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-xs">
                  {stageProjects.length}
                </span>
              </div>

              {/* Projects in this stage */}
              <div className="space-y-3 flex-1">
                {stageProjects.map((project) => {
                  const nextStage = getNextStage(project.currentStage);
                  const isEligible = project.completionRate >= 100;
                  const isIssued = project.tenderType === TenderType.TENANT_ISSUED;

                  return (
                    <div
                      key={project.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-3 group"
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                              {project.projectCode}
                            </span>
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase ${
                                isIssued
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {isIssued ? t.tenderTypes.issuedShort : t.tenderTypes.participatingShort}
                            </span>
                          </div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 mt-1 leading-snug">
                            {project.projectName}
                          </h4>
                        </div>

                        {/* Dropdown / Action buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(project)}
                            className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Chỉnh sửa gói thầu"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingProject(project)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Xóa gói thầu"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Investor / Procuring Entity */}
                      <p className="text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{project.investorName}</span>
                      </p>

                      {/* Budget and Deadline */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-1 font-medium">
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                          <span>Ngân sách:</span>
                          <strong className="font-mono font-bold text-slate-900 dark:text-white">
                            {project.budgetCurrency === Currency.VND
                              ? `${(project.budgetAmount / 1000000000).toFixed(1)} Tỷ VND`
                              : `${project.budgetAmount.toLocaleString()} USD`}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                          <span>Hạn nộp:</span>
                          <span className="font-mono text-[10px] text-slate-500">
                            {project.submissionDeadline.split(' ')[0]}
                          </span>
                        </div>
                      </div>

                      {/* Dossier Completeness Progress Bar & Action Center Button */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-slate-600 dark:text-slate-400">
                            Hồ sơ yêu cầu:
                          </span>
                          <span
                            className={`font-mono font-extrabold ${
                              isEligible
                                ? 'text-emerald-600'
                                : 'text-blue-600 dark:text-blue-400'
                            }`}
                          >
                            {project.completionRate}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${
                              isEligible
                                ? 'bg-emerald-500'
                                : project.completionRate >= 50
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${project.completionRate}%` }}
                          />
                        </div>
                      </div>

                      {/* Action buttons: Hoàn thiện hồ sơ & Chuyển bước */}
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenDossierModal(project)}
                          className="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3 text-blue-500" />
                          <span>Hồ Sơ Thầu</span>
                        </button>

                        {nextStage && (
                          <button
                            type="button"
                            onClick={() => handleOpenGateModal(project, nextStage)}
                            className={`py-1.5 px-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                              isEligible
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            }`}
                            title={isEligible ? 'Chuyển sang bước tiếp theo' : 'Chưa đạt 100% - Yêu cầu Bypass'}
                          >
                            <span>Tiếp</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {stageProjects.length === 0 && (
                  <div className="h-32 rounded-2xl border border-dashed border-slate-300/80 dark:border-slate-700 flex items-center justify-center text-xs text-slate-400 font-medium">
                    Trống
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ACTION CENTER & HOÀN THIỆN HỒ SƠ CHI TIẾT THEO GIAI ĐOẠN          */}
      {/* ========================================================================= */}
      {dossierProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                      {dossierProject.projectCode}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                        dossierProject.tenderType === TenderType.TENANT_ISSUED
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {dossierProject.tenderType === TenderType.TENANT_ISSUED
                        ? t.tenderTypes.TENANT_ISSUED
                        : t.tenderTypes.TENANT_PARTICIPATING}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                    {dossierProject.projectName}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDossierProject(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Stage Overview */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {t.commandCenter.kpi.stageProgress}: <strong className="text-blue-600">{t.stages[dossierProject.currentStage]}</strong>
                </span>
                <span className="font-mono font-black text-blue-600 dark:text-blue-400">
                  {dossierProject.completionRate}% {t.commandCenter.kpi.completedTasks}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${dossierProject.completionRate}%` }}
                />
              </div>
            </div>

            {/* Checklist of Mandatory Requirements */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t.kanban.dossierModalTitle}
                </h4>
                <button
                  type="button"
                  onClick={() => handleCompleteAllForProject(dossierProject)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  {t.kanban.btnCompleteAll100}
                </button>
              </div>

              <div className="space-y-2.5">
                {getStageRequirements(t, dossierProject.currentStage).map((item) => {
                  const completedList = projectCompletedItems[dossierProject.id] || [];
                  const isChecked = completedList.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklistItem(dossierProject.id, item.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isChecked
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/70'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 shrink-0 text-emerald-600"
                      >
                        {isChecked ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                        )}
                      </button>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-xs font-bold ${
                              isChecked
                                ? 'text-slate-700 dark:text-slate-300 line-through opacity-80'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {item.title}
                          </p>
                          <span className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {item.docCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{item.description}</p>
                        <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400">
                          <span>Phụ trách: <strong className="text-slate-600 dark:text-slate-300">{item.assigneeRole}</strong></span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500">
                Tự động lưu và cập nhật tiến độ tức thì vào thẻ Kanban
              </div>
              <button
                type="button"
                onClick={() => setDossierProject(null)}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
              >
                Xác Nhận & Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: GATEKEEPER MODAL CHUYỂN BƯỚC                                     */}
      {/* ========================================================================= */}
      {selectedProjectForGate && targetStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Kiểm Soát Chốt Chặn Gatekeeper Chuyển Bước
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedProjectForGate.projectCode}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProjectForGate(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Stage Info */}
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 space-y-1">
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                Giai Đoạn Đích (Target Stage):
              </span>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">{t.stages[targetStage]}</p>
            </div>

            {/* 4 Layers Gatekeeper Checklist */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-slate-900 dark:text-white">Lớp 1: Hồ Sơ Điều Kiện Tiên Quyết (Doc Checklist)</p>
                  <p className="text-slate-500 mt-0.5">
                    Tiến độ hoàn thiện: <strong className="text-blue-600">{selectedProjectForGate.completionRate}%</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-slate-900 dark:text-white">Lớp 2: Thẩm Định Tài Chính & Bảo Lãnh (Financial)</p>
                  <p className="text-slate-500 mt-0.5">Bảo lãnh dự thầu và dự toán đã được phê duyệt</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <Lock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-slate-900 dark:text-white">Lớp 4: Khóa An Toàn Chống Trùng Lặp (Bảo Vệ Dữ Liệu)</p>
                  <p className="text-slate-500 mt-0.5">Bảo vệ trạng thái gói thầu chống xung đột đa luồng đồng thời</p>
                </div>
              </div>
            </div>

            {/* Manager Bypass Section if rate < 100 */}
            {selectedProjectForGate.completionRate < 100 ? (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Hồ sơ chưa đạt 100% - Cần Quản Lý Phê Duyệt Vượt Quyền (Bypass):</span>
                </div>
                <textarea
                  rows={2}
                  placeholder="Nhập lý do phê duyệt vượt quyền (VD: Đã cam kết bổ sung MAF trước giờ mở thầu...)"
                  value={bypassReason}
                  onChange={(e) => setBypassReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-amber-200 dark:border-amber-900 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Hồ sơ đã hoàn thiện 100%! Có thể chuyển bước ngay lập tức.</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedProjectForGate(null)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={isAdvancing}
                onClick={() => handleAdvanceStage(selectedProjectForGate.completionRate < 100)}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isAdvancing ? 'Đang chuyển...' : 'Xác Nhận Chuyển Bước'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: TẠO MỚI / CHỈNH SỬA GÓI THẦU                                    */}
      {/* ========================================================================= */}
      {(isCreateModalOpen || editingProject) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {isCreateModalOpen ? 'Tạo Gói Thầu Mới' : 'Chỉnh Sửa Gói Thầu'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingProject(null);
                }}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={isCreateModalOpen ? handleSaveCreateProject : handleSaveEditProject}
              className="space-y-3.5"
            >
              {/* Phân loại loại gói thầu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.kanban.tenderTypeRoleLabel} <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormTenderType(TenderType.TENANT_PARTICIPATING)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      formTenderType === TenderType.TENANT_PARTICIPATING
                        ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>{t.tenderTypes.TENANT_PARTICIPATING}</span>
                    </div>
                    <p className="text-[10px] font-normal text-slate-500 mt-0.5">{t.tenderTypes.participatingDesc}</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormTenderType(TenderType.TENANT_ISSUED)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      formTenderType === TenderType.TENANT_ISSUED
                        ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <Building className="w-3.5 h-3.5" />
                      <span>{t.tenderTypes.TENANT_ISSUED}</span>
                    </div>
                    <p className="text-[10px] font-normal text-slate-500 mt-0.5">{t.tenderTypes.issuedDesc}</p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mã Gói Thầu
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tên Gói Thầu / Dự Án <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="VD: Cung cấp Máy biến áp 220kV TBA Tây Hà Nội"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Chủ Đầu Tư / Bên Mời Thầu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formInvestor}
                  onChange={(e) => setFormInvestor(e.target.value)}
                  placeholder="VD: Tổng Công Ty Truyền Tải Điện Quốc Gia (EVNNPT)"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ngân Sách Dự Kiến
                  </label>
                  <input
                    type="number"
                    value={formBudget}
                    onChange={(e) => setFormBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Đồng Tiền
                  </label>
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value as Currency)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value={Currency.VND}>VND</option>
                    <option value={Currency.USD}>USD</option>
                    <option value={Currency.EUR}>EUR</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hạn Nộp Thầu
                  </label>
                  <input
                    type="text"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    placeholder="2026-09-30 17:00"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Trưởng Ban Thầu
                  </label>
                  <input
                    type="text"
                    value={formManager}
                    onChange={(e) => setFormManager(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingProject(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  {isCreateModalOpen ? 'Tạo Gói Thầu' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: XÁC NHẬN XÓA GÓI THẦU                                            */}
      {/* ========================================================================= */}
      {deletingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Xác Nhận Xóa Gói Thầu
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bạn có chắc chắn muốn xóa gói thầu{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                [{deletingProject.projectCode}] {deletingProject.projectName}
              </strong>
              ? Dữ liệu quy trình và checklist sẽ bị gỡ bỏ.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProject(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteProject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-xs"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
