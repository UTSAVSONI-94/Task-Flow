import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/ApiResponse';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Unhandled error:', err);

  if (err.name === 'ValidationError') {
    return ApiResponse.error(res, 'Validation error', 400);
  }

  if (err.name === 'CastError') {
    return ApiResponse.error(res, 'Invalid ID format', 400);
  }

  if ((err as any).code === 11000) {
    return ApiResponse.error(res, 'Duplicate entry', 409);
  }

  return ApiResponse.error(res, 'Internal server error', 500);
};
