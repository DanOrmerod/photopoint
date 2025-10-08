import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models';

export class ApiErrorHandler {
  /**
   * Extract error message from new API error format
   */
  static getErrorMessage(error: any): string {
    if (error instanceof HttpErrorResponse) {
      // Handle HTTP errors with new format: { error: 'message' }
      if (error.error?.error) {
        return error.error.error;
      }
      
      // Fallback for other HTTP errors
      if (error.error?.message) {
        return error.error.message;
      }
      
      // Generic HTTP error
      return `HTTP ${error.status}: ${error.statusText || 'Unknown error'}`;
    }
    
    // Handle direct error objects
    if (error?.error) {
      return error.error;
    }
    
    // Handle string errors
    if (typeof error === 'string') {
      return error;
    }
    
    // Handle Error objects
    if (error instanceof Error) {
      return error.message;
    }
    
    return 'An unexpected error occurred';
  }

  /**
   * Check if response indicates success (no error property)
   */
  static isSuccess(response: any): boolean {
    return response && !response.error;
  }

  /**
   * Check if response is an error (has error property)
   */
  static isError(response: any): boolean {
    return response && response.error;
  }
}
