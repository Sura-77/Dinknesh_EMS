import { Request, Response, NextFunction } from 'express';

// Wraps async route handlers so errors go to Express error handler instead of crashing
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
