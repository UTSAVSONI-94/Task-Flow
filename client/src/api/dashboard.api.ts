import api from './axios';
import type { ApiResponse, DashboardData } from '@/types';

export const dashboardApi = {
  get: () =>
    api.get<ApiResponse<DashboardData>>('/dashboard'),
};
