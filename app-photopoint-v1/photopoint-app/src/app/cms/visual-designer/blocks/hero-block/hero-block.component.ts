import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseBlockData, BaseBlockComponent } from '../base-block.interface';

interface HeroContent {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonUrl?: string;
  backgroundImage?: string;
}

@Component({
  selector: 'app-hero-block',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hero-block.component.html',
  styleUrls: ['./hero-block.component.scss']
})
export class HeroBlockComponent implements BaseBlockComponent {
  @Input() data!: BaseBlockData;
  @Input() isEditing = false;
  @Input() isSelected = false;
  @Input() isPreview = false;
  
  @Output() contentChange = new EventEmitter<any>();
  @Output() editingChange = new EventEmitter<boolean>();

  constructor(private sanitizer: DomSanitizer) {}

  getContent(): HeroContent {
    return this.data.content || {};
  }

  getHeroStyles() {
    const styles = { ...this.data.styles };
    const content = this.getContent();
    
    if (content.backgroundImage) {
      styles['background-image'] = `url('${content.backgroundImage}')`;
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

  updateTitle(event: Event) {
    this.updateContent('title', (event.target as HTMLInputElement).value);
  }

  updateSubtitle(event: Event) {
    this.updateContent('subtitle', (event.target as HTMLTextAreaElement).value);
  }

  updateButtonText(event: Event) {
    this.updateContent('buttonText', (event.target as HTMLInputElement).value);
  }

  updateButtonUrl(event: Event) {
    this.updateContent('buttonUrl', (event.target as HTMLInputElement).value);
  }

  updateBackgroundImage(event: Event) {
    this.updateContent('backgroundImage', (event.target as HTMLInputElement).value);
  }

  private updateContent(field: keyof HeroContent, value: string) {
    const content = { ...this.getContent(), [field]: value };
    this.contentChange.emit(content);
  }
}
