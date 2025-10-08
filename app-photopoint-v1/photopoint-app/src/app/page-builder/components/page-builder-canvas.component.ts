import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { ComponentRendererComponent } from './component-renderer.component';
import { ConfirmationService } from '../../services/confirmation.service';
import { 
  WebsitePage, 
  PageComponent, 
  ComponentType, 
  PageBuilderState 
} from '../../models/component-system';

@Component({
  selector: 'app-page-builder-canvas',
  standalone: true,
  imports: [CommonModule, CdkDropList, CdkDrag, ComponentRendererComponent],
  template: `
    <div class="canvas-wrapper">
      
      <!-- Canvas Header with Page Info -->
      <div class="canvas-header" *ngIf="page">
        <div class="page-info">
          <h2>{{ page.title }}</h2>
          <span class="page-slug">/{{ page.slug }}</span>
        </div>
        <div class="canvas-controls">
          <div class="device-frame" [class]="'device-' + viewMode">
            <!-- Device frame styling based on viewMode -->
          </div>
        </div>
      </div>

      <!-- Main Canvas Area -->
      <div class="canvas-container" 
           [style.zoom]="zoomLevel / 100"
           [class]="'view-' + viewMode + ' width-' + widthMode">
        
        <!-- Page Canvas -->
        <div class="page-canvas"
             cdkDropList
             [cdkDropListData]="components()"
             (cdkDropListDropped)="onComponentDropped($event)"
             [class.empty]="components().length === 0">
          
          <!-- Empty State -->
          <div class="empty-state" *ngIf="components().length === 0">
            <div class="empty-icon">🎨</div>
            <h3>Start Building Your Page</h3>
            <p>Drag components from the left panel to start designing your page</p>
          </div>

          <!-- Page Components -->
          <div *ngFor="let component of components(); trackBy: trackByComponentId"
               class="component-wrapper"
               [class.selected]="selectedComponent?.id === component.id"
               [class.locked]="component.isLocked"
               [class.hidden]="!component.isVisible"
               cdkDrag
               [cdkDragData]="component"
               (click)="selectComponent(component)"
               (cdkDragStarted)="onDragStart(component)"
               (cdkDragEnded)="onDragEnd()">
            
            <!-- Component Render -->
            <app-component-renderer
              [component]="component"
              [viewMode]="viewMode"
              [isSelected]="selectedComponent?.id === component.id"
              [isEditing]="false"
              (componentUpdated)="onComponentUpdated(component)"
              (imageClicked)="onImageClicked($event)">
            </app-component-renderer>

            <!-- Component Controls (when selected) -->
            <div class="component-controls" *ngIf="selectedComponent?.id === component.id">
              <button class="control-btn edit-btn" 
                      (click)="editComponent(component)" 
                      title="Edit Component">
                ⚙️
              </button>
              <button class="control-btn move-up-btn"
                      (click)="moveComponentUp(component)"
                      [disabled]="isFirstComponent(component)"
                      title="Move Up">
                ↑
              </button>
              <button class="control-btn move-down-btn"
                      (click)="moveComponentDown(component)"
                      [disabled]="isLastComponent(component)"
                      title="Move Down">
                ↓
              </button>
              <button class="control-btn duplicate-btn"
                      (click)="duplicateComponent(component)"
                      title="Duplicate">
                📋
              </button>
              <button class="control-btn delete-btn"
                      (click)="deleteComponent(component)"
                      title="Delete">
                🗑️
              </button>
            </div>

            <!-- Drag Handle -->
            <div class="drag-handle" cdkDragHandle>
              <div class="drag-dots">⋮⋮</div>
            </div>

          </div>

          <!-- Drop Zone Indicators -->
          <div class="drop-zone" 
               *ngFor="let zone of dropZones(); let i = index"
               [style.top.px]="zone.y"
               [class.active]="zone.active">
            <div class="drop-line"></div>
            <span class="drop-text">Drop component here</span>
          </div>

        </div>

      </div>

      <!-- Canvas Footer with Page Stats -->
      <div class="canvas-footer" *ngIf="page">
        <div class="page-stats">
          <span>{{ components().length }} components</span>
          <span>•</span>
          <span>Version {{ page.version }}</span>
          <span>•</span>
          <span>{{ page.isPublished ? 'Published' : 'Draft' }}</span>
        </div>
      </div>

    </div>
  `,
  styleUrl: './page-builder-canvas.component.scss'
})
export class PageBuilderCanvasComponent implements OnInit {
  @Input() state!: PageBuilderState;
  @Input() page!: WebsitePage | null;
  @Input() viewMode: 'desktop' | 'tablet' | 'mobile' = 'desktop';
  @Input() widthMode: 'container' | 'full-width' = 'container';
  @Input() zoomLevel: number = 100;
  @Input() selectedComponent!: PageComponent | null;

  @Output() componentSelected = new EventEmitter<PageComponent | null>();
  @Output() componentDropped = new EventEmitter<{
    componentType?: ComponentType;
    sourceComponent?: PageComponent;
    targetIndex: number;
    position: { x: number; y: number };
  }>();
  @Output() componentUpdated = new EventEmitter<PageComponent>();
  @Output() componentDeleted = new EventEmitter<string>();

  // Internal state
  components = signal<PageComponent[]>([]);
  dropZones = signal<Array<{x: number, y: number, active: boolean}>>([]);
  isDragging = signal(false);

  constructor(private confirmationService: ConfirmationService) {}

  ngOnInit() {
    // Initialize components from page
    if (this.page?.components) {
      this.components.set([...this.page.components].sort((a, b) => a.sortOrder - b.sortOrder));
    }
  }

  trackByComponentId(index: number, component: PageComponent): string {
    return component.id;
  }

  selectComponent(component: PageComponent) {
    this.componentSelected.emit(component);
  }

  onComponentDropped(event: CdkDragDrop<PageComponent[]>) {
    if (event.previousContainer === event.container) {
      // Reordering existing components
      const components = [...this.components()];
      moveItemInArray(components, event.previousIndex, event.currentIndex);
      
      // Update sort orders
      components.forEach((comp, index) => {
        comp.sortOrder = index;
      });
      
      this.components.set(components);
      
      // Emit reordered components
      components.forEach(comp => this.componentUpdated.emit(comp));
    } else {
      // Dropping new component from panel
      const droppedData = event.item.data;
      
      if (typeof droppedData === 'string') {
        // New component type from panel
        this.componentDropped.emit({
          componentType: droppedData as ComponentType,
          targetIndex: event.currentIndex,
          position: { x: 0, y: 0 }
        });
      } else {
        // Moving existing component
        this.componentDropped.emit({
          sourceComponent: droppedData as PageComponent,
          targetIndex: event.currentIndex,
          position: { x: 0, y: 0 }
        });
      }
    }
  }

  onDragStart(component: PageComponent) {
    this.isDragging.set(true);
    this.generateDropZones();
  }

  onDragEnd() {
    this.isDragging.set(false);
    this.dropZones.set([]);
  }

  private generateDropZones() {
    // Generate visual drop zones between components
    const zones: Array<{x: number, y: number, active: boolean}> = [];
    const components = this.components();
    
    // Add zone at the top
    zones.push({ x: 0, y: 0, active: false });
    
    // Add zones between components
    for (let i = 0; i < components.length - 1; i++) {
      zones.push({ x: 0, y: (i + 1) * 100, active: false }); // Approximate positioning
    }
    
    // Add zone at the bottom
    zones.push({ x: 0, y: components.length * 100, active: false });
    
    this.dropZones.set(zones);
  }

  editComponent(component: PageComponent) {
    // Open property panel for this component
    this.selectComponent(component);
  }

  moveComponentUp(component: PageComponent) {
    const components = [...this.components()];
    const index = components.findIndex(c => c.id === component.id);
    
    if (index > 0) {
      [components[index], components[index - 1]] = [components[index - 1], components[index]];
      
      // Update sort orders
      components.forEach((comp, i) => comp.sortOrder = i);
      
      this.components.set(components);
      components.forEach(comp => this.componentUpdated.emit(comp));
    }
  }

  moveComponentDown(component: PageComponent) {
    const components = [...this.components()];
    const index = components.findIndex(c => c.id === component.id);
    
    if (index < components.length - 1) {
      [components[index], components[index + 1]] = [components[index + 1], components[index]];
      
      // Update sort orders
      components.forEach((comp, i) => comp.sortOrder = i);
      
      this.components.set(components);
      components.forEach(comp => this.componentUpdated.emit(comp));
    }
  }

  duplicateComponent(component: PageComponent) {
    const newComponent: PageComponent = {
      ...component,
      id: crypto.randomUUID(),
      sortOrder: component.sortOrder + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const components = [...this.components()];
    components.splice(component.sortOrder + 1, 0, newComponent);
    
    // Update sort orders for components after the duplicated one
    components.forEach((comp, index) => {
      comp.sortOrder = index;
    });

    this.components.set(components);
    this.componentUpdated.emit(newComponent);
  }

  async deleteComponent(component: PageComponent) {
    const componentTypeName = component.type || 'component';
    const confirmed = await this.confirmationService.confirmDelete(componentTypeName, 'component');
    
    if (!confirmed) {
      return;
    }

    const components = this.components().filter(c => c.id !== component.id);
    
    // Update sort orders
    components.forEach((comp, index) => {
      comp.sortOrder = index;
    });
    
    this.components.set(components);
    this.componentDeleted.emit(component.id);
    
    // Deselect if this component was selected
    if (this.selectedComponent?.id === component.id) {
      this.componentSelected.emit(null);
    }
  }

  isFirstComponent(component: PageComponent): boolean {
    return component.sortOrder === 0;
  }

  isLastComponent(component: PageComponent): boolean {
    return component.sortOrder === this.components().length - 1;
  }

  onComponentUpdated(component: PageComponent) {
    this.componentUpdated.emit(component);
  }

  onImageClicked(event: {src: string, alt: string}) {
    // Handle image click - could open lightbox, etc.
    console.log('Image clicked:', event);
  }
}