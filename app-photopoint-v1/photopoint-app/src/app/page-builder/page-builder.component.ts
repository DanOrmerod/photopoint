import { Component, OnInit, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PageBuilderState, WebsitePage, PageComponent, ComponentType, ViewMode, WidthMode } from '../models/component-system';
import { PageBuilderService } from '../services/page-builder.service';
import { PageBuilderToolbarComponent } from './components/page-builder-toolbar.component';
import { ComponentPanelComponent } from './components/component-panel.component';
import { PageBuilderCanvasComponent } from './components/page-builder-canvas.component';
import { PropertyPanelComponent } from './components/property-panel.component';

@Component({
  selector: 'app-page-builder',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    PageBuilderToolbarComponent,
    ComponentPanelComponent,
    PageBuilderCanvasComponent,
    PropertyPanelComponent
  ],
  template: `
    <!-- Page Builder Interface -->
    <div class="page-builder" [class.preview-mode]="state().isPreviewMode">
      
      <!-- Top Toolbar -->
      <app-page-builder-toolbar
        [state]="state()"
        (viewModeChanged)="onViewModeChanged($event)"
        (widthModeChanged)="onWidthModeChanged($event)"
        (zoomChanged)="onZoomChanged($event)"
        (undo)="onUndo()"
        (redo)="onRedo()"
        (save)="onSave()"
        (preview)="onPreview()"
        (publish)="onPublish()"
        (toggleComponentPanel)="onToggleComponentPanel()"
        (togglePropertyPanel)="onTogglePropertyPanel()"
        (openAiAssistant)="onOpenAiAssistant()"
        class="page-builder__toolbar">
      </app-page-builder-toolbar>

      <!-- Main Content Area -->
      <div class="page-builder__main">
        
        <!-- Left Component Panel -->
        <app-component-panel
          *ngIf="state().componentPanelVisible && !state().isPreviewMode"
          [visible]="state().componentPanelVisible"
          (componentDragStart)="onComponentDragStart($event)"
          class="page-builder__component-panel">
        </app-component-panel>

        <!-- Center Canvas Area -->
        <div class="page-builder__canvas-container">
          <app-page-builder-canvas
            [state]="state()"
            [page]="state().currentPage"
            [viewMode]="state().viewMode"
            [widthMode]="state().widthMode"
            [zoomLevel]="state().zoomLevel"
            [selectedComponent]="state().selectedComponent"
            (componentSelected)="onComponentSelected($event)"
            (componentDropped)="onComponentDropped($event)"
            (componentUpdated)="onComponentUpdated($event)"
            (componentDeleted)="onComponentDeleted($event)"
            class="page-builder__canvas">
          </app-page-builder-canvas>
        </div>

        <!-- Right Property Panel -->
        <app-property-panel
          *ngIf="state().propertyPanelVisible && !state().isPreviewMode"
          [visible]="state().propertyPanelVisible"
          [selectedComponent]="state().selectedComponent"
          [page]="state().currentPage"
          (componentUpdated)="onComponentUpdated($event)"
          (pageUpdated)="onPageUpdated($event)"
          class="page-builder__property-panel">
        </app-property-panel>

      </div>

      <!-- AI Assistant Sliding Panel -->
      <div class="ai-assistant-panel" [class.open]="aiAssistantOpen()">
        <!-- AI Assistant content will be implemented in future iteration -->
        <div class="ai-assistant-header">
          <h3>AI Assistant</h3>
          <button (click)="onCloseAiAssistant()" class="close-btn">×</button>
        </div>
        <div class="ai-assistant-content">
          <p>AI Assistant integration coming soon...</p>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div *ngIf="loading()" class="page-builder__loading">
        <div class="loading-spinner"></div>
        <p>Loading page builder...</p>
      </div>

    </div>
  `,
  styleUrl: './page-builder.component.scss'
})
export class PageBuilderComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private pageBuilderService = inject(PageBuilderService);

  // Use service state instead of local state
  state = this.pageBuilderService.state;
  loading = signal(false);
  aiAssistantOpen = signal(false);

  // Computed values from service
  canUndo = this.pageBuilderService.canUndo;
  canRedo = this.pageBuilderService.canRedo;
  hasUnsavedChanges = computed(() => this.state().isDirty);

  ngOnInit() {
    // Load page data from route
    this.route.paramMap.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(params => {
      const websiteId = params.get('id');
      const pageId = params.get('pageId');
      
      if (websiteId && pageId) {
        this.loadPage(websiteId, pageId);
      }
    });

    // Set up keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  private loadPage(websiteId: string, pageId: string) {
    this.loading.set(true);
    
    this.pageBuilderService.loadPage(websiteId, pageId).subscribe({
      next: (page) => {
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load page:', error);
        this.loading.set(false);
      }
    });
  }

  private setupKeyboardShortcuts() {
    // TODO: Implement keyboard shortcuts
    // Ctrl+Z for undo, Ctrl+Y for redo, Ctrl+S for save, etc.
  }

  // Event handlers - delegate to service
  onViewModeChanged(mode: ViewMode) {
    this.pageBuilderService.setViewMode(mode);
  }

  onWidthModeChanged(mode: WidthMode) {
    this.pageBuilderService.setWidthMode(mode);
  }

  onZoomChanged(level: number) {
    this.pageBuilderService.setZoomLevel(level);
  }

  onUndo() {
    this.pageBuilderService.undo();
  }

  onRedo() {
    this.pageBuilderService.redo();
  }

  onSave() {
    this.pageBuilderService.savePage().subscribe({
      next: (page) => {
        console.log('Page saved successfully:', page);
      },
      error: (error) => {
        console.error('Failed to save page:', error);
      }
    });
  }

  onPreview() {
    this.pageBuilderService.togglePreviewMode();
  }

  onPublish() {
    // TODO: Implement publish functionality
    console.log('Publishing page...');
  }

  onToggleComponentPanel() {
    this.pageBuilderService.toggleComponentPanel();
  }

  onTogglePropertyPanel() {
    this.pageBuilderService.togglePropertyPanel();
  }

  onOpenAiAssistant() {
    this.aiAssistantOpen.set(true);
  }

  onCloseAiAssistant() {
    this.aiAssistantOpen.set(false);
  }

  // Component management
  onComponentDragStart(componentType: ComponentType) {
    // Component drag is handled by CDK drag-drop
  }

  onComponentSelected(component: PageComponent | null) {
    this.pageBuilderService.selectComponent(component);
  }

  onComponentDropped(event: {
    componentType?: ComponentType;
    sourceComponent?: PageComponent;
    targetIndex: number;
    position: { x: number; y: number };
  }) {
    if (event.componentType) {
      // Adding new component
      this.pageBuilderService.addComponent(event.componentType, event.position, event.targetIndex);
    }
    // Moving existing components is handled by the canvas component internally
  }

  onComponentUpdated(component: PageComponent) {
    this.pageBuilderService.updateComponent(component);
  }

  onComponentDeleted(componentId: string) {
    this.pageBuilderService.deleteComponent(componentId);
  }

  onPageUpdated(page: WebsitePage) {
    // TODO: Implement page update through service
    console.log('Page updated:', page);
  }
}