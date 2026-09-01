'use client';

import React from 'react';
import Link from 'next/link';
import { MibidLogo, MibidAppIcon } from '../shared/ui/MibidLogo';
import { LanguageSwitcher, I18nProvider, useTranslation } from '../shared/i18n';
import { ThemeSwitcher } from '../shared/theme/ThemeContext';
import { ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

function VendorLandingContent() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-between transition-colors">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <MibidLogo size="md" />
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Main Hero Card - Bỏ logo lặp, dùng icon app tinh tế và 100% i18n */}
      <main className="max-w-xl w-full mx-auto px-4 py-12 flex-1 flex items-center justify-center">
        <div className="w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-10 shadow-xl space-y-6 text-center animate-in fade-in transition-colors">
          <div className="flex justify-center">
            <MibidAppIcon size="lg" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              {t.portal.portalBadge}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t.portal.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.portal.subtitle}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-left text-xs space-y-2.5">
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{t.portal.feat1}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{t.portal.feat2}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{t.portal.feat3}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href="/rfq/sample-jwt-token-2026"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-full text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-lg shadow-blue-500/25 transition-all"
            >
              <span>{t.portal.openSampleBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-full text-xs sm:text-sm font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all border border-slate-200 dark:border-slate-700"
            >
              <span>{t.portal.registerPartnerBtn}</span>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-mono pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t.portal.securedBy}</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 dark:border-slate-800/60">
        {t.portal.copyright}
      </footer>
    </div>
  );
}

export default function VendorRootPage() {
  return (
    <I18nProvider>
      <VendorLandingContent />
    </I18nProvider>
  );
}
