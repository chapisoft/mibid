'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MibidLogo, MibidAppIcon } from '../../shared/ui/MibidLogo';
import { LanguageSelector, useTranslation } from '../../shared/i18n';
import { ThemeToggle } from '../../shared/components/ThemeToggle';
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
  ArrowLeft,
  KeyRound,
  FileText,
  UserPlus,
  HelpCircle,
  X,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

export function VendorLandingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [tokenInput, setTokenInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const handleOpenToken = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanToken = tokenInput.trim();
    if (!cleanToken) {
      setErrorMessage(t.portal?.invitationCodeRequired || 'Vui lòng nhập Mã Mời Thầu để tiếp tục!');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    setErrorMessage('');
    router.push(`/vendor/rfq/${encodeURIComponent(cleanToken)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-between transition-colors">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
              <MibidLogo size="md" />
            </Link>
            <span className="hidden sm:inline-block text-xs font-bold px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Vendor Portal
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mr-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.nav?.home || 'Trang chủ'}</span>
            </Link>
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col items-center justify-center space-y-8">
        {/* Main Hero Card */}
        <div className="w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-xl space-y-6 text-center animate-in fade-in transition-colors">
          <div className="flex justify-center">
            <MibidAppIcon size="lg" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              {t.portal?.portalBadge || 'MIBID B2B VENDOR PORTAL'}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t.portal?.title || 'Cổng Báo Giá Nhà Cung Cấp'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.portal?.subtitle || 'Nộp báo giá và đính kèm hồ sơ kỹ thuật trực tiếp (Không cần tạo tài khoản)'}
            </p>
          </div>

          {/* Invitation Code / Magic Link Opener Form */}
          <form noValidate onSubmit={handleOpenToken} className="space-y-4 pt-1">
            <div className="relative text-left">
              <label
                className={`block text-xs font-bold transition-colors mb-1.5 ${
                  errorMessage
                    ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {t.portal?.invitationCodeLabel || 'Mã Mời Thầu'} *
              </label>
              <div className={`relative transition-transform ${isShaking ? 'animate-shake' : ''}`}>
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => {
                    setTokenInput(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder={t.portal?.invitationCodePlaceholder || 'Nhập Mã Mời Thầu hoặc dán liên kết...'}
                  className={`w-full px-4 py-3 pl-10 rounded-xl text-xs sm:text-sm font-mono transition-all focus:outline-none ${
                    errorMessage
                      ? 'bg-rose-50/70 dark:bg-rose-950/30 border-2 border-rose-500 text-rose-900 dark:text-rose-200 placeholder-rose-400/80 focus:ring-2 focus:ring-rose-500/20 shadow-sm shadow-rose-500/10'
                      : 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
                <KeyRound
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                    errorMessage ? 'text-rose-500' : 'text-slate-400'
                  }`}
                />
              </div>
              {errorMessage && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 text-left pt-1.5 px-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Action Buttons: Báo Giá (Submit Code) & Đăng Ký (Register Partner) */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-lg shadow-blue-500/25 transition-all whitespace-nowrap cursor-pointer"
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">{t.portal?.openSampleBtn || 'Báo Giá'}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
              <Link
                href="/vendor/register"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full text-xs sm:text-sm font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all border border-slate-200 dark:border-slate-700 whitespace-nowrap text-center"
              >
                <UserPlus className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="whitespace-nowrap">{t.portal?.registerPartnerBtn || 'Đăng Ký'}</span>
              </Link>
            </div>
          </form>

          {/* Feature Highlights */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-left text-xs space-y-2.5">
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{t.portal?.feat1 || 'Báo giá trực tiếp nhanh chóng, không cần đăng ký tài khoản'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{t.portal?.feat2 || 'Hỗ trợ đa tiền tệ (USD, EUR, RMB, JPY, VND) & điều kiện giao hàng Incoterms 2020'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{t.portal?.feat3 || 'Bảo mật tuyệt đối, chứng thực số và lưu trữ an toàn'}</span>
            </div>
          </div>

          {/* Security & Support Footnote */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t.portal?.securedBy || 'Được bảo mật bởi MIBID'}</span>
            </div>
            <button
              onClick={() => setShowSupportModal(true)}
              className="inline-flex items-center gap-1 text-blue-500 hover:underline cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t.portal?.needSupport || 'Cần hỗ trợ?'}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t.portal?.supportTitle || 'Trung Tâm Hỗ Trợ Đối Tác Đấu Thầu'}
                </h3>
              </div>
              <button
                onClick={() => setShowSupportModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Hotline Hỗ Trợ 24/7</div>
                  <div className="font-mono text-blue-600 dark:text-blue-400">1900 6868 • Ext: 108</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                <Mail className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Email Tiếp Nhận Hồ Sơ</div>
                  <div className="font-mono text-slate-500 dark:text-slate-400">procurement-support@mibid.vn</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Giờ Làm Việc</div>
                  <div>08:00 - 17:30 (Thứ 2 - Thứ 6)</div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              {t.portal?.supportClose || 'Đóng'}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 dark:border-slate-800/60">
        {t.portal?.copyright || '© 2026 Hệ sinh thái MIBID. Bảo lưu mọi quyền.'}
      </footer>
    </div>
  );
}
