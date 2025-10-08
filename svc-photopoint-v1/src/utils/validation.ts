export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ValidationUtils {
  static validateRequired(value: any, fieldName: string): string | null {
    if (value === undefined || value === null || value === '') {
      return `${fieldName} is required`;
    }
    return null;
  }

  static validateString(value: any, fieldName: string, minLength?: number, maxLength?: number): string | null {
    const requiredError = ValidationUtils.validateRequired(value, fieldName);
    if (requiredError) return requiredError;

    if (typeof value !== 'string') {
      return `${fieldName} must be a string`;
    }

    if (minLength && value.length < minLength) {
      return `${fieldName} must be at least ${minLength} characters long`;
    }

    if (maxLength && value.length > maxLength) {
      return `${fieldName} must be no more than ${maxLength} characters long`;
    }

    return null;
  }

  static validateEnum(value: any, enumValues: any[], fieldName: string): string | null {
    if (!enumValues.includes(value)) {
      return `${fieldName} must be one of: ${enumValues.join(', ')}`;
    }
    return null;
  }

  static validateNumber(value: any, fieldName: string, min?: number, max?: number): string | null {
    if (value !== undefined && value !== null) {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return `${fieldName} must be a valid number`;
      }

      if (min !== undefined && numValue < min) {
        return `${fieldName} must be at least ${min}`;
      }

      if (max !== undefined && numValue > max) {
        return `${fieldName} must be no more than ${max}`;
      }
    }

    return null;
  }

  static validateWebsite(data: any): ValidationResult {
    const errors: string[] = [];

    const nameError = ValidationUtils.validateString(data.name, 'name', 1, 255);
    if (nameError) errors.push(nameError);

    if (data.description !== undefined) {
      const descError = ValidationUtils.validateString(data.description, 'description', 0, 1000);
      if (descError) errors.push(descError);
    }

    if (data.domain !== undefined) {
      const domainError = ValidationUtils.validateString(data.domain, 'domain', 0, 255);
      if (domainError) errors.push(domainError);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validatePage(data: any): ValidationResult {
    const errors: string[] = [];

    const titleError = ValidationUtils.validateString(data.title, 'title', 1, 255);
    if (titleError) errors.push(titleError);

    const slugError = ValidationUtils.validateString(data.slug, 'slug', 1, 255);
    if (slugError) errors.push(slugError);

    // Validate slug format (URL-friendly)
    if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
      errors.push('slug must contain only lowercase letters, numbers, and hyphens');
    }

    if (data.description !== undefined) {
      const descError = ValidationUtils.validateString(data.description, 'description', 0, 1000);
      if (descError) errors.push(descError);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateComponent(data: any): ValidationResult {
    const errors: string[] = [];

    const componentTypeValues = [
      'hero', 'navigation', 'footer', 'text', 'heading', 'paragraph', 'list',
      'image', 'gallery', 'image_gallery', 'video', 'image_slider',
      'button', 'link', 'form', 'contact_form', 'newsletter_signup',
      'container', 'section', 'row', 'column',
      'spacer', 'divider', 'map', 'social_media', 'html',
      'shop_product', 'product_gallery', 'cart', 'checkout',
      'workshop_list', 'workshop_detail', 'booking_form'
    ];

    const typeError = ValidationUtils.validateEnum(data.componentType, componentTypeValues, 'componentType');
    if (typeError) errors.push(typeError);

    const orderError = ValidationUtils.validateNumber(data.sortOrder, 'sortOrder', 0);
    if (orderError) errors.push(orderError);

    // Validate componentData is valid JSON if provided
    if (data.componentData !== undefined && data.componentData !== null) {
      try {
        if (typeof data.componentData === 'string') {
          JSON.parse(data.componentData);
        }
      } catch (e) {
        errors.push('componentData must be valid JSON');
      }
    }

    // Validate styles is valid JSON if provided
    if (data.styles !== undefined && data.styles !== null) {
      try {
        if (typeof data.styles === 'string') {
          JSON.parse(data.styles);
        }
      } catch (e) {
        errors.push('styles must be valid JSON');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateTemplate(data: any): ValidationResult {
    const errors: string[] = [];

    const nameError = ValidationUtils.validateString(data.name, 'name', 1, 255);
    if (nameError) errors.push(nameError);

    const categoryError = ValidationUtils.validateString(data.category, 'category', 1, 100);
    if (categoryError) errors.push(categoryError);

    if (data.description !== undefined) {
      const descError = ValidationUtils.validateString(data.description, 'description', 0, 1000);
      if (descError) errors.push(descError);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public validationErrors: string[] = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, id?: string) {
    const message = id 
      ? `${resource} with id ${id} not found`
      : `${resource} not found`;
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}