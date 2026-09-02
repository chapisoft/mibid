import {
  Department,
  TenantAccount,
  TenantAccountStatus,
  UserAccount,
  UserAccountStatus,
  UserRole,
  SubscriptionPlan,
} from '../shared/types';
import { apiClient } from './apiClient';

class AdminService {
  async getTenants(): Promise<TenantAccount[]> {
    try {
      const response = await apiClient.get<any[]>('/tenants');
      if (Array.isArray(response)) {
        return response.map((item) => ({
          id: item.id ? item.id.toString() : '',
          tenantCode: item.code || item.tenantCode || '',
          tenantName: item.name || item.tenantName || '',
          taxCode: item.taxCode || '',
          subscriptionPlan: item.subscriptionPlan || '',
          userCount: Number(item.userCount || 0),
          activeProjects: Number(item.activeProjects || 0),
          status: (item.status as TenantAccountStatus) || TenantAccountStatus.ACTIVE,
        }));
      }
      return [];
    } catch {
      return [];
    }
  }

  async addTenant(newTenant: Partial<TenantAccount>): Promise<TenantAccount> {
    const payload = {
      code: newTenant.tenantCode,
      name: newTenant.tenantName,
      taxCode: newTenant.taxCode,
      subscriptionPlan: newTenant.subscriptionPlan || '',
      status: newTenant.status || TenantAccountStatus.ACTIVE,
    };
    const created = await apiClient.post<any>('/tenants', payload);
    return {
      id: created.id ? created.id.toString() : '',
      tenantCode: created.code || created.tenantCode || newTenant.tenantCode || '',
      tenantName: created.name || created.tenantName || newTenant.tenantName || '',
      taxCode: created.taxCode || newTenant.taxCode || '',
      subscriptionPlan: created.subscriptionPlan || newTenant.subscriptionPlan || '',
      userCount: Number(created.userCount || 0),
      activeProjects: Number(created.activeProjects || 0),
      status: (created.status as TenantAccountStatus) || newTenant.status || TenantAccountStatus.ACTIVE,
    };
  }

  async updateTenant(tenantId: string, updates: Partial<TenantAccount>): Promise<TenantAccount> {
    const payload = {
      code: updates.tenantCode,
      name: updates.tenantName,
      taxCode: updates.taxCode,
      subscriptionPlan: updates.subscriptionPlan,
      status: updates.status,
    };
    const updated = await apiClient.put<any>(`/tenants/${tenantId}`, payload);
    return {
      id: tenantId,
      tenantCode: updated.code || updated.tenantCode || updates.tenantCode || '',
      tenantName: updated.name || updated.tenantName || updates.tenantName || '',
      taxCode: updated.taxCode || updates.taxCode || '',
      subscriptionPlan: updated.subscriptionPlan || updates.subscriptionPlan || '',
      userCount: Number(updated.userCount ?? updates.userCount ?? 0),
      activeProjects: Number(updated.activeProjects ?? updates.activeProjects ?? 0),
      status: (updated.status as TenantAccountStatus) || updates.status || TenantAccountStatus.ACTIVE,
    };
  }

  async deleteTenant(tenantId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/tenants/${tenantId}`);
      return true;
    } catch {
      return false;
    }
  }

  async getUsers(tenantId?: string): Promise<UserAccount[]> {
    try {
      const url = tenantId && tenantId !== 'ALL' ? `/users?tenantId=${encodeURIComponent(tenantId)}` : '/users';
      const response = await apiClient.get<any[]>(url);
      if (Array.isArray(response)) {
        return response.map((item) => ({
          id: item.id ? item.id.toString() : '',
          username: item.username || '',
          fullName: item.fullName || item.name || '',
          email: item.email || '',
          phone: item.phone || '',
          role: (item.role as UserRole) || UserRole.VIEWER,
          department: (item.department as Department) || Department.COMMERCIAL,
          tenantId: item.tenantId || '',
          status: (item.status as UserAccountStatus) || UserAccountStatus.ACTIVE,
        }));
      }
      return [];
    } catch {
      return [];
    }
  }

  async addUser(newUser: Partial<UserAccount>): Promise<UserAccount> {
    const payload = {
      username: newUser.username,
      fullName: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      department: newUser.department,
      tenantId: newUser.tenantId,
      status: newUser.status || UserAccountStatus.ACTIVE,
    };
    const created = await apiClient.post<any>('/users', payload);
    return {
      id: created.id ? created.id.toString() : '',
      username: created.username || newUser.username || '',
      fullName: created.fullName || created.name || newUser.fullName || '',
      email: created.email || newUser.email || '',
      phone: created.phone || newUser.phone || '',
      role: (created.role as UserRole) || newUser.role || UserRole.VIEWER,
      department: (created.department as Department) || newUser.department || Department.COMMERCIAL,
      tenantId: created.tenantId || newUser.tenantId || '',
      status: (created.status as UserAccountStatus) || newUser.status || UserAccountStatus.ACTIVE,
    };
  }

  async updateUser(userId: string, updates: Partial<UserAccount>): Promise<UserAccount> {
    const payload = {
      username: updates.username,
      fullName: updates.fullName,
      email: updates.email,
      phone: updates.phone,
      role: updates.role,
      department: updates.department,
      status: updates.status,
    };
    const updated = await apiClient.put<any>(`/users/${userId}`, payload);
    return {
      id: userId,
      username: updated.username || updates.username || '',
      fullName: updated.fullName || updated.name || updates.fullName || '',
      email: updated.email || updates.email || '',
      phone: updated.phone || updates.phone || '',
      role: (updated.role as UserRole) || updates.role || UserRole.VIEWER,
      department: (updated.department as Department) || updates.department || Department.COMMERCIAL,
      tenantId: updated.tenantId || updates.tenantId || '',
      status: (updated.status as UserAccountStatus) || updates.status || UserAccountStatus.ACTIVE,
    };
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/users/${userId}`);
      return true;
    } catch {
      return false;
    }
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await apiClient.get<SubscriptionPlan[]>('/public/plans');
      return Array.isArray(response) ? response : [];
    } catch {
      return [];
    }
  }
}

export const adminService = new AdminService();
