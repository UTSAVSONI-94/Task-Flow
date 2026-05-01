import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';
import { ApiResponse } from '../utils/ApiResponse';

export class TaskController {
  static async create(req: Request, res: Response) {
    try {
      const task = await TaskService.create(
        req.params.id,
        req.body,
        req.user!.userId
      );
      return ApiResponse.created(res, task);
    } catch (error: any) {
      return ApiResponse.error(res, error.message, error.status || 500);
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const tasks = await TaskService.listByProject(req.params.id);
      return ApiResponse.success(res, tasks);
    } catch (error: any) {
      return ApiResponse.error(res, error.message, error.status || 500);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const task = await TaskService.getById(req.params.taskId, req.params.id);
      return ApiResponse.success(res, task);
    } catch (error: any) {
      return ApiResponse.error(res, error.message, error.status || 500);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const task = await TaskService.update(
        req.params.taskId,
        req.params.id,
        req.body
      );
      return ApiResponse.success(res, task);
    } catch (error: any) {
      return ApiResponse.error(res, error.message, error.status || 500);
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const task = await TaskService.updateStatus(
        req.params.taskId,
        req.params.id,
        req.user!.userId,
        (req as any).memberRole,
        req.body
      );
      return ApiResponse.success(res, task);
    } catch (error: any) {
      return ApiResponse.error(res, error.message, error.status || 500);
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const result = await TaskService.delete(req.params.taskId, req.params.id);
      return ApiResponse.success(res, result);
    } catch (error: any) {
      return ApiResponse.error(res, error.message, error.status || 500);
    }
  }
}
