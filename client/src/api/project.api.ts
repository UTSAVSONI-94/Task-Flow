import api from './axios';
import type { ApiResponse, Project } from '@/types';

export const projectApi = {
  create: (data: { name: string; description?: string }) =>
    api.post<ApiResponse<Project>>('/projects', data),

  list: () =>
    api.get<ApiResponse<Project[]>>('/projects'),

  getById: (id: string) =>
    api.get<ApiResponse<Project>>(`/projects/${id}`),

  update: (id: string, data: { name?: string; description?: string }) =>
    api.patch<ApiResponse<Project>>(`/projects/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/projects/${id}`),

  addMember: (projectId: string, data: { email: string; role?: string }) =>
    api.post<ApiResponse<Project>>(`/projects/${projectId}/members`, data),

  updateMemberRole: (projectId: string, userId: string, data: { role: string }) =>
    api.patch<ApiResponse<Project>>(`/projects/${projectId}/members/${userId}`, data),

  removeMember: (projectId: string, userId: string) =>
    api.delete<ApiResponse<Project>>(`/projects/${projectId}/members/${userId}`),
};
