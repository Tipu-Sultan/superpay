import type { ZodType } from 'zod';
import { ApiError } from './ApiError';

/** Parses `data` with a zod schema or throws a 422 ApiError with field level details. */
export function parseOrThrow<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  const details = result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
  throw ApiError.validation(details[0]?.message ?? 'Invalid request.', details);
}
