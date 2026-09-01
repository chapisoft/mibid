'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../shared/i18n';
import { DataTable, Column } from '../../shared/components/DataTable';
import {
  FileText,
  AlertCircle,
  Upload,
  Download,
  Trash2,
  Plus,
  X,
  Edit3,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building,
  Building2,
  ShieldCheck,
  Award,
  BookOpen,
  FileCheck,
  ExternalLink,
  Layers,
  Filter,
  Check,
  Briefcase,
} from 'lucide-react';
import {
  DocumentItem,
  DocumentOwnerType,
  DocumentStatus,
  DocumentType,
} from '../../shared/types';
import { dmsService } from '../../services/dmsService';

// Danh sách các Vendor đối tác mẫu
const VENDOR_PARTNERS = [
  { id: 'vnd-siemens', code: 'VND-SIEMENS-DE', name: 'Siemens Energy AG (CHLB Đức)', country: 'CHLB Đức' },
  { id: 'vnd-tbea', code: 'VND-TBEA-CN', name: 'TBEA Co., Ltd (Trung Quốc)', country: 'Trung Quốc' },
  { id: 'vnd-emerson', code: 'VND-EMERSON-US', name: 'Emerson Electric Co. (Hoa Kỳ)', country: 'Hoa Kỳ' },
  { id: 'vnd-lscable', code: 'VND-LSCABLE-KR', name: 'LS Cable & System Ltd (Hàn Quốc)', country: 'Hàn Quốc' },
  { id: 'vnd-abb', code: 'VND-ABB-CH', name: 'ABB Power Grids Switzerland Ltd (Thụy Sĩ)', country: 'Thụy Sĩ' },
  { id: 'vnd-mibidheavy', code: 'VND-MIBID-HEAVY', name: 'MIBID Heavy Industries (Việt Nam)', country: 'Việt Nam' },
];

const TENANT_NAME = 'Tổng Công Ty Cổ Phần Năng Lượng MIBID (Tenant Đang Đăng Nhập)';

export function DocumentLibraryPage() {
  const { t } = useTranslation();
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Top Tabs: ALL | TENANT | VENDOR
  const [activeTab, setActiveTab] = useState<'ALL' | 'TENANT' | 'VENDOR'>('ALL');

  // Secondary Filters
  const [filterVendorId, setFilterVendorId] = useState<string>('ALL');
  const [filterDocType, setFilterDocType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<DocumentItem | null>(null);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<DocumentItem | null>(null);

  // Form states for Upload
  const [formOwnerType, setFormOwnerType] = useState<DocumentOwnerType>(DocumentOwnerType.TENANT);
  const [formVendorId, setFormVendorId] = useState('vnd-siemens');
  const [formDocName, setFormDocName] = useState('');
  const [formDocType, setFormDocType] = useState<DocumentType>(DocumentType.LEGAL_PROFILE);
  const [formDocCode, setFormDocCode] = useState('');
  const [formIssuer, setFormIssuer] = useState('');
  const [formFrom, setFormFrom] = useState('2026-01-01');
  const [formTo, setFormTo] = useState('2029-01-01');
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    dmsService.getDocuments().then((data) => setDocs(data));
  }, []);

  // Filter logic
  const filteredDocs = useMemo(() => {
    return docs.filter((d) => {
      // Filter by Top Tab
      if (activeTab === 'TENANT' && d.ownerType !== DocumentOwnerType.TENANT) {
        return false;
      }
      if (activeTab === 'VENDOR' && d.ownerType !== DocumentOwnerType.VENDOR) {
        return false;
      }

      // Filter by Vendor Specific Entity
      if (filterVendorId !== 'ALL' && d.ownerId !== filterVendorId) {
        return false;
      }

      // Filter by Doc Type
      if (filterDocType !== 'ALL' && d.documentType !== filterDocType) {
        return false;
      }

      // Filter by Status
      if (filterStatus !== 'ALL' && d.status !== filterStatus) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = d.documentName.toLowerCase().includes(q);
        const matchOwner = d.ownerName.toLowerCase().includes(q);
        const matchIssuer = d.issuerName.toLowerCase().includes(q);
        const matchCode = d.docCode ? d.docCode.toLowerCase().includes(q) : false;
        const matchNotes = d.notes ? d.notes.toLowerCase().includes(q) : false;
        return matchName || matchOwner || matchIssuer || matchCode || matchNotes;
      }

      return true;
    });
  }, [docs, activeTab, filterVendorId, filterDocType, filterStatus, searchQuery]);

  // KPI Calculations
  const totalCount = docs.length;
  const tenantCount = docs.filter((d) => d.ownerType === DocumentOwnerType.TENANT).length;
  const vendorCount = docs.filter((d) => d.ownerType === DocumentOwnerType.VENDOR).length;
  const expiringCount = docs.filter(
    (d) => d.status === DocumentStatus.EXPIRING_SOON || d.status === DocumentStatus.EXPIRED
  ).length;

  // Handle Upload Submit
  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDocName) return;

    const isTenant = formOwnerType === DocumentOwnerType.TENANT;
    const vendor = VENDOR_PARTNERS.find((v) => v.id === formVendorId);

    const created = await dmsService.uploadDocument({
      documentName: formDocName,
      documentType: formDocType,
      ownerType: formOwnerType,
      ownerId: isTenant ? 'tnt-current' : formVendorId,
      ownerName: isTenant ? TENANT_NAME : (vendor?.name || 'Nhà Cung Cấp Đối Tác'),
      vendorCode: isTenant ? undefined : vendor?.code,
      docCode: formDocCode || `DOC-${Date.now().toString().slice(-4)}`,
      issuerName: formIssuer || (isTenant ? 'Sở Kế Hoạch & Đầu Tư' : 'Tổ chức cấp chứng nhận quốc tế'),
      effectiveFrom: formFrom,
      effectiveTo: formTo,
      notes: formNotes,
      fileSize: '4.5 MB',
    });

    setDocs([created, ...docs]);
    setIsUploadModalOpen(false);

    // Reset Form
    setFormDocName('');
    setFormDocCode('');
    setFormIssuer('');
    setFormNotes('');
  };

  // Handle Edit Submit
  const handleUpdateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;

    const updated = await dmsService.updateDocument(editingDoc.id, editingDoc);
    setDocs(docs.map((d) => (d.id === updated.id ? updated : d)));
    setEditingDoc(null);
  };

  // Handle Delete
  const handleDeleteDoc = async () => {
    if (!deletingDoc) return;

    await dmsService.deleteDocument(deletingDoc.id);
    setDocs(docs.filter((d) => d.id !== deletingDoc.id));
    setSelectedIds(selectedIds.filter((id) => id !== deletingDoc.id));
    setDeletingDoc(null);
  };

  // Columns definition for DataTable
  const columns: Column<DocumentItem>[] = [
    {
      key: 'documentName',
      header: t.dms.docName,
      width: '320px',
      render: (item) => {
        const isTenant = item.ownerType === DocumentOwnerType.TENANT;
        return (
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-2xl shrink-0 mt-0.5 shadow-2xs ${
                isTenant
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                  : 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
              }`}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setViewingDoc(item)}
                className="font-bold text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 text-left cursor-pointer transition-colors line-clamp-2"
                title={item.documentName}
              >
                {item.documentName}
              </button>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                {item.docCode && (
                  <span className="font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Số: {item.docCode}
                  </span>
                )}
                <span>•</span>
                <span>{item.fileSize}</span>
                {item.isVerified && (
                  <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-semibold gap-0.5">
                    <Check className="w-3 h-3" /> {t.dms.docVerified}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'ownerName',
      header: t.dms.ownerEntityHeader,
      width: '260px',
      render: (item) => {
        const isTenant = item.ownerType === DocumentOwnerType.TENANT;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              {isTenant ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
                  <Building className="w-3 h-3 text-blue-600" />
                  {t.dms.ownerTenantBadge}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-2xs">
                  <Building2 className="w-3 h-3 text-purple-600" />
                  {t.dms.ownerVendorBadge}
                </span>
              )}
              {item.vendorCode && (
                <span className="font-mono text-[10px] font-bold text-slate-500">
                  {item.vendorCode}
                </span>
              )}
            </div>
            <div
              className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[240px]"
              title={item.ownerName}
            >
              {item.ownerName}
            </div>
          </div>
        );
      },
    },
    {
      key: 'documentType',
      header: t.dms.docType,
      width: '210px',
      render: (item) => {
        const typeLabels: Record<DocumentType, { label: string; bg: string }> = {
          [DocumentType.LEGAL_PROFILE]: {
            label: 'Pháp Lý Doanh Nghiệp',
            bg: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
          },
          [DocumentType.FINANCIAL_CAPACITY]: {
            label: 'Tài Chính & Kiểm Toán',
            bg: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
          },
          [DocumentType.ISO_CERTIFICATION]: {
            label: 'Chứng Chỉ ISO Quốc Tế',
            bg: 'bg-cyan-50 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300',
          },
          [DocumentType.SIMILAR_CONTRACT]: {
            label: 'Hợp Đồng Tương Tự',
            bg: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300',
          },
          [DocumentType.AUTHORIZATION_LETTER]: {
            label: 'Thư Ủy Quyền (MAF)',
            bg: 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
          },
          [DocumentType.TECHNICAL_CATALOG]: {
            label: 'Type Test & Catalog',
            bg: 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300',
          },
        };

        const config = typeLabels[item.documentType] || typeLabels[DocumentType.LEGAL_PROFILE];

        return (
          <div className="space-y-1">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold ${config.bg}`}
            >
              {config.label}
            </span>
          </div>
        );
      },
    },
    {
      key: 'issuerName',
      header: t.dms.issuer,
      width: '240px',
      render: (item) => (
        <div className="space-y-0.5">
          <div
            className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1"
            title={item.issuerName}
          >
            {item.issuerName}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            {t.dms.fromPrefix} {item.effectiveFrom}
          </div>
        </div>
      ),
    },
    {
      key: 'effectiveTo',
      header: t.dms.validRange,
      width: '210px',
      render: (item) => {
        const isExpiring = item.status === DocumentStatus.EXPIRING_SOON;
        const isExpired = item.status === DocumentStatus.EXPIRED;

        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
              <span>Đến: {item.effectiveTo}</span>
            </div>
            <div>
              {isExpired ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300">
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                  {t.dms.expiredAlert}
                </span>
              ) : isExpiring ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 animate-pulse">
                  <Clock className="w-3 h-3 text-amber-600" />
                  {t.dms.daysLeftPrefix} {item.daysRemaining} ngày (Gia hạn)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {t.dms.daysLeftPrefix} {item.daysRemaining} ngày (Còn hạn)
                </span>
              )}
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{t.dms.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.dms.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{t.dms.uploadDoc}</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards for Document Inventory & Expiry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Tổng Hồ Sơ */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>{t.dms.kpiTotalDocs}</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalCount} <span className="text-sm font-bold text-slate-400 font-sans">Chứng Từ</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.dms.kpiTotalDocsSub}</p>
        </div>

        {/* KPI 2: Hồ Sơ Doanh Nghiệp Tenant */}
        <div
          onClick={() => setActiveTab('TENANT')}
          className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 cursor-pointer hover:border-blue-300 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>{t.dms.kpiTenantDocs}</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
            {tenantCount} <span className="text-sm font-bold text-slate-400 font-sans">Hồ Sơ Nội Bộ</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.dms.kpiTenantDocsSub}</p>
        </div>

        {/* KPI 3: Hồ Sơ Nhà Cung Cấp Vendor */}
        <div
          onClick={() => setActiveTab('VENDOR')}
          className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 cursor-pointer hover:border-purple-300 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>{t.dms.kpiVendorDocs}</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
            {vendorCount} <span className="text-sm font-bold text-slate-400 font-sans">Hồ Sơ Đối Tác</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.dms.kpiVendorDocsSub}</p>
        </div>

        {/* KPI 4: Cảnh Báo Sắp Hết Hạn */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>{t.dms.kpiExpiringSoon}</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {expiringCount} <span className="text-sm font-bold text-slate-400 font-sans">Cần Gia Hạn</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.dms.kpiExpiringSoonSub}</p>
        </div>
      </div>

      {/* Top Tabs: Phân Định Rõ Ràng 2 Không Gian Hồ Sơ (Tenant vs Vendor) */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            setActiveTab('ALL');
            setFilterVendorId('ALL');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t.dms.tabAllDocs}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {totalCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('TENANT');
            setFilterVendorId('ALL');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'TENANT'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building className="w-4 h-4 text-blue-600" />
          <span>{t.dms.tabTenantDocs}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            {tenantCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('VENDOR');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'VENDOR'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4 text-purple-600" />
          <span>{t.dms.tabVendorDocs}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
            {vendorCount}
          </span>
        </button>
      </div>

      {/* Banner Giới Thiệu Không Gian Đang Xem */}
      {activeTab === 'TENANT' && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50 to-white dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-slate-900 border border-blue-200 dark:border-blue-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold">
                DOANH NGHIỆP CỦA BẠN
              </span>
              <span className="font-mono text-xs font-bold text-blue-900 dark:text-blue-200">
                MST: 0108920192
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {t.dms.tenantBannerTitle} {TENANT_NAME}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {t.dms.tenantBannerDesc}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'VENDOR' && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-50 via-pink-50 to-white dark:from-purple-950/40 dark:via-pink-950/20 dark:to-slate-900 border border-purple-200 dark:border-purple-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-bold">
                ĐỐI TÁC QUỐC TẾ & NHÀ SẢN XUẤT
              </span>
              <span className="text-xs font-bold text-purple-900 dark:text-purple-200">
                {VENDOR_PARTNERS.length} Nhà Cung Cấp Đã Ký Thỏa Thuận
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {t.dms.vendorBannerTitle}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {t.dms.vendorBannerDesc}
            </p>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Specific Vendor Filter (Visible when in ALL or VENDOR tab) */}
          <div className="flex-1 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {t.dms.filterSpecificEntityLabel}
            </label>
            <select
              value={filterVendorId}
              onChange={(e) => setFilterVendorId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">🏢 {t.dms.filterAllEntities}</option>
              <option value="tnt-current">🏢 [Tenant] {TENANT_NAME}</option>
              <optgroup label="🏭 Nhà Cung Cấp & Vendor Đối Tác">
                {VENDOR_PARTNERS.map((v) => (
                  <option key={v.id} value={v.id}>
                    🏭 [{v.code}] {v.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Secondary Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter by Document Type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.dms.filterDocTypeLabel}
              </label>
              <select
                value={filterDocType}
                onChange={(e) => setFilterDocType(e.target.value)}
                className="px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white shadow-2xs hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">Tất cả loại hồ sơ</option>
                <option value={DocumentType.LEGAL_PROFILE}>Pháp Lý Doanh Nghiệp</option>
                <option value={DocumentType.FINANCIAL_CAPACITY}>Tài Chính & BCTC</option>
                <option value={DocumentType.ISO_CERTIFICATION}>Chứng Chỉ ISO</option>
                <option value={DocumentType.SIMILAR_CONTRACT}>Hợp Đồng Tương Tự</option>
                <option value={DocumentType.AUTHORIZATION_LETTER}>Thư Ủy Quyền (MAF)</option>
                <option value={DocumentType.TECHNICAL_CATALOG}>Type Test & Catalog</option>
              </select>
            </div>

            {/* Filter by Status */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.dms.filterStatusLabel}
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white shadow-2xs hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value={DocumentStatus.VALID}>✓ Còn hiệu lực</option>
                <option value={DocumentStatus.EXPIRING_SOON}>⚠ Sắp hết hạn (&lt; 30 ngày)</option>
                <option value={DocumentStatus.EXPIRED}>✕ Đã hết hạn</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm chứng từ theo tên, số hiệu văn bản, cơ quan cấp, tên Vendor hoặc Tenant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable<DocumentItem>
        columns={columns}
        data={filteredDocs}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        renderActions={(item) => (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewingDoc(item)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Xem Chi Tiết Chứng Từ"
            >
              <ExternalLink className="w-4 h-4 text-blue-600" />
            </button>
            <button
              type="button"
              onClick={() => setEditingDoc({ ...item })}
              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={t.common.edit}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeletingDoc(item)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={t.common.delete}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* Modal 1: Xem Chi Tiết Chứng Từ (Detail Modal) */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {viewingDoc.ownerType === DocumentOwnerType.TENANT ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                      🏢 Doanh Nghiệp (Tenant)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200">
                      🏭 Nhà Cung Cấp (Vendor)
                    </span>
                  )}
                  {viewingDoc.docCode && (
                    <span className="font-mono text-xs text-slate-500">
                      Số hiệu: {viewingDoc.docCode}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {viewingDoc.documentName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs text-slate-500 block">Đơn Vị Sở Hữu / Chủ Thể:</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {viewingDoc.ownerName}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Cơ Quan / Tổ Chức Cấp:</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {viewingDoc.issuerName}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Thời Hạn Hiệu Lực:</span>
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                  {viewingDoc.effectiveFrom} → {viewingDoc.effectiveTo}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Tình Trạng & Thời Gian Còn Lại:</span>
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Còn {viewingDoc.daysRemaining} ngày
                </span>
              </div>
            </div>

            {viewingDoc.notes && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Phạm Vi Sử Dụng & Ghi Chú Kỹ Thuật:
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 leading-relaxed">
                  {viewingDoc.notes}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Hồ sơ đã được kiểm tra tính pháp lý và lưu trữ an toàn</span>
              </div>
              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Tải Lên Chứng Từ Số Hóa Mới (Upload Modal with Clear Owner Separation) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <span>{t.dms.uploadModalTitle}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadDoc} className="space-y-4">
              {/* Trường 1: Bắt Buộc Chọn Chủ Thể Sở Hữu Hồ Sơ (Tenant vs Vendor) */}
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-2">
                <label className="block text-xs font-bold text-slate-900 dark:text-white">
                  {t.dms.ownerTypeField} <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      formOwnerType === DocumentOwnerType.TENANT
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="ownerType"
                      checked={formOwnerType === DocumentOwnerType.TENANT}
                      onChange={() => setFormOwnerType(DocumentOwnerType.TENANT)}
                      className="hidden"
                    />
                    <Building className="w-4 h-4 shrink-0" />
                    <div className="text-xs font-bold">
                      Doanh Nghiệp (Tenant)
                      <span className="block font-normal text-[10px] opacity-80">
                        Hồ sơ nội bộ của chính công ty
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      formOwnerType === DocumentOwnerType.VENDOR
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="ownerType"
                      checked={formOwnerType === DocumentOwnerType.VENDOR}
                      onChange={() => setFormOwnerType(DocumentOwnerType.VENDOR)}
                      className="hidden"
                    />
                    <Building2 className="w-4 h-4 shrink-0" />
                    <div className="text-xs font-bold">
                      Nhà Cung Cấp (Vendor)
                      <span className="block font-normal text-[10px] opacity-80">
                        MAF, CO/CQ, Type Test đối tác
                      </span>
                    </div>
                  </label>
                </div>

                {/* Nếu chọn Vendor thì hiện dropdown chọn Vendor cụ thể */}
                {formOwnerType === DocumentOwnerType.VENDOR && (
                  <div className="pt-2 space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t.dms.selectVendorField}
                    </label>
                    <select
                      value={formVendorId}
                      onChange={(e) => setFormVendorId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      {VENDOR_PARTNERS.map((v) => (
                        <option key={v.id} value={v.id}>
                          🏭 [{v.code}] {v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Tên Chứng Từ & Số Hiệu Văn Bản */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.dms.docName} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Thư Ủy Quyền Bán Hàng MAF / Chứng Chỉ ISO 9001:2015..."
                    value={formDocName}
                    onChange={(e) => setFormDocName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.dms.docType}
                  </label>
                  <select
                    value={formDocType}
                    onChange={(e) => setFormDocType(e.target.value as DocumentType)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value={DocumentType.LEGAL_PROFILE}>Pháp Lý Doanh Nghiệp</option>
                    <option value={DocumentType.FINANCIAL_CAPACITY}>Tài Chính & BCTC</option>
                    <option value={DocumentType.ISO_CERTIFICATION}>Chứng Chỉ ISO</option>
                    <option value={DocumentType.SIMILAR_CONTRACT}>Hợp Đồng Tương Tự</option>
                    <option value={DocumentType.AUTHORIZATION_LETTER}>Thư Ủy Quyền (MAF)</option>
                    <option value={DocumentType.TECHNICAL_CATALOG}>Type Test & Catalog</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.dms.docCodeField}
                  </label>
                  <input
                    type="text"
                    placeholder="VD: MAF-2026-SIE-01"
                    value={formDocCode}
                    onChange={(e) => setFormDocCode(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Cơ Quan Cấp & Thời Hạn */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.dms.issuer}
                  </label>
                  <input
                    type="text"
                    placeholder="VD: TÜV Rheinland / PwC"
                    value={formIssuer}
                    onChange={(e) => setFormIssuer(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Hiệu Lực Từ Ngày
                  </label>
                  <input
                    type="date"
                    value={formFrom}
                    onChange={(e) => setFormFrom(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Hiệu Lực Đến Ngày
                  </label>
                  <input
                    type="date"
                    value={formTo}
                    onChange={(e) => setFormTo(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Ghi Chú Phạm Vi Sử Dụng */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t.dms.notesField}
                </label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú phạm vi chào thầu hoặc dự án áp dụng..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Chỉnh Sửa Chứng Từ */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {t.dms.editModalTitle}
              </h3>
              <button
                type="button"
                onClick={() => setEditingDoc(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateDoc} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t.dms.docName}
                </label>
                <input
                  type="text"
                  required
                  value={editingDoc.documentName}
                  onChange={(e) => setEditingDoc({ ...editingDoc, documentName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.dms.issuer}
                  </label>
                  <input
                    type="text"
                    value={editingDoc.issuerName}
                    onChange={(e) => setEditingDoc({ ...editingDoc, issuerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Hiệu Lực Đến Ngày
                  </label>
                  <input
                    type="date"
                    value={editingDoc.effectiveTo}
                    onChange={(e) => setEditingDoc({ ...editingDoc, effectiveTo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t.common.status}
                </label>
                <select
                  value={editingDoc.status}
                  onChange={(e) =>
                    setEditingDoc({ ...editingDoc, status: e.target.value as DocumentStatus })
                  }
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                >
                  <option value={DocumentStatus.VALID}>Còn Hiệu Lực (Valid)</option>
                  <option value={DocumentStatus.EXPIRING_SOON}>Sắp Hết Hạn (Expiring Soon)</option>
                  <option value={DocumentStatus.EXPIRED}>Đã Hết Hạn (Expired)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Xác Nhận Xóa */}
      {deletingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {t.dms.deleteModalTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.dms.deleteConfirmText}
            </p>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
              {deletingDoc.documentName}
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingDoc(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleDeleteDoc}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
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
