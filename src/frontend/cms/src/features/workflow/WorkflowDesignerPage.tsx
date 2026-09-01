'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../shared/i18n';
import {
  Department,
  WorkflowDefinition,
  WorkflowEdge,
  WorkflowNode,
  WorkflowNodeType,
  WorkflowStatus,
  WorkflowTemplate,
  WorkflowValidationResult,
  WorkflowValidationError,
} from '../../shared/types';
import { workflowService } from '../../services/workflowService';
import { NodePalette } from './components/NodePalette';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { NodeInspectorPanel } from './components/NodeInspectorPanel';
import {
  Save,
  Send,
  Download,
  Upload,
  LayoutGrid,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Undo2,
  Redo2,
  Sparkles,
  BookOpen,
  X,
  ChevronDown,
  ArrowLeft,
  Search,
} from 'lucide-react';

interface WorkflowDesignerPageProps {
  workflowId?: string;
  onBackToList?: () => void;
}

export function WorkflowDesignerPage({ workflowId, onBackToList }: WorkflowDesignerPageProps) {
  const { t } = useTranslation();
  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [templatesOpen, setTemplatesOpen] = useState<boolean>(false);
  const [templateSearchQuery, setTemplateSearchQuery] = useState<string>('');
  const [validationResult, setValidationResult] = useState<WorkflowValidationResult | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // History stack for Undo / Redo
  const [history, setHistory] = useState<{ nodes: WorkflowNode[]; edges: WorkflowEdge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const templateComboboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    workflowService.getTemplates().then(setTemplates);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (templateComboboxRef.current && !templateComboboxRef.current.contains(e.target as Node)) {
        setTemplatesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const data = workflowId
        ? await workflowService.getWorkflowById(workflowId)
        : await workflowService.getAllWorkflows().then((list) => list[0]);
      if (data) {
        setWorkflow(data);
        setHistory([{ nodes: data.nodes || [], edges: data.edges || [] }]);
        setHistoryIndex(0);
        if (data.nodes && data.nodes.length > 0) {
          setSelectedNodeId(data.nodes[1]?.id || data.nodes[0]?.id || null);
        }
      }
    };
    loadData();
  }, [workflowId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const pushHistory = (newNodes: WorkflowNode[], newEdges: WorkflowEdge[]) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    setHistory([...updatedHistory, { nodes: newNodes, edges: newEdges }]);
    setHistoryIndex(updatedHistory.length);
  };

  const handleUndo = () => {
    if (historyIndex > 0 && workflow) {
      const prev = history[historyIndex - 1];
      setWorkflow({ ...workflow, nodes: prev.nodes, edges: prev.edges });
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1 && workflow) {
      const next = history[historyIndex + 1];
      setWorkflow({ ...workflow, nodes: next.nodes, edges: next.edges });
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Node position update
  const handleUpdateNodePosition = (nodeId: string, x: number, y: number) => {
    if (!workflow) return;
    const updatedNodes = workflow.nodes.map((n: WorkflowNode) => (n.id === nodeId ? { ...n, x, y } : n));
    setWorkflow({ ...workflow, nodes: updatedNodes });
  };

  // Add new node
  const handleAddNode = (type: WorkflowNodeType, x: number, y: number) => {
    if (!workflow) return;

    const nodeCount = workflow.nodes.length + 1;
    const defaultCode = `${type}-${String(nodeCount).padStart(2, '0')}`;

    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type,
      x: Math.max(20, x),
      y: Math.max(20, y),
      data: {
        code: defaultCode,
        title: `Bước ${nodeCount}: ${type}`,
        subtitle: 'Cấu hình chi tiết trong bảng bên phải',
        department: Department.TECHNICAL,
        slaDays: 2,
        gatekeeper: {
          layer1DocChecklist: { enabled: true, requiredDocTypes: ['TAI_LIEU_MINH_CHUNG'], enforceDmsValidityCheck: true },
          layer2Financial: { enabled: false, requireCurrencyConversionCheck: false },
          layer3Approval: { enabled: true, requiredRoles: [], approvalMode: 'ANY', allowManagerBypass: false },
          layer4DistributedLock: { enabled: true, lockKeyPrefix: `lock:${defaultCode.toLowerCase()}`, leaseTimeSeconds: 60, triggerNotificationOnSuccess: true },
        },
      },
    };

    const newNodes = [...workflow.nodes, newNode];
    setWorkflow({ ...workflow, nodes: newNodes });
    setSelectedNodeId(newNode.id);
    pushHistory(newNodes, workflow.edges);
  };

  // Update Node Data from Inspector
  const handleUpdateNode = (updatedNode: WorkflowNode) => {
    if (!workflow) return;
    const newNodes = workflow.nodes.map((n: WorkflowNode) => (n.id === updatedNode.id ? updatedNode : n));
    setWorkflow({ ...workflow, nodes: newNodes });
    pushHistory(newNodes, workflow.edges);
  };

  // Delete Node
  const handleDeleteNode = (nodeId: string) => {
    if (!workflow) return;
    const newNodes = workflow.nodes.filter((n: WorkflowNode) => n.id !== nodeId);
    const newEdges = workflow.edges.filter((e: WorkflowEdge) => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId);
    setWorkflow({ ...workflow, nodes: newNodes, edges: newEdges });
    setSelectedNodeId(null);
    pushHistory(newNodes, newEdges);
  };

  // Duplicate Node
  const handleDuplicateNode = (node: WorkflowNode) => {
    if (!workflow) return;
    const duplicate: WorkflowNode = {
      ...node,
      id: `node-${Date.now()}`,
      x: node.x + 40,
      y: node.y + 40,
      data: {
        ...node.data,
        code: `${node.data.code}-COPY`,
        title: `${node.data.title} (Bản sao)`,
      },
    };

    const newNodes = [...workflow.nodes, duplicate];
    setWorkflow({ ...workflow, nodes: newNodes });
    setSelectedNodeId(duplicate.id);
    pushHistory(newNodes, workflow.edges);
  };

  // Connect Nodes
  const handleConnectNodes = (
    sourceNodeId: string,
    targetNodeId: string,
    sourceHandle: 'right' | 'bottom',
    targetHandle: 'left' | 'top'
  ) => {
    if (!workflow) return;

    // Avoid duplicate edge
    const exists = workflow.edges.some(
      (e: WorkflowEdge) => e.sourceNodeId === sourceNodeId && e.targetNodeId === targetNodeId
    );
    if (exists) return;

    const newEdge: WorkflowEdge = {
      id: `edge-${Date.now()}`,
      sourceNodeId,
      targetNodeId,
      sourceHandle,
      targetHandle,
    };

    const newEdges = [...workflow.edges, newEdge];
    setWorkflow({ ...workflow, edges: newEdges });
    pushHistory(workflow.nodes, newEdges);
  };

  // Delete Edge
  const handleDeleteEdge = (edgeId: string) => {
    if (!workflow) return;
    const newEdges = workflow.edges.filter((e: WorkflowEdge) => e.id !== edgeId);
    setWorkflow({ ...workflow, edges: newEdges });
    pushHistory(workflow.nodes, newEdges);
  };

  // Auto Layout algorithm
  const handleAutoLayout = () => {
    if (!workflow) return;

    const startNode = workflow.nodes.find((n: WorkflowNode) => n.type === 'START') || workflow.nodes[0];
    if (!startNode) return;

    const visited = new Set<string>();
    const layoutNodes = [...workflow.nodes];

    // Simple horizontal topological layout
    let currentX = 60;
    const arrange = (nodeId: string, depth: number) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const target = layoutNodes.find((n: WorkflowNode) => n.id === nodeId);
      if (target) {
        target.x = 60 + depth * 260;
        target.y = 200 + ((depth % 2 === 1) ? 20 : -20);
      }

      const outEdges = workflow.edges.filter((e: WorkflowEdge) => e.sourceNodeId === nodeId);
      outEdges.forEach((e: WorkflowEdge, idx: number) => {
        const nextNode = layoutNodes.find((n: WorkflowNode) => n.id === e.targetNodeId);
        if (nextNode && !visited.has(nextNode.id)) {
          if (idx > 0) {
            nextNode.y = 360;
          }
          arrange(nextNode.id, depth + 1);
        }
      });
    };

    arrange(startNode.id, 0);

    // Place remaining unvisited nodes
    layoutNodes.forEach((n: WorkflowNode, idx: number) => {
      if (!visited.has(n.id)) {
        n.x = 60 + (idx + 1) * 260;
        n.y = 440;
      }
    });

    setWorkflow({ ...workflow, nodes: layoutNodes });
    pushHistory(layoutNodes, workflow.edges);
    showToast(t.workflowDesigner.btnAutoLayout);
  };

  // Validate Flow
  const handleValidate = () => {
    if (!workflow) return;
    const result = workflowService.validateWorkflow(workflow.nodes, workflow.edges, t);
    setValidationResult(result);
  };

  // Save Draft
  const handleSaveDraft = async () => {
    if (!workflow) return;
    await workflowService.saveWorkflow({ ...workflow, status: WorkflowStatus.DRAFT });
    showToast(t.workflowDesigner.savedToast);
  };

  // Publish & Activate
  const handlePublish = async () => {
    if (!workflow) return;
    const result = workflowService.validateWorkflow(workflow.nodes, workflow.edges, t);
    if (!result.isValid) {
      setValidationResult(result);
      return;
    }

    const published = await workflowService.publishWorkflow(workflow);
    setWorkflow(published);
    showToast(t.workflowDesigner.publishedToast);
  };

  // Apply Template
  const handleApplyTemplate = (tpl: WorkflowTemplate) => {
    if (!workflow) return;
    const updated: WorkflowDefinition = {
      ...workflow,
      name: tpl.name,
      description: tpl.description,
      nodes: tpl.nodes,
      edges: tpl.edges,
    };
    setWorkflow(updated);
    setTemplatesOpen(false);
    setSelectedNodeId(tpl.nodes[0]?.id || null);
    pushHistory(tpl.nodes, tpl.edges);
    showToast(`Đã áp dụng mẫu: ${tpl.name}`);
  };

  // Export JSON
  const handleExportJson = () => {
    if (!workflow) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(workflow, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${workflow.code}_workflow.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.nodes && parsed.edges) {
          setWorkflow(parsed);
          pushHistory(parsed.nodes, parsed.edges);
          showToast('Nhập tệp JSON quy trình thành công!');
        }
      } catch (err) {
        alert('Tệp JSON không đúng định dạng!');
      }
    };
    reader.readAsText(file);
  };

  if (!workflow) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const selectedNode = workflow.nodes.find((n: WorkflowNode) => n.id === selectedNodeId) || null;

  const filteredTemplates = templates.filter((tpl: WorkflowTemplate) => {
    const q = templateSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      tpl.name.toLowerCase().includes(q) ||
      (tpl.code && tpl.code.toLowerCase().includes(q)) ||
      (tpl.description && tpl.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] -m-4 sm:-m-6 lg:-m-8 overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* Top Action Bar */}
      <header className="min-h-[62px] py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 sm:px-4 flex items-center justify-between gap-3 sm:gap-4 shrink-0 z-30 shadow-xs select-none">
        {/* Left: Back Button, Title & Searchable Autocomplete Template Combobox */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {onBackToList && (
            <button
              type="button"
              onClick={onBackToList}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs shrink-0"
              title="Quay lại Danh sách Quy trình"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {/* Workflow Metadata: Tiêu đề dòng 1; Khách hàng + Version + Trạng thái dòng 2 */}
          <div className="min-w-0 max-w-[280px] sm:max-w-[360px] md:max-w-[460px] lg:max-w-[560px] shrink">
            <h1
              className="text-xs sm:text-[13.5px] font-bold text-slate-900 dark:text-white leading-tight break-words"
              title={workflow.name}
            >
              {workflow.name}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-[280px]">
                {workflow.tenantName}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" />
              <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold font-mono bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800 shrink-0 whitespace-nowrap">
                {workflow.version}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold shrink-0 whitespace-nowrap flex items-center gap-1 ${
                  workflow.status === 'ACTIVE'
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    workflow.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                {workflow.status === 'ACTIVE' ? t.workflowDesigner.statusActive : t.workflowDesigner.statusDraft}
              </span>
            </div>
          </div>

          <div className="hidden lg:block w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1 shrink-0" />

          {/* Autocomplete Template Search Combobox (Dài ra, sát với tiêu đề bên trái) */}
          <div className="relative w-44 sm:w-56 md:w-64 lg:w-72 xl:w-80 shrink-0" ref={templateComboboxRef}>
            <div className="relative">
              <input
                type="text"
                value={templateSearchQuery}
                onChange={(e) => {
                  setTemplateSearchQuery(e.target.value);
                  setTemplatesOpen(true);
                }}
                onFocus={() => setTemplatesOpen(true)}
                placeholder="Tìm mẫu luồng (EVN, PVN, EPC...)"
                className="w-full h-8 pl-7 pr-7 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all shadow-2xs"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              {templateSearchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setTemplateSearchQuery('');
                    setTemplatesOpen(false);
                  }}
                  className="p-1 absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              )}
            </div>

            {templatesOpen && (
              <div className="absolute left-0 top-[calc(100%+6px)] w-80 sm:w-96 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Thư Viện Mẫu ({filteredTemplates.length})
                  </span>
                  <span className="text-[10px] text-slate-400">Chọn để áp dụng</span>
                </div>

                {filteredTemplates.length > 0 ? (
                  filteredTemplates.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => {
                        handleApplyTemplate(tpl);
                        setTemplatesOpen(false);
                        setTemplateSearchQuery('');
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-blue-50/70 dark:hover:bg-slate-800/80 transition-all group space-y-1 border border-transparent hover:border-blue-200/60 dark:hover:border-blue-900/40"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {tpl.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                          {tpl.nodes.length} bước
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {tpl.description}
                      </p>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Không tìm thấy mẫu phù hợp với từ khóa &ldquo;{templateSearchQuery}&rdquo;
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center: Canvas Controls (Undo/Redo, Auto-Layout, Zoom) */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-100/70 dark:bg-slate-950/80 p-0.5 sm:p-1 rounded-xl border border-slate-200/80 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title={t.workflowDesigner.btnUndo}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title={t.workflowDesigner.btnRedo}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-3.5 bg-slate-300/80 dark:bg-slate-800 mx-0.5" />

          <button
            type="button"
            onClick={handleAutoLayout}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 transition-colors whitespace-nowrap"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden lg:inline">{t.workflowDesigner.btnAutoLayout}</span>
          </button>

          <div className="w-px h-3.5 bg-slate-300/80 dark:bg-slate-800 mx-0.5" />

          <button
            type="button"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            title={t.workflowDesigner.btnZoomOut}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10.5px] font-mono font-bold text-slate-600 dark:text-slate-300 w-9 text-center select-none">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
            title={t.workflowDesigner.btnZoomIn}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1.0)}
            title={t.workflowDesigner.btnResetZoom}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Actions & Publishing */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={handleValidate}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11.5px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs whitespace-nowrap"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t.workflowDesigner.btnValidate}</span>
          </button>

          {/* JSON Export / Import */}
          <div className="hidden lg:flex items-center gap-1">
            <button
              type="button"
              onClick={handleExportJson}
              title={t.workflowDesigner.btnExportJson}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title={t.workflowDesigner.btnImportJson}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11.5px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{t.workflowDesigner.btnSaveDraft}</span>
          </button>

          <button
            type="button"
            onClick={handlePublish}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11.5px] font-bold shadow-md shadow-blue-500/20 transition-all transform active:scale-95 whitespace-nowrap"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t.workflowDesigner.btnPublish}</span>
          </button>

          {/* Hidden JSON Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJson}
            accept=".json"
            className="hidden"
          />
        </div>
      </header>

      {/* Main 3-Pane Body Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Node Palette */}
        <NodePalette />

        {/* Center: Interactive SVG / HTML Canvas */}
        <WorkflowCanvas
          nodes={workflow.nodes}
          edges={workflow.edges}
          selectedNodeId={selectedNodeId}
          zoom={zoom}
          onZoomChange={setZoom}
          onSelectNode={setSelectedNodeId}
          onUpdateNodePosition={handleUpdateNodePosition}
          onAddNode={handleAddNode}
          onConnectNodes={handleConnectNodes}
          onDeleteEdge={handleDeleteEdge}
        />

        {/* Right: Property & Gatekeeper Rule Inspector */}
        <NodeInspectorPanel
          selectedNode={selectedNode}
          nodes={workflow.nodes}
          onUpdateNode={handleUpdateNode}
          onDeleteNode={handleDeleteNode}
          onDuplicateNode={handleDuplicateNode}
          onClose={() => setSelectedNodeId(null)}
        />
      </div>

      {/* Validation Result Modal */}
      {validationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                {validationResult.isValid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {validationResult.isValid
                    ? t.workflowDesigner.validationSuccess
                    : t.workflowDesigner.validationErrorsFound}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setValidationResult(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error List */}
            <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
              {validationResult.errors.map((err: WorkflowValidationError, i: number) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 font-medium"
                >
                  &bull; {err.message}
                </div>
              ))}
              {validationResult.warnings.map((warn: WorkflowValidationError, i: number) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 font-medium"
                >
                  &bull; {warn.message}
                </div>
              ))}
              {validationResult.isValid && (
                <p className="text-xs text-slate-500 leading-relaxed text-center py-2">
                  Tất cả các node và liên kết hợp lệ. Quy trình đã sẵn sàng để phát hành và áp dụng cho các gói thầu dự án.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setValidationResult(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-500"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-2xl">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
