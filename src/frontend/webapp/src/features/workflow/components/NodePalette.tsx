'use client';

import React from 'react';
import { useTranslation } from '../../../shared/i18n';
import { WorkflowNodeType } from '../../../shared/types';

import {
  PlayCircle,
  Flag,
  CheckSquare,
  GitFork,
  ShieldCheck,
  Award,
  Webhook,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface PaletteItem {
  type: WorkflowNodeType;
  titleKey: string;
  descKey: string;
  icon: React.ElementType;
  color: string;
  badgeBg: string;
  badgeBorder: string;
}

export function NodePalette() {
  const { t } = useTranslation();

  const paletteItems: PaletteItem[] = [
    {
      type: WorkflowNodeType.START,
      titleKey: t.workflowDesigner.nodeTypeStart,
      descKey: t.workflowDesigner.nodeTypeStartDesc,
      icon: PlayCircle,
      color: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/70',
      badgeBorder: 'border-emerald-200 dark:border-emerald-800',
    },
    {
      type: WorkflowNodeType.STAGE,
      titleKey: t.workflowDesigner.nodeTypeStage,
      descKey: t.workflowDesigner.nodeTypeStageDesc,
      icon: Flag,
      color: 'text-blue-600 dark:text-blue-400',
      badgeBg: 'bg-blue-50 dark:bg-blue-950/70',
      badgeBorder: 'border-blue-200 dark:border-blue-800',
    },
    {
      type: WorkflowNodeType.TASK,
      titleKey: t.workflowDesigner.nodeTypeTask,
      descKey: t.workflowDesigner.nodeTypeTaskDesc,
      icon: CheckSquare,
      color: 'text-sky-600 dark:text-sky-400',
      badgeBg: 'bg-sky-50 dark:bg-sky-950/70',
      badgeBorder: 'border-sky-200 dark:border-sky-800',
    },
    {
      type: WorkflowNodeType.CONDITION,
      titleKey: t.workflowDesigner.nodeTypeCondition,
      descKey: t.workflowDesigner.nodeTypeConditionDesc,
      icon: GitFork,
      color: 'text-purple-600 dark:text-purple-400',
      badgeBg: 'bg-purple-50 dark:bg-purple-950/70',
      badgeBorder: 'border-purple-200 dark:border-purple-800',
    },
    {
      type: WorkflowNodeType.GATEKEEPER,
      titleKey: t.workflowDesigner.nodeTypeGatekeeper,
      descKey: t.workflowDesigner.nodeTypeGatekeeperDesc,
      icon: ShieldCheck,
      color: 'text-red-600 dark:text-red-400',
      badgeBg: 'bg-red-50 dark:bg-red-950/70',
      badgeBorder: 'border-red-200 dark:border-red-800',
    },
    {
      type: WorkflowNodeType.APPROVAL,
      titleKey: t.workflowDesigner.nodeTypeApproval,
      descKey: t.workflowDesigner.nodeTypeApprovalDesc,
      icon: Award,
      color: 'text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/70',
      badgeBorder: 'border-amber-200 dark:border-amber-800',
    },
    {
      type: WorkflowNodeType.WEBHOOK,
      titleKey: t.workflowDesigner.nodeTypeWebhook,
      descKey: t.workflowDesigner.nodeTypeWebhookDesc,
      icon: Webhook,
      color: 'text-cyan-600 dark:text-cyan-400',
      badgeBg: 'bg-cyan-50 dark:bg-cyan-950/70',
      badgeBorder: 'border-cyan-200 dark:border-cyan-800',
    },
    {
      type: WorkflowNodeType.END,
      titleKey: t.workflowDesigner.nodeTypeEnd,
      descKey: t.workflowDesigner.nodeTypeEndDesc,
      icon: CheckCircle,
      color: 'text-indigo-600 dark:text-indigo-400',
      badgeBg: 'bg-indigo-50 dark:bg-indigo-950/70',
      badgeBorder: 'border-indigo-200 dark:border-indigo-800',
    },
  ];

  const handleDragStart = (e: React.DragEvent, nodeType: WorkflowNodeType) => {
    e.dataTransfer.setData('application/mibid-node-type', nodeType);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 h-full overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-1">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
          {t.workflowDesigner.paletteTitle}
        </h3>
        <p className="text-[11px] text-slate-400 leading-snug">
          {t.workflowDesigner.paletteSubtitle}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {paletteItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => handleDragStart(e, item.type)}
              className={`p-3 rounded-2xl border ${item.badgeBorder} ${item.badgeBg} cursor-grab active:cursor-grabbing hover:shadow-md hover:scale-[1.02] transition-all space-y-1.5 group select-none`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                  {item.titleKey}
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight pl-0.5">
                {item.descKey}
              </p>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <HelpCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Kéo thả node vào canvas và nối các cổng tròn</span>
        </div>
      </div>
    </aside>
  );
}
