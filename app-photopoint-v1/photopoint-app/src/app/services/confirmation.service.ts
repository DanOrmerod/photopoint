import { Injectable, signal } from '@angular/core';

export interface ConfirmationDialog {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private currentDialog = signal<ConfirmationDialog | null>(null);
  private resolveFunction: ((result: boolean) => void) | null = null;

  getCurrentDialog = this.currentDialog.asReadonly();

  async confirm(dialog: ConfirmationDialog): Promise<boolean> {
    return new Promise((resolve) => {
      this.resolveFunction = resolve;
      this.currentDialog.set({
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'info',
        ...dialog
      });
    });
  }

  confirmAction(confirmed: boolean): void {
    if (this.resolveFunction) {
      this.resolveFunction(confirmed);
      this.resolveFunction = null;
    }
    this.currentDialog.set(null);
  }

  // Convenience methods for common confirmation types
  async confirmDelete(itemName: string, itemType: string = 'item'): Promise<boolean> {
    return this.confirm({
      title: `Delete ${itemType}`,
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
  }

  async confirmBulkDelete(count: number, itemType: string = 'items'): Promise<boolean> {
    return this.confirm({
      title: `Delete ${itemType}`,
      message: `Are you sure you want to delete ${count} ${itemType}? This action cannot be undone.`,
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      type: 'danger'
    });
  }
}
