import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('show', () => {
    it('should create a notification with default duration', () => {
      const notificationData = {
        message: 'Test notification',
        type: 'info' as const
      };

      const id = service.show(notificationData);

      expect(service.getNotifications().length).toBe(1);
      expect(service.getNotifications()[0].message).toBe(notificationData.message);
      expect(service.getNotifications()[0].type).toBe(notificationData.type);
      expect(service.getNotifications()[0].duration).toBe(5000);
      expect(id).toBeDefined();
    });

    it('should create a notification with custom duration', () => {
      const notificationData = {
        message: 'Custom duration notification',
        type: 'success' as const,
        duration: 3000
      };

      service.show(notificationData);

      expect(service.getNotifications().length).toBe(1);
      expect(service.getNotifications()[0].duration).toBe(3000);
    });

    it('should create a notification with no auto-dismiss when duration is 0', () => {
      const notificationData = {
        message: 'Persistent notification',
        type: 'error' as const,
        duration: 0
      };

      service.show(notificationData);

      expect(service.getNotifications().length).toBe(1);
      expect(service.getNotifications()[0].duration).toBe(0);
    });

    it('should auto-dismiss notification after duration', (done) => {
      const notificationData = {
        message: 'Auto-dismiss notification',
        type: 'warning' as const,
        duration: 100 // Short duration for testing
      };

      service.show(notificationData);

      expect(service.getNotifications().length).toBe(1);

      // Check that notification is dismissed after duration
      setTimeout(() => {
        expect(service.getNotifications().length).toBe(0);
        done();
      }, 150); // Add buffer time
    });

    it('should not auto-dismiss when duration is 0', (done) => {
      const notificationData = {
        message: 'Persistent notification',
        type: 'info' as const,
        duration: 0
      };

      service.show(notificationData);

      expect(service.getNotifications().length).toBe(1);

      // Check that notification is still there after some time
      setTimeout(() => {
        expect(service.getNotifications().length).toBe(1);
        done();
      }, 200);
    });

    it('should handle multiple notifications', () => {
      service.show({ message: 'First notification', type: 'info' });
      service.show({ message: 'Second notification', type: 'success' });
      service.show({ message: 'Third notification', type: 'error' });

      expect(service.getNotifications().length).toBe(3);
      expect(service.getNotifications()[0].message).toBe('First notification');
      expect(service.getNotifications()[1].message).toBe('Second notification');
      expect(service.getNotifications()[2].message).toBe('Third notification');
    });

    it('should assign unique IDs to notifications', () => {
      const id1 = service.show({ message: 'First notification', type: 'info' });
      const id2 = service.show({ message: 'Second notification', type: 'success' });

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it('should support notification with title', () => {
      const notificationData = {
        message: 'Test notification',
        type: 'info' as const,
        title: 'Test Title'
      };

      service.show(notificationData);

      expect(service.getNotifications()[0].title).toBe('Test Title');
    });

    it('should support notification with actions', () => {
      const mockAction = jasmine.createSpy('mockAction');
      const notificationData = {
        message: 'Test notification',
        type: 'info' as const,
        actions: [{
          label: 'Test Action',
          action: mockAction,
          primary: true
        }]
      };

      service.show(notificationData);

      const notification = service.getNotifications()[0];
      expect(notification.actions).toBeDefined();
      expect(notification.actions![0].label).toBe('Test Action');
      expect(notification.actions![0].primary).toBe(true);
    });
  });

  describe('dismiss', () => {
    it('should remove specific notification by ID', () => {
      const id1 = service.show({ message: 'First notification', type: 'info' });
      const id2 = service.show({ message: 'Second notification', type: 'success' });
      
      expect(service.getNotifications().length).toBe(2);
      
      service.dismiss(id1);
      
      const remainingNotifications = service.getNotifications();
      expect(remainingNotifications.length).toBe(1);
      expect(remainingNotifications[0].message).toBe('Second notification');
    });

    it('should not affect other notifications when dismissing one', () => {
      const id1 = service.show({ message: 'First notification', type: 'info' });
      const id2 = service.show({ message: 'Second notification', type: 'success' });
      const id3 = service.show({ message: 'Third notification', type: 'error' });
      
      service.dismiss(id2);
      
      const remainingNotifications = service.getNotifications();
      expect(remainingNotifications.length).toBe(2);
      expect(remainingNotifications[0].message).toBe('First notification');
      expect(remainingNotifications[1].message).toBe('Third notification');
    });

    it('should handle dismissing non-existent notification gracefully', () => {
      service.show({ message: 'Test notification', type: 'info' });
      
      expect(service.getNotifications().length).toBe(1);
      
      service.dismiss('non-existent-id');
      
      expect(service.getNotifications().length).toBe(1);
    });

    it('should handle dismissing from empty notifications list', () => {
      expect(service.getNotifications().length).toBe(0);
      
      service.dismiss('any-id');
      
      expect(service.getNotifications().length).toBe(0);
    });
  });

  describe('dismissAll', () => {
    it('should remove all notifications', () => {
      service.show({ message: 'First notification', type: 'info' });
      service.show({ message: 'Second notification', type: 'success' });
      service.show({ message: 'Third notification', type: 'error' });
      
      expect(service.getNotifications().length).toBe(3);
      
      service.dismissAll();
      
      expect(service.getNotifications().length).toBe(0);
    });

    it('should handle clearing empty notifications list', () => {
      expect(service.getNotifications().length).toBe(0);
      
      service.dismissAll();
      
      expect(service.getNotifications().length).toBe(0);
    });
  });

  describe('convenience methods', () => {
    it('should create success notification', () => {
      service.success('Success message');
      
      const notification = service.getNotifications()[0];
      expect(notification.message).toBe('Success message');
      expect(notification.type).toBe('success');
    });

    it('should create success notification with title and duration', () => {
      service.success('Success message', 'Success Title', 3000);
      
      const notification = service.getNotifications()[0];
      expect(notification.message).toBe('Success message');
      expect(notification.title).toBe('Success Title');
      expect(notification.type).toBe('success');
      expect(notification.duration).toBe(3000);
    });

    it('should create error notification', () => {
      service.error('Error message');
      
      const notification = service.getNotifications()[0];
      expect(notification.message).toBe('Error message');
      expect(notification.type).toBe('error');
      expect(notification.duration).toBe(0); // Errors don't auto-dismiss by default
    });

    it('should create error notification with custom duration', () => {
      service.error('Error message', 'Error Title', 5000);
      
      const notification = service.getNotifications()[0];
      expect(notification.duration).toBe(5000);
    });

    it('should create warning notification', () => {
      service.warning('Warning message');
      
      const notification = service.getNotifications()[0];
      expect(notification.message).toBe('Warning message');
      expect(notification.type).toBe('warning');
    });

    it('should create info notification', () => {
      service.info('Info message');
      
      const notification = service.getNotifications()[0];
      expect(notification.message).toBe('Info message');
      expect(notification.type).toBe('info');
    });
  });

  describe('auto-dismiss timing', () => {
    it('should respect custom duration in convenience methods', (done) => {
      const duration = 100;
      service.success('Success message', 'Title', duration);
      
      expect(service.getNotifications().length).toBe(1);
      
      setTimeout(() => {
        expect(service.getNotifications().length).toBe(0);
        done();
      }, duration + 50);
    });

    it('should not auto-dismiss error notifications by default', (done) => {
      service.error('Error message');
      
      expect(service.getNotifications().length).toBe(1);
      
      setTimeout(() => {
        expect(service.getNotifications().length).toBe(1);
        done();
      }, 200);
    });
  });

  describe('signal reactivity', () => {
    it('should update signal when notification is added', () => {
      const initialLength = service.getNotifications().length;
      
      service.show({ message: 'Test notification', type: 'info' });
      
      expect(service.getNotifications().length).toBe(initialLength + 1);
    });

    it('should update signal when notification is dismissed', () => {
      const id = service.show({ message: 'Test notification', type: 'info' });
      
      service.dismiss(id);
      
      expect(service.getNotifications().length).toBe(0);
    });

    it('should update signal when all notifications are dismissed', () => {
      service.show({ message: 'First notification', type: 'info' });
      service.show({ message: 'Second notification', type: 'success' });
      
      service.dismissAll();
      
      expect(service.getNotifications().length).toBe(0);
    });
  });
});
