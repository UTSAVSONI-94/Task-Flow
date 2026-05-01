import { Request, Response, NextFunction } from 'express';
import { Project } from '../models/Project';
import { ProjectRole } from '../utils/constants';
import { ApiResponse } from '../utils/ApiResponse';

export const requireProjectRole = (...roles: ProjectRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const projectId = req.params.id || req.params.projectId;
    const userId = req.user?.userId;

    if (!userId) {
      return ApiResponse.error(res, 'Authentication required', 401);
    }

    if (!projectId) {
      return ApiResponse.error(res, 'Project ID is required', 400);
    }

    try {
      const project = await Project.findById(projectId);

      if (!project) {
        return ApiResponse.error(res, 'Project not found', 404);
      }

      const member = project.members.find(
        (m) => m.userId.toString() === userId
      );

      if (!member) {
        return ApiResponse.error(res, 'You are not a member of this project', 403);
      }

      if (roles.length > 0 && !roles.includes(member.role)) {
        return ApiResponse.error(res, 'Insufficient permissions', 403);
      }

      // Attach project to request for downstream use
      (req as any).project = project;
      (req as any).memberRole = member.role;
      next();
    } catch (error) {
      return ApiResponse.error(res, 'Server error', 500);
    }
  };
};
