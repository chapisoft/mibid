/**
 * Dịch vụ Quản Trị Hệ Thống Danh Mục & Phân Quyền Menu
 * Kết nối 100% với Spring Boot Backend REST API (/api/v1/management/menus/*)
 */

import { apiClient } from './apiClient';

export interface IAppMenu {
  id: string;
  parentId?: string;
  code: string;
  name: string;
  title?: string;
  routePath: string;
  path?: string;
  iconName: string;
  icon?: string;
  moduleCode: string;
  sortOrder: number;
  isActive: boolean;
  isSystem: boolean;
  requiredPermission?: string;
  children?: IAppMenu[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ITenantMenuPermission {
  id: string;
  tenantId: string;
  menuId: string;
  menuCode: string;
  menuName: string;
  routePath: string;
  moduleCode: string;
  isEnabled: boolean;
}

export interface ICreateMenuCommand {
  parentId?: string;
  code: string;
  name: string;
  routePath: string;
  iconName: string;
  moduleCode: string;
  sortOrder: number;
  isActive: boolean;
  requiredPermission?: string;
}

export interface IUpdateMenuCommand {
  parentId?: string;
  name?: string;
  routePath?: string;
  iconName?: string;
  moduleCode?: string;
  sortOrder?: number;
  isActive?: boolean;
  requiredPermission?: string;
}

class MenuService {
  async getAllMenus(moduleCode?: string): Promise<IAppMenu[]> {
    try {
      const query = moduleCode && moduleCode !== 'ALL' ? `?moduleCode=${encodeURIComponent(moduleCode)}` : '';
      const res = await apiClient.get<any[]>(`/management/menus${query}`);
      if (!Array.isArray(res)) return [];
      return res.map((m) => ({
        id: m.id,
        parentId: m.parentId,
        code: m.code,
        name: m.name || m.title || m.code,
        title: m.title || m.name || m.code,
        routePath: m.routePath || m.path || '',
        path: m.path || m.routePath || '',
        iconName: m.iconName || m.icon || 'LayoutDashboard',
        icon: m.icon || m.iconName || 'LayoutDashboard',
        moduleCode: m.moduleCode || 'CORE',
        sortOrder: m.sortOrder ?? 0,
        isActive: m.isActive ?? true,
        isSystem: m.isSystem ?? false,
        requiredPermission: m.requiredPermission || '',
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      }));
    } catch {
      return [];
    }
  }

  async getMenuTree(): Promise<IAppMenu[]> {
    try {
      const res = await apiClient.get<any[]>('/management/menus/tree');
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  }

  async getTenantMenus(tenantId?: string): Promise<IAppMenu[]> {
    try {
      const query = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : '';
      const res = await apiClient.get<any[]>(`/management/menus/tenant${query}`);
      if (!Array.isArray(res)) return [];
      return res.map((m) => ({
        id: m.id,
        parentId: m.parentId,
        code: m.code,
        name: m.name || m.title || m.code,
        title: m.title || m.name || m.code,
        routePath: m.routePath || m.path || '',
        path: m.path || m.routePath || '',
        iconName: m.iconName || m.icon || 'LayoutDashboard',
        icon: m.icon || m.iconName || 'LayoutDashboard',
        moduleCode: m.moduleCode || 'CORE',
        sortOrder: m.sortOrder ?? 0,
        isActive: m.isActive ?? true,
        isSystem: m.isSystem ?? false,
        requiredPermission: m.requiredPermission || '',
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      }));
    } catch {
      return [];
    }
  }

  async getTenantPermissions(tenantId: string): Promise<ITenantMenuPermission[]> {
    try {
      const res = await apiClient.get<any[]>(`/management/menus/tenant/${encodeURIComponent(tenantId)}/permissions`);
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  }

  async assignTenantMenus(tenantId: string, menuIds: string[]): Promise<void> {
    await apiClient.post('/management/menus/assign-tenant', { tenantId, menuIds });
  }

  async createMenu(data: ICreateMenuCommand): Promise<IAppMenu> {
    return await apiClient.post<IAppMenu>('/management/menus', data);
  }

  async updateMenu(menuId: string, data: IUpdateMenuCommand): Promise<IAppMenu> {
    return await apiClient.put<IAppMenu>(`/management/menus/${encodeURIComponent(menuId)}`, data);
  }

  async deleteMenu(menuId: string): Promise<void> {
    await apiClient.delete(`/management/menus/${encodeURIComponent(menuId)}`);
  }
}

export const menuService = new MenuService();
