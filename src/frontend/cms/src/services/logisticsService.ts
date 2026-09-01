/**
 * Dịch vụ Theo dõi Vận đơn & Quản lý Logistics Xuất Nhập Khẩu
 * Kết nối trực tiếp với Spring Boot Backend REST API (/api/v1/shipments)
 */

import {
  DeliveryScheduleStatus,
  LogisticsStatus,
  ShipmentItem,
  ShipmentMilestoneStatus,
  TenderType,
  TransportMode,
} from '../shared/types';
import { apiClient } from './apiClient';

class LogisticsService {
  async getShipments(projectId?: string): Promise<ShipmentItem[]> {
    try {
      const url = projectId && projectId !== 'ALL' ? `/shipments?projectId=${encodeURIComponent(projectId)}` : '/shipments';
      const items = await apiClient.get<any[]>(url);
      return (items || []).map(this.mapEntityToItem);
    } catch {
      return [];
    }
  }

  async getShipmentById(shipmentId: string): Promise<ShipmentItem | undefined> {
    try {
      const entity = await apiClient.get<any>(`/shipments/${shipmentId}`);
      return entity ? this.mapEntityToItem(entity) : undefined;
    } catch {
      return undefined;
    }
  }

  async addShipment(newShip: Partial<ShipmentItem>): Promise<ShipmentItem> {
    const payload = this.mapItemToEntity(newShip);
    const created = await apiClient.post<any>('/shipments', payload);
    return this.mapEntityToItem(created);
  }

  async updateShipment(shipmentId: string, updates: Partial<ShipmentItem>): Promise<ShipmentItem> {
    const payload = this.mapItemToEntity(updates);
    const updated = await apiClient.put<any>(`/shipments/${shipmentId}`, payload);
    return this.mapEntityToItem(updated);
  }

  async deleteShipment(shipmentId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/shipments/${shipmentId}`);
      return true;
    } catch {
      return false;
    }
  }

  private mapEntityToItem(e: any): ShipmentItem {
    return {
      id: e.id ? e.id.toString() : '',
      trackingNumber: e.trackingNumber || (e.blNumber ? `TRK-${e.blNumber}` : ''),
      blNumber: e.blNumber || '',
      projectId: e.projectId || '',
      projectCode: e.projectCode || '',
      projectName: e.projectName || '',
      investorName: e.investorName || '',
      tenderType: (e.tenderType as TenderType) || TenderType.TENANT_PARTICIPATING,
      contractNumber: e.contractNo || e.contractNumber || '',
      supplierName: e.supplierName || '',
      originCountry: e.originCountry || '',
      carrierName: e.carrier || e.carrierName || '',
      vesselName: e.vesselName || '',
      originPort: e.pol || e.originPort || '',
      destinationPort: e.pod || e.destinationPort || '',
      transportMode: (e.transportMode as TransportMode) || TransportMode.SEA,
      containerDetails: e.containerDetails || (e.containerCount ? `${e.containerCount}x40'HC` : ''),
      contractDeliveryDeadline: e.contractDeadline || e.contractDeliveryDeadline || '',
      etdDate: e.etd || e.etdDate || '',
      etaDate: e.eta || e.etaDate || '',
      actualDeliveryDate: e.actualDeliveryDate,
      scheduleStatus: (e.scheduleStatus as DeliveryScheduleStatus) || (e.status === 'DELAYED' ? DeliveryScheduleStatus.DELAYED_CRITICAL : DeliveryScheduleStatus.ON_TIME),
      delayDays: Number(e.delayDays || 0),
      status: (e.status as LogisticsStatus) || LogisticsStatus.SAILING,
      isDelayed: Boolean(e.isDelayed || e.status === 'DELAYED'),
      cargoSummary: e.equipmentSummary || e.cargoSummary || '',
      cargoItems: Array.isArray(e.cargoItems) ? e.cargoItems : [],
      milestones: (e.milestones || []).map((m: any, idx: number) => ({
        id: m.id ? m.id.toString() : `ms-${idx + 1}`,
        stepName: m.name || m.stepName || '',
        plannedDate: m.plannedDate || '',
        actualDate: m.actualDate || '',
        status: (m.status as ShipmentMilestoneStatus) || ShipmentMilestoneStatus.PENDING,
        location: m.location || m.notes || '',
        notes: m.notes || '',
      })),
      documents: Array.isArray(e.documents) ? e.documents : [],
    };
  }

  private mapItemToEntity(item: Partial<ShipmentItem>): any {
    return {
      blNumber: item.blNumber,
      projectId: item.projectId,
      projectName: item.projectName,
      contractNo: item.contractNumber,
      carrier: item.carrierName,
      pol: item.originPort,
      pod: item.destinationPort,
      etd: item.etdDate,
      eta: item.etaDate,
      contractDeadline: item.contractDeliveryDeadline,
      status: item.status,
      equipmentSummary: item.cargoSummary,
      supplierName: item.supplierName,
      originCountry: item.originCountry,
      vesselName: item.vesselName,
      voyageNo: item.vesselName,
      delayReason: item.isDelayed ? 'Chậm trễ tiến độ' : undefined,
    };
  }
}

export const logisticsService = new LogisticsService();
