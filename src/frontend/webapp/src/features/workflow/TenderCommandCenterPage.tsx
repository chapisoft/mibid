'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../shared/i18n';
import { useToast } from '../../shared/toast/ToastContext';
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
  SupplierPartner,
} from '../../shared/types';
import {
  TENDER_STAGE_ORDER,
  STAGE_REQUIREMENTS,
  getStageRequirements,
  StageChecklistItem,
} from '../../shared/constants';
import { tenderService } from '../../services/tenderService';
import { taskService } from '../../services/taskService';
import { sourcingService, RfqInvitationResult } from '../../services/sourcingService';
import { partnerService } from '../../services/partnerService';
import { workflowService } from '../../services/workflowService';
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
  FileCheck,
  UploadCloud,
  FileUp,
  ShieldAlert,
  FilePlus,
  ExternalLink,
  Copy,
  KeyRound,
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

  // Dynamic Stage Requirements từ PostgreSQL Database
  const [dynamicStageReqs, setDynamicStageReqs] = useState<any[]>([]);

  // Task Quality Gate Inspector State (Chốt chặn hoàn thành nhiệm vụ)
  const [selectedTaskForGate, setSelectedTaskForGate] = useState<TaskItem | null>(null);
  const [isTaskGateModalOpen, setIsTaskGateModalOpen] = useState(false);

  // Modal Khai Báo Tiêu Chí / Hồ Sơ Giai Đoạn Mới vào CSDL
  const [isCreateReqModalOpen, setIsCreateReqModalOpen] = useState(false);
  const [newReqTitle, setNewReqTitle] = useState('');
  const [newReqDesc, setNewReqDesc] = useState('');
  const [newReqDocCode, setNewReqDocCode] = useState('');
  const [newReqRole, setNewReqRole] = useState('TECHNICAL_LEAD');
  const [newReqRequired, setNewReqRequired] = useState(true);

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
  const [partners, setPartners] = useState<SupplierPartner[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [rfqTitle, setRfqTitle] = useState('');
  const [rfqIncoterm, setRfqIncoterm] = useState<Incoterm>(Incoterm.CIF);
  const [rfqCurrency, setRfqCurrency] = useState<Currency>(Currency.USD);
  const [rfqItemCount, setRfqItemCount] = useState(1);
  const [rfqDeadline, setRfqDeadline] = useState('');

  // Modal hiển thị kết quả phát hành thư mời kèm Mã & PIN
  const [invitationSuccessData, setInvitationSuccessData] = useState<RfqInvitationResult | null>(null);
  const [isCopiedPin, setIsCopiedPin] = useState(false);

  // Toast thông báo toàn cục chuẩn UX hiện đại thay thế hoàn toàn alert()
  const { showToast } = useToast();

  // Tải dữ liệu toàn hệ thống
  const loadData = async () => {
    try {
      setLoading(false);
      const [projList, taskList, rfqList, partnerList] = await Promise.all([
        tenderService.getProjects(),
        taskService.getTasks(),
        sourcingService.getRfqs(),
        partnerService.getPartners(),
      ]);

      setProjects(projList);
      setTasks(taskList);
      setRfqs(rfqList);
      setPartners(partnerList || []);

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
      console.error('Failed to load Command Center data:', err);
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
    return rfqs.filter((r) => !r.projectId || r.projectId === currentProject.id);
  }, [rfqs, currentProject]);

  // Danh sách các Nhà cung cấp từ CSDL chưa từng được mời vào gói thầu này
  const availableVendors = useMemo(() => {
    if (!currentProject) return [];
    const invitedEmails = new Set(
      projectRfqs.map((r) => (r.supplierEmail || '').trim().toLowerCase())
    );
    return partners.filter((p) => {
      const email = (p.email || '').trim().toLowerCase();
      return email && !invitedEmails.has(email);
    });
  }, [currentProject, projectRfqs, partners]);

  // Tải danh sách yêu cầu giai đoạn từ CSDL PostgreSQL
  const loadProjectStageRequirements = async (projId: string, stage: string) => {
    try {
      const list = await workflowService.getProjectStageRequirements(projId, stage);
      if (list && list.length > 0) {
        setDynamicStageReqs(list);
        const checkedIds = list.filter((item: any) => item.isChecked).map((item: any) => item.id);
        if (checkedIds.length > 0) {
          setCompletedItemsMap((prev) => ({
            ...prev,
            [projId]: Array.from(new Set([...(prev[projId] || []), ...checkedIds])),
          }));
        }
      } else {
        setDynamicStageReqs(getStageRequirements(t, stage as TenderStage));
      }
    } catch {
      setDynamicStageReqs(getStageRequirements(t, stage as TenderStage));
    }
  };

  useEffect(() => {
    if (currentProject?.id && activeStage) {
      loadProjectStageRequirements(currentProject.id, activeStage);
    }
  }, [currentProject?.id, activeStage]);

  // Checklist tài liệu theo bước đang xem (Ưu tiên nạp từ PostgreSQL DB)
  const activeStageRequirements = useMemo(() => {
    if (dynamicStageReqs && dynamicStageReqs.length > 0) {
      return dynamicStageReqs;
    }
    return getStageRequirements(t, activeStage);
  }, [dynamicStageReqs, t, activeStage]);

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

  // Tương tác tích chọn checklist Quality Gate (đồng bộ CSDL)
  const handleToggleCheckItem = async (itemId: string) => {
    if (!currentProject) return;

    const isAlreadyChecked = currentProjectCompletedIds.includes(itemId);
    const nextChecked = !isAlreadyChecked;
    const updatedIds = isAlreadyChecked
      ? currentProjectCompletedIds.filter((id) => id !== itemId)
      : [...currentProjectCompletedIds, itemId];

    setCompletedItemsMap((prev) => ({
      ...prev,
      [currentProject.id]: updatedIds,
    }));

    // Cập nhật trạng thái vào PostgreSQL DB
    try {
      await workflowService.toggleChecklistItemStatus(currentProject.id, itemId, nextChecked);
    } catch (e) {
      console.error('Failed to persist checklist item status to database:', e);
    }

    // Cập nhật state nội bộ
    setDynamicStageReqs((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, isChecked: nextChecked } : item))
    );

    // Tính lại completionRate cho dự án nếu đang ở bước hiện tại của dự án
    if (activeStage === currentProject.currentStage) {
      const stageReqs = activeStageRequirements.length > 0 ? activeStageRequirements : (STAGE_REQUIREMENTS[currentProject.currentStage] || []);
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

  // Khai báo thêm tiêu chí / hồ sơ mới cho giai đoạn này vào CSDL
  const handleCreateStageRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqTitle.trim() || !currentProject) return;

    try {
      const created = await workflowService.createStageRequirement(currentProject.id, {
        title: newReqTitle.trim(),
        description: newReqDesc.trim(),
        docCode: newReqDocCode.trim() || `REQ_${Date.now().toString().slice(-4)}`,
        assigneeRole: newReqRole.trim(),
        isRequired: newReqRequired,
        stage: activeStage,
        sortOrder: dynamicStageReqs.length + 1,
      });

      setDynamicStageReqs((prev) => [...prev, created]);
      setIsCreateReqModalOpen(false);
      setNewReqTitle('');
      setNewReqDesc('');
      setNewReqDocCode('');
      showToast(t.commandCenter.modals.btnSaveReq, 'success');
    } catch (err) {
      console.error('Failed to declare stage requirement in database:', err);
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
      showToast(t.commandCenter.modals.bypassPlaceholder, 'warning');
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
      showToast(err.message || t.common.loading, 'error');
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
  // Đổi trạng thái công việc có chốt chặn Validate Gate
  const handleToggleTaskStatus = async (tItem: TaskItem) => {
    if (tItem.status === TaskStatus.COMPLETED) {
      // Cho phép hoàn tác về đang thực hiện
      const updated = await taskService.updateTask(tItem.id, {
        status: TaskStatus.IN_PROGRESS,
        checklistDone: Math.max(1, (tItem.gateChecklists?.filter((c) => c.isPassed).length || 1) - 1),
      });
      setTasks((prev) => prev.map((item) => (item.id === tItem.id ? updated : item)));
      return;
    }

    // Kiểm tra chốt chặn Quality Gate: Hồ sơ chứng minh và Tiêu chí thẩm định
    const docsTotal = tItem.evidenceDocs?.length || 0;
    const docsUploaded = tItem.evidenceDocs?.filter((d) => d.isUploaded).length || 0;
    const checksTotal = tItem.gateChecklists?.length || 0;
    const checksPassed = tItem.gateChecklists?.filter((c) => c.isPassed).length || 0;

    const isGatePassed =
      (docsTotal === 0 || docsUploaded === docsTotal) &&
      (checksTotal === 0 || checksPassed === checksTotal);

    if (!isGatePassed) {
      // BẮT BUỘC CHẶN LẠI: Mở Inspector để bổ sung hồ sơ chứng minh và xác nhận checklist
      setSelectedTaskForGate(tItem);
      setIsTaskGateModalOpen(true);
      return;
    }

    try {
      const updated = await taskService.completeTaskWithGate(tItem.id);
      setTasks((prev) => prev.map((item) => (item.id === tItem.id ? updated : item)));
    } catch (err: any) {
      setSelectedTaskForGate(tItem);
      setIsTaskGateModalOpen(true);
    }
  };

  // Tải lên / Đính kèm tài liệu chứng minh cho Task
  const handleUploadEvidenceDoc = async (docId: string) => {
    if (!selectedTaskForGate) return;
    const updatedDocs = (selectedTaskForGate.evidenceDocs || []).map((doc) =>
      doc.id === docId
        ? {
            ...doc,
            isUploaded: true,
            uploadedAt: new Date().toISOString(),
            uploadedBy: t.commandCenter.commonRoles.technicalEngineer,
            fileUrl: `/dms/preview/${doc.docCode}`,
          }
        : doc
    );

    const updatedTask = {
      ...selectedTaskForGate,
      evidenceDocs: updatedDocs,
    };

    setSelectedTaskForGate(updatedTask);
    const saved = await taskService.updateTask(selectedTaskForGate.id, {
      evidenceDocs: updatedDocs,
    });
    setTasks((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
  };

  // Tích chọn tiêu chí thẩm định tiên quyết cho Task
  const handleToggleGateChecklist = async (chkId: string) => {
    if (!selectedTaskForGate) return;
    const updatedChecks = (selectedTaskForGate.gateChecklists || []).map((chk) =>
      chk.id === chkId
        ? {
            ...chk,
            isPassed: !chk.isPassed,
            passedAt: !chk.isPassed ? new Date().toISOString() : undefined,
            passedBy: !chk.isPassed ? t.commandCenter.commonRoles.chiefEngineer : undefined,
          }
        : chk
    );

    const updatedTask = {
      ...selectedTaskForGate,
      gateChecklists: updatedChecks,
    };

    setSelectedTaskForGate(updatedTask);
    const saved = await taskService.updateTask(selectedTaskForGate.id, {
      gateChecklists: updatedChecks,
      checklistDone: updatedChecks.filter((c) => c.isPassed).length,
    });
    setTasks((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
  };

  // Xác nhận hoàn thành Task sau khi thỏa mãn 100% Quality Gate
  const handleConfirmCompleteTaskWithGate = async () => {
    if (!selectedTaskForGate) return;
    try {
      const completed = await taskService.completeTaskWithGate(selectedTaskForGate.id);
      setTasks((prev) => prev.map((t) => (t.id === completed.id ? completed : t)));
      setIsTaskGateModalOpen(false);
      setSelectedTaskForGate(null);
    } catch (e: any) {
      showToast(e.message || t.commandCenter.modals.taskGateIncompleteError, 'warning');
    }
  };

  // Mở modal tạo RFQ mời Vendor mới từ CSDL
  const handleOpenCreateRfqModal = () => {
    if (availableVendors.length > 0) {
      setSelectedVendorId(availableVendors[0].id);
    } else {
      setSelectedVendorId('');
    }
    setRfqTitle('');
    setRfqItemCount(1);
    setRfqDeadline('');
    setIsCreateRfqModalOpen(true);
  };

  // Tạo RFQ mời Vendor mới từ CSDL với Mã Thư Mời và PIN riêng
  const handleCreateRfq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorId || !currentProject) return;

    const vendor = partners.find((p) => p.id === selectedVendorId);
    if (!vendor) return;

    try {
      const result = await sourcingService.inviteVendor({
        projectId: currentProject.id,
        projectName: currentProject.projectName,
        projectCode: currentProject.projectCode,
        vendorId: selectedVendorId,
        title: rfqTitle.trim() || undefined,
        incoterm: rfqIncoterm,
        currency: rfqCurrency,
        itemCount: rfqItemCount,
        submissionDeadline: rfqDeadline ? new Date(rfqDeadline).toISOString() : undefined,
      });

      const newRfqPackage: RfqPackage = {
        id: result.rfqId,
        rfqCode: result.rfqCode,
        title: result.projectName,
        projectId: result.projectId,
        projectName: result.projectName,
        supplierName: result.companyName,
        supplierEmail: result.vendorEmail,
        itemCount: result.itemCount,
        currency: result.currency as Currency,
        incoterm: result.incoterm as Incoterm,
        totalQuoteAmount: 0,
        status: RfqStatus.SENT,
        createdAt: result.invitedAt,
        invitationCode: result.invitationCode,
      };

      setRfqs((prev) => [newRfqPackage, ...prev]);
      setIsCreateRfqModalOpen(false);
      setInvitationSuccessData(result);
      setIsCopiedPin(false);
      showToast(t.commandCenter.modals.invitationSuccessTitle, 'success');
    } catch (err: any) {
      showToast(err.message || t.common.loading, 'error');
    }
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
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              • {t.commandCenter.tagline}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            {t.commandCenter.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium mt-1">
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
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
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
                        [{p.tenderType === TenderType.TENANT_PARTICIPATING ? t.commandCenter.tenderType.participating : t.commandCenter.tenderType.issued}] [{p.projectCode}] {p.projectName}
                      </option>
                    ))}
                  </select>

                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {t.commandCenter.projectFocus.investorLabel} <strong className="text-slate-900 dark:text-white font-bold">{currentProject.investorName}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Executive KPI Indicator Cards for this focused Tender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-bold uppercase">
                <span>{t.commandCenter.kpi.stageProgress} {TENDER_STAGE_ORDER.indexOf(currentProject.currentStage) + 1}</span>
                <Sparkles className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                  {currentProject.completionRate}%
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
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
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-bold uppercase">
                <span>{t.commandCenter.kpi.budget}</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {currentProject.budgetCurrency === Currency.VND
                  ? `${(currentProject.budgetAmount / 1000000000).toFixed(1)} ${t.commandCenter.tenderType.billionSuffix}`
                  : `${currentProject.budgetAmount.toLocaleString()} USD`}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{t.commandCenter.kpi.deadline} <strong className="font-mono text-slate-800 dark:text-slate-200">{currentProject.submissionDeadline}</strong></p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-bold uppercase">
                <span>{t.commandCenter.kpi.internalTasks}</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                  {projectTasks.length}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  ({projectTasks.filter((tItem) => tItem.status === TaskStatus.COMPLETED).length} {t.commandCenter.kpi.completedTasks})
                </span>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">{t.commandCenter.kpi.taskDepts}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-bold uppercase">
                <span>{t.commandCenter.kpi.vendorRfqs}</span>
                <Building2 className="w-4 h-4 text-purple-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
                  {projectRfqs.length}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{t.commandCenter.kpi.subcontractors}</span>
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">{t.commandCenter.kpi.sourcingDesc}</p>
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
          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
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
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                  {isTenantParticipating
                    ? t.commandCenter.col1.participatingTitle
                    : t.commandCenter.col1.issuedTitle}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-0.5 truncate">
                  {t.stages[activeStage]}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsCreateReqModalOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/80 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border border-blue-200 dark:border-blue-800 whitespace-nowrap shrink-0"
                title={t.commandCenter.col1.createReqTooltip}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.commandCenter.col1.createReqBtn}</span>
              </button>

              <button
                type="button"
                onClick={handleCompleteAllForActiveStage}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs font-bold text-blue-600 dark:text-blue-400 transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
              >
                {t.commandCenter.col1.mark100}
              </button>
            </div>
          </div>

          {/* Progress Bar for Active Stage */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-200">
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
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 shadow-2xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                  }`}
                >
                  <button type="button" className="mt-0.5 shrink-0 text-emerald-600">
                    {isChecked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    )}
                  </button>

                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-xs font-bold leading-tight ${
                          isChecked
                            ? 'text-slate-800 dark:text-slate-100 line-through opacity-85'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {item.title}
                      </p>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed font-normal">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-600 dark:text-slate-300 font-mono font-medium">
                      <span>{t.commandCenter.col1.codePrefix} <strong className="font-semibold text-slate-800 dark:text-slate-100">{item.docCode}</strong></span>
                      <span className="text-blue-600 dark:text-blue-400 font-sans font-medium">• {item.assigneeRole}</span>
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
                    ? t.commandCenter.col2.participatingTitle
                    : t.commandCenter.col2.issuedTitle}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-0.5">
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
              const hasGate = (tItem.evidenceDocs && tItem.evidenceDocs.length > 0) || (tItem.gateChecklists && tItem.gateChecklists.length > 0);
              const docsUploaded = tItem.evidenceDocs?.filter((d) => d.isUploaded).length || 0;
              const docsTotal = tItem.evidenceDocs?.length || 0;

              return (
                <div
                  key={tItem.id}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 hover:border-amber-300 dark:hover:border-amber-700 transition-all shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleToggleTaskStatus(tItem)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                        title={isDone ? t.commandCenter.col2.undoTitle : t.commandCenter.col2.completeTitle}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <p
                          className={`text-xs font-bold leading-tight ${
                            isDone
                              ? 'text-slate-500 dark:text-slate-400 line-through'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {tItem.taskTitle}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5 pt-0.5">
                          <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                          <span className="font-semibold text-slate-800 dark:text-slate-100">{tItem.assigneeName}</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            ({tItem.department})
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                          tItem.priority === TaskPriority.URGENT
                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                            : tItem.priority === TaskPriority.HIGH
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {tItem.priority}
                      </span>

                      {/* Badge Nút Mở Thẩm Định Tiêu Chuẩn Nhiệm Vụ */}
                      {hasGate && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTaskForGate(tItem);
                            setIsTaskGateModalOpen(true);
                          }}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                            docsUploaded === docsTotal && docsTotal > 0
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 hover:bg-amber-100'
                          }`}
                          title={t.commandCenter.col2.criteriaDetailsTooltip}
                        >
                          <ShieldAlert className="w-3 h-3" />
                          <span>{t.commandCenter.col2.criteriaBadge}: {docsUploaded}/{docsTotal}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <span>{t.commandCenter.col2.deadlinePrefix} <strong className="font-mono font-bold text-slate-800 dark:text-slate-200">{tItem.deadline}</strong></span>
                    <span
                      className={`font-bold ${
                        isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {isDone ? t.commandCenter.col2.statusDone : t.commandCenter.col2.statusDoing}
                    </span>
                  </div>
                </div>
              );
            })}

            {projectTasks.length === 0 && (
              <div className="h-32 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                {t.commandCenter.col2.emptyTasks}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* CỘT 3: MỜI THẦU PHỤ & VENDOR RFQS (SUBCONTRACTOR & SOURCING GATEWAY)   */}
        {/* ======================================================================= */}
        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                  {isTenantParticipating
                    ? t.commandCenter.col3.participatingTitle
                    : t.commandCenter.col3.issuedTitle}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-0.5 truncate">
                  {projectRfqs.length} {t.commandCenter.col3.rfqCountDesc}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateRfqModal}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer whitespace-nowrap shrink-0"
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
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 hover:border-purple-300 dark:hover:border-purple-700 transition-all shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                      {rfq.rfqCode}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight mt-0.5">
                      {rfq.supplierName}
                    </h4>
                  </div>
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                      rfq.status === RfqStatus.QUOTED
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {rfq.status === RfqStatus.QUOTED ? t.commandCenter.col3.statusQuoted : t.commandCenter.col3.statusWaiting}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1.5 border-t border-slate-100 dark:border-slate-800 font-medium">
                  <span>{t.commandCenter.col3.conditionPrefix} <strong className="font-bold text-slate-900 dark:text-white">{rfq.incoterm}</strong></span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{rfq.itemCount} {t.commandCenter.col3.bomItems}</span>
                  <span className="font-black text-slate-900 dark:text-white font-mono">{rfq.currency}</span>
                </div>

                {rfq.invitationCode && (
                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <span className="font-mono">
                      {t.commandCenter.modals.invitationCodeLabel}: <strong className="text-purple-600 dark:text-purple-400 font-bold">{rfq.invitationCode}</strong>
                    </span>
                    <a
                      href={`/vendor/rfq/${rfq.invitationCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 font-bold hover:underline"
                    >
                      <span>Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}

            {projectRfqs.length === 0 && (
              <div className="h-32 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 font-medium">
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
                  placeholder={t.commandCenter.modals.taskTitlePlaceholder}
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
      {/* MODAL 3: MỜI VENDOR / NHÀ THẦU PHỤ (RFQ) MỚI TỪ CƠ SỞ DỮ LIỆU             */}
      {/* ========================================================================= */}
      {isCreateRfqModalOpen && currentProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {t.commandCenter.modals.createRfqTitle} {currentProject.projectCode}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.commandCenter.modals.vendorSelectLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateRfqModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRfq} className="space-y-3.5">
              {/* Chọn Nhà Cung Cấp chưa được mời */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.commandCenter.modals.vendorSelectLabel} <span className="text-red-500">*</span>
                </label>
                {availableVendors.length > 0 ? (
                  <select
                    required
                    value={selectedVendorId}
                    onChange={(e) => setSelectedVendorId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {availableVendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.country || t.commandCenter.commonRoles.international} - {v.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 space-y-2">
                    <p className="text-xs font-semibold">
                      {t.commandCenter.modals.vendorAlreadyAllInvited}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateRfqModalOpen(false);
                        onNavigateScreen?.('partners');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{t.commandCenter.modals.btnManageVendors}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Thông tin vắn tắt về Vendor đang chọn */}
              {availableVendors.length > 0 && selectedVendorId && (() => {
                const selected = partners.find((p) => p.id === selectedVendorId);
                if (!selected) return null;
                return (
                  <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-900 dark:text-purple-200">{selected.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-300">
                        {selected.country || t.commandCenter.commonRoles.international}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                      <span>Email: <strong className="font-mono text-slate-800 dark:text-slate-200">{selected.email}</strong></span>
                      {selected.taxCode && <span>MST: <strong className="font-mono">{selected.taxCode}</strong></span>}
                    </div>
                  </div>
                );
              })()}

              {/* Tiêu đề yêu cầu báo giá */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.commandCenter.modals.rfqTitleLabel}
                </label>
                <input
                  type="text"
                  value={rfqTitle}
                  onChange={(e) => setRfqTitle(e.target.value)}
                  placeholder={`${currentProject.projectName} - RFQ`}
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
                    <option value={Incoterm.CIF}>CIF</option>
                    <option value={Incoterm.FOB}>FOB</option>
                    <option value={Incoterm.DDP}>DDP</option>
                    <option value={Incoterm.CIP}>CIP</option>
                    <option value={Incoterm.EXW}>EXW</option>
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
                    <option value={Currency.USD}>USD</option>
                    <option value={Currency.EUR}>EUR</option>
                    <option value={Currency.VND}>VND</option>
                    <option value={Currency.JPY}>JPY</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.commandCenter.col2.deadlinePrefix}
                  </label>
                  <input
                    type="date"
                    value={rfqDeadline}
                    onChange={(e) => setRfqDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
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
                  disabled={availableVendors.length === 0}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {t.commandCenter.modals.btnSubmitRfq}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: THÔNG BÁO KẾT QUẢ PHÁT HÀNH RFQ KÈM MÃ & PIN BẢO MẬT              */}
      {/* ========================================================================= */}
      {invitationSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    {t.commandCenter.modals.invitationSuccessTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {invitationSuccessData.companyName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInvitationSuccessData(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t.commandCenter.modals.invitationCodeLabel}
                </span>
                <span className="font-mono text-sm font-black px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                  {invitationSuccessData.invitationCode}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t.commandCenter.modals.securityPinLabel}
                </span>
                <span className="font-mono text-base font-black px-3 py-1 rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 tracking-widest ring-1 ring-amber-400/40">
                  {invitationSuccessData.securityPin}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium block">
                  ⚠️ {t.commandCenter.modals.securityPinWarning}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.commandCenter.modals.vendorPortalUrlLabel}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`http://localhost:3000${invitationSuccessData.portalUrl}`}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300 select-all"
                />
                <a
                  href={`/vendor/rfq/${invitationSuccessData.invitationCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-200 text-xs font-bold shrink-0 inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>{t.commandCenter.modals.btnTestVendorPortal}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => {
                  const originUrl = typeof window !== 'undefined' ? window.location.origin : '';
                  const copyText = `${t.commandCenter.modals.invitationEmailDear} ${invitationSuccessData.companyName}\n${t.commandCenter.modals.invitationEmailBody} ${invitationSuccessData.projectName}\n- ${t.commandCenter.modals.invitationEmailCodeLine} ${invitationSuccessData.invitationCode}\n- ${t.commandCenter.modals.invitationEmailPinLine} ${invitationSuccessData.securityPin}\n- ${t.commandCenter.modals.invitationEmailUrlLine} ${originUrl}${invitationSuccessData.portalUrl}`;
                  navigator.clipboard.writeText(copyText);
                  setIsCopiedPin(true);
                  setTimeout(() => setIsCopiedPin(false), 3000);
                }}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {isCopiedPin ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>{t.commandCenter.modals.btnCopiedSuccess}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>{t.commandCenter.modals.btnCopyInvitation}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setInvitationSuccessData(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {t.commandCenter.modals.btnCancel}
              </button>
            </div>
          </div>
        </div>
      )}



      {/* ========================================================================= */}
      {/* MODAL 4: KIỂM SOÁT QUALITY GATE NHIỆM VỤ (TASK QUALITY GATE INSPECTOR)    */}
      {/* ========================================================================= */}
      {isTaskGateModalOpen && selectedTaskForGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {t.commandCenter.modals.taskGateTitle}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {selectedTaskForGate.projectCode} • <span className="font-bold text-slate-800 dark:text-slate-100">{selectedTaskForGate.taskTitle}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsTaskGateModalOpen(false);
                  setSelectedTaskForGate(null);
                }}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Banner trạng thái Gate */}
            {(() => {
              const docsTotal = selectedTaskForGate.evidenceDocs?.length || 0;
              const docsUploaded = selectedTaskForGate.evidenceDocs?.filter((d) => d.isUploaded).length || 0;
              const checksTotal = selectedTaskForGate.gateChecklists?.length || 0;
              const checksPassed = selectedTaskForGate.gateChecklists?.filter((c) => c.isPassed).length || 0;
              const isReady = (docsTotal === 0 || docsUploaded === docsTotal) && (checksTotal === 0 || checksPassed === checksTotal);

              return (
                <div
                  className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    isReady
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100'
                      : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100'
                  }`}
                >
                  {isReady ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-sm">
                      {isReady
                        ? t.commandCenter.modals.readyBannerTitle
                        : t.commandCenter.modals.notReadyBannerTitle}
                    </p>
                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                      {isReady
                        ? t.commandCenter.modals.readyBannerDesc
                        : t.commandCenter.modals.notReadyBannerDesc}
                    </p>
                    <div className="flex items-center gap-4 pt-1 font-mono font-semibold">
                      <span>{t.commandCenter.modals.evidenceDocsStats} <strong className={docsUploaded === docsTotal && docsTotal > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>{docsUploaded}/{docsTotal}</strong></span>
                      <span>{t.commandCenter.modals.checklistsStats} <strong className={checksPassed === checksTotal && checksTotal > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>{checksPassed}/{checksTotal}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* PHẦN 1: HỒ SƠ & TÀI LIỆU CHỨNG MINH */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  <span>{t.commandCenter.modals.sec1Title}</span>
                </h4>
                <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                  {selectedTaskForGate.evidenceDocs?.filter((d) => d.isUploaded).length || 0}/
                  {selectedTaskForGate.evidenceDocs?.length || 0} {t.commandCenter.modals.submittedCountSuffix}
                </span>
              </div>

              <div className="space-y-2">
                {(selectedTaskForGate.evidenceDocs || []).map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      doc.isUploaded
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {doc.isUploaded ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-amber-500 shrink-0" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {doc.name}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                          <span>{t.commandCenter.col1.codePrefix} <strong className="font-semibold text-slate-800 dark:text-slate-200">{doc.docCode}</strong></span>
                          {doc.isUploaded && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-700 dark:text-emerald-300 font-sans font-medium">{t.commandCenter.modals.uploadedByPrefix} {doc.uploadedBy}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      {doc.isUploaded ? (
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold font-mono">
                          {t.commandCenter.modals.validBadge}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleUploadEvidenceDoc(doc.id)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>{t.commandCenter.modals.btnUploadDoc}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {(!selectedTaskForGate.evidenceDocs || selectedTaskForGate.evidenceDocs.length === 0) && (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    {t.commandCenter.modals.emptyEvidenceDocs}
                  </p>
                )}
              </div>
            </div>

            {/* PHẦN 2: TIÊU CHÍ THẨM ĐỊNH TIÊN QUYẾT */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>{t.commandCenter.modals.sec2Title}</span>
                </h4>
                <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                  {selectedTaskForGate.gateChecklists?.filter((c) => c.isPassed).length || 0}/
                  {selectedTaskForGate.gateChecklists?.length || 0} {t.commandCenter.modals.passedCountSuffix}
                </span>
              </div>

              <div className="space-y-2">
                {(selectedTaskForGate.gateChecklists || []).map((chk) => (
                  <div
                    key={chk.id}
                    onClick={() => handleToggleGateChecklist(chk.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      chk.isPassed
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button type="button" className="shrink-0 text-emerald-600">
                        {chk.isPassed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        )}
                      </button>
                      <div>
                        <p className={`text-xs font-bold leading-tight ${chk.isPassed ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                          {chk.title}
                        </p>
                        {chk.isPassed && (
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-sans mt-0.5">
                            {t.commandCenter.modals.passedConfirmPrefix} {t.commandCenter.commonRoles.chiefEngineer}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      chk.isPassed
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      {chk.isPassed ? t.commandCenter.modals.passBadge : t.commandCenter.modals.failBadge}
                    </span>
                  </div>
                ))}

                {(!selectedTaskForGate.gateChecklists || selectedTaskForGate.gateChecklists.length === 0) && (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    {t.commandCenter.modals.emptyChecklists}
                  </p>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            {(() => {
              const docsTotal = selectedTaskForGate.evidenceDocs?.length || 0;
              const docsUploaded = selectedTaskForGate.evidenceDocs?.filter((d) => d.isUploaded).length || 0;
              const checksTotal = selectedTaskForGate.gateChecklists?.length || 0;
              const checksPassed = selectedTaskForGate.gateChecklists?.filter((c) => c.isPassed).length || 0;
              const isReady = (docsTotal === 0 || docsUploaded === docsTotal) && (checksTotal === 0 || checksPassed === checksTotal);

              return (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 mt-1">
                  <div className="flex items-center gap-2">
                    {isReady ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold whitespace-nowrap shadow-2xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{t.commandCenter.modals.readyStatusText}</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold whitespace-nowrap shadow-2xs">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>
                          {t.commandCenter.modals.missingStatusTextPrefix}{' '}
                          <strong className="font-bold font-mono text-amber-950 dark:text-amber-100">{docsTotal - docsUploaded}</strong> {t.commandCenter.modals.missingDocsSuffix} &amp;{' '}
                          <strong className="font-bold font-mono text-amber-950 dark:text-amber-100">{checksTotal - checksPassed}</strong> {t.commandCenter.modals.missingChecksSuffix}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setIsTaskGateModalOpen(false);
                        setSelectedTaskForGate(null);
                      }}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {t.common.cancel}
                    </button>

                    <button
                      type="button"
                      disabled={!isReady}
                      onClick={handleConfirmCompleteTaskWithGate}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
                        isReady
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 cursor-pointer active:scale-[0.98]'
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>{t.commandCenter.modals.btnConfirmCompleteTask}</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: KHAI BÁO TIÊU CHÍ / HỒ SƠ ĐÁNH GIÁ GIAI ĐOẠN MỚI VÀO CSDL       */}
      {/* ========================================================================= */}
      {isCreateReqModalOpen && currentProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
                  <FilePlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {t.commandCenter.modals.createReqTitle}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {currentProject.projectCode} • {t.stages[activeStage]}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateReqModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStageRequirement} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.commandCenter.modals.reqTitleLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newReqTitle}
                  onChange={(e) => setNewReqTitle(e.target.value)}
                  placeholder={t.commandCenter.modals.reqTitlePlaceholder}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.commandCenter.modals.reqDescLabel}
                </label>
                <textarea
                  rows={2}
                  value={newReqDesc}
                  onChange={(e) => setNewReqDesc(e.target.value)}
                  placeholder={t.commandCenter.modals.reqDescPlaceholder}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.commandCenter.modals.reqDocCodeLabel}
                  </label>
                  <input
                    type="text"
                    value={newReqDocCode}
                    onChange={(e) => setNewReqDocCode(e.target.value)}
                    placeholder="VD: FAT_REPORT_CERT"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.commandCenter.modals.reqRoleLabel}
                  </label>
                  <select
                    value={newReqRole}
                    onChange={(e) => setNewReqRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TECHNICAL_LEAD">{t.commandCenter.modals.roleTechLead}</option>
                    <option value="FINANCE_LEAD">{t.commandCenter.modals.roleFinanceLead}</option>
                    <option value="LEGAL_LEAD">{t.commandCenter.modals.roleLegalLead}</option>
                    <option value="BID_MANAGER">{t.commandCenter.modals.roleBidManager}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="reqRequired"
                  checked={newReqRequired}
                  onChange={(e) => setNewReqRequired(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="reqRequired" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  {t.commandCenter.modals.reqRequiredCheckbox}
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateReqModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  {t.commandCenter.modals.btnSaveReq}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
