'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { MainLayout } from '../../layouts/MainLayout';
import { CmsScreen } from '../../shared/types';
import { HomePage } from '../../features/home/HomePage';
import { LoginPage } from '../../features/auth/LoginPage';
import { DashboardPage } from '../../features/dashboard/DashboardPage';
import { ProjectManagementPage } from '../../features/projects/ProjectManagementPage';
import { KanbanBoard } from '../../features/kanban/KanbanBoard';
import { RfqManagementPage } from '../../features/sourcing/RfqManagementPage';
import { PartnerManagementPage } from '../../features/sourcing/PartnerManagementPage';
import { ComparisonMatrixPage } from '../../features/sourcing/ComparisonMatrixPage';
import { TaskDispatchBoardPage } from '../../features/tasks/TaskDispatchBoardPage';
import { ShipmentTrackingPage } from '../../features/logistics/ShipmentTrackingPage';
import { DocumentLibraryPage } from '../../features/dms/DocumentLibraryPage';
import { BiAnalyticsPage } from '../../features/analytics/BiAnalyticsPage';
import { TenantManagementPage } from '../../features/admin/TenantManagementPage';
import { UserManagementPage } from '../../features/admin/UserManagementPage';
import { MenuManagementPage } from '../../features/admin/MenuManagementPage';
import { SubscriptionManagementPage } from '../../features/admin/SubscriptionManagementPage';
import { RoleManagementPage } from '../../features/admin/RoleManagementPage';
import { IntegrationManagementPage } from '../../features/integration/IntegrationManagementPage';
import { WorkflowFeature } from '../../features/workflow/WorkflowFeature';
import { useAuth } from '../../shared/auth/AuthContext';

const VALID_SCREENS: CmsScreen[] = [
  'home',
  'login',
  'dashboard',
  'projects',
  'kanban',
  'workflow',
  'sourcing',
  'partners',
  'matrix',
  'tasks',
  'logistics',
  'dms',
  'analytics',
  'tenants',
  'users',
  'roles',
  'menus',
  'subscriptions',
  'integration',
];

function CmsContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Trích xuất màn hình từ URL pathname (ưu tiên) hoặc query param ?screen=
  const getScreenFromUrl = useCallback((): CmsScreen => {
    if (typeof window !== 'undefined') {
      const cleanPath = (pathname || window.location.pathname).replace(/^\/+|\/+$/g, '');
      const firstSegment = cleanPath.split('/')[0] as CmsScreen;
      if (firstSegment && VALID_SCREENS.includes(firstSegment)) {
        return firstSegment;
      }
      const screenParam = searchParams?.get('screen') as CmsScreen;
      if (screenParam && VALID_SCREENS.includes(screenParam)) {
        return screenParam;
      }
    }
    // Mặc định phân biệt rõ ràng: Đã login -> 'dashboard', Chưa login -> 'home'
    return isAuthenticated ? 'dashboard' : 'home';
  }, [pathname, searchParams, isAuthenticated]);

  // Khởi tạo currentScreen ban đầu chuẩn xác theo trạng thái
  const [currentScreen, setCurrentScreen] = useState<CmsScreen>('home');

  // Điều hướng màn hình và cập nhật URL sạch sẽ (/workflow, /projects, ...)
  const navigateToScreen = useCallback(
    (screen: CmsScreen, replace: boolean = false) => {
      setCurrentScreen(screen);
      const targetPath = screen === 'home' ? '/' : `/${screen}`;

      if (replace) {
        router.replace(targetPath);
      } else {
        router.push(targetPath);
      }
    },
    [router]
  );

  // Đồng bộ màn hình khi URL thay đổi hoặc trạng thái đăng nhập thay đổi
  useEffect(() => {
    if (isLoading) return;

    const screenFromUrl = getScreenFromUrl();

    if (isAuthenticated) {
      // 1. ĐÃ ĐĂNG NHẬP:
      if (screenFromUrl === 'home' || screenFromUrl === 'login') {
        // Vào / hoặc /login -> Tự động chuyển tiếp vào /dashboard
        navigateToScreen('dashboard', true);
      } else {
        setCurrentScreen(screenFromUrl);
      }
    } else {
      // 2. CHƯA ĐĂNG NHẬP:
      if (screenFromUrl === 'login') {
        setCurrentScreen('login');
      } else if (screenFromUrl === 'home') {
        setCurrentScreen('home');
      } else {
        // Cố truy cập màn hình nghiệp vụ nội bộ khi chưa đăng nhập -> Chuyển về /login kèm redirect
        const url = new URL(window.location.href);
        url.pathname = '/login';
        url.searchParams.set('redirect', screenFromUrl);
        router.replace(url.pathname + url.search);
        setCurrentScreen('login');
      }
    }
  }, [pathname, searchParams, isAuthenticated, isLoading, getScreenFromUrl, navigateToScreen, router]);

  // Khi đang nạp session từ localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 text-sm font-semibold">
        Đang khởi tạo hệ thống MIBID...
      </div>
    );
  }

  // Phân nhánh render các màn hình với Auth Guard nghiêm ngặt
  const renderScreen = () => {
    // CHƯA ĐĂNG NHẬP: Chỉ cho phép hiển thị LoginPage hoặc HomePage
    if (!isAuthenticated) {
      if (currentScreen === 'login') {
        return <LoginPage onNavigate={navigateToScreen} />;
      }
      return <HomePage onNavigate={navigateToScreen} />;
    }

    // ĐÃ ĐĂNG NHẬP: Hiển thị các màn hình chức năng nội bộ
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardPage onNavigate={navigateToScreen} />;
      case 'projects':
        return <ProjectManagementPage />;
      case 'kanban':
        return <KanbanBoard />;
      case 'workflow':
        return <WorkflowFeature />;
      case 'sourcing':
        return <RfqManagementPage />;
      case 'partners':
        return <PartnerManagementPage />;
      case 'matrix':
        return <ComparisonMatrixPage />;
      case 'tasks':
        return <TaskDispatchBoardPage />;
      case 'logistics':
        return <ShipmentTrackingPage />;
      case 'dms':
        return <DocumentLibraryPage />;
      case 'analytics':
        return <BiAnalyticsPage />;
      case 'tenants':
        return <TenantManagementPage />;
      case 'users':
        return <UserManagementPage />;
      case 'roles':
        return <RoleManagementPage />;
      case 'menus':
        return <MenuManagementPage />;
      case 'subscriptions':
        return <SubscriptionManagementPage />;
      case 'integration':
        return <IntegrationManagementPage />;
      default:
        return <DashboardPage onNavigate={navigateToScreen} />;
    }
  };

  return (
    <MainLayout currentScreen={currentScreen} onSelectScreen={navigateToScreen}>
      {renderScreen()}
    </MainLayout>
  );
}

export default function CmsRootPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 text-sm font-semibold">
          Đang tải dữ liệu...
        </div>
      }
    >
      <CmsContent />
    </Suspense>
  );
}
