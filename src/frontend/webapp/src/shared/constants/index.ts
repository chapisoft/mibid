/**
 * Toàn bộ hằng số toàn cục cho hệ thống MIBID Web CMS
 * TUÂN THỦ NGUYÊN TẮC ZERO-HARDCODE
 */

import { Currency, Department, Incoterm, TaskPriority, TenderStage, UserRole } from '../types';

export const APP_CONFIG = {
  APP_NAME: 'MIBID',
  APP_FULL_NAME: 'Nền Tảng Không Gian Cộng Tác Số Quản Lý Gói Thầu & Hồ Sơ Thầu Xuất Nhập Khẩu',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  DEFAULT_TIMEOUT_MS: 15000,
  MAGIC_LINK_TTL_HOURS: 72,
  EXPIRING_SOON_THRESHOLD_DAYS: 30,
  URGENT_DEADLINE_THRESHOLD_DAYS: 7,
} as const;

export const STORAGE_KEYS = {
  AUTH_SESSION: 'mibid_session',
  THEME_MODE: 'mibid-theme',
  I18N_LOCALE: 'mibid-lang',
} as const;

export const DEFAULT_EXCHANGE_RATES: Record<Currency, number> = {
  [Currency.VND]: 1,
  [Currency.USD]: 25450,
  [Currency.EUR]: 27800,
  [Currency.JPY]: 165.5,
  [Currency.CNY]: 3520,
  [Currency.GBP]: 33150,
  [Currency.KRW]: 19.1,
  [Currency.SGD]: 19380,
};

export const TENDER_STAGE_ORDER: TenderStage[] = [
  TenderStage.STAGE_PREPARATION,
  TenderStage.STAGE_SOURCING,
  TenderStage.STAGE_DOSSIER_PREP,
  TenderStage.STAGE_INTERNAL_REVIEW,
  TenderStage.STAGE_SUBMISSION,
  TenderStage.STAGE_AWARD_LOGISTICS,
];

export const INCOTERMS_LIST: Incoterm[] = [
  Incoterm.EXW,
  Incoterm.FOB,
  Incoterm.CIF,
  Incoterm.CIP,
  Incoterm.DDP,
];

export const VENDOR_INCOTERM_LIST: Incoterm[] = INCOTERMS_LIST;

export const CURRENCY_LIST: Currency[] = [
  Currency.VND,
  Currency.USD,
  Currency.EUR,
  Currency.JPY,
  Currency.CNY,
  Currency.GBP,
  Currency.KRW,
  Currency.SGD,
];

export const VENDOR_CURRENCY_LIST: Currency[] = [
  Currency.USD,
  Currency.EUR,
  Currency.JPY,
  Currency.CNY,
  Currency.VND,
];

export const DEPARTMENT_LIST: Department[] = [
  Department.TECHNICAL,
  Department.COMMERCIAL,
  Department.FINANCE,
  Department.LEGAL,
];

export const ROLE_LIST: UserRole[] = [
  UserRole.TENANT_ADMIN,
  UserRole.BID_MANAGER,
  UserRole.SOURCING_SPECIALIST,
  UserRole.TECHNICAL_LEAD,
  UserRole.FINANCE_LEAD,
  UserRole.LEGAL_OFFICER,
  UserRole.LOGISTICS_COORDINATOR,
  UserRole.VIEWER,
];

export const DEFAULT_PAGINATION = {
  PAGE_INDEX: 1,
  PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

export * from './tenderRequirements';
