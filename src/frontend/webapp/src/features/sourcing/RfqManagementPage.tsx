import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../shared/i18n';
import { DataTable, Column } from '../../shared/components/DataTable';
import {
  Plus,
  Link,
  Eye,
  Edit3,
  Trash2,
  Copy,
  Check,
  X,
  Search,
  Filter,
  AlertTriangle,
  FileText,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Mail,
  Globe,
  Calendar,
  Anchor,
  Clock,
  Lock,
  ArrowUpRight,
  ExternalLink,
  FileSpreadsheet,
  Package,
  Layers,
} from 'lucide-react';
import { Currency, Incoterm, RfqPackage, RfqStatus, RfqQuotationDetail } from '../../shared/types';
import { sourcingService } from '../../services/sourcingService';

export function RfqManagementPage() {
  const { t } = useTranslation();
  const [rfqs, setRfqs] = useState<RfqPackage[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [generatedLinkModal, setGeneratedLinkModal] = useState<RfqPackage | null>(null);
  const [viewingRfq, setViewingRfq] = useState<RfqPackage | null>(null);
  const [quotationDetail, setQuotationDetail] = useState<RfqQuotationDetail | null>(null);
  const [editingRfq, setEditingRfq] = useState<RfqPackage | null>(null);
  const [deletingRfq, setDeletingRfq] = useState<RfqPackage | null>(null);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (viewingRfq) {
      sourcingService.getQuotationDetail(viewingRfq.id).then((detail) => {
        setQuotationDetail(detail || null);
      });
    } else {
      setQuotationDetail(null);
    }
  }, [viewingRfq]);

  // Form states for Create
  const [newSupplier, setNewSupplier] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newIncoterm, setNewIncoterm] = useState<Incoterm>(Incoterm.CIF);
  const [newCurrency, setNewCurrency] = useState<Currency>(Currency.USD);
  const [newItemCount, setNewItemCount] = useState(8);

  useEffect(() => {
    sourcingService.getRfqs().then((data) => setRfqs(data));
  }, []);

  const handleCreateRfq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier || !newEmail) return;

    const created = await sourcingService.createRfq({
      rfqCode: `RFQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierName: newSupplier,
      supplierEmail: newEmail,
      incoterm: newIncoterm,
      currency: newCurrency,
      itemCount: newItemCount,
    });

    setRfqs([created, ...rfqs]);
    setIsCreateModalOpen(false);
    setNewSupplier('');
    setNewEmail('');
  };

  const handleUpdateRfq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRfq) return;

    const updated = await sourcingService.updateRfq(editingRfq.id, editingRfq);
    setRfqs(rfqs.map((r) => (r.id === updated.id ? updated : r)));
    setEditingRfq(null);
  };

  const handleDeleteRfq = async () => {
    if (!deletingRfq) return;

    await sourcingService.deleteRfq(deletingRfq.id);
    setRfqs(rfqs.filter((r) => r.id !== deletingRfq.id));
    setSelectedIds(selectedIds.filter((id) => id !== deletingRfq.id));
    setDeletingRfq(null);
  };

  const handleCopyLink = (rfq: RfqPackage) => {
    const magicUrl = `http://localhost:3001/rfq/token_${rfq.id}_jwt_secure_72h`;
    navigator.clipboard.writeText(`Đường dẫn nộp thầu MIBID: ${magicUrl}\nMã PIN bảo mật: 202688`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const filteredRfqs = rfqs.filter(
    (r) =>
      r.rfqCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.supplierEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<RfqPackage>[] = [
    {
      key: 'rfqCode',
      header: t.sourcing.rfqCode,
      width: '160px',
      render: (item) => (
        <button
          type="button"
          onClick={() => setViewingRfq(item)}
          className="font-mono text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 text-left cursor-pointer transition-colors"
        >
          {item.rfqCode}
        </button>
      ),
    },
    {
      key: 'supplierName',
      header: t.sourcing.supplier,
      render: (item) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">{item.supplierName}</p>
          <p className="text-xs text-slate-400">{item.supplierEmail}</p>
        </div>
      ),
    },
    {
      key: 'itemCount',
      header: t.sourcing.itemsCount,
      width: '120px',
      align: 'center',
      render: (item) => (
        <span className="font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          {item.itemCount} dòng
        </span>
      ),
    },
    {
      key: 'incoterm',
      header: t.sourcing.incoterm,
      width: '140px',
      align: 'center',
      render: (item) => (
        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {item.incoterm} ({item.currency})
        </span>
      ),
    },
    {
      key: 'totalQuoteAmount',
      header: t.sourcing.quoteValue,
      width: '160px',
      align: 'right',
      render: (item) => (
        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm whitespace-nowrap font-mono">
          {item.totalQuoteAmount ? `${item.totalQuoteAmount.toLocaleString('en-US')} ${item.currency}` : t.sourcing.waitingQuote}
        </span>
      ),
    },
    {
      key: 'status',
      header: t.common.status,
      width: '180px',
      align: 'center',
      render: (item) => (
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap border shadow-2xs ${
            item.status === RfqStatus.QUOTED
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
          }`}
        >
          {t.status[item.status] || item.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.sourcing.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{t.sourcing.subtitle}</p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t.sourcing.createNewRfq}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.common.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable<RfqPackage>
        columns={columns}
        data={filteredRfqs}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        renderActions={(item: RfqPackage) => (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setGeneratedLinkModal(item)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
              title={t.sourcing.magicLink}
            >
              <Link className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setEditingRfq({ ...item })}
              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors"
              title={t.common.edit}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeletingRfq(item)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
              title={t.common.delete}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* Modal 1: Magic Link Modal */}
      {generatedLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.sourcing.magicLink} - {generatedLinkModal.rfqCode}
                </h3>
                <p className="text-xs text-slate-400">{generatedLinkModal.supplierName}</p>
              </div>
              <button
                type="button"
                onClick={() => setGeneratedLinkModal(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Đường dẫn Magic Link (JWT TTL 72h):</span>
                <p className="text-xs font-mono font-medium text-blue-600 dark:text-blue-400 break-all">
                  http://localhost:3001/rfq/token_{generatedLinkModal.id}_jwt_secure_72h
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-0.5">
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase">Mã PIN xác thực 4 số:</span>
                <p className="text-base font-mono font-black text-amber-900 dark:text-amber-200">2026</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleCopyLink(generatedLinkModal)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Đã sao chép' : 'Sao chép liên kết'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Tạo RFQ Mới */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.sourcing.createNewRfq}</h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRfq} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.sourcing.supplier}</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Siemens Energy AG"
                  value={newSupplier}
                  onChange={(e) => setNewSupplier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Nhà Cung Cấp</label>
                <input
                  type="email"
                  required
                  placeholder="VD: tender.sea@siemens-energy.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.sourcing.incoterm}</label>
                  <select
                    value={newIncoterm}
                    onChange={(e) => setNewIncoterm(e.target.value as Incoterm)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  >
                    {Object.values(Incoterm).map((term) => (
                      <option key={term} value={term}>
                        {term}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tiền Tệ</label>
                  <select
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value as Currency)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  >
                    {Object.values(Currency).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Số Dòng Hàng BoQ</label>
                <input
                  type="number"
                  min={1}
                  value={newItemCount}
                  onChange={(e) => setNewItemCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Xem Toàn Bộ Chi Tiết Hồ Sơ Báo Giá (Full Quotation Details & BoQ) */}
      {viewingRfq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-200/80 dark:border-blue-800">
                    {viewingRfq.rfqCode}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {viewingRfq.projectName}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      viewingRfq.status === RfqStatus.QUOTED
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>{t.status[viewingRfq.status] || viewingRfq.status}</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-baseline gap-3">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {quotationDetail?.supplierName || viewingRfq.supplierName}
                  </h2>
                  {quotationDetail?.supplierCountry && (
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      • {quotationDetail.supplierCountry}
                    </span>
                  )}
                  {quotationDetail?.supplierContact && (
                    <span className="text-xs text-slate-400">
                      ({quotationDetail.supplierContact} • {viewingRfq.supplierEmail})
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingRfq(null)}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              
              {/* 4 Metric KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    {t.sourcing.quoteValue}
                  </span>
                  <p className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {viewingRfq.totalQuoteAmount
                      ? `${viewingRfq.totalQuoteAmount.toLocaleString('en-US')} ${viewingRfq.currency}`
                      : t.sourcing.waitingQuote}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    {t.sourcing.incoterm}
                  </span>
                  <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                    {viewingRfq.incoterm} ({viewingRfq.currency})
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    {t.sourcing.leadTimeLabel}
                  </span>
                  <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                    {quotationDetail?.leadTimeWeeks ? `${quotationDetail.leadTimeWeeks} tuần` : '16 tuần'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    {t.sourcing.warrantyLabel}
                  </span>
                  <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                    {quotationDetail?.warrantyMonths ? `${quotationDetail.warrantyMonths} tháng` : '24 tháng'}
                  </p>
                </div>
              </div>

              {/* Section 1: Bảng Chi Tiết Toàn Bộ Dòng Hàng BoQ */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {t.sourcing.boqTableTitle}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {quotationDetail?.items.length || viewingRfq.itemCount} dòng thiết bị
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-3.5 py-3 w-12 text-center">STT</th>
                          <th className="px-3.5 py-3 w-36">{t.sourcing.itemCode}</th>
                          <th className="px-3.5 py-3 min-w-[220px]">{t.sourcing.itemNameSpecs}</th>
                          <th className="px-3.5 py-3 w-36">{t.sourcing.origin}</th>
                          <th className="px-3.5 py-3 w-20 text-center">{t.sourcing.unit}</th>
                          <th className="px-3.5 py-3 w-20 text-center">{t.sourcing.quantity}</th>
                          <th className="px-3.5 py-3 w-32 text-right">{t.sourcing.unitPrice}</th>
                          <th className="px-3.5 py-3 w-36 text-right">{t.sourcing.totalAmount}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                        {quotationDetail?.items && quotationDetail.items.length > 0 ? (
                          quotationDetail.items.map((item, idx) => (
                            <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="px-3.5 py-3 text-center text-slate-400 font-mono font-medium">{idx + 1}</td>
                              <td className="px-3.5 py-3 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                {item.itemCode}
                              </td>
                              <td className="px-3.5 py-3 space-y-0.5">
                                <p className="font-bold text-slate-900 dark:text-white leading-snug">{item.itemName}</p>
                                <p className="text-[11px] text-slate-400 leading-tight">{item.specs}</p>
                              </td>
                              <td className="px-3.5 py-3 text-slate-700 dark:text-slate-300 font-medium">
                                {item.origin}
                              </td>
                              <td className="px-3.5 py-3 text-center font-medium text-slate-600 dark:text-slate-400">
                                {item.unit}
                              </td>
                              <td className="px-3.5 py-3 text-center font-mono font-bold text-slate-900 dark:text-white">
                                {item.quantity}
                              </td>
                              <td className="px-3.5 py-3 text-right font-mono font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                {(item.unitPrice ?? 0).toLocaleString('en-US')} {viewingRfq.currency}
                              </td>
                              <td className="px-3.5 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                {(item.totalAmount ?? 0).toLocaleString('en-US')} {viewingRfq.currency}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                              Đang tải dữ liệu dòng hàng BoQ...
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="bg-slate-50 dark:bg-slate-950 font-bold border-t border-slate-200 dark:border-slate-800">
                        <tr>
                          <td colSpan={6} className="px-4 py-3.5 text-right text-xs uppercase tracking-wider text-slate-500">
                            {t.sourcing.totalQuoteSummary}
                          </td>
                          <td colSpan={2} className="px-4 py-3.5 text-right font-mono text-base font-black text-emerald-600 dark:text-emerald-400">
                            {viewingRfq.totalQuoteAmount
                              ? `${viewingRfq.totalQuoteAmount.toLocaleString('en-US')} ${viewingRfq.currency}`
                              : '0 ' + viewingRfq.currency}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              {/* Section 2: Điều Khoản Thương Mại & Vận Tải Logistics */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Anchor className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {t.sourcing.commercialTerms}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      {t.sourcing.paymentTermsLabel}
                    </span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                      {quotationDetail?.paymentTerm || '100% L/C Không hủy ngang mở tại Vietcombank'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      {t.sourcing.portsLabel}
                    </span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                      {quotationDetail?.loadingPort || 'Hamburg Port, Germany'} ➔ {quotationDetail?.dischargePort || 'Cảng Hải Phòng, Việt Nam'}
                    </p>
                  </div>

                  <div className="md:col-span-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      {t.sourcing.supplierNotesLabel}
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {quotationDetail?.notes || 'Báo giá đã bao gồm chứng chỉ thử nghiệm xuất xưởng FAT, phụ kiện lắp đặt đồng bộ và chuyên gia giám sát hiện trường.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3: Danh Mục Hồ Sơ & Chứng Chỉ Kỹ Thuật Đính Kèm */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {t.sourcing.attachedDocuments}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {quotationDetail?.attachedDocs && quotationDetail.attachedDocs.length > 0 ? (
                    quotationDetail.attachedDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all shadow-2xs"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={doc.name}>
                              {doc.name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {doc.size} • {doc.uploadedAt}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={() => showToast(`Đang mở xem trực tiếp tài liệu: ${doc.name}`)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                            title={t.sourcing.previewDoc}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => showToast(`Đang tải xuống tệp chứng từ: ${doc.name}`)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                            title={t.sourcing.downloadDoc}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 col-span-2">Không có tệp đính kèm nào.</p>
                  )}
                </div>
              </div>

              {/* Section 4: Chứng Thực Số & An Ninh Hồ Sơ */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-200 text-xs font-bold">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span>{t.sourcing.digitalSignatureValid}</span>
                    <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 font-normal block">
                      Hồ sơ báo giá được mã hóa an toàn và xác thực chữ ký điện tử hợp lệ
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-2xs">
                  ✓ Toàn Vẹn
                </span>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t.sourcing.printQuotation}</span>
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Đã xuất toàn bộ hồ sơ báo giá ra tệp Excel (XLSX) thành công!')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shadow-2xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.sourcing.exportExcel}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGeneratedLinkModal(viewingRfq);
                    setViewingRfq(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/80 border border-blue-200/80 dark:border-blue-800 hover:bg-blue-100 text-blue-700 dark:text-blue-300 transition-colors"
                >
                  <Link className="w-3.5 h-3.5" />
                  <span>{t.sourcing.magicLink}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setViewingRfq(null)}
                className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 shadow-md transition-all"
              >
                {t.common.close}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl flex items-center gap-3 text-xs font-bold animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modal 4: Chỉnh Sửa RFQ */}
      {editingRfq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Chỉnh Sửa Gói Yêu Cầu Báo Giá</h3>
              <button
                type="button"
                onClick={() => setEditingRfq(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRfq} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mã RFQ</label>
                <input
                  type="text"
                  disabled
                  value={editingRfq.rfqCode}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.sourcing.supplier}</label>
                <input
                  type="text"
                  required
                  value={editingRfq.supplierName}
                  onChange={(e) => setEditingRfq({ ...editingRfq, supplierName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Nhà Cung Cấp</label>
                <input
                  type="email"
                  required
                  value={editingRfq.supplierEmail}
                  onChange={(e) => setEditingRfq({ ...editingRfq, supplierEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.sourcing.incoterm}</label>
                  <select
                    value={editingRfq.incoterm}
                    onChange={(e) => setEditingRfq({ ...editingRfq, incoterm: e.target.value as Incoterm })}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  >
                    {Object.values(Incoterm).map((term) => (
                      <option key={term} value={term}>
                        {term}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tiền Tệ</label>
                  <select
                    value={editingRfq.currency}
                    onChange={(e) => setEditingRfq({ ...editingRfq, currency: e.target.value as Currency })}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  >
                    {Object.values(Currency).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Số Dòng BoQ</label>
                  <input
                    type="number"
                    min={1}
                    value={editingRfq.itemCount}
                    onChange={(e) => setEditingRfq({ ...editingRfq, itemCount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Trạng Thái</label>
                  <select
                    value={editingRfq.status}
                    onChange={(e) => setEditingRfq({ ...editingRfq, status: e.target.value as RfqStatus })}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  >
                    <option value={RfqStatus.SENT}>Đã gửi Magic Link</option>
                    <option value={RfqStatus.QUOTED}>Đã nộp báo giá</option>
                    <option value={RfqStatus.EXPIRED}>Hết hiệu lực</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingRfq(null)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Xác Nhận Xóa RFQ */}
      {deletingRfq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Xác Nhận Xóa Yêu Cầu Báo Giá</h3>
                <p className="text-xs text-slate-500">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Bạn có chắc chắn muốn xóa gói báo giá <strong className="text-slate-900 dark:text-white">{deletingRfq.rfqCode}</strong> của nhà cung cấp {deletingRfq.supplierName}?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingRfq(null)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleDeleteRfq}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20"
              >
                {t.common.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
