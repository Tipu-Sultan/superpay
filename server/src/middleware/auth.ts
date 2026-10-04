import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../services/auth.service';
import { ApiError } from '../utils/ApiError';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Please sign in to continue.');
  }
  req.userId = verifyToken(header.slice('Bearer '.length).trim());
  next();
}

/** Narrowing helper for controllers that sit behind `requireAuth`. */
export function userIdOf(req: Request): string {
  if (!req.userId) throw ApiError.unauthorized();
  return req.userId;
}
