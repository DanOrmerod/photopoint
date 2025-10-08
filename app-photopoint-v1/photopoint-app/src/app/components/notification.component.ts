import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../services/notification.service';
import { NotificationMessage } from '../models';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      @for (notification of notificationService.getNotifications(); track notification.id) {
        <div class="notification" [class]="'notification-' + notification.type">
          <div class="notification-content">
            @if (notification.title) {
              <div class="notification-title">{{ notification.title }}</div>
            }
            <div class="notification-message">{{ notification.message }}</div>
          </div>
          
          @if (notification.actions && notification.actions.length > 0) {
            <div class="notification-actions">
              @for (action of notification.actions; track action.label) {
                <button 
                  (click)="action.action(); dismissNotification(notification.id)"
                  [class]="action.primary ? 'btn btn-primary' : 'btn btn-secondary'">
                  {{ action.label }}
                </button>
              }
            </div>
          }
          
          <button 
            class="notification-close" 
            (click)="dismissNotification(notification.id)"
            aria-label="Close notification">
            ×
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      max-width: 400px;
      pointer-events: none;
    }

    .notification {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      margin-bottom: 12px;
      padding: 16px;
      position: relative;
      pointer-events: all;
      border-left: 4px solid #e5e7eb;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .notification-success {
      border-left-color: #10b981;
      background-color: #f0fdf4;
    }

    .notification-warning {
      border-left-color: #f59e0b;
      background-color: #fffbeb;
    }

    .notification-error {
      border-left-color: #ef4444;
      background-color: #fef2f2;
    }

    .notification-info {
      border-left-color: #3b82f6;
      background-color: #f0f9ff;
    }

    .notification-title {
      font-weight: 600;
      margin-bottom: 4px;
      color: #374151;
    }

    .notification-message {
      color: #6b7280;
      line-height: 1.4;
      white-space: pre-line;
    }

    .notification-actions {
      margin-top: 12px;
      display: flex;
      gap: 8px;
    }

    .notification-close {
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      font-size: 20px;
      color: #9ca3af;
      cursor: pointer;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
    }

    .notification-close:hover {
      background-color: #f3f4f6;
      color: #374151;
    }

    .btn {
      padding: 6px 12px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      font-size: 14px;
    }

    .btn-primary {
      background-color: #3b82f6;
      border-color: #3b82f6;
      color: white;
    }

    .btn-primary:hover {
      background-color: #2563eb;
    }

    .btn-secondary:hover {
      background-color: #f9fafb;
    }
  `]
})
export class NotificationComponent {
  notificationService = inject(NotificationService);

  constructor() {
    // Debug: Log notifications changes
    effect(() => {
      const notifications = this.notificationService.getNotifications();
      console.log('Notifications updated:', notifications.length, notifications.map(n => n.id));
    });
  }

  dismissNotification(id: string): void {
    this.notificationService.dismiss(id);
  }
}
