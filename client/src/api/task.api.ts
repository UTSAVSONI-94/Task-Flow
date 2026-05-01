import api from './axios';
import type { ApiResponse, Task, TaskStatus, TaskPriority } from '@/types';

export const taskApi = {
  create: (projectId: string, data: {
    title: string;
    description?: string;
    assigneeId: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string | null;
  }) =>
    api.post<ApiResponse<Task>>(`/projects/${projectId}/tasks`, data),

  list: (projectId: string) =>
    api.get<ApiResponse<Task[]>>(`/projects/${projectId}/tasks`),

  getById: (projectId: string, taskId: string) =>
    api.get<ApiResponse<Task>>(`/projects/${projectId}/tasks/${taskId}`),

  update: (projectId: string, taskId: string, data: Partial<{
    title: string;
    description: string;
    assigneeId: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string | null;
  }>) =>
    api.patch<ApiResponse<Task>>(`/projects/${projectId}/tasks/${taskId}`, data),

  updateStatus: (projectId: string, taskId: string, status: TaskStatus) =>
    api.patch<ApiResponse<Task>>(`/projects/${projectId}/tasks/${taskId}/status`, { status }),

  delete: (projectId: string, taskId: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/projects/${projectId}/tasks/${taskId}`),
};
