'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, ShieldAlert, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  // Hook vào window.alert để triệt tiêu hoàn toàn dialog mặc định của trình duyệt
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalAlert = window.alert;
      window.alert = (msg?: any) => {
        showToast(String(msg || ''), 'warning');
      };
      return () => {
        window.alert = originalAlert;
      };
    }
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Container hiển thị danh sách Toast */}
      <div
        aria-live="polite"
        className="fixed top-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          let bgClasses = '';
          let icon = null;

          switch (toast.type) {
            case 'success':
              bgClasses =
                'bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-100 border-emerald-200 dark:border-emerald-800/80 shadow-emerald-500/10';
              icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
              break;
            case 'warning':
              bgClasses =
                'bg-amber-50/95 dark:bg-amber-950/90 text-amber-900 dark:text-amber-100 border-amber-200 dark:border-amber-800/80 shadow-amber-500/10';
              icon = <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />;
              break;
            case 'error':
              bgClasses =
                'bg-rose-50/95 dark:bg-rose-950/90 text-rose-900 dark:text-rose-100 border-rose-200 dark:border-rose-800/80 shadow-rose-500/10';
              icon = <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />;
              break;
            default:
              bgClasses =
                'bg-slate-50/95 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800 shadow-slate-500/10';
              icon = <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />;
              break;
          }

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-3 fade-in ${bgClasses}`}
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 text-xs font-semibold leading-relaxed break-words">
                {toast.message}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors shrink-0 -mr-1 -mt-1 cursor-pointer"
                aria-label="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (msg: string, type: ToastType = 'info') => {
        if (typeof console !== 'undefined') {
          console.warn(`[Toast ${type.toUpperCase()}]: ${msg}`);
        }
      },
      removeToast: () => {},
    };
  }
  return context;
}
