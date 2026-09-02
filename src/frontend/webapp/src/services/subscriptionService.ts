/**
 * Dịch vụ Quản Trị Thuê Bao & Đăng Ký Gói Cước SaaS
 * Kết nối 100% với Spring Boot Backend REST API (/api/v1/management/subscriptions/*)
 */

import {
  ISubscriptionPlan,
  ITenantSubscription,
  ISubscriptionInvoice,
  ISubscriptionNotification,
  IRenewSubscriptionCommand,
  BillingCycle,
} from '../models/subscription.model';
import { apiClient } from './apiClient';

export { BillingCycle };
export type {
  ISubscriptionPlan,
  ITenantSubscription,
  ISubscriptionInvoice,
  ISubscriptionNotification,
  IRenewSubscriptionCommand,
};

class SubscriptionService {
  async getPublicPlans(): Promise<ISubscriptionPlan[]> {
    try {
      const res = await apiClient.get<any[]>('/public/plans');
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  }

  async getAllPlans(): Promise<ISubscriptionPlan[]> {
    try {
      const res = await apiClient.get<any[]>('/management/subscriptions/plans');
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  }

  async createPlan(data: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlan> {
    const newP = {
      code: (data.code || '').toUpperCase(),
      name: data.name || '',
      description: data.description || '',
      monthlyPrice: Number(data.monthlyPrice) || 0,
      yearlyPrice: Number(data.yearlyPrice) || 0,
      maxUsers: Number(data.maxUsers) || 0,
      maxMachines: Number(data.maxMachines) || 0,
      maxStorageGb: Number(data.maxStorageGb) || 0,
      allowedModules: Array.isArray(data.allowedModules) ? data.allowedModules : [],
      isActive: data.isActive ?? true,
    };
    return await apiClient.post<ISubscriptionPlan>('/management/subscriptions/plans', newP);
  }

  async updatePlan(planId: string, updates: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlan> {
    return await apiClient.put<ISubscriptionPlan>(`/management/subscriptions/plans/${encodeURIComponent(planId)}`, updates);
  }

  async deletePlan(planId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/management/subscriptions/plans/${encodeURIComponent(planId)}`);
      return true;
    } catch {
      return false;
    }
  }

  async getAllSubscriptions(): Promise<ITenantSubscription[]> {
    try {
      const res = await apiClient.get<any[]>('/management/subscriptions');
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  }

  async getTenantSubscription(tenantId: string): Promise<ITenantSubscription | undefined> {
    try {
      return await apiClient.get<ITenantSubscription>(`/management/subscriptions/tenant/${encodeURIComponent(tenantId)}`);
    } catch {
      return undefined;
    }
  }

  async updateSubscription(subId: string, updates: Partial<ITenantSubscription>): Promise<ITenantSubscription> {
    return await apiClient.put<ITenantSubscription>(`/management/subscriptions/${encodeURIComponent(subId)}`, updates);
  }

  async deleteSubscription(subId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/management/subscriptions/${encodeURIComponent(subId)}`);
      return true;
    } catch {
      return false;
    }
  }

  async renewSubscription(tenantId: string, data: IRenewSubscriptionCommand): Promise<ITenantSubscription> {
    return await apiClient.post<ITenantSubscription>(`/management/subscriptions/tenant/${encodeURIComponent(tenantId)}/renew`, data);
  }

  async getAllInvoices(tenantId?: string): Promise<ISubscriptionInvoice[]> {
    try {
      const query = tenantId && tenantId !== 'ALL' ? `?tenantId=${encodeURIComponent(tenantId)}` : '';
      const res = await apiClient.get<any[]>(`/management/subscriptions/invoices${query}`);
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  }

  async payInvoice(invoiceId: string, txnRef?: string, paymentMethod?: string): Promise<ISubscriptionInvoice> {
    return await apiClient.post<ISubscriptionInvoice>(`/management/subscriptions/invoices/${encodeURIComponent(invoiceId)}/pay`, {
      transactionReference: txnRef,
      paymentMethod,
    });
  }

  async getNotifications(tenantId?: string): Promise<ISubscriptionNotification[]> {
    try {
      const query = tenantId && tenantId !== 'ALL' ? `?tenantId=${encodeURIComponent(tenantId)}` : '';
      const res = await apiClient.get<any[]>(`/management/subscriptions/notifications${query}`);
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  }

  async sendNotification(data: Partial<ISubscriptionNotification>): Promise<ISubscriptionNotification> {
    return await apiClient.post<ISubscriptionNotification>('/management/subscriptions/notifications/send', data);
  }
}

export const subscriptionService = new SubscriptionService();
