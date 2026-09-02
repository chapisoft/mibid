import './globals.css';
import React from 'react';
import { I18nProvider } from '../shared/i18n';
import { ThemeProvider } from '../shared/theme/ThemeContext';
import { AuthProvider } from '../shared/auth/AuthContext';
import { ToastProvider } from '../shared/toast/ToastContext';

export const metadata = {
  title: 'MIBID PRO - Nền Tảng Không Gian Cộng Tác Số Quản Lý Gói Thầu & Hồ Sơ Thầu Xuất Nhập Khẩu',
  description: 'Enterprise Multi-tenant B2B Sourcing and Tender Collaboration Platform with Dynamic Workflow and Gatekeeper',
  icons: {
    icon: [
      { url: '/favicon.svg?v=2026.3', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png?v=2026.3', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png?v=2026.3', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.ico?v=2026.3' },
    ],
    shortcut: '/favicon.ico?v=2026.3',
    apple: [
      { url: '/apple-touch-icon.png?v=2026.3', sizes: '180x180', type: 'image/png' },
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
      <head>
        <link rel="shortcut icon" href="/favicon.ico?v=2026.3" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2026.3" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2026.3" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=2026.3" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2026.3" />
      </head>
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
