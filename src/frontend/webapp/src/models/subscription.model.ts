/**
 * Định nghĩa Enum và Interface cho phân hệ Subscription & Billing.
 * TUÂN THỦ NGUYÊN TẮC ZERO-HARDCODE: Dùng Enum thay thế string literal.
 */

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRING_SOON = 'EXPIRING_SOON',
  GRACE_PERIOD = 'GRACE_PERIOD',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
}

export enum InvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export interface ISubscriptionPlan {
  id: string;
  code: string;
  name: string;
  description?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxUsers: number;
  maxMachines: number;
  maxStorageGb: number;
  allowedModules: string[] | string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ITenantSubscription {
  id: string;
  tenantId: string;
  tenantCode?: string;
  tenantName?: string;
  planId: string;
  planCode?: string;
  planName?: string;
  billingCycle: BillingCycle;
  startDate: string;
  endDate: string;
  gracePeriodDays: number;
  status: SubscriptionStatus;
  autoRenew: boolean;
  currentUserCount: number;
  maxUsers: number;
  currentMachineCount: number;
  maxMachines: number;
  daysRemaining: number;
  lastNotificationSentAt?: string;
}

export interface ISubscriptionInvoice {
  id: string;
  tenantId: string;
  tenantCode?: string;
  subscriptionId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  paymentMethod: string;
  paymentDate?: string;
  dueDate: string;
  transactionReference?: string;
  notes?: string;
  createdAt?: string;
}

export interface ISubscriptionNotification {
  id: string;
  tenantId: string;
  tenantCode?: string;
  subscriptionId: string;
  notificationType: string;
  recipientEmail: string;
  title: string;
  message: string;
  daysRemaining: number;
  sentAt: string;
  status: string;
}

export interface IRenewSubscriptionCommand {
  planId?: string;
  billingCycle?: BillingCycle;
  paymentMethod?: string;
  transactionReference?: string;
  notes?: string;
}
