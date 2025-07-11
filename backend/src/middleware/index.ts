import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiResponse } from '@/types/amadeus';

/**
 * Middleware to handle validation errors from express-validator
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const response: ApiResponse = {
      success: false,
      error: 'Validation failed',
      data: errors.array(),
    };
    res.status(400).json(response);
    return;
  }
  
  next();
};

/**
 * Global error handler middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Global error handler:', error);

  // Amadeus API specific errors
  if (error.name === 'AmadeusAPIError') {
    const response: ApiResponse = {
      success: false,
      error: error.message,
    };
    res.status(400).json(response);
    return;
  }

  // Network timeout errors
  if (error.message.includes('timeout')) {
    const response: ApiResponse = {
      success: false,
      error: 'Request timeout - please try again',
    };
    res.status(408).json(response);
    return;
  }

  // Network errors
  if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
    const response: ApiResponse = {
      success: false,
      error: 'Service temporarily unavailable',
    };
    res.status(503).json(response);
    return;
  }

  // Default error response
  const response: ApiResponse = {
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
  };

  res.status(500).json(response);
};

/**
 * Middleware to log requests
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  
  if (Object.keys(req.query).length > 0) {
    console.log('Query params:', req.query);
  }
  
  next();
};

/**
 * Middleware to add security headers
 */
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};

/**
 * Middleware to handle 404 errors
 */
export const notFoundHandler = (
  req: Request,
  res: Response
): void => {
  const response: ApiResponse = {
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  };
  res.status(404).json(response);
};
