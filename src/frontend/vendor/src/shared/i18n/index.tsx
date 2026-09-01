'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { vi, VendorTranslations } from './locales/vi';
import { en } from './locales/en';
import { zh } from './locales/zh';
import { ja } from './locales/ja';
import { ko } from './locales/ko';
import { Globe } from 'lucide-react';

export type SupportedLocale = 'vi' | 'en' | 'zh' | 'ja' | 'ko';

const translations: Record<SupportedLocale, VendorTranslations> = {
  vi,
  en,
  zh,
  ja,
  ko,
};

export const localeNames: Record<SupportedLocale, { name: string; flag: string }> = {
  vi: { name: 'Tiếng Việt', flag: '🇻🇳' },
  en: { name: 'English', flag: '🇺🇸' },
  zh: { name: '中文', flag: '🇨🇳' },
  ja: { name: '日本語', flag: '🇯🇵' },
  ko: { name: '한국어', flag: '🇰🇷' },
};

interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (loc: SupportedLocale) => void;
  t: VendorTranslations;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>('vi');

  useEffect(() => {
    const saved = localStorage.getItem('mibid-vendor-lang') as SupportedLocale;
    if (saved && translations[saved]) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (loc: SupportedLocale) => {
    setLocaleState(loc);
    localStorage.setItem('mibid-vendor-lang', loc);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    return { locale: 'vi' as SupportedLocale, setLocale: () => {}, t: translations.vi };
  }
  return context;
}

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  return (
    <div
      className="relative inline-block text-left"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50"
      >
        <Globe className="w-3.5 h-3.5 text-blue-600" />
        <span>{localeNames[locale].flag}</span>
        <span>{localeNames[locale].name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-36 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl z-50 animate-in fade-in duration-100">
          {(Object.keys(localeNames) as SupportedLocale[]).map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => {
                setLocale(loc);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                locale === loc
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{localeNames[loc].flag}</span>
              <span>{localeNames[loc].name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
