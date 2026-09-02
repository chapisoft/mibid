/**
 * Dịch vụ Quản Trị Vai Trò & Ma Trận Phân Quyền (Roles & Permissions)
 * Kết nối 100% với Spring Boot Backend REST API (/api/v1/management/roles/*)
 */

import { apiClient } from './apiClient';

export interface IRoleDto {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  isSystem: boolean;
  userCount?: number;
  permissions: string[];
}

class RoleService {
  async getAllRoles(tenantId?: string): Promise<IRoleDto[]> {
    try {
      const query = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : '';
      const res = await apiClient.get<IRoleDto[]>(`/management/roles${query}`);
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  }

  async getRolePermissions(roleId: string): Promise<string[]> {
    try {
      const res = await apiClient.get<string[]>(`/management/roles/${encodeURIComponent(roleId)}/permissions`);
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  }

  async updateRolePermissions(roleId: string, permissions: string[]): Promise<string[]> {
    return await apiClient.put<string[]>(`/management/roles/${encodeURIComponent(roleId)}/permissions`, {
      permissions,
    });
  }

  async createRole(data: Partial<IRoleDto>): Promise<IRoleDto> {
    return await apiClient.post<IRoleDto>('/management/roles', data);
  }

  async deleteRole(roleId: string): Promise<void> {
    await apiClient.delete(`/management/roles/${encodeURIComponent(roleId)}`);
  }
}

export const roleService = new RoleService();
