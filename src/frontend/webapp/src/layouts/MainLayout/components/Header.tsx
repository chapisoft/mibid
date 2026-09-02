'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation, LanguageSwitcher } from '../../../shared/i18n';
import { ThemeSwitcher } from '../../../shared/theme/ThemeContext';
import { useAuth } from '../../../shared/auth/AuthContext';
import { MibidLogo } from '../../../shared/ui/MibidLogo';
import { CmsScreen, UserRole } from '../../../shared/types';
import { menuService, IAppMenu } from '../../../services/menuService';
import {
  LayoutDashboard,
  Briefcase,
  Kanban,
  FileSpreadsheet,
  SplitSquareVertical,
  CheckSquare,
  Truck,
  FolderLock,
  BarChart3,
  Building2,
  Users,
  ChevronDown,
  Bell,
  LogOut,
  LogIn,
  Menu,
  X,
  Layers,
  Network,
  GitFork,
  Shield,
  FolderTree,
  CreditCard,
  Home,
  Check,
} from 'lucide-react';

interface HeaderProps {
  currentScreen: CmsScreen;
  onSelectScreen: (screen: CmsScreen) => void;
}

interface MenuItem {
  key: CmsScreen;
  label: string;
  icon: React.ElementType;
}

interface MenuGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  items: MenuItem[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Briefcase,
  Kanban,
  Layers,
  GitFork,
  FileSpreadsheet,
  SplitSquareVertical,
  CheckSquare,
  Truck,
  FolderLock,
  BarChart3,
  Building2,
  Users,
  Shield,
  FolderTree,
  CreditCard,
  Network,
  Home,
};

export function Header({ currentScreen, onSelectScreen }: HeaderProps) {
  const { t } = useTranslation();
  const { user, currentTenant, authorizedTenants, switchTenant, isAuthenticated, logout } = useAuth();

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic Menus loaded from API
  const [dbMenus, setDbMenus] = useState<IAppMenu[]>([]);

  const menuTimerRef = useRef<NodeJS.Timeout | null>(null);
  const profileTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;
    menuService
      .getAllMenus()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setDbMenus(data);
        }
      })
      .catch(() => {
        // Fallback silently if offline
      });

    return () => {
      isMounted = false;
    };
  }, [currentTenant?.id]);

  const handleMenuEnter = (menuId: string) => {
    if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
    setOpenMenuId(menuId);
  };

  const handleMenuLeave = () => {
    menuTimerRef.current = setTimeout(() => {
      setOpenMenuId(null);
    }, 180);
  };

  const handleProfileEnter = () => {
    if (profileTimerRef.current) clearTimeout(profileTimerRef.current);
    setIsProfileOpen(true);
  };

  const handleProfileLeave = () => {
    profileTimerRef.current = setTimeout(() => {
      setIsProfileOpen(false);
    }, 180);
  };

  // Helper map từ code sang i18n label hoặc title từ DB
  const getMenuLabel = (code: string, defaultTitle: string): string => {
    const navKey = (t.nav as Record<string, string>)[code];
    return navKey || defaultTitle;
  };

  // Xây dựng danh sách nhóm Menu động dựa trên API CSDL
  const menuGroups: MenuGroup[] = useMemo(() => {
    if (dbMenus.length > 0) {
      const activeMenus = dbMenus.filter((m) => m.isActive !== false);

      // 1. Nhóm Đấu thầu (BIDDING)
      const tenderMenus = activeMenus
        .filter((m) => m.moduleCode === 'BIDDING')
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((m) => ({
          key: m.code as CmsScreen,
          label: getMenuLabel(m.code, m.title || m.name),
          icon: ICON_MAP[m.iconName || m.icon || ''] || Briefcase,
        }));

      // 2. Nhóm Sourcing & Cung ứng (SOURCING, LOGISTICS, DMS)
      const sourcingMenus = activeMenus
        .filter((m) => ['SOURCING', 'LOGISTICS', 'DMS'].includes(m.moduleCode))
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((m) => ({
          key: m.code as CmsScreen,
          label: getMenuLabel(m.code, m.title || m.name),
          icon: ICON_MAP[m.iconName || m.icon || ''] || FileSpreadsheet,
        }));

      // 3. Nhóm Hệ thống & Quản trị (SYSTEM_ADMIN, SAAS_BILLING, ANALYTICS)
      const systemMenus = activeMenus
        .filter((m) => ['SYSTEM_ADMIN', 'SAAS_BILLING', 'ANALYTICS'].includes(m.moduleCode))
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((m) => ({
          key: m.code as CmsScreen,
          label: getMenuLabel(m.code, m.title || m.name),
          icon: ICON_MAP[m.iconName || m.icon || ''] || Shield,
        }));

      return [
        {
          id: 'tenders',
          label: t.nav.menuTenders,
          icon: Briefcase,
          items: tenderMenus,
        },
        {
          id: 'sourcing',
          label: t.nav.menuSourcing,
          icon: FileSpreadsheet,
          items: sourcingMenus,
        },
        {
          id: 'system',
          label: t.nav.menuSystem,
          icon: Layers,
          items: systemMenus,
        },
      ];
    }

    // Fallback nếu chưa tải được API menu
    return [
      {
        id: 'tenders',
        label: t.nav.menuTenders,
        icon: Briefcase,
        items: [
          { key: 'projects', label: t.nav.projects, icon: Briefcase },
          { key: 'kanban', label: t.nav.kanban, icon: Kanban },
          { key: 'workflow', label: t.nav.workflow, icon: Layers },
          { key: 'workflows', label: t.nav.workflows, icon: GitFork },
          { key: 'tasks', label: t.nav.tasks, icon: CheckSquare },
        ],
      },
      {
        id: 'sourcing',
        label: t.nav.menuSourcing,
        icon: FileSpreadsheet,
        items: [
          { key: 'sourcing', label: t.nav.sourcing, icon: FileSpreadsheet },
          { key: 'partners', label: t.nav.partners, icon: Building2 },
          { key: 'matrix', label: t.nav.matrix, icon: SplitSquareVertical },
          { key: 'logistics', label: t.nav.logistics, icon: Truck },
          { key: 'dms', label: t.nav.dms, icon: FolderLock },
        ],
      },
      {
        id: 'system',
        label: t.nav.menuSystem,
        icon: Layers,
        items: [
          { key: 'analytics', label: t.nav.analytics, icon: BarChart3 },
          { key: 'tenants', label: t.nav.tenants, icon: Building2 },
          { key: 'users', label: t.nav.users, icon: Users },
          { key: 'roles', label: (t.nav as any).roles || 'Nhóm quyền & Phân quyền', icon: Shield },
          { key: 'menus', label: (t.nav as any).menus || 'Quản lý Menu & Route động', icon: FolderTree },
          { key: 'subscriptions', label: (t.nav as any).subscriptions || 'Gói cước & Thuê bao SaaS', icon: CreditCard },
          { key: 'integration', label: t.nav.integration, icon: Network },
        ],
      },
    ];
  }, [dbMenus, t.nav]);

  const handleSelect = (screen: CmsScreen) => {
    onSelectScreen(screen);
    setOpenMenuId(null);
    setIsProfileOpen(false);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    onSelectScreen('home');
  };

  const isDashboardActive = currentScreen === 'dashboard';

  // Tên hiển thị làm sạch (bỏ các phần mô tả phụ trong ngoặc đơn)
  const cleanDisplayName = useMemo(() => {
    const raw = user?.fullName || user?.username || '';
    return raw.replace(/\s*\(.*?\)\s*/g, '').trim();
  }, [user]);

  // Lấy ký tự đại diện Avatar
  const userInitials = useMemo(() => {
    if (cleanDisplayName) {
      const parts = cleanDisplayName.split(' ');
      return parts[parts.length - 1].charAt(0).toUpperCase();
    }
    return 'U';
  }, [cleanDisplayName]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8 flex h-[68px] items-center justify-between gap-4">
        {/* Left: Brand Logo & Mobile Drawer Toggle */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Mở menu điều hướng"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            type="button"
            className="focus:outline-none flex items-center cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => handleSelect('home')}
            title="Trang chủ MIBID"
          >
            <MibidLogo size="md" />
          </button>
        </div>

        {/* Center: Nav Pills with Balanced Size & Elegant Active State (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {isAuthenticated && (
            <>
              {/* Nút Tổng quan Pill */}
              <button
                type="button"
                onClick={() => handleSelect('dashboard')}
                className={`flex items-center gap-2 h-9 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer ${isDashboardActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{t.nav.dashboard}</span>
              </button>

              {/* Các Nhóm Menu Dropdown */}
              {menuGroups.map((group) => {
                const GroupIcon = group.icon;
                const isGroupActive = group.items.some((item) => item.key === currentScreen);
                const isOpen = openMenuId === group.id;

                return (
                  <div
                    key={group.id}
                    className="relative"
                    onMouseEnter={() => handleMenuEnter(group.id)}
                    onMouseLeave={handleMenuLeave}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(isOpen ? null : group.id)}
                      className={`flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer ${isGroupActive
                        ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                    >
                      <GroupIcon
                        className={`w-4 h-4 ${isGroupActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                          }`}
                      />
                      <span>{group.label}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 text-slate-400 ${isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
                          }`}
                      />
                    </button>

                    {/* Dropdown Menu Panel */}
                    {isOpen && (
                      <div className="absolute left-0 top-[calc(100%+6px)] w-64 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-0.5 backdrop-blur-md">
                        {group.items.map((item) => {
                          const ItemIcon = item.icon;
                          const isItemActive = currentScreen === item.key;

                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => handleSelect(item.key)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-[13px] text-left transition-colors cursor-pointer ${isItemActive
                                ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-bold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white font-medium'
                                }`}
                            >
                              <ItemIcon
                                className={`w-4 h-4 shrink-0 ${isItemActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                                  }`}
                              />
                              <span className="truncate">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </nav>

        {/* Right: Controls & User Profile */}
        <div className="flex items-center gap-2 shrink-0">
          <ThemeSwitcher />
          <LanguageSwitcher />

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <button
                type="button"
                className="relative w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Thông báo"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
              </button>

              {/* Profile Menu with Integrated Tenant Switcher */}
              <div
                className="relative"
                onMouseEnter={handleProfileEnter}
                onMouseLeave={handleProfileLeave}
              >
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 h-9 pl-1 pr-2.5 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                    {userInitials}
                  </div>
                  <span className="hidden md:block text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[170px]">
                    {cleanDisplayName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Profile Dropdown with Tenant Switcher */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-[calc(100%+6px)] w-80 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2 backdrop-blur-md">
                    {/* User Info Header */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                          {userInitials}
                        </div>
                        <div className="min-w-0 flex-1 truncate">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
                            {cleanDisplayName}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email || ''}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-mono shrink-0">
                          {user?.role || 'USER'}
                        </span>
                      </div>
                    </div>

                    {/* Integrated Tenant Switcher Section */}
                    <div className="space-y-1.5 pt-0.5">
                      <div className="px-2 py-1 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          {(t.nav as any).authorizedTenantsTitle || 'Không Gian Doanh Nghiệp'}
                        </span>
                        {authorizedTenants && authorizedTenants.length > 1 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold">
                            {authorizedTenants.length} {(t.nav as any).enterpriseCount || 'Doanh nghiệp'}
                          </span>
                        )}
                      </div>

                      <div className="max-h-56 overflow-y-auto space-y-1">
                        {(authorizedTenants && authorizedTenants.length > 0
                          ? authorizedTenants
                          : [currentTenant || { id: user?.tenantId || 'DEFAULT', name: user?.tenantName || 'Doanh Nghiệp Hiện Tại', code: 'DEFAULT' }]
                        ).map((itemTenant) => {
                          const isSelected = (currentTenant?.id || user?.tenantId) === itemTenant.id;
                          return (
                            <button
                              key={itemTenant.id}
                              type="button"
                              onClick={async () => {
                                if (!isSelected) {
                                  await switchTenant(itemTenant.id);
                                  if (typeof window !== 'undefined') {
                                    window.location.reload();
                                  }
                                }
                              }}
                              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-50/90 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60 font-bold shadow-2xs'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <Building2
                                  className={`w-4 h-4 shrink-0 ${
                                    isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                                  }`}
                                />
                                <div className="truncate">
                                  <p className="text-xs font-semibold truncate leading-tight">{itemTenant.name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                    {(t.nav as any).tenantCodeLabel || 'Mã'}: {itemTenant.code || itemTenant.id.slice(0, 8)}
                                  </p>
                                </div>
                              </div>
                              {isSelected && (
                                <span className="shrink-0 flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-bold bg-blue-100/70 dark:bg-blue-900/40 px-2 py-0.5 rounded-md">
                                  <Check className="w-3 h-3" />
                                  <span>Đang chọn</span>
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Divider & Logout Button */}
                    <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t.nav.logout}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleSelect('login')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{t.nav.login}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-3 max-h-[80vh] overflow-y-auto">


          {isAuthenticated && (
            <>

              {menuGroups.map((group) => (
                <div key={group.id} className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {group.label}
                  </p>
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isItemActive = currentScreen === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleSelect(item.key);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl ${isItemActive
                          ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                      >
                        <ItemIcon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </header>
  );
}
