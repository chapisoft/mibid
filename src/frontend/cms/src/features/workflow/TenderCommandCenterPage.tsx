'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../shared/i18n';
import {
  Currency,
  Department,
  Incoterm,
  RfqPackage,
  RfqStatus,
  TaskItem,
  TaskPriority,
  TaskStatus,
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
import { taskService } from '../../services/taskService';
import { sourcingService } from '../../services/sourcingService';
import {
  ShieldCheck,
  AlertTriangle,
  Lock,
  ArrowRight,
  X,
  CheckCircle2,
  Circle,
  Plus,
  Briefcase,
  Building2,
  User,
  Clock,
  DollarSign,
  Sparkles,
  Layers3,
  TrendingUp,
  FileText,
  Check,
  Filter,
} from 'lucide-react';

interface TenderCommandCenterPageProps {
  onNavigateScreen?: (screen: string) => void;
  onOpenBpmDesigner?: (workflowId?: string) => void;
}

export function TenderCommandCenterPage({
  onNavigateScreen,
  onOpenBpmDesigner,
}: TenderCommandCenterPageProps) {
  const { t } = useTranslation();

  // Danh sách dữ liệu liên kết 3 phân hệ
  const [projects, setProjects] = useState<TenderProject[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [rfqs, setRfqs] = useState<RfqPackage[]>([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc phân loại 2 nhóm gói thầu: Tất cả | Đi dự thầu (Tổng thầu) | Mở mời thầu (Mua sắm)
  const [selectedTenderType, setSelectedTenderType] = useState<string>('ALL');

  // Dự án & Bước đang tập trung điều phối
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [activeStage, setActiveStage] = useState<TenderStage>(TenderStage.STAGE_SOURCING);

  // Trạng thái tài liệu hoàn thiện của từng dự án
  const [completedItemsMap, setCompletedItemsMap] = useState<Record<string, string[]>>({});

  // Modals state
  const [isGateModalOpen, setIsGateModalOpen] = useState(false);
  const [targetAdvanceStage, setTargetAdvanceStage] = useState<TenderStage | null>(null);
  const [bypassReason, setBypassReason] = useState('');
  const [isAdvancing, setIsAdvancing] = useState(false);

  // Modal tạo công việc nội bộ mới
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDept, setTaskDept] = useState<Department>(Department.TECHNICAL);
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>(TaskPriority.HIGH);
  const [taskDeadline, setTaskDeadline] = useState('');

  // Modal tạo gói mời thầu Vendor RFQ mới
  const [isCreateRfqModalOpen, setIsCreateRfqModalOpen] = useState(false);
  const [rfqSupplier, setRfqSupplier] = useState('');
  const [rfqEmail, setRfqEmail] = useState('');
  const [rfqIncoterm, setRfqIncoterm] = useState<Incoterm>(Incoterm.CIF);
  const [rfqCurrency, setRfqCurrency] = useState<Currency>(Currency.USD);
  const [rfqItemCount, setRfqItemCount] = useState(1);

  // Tải dữ liệu toàn hệ thống
  const loadData = async () => {
    try {
      setLoading(false);
      const [projList, taskList, rfqList] = await Promise.all([
        tenderService.getProjects(),
        taskService.getTasks(),
        sourcingService.getRfqs(),
      ]);

      setProjects(projList);
      setTasks(taskList);
      setRfqs(rfqList);

      // Khởi tạo checklist hoàn thiện ban đầu
      const initialMap: Record<string, string[]> = {};
      projList.forEach((p) => {
        const reqs = STAGE_REQUIREMENTS[p.currentStage] || [];
        const countToComplete = Math.round((p.completionRate / 100) * reqs.length);
        initialMap[p.id] = reqs.slice(0, countToComplete).map((r) => r.id);
      });
      setCompletedItemsMap((prev) => ({ ...initialMap, ...prev }));

      // Đặt dự án & bước mặc định nếu có
      if (projList.length > 0) {
        const defaultProj = projList[0];
        setSelectedProjectId(defaultProj.id);
        setActiveStage(defaultProj.currentStage);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu Command Center:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Danh sách dự án sau khi lọc theo 2 loại gói thầu
  const filteredProjects = useMemo(() => {
    if (selectedTenderType === 'ALL') return projects;
    return projects.filter((p) => p.tenderType === selectedTenderType);
  }, [projects, selectedTenderType]);

  // Dự án hiện đang chọn
  const currentProject = useMemo(() => {
    const found = projects.find((p) => p.id === selectedProjectId);
    if (found) return found;
    return filteredProjects[0] || projects[0];
  }, [projects, selectedProjectId, filteredProjects]);

  // Đồng bộ bước active khi đổi dự án
  useEffect(() => {
    if (currentProject) {
      setActiveStage(currentProject.currentStage);
    }
  }, [currentProject?.id]);

  // Tự động chuyển selectedProjectId khi danh sách lọc thay đổi mà dự án cũ không thuộc danh sách
  useEffect(() => {
    if (filteredProjects.length > 0 && !filteredProjects.some((p) => p.id === selectedProjectId)) {
      setSelectedProjectId(filteredProjects[0].id);
      setActiveStage(filteredProjects[0].currentStage);
    }
  }, [filteredProjects, selectedProjectId]);

  // Các công việc liên kết với dự án đang chọn
  const projectTasks = useMemo(() => {
    if (!currentProject) return [];
    return tasks.filter(
      (tItem) =>
        tItem.projectCode === currentProject.projectCode ||
        tItem.taskTitle.toLowerCase().includes(currentProject.projectCode.toLowerCase())
    );
  }, [tasks, currentProject]);

  // Các gói RFQ mời Vendor liên kết với dự án đang chọn
  const projectRfqs = useMemo(() => {
    if (!currentProject) return [];
    return rfqs;
  }, [rfqs, currentProject]);

  // Checklist tài liệu theo bước đang xem
  const activeStageRequirements = useMemo(() => {
    return getStageRequirements(t, activeStage);
  }, [t, activeStage]);

  // Danh sách ID tài liệu đã hoàn thành của dự án hiện tại
  const currentProjectCompletedIds = useMemo(() => {
    if (!currentProject) return [];
    return completedItemsMap[currentProject.id] || [];
  }, [completedItemsMap, currentProject]);

  // Tỷ lệ hoàn thành của bước đang xem
  const activeStageCompletionRate = useMemo(() => {
    if (activeStageRequirements.length === 0) return 100;
    const completedInThisStage = activeStageRequirements.filter((r) =>
      currentProjectCompletedIds.includes(r.id)
    ).length;
    return Math.round((completedInThisStage / activeStageRequirements.length) * 100);
  }, [activeStageRequirements, currentProjectCompletedIds]);

  // Tương tác tích chọn checklist Quality Gate
  const handleToggleCheckItem = async (itemId: string) => {
    if (!currentProject) return;

    const isAlreadyChecked = currentProjectCompletedIds.includes(itemId);
    const updatedIds = isAlreadyChecked
      ? currentProjectCompletedIds.filter((id) => id !== itemId)
      : [...currentProjectCompletedIds, itemId];

    setCompletedItemsMap((prev) => ({
      ...prev,
      [currentProject.id]: updatedIds,
    }));

    // Tính lại completionRate cho dự án nếu đang ở bước hiện tại của dự án
    if (activeStage === currentProject.currentStage) {
      const stageReqs = STAGE_REQUIREMENTS[currentProject.currentStage] || [];
      const newRate =
        stageReqs.length > 0
          ? Math.round((updatedIds.length / stageReqs.length) * 100)
          : 100;

      const updated = await tenderService.updateProject(currentProject.id, {
        completionRate: newRate,
      });

      setProjects((prev) =>
        prev.map((p) => (p.id === currentProject.id ? updated : p))
      );
    }
  };

  const handleCompleteAllForActiveStage = async () => {
    if (!currentProject) return;

    const allStageIds = activeStageRequirements.map((r) => r.id);
    const mergedIds = Array.from(new Set([...currentProjectCompletedIds, ...allStageIds]));

    setCompletedItemsMap((prev) => ({
      ...prev,
      [currentProject.id]: mergedIds,
    }));

    if (activeStage === currentProject.currentStage) {
      const updated = await tenderService.updateProject(currentProject.id, {
        completionRate: 100,
      });
      setProjects((prev) =>
        prev.map((p) => (p.id === currentProject.id ? updated : p))
      );
    }
  };

  // Xác định bước tiếp theo
  const getNextStage = (stage: TenderStage): TenderStage | null => {
    const currentIndex = TENDER_STAGE_ORDER.indexOf(stage);
    if (currentIndex >= 0 && currentIndex < TENDER_STAGE_ORDER.length - 1) {
      return TENDER_STAGE_ORDER[currentIndex + 1];
    }
    return null;
  };

  // Xử lý chuyển bước quy trình
  const handleRequestAdvance = (next: TenderStage) => {
    setTargetAdvanceStage(next);
    setIsGateModalOpen(true);
    setBypassReason('');
  };

  const handleConfirmAdvance = async (useBypass: boolean) => {
    if (!currentProject || !targetAdvanceStage) return;

    if (useBypass && !bypassReason.trim()) {
      alert(t.commandCenter.modals.bypassPlaceholder);
      return;
    }

    try {
      setIsAdvancing(true);
      const updated = await tenderService.advanceStage(
        currentProject.id,
        targetAdvanceStage,
        bypassReason || undefined
      );

      // Cập nhật completed items cho bước mới
      const newStageReqs = STAGE_REQUIREMENTS[targetAdvanceStage] || [];
      setCompletedItemsMap((prev) => ({
        ...prev,
        [currentProject.id]: newStageReqs.slice(0, 1).map((r) => r.id),
      }));

      setProjects((prev) =>
        prev.map((p) => (p.id === currentProject.id ? updated : p))
      );
      setActiveStage(targetAdvanceStage);
      setIsGateModalOpen(false);
      setTargetAdvanceStage(null);
      setBypassReason('');
    } catch (err: any) {
      alert(err.message || t.common.loading);
    } finally {
      setIsAdvancing(false);
    }
  };

  // Tạo công việc mới
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !currentProject) return;

    const created = await taskService.addTask({
      taskTitle: taskTitle.trim(),
      department: taskDept,
      projectCode: currentProject.projectCode,
      assigneeName: taskAssignee,
      priority: taskPriority,
      startDate: '2026-09-09',
      deadline: taskDeadline,
      checklistTotal: 4,
    });

    setTasks((prev) => [created, ...prev]);
    setIsCreateTaskModalOpen(false);
    setTaskTitle('');
  };

  // Đổi trạng thái công việc
  const handleToggleTaskStatus = async (tItem: TaskItem) => {
    const nextStatus =
      tItem.status === TaskStatus.COMPLETED
        ? TaskStatus.IN_PROGRESS
        : TaskStatus.COMPLETED;

    const updated = await taskService.updateTask(tItem.id, {
      status: nextStatus,
      checklistDone: nextStatus === TaskStatus.COMPLETED ? tItem.checklistTotal : 1,
    });

    setTasks((prev) => prev.map((item) => (item.id === tItem.id ? updated : item)));
  };

  // Tạo RFQ mời Vendor mới
  const handleCreateRfq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfqSupplier.trim()) return;

    const created = await sourcingService.createRfq({
      supplierName: rfqSupplier.trim(),
      supplierEmail: rfqEmail.trim() || 'vendor@partner.com',
      incoterm: rfqIncoterm,
      currency: rfqCurrency,
      itemCount: rfqItemCount,
    });

    setRfqs((prev) => [created, ...prev]);
    setIsCreateRfqModalOpen(false);
    setRfqSupplier('');
    setRfqEmail('');
  };

  const nextStageForCurrentProj = currentProject ? getNextStage(currentProject.currentStage) : null;
  const isTenantParticipating = currentProject?.tenderType === TenderType.TENANT_PARTICIPATING;

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & VIEW MODE SWITCHER                                        */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[11px] font-black uppercase tracking-wider font-mono">
              {t.commandCenter.badge}
            </span>
            <span className="text-xs font-bold text-slate-400">
              • {t.commandCenter.tagline}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            {t.commandCenter.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.commandCenter.subtitle}
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex-wrap">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 text-xs font-bold shadow-xs transition-all"
          >
            <Layers3 className="w-4 h-4" />
            <span>{t.commandCenter.viewModes.flow}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onNavigateScreen) onNavigateScreen('kanban');
              else if (typeof window !== 'undefined') window.location.href = '/kanban';
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{t.commandCenter.viewModes.kanban}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onNavigateScreen) onNavigateScreen('projects');
              else if (typeof window !== 'undefined') window.location.href = '/projects';
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t.commandCenter.viewModes.list}</span>
          </button>

          {onOpenBpmDesigner && (
            <button
              type="button"
              onClick={() => onOpenBpmDesigner()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>{t.commandCenter.viewModes.bpmn}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TENDER TYPE FILTER TABS (2 LOẠI: ĐI DỰ THẦU & MỞ MỜI THẦU SOURCING)     */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-4 p-2 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedTenderType('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedTenderType === 'ALL'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t.tenderTypes.all} ({projects.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedTenderType(TenderType.TENANT_PARTICIPATING)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedTenderType === TenderType.TENANT_PARTICIPATING
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
            onClick={() => setSelectedTenderType(TenderType.TENANT_ISSUED)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedTenderType === TenderType.TENANT_ISSUED
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{t.tenderTypes.TENANT_ISSUED}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
              {projects.filter((p) => p.tenderType === TenderType.TENANT_ISSUED).length}
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-medium px-2">
          {selectedTenderType === TenderType.TENANT_PARTICIPATING
            ? t.tenderTypes.participatingDesc
            : selectedTenderType === TenderType.TENANT_ISSUED
            ? t.tenderTypes.issuedDesc
            : t.tenderTypes.all}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PROJECT FOCUS SELECTOR & CONTRACTOR EXECUTIVE BANNER                   */}
      {/* ========================================================================= */}
      {currentProject && (
        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            {/* Project Select Dropdown */}
            <div className="flex items-center gap-3 flex-1">
              <div
                className={`p-3 rounded-2xl shrink-0 ${
                  isTenantParticipating
                    ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400'
                    : 'bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400'
                }`}
              >
                {isTenantParticipating ? (
                  <Briefcase className="w-6 h-6" />
                ) : (
                  <Building2 className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {t.commandCenter.projectFocus.label}
                  </label>
                  <span
                    className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase ${
                      isTenantParticipating
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                        : 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300'
                    }`}
                  >
                    {isTenantParticipating
                      ? t.tenderTypes.TENANT_PARTICIPATING
                      : t.tenderTypes.TENANT_ISSUED}
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="px-3.5 py-2.5 rounded-2xl font-mono text-xs sm:text-sm font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    {filteredProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.tenderType === TenderType.TENANT_PARTICIPATING ? 'ĐI DỰ THẦU' : 'MỞ MỜI THẦU'}] [{p.projectCode}] {p.projectName}
                      </option>
                    ))}
                  </select>

                  <span className="text-xs text-slate-500 font-medium">
                    {t.commandCenter.projectFocus.investorLabel} <strong className="text-slate-900 dark:text-white">{currentProject.investorName}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Redisson Lock Indicator */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <Lock className="w-3.5 h-3.5" />
                <span>{t.commandCenter.projectFocus.distributedLock}</span>
              </div>
            </div>
          </div>

          {/* 4 Executive KPI Indicator Cards for this focused Tender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
                <span>{t.commandCenter.kpi.stageProgress} {TENDER_STAGE_ORDER.indexOf(currentProject.currentStage) + 1}</span>
                <Sparkles className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                  {currentProject.completionRate}%
                </span>
                <span className="text-xs text-slate-500">
                  {currentProject.completionRate >= 100 ? t.commandCenter.kpi.eligible : t.commandCenter.kpi.inPrep}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${currentProject.completionRate}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
                <span>{t.commandCenter.kpi.budget}</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {currentProject.budgetCurrency === Currency.VND
                  ? `${(currentProject.budgetAmount / 1000000000).toFixed(1)} Tỷ VND`
                  : `${currentProject.budgetAmount.toLocaleString()} USD`}
              </p>
              <p className="text-[11px] text-slate-400">{t.commandCenter.kpi.deadline} <strong className="font-mono text-slate-700 dark:text-slate-300">{currentProject.submissionDeadline}</strong></p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
                <span>{t.commandCenter.kpi.internalTasks}</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                  {projectTasks.length}
                </span>
                <span className="text-xs text-slate-500">
                  ({projectTasks.filter((tItem) => tItem.status === TaskStatus.COMPLETED).length} {t.commandCenter.kpi.completedTasks})
                </span>
              </div>
              <p className="text-[11px] text-amber-600 font-medium">{t.commandCenter.kpi.taskDepts}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
                <span>{t.commandCenter.kpi.vendorRfqs}</span>
                <Building2 className="w-4 h-4 text-purple-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
                  {projectRfqs.length}
                </span>
                <span className="text-xs text-slate-500">{t.commandCenter.kpi.subcontractors}</span>
              </div>
              <p className="text-[11px] text-purple-600 font-medium">{t.commandCenter.kpi.sourcingDesc}</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE 6-STAGE VISUAL WORKFLOW MAP (ĐỒ HỌA LUỒNG TƯƠNG TÁC)       */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {t.commandCenter.flowMap.title}
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {t.commandCenter.flowMap.instruction}
          </span>
        </div>

        {/* 6 Nodes Visual Flow Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 pt-2">
          {TENDER_STAGE_ORDER.map((stageKey, idx) => {
            const stageIndex = idx + 1;
            const currentProjStageIndex = currentProject
              ? TENDER_STAGE_ORDER.indexOf(currentProject.currentStage) + 1
              : 1;

            const isPassed = stageIndex < currentProjStageIndex;
            const isCurrentActive = stageIndex === currentProjStageIndex;
            const isSelectedForView = activeStage === stageKey;

            const stageTitle = t.stages[stageKey] || stageKey;
            const stageReqs = STAGE_REQUIREMENTS[stageKey] || [];
            const completedCount = stageReqs.filter((r) =>
              currentProjectCompletedIds.includes(r.id)
            ).length;

            return (
              <div
                key={stageKey}
                onClick={() => setActiveStage(stageKey)}
                className={`relative p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                  isSelectedForView
                    ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/40 dark:bg-blue-950/40 shadow-md'
                    : isCurrentActive
                    ? 'border-blue-400 dark:border-blue-700 bg-white dark:bg-slate-900 shadow-sm'
                    : isPassed
                    ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 opacity-75'
                }`}
              >
                {/* Stage Header Indicator */}
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isPassed
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : isCurrentActive
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {t.commandCenter.flowMap.stepLabel} 0{stageIndex}
                  </span>

                  {isPassed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : isCurrentActive ? (
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" />
                    </span>
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                  )}
                </div>

                {/* Stage Name */}
                <h3 className="text-xs font-black text-slate-900 dark:text-white leading-tight line-clamp-2 min-h-[32px]">
                  {stageTitle.replace(/^\d+\.\s*/, '')}
                </h3>

                {/* Mini Indicators */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-[11px]">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-blue-500" /> {t.commandCenter.flowMap.gateDocs}
                    </span>
                    <strong className="font-mono text-slate-800 dark:text-slate-200">
                      {completedCount}/{stageReqs.length}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" /> {t.commandCenter.flowMap.internalTasks}
                    </span>
                    <strong className="font-mono text-slate-800 dark:text-slate-200">
                      {projectTasks.length}
                    </strong>
                  </div>
                </div>

                {/* Selected Pill Tag */}
                {isSelectedForView && (
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                    {t.commandCenter.flowMap.activeViewing}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. UNIFIED 3-IN-1 WORKSPACE (3 CỘT THAO TÁC RÀNG BUỘC CHO BƯỚC ĐANG CHỌN) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ======================================================================= */}
        {/* CỘT 1: CHỐT CHẶN QUALITY GATE & HỒ SƠ BẮT BUỘC (STAGE REQUIREMENTS)    */}
        {/* ======================================================================= */}
        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {isTenantParticipating
                    ? '1. Quality Gate Hồ Sơ Dự Thầu (Gửi CĐT)'
                    : '1. Hồ Sơ Mời Thầu & Tiêu Chí Đánh Giá'}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  {t.stages[activeStage]}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCompleteAllForActiveStage}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              {t.commandCenter.col1.mark100}
            </button>
          </div>

          {/* Progress Bar for Active Stage */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {t.commandCenter.col1.stageProgress}
              </span>
              <span className="font-mono font-black text-blue-600 dark:text-blue-400">
                {activeStageCompletionRate}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  activeStageCompletionRate >= 100
                    ? 'bg-emerald-500'
                    : activeStageCompletionRate >= 50
                    ? 'bg-blue-500'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${activeStageCompletionRate}%` }}
              />
            </div>
          </div>

          {/* Checklist of mandatory requirements */}
          <div className="flex-1 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {activeStageRequirements.map((item) => {
              const isChecked = currentProjectCompletedIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => handleToggleCheckItem(item.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isChecked
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/70'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                  }`}
                >
                  <button type="button" className="mt-0.5 shrink-0 text-emerald-600">
                    {isChecked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    )}
                  </button>

                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-xs font-bold leading-tight ${
                          isChecked
                            ? 'text-slate-700 dark:text-slate-300 line-through opacity-80'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {item.title}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{item.description}</p>
                    <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400 font-mono">
                      <span>{t.commandCenter.col1.codePrefix} {item.docCode}</span>
                      <span>• {item.assigneeRole}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Advance Action Button */}
          {nextStageForCurrentProj && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleRequestAdvance(nextStageForCurrentProj)}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>{t.commandCenter.col1.advanceBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ======================================================================= */}
        {/* CỘT 2: QUẢN TRỊ CÔNG VIỆC NỘI BỘ (INTERNAL TASK DISPATCH)               */}
        {/* ======================================================================= */}
        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {isTenantParticipating
                    ? '2. Nhiệm Vụ Kỹ Thuật, Tài Chính & Pháp Chế'
                    : '2. Phân Công Thẩm Định & Chấm Thầu'}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  {projectTasks.length} {t.commandCenter.col2.taskCountDesc}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateTaskModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.commandCenter.col2.btnAssign}</span>
            </button>
          </div>

          {/* Task Items List */}
          <div className="flex-1 space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
            {projectTasks.map((tItem) => {
              const isDone = tItem.status === TaskStatus.COMPLETED;

              return (
                <div
                  key={tItem.id}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 hover:border-amber-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleToggleTaskStatus(tItem)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                        )}
                      </button>

                      <div className="space-y-0.5">
                        <p
                          className={`text-xs font-bold leading-tight ${
                            isDone
                              ? 'text-slate-400 line-through'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {tItem.taskTitle}
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{tItem.assigneeName}</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            ({tItem.department})
                          </span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                        tItem.priority === TaskPriority.URGENT
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : tItem.priority === TaskPriority.HIGH
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {tItem.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>{t.commandCenter.col2.deadlinePrefix} <strong className="font-mono text-slate-700 dark:text-slate-300">{tItem.deadline}</strong></span>
                    <span
                      className={`font-semibold ${
                        isDone ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {isDone ? t.commandCenter.col2.statusDone : t.commandCenter.col2.statusDoing}
                    </span>
                  </div>
                </div>
              );
            })}

            {projectTasks.length === 0 && (
              <div className="h-32 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-400 font-medium">
                {t.commandCenter.col2.emptyTasks}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* CỘT 3: MỜI THẦU PHỤ & VENDOR RFQS (SUBCONTRACTOR & SOURCING GATEWAY)   */}
        {/* ======================================================================= */}
        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {isTenantParticipating
                    ? '3. Mời Thầu Phụ / Vendor (Cấu Thành Giá)'
                    : '3. Tiếp Nhận Báo Giá Vendor & Lựa Chọn NCC'}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  {projectRfqs.length} {t.commandCenter.col3.rfqCountDesc}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateRfqModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.commandCenter.col3.btnInvite}</span>
            </button>
          </div>

          {/* Vendor RFQs List */}
          <div className="flex-1 space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
            {projectRfqs.map((rfq) => (
              <div
                key={rfq.id}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 hover:border-purple-300 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-purple-600 dark:text-purple-400">
                      {rfq.rfqCode}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight mt-0.5">
                      {rfq.supplierName}
                    </h4>
                  </div>
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                      rfq.status === RfqStatus.QUOTED
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {rfq.status === RfqStatus.QUOTED ? t.commandCenter.col3.statusQuoted : t.commandCenter.col3.statusWaiting}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 font-mono">
                  <span>{t.commandCenter.col3.conditionPrefix} <strong className="text-slate-700 dark:text-slate-300">{rfq.incoterm}</strong></span>
                  <span>{rfq.itemCount} {t.commandCenter.col3.bomItems}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{rfq.currency}</span>
                </div>
              </div>
            ))}

            {projectRfqs.length === 0 && (
              <div className="h-32 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-400 font-medium">
                {t.commandCenter.col3.emptyRfqs}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: QUALITY GATE CHUYỂN BƯỚC                                         */}
      {/* ========================================================================= */}
      {isGateModalOpen && targetAdvanceStage && currentProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t.commandCenter.modals.gateTitle}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{currentProject.projectCode}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGateModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Stage Info */}
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 space-y-1">
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                {t.commandCenter.modals.targetStage}
              </span>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">{t.stages[targetAdvanceStage]}</p>
            </div>

            {/* 4 Layers Gatekeeper Checklist */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-slate-900 dark:text-white">{t.commandCenter.modals.layer1Title}</p>
                  <p className="text-slate-500 mt-0.5">
                    {t.commandCenter.modals.layer1Progress} <strong className="text-blue-600">{currentProject.completionRate}%</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-slate-900 dark:text-white">{t.commandCenter.modals.layer2Title}</p>
                  <p className="text-slate-500 mt-0.5">{t.commandCenter.modals.layer2Desc}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <Lock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-slate-900 dark:text-white">{t.commandCenter.modals.layer4Title}</p>
                  <p className="text-slate-500 mt-0.5">{t.commandCenter.modals.layer4Desc}</p>
                </div>
              </div>
            </div>

            {/* Manager Bypass Section if rate < 100 */}
            {currentProject.completionRate < 100 ? (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{t.commandCenter.modals.bypassWarning}</span>
                </div>
                <textarea
                  rows={2}
                  placeholder={t.commandCenter.modals.bypassPlaceholder}
                  value={bypassReason}
                  onChange={(e) => setBypassReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-amber-200 dark:border-amber-900 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{t.commandCenter.modals.gateSuccess}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsGateModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t.commandCenter.modals.btnCancel}
              </button>
              <button
                type="button"
                disabled={isAdvancing}
                onClick={() => handleConfirmAdvance(currentProject.completionRate < 100)}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isAdvancing ? t.commandCenter.modals.btnAdvancing : t.commandCenter.modals.btnConfirmAdvance}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: GIAO VIỆC NỘI BỘ MỚI                                             */}
      {/* ========================================================================= */}
      {isCreateTaskModalOpen && currentProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {t.commandCenter.modals.createTaskTitle} {currentProject.projectCode}
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateTaskModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.commandCenter.modals.taskTitleLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="VD: Thẩm định thông số kỹ thuật MBA 220kV"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.commandCenter.modals.taskDeptLabel}
                  </label>
                  <select
                    value={taskDept}
                    onChange={(e) => setTaskDept(e.target.value as Department)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={Department.TECHNICAL}>{t.departments.TECHNICAL}</option>
                    <option value={Department.FINANCE}>{t.departments.FINANCE}</option>
                    <option value={Department.LEGAL}>{t.departments.LEGAL}</option>
                    <option value={Department.COMMERCIAL}>{t.departments.COMMERCIAL}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.commandCenter.modals.taskPriorityLabel}
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={TaskPriority.URGENT}>{t.status.URGENT}</option>
                    <option value={TaskPriority.HIGH}>{t.status.HIGH}</option>
                    <option value={TaskPriority.MEDIUM}>{t.status.MEDIUM}</option>
                    <option value={TaskPriority.LOW}>{t.status.LOW}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.commandCenter.modals.taskAssigneeLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.commandCenter.modals.taskDeadlineLabel}
                  </label>
                  <input
                    type="date"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  {t.commandCenter.modals.btnSubmitTask}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: MỜI VENDOR / NHÀ THẦU PHỤ (RFQ) MỚI                              */}
      {/* ========================================================================= */}
      {isCreateRfqModalOpen && currentProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {t.commandCenter.modals.createRfqTitle} {currentProject.projectCode}
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateRfqModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRfq} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.commandCenter.modals.rfqSupplierLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={rfqSupplier}
                  onChange={(e) => setRfqSupplier(e.target.value)}
                  placeholder="VD: SIEMENS Energy AG Germany"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.commandCenter.modals.rfqEmailLabel}
                </label>
                <input
                  type="email"
                  value={rfqEmail}
                  onChange={(e) => setRfqEmail(e.target.value)}
                  placeholder="bidding@siemens-energy.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.commandCenter.modals.rfqIncotermLabel}
                  </label>
                  <select
                    value={rfqIncoterm}
                    onChange={(e) => setRfqIncoterm(e.target.value as Incoterm)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={Incoterm.CIF}>CIF (Cảng Hải Phòng)</option>
                    <option value={Incoterm.FOB}>FOB (Cảng xuất khẩu)</option>
                    <option value={Incoterm.DDP}>DDP (Giao chân công trình)</option>
                    <option value={Incoterm.CIP}>CIP (Vận tải đa phương thức)</option>
                    <option value={Incoterm.EXW}>EXW (Xuất xưởng)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.commandCenter.modals.rfqCurrencyLabel}
                  </label>
                  <select
                    value={rfqCurrency}
                    onChange={(e) => setRfqCurrency(e.target.value as Currency)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={Currency.USD}>USD (Đô La Mỹ)</option>
                    <option value={Currency.EUR}>EUR (Đồng Euro)</option>
                    <option value={Currency.VND}>VND (Việt Nam Đồng)</option>
                    <option value={Currency.JPY}>JPY (Yên Nhật)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.commandCenter.modals.rfqItemCountLabel}
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={rfqItemCount}
                  onChange={(e) => setRfqItemCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateRfqModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  {t.commandCenter.modals.btnSubmitRfq}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
