'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserSession } from '../types';

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (customUser?: Partial<UserSession>) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const DEFAULT_USER: UserSession = {
  id: 'usr-admin-01',
  username: 'admin.mibid',
  fullName: 'Nguyễn Văn Hùng',
  email: 'hung.nv@mibid.vn',
  role: UserRole.BID_MANAGER,
  tenantId: '11111111-1111-1111-1111-111111111111',
  tenantName: 'Tổng Công Ty Thiết Bị Điện Đông Anh (EEMC)',
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  switchRole: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check local storage for existing session
    try {
      const saved = localStorage.getItem('mibid_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.username) {
          setUser(parsed);
          setIsAuthenticated(true);
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

  const login = (customUser?: Partial<UserSession>) => {
    const session = { ...DEFAULT_USER, ...(customUser || {}) };
    setUser(session);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('mibid_session', JSON.stringify(session));
    } catch (e) {
      // Ignore storage quota errors
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('mibid_session');
    } catch (e) {
      // Ignore
    }
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
        isAuthenticated,
        isLoading,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
