import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/ApiResponse';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(req.body);

      // Set refresh token as HttpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      return ApiResponse.created(res, {
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error: any) {
      return ApiResponse.error(res, error.message, error.status || 500);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const result = await AuthService.login(req.body);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      return ApiResponse.success(res, {
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error: any) {
      return ApiResponse.error(res, error.message, error.status || 500);
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const oldRefreshToken = req.cookies?.refreshToken;
      const result = await AuthService.refresh(oldRefreshToken);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      return ApiResponse.success(res, {
        accessToken: result.accessToken,
      });
    } catch (error: any) {
      return ApiResponse.error(res, error.message, error.status || 500);
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      await AuthService.logout(req.user!.userId);

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      return ApiResponse.success(res, { message: 'Logged out successfully' });
    } catch (error: any) {
      return ApiResponse.error(res, error.message, error.status || 500);
    }
  }

  static async getMe(req: Request, res: Response) {
    try {
      const user = await AuthService.getMe(req.user!.userId);
      return ApiResponse.success(res, user);
    } catch (error: any) {
      return ApiResponse.error(res, error.message, error.status || 500);
    }
  }
}
