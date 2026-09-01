'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../shared/i18n';
import { useAuth } from '../../shared/auth/AuthContext';
import { Briefcase, TrendingUp, DollarSign, AlertCircle, ArrowUpRight, Clock, CheckCircle2 } from 'lucide-react';
import { CmsScreen, TenderProject, TenderStage, TenderStatus } from '../../shared/types';
import { tenderService } from '../../services/tenderService';

interface DashboardPageProps {
  onNavigate: (screen: CmsScreen) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [projects, setProjects] = useState<TenderProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tenderService.getProjects().then((data) => {
      setProjects(data);
      setLoading(false);
    });
  }, []);

  const stats = [
    {
      label: t.dashboard.totalProjects,
      value: projects.length.toString(),
      change: `+12% ${t.dashboard.monthOverMonth}`,
      icon: Briefcase,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60',
    },
    {
      label: t.dashboard.activeTenders,
      value: projects.filter((p) => p.status === TenderStatus.IN_PROGRESS).length.toString(),
      change: `3 ${t.common.packages} (${t.common.priority}: ${t.status.URGENT})`,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60',
    },
    {
      label: t.dashboard.winRate,
      value: '78.5%',
      change: `+4.2% ${t.dashboard.monthOverMonth}`,
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      label: t.dashboard.costSavings,
      value: '14.8 Tỷ',
      change: `${t.dashboard.costSavings}: 8.6%`,
      icon: DollarSign,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60',
    },
  ];

  const recentActivities = [
    {
      id: 'act-1',
      title: t.dashboard.activity1,
      time: t.dashboard.activity1Time,
      type: 'success',
    },
    {
      id: 'act-2',
      title: t.dashboard.activity2,
      time: t.dashboard.activity2Time,
      type: 'info',
    },
    {
      id: 'act-3',
      title: t.dashboard.activity3,
      time: t.dashboard.activity3Time,
      type: 'warning',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {t.dashboard.welcomeTitle}, {user?.fullName || 'Nguyễn Văn Hùng'}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              {t.dashboard.welcomeSubtitle} <span className="font-bold text-white">8 {t.dashboard.activeTendersCount}</span>. Có <span className="font-bold text-amber-300">2 {t.dashboard.dmsExpiringCount}</span>.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate('kanban')}
              className="px-4 py-2.5 rounded-full bg-white text-blue-700 text-xs sm:text-sm font-bold shadow-md hover:bg-blue-50 transition-all"
            >
              {t.dashboard.openKanban}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('workflow')}
              className="px-4 py-2.5 rounded-full bg-blue-500/40 border border-white/20 text-white text-xs sm:text-sm font-semibold hover:bg-blue-500/60 transition-all"
            >
              {t.nav.workflow}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('sourcing')}
              className="px-4 py-2.5 rounded-full bg-blue-500/40 border border-white/20 text-white text-xs sm:text-sm font-semibold hover:bg-blue-500/60 transition-all hidden lg:inline-block"
            >
              {t.dashboard.createRfq}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st, idx) => {
          const Icon = st.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">{st.label}</span>
                <div className={`p-2 rounded-xl ${st.color}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{st.value}</p>
                <p className="text-xs text-slate-400 mt-1">{st.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Urgent Projects */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm sm:text-base">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <span>{t.dashboard.urgentDeadlines}</span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('projects')}
              className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>{t.dashboard.viewAll}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {projects.slice(0, 3).map((p) => (
              <div key={p.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{p.projectCode}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 border border-amber-200 dark:border-amber-900 font-medium">
                      {p.submissionDeadline}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">{p.projectName}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {(p.budgetAmount / 1000000000).toFixed(1)} Tỷ {p.budgetCurrency}
                    </p>
                    <span className="text-[11px] text-slate-400">{t.stages[p.currentStage] || p.currentStage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('kanban')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-300 hover:text-blue-600 text-xs font-bold transition-colors"
                  >
                    {t.dashboard.handleNow}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Recent Activities */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm sm:text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>{t.dashboard.recentActivity}</span>
          </div>

          <div className="space-y-3.5">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">{act.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
