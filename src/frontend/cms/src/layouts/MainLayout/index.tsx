'use client';

import React from 'react';
import { Header } from './components/Header';
import { CmsScreen } from '../../shared/types';

interface MainLayoutProps {
  currentScreen: CmsScreen;
  onSelectScreen: (screen: CmsScreen) => void;
  children: React.ReactNode;
}

export function MainLayout({ currentScreen, onSelectScreen, children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Header currentScreen={currentScreen} onSelectScreen={onSelectScreen} />
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-6">
        {children}
      </main>
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 py-4 text-center text-xs text-slate-400">
        © 2026 MIBID Inc. Nền tảng Không Gian Cộng Tác Số Quản Lý Gói Thầu & Hồ Sơ Thầu Xuất Nhập Khẩu.
      </footer>
    </div>
  );
}
