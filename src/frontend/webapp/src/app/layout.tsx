import './globals.css';
import React from 'react';
import { I18nProvider } from '../shared/i18n';
import { ThemeProvider } from '../shared/theme/ThemeContext';
import { AuthProvider } from '../shared/auth/AuthContext';
import { ToastProvider } from '../shared/toast/ToastContext';

export const metadata = {
  title: 'MIBID PRO - Nền Tảng Không Gian Cộng Tác Số Quản Lý Gói Thầu & Hồ Sơ Thầu Xuất Nhập Khẩu',
  description: 'Enterprise Multi-tenant B2B Sourcing and Tender Collaboration Platform with Dynamic Workflow and Gatekeeper',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-32x32.png?v=2026.7', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png?v=2026.7', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-48x48.png?v=2026.7', sizes: '48x48', type: 'image/png' },
      { url: '/favicon.ico?v=2026.7', sizes: 'any' },
    ],
    shortcut: '/favicon.ico?v=2026.7',
    apple: [
      { url: '/apple-touch-icon.png?v=2026.7', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-touch-icon-precomposed.png?v=2026.7',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen">
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
