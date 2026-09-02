/**
 * API Client chuẩn RESTful kết nối Spring Boot Backend MIBID
 * Hỗ trợ JWT Header, Tenant-ID Isolation và Error Handling
 */

import { APP_CONFIG, STORAGE_KEYS } from '../shared/constants';

class ApiClient {
  private get baseUrl(): string {
    // 1. Phân giải trên trình duyệt (Browser Client-Side)
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // Khi đang chạy trên domain máy chủ (microtec.vn hoặc production domain)
      if (hostname.includes('microtec.vn')) {
        const proto = window.location.protocol === 'https:' ? 'https:' : 'http:';
        return `${proto}//api-bid.microtec.vn/api/v1`;
      }
      // Khi đang chạy cục bộ (localhost hoặc IP cục bộ)
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
      }
    }

    // 2. Phân giải trên Server / SSR runtime
    if (typeof process !== 'undefined') {
      if (process.env?.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes('localhost')) {
        return process.env.NEXT_PUBLIC_API_URL;
      }
      if (process.env?.BACKEND_API_URL) {
        return `${process.env.BACKEND_API_URL}/api/v1`;
      }
      if (process.env?.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
      }
    }

    return APP_CONFIG?.API_BASE_URL || 'https://api-bid.microtec.vn/api/v1';
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (typeof window !== 'undefined') {
      const savedSession = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          if (session.tenantId) {
            headers['X-Tenant-ID'] = session.tenantId;
          }
          if (session.token) {
            headers['Authorization'] = `Bearer ${session.token}`;
          }
        } catch (e) {
          // Ignore invalid session JSON
        }
      }
    }

    return headers;
  }

  private unwrap<T>(json: any): T {
    if (json && typeof json === 'object' && 'data' in json && 'code' in json) {
      return json.data as T;
    }
    return json as T;
  }

  async get<T>(path: string): Promise<T> {
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status}`);
      }
      const json = await res.json();
      return this.unwrap<T>(json);
    } catch (err) {
      throw err;
    }
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }
    const json = await res.json();
    return this.unwrap<T>(json);
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }
    const json = await res.json();
    return this.unwrap<T>(json);
  }

  async patch<T>(path: string, body: unknown = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }
    const json = await res.json();
    return this.unwrap<T>(json);
  }

  async delete<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }
    const json = await res.json();
    return this.unwrap<T>(json);
  }
}

export const apiClient = new ApiClient();
