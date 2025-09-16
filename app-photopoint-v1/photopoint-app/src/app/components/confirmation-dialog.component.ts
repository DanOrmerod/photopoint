import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationService } from '../services/confirmation.service';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss'
})
export class ConfirmationDialogComponent {
  confirmationService = inject(ConfirmationService);

  onConfirm(): void {
    this.confirmationService.confirmAction(true);
  }

  onCancel(): void {
    this.confirmationService.confirmAction(false);
  }

  getConfirmButtonClass(type?: string): string {
    switch (type) {
      case 'danger':
        return 'btn-danger';
      case 'warning':
        return 'btn-warning';
      default:
        return 'btn-primary';
    }
  }
}
