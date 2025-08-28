import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseBlockData, BaseBlockComponent } from '../base-block.interface';

interface ButtonContent {
  text?: string;
  url?: string;
  target?: '_blank' | '_self';
  size?: 'small' | 'medium' | 'large';
  style?: 'primary' | 'secondary' | 'outline';
  alignment?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: string;
  padding?: string;
}

@Component({
  selector: 'app-button-block',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './button-block.component.html',
  styleUrls: ['./button-block.component.scss']
})
export class ButtonBlockComponent implements BaseBlockComponent {
  @Input() data!: BaseBlockData;
  @Input() isEditing = false;
  @Input() isSelected = false;
  @Input() isPreview = false;
  
  @Output() contentChange = new EventEmitter<any>();
  @Output() editingChange = new EventEmitter<boolean>();

  getContent(): ButtonContent {
    return this.data.content || {};
  }

  getButtonClasses(): string[] {
    const content = this.getContent();
    return [
      `size-${content.size || 'medium'}`,
      `style-${content.style || 'primary'}`
    ];
  }

  getButtonStyles() {
    const content = this.getContent();
    const styles: any = {};
    
    if (content.backgroundColor) {
      styles['background-color'] = content.backgroundColor;
    }
    
    if (content.textColor) {
      styles['color'] = content.textColor;
    }
    
    if (content.borderRadius) {
      styles['border-radius'] = content.borderRadius;
    }
    
    if (content.padding) {
      styles['padding'] = content.padding;
    }
    
    return styles;
  }

  startEditing() {
    if (!this.isPreview) {
      this.editingChange.emit(true);
    }
  }

  finishEditing() {
    this.editingChange.emit(false);
  }

  updateText(event: Event) {
    this.updateContent('text', (event.target as HTMLInputElement).value);
  }

  updateUrl(event: Event) {
    this.updateContent('url', (event.target as HTMLInputElement).value);
  }

  updateTarget(event: Event) {
    this.updateContent('target', (event.target as HTMLSelectElement).value as '_blank' | '_self');
  }

  updateSize(event: Event) {
    this.updateContent('size', (event.target as HTMLSelectElement).value as 'small' | 'medium' | 'large');
  }

  updateStyle(event: Event) {
    this.updateContent('style', (event.target as HTMLSelectElement).value as 'primary' | 'secondary' | 'outline');
  }

  updateAlignment(event: Event) {
    this.updateContent('alignment', (event.target as HTMLSelectElement).value as 'left' | 'center' | 'right');
  }

  updateBackgroundColor(event: Event) {
    this.updateContent('backgroundColor', (event.target as HTMLInputElement).value);
  }

  updateTextColor(event: Event) {
    this.updateContent('textColor', (event.target as HTMLInputElement).value);
  }

  private updateContent(field: keyof ButtonContent, value: any) {
    const content = { ...this.getContent(), [field]: value };
    this.contentChange.emit(content);
  }
}
