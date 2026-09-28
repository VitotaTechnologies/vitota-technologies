export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const Errors = {
  unauthorized: () => new AppError('UNAUTHORIZED', 'Authentication required.', 401),
  forbidden: () => new AppError('FORBIDDEN', 'You do not have permission.', 403),
  notFound: (what = 'Resource') => new AppError('NOT_FOUND', `${what} not found.`, 404),
  conflict: (msg = 'Conflict') => new AppError('CONFLICT', msg, 409),
  validation: (details?: unknown) =>
    new AppError('VALIDATION_ERROR', 'Invalid request.', 422, details),
  rateLimited: () => new AppError('RATE_LIMITED', 'Too many requests.', 429),
  internal: () => new AppError('INTERNAL_ERROR', 'Something went wrong.', 500),
};