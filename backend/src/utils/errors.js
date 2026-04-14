// src/utils/errors.js
// Standardized Error Handling System
// Kullanım: throw new ValidationError('message')

/**
 * Base Custom Error Class
 * Tüm custom error'lar buradan extend edilir
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.timestamp = new Date().toISOString();

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  // JSON response format
  toJSON() {
    return {
      success: false,
      error: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
    };
  }
}

// ===================================
// Specific Error Classes
// ===================================

/**
 * 400 Bad Request - Input validation errors
 */
class ValidationError extends AppError {
  constructor(message, code = 'VALIDATION_ERROR') {
    super(message, 400, code);
  }
}

/**
 * 401 Unauthorized - Authentication errors
 */
class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed', code = 'AUTH_FAILED') {
    super(message, 401, code);
  }
}

/**
 * 403 Forbidden - Authorization errors
 */
class AuthorizationError extends AppError {
  constructor(message = 'Access denied', code = 'ACCESS_DENIED') {
    super(message, 403, code);
  }
}

/**
 * 404 Not Found
 */
class NotFoundError extends AppError {
  constructor(resource = 'Resource', code = 'NOT_FOUND') {
    super(`${resource} not found`, 404, code);
  }
}

/**
 * 409 Conflict - Duplicate or conflict errors
 */
class ConflictError extends AppError {
  constructor(message, code = 'CONFLICT') {
    super(message, 409, code);
  }
}

/**
 * 429 Too Many Requests - Rate limiting
 */
class RateLimitError extends AppError {
  constructor(message = 'Too many requests', code = 'RATE_LIMIT') {
    super(message, 429, code);
  }
}

/**
 * 500 Internal Server Error - Unexpected errors
 */
class InternalError extends AppError {
  constructor(message = 'Internal server error', code = 'INTERNAL_ERROR') {
    super(message, 500, code);
  }
}

/**
 * 503 Service Unavailable - Database/service errors
 */
class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable', code = 'SERVICE_UNAVAILABLE') {
    super(message, 503, code);
  }
}

// ===================================
// Error Handler Decorator
// Automatically catches and handles errors
// ===================================
const asyncHandler = (fn) => {
  return async (req, reply) => {
    try {
      return await fn(req, reply);
    } catch (err) {
      // If already an AppError, just throw it
      if (err instanceof AppError) {
        throw err;
      }

      // Log unexpected errors
      console.error('Unexpected error:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });

      // Convert to InternalError
      throw new InternalError('An unexpected error occurred');
    }
  };
};

// ===================================
// Global Error Handler (Fastify Hook)
// ===================================
const setupErrorHandler = (fastify) => {
  fastify.setErrorHandler((err, request, reply) => {
    // Log all errors
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      statusCode: err.statusCode || 500,
      error: err.message,
      code: err.code || 'UNKNOWN',
      userId: request.user?.id || 'anonymous'
    };

    if (process.env.NODE_ENV === 'development') {
      console.error('[ERROR]', JSON.stringify(logEntry, null, 2));
      console.error('Stack:', err.stack);
    } else {
      console.error('[ERROR]', JSON.stringify(logEntry));
    }

    // AppError: Standardized response
    if (err instanceof AppError) {
      return reply.status(err.statusCode).send(err.toJSON());
    }

    // PostgreSQL Errors
    if (err.code === '23505') {
      // Unique constraint violation
      return reply.status(409).send({
        success: false,
        error: 'Resource already exists',
        code: 'DUPLICATE_ENTRY',
        statusCode: 409,
        timestamp: new Date().toISOString()
      });
    }

    if (err.code === '23503') {
      // Foreign key constraint violation
      return reply.status(400).send({
        success: false,
        error: 'Invalid reference to related resource',
        code: 'INVALID_REFERENCE',
        statusCode: 400,
        timestamp: new Date().toISOString()
      });
    }

    // Database connection errors
    if (err.message?.includes('connection') || err.message?.includes('pool')) {
      return reply.status(503).send({
        success: false,
        error: 'Database service temporarily unavailable',
        code: 'DB_UNAVAILABLE',
        statusCode: 503,
        timestamp: new Date().toISOString()
      });
    }

    // Default: 500 Internal Error
    return reply.status(500).send({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { message: err.message })
    });
  });
};

module.exports = {
  // Error Classes
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalError,
  ServiceUnavailableError,

  // Utilities
  asyncHandler,
  setupErrorHandler
};