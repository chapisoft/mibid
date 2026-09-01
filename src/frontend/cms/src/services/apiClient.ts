/**
 * API Client chuẩn RESTful kết nối Spring Boot Backend MIBID
 * Hỗ trợ JWT Header, Tenant-ID Isolation và Error Handling
 */

import { APP_CONFIG, STORAGE_KEYS } from '../shared/constants';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = APP_CONFIG.API_BASE_URL;
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
