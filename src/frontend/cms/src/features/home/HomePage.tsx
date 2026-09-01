'use client';

import React from 'react';
import { CmsScreen } from '../../shared/types';
import { useAuth } from '../../shared/auth/AuthContext';
import { useTranslation } from '../../shared/i18n';
import {
  Briefcase,
  Kanban,
  FileSpreadsheet,
  SplitSquareVertical,
  CheckSquare,
  Truck,
  FolderLock,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Zap,
  Globe2,
  Lock,
} from 'lucide-react';

import { MibidLogo } from '../../shared/ui/MibidLogo';

interface HomePageProps {
  onNavigate: (screen: CmsScreen) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const features = [
    {
      icon: Kanban,
      title: t.home.feature1Title,
      description: t.home.feature1Desc,
      color: 'from-blue-600 to-indigo-600',
    },
    {
      icon: FileSpreadsheet,
      title: t.home.feature2Title,
      description: t.home.feature2Desc,
      color: 'from-emerald-600 to-teal-600',
    },
    {
      icon: SplitSquareVertical,
      title: t.home.feature3Title,
      description: t.home.feature3Desc,
      color: 'from-purple-600 to-pink-600',
    },
    {
      icon: FolderLock,
      title: t.home.feature4Title,
      description: t.home.feature4Desc,
      color: 'from-amber-600 to-orange-600',
    },
    {
      icon: Truck,
      title: t.home.feature5Title,
      description: t.home.feature5Desc,
      color: 'from-cyan-600 to-blue-600',
    },
    {
      icon: BarChart3,
      title: t.home.feature6Title,
      description: t.home.feature6Desc,
      color: 'from-rose-600 to-red-600',
    },
  ];

  const workflowSteps = [
    { step: '01', name: t.home.step1Name, desc: t.home.step1Desc },
    { step: '02', name: t.home.step2Name, desc: t.home.step2Desc },
    { step: '03', name: t.home.step3Name, desc: t.home.step3Desc },
    { step: '04', name: t.home.step4Name, desc: t.home.step4Desc },
    { step: '05', name: t.home.step5Name, desc: t.home.step5Desc },
    { step: '06', name: t.home.step6Name, desc: t.home.step6Desc },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-slate-800 p-8 sm:p-12 lg:p-16 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/90 dark:bg-white p-2 rounded-xl">
              <MibidLogo size="sm" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-xs font-semibold text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.home.badge}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {t.home.heroTitlePrefix}{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              {t.home.heroTitleHighlight}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            {t.home.heroDesc}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
              >
                <span>{t.home.btnDashboard}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
              >
                <span>{t.home.btnLogin}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate('kanban')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-sm transition-all"
            >
              <span>{t.home.btnKanban}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Features Grid */}
      <div className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t.home.coreCapabilitiesTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t.home.coreCapabilitiesSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm hover:shadow-xl transition-all duration-200 space-y-4 group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${f.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{f.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Standard 6-Stage Tender Workflow */}
      <div className="p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-8">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.home.workflowTitle}</h3>
          <p className="text-xs text-slate-500">{t.home.workflowSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {workflowSteps.map((ws, i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 space-y-2">
              <span className="text-xs font-black text-blue-600 dark:text-blue-400 font-mono">{t.common.step} {ws.step}</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ws.name}</h4>
              <p className="text-[11px] text-slate-400 leading-snug">{ws.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
