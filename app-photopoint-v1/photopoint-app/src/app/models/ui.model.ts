/**
 * UI-related interfaces for components and services
 * These define UI state and interaction patterns
 */

export interface ConfirmationDialog {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export interface NotificationMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  duration?: number; // in milliseconds, 0 for permanent
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    primary?: boolean;
  }>;
}

export interface CSSFramework {
  baseCSS: string;
  componentCSS: { [componentType: string]: string };
  themeCSS: string;
}

export interface ApiError {
  error: string;
  message?: string;
  status?: number;
  code?: string;
  details?: any;
}