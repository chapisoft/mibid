/**
 * Dịch vụ Quản lý Gói thầu & Quy trình Kanban
 * Kết nối 100% với Spring Boot Backend REST API (/api/v1/projects)
 */

import { Currency, TenderProject, TenderStage, TenderStatus, TenderType } from '../shared/types';
import { apiClient } from './apiClient';

class TenderService {
  async getProjects(): Promise<TenderProject[]> {
    try {
      const list = await apiClient.get<any[]>('/projects');
      return (list || []).map(this.mapEntityToProject);
    } catch {
      return [];
    }
  }

  async getProjectById(projectId: string): Promise<TenderProject | undefined> {
    try {
      const entity = await apiClient.get<any>(`/projects/${projectId}`);
      return entity ? this.mapEntityToProject(entity) : undefined;
    } catch {
      return undefined;
    }
  }

  async createProject(newProject: Partial<TenderProject>): Promise<TenderProject> {
    const payload = this.mapProjectToEntity(newProject);
    const created = await apiClient.post<any>('/projects', payload);
    return this.mapEntityToProject(created);
  }

  async updateProject(projectId: string, updates: Partial<TenderProject>): Promise<TenderProject> {
    const payload = this.mapProjectToEntity(updates);
    const updated = await apiClient.put<any>(`/projects/${projectId}`, payload);
    return this.mapEntityToProject(updated);
  }

  async deleteProject(projectId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/projects/${projectId}`);
      return true;
    } catch {
      return false;
    }
  }

  async advanceStage(projectId: string, nextStage: TenderStage, bypassReason?: string): Promise<TenderProject> {
    const updates: Partial<TenderProject> = {
      currentStage: nextStage,
      status: nextStage === TenderStage.STAGE_SUBMISSION ? TenderStatus.SUBMITTED :
              nextStage === TenderStage.STAGE_AWARD_LOGISTICS ? TenderStatus.WON : TenderStatus.IN_PROGRESS,
    };
    return this.updateProject(projectId, updates);
  }

  async bindWorkflow(projectId: string, workflowId: string): Promise<TenderProject> {
    const updated = await apiClient.put<any>(`/projects/${projectId}/workflow/${workflowId}`, {});
    return this.mapEntityToProject(updated);
  }

  async getProjectWorkflow(projectId: string): Promise<any> {
    return await apiClient.get<any>(`/projects/${projectId}/workflow`);
  }

  private mapEntityToProject(e: any): TenderProject {
    let currentStage = TenderStage.STAGE_PREPARATION;
    if (e.stageEnum) {
      if (e.stageEnum === 'STAGE_SOURCING') currentStage = TenderStage.STAGE_SOURCING;
      else if (e.stageEnum === 'STAGE_DOSSIER' || e.stageEnum === 'STAGE_DOSSIER_PREP') currentStage = TenderStage.STAGE_DOSSIER_PREP;
      else if (e.stageEnum === 'STAGE_INTERNAL_REVIEW') currentStage = TenderStage.STAGE_INTERNAL_REVIEW;
      else if (e.stageEnum === 'STAGE_SUBMISSION') currentStage = TenderStage.STAGE_SUBMISSION;
      else if (e.stageEnum === 'STAGE_AWARD_LOGISTICS' || e.stageEnum === 'STAGE_CLOSING') currentStage = TenderStage.STAGE_AWARD_LOGISTICS;
    }

    return {
      id: e.id ? e.id.toString() : '',
      projectCode: e.code || e.projectCode || '',
      projectName: e.name || e.projectName || '',
      investorName: e.investorName || '',
      tenderType: (e.tenderType as TenderType) || TenderType.TENANT_PARTICIPATING,
      budgetAmount: Number(e.estimatedBudget || e.budgetAmount || 0),
      budgetCurrency: (e.currency as Currency) || Currency.VND,
      submissionDeadline: e.bidSubmissionDeadline ? String(e.bidSubmissionDeadline).replace('T', ' ').slice(0, 16) : (e.submissionDeadline || ''),
      currentStage,
      status: (e.status as TenderStatus) || TenderStatus.IN_PROGRESS,
      bidManagerName: e.managerName || e.bidManagerName || '',
      completionRate: e.completedTasks && e.totalTasks ? Math.round((e.completedTasks / e.totalTasks) * 100) : (e.completionRate || 0),
      workflowId: e.workflowId ? e.workflowId.toString() : undefined,
    };
  }

  private mapProjectToEntity(p: Partial<TenderProject>): any {
    return {
      code: p.projectCode,
      name: p.projectName,
      tenderType: p.tenderType,
      investorName: p.investorName,
      estimatedBudget: p.budgetAmount,
      currency: p.budgetCurrency,
      stageEnum: p.currentStage,
      workflowId: p.workflowId,
      bidSubmissionDeadline: p.submissionDeadline ? p.submissionDeadline.replace(' ', 'T') : undefined,
      managerName: p.bidManagerName,
      status: p.status,
    };
  }
}

export const tenderService = new TenderService();
