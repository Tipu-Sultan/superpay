export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(400, 'BAD_REQUEST', message, details);
  }

  static validation(message: string, details?: unknown): ApiError {
    return new ApiError(422, 'VALIDATION_ERROR', message, details);
  }

  static unauthorized(message = 'Please sign in to continue.'): ApiError {
    return new ApiError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'You do not have permission to do that.'): ApiError {
    return new ApiError(403, 'FORBIDDEN', message);
  }

  static notFound(message = 'The requested resource was not found.'): ApiError {
    return new ApiError(404, 'NOT_FOUND', message);
  }

  static conflict(message = 'That request conflicts with the current state.'): ApiError {
    return new ApiError(409, 'CONFLICT', message);
  }

  static rateLimited(message = 'Too many requests. Please try again later.'): ApiError {
    return new ApiError(429, 'RATE_LIMITED', message);
  }

  static serviceUnavailable(message = 'This service is temporarily unavailable. Please try again later.'): ApiError {
    return new ApiError(503, 'SERVICE_UNAVAILABLE', message);
  }
}
