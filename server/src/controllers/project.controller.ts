import { Request, Response } from 'express';
import { ProjectService } from '../services/project.service';
import { ApiResponse } from '../utils/ApiResponse';

export class ProjectController {
  static async create(req: Request, res: Response) {
    try {
      const project = await ProjectService.create(req.body, req.user!.userId);
      return ApiResponse.created(res, project);
    } catch (error: any) {
      return ApiResponse.error(res, error.message, error.status || 500);
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const projects = await ProjectService.listForUser(req.user!.userId);
      return ApiResponse.success(res, projects);
    } catch (error: any) {
      return ApiResponse.error(res, error.message, error.status || 500);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const project = await ProjectService.getById(req.params.id);
      return ApiResponse.success(res, project);
    } catch (error: any) {
      return ApiResponse.error(res, error.message, error.status || 500);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const project = await ProjectService.update(req.params.id, req.body);
      return ApiResponse.success(res, project);
    } catch (error: any) {
      return ApiResponse.error(res, error.message, error.status || 500);
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const result = await ProjectService.delete(req.params.id);
      return ApiResponse.success(res, result);
    } catch (error: any) {
      return ApiResponse.error(res, error.message, error.status || 500);
    }
  }

  static async addMember(req: Request, res: Response) {
    try {
      const project = await ProjectService.addMember(req.params.id, req.body);
      return ApiResponse.created(res, project);
    } catch (error: any) {
      return ApiResponse.error(res, error.message, error.status || 500);
    }
  }

  static async updateMemberRole(req: Request, res: Response) {
    try {
      const project = await ProjectService.updateMemberRole(
        req.params.id,
        req.params.userId,
        req.body
      );
      return ApiResponse.success(res, project);
    } catch (error: any) {
      return ApiResponse.error(res, error.message, error.status || 500);
    }
  }

  static async removeMember(req: Request, res: Response) {
    try {
      const project = await ProjectService.removeMember(
        req.params.id,
        req.params.userId
      );
      return ApiResponse.success(res, project);
    } catch (error: any) {
      return ApiResponse.error(res, error.message, error.status || 500);
    }
  }
}
