import { Request, Response, NextFunction } from 'express';
import { ApiError, ValidationError, NotFoundError, UnauthorizedError, ForbiddenError } from '../utils/validation';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    validationErrors?: string[];
  };
  timestamp: string;
}

export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };
}

export function createErrorResponse(error: ApiError | Error): ApiResponse {
  let message = error.message;
  let code: string | undefined;
  let validationErrors: string[] | undefined;

  if (error instanceof ValidationError) {
    code = error.code;
    validationErrors = error.validationErrors;
  } else if (error instanceof ApiError) {
    code = error.code;
  }

  return {
    success: false,
    error: {
      message,
      code,
      validationErrors
    },
    timestamp: new Date().toISOString()
  };
}

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('API Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });

  let statusCode = 500;
  let apiError: ApiError;

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    apiError = error;
  } else {
    // Handle unexpected errors
    apiError = new ApiError('Internal server error', 500, 'INTERNAL_ERROR');
  }

  const response = createErrorResponse(apiError);
  res.status(statusCode).json(response);
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function validateRequest(validationFn: (data: any) => { isValid: boolean; errors: string[] }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const validation = validationFn(req.body);
    
    if (!validation.isValid) {
      throw new ValidationError('Validation failed', validation.errors);
    }
    
    next();
  };
}

// Middleware to ensure user owns the resource
export function ensureOwnership(getResourceOwnerId: (req: Request) => Promise<string>) {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id; // Assumes auth middleware sets req.user
    
    if (!userId) {
      throw new UnauthorizedError();
    }

    const resourceOwnerId = await getResourceOwnerId(req);
    
    if (resourceOwnerId !== userId) {
      throw new ForbiddenError('You do not have permission to access this resource');
    }

    next();
  });
}