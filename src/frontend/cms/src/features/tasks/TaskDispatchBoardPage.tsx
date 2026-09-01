'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../shared/i18n';
import { DataTable, Column } from '../../shared/components/DataTable';
import { Plus, Search, X, Trash2, ChevronDown, Edit3, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Department, TaskItem, TaskPriority, TaskStatus } from '../../shared/types';
import { DEPARTMENT_LIST } from '../../shared/constants';
import { taskService } from '../../services/taskService';

// Giả định ngày hiện tại hệ thống là 2026-09-09
const SYSTEM_CURRENT_DATE = '2026-09-09';

// Định dạng ngày ngắn gọn dd/MM/yyyy
const formatShortDate = (iso: string) => {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return iso;
};

// Định dạng ngày rút gọn dd/MM
const formatMiniDate = (iso: string) => {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  return iso;
};

export function TaskDispatchBoardPage() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [timeFilter, setTimeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState<TaskItem | null>(null);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaskItem | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newDept, setNewDept] = useState<Department>(Department.TECHNICAL);
  const [newAssignee, setNewAssignee] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>(TaskPriority.HIGH);
  const [newProjectCode, setNewProjectCode] = useState('BID-2026-EVN-001');
  const [newStartDate, setNewStartDate] = useState('2026-09-09');
  const [newDeadline, setNewDeadline] = useState('2026-09-25');
  const [newChecklistTotal, setNewChecklistTotal] = useState<number>(4);

  useEffect(() => {
    taskService.getTasks().then((data) => setTasks(data));
  }, []);

  // Tính số ngày chênh lệch giữa 2 ngày
  const calcDaysDiff = (targetDate: string, baseDate: string = SYSTEM_CURRENT_DATE) => {
    const tMs = new Date(targetDate).getTime();
    const bMs = new Date(baseDate).getTime();
    return Math.round((tMs - bMs) / (1000 * 60 * 60 * 24));
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const created = await taskService.addTask({
      taskTitle: newTitle,
      department: newDept,
      projectCode: newProjectCode || 'BID-2026-EVN-001',
      assigneeName: newAssignee || 'Nguyễn Văn Hùng',
      priority: newPriority,
      startDate: newStartDate || '2026-09-09',
      deadline: newDeadline || '2026-09-25',
      checklistTotal: newChecklistTotal,
    });

    setTasks([created, ...tasks]);
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewAssignee('');
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    const updated = await taskService.updateTask(editingTask.id, editingTask);
    setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
    setEditingTask(null);
  };

  const handleToggleStatus = async (task: TaskItem) => {
    const nextStatus =
      task.status === TaskStatus.COMPLETED
        ? TaskStatus.IN_PROGRESS
        : task.status === TaskStatus.IN_PROGRESS
        ? TaskStatus.COMPLETED
        : TaskStatus.IN_PROGRESS;

    const updated = await taskService.updateTaskStatus(task.id, nextStatus);
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    await taskService.deleteTask(deletingTask.id);
    setTasks((prev) => prev.filter((t) => t.id !== deletingTask.id));
    setSelectedIds((prev) => prev.filter((id) => id !== deletingTask.id));
    setDeletingTask(null);
  };

  // Department counts
  const deptCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: tasks.length };
    DEPARTMENT_LIST.forEach((d) => {
      counts[d] = tasks.filter((t) => t.department === d).length;
    });
    return counts;
  }, [tasks]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((item) => {
      // Dept filter
      if (deptFilter !== 'ALL' && item.department !== deptFilter) return false;
      // Priority filter
      if (priorityFilter !== 'ALL' && item.priority !== priorityFilter) return false;
      // Status filter
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;

      // Time filter
      if (timeFilter !== 'ALL') {
        const daysLeft = calcDaysDiff(item.deadline, SYSTEM_CURRENT_DATE);
        if (timeFilter === 'DUE_SOON') {
          if (item.status === TaskStatus.COMPLETED || daysLeft < 0 || daysLeft > 3) return false;
        } else if (timeFilter === 'OVERDUE') {
          if (item.status === TaskStatus.COMPLETED || daysLeft >= 0) return false;
        } else if (timeFilter === 'THIS_WEEK') {
          if (daysLeft < 0 || daysLeft > 7) return false;
        } else if (timeFilter === 'THIS_MONTH') {
          if (!item.deadline.startsWith('2026-09')) return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.taskTitle.toLowerCase().includes(q);
        const matchesCode = item.projectCode?.toLowerCase().includes(q);
        const matchesAssignee = item.assigneeName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCode && !matchesAssignee) return false;
      }
      return true;
    });
  }, [tasks, deptFilter, priorityFilter, statusFilter, timeFilter, searchQuery]);

  // Statistics
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;
  const urgentTasks = tasks.filter((t) => t.priority === TaskPriority.URGENT || t.priority === TaskPriority.HIGH).length;
  const completedTasks = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;

  const isFilterActive =
    deptFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    timeFilter !== 'ALL' ||
    searchQuery.trim() !== '';

  const handleResetFilters = () => {
    setDeptFilter('ALL');
    setPriorityFilter('ALL');
    setStatusFilter('ALL');
    setTimeFilter('ALL');
    setSearchQuery('');
  };

  // Department Badge Colors
  const getDeptBadgeStyle = (dept: Department) => {
    switch (dept) {
      case Department.TECHNICAL:
        return 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800';
      case Department.COMMERCIAL:
        return 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case Department.FINANCE:
        return 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case Department.LEGAL:
        return 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const columns: Column<TaskItem>[] = [
    {
      key: 'taskTitle',
      header: t.tasks.taskTitle,
      render: (item) => (
        <div className="space-y-0.5 py-0.5">
          <button
            type="button"
            onClick={() => setViewingTask(item)}
            className="font-bold text-xs sm:text-[13.5px] text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 text-left leading-tight cursor-pointer transition-colors"
          >
            {item.taskTitle}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-700">
              {item.projectCode}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      header: t.tasks.department,
      width: '180px',
      align: 'center',
      render: (item) => (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap border shadow-2xs ${getDeptBadgeStyle(
            item.department
          )}`}
        >
          {t.departments[item.department] || item.department}
        </span>
      ),
    },
    {
      key: 'timeSchedule',
      header: 'Thời Gian Thực Hiện',
      width: '160px',
      render: (item) => {
        const duration = item.durationDays || Math.max(1, calcDaysDiff(item.deadline, item.startDate));
        return (
          <div className="space-y-0.5 py-0.5 whitespace-nowrap">
            <div className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
              <span>{formatMiniDate(item.startDate)}</span>
              <span className="text-slate-400 mx-1">→</span>
              <span className="text-blue-600 dark:text-blue-400">{formatShortDate(item.deadline)}</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Thời lượng: <strong className="font-mono text-slate-700 dark:text-slate-300">{duration} ngày</strong>
            </div>
          </div>
        );
      },
    },
    {
      key: 'assigneeName',
      header: t.tasks.assignee,
      width: '140px',
      render: (item) => (
        <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 truncate block">
          {item.assigneeName}
        </span>
      ),
    },
    {
      key: 'priority',
      header: t.tasks.priority,
      width: '100px',
      align: 'center',
      render: (item) => {
        const isUrgent = item.priority === TaskPriority.URGENT;
        const isHigh = item.priority === TaskPriority.HIGH;

        return (
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${
              isUrgent
                ? 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-900'
                : isHigh
                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {t.status[item.priority] || item.priority}
          </span>
        );
      },
    },
    {
      key: 'checklistTotal',
      header: t.tasks.checklist,
      width: '110px',
      align: 'center',
      render: (item) => (
        <div className="space-y-1 text-center whitespace-nowrap">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {item.checklistDone} / {item.checklistTotal}
          </span>
          <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                item.checklistDone === item.checklistTotal ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${(item.checklistDone / item.checklistTotal) * 100}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'statusSla',
      header: 'Trạng Thái & Hạn SLA',
      width: '150px',
      align: 'center',
      render: (item) => {
        const isCompleted = item.status === TaskStatus.COMPLETED;
        const daysLeft = calcDaysDiff(item.deadline, SYSTEM_CURRENT_DATE);

        return (
          <div className="space-y-1 py-0.5 whitespace-nowrap text-center">
            {/* Nút trạng thái */}
            <div>
              <button
                type="button"
                onClick={() => handleToggleStatus(item)}
                className={`inline-block px-3 py-0.8 rounded-full text-xs font-semibold transition-all transform active:scale-95 whitespace-nowrap shadow-2xs ${
                  isCompleted
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100'
                    : item.status === TaskStatus.IN_PROGRESS
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 hover:bg-blue-100'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
                title="Nhấp để chuyển trạng thái"
              >
                {t.status[item.status] || item.status}
              </button>
            </div>

            {/* Dòng 2: Hạn SLA (Chỉ hiển thị khi chưa hoàn tất) */}
            {!isCompleted && (
              <div className="text-[11px] leading-none">
                {daysLeft < 0 ? (
                  <span className="text-red-600 dark:text-red-400 font-semibold">Trễ {Math.abs(daysLeft)} ngày</span>
                ) : daysLeft <= 3 ? (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">Còn {daysLeft} ngày (Gấp)</span>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400">Còn {daysLeft} ngày</span>
                )}
              </div>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.tasks.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t.tasks.subtitle}</p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-sm shadow-blue-500/25 inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t.tasks.addTask}</span>
        </button>
      </div>

      {/* Clean Minimalist KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block leading-tight">
            Tổng Nhiệm Vụ
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-white font-mono leading-tight mt-0.5 block">
            {totalTasks}
          </span>
        </div>

        <div className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block leading-tight">
            Đang Thực Hiện
          </span>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono leading-tight mt-0.5 block">
            {inProgressTasks}
          </span>
        </div>

        <div className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block leading-tight">
            Khẩn Cấp / Cao
          </span>
          <span className="text-lg font-bold text-red-600 dark:text-red-400 font-mono leading-tight mt-0.5 block">
            {urgentTasks}
          </span>
        </div>

        <div className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block leading-tight">
            Đã Hoàn Tất
          </span>
          <div className="flex items-baseline gap-1.5 leading-tight mt-0.5">
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {completedTasks}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%)
            </span>
          </div>
        </div>
      </div>

      {/* Unified Compact 1-Row Search & Dropdown Filter Toolbar */}
      <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên nhiệm vụ, mã gói thầu, người phụ trách..."
              className="w-full h-9 pl-9 pr-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all shadow-2xs"
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dropdown Filters Group */}
          <div className="flex items-center flex-wrap gap-2.5 shrink-0">
            {/* 1. Department Dropdown */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none cursor-pointer transition-colors shadow-2xs"
            >
              <option value="ALL">Tất cả phòng ban ({deptCounts['ALL'] || 0})</option>
              {DEPARTMENT_LIST.map((dept) => (
                <option key={dept} value={dept}>
                  {t.departments[dept]} ({deptCounts[dept] || 0})
                </option>
              ))}
            </select>

            {/* 2. Priority Dropdown */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none cursor-pointer transition-colors shadow-2xs"
            >
              <option value="ALL">Mức độ ưu tiên: Tất cả</option>
              <option value={TaskPriority.URGENT}>Khẩn cấp</option>
              <option value={TaskPriority.HIGH}>Cao</option>
              <option value={TaskPriority.MEDIUM}>Trung bình</option>
              <option value={TaskPriority.LOW}>Thấp</option>
            </select>

            {/* 3. Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none cursor-pointer transition-colors shadow-2xs"
            >
              <option value="ALL">Trạng thái: Tất cả</option>
              <option value={TaskStatus.IN_PROGRESS}>Đang thực hiện</option>
              <option value={TaskStatus.TODO}>Cần làm</option>
              <option value={TaskStatus.COMPLETED}>Đã hoàn tất</option>
            </select>

            {/* 4. Time Filter Dropdown */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none cursor-pointer transition-colors shadow-2xs"
            >
              <option value="ALL">Thời gian: Tất cả</option>
              <option value="EXPIRED">Đã quá hạn</option>
              <option value="EXPIRING_SOON">Hạn dưới 3 ngày</option>
              <option value="EXPIRING_WEEK">Hạn trong 7 ngày</option>
              <option value="THIS_MONTH">Tháng này</option>
            </select>

            {/* Reset Filters button */}
            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shadow-2xs"
                title="Đặt lại bộ lọc"
              >
                Đặt lại
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable<TaskItem>
        columns={columns}
        data={filteredTasks}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        renderActions={(item) => (
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              onClick={() => setEditingTask({ ...item })}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
              title="Chỉnh sửa nhiệm vụ"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeletingTask(item)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
              title="Xóa nhiệm vụ"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* Modal 1: Giao việc Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.tasks.addTask}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Phân bổ trách nhiệm, tiến độ thời gian và SLA</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.tasks.taskTitle}</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Rà soát điều khoản phạt chậm giao hàng trong hợp đồng FOB"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Mã Gói Thầu / Dự Án
                  </label>
                  <input
                    type="text"
                    value={newProjectCode}
                    onChange={(e) => setNewProjectCode(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.tasks.department}</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value as Department)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-semibold cursor-pointer"
                  >
                    {DEPARTMENT_LIST.map((dept) => (
                      <option key={dept} value={dept}>
                        {t.departments[dept]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.tasks.assignee}</label>
                  <input
                    type="text"
                    placeholder="VD: Trần Đình Trọng"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.tasks.priority}</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-semibold cursor-pointer"
                  >
                    <option value={TaskPriority.URGENT}>Khẩn cấp</option>
                    <option value={TaskPriority.HIGH}>Cao</option>
                    <option value={TaskPriority.MEDIUM}>Trung bình</option>
                    <option value={TaskPriority.LOW}>Thấp</option>
                  </select>
                </div>
              </div>

              {/* Thời gian bắt đầu & Hạn chót Deadline */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Thời Gian Bắt Đầu</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Hạn Chót (Deadline)</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium font-mono"
                  />
                </div>
              </div>

              {/* Checklist & Duration Preview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Số Tiêu Chí Checklist</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newChecklistTotal}
                    onChange={(e) => setNewChecklistTotal(parseInt(e.target.value, 10) || 4)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Thời Lượng Dự Kiến</label>
                  <div className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center font-mono">
                    {Math.max(1, calcDaysDiff(newDeadline, newStartDate))} ngày
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-all transform active:scale-95"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Xem Chi Tiết Nhiệm Vụ */}
      {viewingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded border border-blue-200/80 dark:border-slate-800">
                  {viewingTask.projectCode}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">
                  {viewingTask.taskTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingTask(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">Phòng Ban Phụ Trách</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{t.departments[viewingTask.department]}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">Nhân Sự Phụ Trách</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{viewingTask.assigneeName}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">Thời Gian Thực Hiện</span>
                <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  {viewingTask.startDate} → {viewingTask.deadline} ({viewingTask.durationDays} ngày)
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">Mức Độ Ưu Tiên & Trạng Thái</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">
                    {viewingTask.priority}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {t.status[viewingTask.status] || viewingTask.status}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1 sm:col-span-2">
                <span className="text-[11px] font-semibold text-slate-500 block">Tiến Độ Checklist ({viewingTask.checklistDone}/{viewingTask.checklistTotal})</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${Math.round((viewingTask.checklistDone / viewingTask.checklistTotal) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                    {Math.round((viewingTask.checklistDone / viewingTask.checklistTotal) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setEditingTask({ ...viewingTask });
                  setViewingTask(null);
                }}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 hover:bg-blue-100"
              >
                {t.common.edit}
              </button>
              <button
                type="button"
                onClick={() => setViewingTask(null)}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Chỉnh Sửa Nhiệm Vụ */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Chỉnh Sửa Nhiệm Vụ</h3>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTask} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tên Nhiệm Vụ</label>
                <input
                  type="text"
                  required
                  value={editingTask.taskTitle}
                  onChange={(e) => setEditingTask({ ...editingTask, taskTitle: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mã Gói Thầu</label>
                  <input
                    type="text"
                    value={editingTask.projectCode}
                    onChange={(e) => setEditingTask({ ...editingTask, projectCode: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phòng Ban</label>
                  <select
                    value={editingTask.department}
                    onChange={(e) => setEditingTask({ ...editingTask, department: e.target.value as Department })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium"
                  >
                    {DEPARTMENT_LIST.map((dept) => (
                      <option key={dept} value={dept}>
                        {t.departments[dept]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Người Phụ Trách</label>
                  <input
                    type="text"
                    value={editingTask.assigneeName}
                    onChange={(e) => setEditingTask({ ...editingTask, assigneeName: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mức Độ Ưu Tiên</label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as TaskPriority })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium"
                  >
                    <option value={TaskPriority.URGENT}>Khẩn cấp</option>
                    <option value={TaskPriority.HIGH}>Cao</option>
                    <option value={TaskPriority.MEDIUM}>Trung bình</option>
                    <option value={TaskPriority.LOW}>Thấp</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Thời Gian Bắt Đầu</label>
                  <input
                    type="date"
                    value={editingTask.startDate}
                    onChange={(e) => setEditingTask({ ...editingTask, startDate: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Hạn Chót (Deadline)</label>
                  <input
                    type="date"
                    value={editingTask.deadline}
                    onChange={(e) => setEditingTask({ ...editingTask, deadline: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tiêu Chí Đã Hoàn Thành</label>
                  <input
                    type="number"
                    min={0}
                    max={editingTask.checklistTotal}
                    value={editingTask.checklistDone}
                    onChange={(e) => setEditingTask({ ...editingTask, checklistDone: parseInt(e.target.value, 10) || 0 })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Trạng Thái</label>
                  <select
                    value={editingTask.status}
                    onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as TaskStatus })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium"
                  >
                    <option value={TaskStatus.TODO}>Cần làm</option>
                    <option value={TaskStatus.IN_PROGRESS}>Đang thực hiện</option>
                    <option value={TaskStatus.COMPLETED}>Đã hoàn tất</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-all transform active:scale-95"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Xác Nhận Xóa Nhiệm Vụ */}
      {deletingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Xác Nhận Xóa Nhiệm Vụ</h3>
                <p className="text-xs text-slate-500">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Bạn có chắc chắn muốn xóa nhiệm vụ <strong className="text-slate-900 dark:text-white">{deletingTask.taskTitle}</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingTask(null)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleDeleteTask}
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
