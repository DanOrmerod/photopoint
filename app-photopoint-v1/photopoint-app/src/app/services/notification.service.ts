import { Injectable, signal } from '@angular/core';

export interface NotificationMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  duration?: number; // in milliseconds, 0 for permanent
  actions?: Array<{
    label: string;
    action: () => void;
    primary?: boolean;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = signal<NotificationMessage[]>([]);
  
  getNotifications = this.notifications.asReadonly();

  show(notification: Omit<NotificationMessage, 'id'>): string {
    const id = this.generateId();
    const defaultDuration = 5000; // Default 5 seconds
    const duration = notification.duration !== undefined ? notification.duration : defaultDuration;
    
    const fullNotification: NotificationMessage = {
      id,
      duration,
      ...notification
    };

    this.notifications.update(notifications => [...notifications, fullNotification]);

    // Auto-dismiss after duration (unless duration is 0)
    if (duration > 0) {
      console.log(`Setting auto-dismiss for notification ${id} in ${duration}ms`);
      setTimeout(() => {
        console.log(`Auto-dismissing notification ${id}`);
        this.dismiss(id);
      }, duration);
    }

    return id;
  }

  success(message: string, title?: string, duration?: number): string {
    return this.show({
      type: 'success',
      title,
      message,
      duration
    });
  }

  warning(message: string, title?: string, duration?: number): string {
    return this.show({
      type: 'warning',
      title,
      message,
      duration
    });
  }

  error(message: string, title?: string, duration?: number): string {
    return this.show({
      type: 'error',
      title,
      message,
      duration: duration !== undefined ? duration : 0 // Errors don't auto-dismiss by default
    });
  }

  info(message: string, title?: string, duration?: number): string {
    return this.show({
      type: 'info',
      title,
      message,
      duration
    });
  }

  dismiss(id: string): void {
    console.log(`Dismissing notification ${id}`);
    this.notifications.update(notifications => 
      notifications.filter(n => n.id !== id)
    );
  }

  dismissAll(): void {
    this.notifications.set([]);
  }

  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
