import { TestBed } from '@angular/core/testing';
import { ConfirmationService } from './confirmation.service';

describe('ConfirmationService', () => {
  let service: ConfirmationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfirmationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('confirm', () => {
    it('should create a confirmation dialog with default values', async () => {
      const dialogPromise = service.confirm({
        title: 'Test Confirmation',
        message: 'Are you sure?'
      });

      const currentDialog = service.getCurrentDialog();
      expect(currentDialog).not.toBeNull();
      expect(currentDialog!.title).toBe('Test Confirmation');
      expect(currentDialog!.message).toBe('Are you sure?');
      expect(currentDialog!.confirmText).toBe('Confirm');
      expect(currentDialog!.cancelText).toBe('Cancel');
      expect(currentDialog!.type).toBe('info');

      // Confirm the dialog to resolve the promise
      service.confirmAction(true);
      const result = await dialogPromise;
      expect(result).toBe(true);
    });

    it('should create a confirmation dialog with custom values', async () => {
      const dialogPromise = service.confirm({
        title: 'Custom Title',
        message: 'Custom message',
        confirmText: 'Yes',
        cancelText: 'No',
        type: 'danger'
      });

      const currentDialog = service.getCurrentDialog();
      expect(currentDialog).not.toBeNull();
      expect(currentDialog!.title).toBe('Custom Title');
      expect(currentDialog!.message).toBe('Custom message');
      expect(currentDialog!.confirmText).toBe('Yes');
      expect(currentDialog!.cancelText).toBe('No');
      expect(currentDialog!.type).toBe('danger');

      // Cancel the dialog to resolve the promise
      service.confirmAction(false);
      const result = await dialogPromise;
      expect(result).toBe(false);
    });

    it('should resolve promise with true when confirmed', async () => {
      const dialogPromise = service.confirm({
        title: 'Test',
        message: 'Test message'
      });

      service.confirmAction(true);
      const result = await dialogPromise;
      expect(result).toBe(true);
    });

    it('should resolve promise with false when cancelled', async () => {
      const dialogPromise = service.confirm({
        title: 'Test',
        message: 'Test message'
      });

      service.confirmAction(false);
      const result = await dialogPromise;
      expect(result).toBe(false);
    });

    it('should clear dialog after confirmation', async () => {
      const dialogPromise = service.confirm({
        title: 'Test',
        message: 'Test message'
      });

      expect(service.getCurrentDialog()).not.toBeNull();
      
      service.confirmAction(true);
      await dialogPromise;
      
      expect(service.getCurrentDialog()).toBeNull();
    });

    it('should clear dialog after cancellation', async () => {
      const dialogPromise = service.confirm({
        title: 'Test',
        message: 'Test message'
      });

      expect(service.getCurrentDialog()).not.toBeNull();
      
      service.confirmAction(false);
      await dialogPromise;
      
      expect(service.getCurrentDialog()).toBeNull();
    });

    it('should handle multiple confirmations sequentially', async () => {
      // First confirmation
      const firstPromise = service.confirm({
        title: 'First',
        message: 'First message'
      });

      expect(service.getCurrentDialog()!.title).toBe('First');
      service.confirmAction(true);
      const firstResult = await firstPromise;
      expect(firstResult).toBe(true);

      // Second confirmation
      const secondPromise = service.confirm({
        title: 'Second',
        message: 'Second message'
      });

      expect(service.getCurrentDialog()!.title).toBe('Second');
      service.confirmAction(false);
      const secondResult = await secondPromise;
      expect(secondResult).toBe(false);
    });
  });

  describe('confirmAction', () => {
    it('should handle confirmAction when no dialog is active', () => {
      expect(service.getCurrentDialog()).toBeNull();
      
      // Should not throw error
      expect(() => service.confirmAction(true)).not.toThrow();
      expect(() => service.confirmAction(false)).not.toThrow();
      
      expect(service.getCurrentDialog()).toBeNull();
    });

    it('should only resolve once per dialog', async () => {
      const dialogPromise = service.confirm({
        title: 'Test',
        message: 'Test message'
      });

      service.confirmAction(true);
      const result = await dialogPromise;
      expect(result).toBe(true);

      // Subsequent calls should not affect anything
      service.confirmAction(false);
      expect(service.getCurrentDialog()).toBeNull();
    });
  });

  describe('confirmDelete', () => {
    it('should create a delete confirmation with default item type', async () => {
      const dialogPromise = service.confirmDelete('test-file.jpg');

      const currentDialog = service.getCurrentDialog();
      expect(currentDialog).not.toBeNull();
      expect(currentDialog!.title).toBe('Delete item');
      expect(currentDialog!.message).toBe('Are you sure you want to delete "test-file.jpg"? This action cannot be undone.');
      expect(currentDialog!.confirmText).toBe('Delete');
      expect(currentDialog!.cancelText).toBe('Cancel');
      expect(currentDialog!.type).toBe('danger');

      service.confirmAction(true);
      const result = await dialogPromise;
      expect(result).toBe(true);
    });

    it('should create a delete confirmation with custom item type', async () => {
      const dialogPromise = service.confirmDelete('My Photo Album', 'album');

      const currentDialog = service.getCurrentDialog();
      expect(currentDialog!.title).toBe('Delete album');
      expect(currentDialog!.message).toBe('Are you sure you want to delete "My Photo Album"? This action cannot be undone.');

      service.confirmAction(false);
      const result = await dialogPromise;
      expect(result).toBe(false);
    });

    it('should handle empty item names gracefully', async () => {
      const dialogPromise = service.confirmDelete('', 'file');

      const currentDialog = service.getCurrentDialog();
      expect(currentDialog!.message).toBe('Are you sure you want to delete ""? This action cannot be undone.');

      service.confirmAction(true);
      await dialogPromise;
    });
  });

  describe('confirmBulkDelete', () => {
    it('should create a bulk delete confirmation with default item type', async () => {
      const dialogPromise = service.confirmBulkDelete(5);

      const currentDialog = service.getCurrentDialog();
      expect(currentDialog).not.toBeNull();
      expect(currentDialog!.title).toBe('Delete items');
      expect(currentDialog!.message).toBe('Are you sure you want to delete 5 items? This action cannot be undone.');
      expect(currentDialog!.confirmText).toBe('Delete All');
      expect(currentDialog!.cancelText).toBe('Cancel');
      expect(currentDialog!.type).toBe('danger');

      service.confirmAction(true);
      const result = await dialogPromise;
      expect(result).toBe(true);
    });

    it('should create a bulk delete confirmation with custom item type', async () => {
      const dialogPromise = service.confirmBulkDelete(3, 'photos');

      const currentDialog = service.getCurrentDialog();
      expect(currentDialog!.title).toBe('Delete photos');
      expect(currentDialog!.message).toBe('Are you sure you want to delete 3 photos? This action cannot be undone.');

      service.confirmAction(false);
      const result = await dialogPromise;
      expect(result).toBe(false);
    });

    it('should handle singular count correctly', async () => {
      const dialogPromise = service.confirmBulkDelete(1, 'file');

      const currentDialog = service.getCurrentDialog();
      expect(currentDialog!.message).toBe('Are you sure you want to delete 1 file? This action cannot be undone.');

      service.confirmAction(true);
      await dialogPromise;
    });

    it('should handle zero count', async () => {
      const dialogPromise = service.confirmBulkDelete(0, 'items');

      const currentDialog = service.getCurrentDialog();
      expect(currentDialog!.message).toBe('Are you sure you want to delete 0 items? This action cannot be undone.');

      service.confirmAction(true);
      await dialogPromise;
    });
  });

  describe('signal reactivity', () => {
    it('should update signal when dialog is shown', () => {
      expect(service.getCurrentDialog()).toBeNull();

      service.confirm({
        title: 'Test',
        message: 'Test message'
      });

      expect(service.getCurrentDialog()).not.toBeNull();
    });

    it('should update signal when dialog is dismissed', async () => {
      const dialogPromise = service.confirm({
        title: 'Test',
        message: 'Test message'
      });

      expect(service.getCurrentDialog()).not.toBeNull();

      service.confirmAction(true);
      await dialogPromise;

      expect(service.getCurrentDialog()).toBeNull();
    });

    it('should replace current dialog when new one is shown', () => {
      service.confirm({
        title: 'First',
        message: 'First message'
      });

      expect(service.getCurrentDialog()!.title).toBe('First');

      service.confirm({
        title: 'Second',
        message: 'Second message'
      });

      expect(service.getCurrentDialog()!.title).toBe('Second');
    });
  });

  describe('error handling', () => {
    it('should handle rapid sequential confirmations', async () => {
      const promises = [
        service.confirm({ title: 'Test 1', message: 'Message 1' }),
        service.confirm({ title: 'Test 2', message: 'Message 2' }),
        service.confirm({ title: 'Test 3', message: 'Message 3' })
      ];

      // Only the last dialog should be visible
      expect(service.getCurrentDialog()!.title).toBe('Test 3');

      // Confirm the visible dialog
      service.confirmAction(true);

      // Wait for the promise resolution
      const resolved = await promises[2];
      expect(resolved).toBe(true);
      
      // The first two promises will remain pending (this is expected behavior)
    }, 10000); // Increase timeout to 10 seconds
  });
});
