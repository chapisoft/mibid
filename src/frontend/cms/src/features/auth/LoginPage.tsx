'use client';

import React, { useState } from 'react';
import { CmsScreen, UserRole } from '../../shared/types';
import { useAuth } from '../../shared/auth/AuthContext';
import { useTranslation } from '../../shared/i18n';
import { MibidLogo } from '../../shared/ui/MibidLogo';
import { Lock, User, Building2, ArrowLeft, ArrowRight, ShieldAlert, AlertTriangle } from 'lucide-react';
import { CaptchaBox } from '../../shared/components/CaptchaBox';

interface LoginPageProps {
  onNavigate: (screen: CmsScreen) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [username, setUsername] = useState('admin.mibid');
  const [password, setPassword] = useState('MibidSecure2026!');
  const [tenant, setTenant] = useState('11111111-1111-1111-1111-111111111111');
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setCaptchaError('');

    // Bắt buộc xác thực CAPTCHA nếu đã nhập sai từ 2 lần trở lên
    if (isCaptchaRequired) {
      if (!captchaInput.trim()) {
        setCaptchaError(t.auth.captchaRequired);
        return;
      }
      if (captchaInput.trim().toUpperCase() !== currentCaptchaCode.toUpperCase()) {
        setCaptchaError(t.auth.captchaIncorrect);
        setCaptchaInput('');
        setCaptchaKey((prev) => prev + 1);
        return;
      }
    }

    setLoading(true);

    setTimeout(() => {
      // Mật khẩu chuẩn của hệ thống demo: MibidSecure2026! hoặc Admin@123
      const isValidPassword = password === 'MibidSecure2026!' || password === 'Admin@123' || password === '123456';

      if (!isValidPassword) {
        const nextFailed = failedAttempts + 1;
        setFailedAttempts(nextFailed);
        setCaptchaInput('');
        setCaptchaKey((prev) => prev + 1);
        setLoginError(t.auth.loginFailedAttempts.replace('{attempts}', nextFailed.toString()));
        setLoading(false);
        return;
      }

      // Đăng nhập thành công, reset toàn bộ số lần thử và CAPTCHA
      setFailedAttempts(0);
      setCaptchaInput('');
      setLoginError('');
      setCaptchaError('');
      login({ username });
      setLoading(false);
      onNavigate(getTargetScreen());
    }, 300);
  };

  const handleQuickLogin = (user: string, role: UserRole) => {
    setUsername(user);
    setPassword('MibidSecure2026!');
    setFailedAttempts(0);
    setCaptchaInput('');
    setLoginError('');
    setCaptchaError('');
    setLoading(true);
    setTimeout(() => {
      login({ username: user, role });
      setLoading(false);
      onNavigate(getTargetScreen());
    }, 200);
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
            <p className="text-xs text-slate-400">{t.auth.loginSubtitle}</p>
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
                      {t.auth.captchaTriggerNotice}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Tenant Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>{t.auth.tenantLabel}</span>
              </label>
              <select
                value={tenant}
                onChange={(e) => setTenant(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 shadow-2xs hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-semibold"
              >
                <option value="11111111-1111-1111-1111-111111111111">Tổng Công Ty Thiết Bị Điện Đông Anh (EEMC)</option>
                <option value="22222222-2222-2222-2222-222222222222">Công Ty CP Chế Tạo Biến Thế Hà Nội (HBT)</option>
              </select>
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>{t.auth.usernameLabel}</span>
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setLoginError('');
                }}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span>{t.auth.passwordLabel}</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLoginError('');
                }}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* CAPTCHA Xác thực khi nhập sai >= 2 lần */}
            {isCaptchaRequired && (
              <CaptchaBox
                key={captchaKey}
                value={captchaInput}
                onChange={(val) => {
                  setCaptchaInput(val);
                  setCaptchaError('');
                }}
                onCodeGenerated={(code) => setCurrentCaptchaCode(code)}
                error={captchaError}
                label={t.auth.captchaLabel}
                placeholder={t.auth.captchaPlaceholder}
                refreshLabel={t.auth.captchaRefresh}
              />
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? t.auth.loggingIn : t.auth.loginBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Login Demo Accounts */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
              {t.auth.demoAccountsTitle}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin.mibid', UserRole.BID_MANAGER)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-center transition-colors"
              >
                <span className="block text-[11px] font-bold text-slate-800 dark:text-slate-200">admin.mibid</span>
                <span className="block text-[9px] text-blue-600 dark:text-blue-400">Bid Manager</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('trong.td', UserRole.TECHNICAL_LEAD)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-center transition-colors"
              >
                <span className="block text-[11px] font-bold text-slate-800 dark:text-slate-200">trong.td</span>
                <span className="block text-[9px] text-emerald-600 dark:text-emerald-400">Tech Lead</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('thuy.ltt', UserRole.FINANCE_LEAD)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-center transition-colors"
              >
                <span className="block text-[11px] font-bold text-slate-800 dark:text-slate-200">thuy.ltt</span>
                <span className="block text-[9px] text-purple-600 dark:text-purple-400">Finance Lead</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
