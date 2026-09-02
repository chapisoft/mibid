'use client';

import React, { useState } from 'react';

export interface LanguageOption {
  code: 'vi' | 'en' | 'zh' | 'ja' | 'ko';
  label: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'zh', label: '中文 (简体)', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
];

/**
 * Dropdown chọn đa ngôn ngữ 5 thứ tiếng (Việt, Anh, Trung, Nhật, Hàn)
 */
export function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState<'vi' | 'en' | 'zh' | 'ja' | 'ko'>('vi');
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  const handleSelect = (code: 'vi' | 'en' | 'zh' | 'ja' | 'ko') => {
    setCurrentLang(code);
    localStorage.setItem('mibid-lang', code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <span className="text-base">{selectedOption.flag}</span>
        <span>{selectedOption.label}</span>
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg py-1 z-50">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors ${
                currentLang === lang.code
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
