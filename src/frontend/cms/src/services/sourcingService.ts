import {
  Currency,
  Incoterm,
  RfqPackage,
  RfqStatus,
  RfqQuotationDetail,
  BankExchangeProvider,
  RateCalculationType,
} from '../shared/types';
import { DEFAULT_EXCHANGE_RATES } from '../shared/constants';
import { exchangeRateService } from './exchangeRateService';
import { apiClient } from './apiClient';

export interface LandedCostComparison {
  supplierName: string;
  country: string;
  incoterm: Incoterm;
  originalCurrency: Currency;
  originalAmount: number;
  freightAndInsuranceVnd: number;
  importDutyVnd: number;
  vatAmountVnd: number;
  totalLandedCostVnd: number;
  rank: number;
  leadTimeWeeks: number;
  warrantyMonths: number;
  paymentTerm: string;
  docsCount: number;
  techScore: number;
  isBest: boolean;
}

export interface ProjectBomMatrixItem {
  code: string;
  name: string;
  unit: string;
  qty: number;
  quotes: Record<string, { unit: number; curr: Currency; totalVnd: number }>;
}

class SourcingService {
  async getRfqs(projectId?: string): Promise<RfqPackage[]> {
    try {
      const url = projectId && projectId !== 'ALL' ? `/rfqs?projectId=${encodeURIComponent(projectId)}` : '/rfqs';
      const items = await apiClient.get<any[]>(url);
      return (items || []).map(this.mapEntityToRfq);
    } catch {
      return [];
    }
  }

  async getRfqById(rfqId: string): Promise<RfqPackage | undefined> {
    try {
      const entity = await apiClient.get<any>(`/rfqs/${rfqId}`);
      return entity ? this.mapEntityToRfq(entity) : undefined;
    } catch {
      return undefined;
    }
  }

  async getQuotationDetail(rfqId: string): Promise<RfqQuotationDetail | undefined> {
    try {
      const detail = await apiClient.get<any>(`/rfqs/${rfqId}/detail`);
      if (!detail) return undefined;
      return {
        rfqId: detail.rfqId || rfqId,
        rfqCode: detail.rfqCode || '',
        projectId: detail.projectId || '',
        projectName: detail.projectName || '',
        supplierName: detail.supplierName || '',
        supplierEmail: detail.supplierEmail || '',
        supplierContact: detail.supplierContact || '',
        supplierCountry: detail.supplierCountry || '',
        currency: (detail.currency as Currency) || Currency.USD,
        incoterm: (detail.incoterm as Incoterm) || Incoterm.CIF,
        paymentTerm: detail.paymentTerm || '',
        loadingPort: detail.loadingPort || '',
        dischargePort: detail.dischargePort || '',
        leadTimeWeeks: Number(detail.leadTimeWeeks || 0),
        warrantyMonths: Number(detail.warrantyMonths || 0),
        notes: detail.notes || '',
        submittedAt: detail.submittedAt || '',
        digitalChecksum: detail.digitalChecksum || '',
        securityPin: detail.securityPin || '',
        status: (detail.status as RfqStatus) || RfqStatus.QUOTED,
        totalAmount: Number(detail.totalAmount || 0),
        items: (detail.items || []).map((i: any) => ({
          id: i.id || '',
          itemCode: i.itemCode || '',
          itemName: i.itemName || '',
          specs: i.specs || '',
          origin: i.origin || '',
          unit: i.unit || '',
          quantity: Number(i.quantity || 0),
          unitPrice: Number(i.unitPrice || 0),
          totalAmount: Number(i.totalAmount || 0),
        })),
        attachedDocs: (detail.attachedDocs || []).map((d: any) => ({
          id: d.id || '',
          name: d.name || '',
          size: d.size || '',
          type: d.type || 'OTHER',
          uploadedAt: d.uploadedAt || '',
        })),
      };
    } catch {
      return undefined;
    }
  }

  async createRfq(newRfq: Partial<RfqPackage>): Promise<RfqPackage> {
    const payload = {
      code: newRfq.rfqCode,
      projectId: newRfq.projectId,
      projectName: newRfq.projectName,
      supplierName: newRfq.supplierName,
      supplierEmail: newRfq.supplierEmail,
      itemCount: newRfq.itemCount,
      currency: newRfq.currency,
      incoterm: newRfq.incoterm,
      totalQuoteAmount: newRfq.totalQuoteAmount,
      status: newRfq.status || RfqStatus.SENT,
    };
    const created = await apiClient.post<any>('/rfqs', payload);
    return this.mapEntityToRfq(created);
  }

  async updateRfq(rfqId: string, updates: Partial<RfqPackage>): Promise<RfqPackage> {
    const payload = {
      code: updates.rfqCode,
      projectId: updates.projectId,
      projectName: updates.projectName,
      supplierName: updates.supplierName,
      supplierEmail: updates.supplierEmail,
      itemCount: updates.itemCount,
      currency: updates.currency,
      incoterm: updates.incoterm,
      totalQuoteAmount: updates.totalQuoteAmount,
      status: updates.status,
    };
    const updated = await apiClient.put<any>(`/rfqs/${rfqId}`, payload);
    return this.mapEntityToRfq(updated);
  }

  async deleteRfq(rfqId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/rfqs/${rfqId}`);
      return true;
    } catch {
      return false;
    }
  }

  async getComparisonMatrix(
    projectId: string,
    bankProvider?: BankExchangeProvider,
    rateType?: RateCalculationType,
    marginPercent?: number
  ): Promise<LandedCostComparison[]> {
    const rfqs = await this.getRfqs(projectId);
    const quotedRfqs = rfqs.filter(
      (r) => (projectId === 'ALL' || r.projectId === projectId) && r.status === RfqStatus.QUOTED && r.totalQuoteAmount
    );

    if (quotedRfqs.length === 0) {
      return [];
    }

    const rates = exchangeRateService.getAllEffectiveRates(bankProvider, rateType, marginPercent);

    const comparisons: LandedCostComparison[] = [];
    for (const rfq of quotedRfqs) {
      const quoteAmount = rfq.totalQuoteAmount || 0;
      const rate = rates[rfq.currency] || DEFAULT_EXCHANGE_RATES[rfq.currency] || 1;
      const baseVnd = quoteAmount * rate;

      let freightAndInsuranceVnd = 0;
      if (rfq.incoterm === Incoterm.FOB || rfq.incoterm === Incoterm.EXW) {
        freightAndInsuranceVnd = Math.round(baseVnd * 0.045);
      } else if (rfq.incoterm === Incoterm.CIF || rfq.incoterm === Incoterm.CIP) {
        freightAndInsuranceVnd = Math.round(baseVnd * 0.015);
      }

      const cifVnd = baseVnd + freightAndInsuranceVnd;
      const importDutyVnd = rfq.incoterm === Incoterm.DDP || rfq.currency === Currency.VND ? 0 : Math.round(cifVnd * 0.05);
      const vatBase = cifVnd + importDutyVnd;
      const vatAmountVnd = rfq.incoterm === Incoterm.DDP || rfq.currency === Currency.VND ? 0 : Math.round(vatBase * 0.1);
      const totalLandedCostVnd = cifVnd + importDutyVnd + vatAmountVnd;

      const quotDetail = await this.getQuotationDetail(rfq.id);
      const country = quotDetail?.supplierCountry || 'Quốc Tế';
      const paymentTerm = quotDetail?.paymentTerm || (rfq.currency === Currency.VND ? 'Chuyển khoản sau nghiệm thu' : '100% L/C at sight');
      const docsCount = quotDetail?.attachedDocs?.length || 0;
      const leadTimeWeeks = quotDetail?.leadTimeWeeks || (rfq.currency === Currency.VND ? 4 : 12);
      const warrantyMonths = quotDetail?.warrantyMonths || 12;

      comparisons.push({
        supplierName: rfq.supplierName,
        country,
        incoterm: rfq.incoterm,
        originalCurrency: rfq.currency,
        originalAmount: quoteAmount,
        freightAndInsuranceVnd,
        importDutyVnd,
        vatAmountVnd,
        totalLandedCostVnd,
        rank: 1,
        leadTimeWeeks,
        warrantyMonths,
        paymentTerm,
        docsCount,
        techScore: 90.0,
        isBest: false,
      });
    }

    comparisons.sort((a, b) => a.totalLandedCostVnd - b.totalLandedCostVnd);

    return comparisons.map((item, idx) => ({
      ...item,
      rank: idx + 1,
      techScore: Number((95.0 - idx * 2.0).toFixed(1)),
      isBest: idx === 0,
    }));
  }

  async getProjectBomMatrix(
    projectId: string,
    bankProvider?: BankExchangeProvider,
    rateType?: RateCalculationType,
    marginPercent?: number
  ): Promise<ProjectBomMatrixItem[]> {
    const rfqs = await this.getRfqs(projectId);
    const projectRfqs = rfqs.filter(
      (r) => (projectId === 'ALL' || r.projectId === projectId) && r.status === RfqStatus.QUOTED
    );

    if (projectRfqs.length === 0) {
      return [];
    }

    const rates = exchangeRateService.getAllEffectiveRates(bankProvider, rateType, marginPercent);
    const itemMap = new Map<string, ProjectBomMatrixItem>();

    for (const rfq of projectRfqs) {
      const detail = await this.getQuotationDetail(rfq.id);
      if (!detail) continue;
      const effectiveRate = rates[rfq.currency] || DEFAULT_EXCHANGE_RATES[rfq.currency] || 1;

      for (const it of detail.items) {
        if (!itemMap.has(it.itemCode)) {
          itemMap.set(it.itemCode, {
            code: it.itemCode,
            name: it.itemName,
            unit: it.unit,
            qty: it.quantity,
            quotes: {},
          });
        }

        const bomItem = itemMap.get(it.itemCode)!;
        bomItem.quotes[rfq.supplierName] = {
          unit: it.unitPrice,
          curr: rfq.currency,
          totalVnd: Math.round(it.unitPrice * it.quantity * effectiveRate),
        };
      }
    }

    return Array.from(itemMap.values());
  }

  private mapEntityToRfq(e: any): RfqPackage {
    return {
      id: e.id ? e.id.toString() : '',
      rfqCode: e.code || e.rfqCode || '',
      projectId: e.projectId || '',
      projectName: e.projectName || '',
      supplierName: e.supplierName || '',
      supplierEmail: e.supplierEmail || '',
      itemCount: Number(e.itemCount || (e.items ? e.items.length : 0)),
      currency: (e.currency as Currency) || Currency.USD,
      incoterm: (e.incoterm as Incoterm) || Incoterm.CIF,
      totalQuoteAmount: e.totalQuoteAmount !== undefined ? Number(e.totalQuoteAmount) : undefined,
      status: (e.status as RfqStatus) || RfqStatus.SENT,
      magicLinkExpiresAt: e.magicLinkExpiresAt ? String(e.magicLinkExpiresAt).replace('T', ' ').slice(0, 16) : '',
      createdAt: e.createdAt ? String(e.createdAt).replace('T', ' ').slice(0, 16) : '',
    };
  }
}

export const sourcingService = new SourcingService();
