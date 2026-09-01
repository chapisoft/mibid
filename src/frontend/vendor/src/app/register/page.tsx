'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MibidLogo } from '../../shared/ui/MibidLogo';
import { LanguageSwitcher, I18nProvider, useTranslation } from '../../shared/i18n';
import { ThemeSwitcher } from '../../shared/theme/ThemeContext';
import {
  Building2,
  FileCheck,
  Send,
  UploadCloud,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Globe2,
} from 'lucide-react';

function PartnerRegisterContent() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [country, setCountry] = useState('Việt Nam');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [supplyCategory, setSupplyCategory] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-between transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <MibidLogo size="md" />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl w-full mx-auto px-4 py-8 flex-1">
        {submitted ? (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-10 shadow-xl space-y-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {t.portal.regSuccessTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {t.portal.regSuccessDesc}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-400">{t.portal.companyName}:</span>
                <span className="font-bold text-slate-900 dark:text-white">{companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.portal.taxCode}:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{taxCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.portal.contactEmail}:</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">{contactEmail}</span>
              </div>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 py-3 px-6 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.portal.backToHome}</span>
            </Link>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-xl space-y-6 animate-in fade-in">
            <div className="space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  PARTNER ONBOARDING
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {t.portal.regTitle}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.portal.regSubtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Company Name */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>{t.portal.companyName} *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={t.portal.companyNamePlaceholder}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium"
                  />
                </div>

                {/* Tax Code */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-blue-500" />
                    <span>{t.portal.taxCode} *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={taxCode}
                    onChange={(e) => setTaxCode(e.target.value)}
                    placeholder={t.portal.taxCodePlaceholder}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>

                {/* Country */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>{t.portal.country} *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder={t.portal.countryPlaceholder}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium"
                  />
                </div>

                {/* Contact Person */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">{t.portal.contactPerson} *</label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder={t.portal.contactPersonPlaceholder}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium"
                  />
                </div>

                {/* Contact Email */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">{t.portal.contactEmail} *</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder={t.portal.contactEmailPlaceholder}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>

                {/* Contact Phone */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">{t.portal.contactPhone} *</label>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder={t.portal.contactPhonePlaceholder}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>

                {/* Supply Category */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">{t.portal.supplyCategory}</label>
                  <input
                    type="text"
                    value={supplyCategory}
                    onChange={(e) => setSupplyCategory(e.target.value)}
                    placeholder="VD: Máy biến áp 110-500kV, Máy cắt GIS SF6"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium"
                  />
                </div>
              </div>

              {/* Upload Certificate */}
              <div className="space-y-2 pt-2">
                <label className="font-bold text-slate-700 dark:text-slate-300">{t.portal.certUpload}</label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center hover:bg-slate-50/50 dark:hover:bg-slate-950/50 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadedFileName(e.target.files[0].name);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept=".pdf,.zip,.doc,.docx"
                  />
                  <UploadCloud className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="font-bold text-slate-900 dark:text-white">
                    {uploadedFileName || t.portal.dragDropText}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">{t.portal.certUploadHelp}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t.portal.cancelAndBack}</span>
                </Link>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 py-3 px-8 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{t.portal.submitRegBtn}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 dark:border-slate-800/60">
        {t.portal.copyright}
      </footer>
    </div>
  );
}

export default function PartnerRegisterPage() {
  return (
    <I18nProvider>
      <PartnerRegisterContent />
    </I18nProvider>
  );
}
