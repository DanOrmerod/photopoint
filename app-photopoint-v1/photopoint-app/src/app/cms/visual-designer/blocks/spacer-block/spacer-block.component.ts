import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseBlockData, BaseBlockComponent } from '../base-block.interface';

interface SpacerContent {
  height?: string;
}

@Component({
  selector: 'app-spacer-block',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './spacer-block.component.html',
  styleUrls: ['./spacer-block.component.scss']
})
export class SpacerBlockComponent implements BaseBlockComponent {
  @Input() data!: BaseBlockData;
  @Input() isEditing = false;
  @Input() isSelected = false;
  @Input() isPreview = false;
  
  @Output() contentChange = new EventEmitter<any>();
  @Output() editingChange = new EventEmitter<boolean>();

  getContent(): SpacerContent {
    return this.data.content || {};
  }

  startEditing() {
    if (!this.isPreview) {
      this.editingChange.emit(true);
    }
  }

  finishEditing() {
    this.editingChange.emit(false);
  }

  updateHeight(event: Event) {
    const height = (event.target as HTMLInputElement).value;
    this.contentChange.emit({
      ...this.getContent(),
      height
    });
  }
}
