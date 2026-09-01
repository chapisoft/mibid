/**
 * Dịch vụ Kho Hồ Sơ Năng Lực & Chứng Từ Số Hóa DMS
 * Kết nối 100% với Spring Boot Backend REST API (/api/v1/documents)
 */

import { DocumentItem, DocumentOwnerType, DocumentStatus, DocumentType } from '../shared/types';
import { apiClient } from './apiClient';

class DmsService {
  async getDocuments(ownerType?: DocumentOwnerType, ownerId?: string): Promise<DocumentItem[]> {
    try {
      const params = new URLSearchParams();
      if (ownerType) params.append('ownerType', ownerType);
      if (ownerId && ownerId !== 'ALL') params.append('ownerId', ownerId);
      const url = params.toString() ? `/documents?${params.toString()}` : '/documents';
      const list = await apiClient.get<any[]>(url);
      return (list || []).map(this.mapEntityToDoc);
    } catch {
      return [];
    }
  }

  async getDocumentById(docId: string): Promise<DocumentItem | undefined> {
    try {
      const entity = await apiClient.get<any>(`/documents/${docId}`);
      return entity ? this.mapEntityToDoc(entity) : undefined;
    } catch {
      return undefined;
    }
  }

  async uploadDocument(newDoc: Partial<DocumentItem>): Promise<DocumentItem> {
    const payload = this.mapDocToEntity(newDoc);
    const created = await apiClient.post<any>('/documents', payload);
    return this.mapEntityToDoc(created);
  }

  async updateDocument(docId: string, updates: Partial<DocumentItem>): Promise<DocumentItem> {
    const payload = this.mapDocToEntity(updates);
    const updated = await apiClient.put<any>(`/documents/${docId}`, payload);
    return this.mapEntityToDoc(updated);
  }

  async deleteDocument(docId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/documents/${docId}`);
      return true;
    } catch {
      return false;
    }
  }

  private mapEntityToDoc(e: any): DocumentItem {
    return {
      id: e.id ? e.id.toString() : '',
      documentName: e.name || e.documentName || '',
      documentType: (e.type as DocumentType) || DocumentType.LEGAL_PROFILE,
      ownerType: (e.ownerType as DocumentOwnerType) || DocumentOwnerType.TENANT,
      ownerId: e.ownerId || '',
      ownerName: e.ownerName || '',
      vendorCode: e.vendorCode,
      docCode: e.code || e.docCode || '',
      fileSize: e.fileSize || '',
      issuerName: e.issuerName || '',
      effectiveFrom: e.effectiveFrom || '',
      effectiveTo: e.effectiveTo || '',
      status: (e.status as DocumentStatus) || DocumentStatus.VALID,
      daysRemaining: Number(e.daysRemaining || 0),
      notes: e.notes || '',
      isVerified: Boolean(e.isVerified),
    };
  }

  private mapDocToEntity(d: Partial<DocumentItem>): any {
    return {
      name: d.documentName,
      type: d.documentType,
      ownerType: d.ownerType,
      ownerId: d.ownerId,
      ownerName: d.ownerName,
      vendorCode: d.vendorCode,
      code: d.docCode,
      fileSize: d.fileSize,
      issuerName: d.issuerName,
      effectiveFrom: d.effectiveFrom,
      effectiveTo: d.effectiveTo,
      status: d.status,
      notes: d.notes,
    };
  }
}

export const dmsService = new DmsService();
