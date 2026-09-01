/**
 * Dịch vụ Quản lý & Phân bổ Công việc Tự Động
 * Kết nối 100% với Spring Boot Backend REST API (/api/v1/tasks)
 */

import { Department, TaskItem, TaskPriority, TaskStatus } from '../shared/types';
import { apiClient } from './apiClient';

class TaskService {
  async getTasks(projectId?: string, department?: string): Promise<TaskItem[]> {
    try {
      const params = new URLSearchParams();
      if (projectId && projectId !== 'ALL') params.append('projectId', projectId);
      if (department && department !== 'ALL') params.append('department', department);
      const url = params.toString() ? `/tasks?${params.toString()}` : '/tasks';
      const list = await apiClient.get<any[]>(url);
      return (list || []).map(this.mapEntityToTask);
    } catch {
      return [];
    }
  }

  async getTaskById(taskId: string): Promise<TaskItem | undefined> {
    try {
      const entity = await apiClient.get<any>(`/tasks/${taskId}`);
      return entity ? this.mapEntityToTask(entity) : undefined;
    } catch {
      return undefined;
    }
  }

  async addTask(newTask: Partial<TaskItem>): Promise<TaskItem> {
    const payload = this.mapTaskToEntity(newTask);
    const created = await apiClient.post<any>('/tasks', payload);
    return this.mapEntityToTask(created);
  }

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<TaskItem> {
    const payload = {
      status: status === TaskStatus.COMPLETED ? 'DONE' : status,
    };
    const updated = await apiClient.put<any>(`/tasks/${taskId}`, payload);
    return this.mapEntityToTask(updated);
  }

  async updateTask(taskId: string, updates: Partial<TaskItem>): Promise<TaskItem> {
    const payload = this.mapTaskToEntity(updates);
    const updated = await apiClient.put<any>(`/tasks/${taskId}`, payload);
    return this.mapEntityToTask(updated);
  }

  async deleteTask(taskId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/tasks/${taskId}`);
      return true;
    } catch {
      return false;
    }
  }

  private mapEntityToTask(e: any): TaskItem {
    let status = TaskStatus.TODO;
    if (e.status === 'IN_PROGRESS') status = TaskStatus.IN_PROGRESS;
    else if (e.status === 'DONE' || e.status === 'COMPLETED') status = TaskStatus.COMPLETED;
    else if (e.status === 'REVIEW') status = TaskStatus.IN_PROGRESS;

    let priority = TaskPriority.MEDIUM;
    if (e.priority === 'URGENT') priority = TaskPriority.URGENT;
    else if (e.priority === 'HIGH') priority = TaskPriority.HIGH;
    else if (e.priority === 'LOW') priority = TaskPriority.LOW;

    let department = Department.TECHNICAL;
    if (e.departmentCode === 'COMMERCIAL' || e.department === 'COMMERCIAL') department = Department.COMMERCIAL;
    else if (e.departmentCode === 'FINANCE' || e.department === 'FINANCE') department = Department.FINANCE;
    else if (e.departmentCode === 'LEGAL' || e.department === 'LEGAL') department = Department.LEGAL;

    return {
      id: e.id ? e.id.toString() : '',
      projectId: e.projectId || '',
      projectCode: e.code || e.projectCode || '',
      taskTitle: e.title || e.taskTitle || '',
      department,
      assigneeName: e.assigneeName || '',
      priority,
      status,
      startDate: e.startDate || '',
      deadline: e.dueAt ? String(e.dueAt).split('T')[0] : (e.deadline || ''),
      completedAt: e.completedAt ? String(e.completedAt).split('T')[0] : undefined,
      durationDays: Number(e.durationDays || 0),
      checklistTotal: Number(e.checklistTotal || 0),
      checklistDone: Number(e.checklistDone || 0),
    };
  }

  private mapTaskToEntity(t: Partial<TaskItem>): any {
    return {
      code: t.projectCode,
      title: t.taskTitle,
      projectId: t.projectId,
      departmentCode: t.department,
      priority: t.priority,
      assigneeName: t.assigneeName,
      status: t.status === TaskStatus.COMPLETED ? 'DONE' : t.status,
      dueAt: t.deadline ? `${t.deadline}T17:00:00` : undefined,
    };
  }
}

export const taskService = new TaskService();
