import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseBlockData, BaseBlockComponent } from '../base-block.interface';

@Component({
  selector: 'app-text-block',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './text-block.component.html',
  styleUrls: ['./text-block.component.scss']
})
export class TextBlockComponent implements BaseBlockComponent {
  @Input() data!: BaseBlockData;
  @Input() isEditing = false;
  @Input() isSelected = false;
  @Input() isPreview = false;
  
  @Output() contentChange = new EventEmitter<any>();
  @Output() editingChange = new EventEmitter<boolean>();

  constructor(private sanitizer: DomSanitizer) {}

  getDisplayContent(): SafeHtml {
    const content = this.data.content || '<p>Click to edit text</p>';
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  startEditing() {
    if (!this.isPreview) {
      this.editingChange.emit(true);
    }
  }

  finishEditing() {
    this.editingChange.emit(false);
  }

  onTextInput(event: Event) {
    const target = event.target as HTMLElement;
    const content = target.innerHTML;
    this.contentChange.emit(content);
  }

  formatText(command: string, value?: string) {
    document.execCommand(command, false, value);
  }

  promptForUrl(): string {
    return prompt('Enter URL:') || '';
  }
}
