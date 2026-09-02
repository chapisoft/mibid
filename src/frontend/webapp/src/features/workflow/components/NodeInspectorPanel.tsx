'use client';

import React, { useState } from 'react';
import { useTranslation } from '../../../shared/i18n';
import { Department, UserRole, WorkflowNode } from '../../../shared/types';

import {
  Settings,
  ShieldCheck,
  GitFork,
  Trash2,
  Copy,
  Plus,
  X,
  Clock,
  Building,
  DollarSign,
  Lock,
  Award,
  FileCheck,
  ChevronDown,
  Info,
} from 'lucide-react';

interface NodeInspectorPanelProps {
  selectedNode: WorkflowNode | null;
  nodes: WorkflowNode[];
  onUpdateNode: (updatedNode: WorkflowNode) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (node: WorkflowNode) => void;
  onClose: () => void;
}

export function NodeInspectorPanel({
  selectedNode,
  nodes,
  onUpdateNode,
  onDeleteNode,
  onDuplicateNode,
  onClose,
}: NodeInspectorPanelProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'general' | 'gatekeeper' | 'condition'>('general');

  if (!selectedNode) {
    return (
      <aside className="w-80 sm:w-96 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center shrink-0 h-full select-none">
        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-3">
          <Settings className="w-6 h-6" />
        </div>
        <h4 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
          Chưa Chọn Node Nào
        </h4>
        <p className="text-[11px] text-slate-400 max-w-xs mt-1">
          Nhấp chuột vào một Node trên khung vẽ Canvas để cấu hình thông tin chi tiết và bộ quy tắc Gatekeeper.
        </p>
      </aside>
    );
  }

  const { data } = selectedNode;
  const gk = data.gatekeeper;

  const updateData = (partialData: Partial<typeof data>) => {
    onUpdateNode({
      ...selectedNode,
      data: {
        ...data,
        ...partialData,
      },
    });
  };

  const updateGatekeeper = (partialGk: Partial<typeof gk>) => {
    updateData({
      gatekeeper: {
        ...gk,
        ...partialGk,
      },
    });
  };

  const handleAddDocChecklistItem = () => {
    const current = gk.layer1DocChecklist.requiredDocTypes || [];
    updateGatekeeper({
      layer1DocChecklist: {
        ...gk.layer1DocChecklist,
        requiredDocTypes: [...current, `DOC_TYPE_${current.length + 1}`],
      },
    });
  };

  const handleRemoveDocChecklistItem = (index: number) => {
    const current = [...(gk.layer1DocChecklist.requiredDocTypes || [])];
    current.splice(index, 1);
    updateGatekeeper({
      layer1DocChecklist: {
        ...gk.layer1DocChecklist,
        requiredDocTypes: current,
      },
    });
  };

  const handleToggleRole = (role: UserRole) => {
    const currentRoles = gk.layer3Approval.requiredRoles || [];
    const exists = currentRoles.includes(role);
    const updated = exists ? currentRoles.filter((r) => r !== role) : [...currentRoles, role];
    updateGatekeeper({
      layer3Approval: {
        ...gk.layer3Approval,
        requiredRoles: updated,
      },
    });
  };

  const handleAddBranch = () => {
    const currentBranches = data.conditionBranches || [];
    const otherNodes = nodes.filter((n) => n.id !== selectedNode.id);
    const defaultTarget = otherNodes[0]?.id || '';

    updateData({
      conditionBranches: [
        ...currentBranches,
        {
          id: `br-${Date.now()}`,
          label: `Nhánh ${currentBranches.length + 1}`,
          field: 'landedCostVnd',
          operator: '<=',
          value: 20000000000,
          targetNodeId: defaultTarget,
        },
      ],
    });
  };

  const handleRemoveBranch = (branchId: string) => {
    const currentBranches = (data.conditionBranches || []).filter((b) => b.id !== branchId);
    updateData({ conditionBranches: currentBranches });
  };

  return (
    <aside className="w-80 sm:w-96 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 h-full overflow-hidden shadow-xl z-20">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
            <Settings className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
              {t.workflowDesigner.inspectorTitle}
            </h3>
            <p className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 leading-none mt-0.5">
              {data.code}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onDuplicateNode(selectedNode)}
            title={t.workflowDesigner.btnDuplicateNode}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteNode(selectedNode.id)}
            title={t.workflowDesigner.btnDeleteNode}
            className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="grid grid-cols-3 gap-1 p-2 bg-slate-100/70 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`h-8 rounded-lg transition-all flex items-center justify-center whitespace-nowrap ${
            activeTab === 'general'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {t.workflowDesigner.tabGeneral}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gatekeeper')}
          className={`h-8 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
            activeTab === 'gatekeeper'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
          <span>Gatekeeper</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('condition')}
          className={`h-8 rounded-lg transition-all flex items-center justify-center whitespace-nowrap ${
            activeTab === 'condition'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {t.workflowDesigner.tabCondition}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* TAB 1: GENERAL */}
        {activeTab === 'general' && (
          <div className="space-y-3.5">
            {/* Row 1: Mã Bước (35%) + Tên Bước Hiển Thị (65%) */}
            <div className="grid grid-cols-12 gap-2.5">
              <div className="col-span-4 space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  Mã Bước
                </label>
                <input
                  type="text"
                  value={data.code}
                  onChange={(e) => updateData({ code: e.target.value })}
                  className="w-full h-9 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-blue-600 dark:text-blue-400 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div className="col-span-8 space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Tên Bước Hiển Thị
                </label>
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => updateData({ title: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Row 2: Phòng Ban Chủ Trì (68%) + Thời Hạn SLA (32%) */}
            <div className="grid grid-cols-12 gap-2.5">
              {/* Phòng Ban Chủ Trì */}
              <div className="col-span-8 space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Phòng Ban Chủ Trì
                </label>
                <select
                  value={data.department}
                  onChange={(e) => updateData({ department: e.target.value as Department })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none cursor-pointer transition-all"
                >
                  <option value={Department.TECHNICAL}>{t.departments.TECHNICAL}</option>
                  <option value={Department.COMMERCIAL}>{t.departments.COMMERCIAL}</option>
                  <option value={Department.FINANCE}>{t.departments.FINANCE}</option>
                  <option value={Department.LEGAL}>{t.departments.LEGAL}</option>
                </select>
              </div>

              {/* Thời Hạn SLA (Ngày) - Gọn gàng kèm hậu tố */}
              <div className="col-span-4 space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  Hạn SLA
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={data.slaDays}
                    onChange={(e) => updateData({ slaDays: parseInt(e.target.value, 10) || 1 })}
                    className="w-full h-9 pl-2.5 pr-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10.5px] font-semibold text-slate-400 pointer-events-none select-none">
                    ngày
                  </span>
                </div>
              </div>
            </div>

            {/* Row 3: Mô Tả Hướng Dẫn */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {t.workflowDesigner.nodeDescLabel}
              </label>
              <textarea
                rows={3}
                value={data.description || ''}
                onChange={(e) => updateData({ description: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none leading-relaxed transition-all resize-none"
                placeholder="Nhập hướng dẫn nghiệp vụ và điều kiện chuyển bước..."
              />
            </div>
          </div>
        )}

        {/* TAB 2: GATEKEEPER 4-LAYER RULES */}
        {activeTab === 'gatekeeper' && (
          <div className="space-y-3.5">
            {/* Layer 1: Doc Checklist */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  <span>Lớp 1: Hồ Sơ Tiên Quyết</span>
                </div>
                <input
                  type="checkbox"
                  checked={gk.layer1DocChecklist.enabled}
                  onChange={(e) =>
                    updateGatekeeper({
                      layer1DocChecklist: { ...gk.layer1DocChecklist, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                />
              </div>

              {gk.layer1DocChecklist.enabled && (
                <div className="space-y-2.5 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                  <label className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gk.layer1DocChecklist.enforceDmsValidityCheck}
                      onChange={(e) =>
                        updateGatekeeper({
                          layer1DocChecklist: {
                            ...gk.layer1DocChecklist,
                            enforceDmsValidityCheck: e.target.checked,
                          },
                        })
                      }
                      className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>{t.workflowDesigner.layer1EnforceDms}</span>
                  </label>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-[11px] text-slate-500 font-semibold">
                      <span>Checklist tài liệu bắt buộc:</span>
                      <button
                        type="button"
                        onClick={handleAddDocChecklistItem}
                        className="text-blue-600 font-bold hover:underline flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" /> Thêm
                      </button>
                    </div>
                    {gk.layer1DocChecklist.requiredDocTypes?.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={doc}
                          onChange={(e) => {
                            const updatedDocs = [...gk.layer1DocChecklist.requiredDocTypes];
                            updatedDocs[idx] = e.target.value;
                            updateGatekeeper({
                              layer1DocChecklist: {
                                ...gk.layer1DocChecklist,
                                requiredDocTypes: updatedDocs,
                              },
                            });
                          }}
                          className="flex-1 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-[11px] text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveDocChecklistItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Layer 2: Financial Thresholds (Tỉ lệ 65% Ngân sách / 35% Bảo lãnh) */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Lớp 2: Ngưỡng Tài Chính & Bảo Lãnh</span>
                </div>
                <input
                  type="checkbox"
                  checked={gk.layer2Financial.enabled}
                  onChange={(e) =>
                    updateGatekeeper({
                      layer2Financial: { ...gk.layer2Financial, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                />
              </div>

              {gk.layer2Financial.enabled && (
                <div className="space-y-2.5 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                  <div className="grid grid-cols-12 gap-2">
                    {/* Ngân Sách Trần */}
                    <div className="col-span-7 space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Ngân Sách Trần
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step={1000000000}
                          value={gk.layer2Financial.maxBudgetThresholdVnd || ''}
                          onChange={(e) =>
                            updateGatekeeper({
                              layer2Financial: {
                                ...gk.layer2Financial,
                                maxBudgetThresholdVnd: parseFloat(e.target.value) || undefined,
                              },
                            })
                          }
                          className="w-full h-8 pl-2 pr-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-[11px] text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          placeholder="50000000000"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9.5px] font-bold font-mono text-slate-400 pointer-events-none">
                          VND
                        </span>
                      </div>
                    </div>

                    {/* Bảo Lãnh Dự Thầu */}
                    <div className="col-span-5 space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        Bảo Lãnh
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step={0.5}
                          min={0}
                          max={10}
                          value={gk.layer2Financial.minBidBondPercentage || ''}
                          onChange={(e) =>
                            updateGatekeeper({
                              layer2Financial: {
                                ...gk.layer2Financial,
                                minBidBondPercentage: parseFloat(e.target.value) || undefined,
                              },
                            })
                          }
                          className="w-full h-8 pl-2 pr-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-[11px] text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          placeholder="2.0"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Layer 3: Approval Matrix */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span>Lớp 3: Ma Trận Phê Duyệt Ký Số</span>
                </div>
                <input
                  type="checkbox"
                  checked={gk.layer3Approval.enabled}
                  onChange={(e) =>
                    updateGatekeeper({
                      layer3Approval: { ...gk.layer3Approval, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                />
              </div>

              {gk.layer3Approval.enabled && (
                <div className="space-y-2.5 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      {t.workflowDesigner.approvalModeLabel}
                    </label>
                    <select
                      value={gk.layer3Approval.approvalMode}
                      onChange={(e) =>
                        updateGatekeeper({
                          layer3Approval: {
                            ...gk.layer3Approval,
                            approvalMode: e.target.value as any,
                          },
                        })
                      }
                      className="w-full h-8 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white cursor-pointer focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="ANY">{t.workflowDesigner.modeAny}</option>
                      <option value="ALL_PARALLEL">{t.workflowDesigner.modeAllParallel}</option>
                      <option value="SEQUENTIAL">{t.workflowDesigner.modeSequential}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Vai trò có quyền duyệt:
                    </label>
                    <div className="space-y-1.5 pt-0.5">
                      {[UserRole.BID_MANAGER, UserRole.TECHNICAL_LEAD, UserRole.FINANCE_LEAD, UserRole.TENANT_ADMIN].map(
                        (role) => (
                          <label key={role} className="flex items-center gap-2 text-[11px] cursor-pointer text-slate-700 dark:text-slate-300">
                            <input
                              type="checkbox"
                              checked={gk.layer3Approval.requiredRoles?.includes(role)}
                              onChange={() => handleToggleRole(role)}
                              className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500"
                            />
                            <span>{t.roles[role] || role}</span>
                          </label>
                        )
                      )}
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={gk.layer3Approval.allowManagerBypass}
                      onChange={(e) =>
                        updateGatekeeper({
                          layer3Approval: {
                            ...gk.layer3Approval,
                            allowManagerBypass: e.target.checked,
                          },
                        })
                      }
                      className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>{t.workflowDesigner.allowBypassLabel}</span>
                  </label>
                </div>
              )}
            </div>

            {/* Layer 4: System & Distributed Lock */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <Lock className="w-4 h-4 text-cyan-600" />
                  <span>Lớp 4: Khóa An Toàn Dữ Liệu Đồng Thời</span>
                </div>
                <input
                  type="checkbox"
                  checked={gk.layer4DistributedLock.enabled}
                  onChange={(e) =>
                    updateGatekeeper({
                      layer4DistributedLock: {
                        ...gk.layer4DistributedLock,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                />
              </div>

              {gk.layer4DistributedLock.enabled && (
                <div className="space-y-2.5 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                  <div className="space-y-1 max-w-[180px]">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Thời Gian Khóa Phân Tán
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={gk.layer4DistributedLock.leaseTimeSeconds}
                        onChange={(e) =>
                          updateGatekeeper({
                            layer4DistributedLock: {
                              ...gk.layer4DistributedLock,
                              leaseTimeSeconds: parseInt(e.target.value, 10) || 60,
                            },
                          })
                        }
                        className="w-full h-8 pl-2.5 pr-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-[11px] text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 pointer-events-none select-none">
                        giây
                      </span>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gk.layer4DistributedLock.triggerNotificationOnSuccess}
                      onChange={(e) =>
                        updateGatekeeper({
                          layer4DistributedLock: {
                            ...gk.layer4DistributedLock,
                            triggerNotificationOnSuccess: e.target.checked,
                          },
                        })
                      }
                      className="w-3.5 h-3.5 rounded text-cyan-600 focus:ring-cyan-500"
                    />
                    <span>{t.workflowDesigner.triggerNotificationLabel}</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CONDITIONAL BRANCHING */}
        {activeTab === 'condition' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900 dark:text-white">
                {t.workflowDesigner.conditionBranchTitle}
              </span>
              <button
                type="button"
                onClick={handleAddBranch}
                className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-100 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.workflowDesigner.addBranchBtn}</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {(data.conditionBranches || []).map((br, idx) => (
                <div
                  key={br.id}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <input
                      type="text"
                      value={br.label}
                      onChange={(e) => {
                        const updated = [...(data.conditionBranches || [])];
                        updated[idx] = { ...br, label: e.target.value };
                        updateData({ conditionBranches: updated });
                      }}
                      className="font-bold text-xs bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:outline-none px-1 text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveBranch(br.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Proportional Grid for Condition Fields */}
                  <div className="grid grid-cols-12 gap-1.5 text-[11px]">
                    <div className="col-span-5">
                      <select
                        value={br.field}
                        onChange={(e) => {
                          const updated = [...(data.conditionBranches || [])];
                          updated[idx] = { ...br, field: e.target.value as any };
                          updateData({ conditionBranches: updated });
                        }}
                        className="w-full h-8 px-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none truncate text-xs font-semibold"
                      >
                        <option value="budgetAmount">Ngân sách</option>
                        <option value="landedCostVnd">Landed Cost</option>
                        <option value="winRate">Tỷ lệ thắng</option>
                        <option value="daysRemaining">SLA còn lại</option>
                      </select>
                    </div>

                    <div className="col-span-3">
                      <select
                        value={br.operator}
                        onChange={(e) => {
                          const updated = [...(data.conditionBranches || [])];
                          updated[idx] = { ...br, operator: e.target.value as any };
                          updateData({ conditionBranches: updated });
                        }}
                        className="w-full h-8 px-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none font-mono font-bold text-xs"
                      >
                        <option value=">">&gt;</option>
                        <option value=">=">&gt;=</option>
                        <option value="<">&lt;</option>
                        <option value="<=">&lt;=</option>
                        <option value="==">==</option>
                      </select>
                    </div>

                    <div className="col-span-4">
                      <input
                        type="number"
                        value={br.value}
                        onChange={(e) => {
                          const updated = [...(data.conditionBranches || [])];
                          updated[idx] = { ...br, value: parseFloat(e.target.value) || 0 };
                          updateData({ conditionBranches: updated });
                        }}
                        className="w-full h-7 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-[11px] text-slate-900 dark:text-white focus:outline-none"
                        placeholder="Giá trị"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
