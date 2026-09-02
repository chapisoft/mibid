'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Edit3,
  Trash2,
  Search,
  Building2,
  Layers,
  CheckCircle2,
  XCircle,
  X,
  Shield,
} from 'lucide-react';
import { menuService } from '../../services/menuService';
import { IAppMenu, ITenantMenuPermission, ICreateMenuCommand } from '../../models/menu.model';
import { DataTable, Column } from '../../shared/components/DataTable';
import { useTranslation } from '../../shared/i18n';

export function MenuManagementPage() {
  const { t } = useTranslation();
  const [menus, setMenus] = useState<IAppMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [viewingMenu, setViewingMenu] = useState<IAppMenu | null>(null);
  const [deletingMenu, setDeletingMenu] = useState<IAppMenu | null>(null);
  const [editingMenu, setEditingMenu] = useState<Partial<ICreateMenuCommand & { id?: string }>>({});

  // Tenant Permissions State
  const [selectedTenantId, setSelectedTenantId] = useState('TNT-01');
  const [tenantPermissions, setTenantPermissions] = useState<ITenantMenuPermission[]>([]);
  const [savingTenant, setSavingTenant] = useState(false);

  const modules = [
    { code: 'ALL', label: 'Tất cả phân hệ' },
    { code: 'SOURCING', label: 'Thu mua & Cung ứng (SOURCING)' },
    { code: 'BIDDING', label: 'Quản lý Đấu thầu (BIDDING)' },
    { code: 'LOGISTICS', label: 'Logistics & Vận đơn (LOGISTICS)' },
    { code: 'ANALYTICS', label: 'Báo cáo & Phân tích (ANALYTICS)' },
    { code: 'SYSTEM_ADMIN', label: 'Quản trị Hệ thống (ADMIN)' },
    { code: 'SAAS_BILLING', label: 'Thuê bao & Gói cước (SAAS)' },
  ];

  const tenants = [
    { id: 'TNT-01', name: 'Công ty Cổ phần Cơ điện MIBID Hà Nội' },
    { id: 'TNT-02', name: 'Tổng Công ty Xây lắp & Thương mại XNK Miền Nam' },
    { id: 'TNT-03', name: 'Tập đoàn Thiết bị Điện & Năng lượng HBT' },
  ];

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const data = await menuService.getAllMenus(selectedModule === 'ALL' ? undefined : selectedModule);
      setMenus(data);
    } catch (err) {
      console.error('Lỗi khi tải danh mục menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, [selectedModule]);

  const handleOpenCreateModal = () => {
    setEditingMenu({
      code: '',
      name: '',
      routePath: '',
      iconName: 'LayoutDashboard',
      moduleCode: 'SOURCING',
      sortOrder: menus.length + 1,
      isActive: true,
      requiredPermission: '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (menu: IAppMenu) => {
    setEditingMenu({
      id: menu.id,
      parentId: menu.parentId,
      code: menu.code,
      name: menu.name,
      routePath: menu.routePath,
      iconName: menu.iconName,
      moduleCode: menu.moduleCode,
      sortOrder: menu.sortOrder,
      isActive: menu.isActive,
      requiredPermission: menu.requiredPermission,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMenu.code || !editingMenu.name || !editingMenu.routePath) return;

    try {
      if (editingMenu.id) {
        await menuService.updateMenu(editingMenu.id, {
          parentId: editingMenu.parentId || undefined,
          name: editingMenu.name,
          routePath: editingMenu.routePath,
          iconName: editingMenu.iconName || 'LayoutDashboard',
          moduleCode: editingMenu.moduleCode || 'SOURCING',
          sortOrder: editingMenu.sortOrder || 1,
          isActive: editingMenu.isActive ?? true,
          requiredPermission: editingMenu.requiredPermission,
        });
      } else {
        await menuService.createMenu({
          parentId: editingMenu.parentId || undefined,
          code: editingMenu.code,
          name: editingMenu.name,
          routePath: editingMenu.routePath,
          iconName: editingMenu.iconName || 'LayoutDashboard',
          moduleCode: editingMenu.moduleCode || 'SOURCING',
          sortOrder: editingMenu.sortOrder || 1,
          isActive: editingMenu.isActive ?? true,
          requiredPermission: editingMenu.requiredPermission,
        });
      }
      setIsEditModalOpen(false);
      fetchMenus();
    } catch (err) {
      console.error('Lỗi khi lưu menu:', err);
    }
  };

  const handleDeleteMenu = async () => {
    if (!deletingMenu) return;
    try {
      await menuService.deleteMenu(deletingMenu.id);
      setDeletingMenu(null);
      fetchMenus();
    } catch (err) {
      console.error('Lỗi khi xóa menu:', err);
    }
  };

  const handleOpenTenantModal = async () => {
    setIsTenantModalOpen(true);
    await loadTenantPermissions(selectedTenantId);
  };

  const loadTenantPermissions = async (tId: string) => {
    try {
      const perms = await menuService.getTenantPermissions(tId);
      setTenantPermissions(perms);
    } catch (err) {
      console.error('Lỗi tải quyền tenant:', err);
    }
  };

  const handleTogglePermission = (menuId: string) => {
    setTenantPermissions((prev) =>
      prev.map((p) => (p.menuId === menuId ? { ...p, isEnabled: !p.isEnabled } : p))
    );
  };

  const handleSaveTenantPermissions = async () => {
    try {
      setSavingTenant(true);
      const enabledMenuIds = tenantPermissions.filter((p) => p.isEnabled).map((p) => p.menuId);
      await menuService.assignTenantMenus(selectedTenantId, enabledMenuIds);
      setIsTenantModalOpen(false);
    } catch (err) {
      console.error('Lỗi lưu phân quyền tenant:', err);
    } finally {
      setSavingTenant(false);
    }
  };

  const filteredMenus = menus.filter(
    (m) =>
      m.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      m.code.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      m.routePath.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  // KPI Calculations
  const totalMenus = menus.length;
  const activeMenusCount = menus.filter((m) => m.isActive).length;
  const uniqueModulesCount = new Set(menus.map((m) => m.moduleCode)).size;
  const systemMenusCount = menus.filter((m) => m.isSystem).length;

  const columns: Column<IAppMenu>[] = [
    {
      key: 'code',
      header: 'Mã Menu (Code)',
      width: '180px',
      render: (item) => (
        <button
          type="button"
          onClick={() => setViewingMenu(item)}
          className="font-mono text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 text-left cursor-pointer transition-colors whitespace-nowrap"
        >
          {item.code}
        </button>
      ),
    },
    {
      key: 'name',
      header: 'Tên Menu / Route',
      render: (item) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
              {item.name}
            </span>
            {item.isSystem && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
                SYSTEM
              </span>
            )}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
            <span className="text-slate-400 font-sans">Đường dẫn:</span> {item.routePath}
          </p>
        </div>
      ),
    },
    {
      key: 'moduleCode',
      header: 'Phân Hệ (Module)',
      width: '180px',
      render: (item) => {
        const colors: Record<string, string> = {
          SOURCING: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60',
          BIDDING: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/60',
          LOGISTICS: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-900/60',
          ANALYTICS: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/60',
          SYSTEM_ADMIN: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
          SAAS_BILLING: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60',
        };
        const cls = colors[item.moduleCode] || 'bg-slate-50 text-slate-700 border-slate-200';
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${cls}`}>
            {item.moduleCode}
          </span>
        );
      },
    },
    {
      key: 'iconName',
      header: 'Biểu Tượng',
      width: '140px',
      render: (item) => (
        <code className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {item.iconName || 'LayoutDashboard'}
        </code>
      ),
    },
    {
      key: 'requiredPermission',
      header: 'Quyền Truy Cập',
      width: '180px',
      render: (item) => (
        <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
          {item.requiredPermission || 'PUBLIC / ALL'}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Trạng Thái',
      width: '130px',
      align: 'center',
      render: (item) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
            item.isActive
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {item.isActive ? (
            <>
              <CheckCircle2 size={12} className="text-emerald-500" />
              Đang Bật
            </>
          ) : (
            <>
              <XCircle size={12} className="text-slate-400" />
              Tạm Tắt
            </>
          )}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Quản Trị Menu & Khai Báo Route Động
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Cấu hình cây thư mục điều hướng động và phân quyền tính năng độc lập theo từng Doanh nghiệp / Tenant
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleOpenTenantModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-emerald-500" />
            <span>Phân Quyền Tenant</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Khai Báo Menu Mới</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Tổng Số Menu</span>
            <FolderTree className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalMenus}</p>
          <p className="text-[11px] text-slate-400 font-medium">Mục menu trên toàn hệ thống</p>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Đang Hoạt Động</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {activeMenusCount} <span className="text-xs font-normal text-slate-400">/ {totalMenus}</span>
          </p>
          <p className="text-[11px] text-emerald-600 font-medium">Sẵn sàng điều hướng người dùng</p>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Phân Hệ Nghiệp Vụ</span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{uniqueModulesCount}</p>
          <p className="text-[11px] text-purple-600 font-medium">Phân hệ chức năng độc lập</p>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Menu Cốt Lõi</span>
            <Shield className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{systemMenusCount}</p>
          <p className="text-[11px] text-amber-600 font-medium">Menu bảo vệ cấp hệ thống</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã menu, tên route, URL..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchKeyword && (
            <button
              type="button"
              onClick={() => setSearchKeyword('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-400 font-semibold whitespace-nowrap">Phân hệ:</label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            aria-label="Lọc theo phân hệ"
            className="px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 shadow-2xs hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          >
            {modules.map((m) => (
              <option key={m.code} value={m.code}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable<IAppMenu>
        data={filteredMenus}
        columns={columns}
        loading={loading}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getRowId={(item) => item.id}
        emptyText="Không tìm thấy danh mục menu nào phù hợp với bộ lọc."
        renderActions={(item) => (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleOpenEditModal(item)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={t.common.edit}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeletingMenu(item)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={t.common.delete}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* Detail Modal: Xem chi tiết toàn diện Menu */}
      {viewingMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
                  <FolderTree className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                    Chi Tiết Menu: {viewingMenu.code}
                  </h3>
                  <p className="text-xs text-slate-500">Thông tin khai báo định tuyến và phân quyền bảo vệ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingMenu(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 text-xs">Mã Menu:</span>
                    <p className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm mt-0.5">
                      {viewingMenu.code}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 text-xs">Trạng Thái:</span>
                    <p className="mt-0.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          viewingMenu.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {viewingMenu.isActive ? 'Đang Kích Hoạt' : 'Tạm Tắt'}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">Tên Hiển Thị:</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{viewingMenu.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 text-xs">Đường Dẫn Route:</span>
                    <p className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                      {viewingMenu.routePath}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 text-xs">Phân Hệ (Module):</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{viewingMenu.moduleCode}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 text-xs">Biểu Tượng Lucide:</span>
                    <p className="font-mono text-slate-700 dark:text-slate-300 mt-0.5">{viewingMenu.iconName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 text-xs">Thứ Tự Sắp Xếp:</span>
                    <p className="font-mono text-slate-700 dark:text-slate-300 mt-0.5">{viewingMenu.sortOrder}</p>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">Mã Quyền Yêu Cầu (Permission):</span>
                  <p className="font-mono text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 p-2.5 rounded-xl mt-1 border border-purple-200 dark:border-purple-900/60">
                    {viewingMenu.requiredPermission || 'PUBLIC / KHÔNG YÊU CẦU ĐẶC QUYỀN'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setViewingMenu(null)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = viewingMenu;
                  setViewingMenu(null);
                  handleOpenEditModal(target);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-xs"
              >
                Chỉnh Sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Modal: Khai báo & Cập nhật Menu */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                {editingMenu.id ? 'Cập Nhật Menu & Route' : 'Khai Báo Menu Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMenu} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mã Menu (Code) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingMenu.id)}
                    value={editingMenu.code || ''}
                    onChange={(e) => setEditingMenu({ ...editingMenu, code: e.target.value.toUpperCase() })}
                    placeholder="VD: MENU_RFQS"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phân Hệ Nghiệp Vụ
                  </label>
                  <select
                    value={editingMenu.moduleCode || 'SOURCING'}
                    onChange={(e) => setEditingMenu({ ...editingMenu, moduleCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {modules
                      .filter((m) => m.code !== 'ALL')
                      .map((m) => (
                        <option key={m.code} value={m.code}>
                          {m.label}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Hiển Thị (Title) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingMenu.name || ''}
                  onChange={(e) => setEditingMenu({ ...editingMenu, name: e.target.value })}
                  placeholder="VD: Quản Lý Yêu Cầu Báo Giá (RFQs)"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Đường Dẫn Route (URL) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMenu.routePath || ''}
                    onChange={(e) => setEditingMenu({ ...editingMenu, routePath: e.target.value })}
                    placeholder="VD: /rfqs"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Biểu Tượng Lucide
                  </label>
                  <input
                    type="text"
                    value={editingMenu.iconName || ''}
                    onChange={(e) => setEditingMenu({ ...editingMenu, iconName: e.target.value })}
                    placeholder="VD: FileText, Users, Truck"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Thứ Tự Sắp Xếp
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingMenu.sortOrder || 1}
                    onChange={(e) => setEditingMenu({ ...editingMenu, sortOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Trạng Thái
                  </label>
                  <select
                    value={editingMenu.isActive ? 'ACTIVE' : 'INACTIVE'}
                    onChange={(e) => setEditingMenu({ ...editingMenu, isActive: e.target.value === 'ACTIVE' })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ACTIVE">Kích Hoạt (ACTIVE)</option>
                    <option value="INACTIVE">Tạm Tắt (INACTIVE)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mã Quyền Yêu Cầu (Permission Code)
                </label>
                <input
                  type="text"
                  value={editingMenu.requiredPermission || ''}
                  onChange={(e) => setEditingMenu({ ...editingMenu, requiredPermission: e.target.value })}
                  placeholder="VD: SOURCING_RFQ_VIEW"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-purple-600 dark:text-purple-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-xs"
                >
                  Lưu Thông Tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tenant Permissions Modal: Phân quyền Menu theo Doanh nghiệp */}
      {isTenantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                    Phân Quyền Danh Mục Menu Cho Doanh Nghiệp
                  </h3>
                  <p className="text-xs text-slate-500">
                    Bật/tắt các route tính năng hiển thị trên Sidebar của từng khách thuê SaaS
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTenantModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Chọn Doanh Nghiệp / Tenant Áp Dụng:
                </label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => {
                    setSelectedTenantId(e.target.value);
                    loadTenantPermissions(e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id} - {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {tenantPermissions.map((perm) => (
                  <label
                    key={perm.menuId}
                    className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={perm.isEnabled}
                        onChange={() => handleTogglePermission(perm.menuId)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                      />
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                          {perm.menuName}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400">
                          {perm.menuCode} • <span className="text-emerald-600">{perm.routePath}</span>
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {perm.moduleCode}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setIsTenantModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={savingTenant}
                onClick={handleSaveTenantPermissions}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-xs disabled:opacity-60"
              >
                {savingTenant ? 'Đang Lưu...' : 'Lưu Quyền Cho Tenant'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-base text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Xác Nhận Xóa Menu
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Bạn có chắc chắn muốn xóa menu{' '}
              <strong className="text-slate-900 dark:text-white">{deletingMenu.name}</strong> (Mã:{' '}
              <code className="text-red-500 font-bold">{deletingMenu.code}</code>) khỏi hệ thống?
            </p>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setDeletingMenu(null)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteMenu}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-xs"
              >
                Đồng Ý Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

