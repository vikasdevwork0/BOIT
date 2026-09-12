import { Request, Response, NextFunction } from 'express';

export interface AppCustomError extends Error {
  status?: number;
  code?: string;
}

export function errorHandler(
  err: AppCustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err.status || 500;
  const code = err.code || (status === 400 ? 'VALIDATION_ERROR' : status === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR');

  let safeMessage = err.message || 'An unexpected internal server error occurred.';
  
  // Strip sensitive details (absolute paths, API keys) from public error messages
  safeMessage = safeMessage
    .replace(/\/Users\/[^\s:]+/g, '[sanitized-path]')
    .replace(/\/home\/[^\s:]+/g, '[sanitized-path]')
    .replace(/C:\\[^\s:]+/gi, '[sanitized-path]')
    .replace(/sk-[a-zA-Z0-9_-]{20,}/g, '[REDACTED_API_KEY]');

  return res.status(status).json({
    error: {
      code,
      message: safeMessage,
    },
  });
}
