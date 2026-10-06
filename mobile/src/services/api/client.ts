import { REQUEST_TIMEOUT_MS } from '@/config/env';
import { ApiError, type ApiErrorCode } from './errors';
import { getApiBaseUrl } from './serverConfig';

type Query = Record<string, string | number | boolean | undefined | null>;

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Query;
  signal?: AbortSignal;
  /** Set false for public endpoints. Defaults to true. */
  auth?: boolean;
  timeoutMs?: number;
}

interface Envelope<T> {
  success: boolean;
  data?: T;
  error?: { code?: string; message?: string; details?: unknown };
}

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

/** The auth provider registers a handler that signs the user out when the server says 401. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

function buildUrl(path: string, query?: Query): string {
  const base = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  if (!query) return base;
  const parts: string[] = [];
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  }
  return parts.length ? `${base}?${parts.join('&')}` : base;
}

const KNOWN_CODES: ApiErrorCode[] = [
  'BAD_REQUEST', 'VALIDATION_ERROR', 'UNAUTHORIZED', 'NOT_FOUND', 'CONFLICT',
  'LIMIT_EXCEEDED', 'INSUFFICIENT_BALANCE', 'RATE_LIMITED', 'INTERNAL', 'SERVICE_UNAVAILABLE',
];

/**
 * The single place the app talks HTTP. Handles auth header, timeouts, the
 * `{ success, data | error }` envelope and turns every failure into an ApiError.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, signal, auth = true, timeoutMs = REQUEST_TIMEOUT_MS } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const onExternalAbort = () => controller.abort();
  signal?.addEventListener('abort', onExternalAbort);

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && authToken) headers.Authorization = `Bearer ${authToken}`;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error; // caller cancelled (React Query), not a failure
    const timedOut = (error as { name?: string })?.name === 'AbortError';
    throw new ApiError(
      timedOut ? 'TIMEOUT' : 'NETWORK',
      timedOut
        ? 'The request timed out. Check your connection and try again.'
        : `Can't reach the SuperPay server at ${getApiBaseUrl()}. Check your connection and server address.`,
    );
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', onExternalAbort);
  }

  let payload: Envelope<T> | null = null;
  try {
    payload = (await response.json()) as Envelope<T>;
  } catch {
    payload = null;
  }

  if (response.ok && payload?.success) return payload.data as T;

  const rawCode = payload?.error?.code as ApiErrorCode | undefined;
  const code: ApiErrorCode = rawCode && KNOWN_CODES.includes(rawCode) ? rawCode : response.status === 401 ? 'UNAUTHORIZED' : 'UNKNOWN';
  const message = payload?.error?.message ?? `Request failed (${response.status}).`;

  if (response.status === 401 && auth) onUnauthorized?.();
  throw new ApiError(code, message, response.status, payload?.error?.details);
}

export const api = {
  get: <T>(path: string, query?: Query, signal?: AbortSignal) => apiRequest<T>(path, { query, signal }),
  post: <T>(path: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    apiRequest<T>(path, { ...options, method: 'POST', body: body ?? {} }),
  patch: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: 'PATCH', body: body ?? {} }),
};
