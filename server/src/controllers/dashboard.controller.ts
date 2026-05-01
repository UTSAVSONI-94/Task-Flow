import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { ApiResponse } from '../utils/ApiResponse';

export class DashboardController {
  static async getDashboard(req: Request, res: Response) {
    try {
      const dashboard = await DashboardService.getDashboard(req.user!.userId);
      return ApiResponse.success(res, dashboard);
    } catch (error: any) {
      return ApiResponse.error(res, error.message, error.status || 500);
    }
  }
}
