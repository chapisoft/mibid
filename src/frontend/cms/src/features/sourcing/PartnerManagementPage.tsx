'use client';

import React, { useState } from 'react';
import { useTranslation } from '../../shared/i18n';
import { SupplierPartner, PartnerOnboardingRequest, PartnerSupportTicket } from '../../shared/types';
import { DataTable, Column } from '../../shared/components/DataTable';
import {
  Building2,
  UserCheck,
  LifeBuoy,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  KeyRound,
  FileText,
  Star,
  Globe2,
  X,
} from 'lucide-react';

import { partnerService } from '../../services/partnerService';

export function PartnerManagementPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'directory' | 'onboarding' | 'support'>('directory');
  const [searchQuery, setSearchQuery] = useState('');

  // Partners state
  const [partners, setPartners] = useState<SupplierPartner[]>([]);
  const [viewingPartner, setViewingPartner] = useState<SupplierPartner | null>(null);
  const [editingPartner, setEditingPartner] = useState<SupplierPartner | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingPartner, setDeletingPartner] = useState<SupplierPartner | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formTaxCode, setFormTaxCode] = useState('');
  const [formCountry, setFormCountry] = useState('Việt Nam');
  const [formCategory, setFormCategory] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');

  // Onboarding state
  const [onboardingRequests, setOnboardingRequests] = useState<PartnerOnboardingRequest[]>([]);

  // Support state
  const [tickets, setTickets] = useState<PartnerSupportTicket[]>([]);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  React.useEffect(() => {
    partnerService.getPartners().then(setPartners);
    partnerService.getOnboardingRequests().then(setOnboardingRequests);
    partnerService.getSupportTickets().then(setTickets);
  }, []);

  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  // CRUD Partners
  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    const newP: SupplierPartner = {
      id: `partner-${Date.now()}`,
      code: `PART-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formName,
      taxCode: formTaxCode,
      country: formCountry,
      category: formCategory,
      rating: 5.0,
      contactPerson: formContact,
      email: formEmail,
      phone: formPhone,
      status: 'ACTIVE',
      totalQuotesSubmitted: 0,
      totalWonBids: 0,
      isoCertified: true,
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };
    setPartners([newP, ...partners]);
    setIsCreateModalOpen(false);
    showToast(`${t.partners.toastAdded} ${formName}`);
    setFormName('');
    setFormTaxCode('');
    setFormCategory('');
    setFormContact('');
    setFormEmail('');
    setFormPhone('');
  };

  const handleUpdatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;
    setPartners(partners.map((p) => (p.id === editingPartner.id ? editingPartner : p)));
    showToast(`${t.partners.toastUpdated} ${editingPartner.name}`);
    setEditingPartner(null);
  };

  const handleDeletePartner = () => {
    if (!deletingPartner) return;
    setPartners(partners.filter((p) => p.id !== deletingPartner.id));
    showToast(`${t.partners.toastDeleted} ${deletingPartner.name}`);
    setDeletingPartner(null);
  };

  // Onboarding Actions
  const handleApproveOnboarding = (req: PartnerOnboardingRequest) => {
    const approvedPartner: SupplierPartner = {
      id: `partner-${Date.now()}`,
      code: `PART-${Math.floor(1000 + Math.random() * 9000)}`,
      name: req.companyName,
      taxCode: req.taxCode,
      country: req.country,
      category: req.category,
      rating: 5.0,
      contactPerson: req.contactPerson,
      email: req.email,
      phone: req.phone,
      status: 'ACTIVE',
      totalQuotesSubmitted: 0,
      totalWonBids: 0,
      isoCertified: true,
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };
    setPartners([approvedPartner, ...partners]);
    setOnboardingRequests(onboardingRequests.filter((r) => r.id !== req.id));
    showToast(`${t.partners.toastApproved} ${req.companyName}`);
  };

  const handleRejectOnboarding = (id: string) => {
    setOnboardingRequests(onboardingRequests.filter((r) => r.id !== id));
    showToast(t.partners.toastRejected);
  };

  // Support PIN Reset Action (Cấp lại mã PIN bảo mật 6 số)
  const handleResetPin = (ticket: PartnerSupportTicket) => {
    const newPin = `${Math.floor(100000 + Math.random() * 900000)}`;
    setTickets(
      tickets.map((t) =>
        t.id === ticket.id ? { ...t, status: 'RESOLVED', currentPin: newPin } : t
      )
    );
    showToast(`${t.partners.toastPinReset} ${ticket.partnerEmail} [${newPin}]`);
  };

  const partnerColumns: Column<SupplierPartner>[] = [
    {
      key: 'code',
      header: t.partners.code,
      width: '140px',
      render: (item: SupplierPartner) => (
        <button
          type="button"
          onClick={() => setViewingPartner(item)}
          className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 text-left cursor-pointer transition-colors"
        >
          {item.code}
        </button>
      ),
    },
    {
      key: 'name',
      header: t.partners.nameAndCountry,
      render: (item: SupplierPartner) => (
        <div className="space-y-0.5">
          <p className="font-bold text-slate-900 dark:text-white text-xs">{item.name}</p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Globe2 className="w-3 h-3 text-slate-400" />
            <span>{item.country}</span>
            <span>•</span>
            <span className="font-mono">{item.taxCode}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: t.partners.category,
      render: (item: SupplierPartner) => (
        <span className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
          {item.category}
        </span>
      ),
    },
    {
      key: 'contactPerson',
      header: t.partners.contactAndEmail,
      render: (item: SupplierPartner) => (
        <div className="text-xs space-y-0.5">
          <p className="font-semibold text-slate-900 dark:text-white">{item.contactPerson}</p>
          <p className="font-mono text-[11px] text-blue-600 dark:text-blue-400">{item.email}</p>
        </div>
      ),
    },
    {
      key: 'rating',
      header: t.partners.rating,
      width: '110px',
      render: (item: SupplierPartner) => (
        <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400 text-xs">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{item.rating.toFixed(1)} / 5.0</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: t.partners.status,
      width: '110px',
      render: (_item: SupplierPartner) => (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          {t.partners.activeStatus}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl animate-in slide-in-from-top-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.partners.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.partners.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'directory' && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t.partners.addPartner}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Main Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('directory')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'directory'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{t.partners.tabDirectory} ({partners.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('onboarding')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'onboarding'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>{t.partners.tabOnboarding} ({onboardingRequests.length})</span>
          {onboardingRequests.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-500 text-white">
              {onboardingRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('support')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'support'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>{t.partners.tabSupport} ({tickets.filter((tk) => tk.status === 'OPEN').length})</span>
        </button>
      </div>

      {/* TAB 1: DANH BẠ ĐỐI TÁC */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.partners.searchPlaceholder}
                className="w-full h-10 pl-10 pr-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <DataTable
            data={partners.filter(
              (p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category.toLowerCase().includes(searchQuery.toLowerCase())
            )}
            columns={partnerColumns}
            renderActions={(item: SupplierPartner) => (
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => setEditingPartner(item)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
                  title={t.common.edit}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingPartner(item)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
                  title={t.common.delete}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          />
        </div>
      )}

      {/* TAB 2: PHÊ DUYỆT ĐĂNG KÝ MỚI */}
      {activeTab === 'onboarding' && (
        <div className="space-y-4">
          {onboardingRequests.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="font-bold text-sm text-slate-900 dark:text-white">{t.partners.emptyOnboardingTitle}</p>
              <p className="text-xs text-slate-400">{t.partners.emptyOnboardingDesc}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {onboardingRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        {t.partners.pendingApproval}
                      </span>
                      <h3 className="font-black text-sm text-slate-900 dark:text-white mt-1">
                        {req.companyName}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {req.country} • {t.partners.taxCodeLabel}: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{req.taxCode}</span>
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{req.submittedAt}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1.5">
                    <p className="text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">{t.partners.categoryLabel}:</span> <span className="font-medium">{req.category}</span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">{t.partners.representativeLabel}:</span> {req.contactPerson} ({req.phone})
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">{t.partners.emailLabel}:</span> <span className="font-mono text-blue-600 dark:text-blue-400">{req.email}</span>
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-slate-700 dark:text-slate-300">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">{req.certFileName}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleRejectOnboarding(req.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      {t.partners.rejectBtn}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveOnboarding(req)}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
                    >
                      {t.partners.approveBtn}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HỖ TRỢ & CẤP LẠI PIN */}
      {activeTab === 'support' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {tickets.map((tk) => (
              <div
                key={tk.id}
                className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        tk.status === 'RESOLVED'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200'
                          : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400 border-red-200'
                      }`}
                    >
                      {tk.status === 'RESOLVED' ? t.partners.resolvedStatus : t.partners.pendingPinStatus}
                    </span>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white mt-1">
                      {tk.partnerName}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {t.partners.rfqPackageLabel}: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{tk.rfqCode}</span>
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{tk.requestedAt}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1.5">
                  <p className="text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400">{t.partners.issueTypeLabel}:</span>{' '}
                    <span className="font-bold text-slate-900 dark:text-white">
                      {tk.issueType === 'FORGOT_PIN' ? t.partners.issueForgotPin : t.partners.issueExpiredLink}
                    </span>
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400">{t.partners.recipientEmailLabel}:</span>{' '}
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{tk.partnerEmail}</span>
                  </p>
                  {tk.currentPin && (
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs">
                      <span className="text-amber-800 dark:text-amber-300 font-semibold">{t.partners.newPinIssuedLabel}:</span>
                      <span className="font-mono font-black text-base text-amber-900 dark:text-amber-100 px-2 py-0.5 bg-white dark:bg-slate-900 rounded-lg">
                        {tk.currentPin}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleResetPin(tk)}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{t.partners.resendPinInstantBtn}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Thêm Mới Đối Tác */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t.partners.createModalTitle}</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreatePartner} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">{t.partners.companyNameField} *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="VD: Schneider Electric France"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">{t.partners.taxCodeField} *</label>
                  <input
                    type="text"
                    required
                    value={formTaxCode}
                    onChange={(e) => setFormTaxCode(e.target.value)}
                    placeholder="VD: FR12998822"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">{t.partners.countryField} *</label>
                  <input
                    type="text"
                    required
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    placeholder="VD: Pháp (France)"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">{t.partners.categoryField} *</label>
                  <input
                    type="text"
                    required
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="VD: Tủ trung thế RMU 24kV, Rơle bảo vệ"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">{t.partners.contactPersonField} *</label>
                  <input
                    type="text"
                    required
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    placeholder="VD: Jean Dupont"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">{t.partners.contactEmailField} *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="tender@schneider-electric.com"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                >
                  {t.partners.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xem Chi Tiết Đối Tác */}
      {viewingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t.partners.viewModalTitle}</h3>
              <button onClick={() => setViewingPartner(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block">{t.partners.code}:</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{viewingPartner.code}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{t.partners.taxCodeField}:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{viewingPartner.taxCode}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{t.partners.countryField}:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{viewingPartner.country}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{t.partners.rating}:</span>
                <span className="font-bold text-amber-500">{viewingPartner.rating} / 5.0</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 block">{t.partners.category}:</span>
              <p className="font-medium text-slate-800 dark:text-slate-200">{viewingPartner.category}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block">Báo Giá Đã Nộp:</span>
                <span className="font-bold text-slate-900 dark:text-white">{viewingPartner.totalQuotesSubmitted}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Gói Trúng Thầu:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{viewingPartner.totalWonBids}</span>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setViewingPartner(null)}
                className="px-6 py-2 rounded-full bg-blue-600 text-white font-bold text-xs"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sửa Đối Tác */}
      {editingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t.partners.editModalTitle}</h3>
              <button onClick={() => setEditingPartner(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdatePartner} className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">{t.partners.companyNameField}</label>
                <input
                  type="text"
                  value={editingPartner.name}
                  onChange={(e) => setEditingPartner({ ...editingPartner, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">{t.partners.contactPersonField}</label>
                <input
                  type="text"
                  value={editingPartner.contactPerson}
                  onChange={(e) => setEditingPartner({ ...editingPartner, contactPerson: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">{t.partners.contactEmailField}</label>
                <input
                  type="email"
                  value={editingPartner.email}
                  onChange={(e) => setEditingPartner({ ...editingPartner, email: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPartner(null)}
                  className="px-5 py-2 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xóa Đối Tác */}
      {deletingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t.partners.deleteModalTitle}</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.partners.deleteConfirmPrefix} <span className="font-bold text-slate-900 dark:text-white">{deletingPartner.name}</span> {t.partners.deleteConfirmSuffix}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPartner(null)}
                className="px-5 py-2 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleDeletePartner}
                className="px-6 py-2 rounded-full font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20"
              >
                {t.common.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
