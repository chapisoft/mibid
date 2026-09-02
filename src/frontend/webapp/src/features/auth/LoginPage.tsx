'use client';

import React, { useState } from 'react';
import { CmsScreen, UserRole } from '../../shared/types';
import { useAuth } from '../../shared/auth/AuthContext';
import { useTranslation } from '../../shared/i18n';
import { MibidLogo } from '../../shared/ui/MibidLogo';
import { Lock, User, ArrowLeft, ArrowRight, AlertTriangle, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { CaptchaBox } from '../../shared/components/CaptchaBox';

interface LoginPageProps {
  onNavigate: (screen: CmsScreen) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [username, setUsername] = useState('admin.eemc');
  const [password, setPassword] = useState('MibidSecure2026!');
  const [loading, setLoading] = useState(false);

  // Cơ chế phát hiện và kích hoạt CAPTCHA sau 2 lần đăng nhập sai
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [captchaInput, setCaptchaInput] = useState('');
  const [currentCaptchaCode, setCurrentCaptchaCode] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [captchaKey, setCaptchaKey] = useState(0);

  const isCaptchaRequired = failedAttempts >= 2;

  const getTargetScreen = (): CmsScreen => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') as CmsScreen;
      if (redirect && redirect !== 'login' && redirect !== 'home') {
        return redirect;
      }
    }
    return 'dashboard';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setCaptchaError('');

    if (!username.trim()) {
      setLoginError('Vui lòng nhập tên đăng nhập hoặc email');
      return;
    }
    if (!password) {
      setLoginError('Vui lòng nhập mật khẩu');
      return;
    }

    // Bắt buộc xác thực CAPTCHA nếu đã nhập sai từ 2 lần trở lên
    if (isCaptchaRequired) {
      if (!captchaInput.trim()) {
        setCaptchaError(t.auth.captchaRequired || 'Vui lòng nhập mã kiểm tra CAPTCHA');
        return;
      }
      if (captchaInput.trim().toUpperCase() !== currentCaptchaCode.toUpperCase()) {
        setCaptchaError(t.auth.captchaIncorrect || 'Mã kiểm tra CAPTCHA không chính xác');
        setCaptchaInput('');
        setCaptchaKey((prev) => prev + 1);
        return;
      }
    }

    setLoading(true);

    try {
      const result = await login({ username, password });
      if (result.success) {
        setFailedAttempts(0);
        setCaptchaInput('');
        setLoginError('');
        setCaptchaError('');
        onNavigate(getTargetScreen());
      } else {
        const nextFailed = failedAttempts + 1;
        setFailedAttempts(nextFailed);
        setCaptchaInput('');
        setCaptchaKey((prev) => prev + 1);
        setLoginError(result.error || 'Tên đăng nhập hoặc mật khẩu không chính xác');
      }
    } catch (err: any) {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      setLoginError(err?.message || 'Không thể kết nối đến máy chủ xác thực');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (accUser: string, accPass: string = 'MibidSecure2026!') => {
    setUsername(accUser);
    setPassword(accPass);
    setLoginError('');
    setCaptchaError('');
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back to Home button */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.auth.backToHome}</span>
        </button>

        {/* Login Card */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-8 space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <MibidLogo size="lg" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-2">{t.auth.loginTitle}</h2>
            <p className="text-xs text-slate-400">
              Hệ thống tự động nhận diện tổ chức doanh nghiệp được phân quyền
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Cảnh báo lỗi đăng nhập */}
            {loginError && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold">{loginError}</p>
                  {isCaptchaRequired && (
                    <p className="text-[11px] text-rose-600/90 dark:text-rose-400 font-medium">
                      {t.auth.captchaTriggerNotice || 'Nhập sai nhiều lần. Vui lòng xác thực CAPTCHA bên dưới.'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Username / Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Tên đăng nhập hoặc Email</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ví dụ: admin.eemc hoặc admin@eemc.mibid.vn"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 shadow-2xs hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-semibold transition-all"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t.auth.passwordLabel}</span>
                </label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 shadow-2xs hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-semibold transition-all"
                disabled={loading}
              />
            </div>

            {/* Khối CAPTCHA xuất hiện khi người dùng đăng nhập thất bại từ 2 lần trở lên */}
            {isCaptchaRequired && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2 animate-in fade-in slide-in-from-top-2">
                <CaptchaBox
                  key={captchaKey}
                  value={captchaInput}
                  onChange={(val) => {
                    setCaptchaInput(val);
                    setCaptchaError('');
                  }}
                  onCodeGenerated={(code) => setCurrentCaptchaCode(code)}
                  error={captchaError}
                  label={t.auth.captchaLabel || 'Xác thực bảo mật (CAPTCHA)'}
                  placeholder={t.auth.captchaPlaceholder || 'Nhập mã'}
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t.auth.loginBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Login Demos */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
            <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Tài khoản thử nghiệm nhanh (Mật khẩu: MibidSecure2026!)</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin.eemc')}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors flex flex-col cursor-pointer"
              >
                <span className="font-bold text-blue-600 dark:text-blue-400">admin.eemc</span>
                <span className="text-[10px] text-slate-400">EEMC (Enterprise)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('sourcing.eemc')}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors flex flex-col cursor-pointer"
              >
                <span className="font-bold text-emerald-600 dark:text-emerald-400">sourcing.eemc</span>
                <span className="text-[10px] text-slate-400">Sourcing Specialist</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin.pvn')}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors flex flex-col cursor-pointer"
              >
                <span className="font-bold text-purple-600 dark:text-purple-400">admin.pvn</span>
                <span className="text-[10px] text-slate-400">PVN (Starter: 2 users)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('superadmin')}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors flex flex-col cursor-pointer"
              >
                <span className="font-bold text-amber-600 dark:text-amber-400">superadmin</span>
                <span className="text-[10px] text-slate-400">Đa Doanh Nghiệp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
