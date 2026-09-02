'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation, LanguageSwitcher } from '../../../shared/i18n';
import { ThemeSwitcher } from '../../../shared/theme/ThemeContext';
import { useAuth } from '../../../shared/auth/AuthContext';
import { MibidLogo } from '../../../shared/ui/MibidLogo';
import { CmsScreen, UserRole } from '../../../shared/types';
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

export function Header({ currentScreen, onSelectScreen }: HeaderProps) {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuTimerRef = useRef<NodeJS.Timeout | null>(null);
  const profileTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mở menu khi rê chuột vào
  const handleMenuEnter = (menuId: string) => {
    if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
    setOpenMenuId(menuId);
  };

  // Đóng menu khi rê chuột ra (với độ trễ tự nhiên 180ms)
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

  const menuGroups: MenuGroup[] = [
    {
      id: 'tenders',
      label: t.nav.menuTenders,
      icon: Briefcase,
      items: [
        {
          key: 'projects',
          label: t.nav.projects,
          icon: Briefcase,
        },
        {
          key: 'kanban',
          label: t.nav.kanban,
          icon: Kanban,
        },
        {
          key: 'workflow',
          label: t.nav.workflow,
          icon: Layers,
        },
        {
          key: 'workflows',
          label: t.nav.workflows,
          icon: GitFork,
        },
        {
          key: 'tasks',
          label: t.nav.tasks,
          icon: CheckSquare,
        },
      ],
    },
    {
      id: 'sourcing',
      label: t.nav.menuSourcing,
      icon: FileSpreadsheet,
      items: [
        {
          key: 'sourcing',
          label: t.nav.sourcing,
          icon: FileSpreadsheet,
        },
        {
          key: 'partners',
          label: t.nav.partners,
          icon: Building2,
        },
        {
          key: 'matrix',
          label: t.nav.matrix,
          icon: SplitSquareVertical,
        },
        {
          key: 'logistics',
          label: t.nav.logistics,
          icon: Truck,
        },
        {
          key: 'dms',
          label: t.nav.dms,
          icon: FolderLock,
        },
      ],
    },
    {
      id: 'system',
      label: t.nav.menuSystem || 'Hệ thống & Cấu hình',
      icon: Layers,
      items: [
        {
          key: 'analytics',
          label: t.nav.analytics,
          icon: BarChart3,
        },
        {
          key: 'tenants',
          label: t.nav.tenants || 'Quản trị Doanh nghiệp',
          icon: Building2,
        },
        {
          key: 'users',
          label: t.nav.users || 'Người dùng & Nhân sự',
          icon: Users,
        },
        {
          key: 'roles',
          label: 'Nhóm quyền & Phân quyền',
          icon: Shield,
        },
        {
          key: 'menus',
          label: 'Quản lý Menu & Route động',
          icon: FolderTree,
        },
        {
          key: 'subscriptions',
          label: 'Gói cước & Thuê bao SaaS',
          icon: CreditCard,
        },
        {
          key: 'integration',
          label: t.nav.integration || 'Tích hợp & Kết nối',
          icon: Network,
        },
      ],
    },
  ];


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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8 flex h-[68px] items-center justify-between gap-4">
        
        {/* Left: Brand Logo & Mobile Drawer Toggle */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
          {/* Khi ĐÃ đăng nhập: Hiển thị "Tổng quan" đầu tiên và các nhóm nghiệp vụ */}
          {isAuthenticated && (
            <>
              {/* Nút Tổng quan Pill */}
              <button
                type="button"
                onClick={() => handleSelect('dashboard')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[13.5px] font-medium transition-all duration-150 ${
                  isDashboardActive
                    ? 'bg-blue-50/90 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-semibold border border-blue-200/90 dark:border-blue-800/80 shadow-sm shadow-blue-500/10'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400 border border-transparent'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{t.nav.dashboard}</span>
              </button>

              {/* Các Nhóm Dropdown Hover Menus */}
              {menuGroups.map((group) => {
                const GroupIcon = group.icon;
                const isOpen = openMenuId === group.id;
                const isGroupActive = group.items.some((it) => it.key === currentScreen);

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
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[13.5px] font-medium transition-all duration-150 ${
                        isGroupActive
                          ? 'bg-blue-50/90 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-semibold border border-blue-200/90 dark:border-blue-800/80 shadow-sm shadow-blue-500/10'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400 border border-transparent'
                      }`}
                    >
                      <GroupIcon className="w-4 h-4" />
                      <span>{group.label}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-blue-600' : ''
                        }`}
                      />
                    </button>

                    {/* Dropdown Card với font size cân đối */}
                    {isOpen && (
                      <div className="absolute top-[calc(100%+6px)] left-0 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-0.5">
                        {group.items.map((item) => {
                          const ItemIcon = item.icon;
                          const isItemActive = currentScreen === item.key;

                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => handleSelect(item.key)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-[13.5px] text-left transition-colors ${
                                isItemActive
                                  ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-bold'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white font-medium'
                              }`}
                            >
                              <ItemIcon
                                className={`w-4 h-4 ${
                                  isItemActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                                }`}
                              />
                              <span>{item.label}</span>
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
          {/* Theme Switcher */}
          <div className="flex items-center">
            <ThemeSwitcher />
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* User Section */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <button
                type="button"
                className="relative w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Thông báo"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
              </button>

              {/* Profile Menu with Hover interaction */}
              <div
                className="relative"
                onMouseEnter={handleProfileEnter}
                onMouseLeave={handleProfileLeave}
              >
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 h-9 pl-1 pr-2.5 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {user?.fullName ? user.fullName.split(' ').pop()?.charAt(0) : 'NVH'}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                      {user?.fullName || 'Nguyễn Văn Hùng'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono leading-none">{user?.role || 'BID_MANAGER'}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-[calc(100%+6px)] w-60 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                    <div className="p-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.fullName}</p>
                      <p className="text-[11px] text-slate-400">{user?.email}</p>
                      <p className="text-[10px] font-mono text-blue-600 dark:text-blue-400 mt-1 font-semibold">
                        {user?.tenantName}
                      </p>
                    </div>

                    <div className="p-1 space-y-0.5 border-b border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleSelect('home');
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                          currentScreen === 'home'
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Home className="w-3.5 h-3.5" />
                        <span>Trang chủ giới thiệu</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleSelect('dashboard');
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                          currentScreen === 'dashboard'
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>Bàn làm việc Tổng quan</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.nav.logout}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleSelect('login')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>{t.nav.login}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-3">
          {/* Nút Trang chủ luôn hiển thị trên Mobile */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              handleSelect('home');
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold ${
              currentScreen === 'home'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600'
                : 'text-slate-700 dark:text-slate-200'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Trang chủ</span>
          </button>

          {/* Khi đã đăng nhập */}
          {isAuthenticated && (
            <>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSelect('dashboard');
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold ${
                  isDashboardActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600'
                    : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{t.nav.dashboard}</span>
              </button>

              {menuGroups.map((group) => (
                <div key={group.id} className="space-y-1 pt-2">
                  <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {group.label}
                  </div>
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isItemActive = currentScreen === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleSelect(item.key)}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium ${
                          isItemActive
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-bold'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <ItemIcon className="w-4 h-4" />
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
