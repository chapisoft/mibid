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

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'EXPIRING_SOON'
  | 'GRACE_PERIOD'
  | 'SUSPENDED'
  | 'CANCELLED';

export interface ITenantSubscription {
  id: string;
  tenantId: string;
  tenantName?: string;
  planId: string;
  planCode?: string;
  planName?: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
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
  subscriptionId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
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
  billingCycle?: string;
  paymentMethod?: string;
  transactionReference?: string;
  notes?: string;
}
