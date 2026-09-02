'use client';

import React, { useState, useEffect } from 'react';
import { MibidLogo, MibidAppIcon } from '../../shared/ui/MibidLogo';
import { I18nProvider, LanguageSelector, useTranslation } from '../../shared/i18n';
import { ThemeToggle } from '../../shared/theme/ThemeContext';
import { VENDOR_CURRENCY_LIST, VENDOR_INCOTERM_LIST } from '../../shared/constants';
import { Currency, Incoterm, PaymentTerm, RfqLineItem, UploadedDoc, UploadedDocType } from '../../shared/types';
import { CaptchaBox } from '../../shared/components/CaptchaBox';
import { sourcingService } from '../../services/sourcingService';
import {
  ShieldCheck,
  CheckCircle2,
  Send,
  UploadCloud,
  FileText,
  Trash2,
  Printer,
  Clock,
  Lock,
  ShieldAlert,
  AlertTriangle,
  KeyRound,
  Loader2,
} from 'lucide-react';

function VendorPortalContent({ token }: { token?: string }) {
  const { t } = useTranslation();
  const [pinEntered, setPinEntered] = useState(false);
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [pinErrorMsg, setPinErrorMsg] = useState('');
  const [shakePin, setShakePin] = useState(false);

  // Dynamic API state (Zero hardcoded default data)
  const [isLoadingRfq, setIsLoadingRfq] = useState(true);
  const [rfqData, setRfqData] = useState<any>(null);
  const [rfqItems, setRfqItems] = useState<RfqLineItem[]>([]);
  const [submissionReceipt, setSubmissionReceipt] = useState<any>(null);

  // CAPTCHA verification state (kích hoạt khi nhập sai từ 2 lần trở lên -> attemptsLeft <= 3)
  const [captchaInput, setCaptchaInput] = useState('');
  const [expectedCaptcha, setExpectedCaptcha] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [captchaKey, setCaptchaKey] = useState(0);

  const isCaptchaRequired = attemptsLeft <= 3;

  const [currency, setCurrency] = useState<Currency>(Currency.USD);
  const [incoterm, setIncoterm] = useState<Incoterm>(Incoterm.CIF);
  const [paymentTerm, setPaymentTerm] = useState<PaymentTerm>(PaymentTerm.LC_AT_SIGHT);
  const [loadingPort, setLoadingPort] = useState('');
  const [dischargePort, setDischargePort] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [prices, setPrices] = useState<Record<string, string>>({});
  const [origins, setOrigins] = useState<Record<string, string>>({});
  const [leadTime, setLeadTime] = useState('');
  const [warranty, setWarranty] = useState('');
  const [notes, setNotes] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<UploadedDoc[]>([]);

  // Load RFQ Data dynamically from backend API
  useEffect(() => {
    let isMounted = true;
    async function loadRfqFromApi() {
      setIsLoadingRfq(true);
      const tokenStr = token || '';
      if (!tokenStr) {
        if (isMounted) setIsLoadingRfq(false);
        return;
      }
      const data = await sourcingService.getPortalRfq(tokenStr);
      if (isMounted && data) {
        setRfqData(data);
        if (data.items && Array.isArray(data.items)) {
          setRfqItems(data.items);
          const pMap: Record<string, string> = {};
          const oMap: Record<string, string> = {};
          data.items.forEach((it: any) => {
            pMap[it.id] = it.unitPrice !== undefined && it.unitPrice !== null ? String(it.unitPrice) : '';
            oMap[it.id] = it.origin || '';
          });
          setPrices(pMap);
          setOrigins(oMap);
        }
        if (data.currency) setCurrency(data.currency as Currency);
        if (data.incoterm) setIncoterm(data.incoterm as Incoterm);
        if (data.paymentTerm) setPaymentTerm(data.paymentTerm as PaymentTerm);
        if (data.loadingPort) setLoadingPort(data.loadingPort);
        if (data.dischargePort) setDischargePort(data.dischargePort);
        if (data.leadTimeWeeks) setLeadTime(String(data.leadTimeWeeks));
        if (data.warrantyMonths) setWarranty(String(data.warrantyMonths));
        if (data.notes) setNotes(data.notes);
        if (data.attachedDocs && Array.isArray(data.attachedDocs)) {
          setAttachedFiles(data.attachedDocs);
        }
      }
      if (isMounted) setIsLoadingRfq(false);
    }
    loadRfqFromApi();
    return () => {
      isMounted = false;
    };
  }, [token]);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 13,
    hours: 22,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (!isLocked || lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          setAttemptsLeft(5);
          setPinErrorMsg('');
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isLocked, lockoutSeconds]);

  const formatLockoutTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const executeVerifyPin = async (pinValue?: string) => {
    if (isLocked) return;

    // Nếu đã nhập sai từ 2 lần trở lên (attemptsLeft <= 3), bắt buộc phải xác thực CAPTCHA
    if (isCaptchaRequired) {
      if (!captchaInput.trim()) {
        setCaptchaError(t.portal.captchaRequired);
        return;
      }
      if (captchaInput.trim().toUpperCase() !== expectedCaptcha.toUpperCase()) {
        setCaptchaError(t.portal.captchaIncorrect);
        setCaptchaInput('');
        setCaptchaKey((prev) => prev + 1);
        return;
      }
    }

    const enteredPin = pinValue ?? pin.join('');
    if (enteredPin.length < 6) {
      setPinErrorMsg(t.portal.pinIncomplete);
      return;
    }

    if (!token) {
      throw new Error('MISSING_TOKEN');
    }
    const tokenStr = token;
    const res = await sourcingService.verifyPortalPin(tokenStr, enteredPin, captchaInput);

    if (res && res.success) {
      setPinEntered(true);
      setAttemptsLeft(5);
      setPinErrorMsg('');
      setCaptchaInput('');
      setCaptchaError('');
    } else {
      const nextAttempts = res?.remainingAttempts !== undefined ? res.remainingAttempts : attemptsLeft - 1;
      setAttemptsLeft(nextAttempts);
      setShakePin(true);
      setTimeout(() => setShakePin(false), 500);
      setCaptchaInput('');
      setCaptchaKey((prev) => prev + 1);

      if (res?.isLocked || nextAttempts <= 0) {
        setIsLocked(true);
        setLockoutSeconds(res?.lockoutSeconds || 900); // Tạm khóa 15 phút (900 giây)
        setPinErrorMsg(t.portal.pinLocked);
      } else if (nextAttempts <= 3) {
        setPinErrorMsg(t.portal.pinWrongWithCaptcha.replace('{remaining}', nextAttempts.toString()));
      } else {
        setPinErrorMsg(t.portal.pinWrong.replace('{remaining}', nextAttempts.toString()));
      }
    }
  };

  const handlePinChange = (index: number, value: string) => {
    if (isLocked) return;
    const val = value.slice(-1).replace(/\D/g, '');
    const newPin = [...pin];
    newPin[index] = val;
    setPin(newPin);
    setPinErrorMsg('');
    if (val && index < 5) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }

    // Tự động kiểm tra và mở khóa khi đã điền đủ 6 số PIN
    const fullPin = newPin.join('');
    if (fullPin.length === 6 && newPin.every((d) => d !== '')) {
      if (!isCaptchaRequired || captchaInput.trim()) {
        setTimeout(() => executeVerifyPin(fullPin), 60);
      }
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeVerifyPin();
    }
  };

  const handlePinPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    if (isLocked) return;
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;
    const newPin = ['', '', '', '', '', ''];
    for (let i = 0; i < pasteData.length; i++) {
      newPin[i] = pasteData[i];
    }
    setPin(newPin);
    setPinErrorMsg('');
    const focusIdx = Math.min(pasteData.length, 5);
    document.getElementById(`pin-${focusIdx}`)?.focus();

    // Tự động kiểm tra và mở khóa khi dán đủ 6 số PIN
    if (pasteData.length === 6) {
      if (!isCaptchaRequired || captchaInput.trim()) {
        setTimeout(() => executeVerifyPin(pasteData), 60);
      }
    }
  };

  const handleVerifyPin = () => {
    executeVerifyPin();
  };

  const handlePriceChange = (id: string, val: string) => {
    // Loại bỏ ký tự không hợp lệ, giữ lại số và tối đa 1 dấu chấm thập phân
    const raw = val.replace(/,/g, '').replace(/[^0-9.]/g, '');
    const parts = raw.split('.');
    const clean = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : raw;
    setPrices({ ...prices, [id]: clean });
  };

  const formatInputValue = (val: string | undefined) => {
    if (!val) return '';
    const parts = val.split('.');
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? `.${parts[1]}` : '';
    const formattedInteger = integerPart ? Number(integerPart).toLocaleString('en-US') : '';
    return `${formattedInteger}${decimalPart}`;
  };

  const handleOriginChange = (id: string, val: string) => {
    setOrigins({ ...origins, [id]: val });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      const newDoc: UploadedDoc = {
        id: `doc-${Date.now()}`,
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        type: UploadedDocType.CO_CQ,
        uploadedAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
      };
      setAttachedFiles([...attachedFiles, newDoc]);
    }
  };

  const handleRemoveDoc = (id: string) => {
    setAttachedFiles(attachedFiles.filter((d) => d.id !== id));
  };

  const calculateTotal = () => {
    return rfqItems.reduce((sum, item) => {
      const p = parseFloat(prices[item.id] || '0') || 0;
      return sum + p * item.quantity;
    }, 0);
  };

  const handleSubmitQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (!token) {
      setSubmitting(false);
      return;
    }
    const tokenStr = token;
    const quotePayload = {
      currency,
      incoterm,
      paymentTerm,
      loadingPort,
      dischargePort,
      leadTime,
      warranty,
      notes,
      prices,
      origins,
      attachedFiles,
    };
    const res = await sourcingService.submitPortalQuote(tokenStr, quotePayload);
    if (res && res.receipt) {
      setSubmissionReceipt(res.receipt);
    }
    setSubmitting(false);
    setSubmitted(true);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(val);
  };

  const [isResendModalOpen, setIsResendModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccessMsg, setResendSuccessMsg] = useState(false);

  const handleResendPin = () => {
    setResendSuccessMsg(true);
    setResendCooldown(60);
    // Khi cấp lại PIN mới qua Email, giải phóng trạng thái tạm khóa an toàn và reset CAPTCHA
    setIsLocked(false);
    setLockoutSeconds(0);
    setAttemptsLeft(5);
    setPin(['', '', '', '', '', '']);
    setPinErrorMsg('');
    setCaptchaInput('');
    setCaptchaError('');
    setCaptchaKey((prev) => prev + 1);

    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // MÀN HÌNH 1: XÁC THỰC MÃ PIN BẢO MẬT 6 SỐ & RATE LIMITING
  if (!pinEntered) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative transition-colors">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <LanguageSelector />
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-10 shadow-2xl space-y-6 text-center animate-in fade-in transition-colors">
          <div className="flex justify-center">
            <MibidAppIcon size="lg" />
          </div>
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <KeyRound className="w-3.5 h-3.5" />
              <span>{t.portal.pinTitle}</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {t.portal.title}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">{t.portal.pinSubtitle}</p>
          </div>

          {/* Cảnh báo khóa do Brute-force / Rate Limit */}
          {isLocked ? (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-left space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{t.portal.lockoutNotice}</span>
              </div>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 leading-relaxed">
                {t.portal.lockoutDesc}
              </p>
              <div className="pt-1 flex items-center justify-between border-t border-rose-200/60 dark:border-rose-900/40 text-xs">
                <span className="text-rose-700 dark:text-rose-300 font-medium">{t.portal.lockoutTimerLabel}</span>
                <span className="font-mono font-black text-rose-600 dark:text-rose-400 text-sm">
                  {formatLockoutTimer(lockoutSeconds)}
                </span>
              </div>
            </div>
          ) : null}

          {/* Ô nhập mã PIN 6 số */}
          <div className="space-y-3">
            <div
              onPaste={handlePinPaste}
              className={`flex justify-center gap-2 sm:gap-2.5 transition-transform ${
                shakePin ? 'animate-bounce' : ''
              }`}
            >
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <input
                  key={idx}
                  id={`pin-${idx}`}
                  type="password"
                  maxLength={1}
                  disabled={isLocked}
                  value={pin[idx]}
                  onChange={(e) => handlePinChange(idx, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(idx, e)}
                  placeholder="•"
                  className={`w-10 sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-xl font-black rounded-2xl border transition-all font-mono shadow-sm focus:outline-none ${
                    isLocked
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed'
                      : pinErrorMsg
                      ? 'border-rose-400 dark:border-rose-600 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-300 focus:ring-2 focus:ring-rose-500'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500'
                  }`}
                />
              ))}
            </div>

            {/* Khối CAPTCHA Bảo Mật Kích Hoạt khi nhập sai PIN >= 2 lần */}
            {isCaptchaRequired && !isLocked && (
              <div className="text-left">
                <CaptchaBox
                  key={captchaKey}
                  value={captchaInput}
                  onChange={(val) => {
                    setCaptchaInput(val);
                    setCaptchaError('');
                  }}
                  onCodeGenerated={(code) => setExpectedCaptcha(code)}
                  error={captchaError}
                  label={t.portal.captchaLabel}
                  placeholder={t.portal.captchaPlaceholder}
                  refreshLabel={t.portal.captchaRefresh}
                />
              </div>
            )}

            {/* Thông báo lỗi & số lần thử còn lại */}
            {pinErrorMsg && !isLocked && (
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{pinErrorMsg}</span>
              </div>
            )}

            {!isLocked && (
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>{t.portal.pasteHint}</span>
                <span className="font-mono font-medium">
                  {t.portal.remainingAttemptsLabel} <strong className="text-blue-600 dark:text-blue-400">{attemptsLeft}/5</strong>
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={isLocked}
            onClick={handleVerifyPin}
            className={`w-full py-3.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-lg ${
              isLocked
                ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-blue-500/25'
            }`}
          >
            {t.portal.verifyBtn}
          </button>

          {/* Quên PIN & Hỗ trợ đấu thầu */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsResendModalOpen(true);
                setResendSuccessMsg(false);
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-[11px]"
            >
              {t.portal.forgotPin}
            </button>
            <button
              type="button"
              onClick={() => setIsSupportModalOpen(true)}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium text-[11px]"
            >
              {t.portal.needSupport}
            </button>
          </div>

          <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-mono">
            <Lock className="w-3 h-3 text-emerald-500" />
            <span>{t.portal.jwtLease}</span>
          </div>
        </div>

        {/* Modal Quên PIN / Gửi lại PIN */}
        {isResendModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 text-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.portal.pinTitle}</h3>
              <p className="text-xs text-slate-500">
                {t.portal.resendPinModalDesc}
              </p>

              {resendSuccessMsg ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  {t.portal.resendSuccess}
                </div>
              ) : null}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResendModalOpen(false)}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                >
                  {t.portal.supportClose}
                </button>
                <button
                  type="button"
                  disabled={resendCooldown > 0}
                  onClick={handleResendPin}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition-colors disabled:opacity-50"
                >
                  {resendCooldown > 0 ? `${t.portal.resendCooldown} (${resendCooldown}s)` : t.portal.resendPinBtn}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Hỗ trợ Đấu thầu */}
        {isSupportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 text-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.portal.supportTitle}</h3>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-left text-xs space-y-2">
                <p className="text-slate-700 dark:text-slate-300 font-medium">{t.portal.supportContact}</p>
                <p className="text-slate-500 text-[11px]">{t.portal.supportOfficer}</p>
                <p className="text-slate-500 text-[11px]">{t.portal.supportWorkingHours}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSupportModalOpen(false)}
                className="w-full py-2.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition-colors"
              >
                {t.portal.supportClose}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // MÀN HÌNH 2: NỘP BÁO GIÁ THÀNH CÔNG
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-2xl space-y-6 text-center animate-in zoom-in-95 transition-colors">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">{t.portal.successTitle}</h2>
            <p className="text-xs text-slate-500">{t.portal.successSubtitle}</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-left text-xs space-y-2.5">
            <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2">
              <span className="text-slate-400">{t.portal.rfqCodeLabel}:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{rfqData?.rfqCode || token}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2">
              <span className="text-slate-400">{t.portal.totalQuote}:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 font-mono text-sm">
                {formatCurrency(calculateTotal())} {currency} ({incoterm})
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2">
              <span className="text-slate-400">{t.portal.paymentTerms}:</span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">{paymentTerm}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2">
              <span className="text-slate-400">{t.portal.portsLabel}:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{loadingPort} &rarr; {dischargePort}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2">
              <span className="text-slate-400">{t.portal.leadTimeLabel}:</span>
              <span className="font-bold text-slate-900 dark:text-white">{leadTime} {t.portal.weeks} ({t.portal.warranty}: {warranty} {t.portal.months})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{t.portal.attachedDocsLabel}:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{attachedFiles.length} {t.portal.filesEncrypted}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>{t.portal.printBtn}</span>
            </button>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="flex-1 py-3 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-colors"
            >
              {t.portal.backBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MÀN HÌNH 3: BIỂU MẪU NỘP BÁO GIÁ ĐẦY ĐỦ
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-16 transition-colors">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <MibidLogo size="md" />
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Banner Info & Countdown */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4 transition-colors">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  {rfqData?.rfqCode || token}
                </span>
                {rfqData?.supplierName && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                    {t.portal.invitationId}: {rfqData.supplierName}
                  </span>
                )}
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {rfqData?.title || rfqData?.projectName || t.portal.title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.portal.subtitle}</p>
            </div>

            {/* Countdown Box */}
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 block">
                  {t.portal.timeRemaining}
                </span>
                <div className="flex items-baseline gap-1.5 font-mono font-black text-amber-900 dark:text-amber-100 text-base sm:text-lg">
                  <span>{timeLeft.days}{t.portal.days[0]}</span>
                  <span>:</span>
                  <span>{timeLeft.hours}{t.portal.hours[0]}</span>
                  <span>:</span>
                  <span>{timeLeft.minutes}{t.portal.minutes[0]}</span>
                  <span>:</span>
                  <span className="text-xs text-amber-600 dark:text-amber-400">{timeLeft.seconds}{t.portal.seconds[0]}</span>
                </div>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 block mt-0.5">
                  {t.portal.deadlineAt}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quotation Form */}
        <form onSubmit={handleSubmitQuotation} className="space-y-6">
          {/* Section 1: Commercial & Logistics Terms */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 transition-colors">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">
              1. {t.portal.commercialSection}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.portal.currencySelect}</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="w-full h-10 px-3 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                >
                  {VENDOR_CURRENCY_LIST.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.portal.incotermSelect}</label>
                <select
                  value={incoterm}
                  onChange={(e) => setIncoterm(e.target.value as Incoterm)}
                  className="w-full h-10 px-3 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                >
                  {VENDOR_INCOTERM_LIST.map((i) => (
                    <option key={i} value={i}>
                      {i} (Incoterms 2020)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.portal.paymentTerms}</label>
                <select
                  value={paymentTerm}
                  onChange={(e) => setPaymentTerm(e.target.value as PaymentTerm)}
                  className="w-full h-10 px-3 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                >
                  <option value={PaymentTerm.LC_AT_SIGHT}>100% L/C at sight</option>
                  <option value={PaymentTerm.TT_30_70}>T/T 30% Advance, 70% before Shipment</option>
                  <option value={PaymentTerm.TT_100_ADVANCE}>T/T 100% Advance</option>
                  <option value={PaymentTerm.TT_NET_30}>T/T Net 30 Days after B/L</option>
                  <option value={PaymentTerm.DP}>D/P (Documents against Payment)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.portal.leadTime}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={leadTime}
                  onChange={(e) => setLeadTime(e.target.value.replace(/\D/g, ''))}
                  className="w-full h-10 px-3.5 rounded-xl text-xs font-bold font-mono border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.portal.loadingPort}</label>
                <input
                  type="text"
                  value={loadingPort}
                  onChange={(e) => setLoadingPort(e.target.value)}
                  placeholder="e.g. Shanghai Port / Hamburg Port"
                  className="w-full h-10 px-3.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.portal.dischargePort}</label>
                <input
                  type="text"
                  value={dischargePort}
                  onChange={(e) => setDischargePort(e.target.value)}
                  placeholder="e.g. Hai Phong Port / Cat Lai Port"
                  className="w-full h-10 px-3.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.portal.warranty}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value.replace(/\D/g, ''))}
                  className="w-full h-10 px-3.5 rounded-xl text-xs font-bold font-mono border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Bill of Quantities (BoQ) Line Items */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden space-y-0 transition-colors">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">2. {t.portal.lineItems}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{t.portal.lineItemsDesc}</p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                {rfqItems.length} {t.portal.itemsCountLabel}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4 w-12 text-center">{t.portal.stt}</th>
                    <th className="p-4 w-36">{t.portal.itemCode}</th>
                    <th className="p-4">{t.portal.itemName}</th>
                    <th className="p-4 w-48">{t.portal.origin}</th>
                    <th className="p-4 w-16 text-center">{t.portal.unit}</th>
                    <th className="p-4 w-16 text-center">{t.portal.quantity}</th>
                    <th className="p-4 w-40 text-right">{t.portal.unitPrice} ({currency})</th>
                    <th className="p-4 w-44 text-right">{t.portal.totalAmount} ({currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rfqItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-xs text-slate-400 font-medium">
                        {t.common.noData}
                      </td>
                    </tr>
                  ) : (
                    rfqItems.map((item, idx) => {
                      const price = parseFloat(prices[item.id] || '0') || 0;
                      const amount = price * item.quantity;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="p-4 text-center font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                            {item.itemCode}
                          </td>
                          <td className="p-4 space-y-0.5">
                            <p className="font-bold text-slate-900 dark:text-white">{item.itemName}</p>
                            <p className="text-[11px] text-slate-400">{item.specs}</p>
                          </td>
                          <td className="p-4">
                            <input
                              type="text"
                              value={origins[item.id] || ''}
                              onChange={(e) => handleOriginChange(item.id, e.target.value)}
                              placeholder={t.portal.originPlaceholder}
                              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-4 text-center font-medium">{item.unit}</td>
                          <td className="p-4 text-center font-mono font-bold">{item.quantity}</td>
                          <td className="p-4 text-right">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={formatInputValue(prices[item.id])}
                              onChange={(e) => handlePriceChange(item.id, e.target.value)}
                              placeholder="0"
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-right font-mono font-bold text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-4 text-right font-mono font-black text-slate-900 dark:text-white">
                            {formatCurrency(amount)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Total Footer */}
            <div className="p-6 bg-slate-50/60 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{t.portal.securityVerified}</span>
              </div>

              <div className="flex items-baseline gap-4">
                <span className="text-xs font-bold text-slate-500 uppercase">{t.portal.totalQuote}:</span>
                <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                  {formatCurrency(calculateTotal())} {currency}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Attachment & Certificates (CO/CQ, Datasheet) */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  3. {t.portal.attachmentTitle}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">{t.portal.attachmentSubtitle}</p>
              </div>

              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-600 dark:text-blue-400 text-xs font-bold cursor-pointer transition-colors border border-blue-200 dark:border-blue-800">
                <UploadCloud className="w-4 h-4" />
                <span>{t.portal.uploadBtn}</span>
                <input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg" />
              </label>
            </div>

            {/* List of Attached Files */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {attachedFiles.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{doc.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {doc.size} • {doc.uploadedAt}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(doc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Ghi chú chung */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.portal.notes}</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.portal.notesPlaceholder}
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <span className="text-xs text-slate-400 font-mono">
              {t.portal.checksumBadge}
            </span>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm shadow-xl shadow-blue-500/25 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? t.portal.submitting : t.portal.submitBtn}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export function VendorRfqPage({ token }: { token?: string }) {
  return <VendorPortalContent token={token} />;
}

export default VendorRfqPage;
