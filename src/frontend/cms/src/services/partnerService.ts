import {
  PartnerOnboardingRequest,
  PartnerStatus,
  PartnerSupportTicket,
  SupplierPartner,
} from '../shared/types';
import { apiClient } from './apiClient';

class PartnerService {
  async getPartners(): Promise<SupplierPartner[]> {
    try {
      const res = await apiClient.get<any[]>('/partners');
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  }

  async addPartner(newPartner: Partial<SupplierPartner>): Promise<SupplierPartner> {
    const payload = {
      code: newPartner.code,
      name: newPartner.name,
      taxCode: newPartner.taxCode,
      country: newPartner.country,
      category: newPartner.category,
      contactPerson: newPartner.contactPerson,
      email: newPartner.email,
      phone: newPartner.phone,
      status: newPartner.status || PartnerStatus.ACTIVE,
    };
    return await apiClient.post<SupplierPartner>('/partners', payload);
  }

  async getOnboardingRequests(): Promise<PartnerOnboardingRequest[]> {
    try {
      const res = await apiClient.get<any[]>('/partners/onboarding');
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  }

  async approveOnboarding(id: string): Promise<void> {
    await apiClient.post(`/partners/onboarding/${encodeURIComponent(id)}/approve`, {});
  }

  async rejectOnboarding(id: string): Promise<void> {
    await apiClient.post(`/partners/onboarding/${encodeURIComponent(id)}/reject`, {});
  }

  async getSupportTickets(): Promise<PartnerSupportTicket[]> {
    try {
      const res = await apiClient.get<any[]>('/partners/tickets');
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  }

  async resolveTicket(id: string): Promise<void> {
    await apiClient.post(`/partners/tickets/${encodeURIComponent(id)}/resolve`, {});
  }

  async resendMagicLink(ticketId: string): Promise<{ success: boolean; message: string }> {
    return await apiClient.post<{ success: boolean; message: string }>(
      `/partners/tickets/${encodeURIComponent(ticketId)}/resend-magic-link`,
      {}
    );
  }
}

export const partnerService = new PartnerService();
