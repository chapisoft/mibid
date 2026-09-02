'use client';

import React, { useState, useEffect } from 'react';
import { WorkflowDefinition, WorkflowStatus, WorkflowTemplate } from '../../shared/types';
import { workflowService } from '../../services/workflowService';
import { useTranslation } from '../../shared/i18n';
import { useToast } from '../../shared/toast/ToastContext';
import {
  GitFork,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  Copy,
  Trash2,
  Edit3,
  Layers,
  ArrowRight,
  Sparkles,
  FileText,
  X,
  BookOpen,
} from 'lucide-react';

interface WorkflowListPageProps {
  onSelectWorkflow: (workflowId: string) => void;
  onCreateNew?: () => void;
}

export function WorkflowListPage({ onSelectWorkflow }: WorkflowListPageProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'WORKFLOWS' | 'TEMPLATES'>('WORKFLOWS');
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | WorkflowStatus.ACTIVE | WorkflowStatus.DRAFT>('ALL');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);

  // Create Workflow Form State
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('tpl-standard-6-steps');

  // Template Modal State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<WorkflowTemplate> | null>(null);
  const [tplCode, setTplCode] = useState('');
  const [tplName, setTplName] = useState('');
  const [tplCategory, setTplCategory] = useState('STANDARD_TENDER');
  const [tplDesc, setTplDesc] = useState('');

  useEffect(() => {
    loadWorkflows();
    workflowService.getTemplates().then(setTemplates);
  }, []);

  const loadWorkflows = async () => {
    const list = await workflowService.getAllWorkflows();
    setWorkflows(list);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created = await workflowService.createWorkflow({
      name: newName.trim(),
      description: newDesc.trim(),
      templateId: selectedTemplateId,
    });

    setIsCreateModalOpen(false);
    setNewName('');
    setNewDesc('');
    await loadWorkflows();
    onSelectWorkflow(created.id);
  };

  const handleClone = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cloned = await workflowService.cloneWorkflow(id);
    await loadWorkflows();
    onSelectWorkflow(cloned.id);
  };

  const handleDelete = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Bạn có chắc chắn muốn xóa quy trình "${name}"?`)) {
      await workflowService.deleteWorkflow(id);
      await loadWorkflows();
    }
  };

  const handleOpenCreateTemplate = () => {
    setEditingTemplate(null);
    setTplCode(`TPL-${Date.now().toString().slice(-6)}`);
    setTplName('');
    setTplCategory('STANDARD_TENDER');
    setTplDesc('');
    setIsTemplateModalOpen(true);
  };

  const handleOpenEditTemplate = (tpl: WorkflowTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTemplate(tpl);
    setTplCode(tpl.code || '');
    setTplName(tpl.name || '');
    setTplCategory((tpl as any).category || 'STANDARD_TENDER');
    setTplDesc(tpl.description || '');
    setIsTemplateModalOpen(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tplName.trim()) return;

    try {
      await workflowService.saveTemplate({
        id: editingTemplate?.id,
        code: tplCode.trim(),
        name: tplName.trim(),
        category: tplCategory,
        description: tplDesc.trim(),
        nodes: editingTemplate?.nodes || [],
        edges: editingTemplate?.edges || [],
      });
      setIsTemplateModalOpen(false);
      const tpls = await workflowService.getTemplates();
      setTemplates(tpls);
      showToast('Đã lưu mẫu quy trình thành công!', 'success');
    } catch (err) {
      console.error('Lỗi lưu mẫu quy trình:', err);
      showToast('Không thể lưu mẫu quy trình. Vui lòng thử lại.', 'error');
    }
  };

  const handleCreateFromTemplate = async (tpl: WorkflowTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    const created = await workflowService.createWorkflow({
      name: `${tpl.name} (Bản Sao Áp Dụng)`,
      description: tpl.description || '',
      templateId: tpl.id,
    });
    await loadWorkflows();
    onSelectWorkflow(created.id);
  };

  // Filtered List
  const filteredWorkflows = workflows.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.tenantName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === WorkflowStatus.ACTIVE) return w.status === WorkflowStatus.ACTIVE;
    if (statusFilter === WorkflowStatus.DRAFT) return w.status === WorkflowStatus.DRAFT;
    return true;
  });

  const activeCount = workflows.filter((w) => w.status === WorkflowStatus.ACTIVE).length;
  const draftCount = workflows.filter((w) => w.status === WorkflowStatus.DRAFT).length;
  const totalRules = workflows.reduce((acc, w) => {
    return (
      acc +
      w.nodes.reduce((nAcc, n) => {
        const gk = n.data.gatekeeper;
        return (
          nAcc +
          [
            gk.layer1DocChecklist?.enabled,
            gk.layer2Financial?.enabled,
            gk.layer3Approval?.enabled,
            gk.layer4DistributedLock?.enabled,
          ].filter(Boolean).length
        );
      }, 0)
    );
  }, 0);

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Top Navigation & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('WORKFLOWS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'WORKFLOWS'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <GitFork className="w-4 h-4" />
            <span>{t.workflowListPage.tenderWorkflows} ({workflows.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TEMPLATES')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'TEMPLATES'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 ring-2 ring-purple-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t.workflowListPage.templatesLibrary} ({templates.length})</span>
          </button>
        </div>

        {activeTab === 'WORKFLOWS' ? (
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 transition-all transform active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.workflowListPage.createWorkflowBtn}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleOpenCreateTemplate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-500/25 transition-all transform active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.workflowListPage.createTemplateBtn}</span>
          </button>
        )}
      </div>

      {activeTab === 'WORKFLOWS' && (
        <>
          {/* Metrics Summary Banner */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Tổng số Quy trình</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{workflows.length}</p>
          <p className="text-[11px] text-slate-400">Thiết lập theo từng phân hệ</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Đang Hoạt Động</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeCount}</p>
          <p className="text-[11px] text-slate-400">Áp dụng cho các gói thầu</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Bản Nháp (Draft)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{draftCount}</p>
          <p className="text-[11px] text-slate-400">Đang hiệu chỉnh luồng</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Quy Tắc Gatekeeper</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{totalRules}</p>
          <p className="text-[11px] text-slate-400">Chốt chặn an toàn 4 lớp</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, mã quy trình, đơn vị..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Tất cả ({workflows.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter(WorkflowStatus.ACTIVE)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === WorkflowStatus.ACTIVE
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Hoạt động ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter(WorkflowStatus.DRAFT)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === WorkflowStatus.DRAFT
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Bản nháp ({draftCount})
          </button>
        </div>
      </div>

      {/* Workflows Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredWorkflows.map((wf) => {
          const gkCount = wf.nodes.reduce((acc, n) => {
            const gk = n.data.gatekeeper;
            return (
              acc +
              [
                gk.layer1DocChecklist?.enabled,
                gk.layer2Financial?.enabled,
                gk.layer3Approval?.enabled,
                gk.layer4DistributedLock?.enabled,
              ].filter(Boolean).length
            );
          }, 0);

          return (
            <div
              key={wf.id}
              onClick={() => onSelectWorkflow(wf.id)}
              className="group rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-800 transition-all duration-200 flex flex-col justify-between cursor-pointer space-y-4"
            >
              {/* Card Header: Badges & Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800">
                      {wf.code}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {wf.version}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
                      wf.status === WorkflowStatus.ACTIVE
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        wf.status === WorkflowStatus.ACTIVE ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                      }`}
                    />
                    {wf.status === WorkflowStatus.ACTIVE ? t.workflowDesigner.statusActive : t.workflowDesigner.statusDraft}
                  </span>
                </div>

                {/* Workflow Title - Prominent & Full */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                  {wf.name}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {wf.description}
                </p>
              </div>

              {/* Organization & Stats Chips */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{wf.tenantName}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                    <Layers className="w-3 h-3 text-blue-500" />
                    {wf.nodes.length} Bước
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                    <GitFork className="w-3 h-3 text-purple-500" />
                    {wf.edges.length} Luồng nối
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    {gkCount} GK Rules
                  </span>
                </div>
              </div>

              {/* Action Toolbar on Hover */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[10.5px] text-slate-400">
                  Cập nhật: {new Date(wf.updatedAt).toLocaleDateString('vi-VN')}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => handleClone(wf.id, e)}
                    title="Nhân bản quy trình này"
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(wf.id, wf.name, e)}
                    title="Xóa quy trình"
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-red-600 hover:border-red-200 dark:hover:border-red-900 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectWorkflow(wf.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Mở Thiết Kế</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredWorkflows.length === 0 && (
        <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <GitFork className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Không tìm thấy quy trình phù hợp</h3>
          <p className="text-xs text-slate-400">Thử thay đổi từ khóa tìm kiếm hoặc tạo một quy trình mới</p>
        </div>
      )}
        </>
      )}

      {/* TAB 2: THƯ VIỆN MẪU QUY TRÌNH (TEMPLATES LIBRARY) */}
      {activeTab === 'TEMPLATES' && (
        <div className="space-y-6">
          {/* Header Banner Mẫu Quy Trình */}
          <div className="p-5 rounded-3xl border border-purple-200 dark:border-purple-900/60 bg-linear-to-r from-purple-50/70 via-indigo-50/40 to-blue-50/60 dark:from-purple-950/30 dark:via-slate-900 dark:to-blue-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Thư Viện Mẫu Quy Trình Chuẩn Hóa
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
                Tập hợp các mẫu quy trình mua sắm tiêu chuẩn theo Luật Đấu thầu 2023 và thông lệ quốc tế EPC. Mọi dự án có thể áp dụng ngay hoặc nhân bản để tùy chỉnh luồng và tiêu chí Gatekeeper riêng.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold font-mono">
                {templates.length} Mẫu Khả Dụng
              </span>
            </div>
          </div>

          {/* Grid Danh Sách Mẫu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl) => {
              const cat = (tpl as any).category || 'STANDARD_TENDER';
              const catLabel =
                cat === 'FAST_TRACK'
                  ? '⚡ Mua Sắm Rút Gọn / Khẩn Cấp'
                  : cat === 'INTERNATIONAL_EPC'
                  ? '🌐 Mua Sắm Quốc Tế & Tổng Thầu EPC'
                  : cat === 'REGULAR_PROCUREMENT'
                  ? '📦 Mua Sắm Thường Xuyên & Vật Tư'
                  : '📋 Quy Trình Mua Sắm Tiêu Chuẩn';

              return (
                <div
                  key={tpl.id}
                  className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-800 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
                        {catLabel}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-400">
                        {tpl.code || 'TEMPLATE'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {tpl.name}
                      </h3>
                      {tpl.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {tpl.description}
                        </p>
                      )}
                    </div>

                    {/* Danh sách các bước trong mẫu */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        Các bước trong mẫu ({tpl.nodes?.length || 0} bước):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {tpl.nodes?.map((n, idx) => (
                          <span
                            key={n.id || idx}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          >
                            {n.data?.title || n.data?.code || `Bước ${idx + 1}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditTemplate(tpl, e)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa Thông Tin</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleCreateFromTemplate(tpl, e)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Tạo Quy Trình
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectWorkflow(tpl.id)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span>Mở Thiết Kế Mẫu</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Quản Lý / Tạo Mẫu Quy Trình */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingTemplate ? 'Chỉnh Sửa Mẫu Quy Trình' : 'Tạo Mẫu Quy Trình Mới'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Mã Mẫu Quy Trình <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={tplCode}
                  onChange={(e) => setTplCode(e.target.value)}
                  placeholder="Ví dụ: TPL-STANDARD-TENDER"
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tên Mẫu Quy Trình <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={tplName}
                  onChange={(e) => setTplName(e.target.value)}
                  placeholder="Ví dụ: Mẫu Mua Sắm Thiết Bị Trạm Biến Áp Chuẩn Hóa"
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Phân Loại Mẫu Nghiệp Vụ
                </label>
                <select
                  value={tplCategory}
                  onChange={(e) => setTplCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                >
                  <option value="STANDARD_TENDER">📋 Quy Trình Mua Sắm Tiêu Chuẩn</option>
                  <option value="FAST_TRACK">⚡ Mua Sắm Rút Gọn / Khẩn Cấp</option>
                  <option value="INTERNATIONAL_EPC">🌐 Mua Sắm Quốc Tế & Tổng Thầu EPC</option>
                  <option value="REGULAR_PROCUREMENT">📦 Mua Sắm Thường Xuyên & Vật Tư</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mô Tả Nghiệp Vụ</label>
                <textarea
                  rows={3}
                  value={tplDesc}
                  onChange={(e) => setTplDesc(e.target.value)}
                  placeholder="Mô tả phạm vi áp dụng, căn cứ pháp lý và tiêu chuẩn kỹ thuật..."
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-500/25 cursor-pointer"
                >
                  Lưu Mẫu Quy Trình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create New Workflow */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Tạo Quy Trình Luồng Mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tên Quy Trình / Luồng Nghiệp Vụ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ví dụ: Quy trình Thẩm định & Đấu thầu Thiết bị Trạm 500kV"
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mô Tả Nghiệp Vụ</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Mô tả phạm vi áp dụng, tiêu chí bóc tách và các bộ phận tham gia..."
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              {/* Base Template Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Chọn Mẫu Quy Trình Khởi Tạo
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {templates.map((tpl) => (
                    <label
                      key={tpl.id}
                      className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                        selectedTemplateId === tpl.id
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="template"
                        value={tpl.id}
                        checked={selectedTemplateId === tpl.id}
                        onChange={() => setSelectedTemplateId(tpl.id)}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{tpl.name}</p>
                        <p className="text-[11px] text-slate-500 leading-snug">{tpl.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/25"
                >
                  Khởi Tạo & Thiết Kế Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
