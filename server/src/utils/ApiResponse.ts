import { Response } from 'express';

export class ApiResponse {
  static success(res: Response, data: any, statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
    });
  }

  static created(res: Response, data: any) {
    return res.status(201).json({
      success: true,
      data,
    });
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 400,
    errors: any[] = []
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }
}
