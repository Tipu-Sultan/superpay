import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/** Maps every thrown error to the { success: false, error } envelope. */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  let status = 500;
  let code: string = 'INTERNAL';
  let message = 'Something went wrong on our side. Please try again.';
  let details: unknown;

  if (err instanceof ApiError) {
    ({ status, code, message, details } = { status: err.status, code: err.code, message: err.message, details: err.details });
  } else if (err instanceof ZodError) {
    status = 422;
    code = 'VALIDATION_ERROR';
    details = err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
    message = err.issues[0]?.message ?? 'Invalid request.';
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    code = 'BAD_REQUEST';
    message = 'Invalid identifier.';
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 422;
    code = 'VALIDATION_ERROR';
    message = Object.values(err.errors)[0]?.message ?? 'Invalid data.';
  } else if (isMalformedJson(err)) {
    status = 400;
    code = 'BAD_REQUEST';
    message = 'Request body must be valid JSON.';
  } else if (isDuplicateKey(err)) {
    status = 409;
    code = 'CONFLICT';
    message = 'This record already exists.';
  }

  if (status >= 500) {
    logger.error(`${req.method} ${req.originalUrl} -> ${status}`, err);
    if (env.isProduction) details = undefined;
  }

  res.status(status).json({ success: false, error: { code, message, ...(details ? { details } : {}) } });
}

function isMalformedJson(err: unknown): boolean {
  return err instanceof SyntaxError && 'body' in err;
}

function isDuplicateKey(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000;
}
