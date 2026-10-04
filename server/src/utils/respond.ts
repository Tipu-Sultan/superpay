import type { Response } from 'express';

/** Every successful response uses the same envelope: { success: true, data }. */
export function ok<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({ success: true, data });
}
