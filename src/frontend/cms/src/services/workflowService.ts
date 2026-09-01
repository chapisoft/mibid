/**
 * Dịch vụ Quản Trị Quy Trình Động BPMN & Kiểm Soát Gatekeeper
 * Kết nối 100% với Spring Boot Backend REST API (/api/v1/workflows/*)
 */

import {
  WorkflowDefinition,
  WorkflowEdge,
  WorkflowNode,
  WorkflowNodeType,
  WorkflowStatus,
  WorkflowTemplate,
  WorkflowValidationError,
  WorkflowValidationResult,
  WorkflowValidationSeverity,
} from '../shared/types';
import { Translations } from '../shared/i18n';
import { apiClient } from './apiClient';

export {
  WorkflowNodeType,
  WorkflowStatus,
  WorkflowValidationSeverity,
};

class WorkflowService {
  public async getAllWorkflows(): Promise<WorkflowDefinition[]> {
    try {
      const res = await apiClient.get<WorkflowDefinition[]>('/workflows');
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  }

  public async getWorkflowById(id: string): Promise<WorkflowDefinition> {
    return await apiClient.get<WorkflowDefinition>(`/workflows/${encodeURIComponent(id)}`);
  }

  public async saveWorkflow(definition: WorkflowDefinition): Promise<WorkflowDefinition> {
    if (definition.id && !definition.id.startsWith('wf-custom-')) {
      return await apiClient.put<WorkflowDefinition>(`/workflows/${encodeURIComponent(definition.id)}`, definition);
    }
    return await apiClient.post<WorkflowDefinition>('/workflows', definition);
  }

  public async publishWorkflow(definition: WorkflowDefinition): Promise<WorkflowDefinition> {
    if (definition.id) {
      return await apiClient.post<WorkflowDefinition>(`/workflows/${encodeURIComponent(definition.id)}/publish`, {});
    }
    const saved = await this.saveWorkflow(definition);
    return await apiClient.post<WorkflowDefinition>(`/workflows/${encodeURIComponent(saved.id)}/publish`, {});
  }

  public async createWorkflow(params: {
    name: string;
    description?: string;
    templateId?: string;
    tenantName?: string;
  }): Promise<WorkflowDefinition> {
    const payload = {
      name: params.name,
      description: params.description,
      tenantName: params.tenantName,
      status: WorkflowStatus.DRAFT,
      version: 'v1.0',
      nodes: [],
      edges: [],
    };
    return await apiClient.post<WorkflowDefinition>('/workflows', payload);
  }

  public async cloneWorkflow(id: string): Promise<WorkflowDefinition> {
    return await apiClient.post<WorkflowDefinition>(`/workflows/${encodeURIComponent(id)}/clone`, {});
  }

  public async deleteWorkflow(id: string): Promise<boolean> {
    await apiClient.delete(`/workflows/${encodeURIComponent(id)}`);
    return true;
  }

  public async getTemplates(): Promise<WorkflowTemplate[]> {
    try {
      const res = await apiClient.get<WorkflowTemplate[]>('/workflows/templates');
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  }

  public async validateWorkflowRemote(definition: Partial<WorkflowDefinition>): Promise<WorkflowValidationResult> {
    try {
      const res = await apiClient.post<WorkflowValidationResult>('/workflows/validate', definition);
      if (res && typeof res.isValid === 'boolean') {
        return res;
      }
    } catch {
      // Fallback to local validation
    }
    return this.validateWorkflow(definition.nodes || [], definition.edges || []);
  }

  public validateWorkflow(
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
    t?: Translations
  ): WorkflowValidationResult {
    const errors: WorkflowValidationError[] = [];
    const warnings: WorkflowValidationError[] = [];

    const i18nDesigner = t?.workflowDesigner;
    const msgStartMissing = i18nDesigner?.errStartMissing || 'Quy trình bắt buộc phải có ít nhất 1 Start Node.';
    const msgEndMissing = i18nDesigner?.errEndMissing || 'Quy trình bắt buộc phải có ít nhất 1 End Node.';

    // 1. Kiểm tra có ít nhất 1 node START
    const startNodes = nodes.filter((n) => n.type === WorkflowNodeType.START);
    if (startNodes.length === 0) {
      errors.push({
        type: WorkflowValidationSeverity.ERROR,
        message: msgStartMissing,
      });
    }

    // 2. Kiểm tra có ít nhất 1 node END
    const endNodes = nodes.filter((n) => n.type === WorkflowNodeType.END);
    if (endNodes.length === 0) {
      errors.push({
        type: WorkflowValidationSeverity.ERROR,
        message: msgEndMissing,
      });
    }

    // 3. Kiểm tra các node mồ côi
    nodes.forEach((node) => {
      const hasIncoming = edges.some((e) => e.targetNodeId === node.id);
      const hasOutgoing = edges.some((e) => e.sourceNodeId === node.id);
      const nodeLabel = node.data?.title || node.id;
      const nodeCode = node.data?.code ? ` (${node.data.code})` : '';

      if (node.type !== WorkflowNodeType.START && !hasIncoming) {
        warnings.push({
          nodeId: node.id,
          type: WorkflowValidationSeverity.WARNING,
          message: i18nDesigner?.errOrphanedNode
            ? `${nodeLabel}${nodeCode}: ${i18nDesigner.errOrphanedNode}`
            : `Node "${nodeLabel}"${nodeCode} không có đường luồng trỏ đến.`,
        });
      }

      if (node.type !== WorkflowNodeType.END && !hasOutgoing) {
        warnings.push({
          nodeId: node.id,
          type: WorkflowValidationSeverity.WARNING,
          message: `${nodeLabel}${nodeCode}: chưa có đường luồng tiếp theo.`,
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

export const workflowService = new WorkflowService();
