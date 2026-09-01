/**
 * Định nghĩa Enums & Types chuẩn cho Vendor Portal MIBID
 */

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  JPY = 'JPY',
  CNY = 'CNY',
  VND = 'VND',
}

export enum Incoterm {
  EXW = 'EXW',
  FOB = 'FOB',
  CIF = 'CIF',
  CIP = 'CIP',
  DDP = 'DDP',
}

export enum PaymentTerm {
  LC_AT_SIGHT = 'LC_AT_SIGHT',
  TT_30_70 = 'TT_30_70',
  TT_100_ADVANCE = 'TT_100_ADVANCE',
  TT_NET_30 = 'TT_NET_30',
  DP = 'DP',
}

export interface RfqLineItem {
  id: string;
  itemCode: string;
  itemName: string;
  specs: string;
  unit: string;
  quantity: number;
  origin?: string;
}

export interface UploadedDoc {
  id: string;
  name: string;
  size: string;
  type: 'CO_CQ' | 'DATASHEET' | 'AUTH_LETTER' | 'CATALOG';
  uploadedAt: string;
}
