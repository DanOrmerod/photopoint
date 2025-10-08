import { Component, EventEmitter, Output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TemplateService } from '../../services/template.service';
import { Template } from '../../models';

@Component({
  selector: 'app-template-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './template-selector.component.html',
  styleUrls: ['./template-selector.component.scss']
})
export class TemplateSelectorComponent {
  private templateService = inject(TemplateService);

  @Output() templateSelected = new EventEmitter<Template>();
  @Output() close = new EventEmitter<void>();

  templates = signal(this.templateService.getTemplates());
  selectedCategory = signal<string>('all');
  searchTerm = signal<string>('');

  categories = computed(() => [
    'all',
    ...this.templateService.getCategories()
  ]);

  filteredTemplates = computed(() => {
    let filtered = this.templates();

    // Filter by category
    if (this.selectedCategory() !== 'all') {
      filtered = filtered.filter(t => t.category === this.selectedCategory());
    }

    // Filter by search term
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term) ||
        t.features.some(f => f.toLowerCase().includes(term))
      );
    }

    return filtered;
  });

  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  selectTemplate(template: Template): void {
    this.templateSelected.emit(template);
  }

  onClose(): void {
    this.close.emit();
  }

  getTemplatePreview(template: Template): string {
    return this.templateService.generateTemplatePreview(template);
  }

  getCategoryDisplayName(category: string): string {
    if (category === 'all') return 'All Templates';
    return category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
  }
}
