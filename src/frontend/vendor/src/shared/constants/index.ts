import { Currency, Incoterm } from '../types';

export const VENDOR_CURRENCY_LIST: Currency[] = [
  Currency.USD,
  Currency.EUR,
  Currency.JPY,
  Currency.CNY,
  Currency.VND,
];

export const VENDOR_INCOTERM_LIST: Incoterm[] = [
  Incoterm.EXW,
  Incoterm.FOB,
  Incoterm.CIF,
  Incoterm.CIP,
  Incoterm.DDP,
];
