import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageBuilderState } from '../../models/component-system';

@Component({
  selector: 'app-page-builder-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toolbar">
      
      <!-- Page Actions -->
      <div class="toolbar-section page-actions">
        <button 
          class="toolbar-btn"
          [disabled]="!canUndo"
          (click)="undo.emit()"
          title="Undo (Ctrl+Z)">
          <i class="icon-undo"></i>
        </button>
        
        <button 
          class="toolbar-btn"
          [disabled]="!canRedo"
          (click)="redo.emit()"
          title="Redo (Ctrl+Y)">
          <i class="icon-redo"></i>
        </button>
        
        <div class="toolbar-divider"></div>
        
        <button 
          class="toolbar-btn save-btn"
          [class.has-changes]="hasUnsavedChanges"
          (click)="save.emit()"
          title="Save (Ctrl+S)">
          <i class="icon-save"></i>
          <span>Save</span>
        </button>
        
        <button 
          class="toolbar-btn preview-btn"
          [class.active]="state.isPreviewMode"
          (click)="preview.emit()"
          title="Preview">
          <i class="icon-eye"></i>
          <span>Preview</span>
        </button>
        
        <button 
          class="toolbar-btn publish-btn"
          (click)="publish.emit()"
          title="Publish">
          <i class="icon-upload"></i>
          <span>Publish</span>
        </button>
      </div>

      <!-- View Controls -->
      <div class="toolbar-section view-controls">
        <div class="device-selector">
          <button 
            class="device-btn"
            [class.active]="state.viewMode === 'desktop'"
            (click)="viewModeChanged.emit('desktop')"
            title="Desktop View">
            <i class="icon-desktop"></i>
          </button>
          <button 
            class="device-btn"
            [class.active]="state.viewMode === 'tablet'"
            (click)="viewModeChanged.emit('tablet')"
            title="Tablet View">
            <i class="icon-tablet"></i>
          </button>
          <button 
            class="device-btn"
            [class.active]="state.viewMode === 'mobile'"
            (click)="viewModeChanged.emit('mobile')"
            title="Mobile View">
            <i class="icon-mobile"></i>
          </button>
        </div>
      </div>

      <!-- Canvas Controls -->
      <div class="toolbar-section canvas-controls">
        <div class="width-toggle">
          <button 
            class="toggle-btn"
            [class.active]="state.widthMode === 'container'"
            (click)="widthModeChanged.emit('container')"
            title="Container Width">
            <i class="icon-container"></i>
          </button>
          <button 
            class="toggle-btn"
            [class.active]="state.widthMode === 'full-width'"
            (click)="widthModeChanged.emit('full-width')"
            title="Full Width">
            <i class="icon-full-width"></i>
          </button>
        </div>
        
        <div class="zoom-controls">
          <button 
            class="zoom-btn"
            (click)="onZoomOut()"
            [disabled]="state.zoomLevel <= 25"
            title="Zoom Out">
            <i class="icon-zoom-out"></i>
          </button>
          
          <span class="zoom-level">{{ state.zoomLevel }}%</span>
          
          <button 
            class="zoom-btn"
            (click)="onZoomIn()"
            [disabled]="state.zoomLevel >= 200"
            title="Zoom In">
            <i class="icon-zoom-in"></i>
          </button>
          
          <button 
            class="zoom-btn"
            (click)="onZoomFit()"
            title="Fit to Width">
            <i class="icon-fit"></i>
          </button>
        </div>
      </div>

      <!-- Panel Controls -->
      <div class="toolbar-section panel-controls">
        <button 
          class="panel-btn"
          [class.active]="state.componentPanelVisible"
          (click)="toggleComponentPanel.emit()"
          title="Toggle Component Panel">
          <i class="icon-components"></i>
        </button>
        
        <button 
          class="panel-btn"
          [class.active]="state.propertyPanelVisible"
          (click)="togglePropertyPanel.emit()"
          title="Toggle Property Panel">
          <i class="icon-properties"></i>
        </button>
      </div>

      <!-- AI Assistant -->
      <div class="toolbar-section ai-controls">
        <button 
          class="ai-btn"
          (click)="openAiAssistant.emit()"
          title="Open AI Assistant">
          <i class="icon-ai"></i>
          <span>AI Assistant</span>
        </button>
      </div>

    </div>
  `,
  styleUrl: './page-builder-toolbar.component.scss'
})
export class PageBuilderToolbarComponent {
  @Input() state!: PageBuilderState;

  @Output() viewModeChanged = new EventEmitter<'desktop' | 'tablet' | 'mobile'>();
  @Output() widthModeChanged = new EventEmitter<'container' | 'full-width'>();
  @Output() zoomChanged = new EventEmitter<number>();
  @Output() undo = new EventEmitter<void>();
  @Output() redo = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() preview = new EventEmitter<void>();
  @Output() publish = new EventEmitter<void>();
  @Output() toggleComponentPanel = new EventEmitter<void>();
  @Output() togglePropertyPanel = new EventEmitter<void>();
  @Output() openAiAssistant = new EventEmitter<void>();

  private zoomLevels = [25, 50, 75, 100, 125, 150, 200];

  get canUndo(): boolean {
    return this.state.historyIndex > 0;
  }

  get canRedo(): boolean {
    return this.state.historyIndex < this.state.history.length - 1;
  }

  get hasUnsavedChanges(): boolean {
    return this.state.history.length > 0;
  }

  onZoomIn() {
    const currentIndex = this.zoomLevels.indexOf(this.state.zoomLevel);
    if (currentIndex < this.zoomLevels.length - 1) {
      const newZoom = this.zoomLevels[currentIndex + 1];
      this.zoomChanged.emit(newZoom);
    }
  }

  onZoomOut() {
    const currentIndex = this.zoomLevels.indexOf(this.state.zoomLevel);
    if (currentIndex > 0) {
      const newZoom = this.zoomLevels[currentIndex - 1];
      this.zoomChanged.emit(newZoom);
    }
  }

  onZoomFit() {
    // Fit to width logic - set to 100% for now
    this.zoomChanged.emit(100);
  }
}