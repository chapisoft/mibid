'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../shared/i18n';
import { DataTable, Column } from '../../shared/components/DataTable';
import {
  AlertTriangle,
  Plus,
  X,
  Edit3,
  Trash2,
  Search,
  CheckCircle2,
  Ship,
  Navigation,
  FileText,
  Package,
  Calendar,
  Layers,
  Building,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  Truck,
  ExternalLink,
  Info,
  DollarSign,
  Briefcase,
  SlidersHorizontal,
} from 'lucide-react';
import {
  DeliveryScheduleStatus,
  LogisticsStatus,
  ShipmentItem,
  ShipmentMilestoneStatus,
  TenderProject,
  TenderType,
  TransportMode,
} from '../../shared/types';
import { logisticsService } from '../../services/logisticsService';
import { tenderService } from '../../services/tenderService';

export function ShipmentTrackingPage() {
  const { t } = useTranslation();
  const [shipments, setShipments] = useState<ShipmentItem[]>([]);
  const [projects, setProjects] = useState<TenderProject[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter States
  const [filterProjectId, setFilterProjectId] = useState<string>('ALL');
  const [filterTenderType, setFilterTenderType] = useState<string>('ALL');
  const [filterScheduleStatus, setFilterScheduleStatus] = useState<string>('ALL');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingShipment, setViewingShipment] = useState<ShipmentItem | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'MILESTONES' | 'CARGO' | 'DOCS' | 'VESSEL'>('MILESTONES');
  const [editingShipment, setEditingShipment] = useState<ShipmentItem | null>(null);
  const [deletingShipment, setDeletingShipment] = useState<ShipmentItem | null>(null);

  // Form states for Create
  const [formProjectId, setFormProjectId] = useState('');
  const [formBl, setFormBl] = useState('');
  const [formContractNo, setFormContractNo] = useState('');
  const [formSupplier, setFormSupplier] = useState('');
  const [formOriginCountry, setFormOriginCountry] = useState('');
  const [formCarrier, setFormCarrier] = useState('');
  const [formVessel, setFormVessel] = useState('');
  const [formOriginPort, setFormOriginPort] = useState('');
  const [formDestPort, setFormDestPort] = useState('');
  const [formTransportMode, setFormTransportMode] = useState<TransportMode>(TransportMode.SEA);
  const [formContainerDetails, setFormContainerDetails] = useState('');
  const [formContractDeadline, setFormContractDeadline] = useState('');
  const [formEtd, setFormEtd] = useState('');
  const [formEta, setFormEta] = useState('');
  const [formCargoSummary, setFormCargoSummary] = useState('');

  useEffect(() => {
    // Load initial data from Backend RESTful API
    Promise.all([logisticsService.getShipments(), tenderService.getProjects()]).then(
      ([shipmentsData, projectsData]) => {
        setShipments(shipmentsData);
        setProjects(projectsData);
        if (projectsData && projectsData.length > 0) {
          setFormProjectId(projectsData[0].id);
        }
      }
    );
  }, []);

  // Selected project details if single project is filtered
  const selectedProject = useMemo(() => {
    if (filterProjectId === 'ALL') return null;
    return projects.find((p) => p.id === filterProjectId) || null;
  }, [filterProjectId, projects]);

  // Handle Add Shipment
  const handleAddShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBl || !formProjectId) return;

    const project = projects.find((p) => p.id === formProjectId);

    const created = await logisticsService.addShipment({
      blNumber: formBl,
      projectId: formProjectId,
      projectCode: project?.projectCode || '',
      projectName: project?.projectName || '',
      investorName: project?.investorName || '',
      tenderType: project?.tenderType || TenderType.TENANT_PARTICIPATING,
      contractNumber: formContractNo,
      supplierName: formSupplier,
      originCountry: formOriginCountry,
      carrierName: formCarrier,
      vesselName: formVessel,
      originPort: formOriginPort,
      destinationPort: formDestPort,
      transportMode: formTransportMode,
      containerDetails: formContainerDetails,
      contractDeliveryDeadline: formContractDeadline,
      etdDate: formEtd,
      etaDate: formEta,
      scheduleStatus: DeliveryScheduleStatus.ON_TIME,
      delayDays: 0,
      status: LogisticsStatus.BOOKED,
      isDelayed: false,
      cargoSummary: formCargoSummary,
      cargoItems: [],
      milestones: [],
      documents: [],
    });

    setShipments([created, ...shipments]);
    setIsCreateModalOpen(false);
    // Reset form
    setFormBl('');
    setFormContractNo('');
    setFormSupplier('');
    setFormCargoSummary('');
  };

  const handleUpdateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShipment) return;

    const updated = await logisticsService.updateShipment(editingShipment.id, editingShipment);
    setShipments(shipments.map((s) => (s.id === updated.id ? updated : s)));
    setEditingShipment(null);
  };

  const handleDeleteShipment = async () => {
    if (!deletingShipment) return;

    await logisticsService.deleteShipment(deletingShipment.id);
    setShipments(shipments.filter((s) => s.id !== deletingShipment.id));
    setSelectedIds(selectedIds.filter((id) => id !== deletingShipment.id));
    setDeletingShipment(null);
  };

  // Filter Shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      // Filter by Project
      if (filterProjectId !== 'ALL' && s.projectId !== filterProjectId) {
        return false;
      }
      // Filter by Tender Type
      if (filterTenderType !== 'ALL' && s.tenderType !== filterTenderType) {
        return false;
      }
      // Filter by Schedule Status
      if (filterScheduleStatus !== 'ALL') {
        if (filterScheduleStatus === 'DELAYED' && !s.isDelayed) return false;
        if (filterScheduleStatus === 'ON_TIME' && s.isDelayed) return false;
        if (filterScheduleStatus === 'EARLY' && s.scheduleStatus !== 'EARLY') return false;
      }
      // Filter by Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchBl = s.blNumber.toLowerCase().includes(q);
        const matchContract = s.contractNumber.toLowerCase().includes(q);
        const matchProject = s.projectName.toLowerCase().includes(q) || s.projectCode.toLowerCase().includes(q);
        const matchSupplier = s.supplierName.toLowerCase().includes(q);
        const matchCarrier = s.carrierName.toLowerCase().includes(q);
        const matchCargo = s.cargoSummary.toLowerCase().includes(q);
        const matchPort = s.originPort.toLowerCase().includes(q) || s.destinationPort.toLowerCase().includes(q);
        return (
          matchBl ||
          matchContract ||
          matchProject ||
          matchSupplier ||
          matchCarrier ||
          matchCargo ||
          matchPort
        );
      }
      return true;
    });
  }, [shipments, filterProjectId, filterTenderType, filterScheduleStatus, searchQuery]);

  // KPI Calculations
  const totalShipmentCount = shipments.length;
  const onTimeCount = shipments.filter((s) => !s.isDelayed).length;
  const delayedCount = shipments.filter((s) => s.isDelayed).length;
  const onTimeRate = totalShipmentCount > 0 ? Math.round((onTimeCount / totalShipmentCount) * 100) : 100;

  // Columns definition for DataTable
  const columns: Column<ShipmentItem>[] = [
    {
      key: 'blNumber',
      header: t.logistics.blNumber,
      width: '210px',
      render: (item) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setViewingShipment(item);
                setActiveModalTab('MILESTONES');
              }}
              className="font-mono text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 text-left cursor-pointer transition-colors"
            >
              {item.blNumber}
            </button>
            {item.transportMode === 'ROAD' ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                Đường Bộ
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                Đường Biển
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <Ship className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="truncate max-w-[170px]" title={item.carrierName}>
              {item.carrierName}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'projectCode',
      header: t.logistics.projectContractHeader,
      width: '280px',
      render: (item) => {
        const isParticipating = item.tenderType === TenderType.TENANT_PARTICIPATING;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border shadow-2xs ${
                  isParticipating
                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                }`}
              >
                {isParticipating ? 'Đi Dự Thầu' : 'Mua Sắm Sourcing'}
              </span>
              <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">
                {item.projectCode}
              </span>
            </div>
            <div
              className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[260px]"
              title={item.projectName}
            >
              {item.projectName}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              HĐ: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.contractNumber}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'supplierName',
      header: t.logistics.vendorOriginHeader,
      width: '210px',
      render: (item) => (
        <div className="space-y-1">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[190px]" title={item.supplierName}>
            {item.supplierName}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
              Xuất xứ: {item.originCountry}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'cargoSummary',
      header: t.logistics.cargoDetailsHeader,
      width: '260px',
      render: (item) => (
        <div className="space-y-1">
          <div className="text-xs text-slate-700 dark:text-slate-200 line-clamp-2" title={item.cargoSummary}>
            {item.cargoSummary}
          </div>
          {item.containerDetails && (
            <div className="text-[11px] font-mono font-medium text-emerald-700 dark:text-emerald-400">
              Quy cách: {item.containerDetails}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'scheduleStatus',
      header: t.logistics.planComparisonHeader,
      width: '220px',
      render: (item) => {
        const isDelayed = item.isDelayed;
        const delayDays = item.delayDays;

        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Hạn HĐ:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {item.contractDeliveryDeadline}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">ETA Đến:</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{item.etaDate}</span>
            </div>
            <div className="pt-0.5">
              {isDelayed ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800">
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                  Trễ {Math.abs(delayDays)} ngày so với HĐ
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Sớm {delayDays} ngày (Đúng Hạn)
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: t.common.status,
      width: '180px',
      align: 'center',
      render: (item) => {
        const statusConfigs: Record<
          LogisticsStatus,
          { label: string; bg: string; text: string; border: string }
        > = {
          [LogisticsStatus.BOOKED]: {
            label: 'Đã Đặt Chỗ (Booked)',
            bg: 'bg-slate-50 dark:bg-slate-900',
            text: 'text-slate-700 dark:text-slate-300',
            border: 'border-slate-200 dark:border-slate-800',
          },
          [LogisticsStatus.SAILING]: {
            label: 'Đang Trên Biển (Sailing)',
            bg: 'bg-blue-50 dark:bg-blue-950/60',
            text: 'text-blue-700 dark:text-blue-300',
            border: 'border-blue-200 dark:border-blue-800',
          },
          [LogisticsStatus.CUSTOMS_CLEARING]: {
            label: 'Đang Làm Thủ Tục Hải Quan',
            bg: 'bg-amber-50 dark:bg-amber-950/60',
            text: 'text-amber-700 dark:text-amber-300',
            border: 'border-amber-200 dark:border-amber-800',
          },
          [LogisticsStatus.PORT_ARRIVED]: {
            label: 'Đã Cập Cảng Đích',
            bg: 'bg-cyan-50 dark:bg-cyan-950/60',
            text: 'text-cyan-700 dark:text-cyan-300',
            border: 'border-cyan-200 dark:border-cyan-800',
          },
          [LogisticsStatus.DELIVERED]: {
            label: 'Đã Bàn Giao Kho / Công Trường',
            bg: 'bg-emerald-50 dark:bg-emerald-950/60',
            text: 'text-emerald-700 dark:text-emerald-300',
            border: 'border-emerald-200 dark:border-emerald-800',
          },
        };

        const config = statusConfigs[item.status] || statusConfigs[LogisticsStatus.BOOKED];

        return (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border shadow-2xs ${config.bg} ${config.text} ${config.border}`}
          >
            {config.label}
          </span>
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
            <Ship className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{t.logistics.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.logistics.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.logistics.addShipment}</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards for Logistics Plan Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Tổng Lô Hàng */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>{t.logistics.kpiTotalShipments}</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <Ship className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalShipmentCount} <span className="text-sm font-bold text-slate-400 font-sans">Lô Vận Đơn</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.logistics.kpiTotalShipmentsSub}</p>
        </div>

        {/* KPI 2: Tỷ Lệ Đúng Hạn Hợp Đồng */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>{t.logistics.kpiOnTimeRate}</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {onTimeRate}% <span className="text-sm font-bold text-slate-400 font-sans">Đúng Hạn</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {onTimeCount}/{totalShipmentCount} {t.logistics.kpiOnTimeRateSub}
          </p>
        </div>

        {/* KPI 3: Cảnh Báo Chậm Trễ */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>{t.logistics.kpiDelayed}</span>
            <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400">
            {delayedCount} <span className="text-sm font-bold text-slate-400 font-sans">Lô Chậm Trễ</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.logistics.kpiDelayedSub}</p>
        </div>

        {/* KPI 4: Giá Trị Đang Vận Chuyển */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>{t.logistics.kpiInTransitValue}</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            $3.45M
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.logistics.kpiInTransitValueSub}</p>
        </div>
      </div>

      {/* Filter Toolbar: Bắt buộc hỗ trợ lọc và đối chiếu theo Gói Thầu / Kế Hoạch Mua Sắm */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Main Filter: Chọn Gói Thầu / Kế Hoạch Mua Sắm */}
          <div className="flex-1 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              <Building className="w-3.5 h-3.5 inline mr-1 text-blue-600" />
              {t.logistics.tenderFilterLabel}
            </label>
            <select
              value={filterProjectId}
              onChange={(e) => setFilterProjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">📦 {t.logistics.allTenders} ({projects.length} Gói Thầu)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.projectCode}] {p.projectName} ({p.investorName})
                </option>
              ))}
            </select>
          </div>

          {/* Secondary Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Phân loại gói thầu */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.logistics.tenderClassificationLabel}
              </label>
              <select
                value={filterTenderType}
                onChange={(e) => setFilterTenderType(e.target.value)}
                className="px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white shadow-2xs hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">Tất cả phân loại</option>
                <option value={TenderType.TENANT_PARTICIPATING}>Đi Dự Thầu (TENANT_PARTICIPATING)</option>
                <option value={TenderType.TENANT_ISSUED}>Mua Sắm Sourcing (TENANT_ISSUED)</option>
              </select>
            </div>

            {/* Tiến độ đối chiếu */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.logistics.scheduleStatusLabel}
              </label>
              <select
                value={filterScheduleStatus}
                onChange={(e) => setFilterScheduleStatus(e.target.value)}
                className="px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white shadow-2xs hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">{t.logistics.allSchedules}</option>
                <option value="EARLY">✓ Vượt tiến độ (Sớm)</option>
                <option value="ON_TIME">✓ Đúng tiến độ HĐ</option>
                <option value="DELAYED">⚠ Cảnh báo chậm trễ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm theo Số B/L, Số Hợp Đồng, Tên Gói Thầu, Nhà Cung Cấp, Hãng Tàu, Cảng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Banner Tóm Tắt Gói Thầu Đang Chọn Đối Chiếu */}
      {selectedProject && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50 to-white dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-slate-900 border border-blue-200 dark:border-blue-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold">
                ĐANG ĐỐI CHIẾU
              </span>
              <span className="font-mono text-xs font-bold text-blue-900 dark:text-blue-200">
                {selectedProject.projectCode}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {selectedProject.projectName}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
              <span>Chủ đầu tư: <strong>{selectedProject.investorName}</strong></span>
              <span>•</span>
              <span>Hạn nộp thầu / HĐ: <strong>{selectedProject.submissionDeadline}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-center shadow-2xs">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Lô Hàng Của Gói</span>
              <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                {filteredShipments.length} Vận Đơn
              </span>
            </div>
            <button
              type="button"
              onClick={() => setFilterProjectId('ALL')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer shadow-2xs"
            >
              Xem Tất Cả Gói
            </button>
          </div>
        </div>
      )}

      {/* Main DataTable */}
      <DataTable<ShipmentItem>
        columns={columns}
        data={filteredShipments}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        renderActions={(item) => (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setViewingShipment(item);
                setActiveModalTab('MILESTONES');
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Xem Chi Tiết Đối Chiếu Kế Hoạch & Hành Trình"
            >
              <Navigation className="w-4 h-4 text-blue-600" />
            </button>
            <button
              type="button"
              onClick={() => setEditingShipment({ ...item })}
              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={t.common.edit}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeletingShipment(item)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={t.common.delete}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* Modal 1: Chi Tiết Đối Chiếu Kế Hoạch & Hành Trình Vận Đơn (Comprehensive Tracking Modal) */}
      {viewingShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-4xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                    B/L: {viewingShipment.blNumber}
                  </span>
                  <span className="font-mono text-xs text-slate-500">
                    Mã vận đơn: {viewingShipment.trackingNumber}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {viewingShipment.projectName}
                </h3>
                <p className="text-xs text-slate-500">
                  Hợp đồng: <strong className="text-slate-700 dark:text-slate-300">{viewingShipment.contractNumber}</strong> • Nhà cung cấp: <strong className="text-slate-700 dark:text-slate-300">{viewingShipment.supplierName}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingShipment(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveModalTab('MILESTONES')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  activeModalTab === 'MILESTONES'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                📊 {t.logistics.tabMilestones}
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('CARGO')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  activeModalTab === 'CARGO'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                📦 {t.logistics.tabCargo} ({viewingShipment.cargoItems?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('DOCS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  activeModalTab === 'DOCS'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                📑 {t.logistics.tabDocs} ({viewingShipment.documents?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('VESSEL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  activeModalTab === 'VESSEL'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                🚢 {t.logistics.tabVessel}
              </button>
            </div>

            {/* Tab Content 1: Đối Chiếu 5 Mốc Kế Hoạch Hợp Đồng vs Thực Tế */}
            {activeModalTab === 'MILESTONES' && (
              <div className="space-y-4">
                {/* Tóm tắt đối chiếu hạn cam kết */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-slate-500 block">Hạn Giao Hàng Cam Kết Hợp Đồng:</span>
                    <span className="font-mono text-base font-black text-slate-900 dark:text-white">
                      {viewingShipment.contractDeliveryDeadline}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Dự Kiến Bàn Giao Thực Tế:</span>
                    <span className="font-mono text-base font-black text-blue-600 dark:text-blue-400">
                      {viewingShipment.etaDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Đánh Giá Độ Lệch:</span>
                    {viewingShipment.isDelayed ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200">
                        ⚠ Trễ {Math.abs(viewingShipment.delayDays)} ngày so với HĐ
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                        ✓ Vượt tiến độ {viewingShipment.delayDays} ngày
                      </span>
                    )}
                  </div>
                </div>

                {/* Timeline các mốc */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Tiến Trình 5 Mốc Giao Nhận & Nghiệm Thu
                  </h4>
                  <div className="space-y-3">
                    {viewingShipment.milestones?.map((m, idx) => {
                      const isDone = m.status === ShipmentMilestoneStatus.COMPLETED;
                      const isCurrent = m.status === ShipmentMilestoneStatus.IN_PROGRESS;
                      const isDelay = m.status === ShipmentMilestoneStatus.DELAYED;

                      return (
                        <div
                          key={m.id}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            isDone
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                              : isCurrent
                              ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800'
                              : isDelay
                              ? 'bg-red-50/60 dark:bg-red-950/30 border-red-300 dark:border-red-800'
                              : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                                  isDone
                                    ? 'bg-emerald-600 text-white'
                                    : isCurrent
                                    ? 'bg-blue-600 text-white animate-pulse'
                                    : isDelay
                                    ? 'bg-red-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {idx + 1}
                              </div>
                              <div>
                                <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                  {m.stepName}
                                </h5>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                  Địa điểm: <strong>{m.location}</strong>
                                </p>
                                {m.notes && (
                                  <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-1 italic">
                                    Ghi chú: {m.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                                Kế hoạch: {m.plannedDate}
                              </div>
                              {m.actualDate && (
                                <div className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                                  Thực tế: {m.actualDate}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content 2: Danh Mục Thiết Bị BoQ */}
            {activeModalTab === 'CARGO' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Danh Mục Thiết Bị Khối Lượng BoQ Trong Lô Vận Đơn
                </h4>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3">Mã Hàng</th>
                        <th className="p-3">Tên Thiết Bị & Quy Cách</th>
                        <th className="p-3 text-center">Số Lượng</th>
                        <th className="p-3 text-center">Container / Seal</th>
                        <th className="p-3 text-right">Trọng Lượng (Kg)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {viewingShipment.cargoItems?.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                          <td className="p-3 font-mono font-bold text-blue-600">{item.itemCode}</td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-900 dark:text-white">{item.itemName}</div>
                            <div className="text-[11px] text-slate-500">{item.specification}</div>
                          </td>
                          <td className="p-3 text-center font-bold">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="p-3 text-center font-mono text-[11px]">
                            <div>{item.containerNo || 'N/A'}</div>
                            <div className="text-slate-400">Seal: {item.sealNo || 'N/A'}</div>
                          </td>
                          <td className="p-3 text-right font-mono font-bold">
                            {item.grossWeightKg?.toLocaleString() || 0} Kg
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab Content 3: Hồ Sơ Chứng Từ Hải Quan */}
            {activeModalTab === 'DOCS' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Bộ Chứng Từ Xuất Nhập Khẩu & Hải Quan Đính Kèm
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {viewingShipment.documents?.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                            {doc.docName}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Số: {doc.docNumber} • {doc.fileSize}
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 shrink-0">
                        ✓ Hợp Lệ
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab Content 4: Giám Sát Cảng & Tàu Vận Tải */}
            {activeModalTab === 'VESSEL' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-400 block">Hãng Tàu / Forwarder:</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {viewingShipment.carrierName}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Tên Tàu & Số Chuyến (Vessel):</span>
                    <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                      {viewingShipment.vesselName || 'MAERSK HANOI V.2608E'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Cảng Bốc Hàng (POL):</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {viewingShipment.originPort}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Cảng Dỡ Hàng (POD):</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {viewingShipment.destinationPort}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setViewingShipment(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Tạo Vận Đơn Mới Theo Gói Thầu / Kế Hoạch Mua Sắm */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>{t.logistics.createShipmentTitle}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddShipment} className="space-y-4">
              {/* Chọn Gói Thầu / Gói Mua Sắm Bắt Buộc */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t.logistics.tenderNameLabel} <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formProjectId}
                  onChange={(e) => setFormProjectId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.projectCode}] {p.projectName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Thông tin Hợp đồng & Số B/L */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.logistics.blNumber} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: MAEU982341209"
                    value={formBl}
                    onChange={(e) => setFormBl(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.logistics.contractNoLabel}
                  </label>
                  <input
                    type="text"
                    placeholder="VD: HD-2026/EVN-TBEA-01"
                    value={formContractNo}
                    onChange={(e) => setFormContractNo(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Nhà Cung Cấp & Xuất Xứ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.logistics.supplierLabel}
                  </label>
                  <input
                    type="text"
                    placeholder="VD: TBEA Co., Ltd"
                    value={formSupplier}
                    onChange={(e) => setFormSupplier(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Quốc Gia Xuất Xứ
                  </label>
                  <input
                    type="text"
                    value={formOriginCountry}
                    onChange={(e) => setFormOriginCountry(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Hạn Hợp Đồng & Kế Hoạch Vận Tải */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Hạn Giao HĐ Cam Kết <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formContractDeadline}
                    onChange={(e) => setFormContractDeadline(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.logistics.etd}
                  </label>
                  <input
                    type="date"
                    value={formEtd}
                    onChange={(e) => setFormEtd(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.logistics.eta}
                  </label>
                  <input
                    type="date"
                    value={formEta}
                    onChange={(e) => setFormEta(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Hãng Tàu & Cảng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.logistics.carrier}
                  </label>
                  <input
                    type="text"
                    value={formCarrier}
                    onChange={(e) => setFormCarrier(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Quy Cách Kiện / Container
                  </label>
                  <input
                    type="text"
                    value={formContainerDetails}
                    onChange={(e) => setFormContainerDetails(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Mô Tả Hàng Hóa */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Mô Tả Danh Mục Thiết Bị BoQ
                </label>
                <textarea
                  rows={2}
                  placeholder="Mô tả tóm tắt thiết bị, máy móc nhập khẩu trong lô vận đơn..."
                  value={formCargoSummary}
                  onChange={(e) => setFormCargoSummary(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              {/* Submit Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
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

      {/* Modal 3: Chỉnh Sửa Vận Đơn */}
      {editingShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {t.logistics.editShipmentTitle}
              </h3>
              <button
                type="button"
                onClick={() => setEditingShipment(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateShipment} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t.logistics.blNumber}
                </label>
                <input
                  type="text"
                  required
                  value={editingShipment.blNumber}
                  onChange={(e) => setEditingShipment({ ...editingShipment, blNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Hạn HĐ Cam Kết
                  </label>
                  <input
                    type="date"
                    value={editingShipment.contractDeliveryDeadline}
                    onChange={(e) =>
                      setEditingShipment({ ...editingShipment, contractDeliveryDeadline: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.logistics.eta}
                  </label>
                  <input
                    type="date"
                    value={editingShipment.etaDate}
                    onChange={(e) => setEditingShipment({ ...editingShipment, etaDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t.common.status}
                </label>
                <select
                  value={editingShipment.status}
                  onChange={(e) =>
                    setEditingShipment({ ...editingShipment, status: e.target.value as LogisticsStatus })
                  }
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                >
                  <option value={LogisticsStatus.BOOKED}>Đã Đặt Chỗ (Booked)</option>
                  <option value={LogisticsStatus.SAILING}>Đang Trên Biển (Sailing)</option>
                  <option value={LogisticsStatus.CUSTOMS_CLEARING}>Đang Làm Thủ Tục Hải Quan</option>
                  <option value={LogisticsStatus.PORT_ARRIVED}>Đã Cập Cảng Đích</option>
                  <option value={LogisticsStatus.DELIVERED}>Đã Bàn Giao Kho Công Trường</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingShipment(null)}
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

      {/* Modal 4: Xác Nhận Xóa Vận Đơn */}
      {deletingShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {t.logistics.deleteShipmentTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.logistics.deleteConfirmText}
            </p>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
              {deletingShipment.blNumber} • {deletingShipment.projectName}
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingShipment(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleDeleteShipment}
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
