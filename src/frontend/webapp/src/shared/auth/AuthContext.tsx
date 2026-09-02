'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserSession, TenantInfo } from '../types';
import { apiClient } from '../../services/apiClient';

interface LoginCredentials {
  username: string;
  password?: string;
  role?: UserRole;
}

interface AuthContextType {
  user: UserSession | null;
  currentTenant: TenantInfo | null;
  authorizedTenants: TenantInfo[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  switchTenant: (tenantId: string) => Promise<boolean>;
}

const DEFAULT_USER: UserSession = {
  id: '11111111-1111-1111-1111-111111111101',
  username: 'admin.eemc',
  fullName: 'Nguyễn Văn Hùng (EEMC Admin)',
  email: 'admin@eemc.mibid.vn',
  role: UserRole.ADMIN,
  tenantId: '11111111-1111-1111-1111-111111111111',
  tenantName: 'Tổng Công Ty Thiết Bị Điện Đông Anh (EEMC)',
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  currentTenant: null,
  authorizedTenants: [],
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: () => {},
  switchRole: () => {},
  switchTenant: async () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [currentTenant, setCurrentTenant] = useState<TenantInfo | null>(null);
  const [authorizedTenants, setAuthorizedTenants] = useState<TenantInfo[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mibid_session');
      if (saved) {
        const parsed: UserSession = JSON.parse(saved);
        if (parsed && (parsed.username || parsed.id)) {
          setUser(parsed);
          setIsAuthenticated(true);
          if (parsed.currentTenant) {
            setCurrentTenant(parsed.currentTenant);
          } else if (parsed.tenantId) {
            setCurrentTenant({
              id: parsed.tenantId,
              code: 'DEFAULT',
              name: parsed.tenantName || 'Doanh Nghiệp Hiện Tại',
            });
          }
          if (parsed.authorizedTenants && parsed.authorizedTenants.length > 0) {
            setAuthorizedTenants(parsed.authorizedTenants);
          }
        }
      }
    } catch (e) {
      localStorage.removeItem('mibid_session');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      const payload = {
        username: credentials.username.trim(),
        password: credentials.password || 'MibidSecure2026!',
      };

      const res = await apiClient.post<any>('/users/login', payload);

      if (res && res.accessToken) {
        const currTenant: TenantInfo = res.currentTenant || {
          id: res.tenantId || '11111111-1111-1111-1111-111111111111',
          code: 'EEMC',
          name: 'Tổng Công Ty Thiết Bị Điện Đông Anh (EEMC)',
        };

        const authTenants: TenantInfo[] = res.authorizedTenants && res.authorizedTenants.length > 0
          ? res.authorizedTenants
          : [currTenant];

        const session: UserSession = {
          id: res.userId,
          username: res.username,
          fullName: res.fullName || res.username,
          email: res.email || `${res.username}@mibid.vn`,
          role: (res.role as UserRole) || UserRole.ADMIN,
          tenantId: currTenant.id,
          tenantName: currTenant.name,
          currentTenant: currTenant,
          authorizedTenants: authTenants,
          token: res.accessToken,
        };

        setUser(session);
        setCurrentTenant(currTenant);
        setAuthorizedTenants(authTenants);
        setIsAuthenticated(true);

        try {
          localStorage.setItem('mibid_session', JSON.stringify(session));
          localStorage.setItem('mibid_last_tenant', currTenant.id);
        } catch (e) {
          // ignore
        }
        return { success: true };
      }
      return { success: false, error: 'Đăng nhập không thành công, vui lòng thử lại' };
    } catch (error: any) {
      // Fallback cho tài khoản demo nếu mạng backend lỗi
      const isKnownDemo = credentials.username === 'admin.eemc' || credentials.username === 'admin.mibid' || credentials.username === 'sourcing.eemc';
      if (isKnownDemo && (credentials.password === 'MibidSecure2026!' || credentials.password === '123456')) {
        const session: UserSession = {
          ...DEFAULT_USER,
          username: credentials.username,
          role: credentials.role || DEFAULT_USER.role,
        };
        setUser(session);
        setIsAuthenticated(true);
        try {
          localStorage.setItem('mibid_session', JSON.stringify(session));
        } catch (e) {}
        return { success: true };
      }

      return {
        success: false,
        error: error?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác',
      };
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentTenant(null);
    setAuthorizedTenants([]);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('mibid_session');
    } catch (e) {
      // Ignore
    }
  };

  const switchTenant = async (targetTenantId: string): Promise<boolean> => {
    try {
      const res = await apiClient.post<any>('/users/switch-tenant', { tenantId: targetTenantId });
      if (res && res.currentTenant) {
        const newTenant: TenantInfo = res.currentTenant;
        setCurrentTenant(newTenant);
        if (user) {
          const updatedSession: UserSession = {
            ...user,
            tenantId: newTenant.id,
            tenantName: newTenant.name,
            currentTenant: newTenant,
            token: res.accessToken || user.token,
          };
          setUser(updatedSession);
          localStorage.setItem('mibid_session', JSON.stringify(updatedSession));
          localStorage.setItem('mibid_last_tenant', newTenant.id);
        }
        return true;
      }
    } catch (err) {
      // Chuyển tenant cục bộ nếu backend offline
      const found = authorizedTenants.find((t) => t.id === targetTenantId);
      if (found && user) {
        const updatedSession: UserSession = {
          ...user,
          tenantId: found.id,
          tenantName: found.name,
          currentTenant: found,
        };
        setUser(updatedSession);
        setCurrentTenant(found);
        localStorage.setItem('mibid_session', JSON.stringify(updatedSession));
        localStorage.setItem('mibid_last_tenant', found.id);
        return true;
      }
    }
    return false;
  };

  const switchRole = (role: UserRole) => {
    setUser((prev) => {
      const updated = prev ? { ...prev, role } : { ...DEFAULT_USER, role };
      try {
        localStorage.setItem('mibid_session', JSON.stringify(updated));
      } catch (e) {
        // Ignore
      }
      setIsAuthenticated(true);
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentTenant,
        authorizedTenants,
        isAuthenticated,
        isLoading,
        login,
        logout,
        switchRole,
        switchTenant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
