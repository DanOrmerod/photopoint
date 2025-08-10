import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WebsiteService } from '../../services/website.service';
import { ThemeService, Theme } from '../../services/theme.service';
import { ThemeCustomizerComponent } from '../theme-customizer/theme-customizer.component';
import { Page, Website } from '../../models/website.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface DesignBlock {
  id: string;
  type: 'hero' | 'text' | 'image' | 'gallery' | 'spacer' | 'button' | 'columns';
  content: any;
  styles: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    margin?: string;
    fontSize?: string;
    fontWeight?: string;
    textAlign?: string;
    borderRadius?: string;
    [key: string]: any;
  };
}

@Component({
  selector: 'app-visual-designer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, ThemeCustomizerComponent],
  template: `
    <div class="visual-designer">
      <!-- Top Toolbar -->
      <div class="designer-toolbar">
        <div class="toolbar-left">
          <button class="btn btn-ghost" (click)="goBack()">
            <i class="fas fa-arrow-left"></i>
            Back
          </button>
          <div class="page-info">
            <h2>{{ page()?.title || 'Untitled Page' }}</h2>
            <span class="page-url">{{ website()?.subdomain }}.photopoint.app/{{ page()?.slug }}</span>
          </div>
        </div>
        
        <div class="toolbar-center">
          <div class="device-selector">
            <button 
              class="device-btn" 
              [class.active]="currentDevice() === 'desktop'"
              (click)="setDevice('desktop')"
            >
              <i class="fas fa-desktop"></i>
            </button>
            <button 
              class="device-btn" 
              [class.active]="currentDevice() === 'tablet'"
              (click)="setDevice('tablet')"
            >
              <i class="fas fa-tablet-alt"></i>
            </button>
            <button 
              class="device-btn" 
              [class.active]="currentDevice() === 'mobile'"
              (click)="setDevice('mobile')"
            >
              <i class="fas fa-mobile-alt"></i>
            </button>
          </div>
        </div>
        
        <div class="toolbar-right">
          <button class="btn btn-ghost" (click)="toggleThemeCustomizer()">
            <i class="fas fa-palette"></i>
            Themes
          </button>
          <button class="btn btn-outline" (click)="previewPage()">
            <i class="fas fa-eye"></i>
            Preview
          </button>
          <button class="btn btn-primary" (click)="savePage()" [disabled]="isSaving()">
            <i class="fas fa-save" [class.fa-spin]="isSaving()"></i>
            {{ isSaving() ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>

      <div class="designer-layout">
        <!-- Left Sidebar - Component Palette -->
        <div class="component-palette">
          <div class="palette-header">
            <h3>Add Components</h3>
          </div>
          
          <div class="component-categories">
            <div class="component-category">
              <h4>Layout</h4>
              <div class="components-grid">
                <div class="component-item" (click)="addBlock('hero')">
                  <div class="component-icon">
                    <i class="fas fa-star"></i>
                  </div>
                  <span>Hero Section</span>
                </div>
                
                <div class="component-item" (click)="addBlock('columns')">
                  <div class="component-icon">
                    <i class="fas fa-columns"></i>
                  </div>
                  <span>Columns</span>
                </div>
                
                <div class="component-item" (click)="addBlock('spacer')">
                  <div class="component-icon">
                    <i class="fas fa-arrows-alt-v"></i>
                  </div>
                  <span>Spacer</span>
                </div>
              </div>
            </div>
            
            <div class="component-category">
              <h4>Content</h4>
              <div class="components-grid">
                <div class="component-item" (click)="addBlock('text')">
                  <div class="component-icon">
                    <i class="fas fa-paragraph"></i>
                  </div>
                  <span>Text Block</span>
                </div>
                
                <div class="component-item" (click)="addBlock('image')">
                  <div class="component-icon">
                    <i class="fas fa-image"></i>
                  </div>
                  <span>Image</span>
                </div>
                
                <div class="component-item" (click)="addBlock('gallery')">
                  <div class="component-icon">
                    <i class="fas fa-images"></i>
                  </div>
                  <span>Gallery</span>
                </div>
                
                <div class="component-item" (click)="addBlock('button')">
                  <div class="component-icon">
                    <i class="fas fa-mouse-pointer"></i>
                  </div>
                  <span>Button</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Center Canvas -->
        <div class="design-canvas-container">
          @if (loading()) {
            <div class="loading-state">
              <i class="fas fa-spinner fa-spin"></i>
              <p>Loading designer...</p>
            </div>
          } @else if (error()) {
            <div class="error-state">
              <i class="fas fa-exclamation-triangle"></i>
              <p>{{ error() }}</p>
              <button class="btn btn-primary" (click)="loadPage()">
                <i class="fas fa-refresh"></i>
                Retry
              </button>
            </div>
          } @else {
            <div 
              class="design-canvas" 
              [class.device-desktop]="currentDevice() === 'desktop'"
              [class.device-tablet]="currentDevice() === 'tablet'"
              [class.device-mobile]="currentDevice() === 'mobile'"
            >
              @if (designBlocks().length === 0) {
                <div class="empty-canvas">
                  <div class="empty-state">
                    <i class="fas fa-plus-circle"></i>
                    <h3>Start Building Your Page</h3>
                    <p>Click on components from the left panel to add them to your page</p>
                  </div>
                </div>
              } @else {
                @for (block of designBlocks(); track block.id) {
                  <div 
                    class="design-block"
                    [class.selected]="selectedBlockId() === block.id"
                    (click)="selectBlock(block.id)"
                  >
                    <div class="block-controls" *ngIf="selectedBlockId() === block.id">
                      <button class="control-btn" (click)="moveBlockUp(block.id)" title="Move Up">
                        <i class="fas fa-arrow-up"></i>
                      </button>
                      <button class="control-btn" (click)="moveBlockDown(block.id)" title="Move Down">
                        <i class="fas fa-arrow-down"></i>
                      </button>
                      <button class="control-btn" (click)="duplicateBlock(block.id)" title="Duplicate">
                        <i class="fas fa-copy"></i>
                      </button>
                      <button class="control-btn danger" (click)="deleteBlock(block.id)" title="Delete">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                    
                    <div [innerHTML]="renderBlock(block)" class="block-content"></div>
                  </div>
                }
              }
            </div>
          }
        </div>

        <!-- Right Sidebar - Style Panel -->
        <div class="style-panel" *ngIf="selectedBlock()">
          <div class="panel-header">
            <h3>{{ getBlockTypeName(selectedBlock()!.type) }} Settings</h3>
          </div>
          
          <div class="style-sections">
            <!-- Content Section -->
            <div class="style-section">
              <h4>Content</h4>
              
              @switch (selectedBlock()!.type) {
                @case ('hero') {
                  <div class="form-group">
                    <label>Title</label>
                    <input 
                      type="text" 
                      class="form-control"
                      [value]="selectedBlock()!.content.title || ''"
                      (input)="updateBlockContent('title', $event)"
                    >
                  </div>
                  <div class="form-group">
                    <label>Subtitle</label>
                    <textarea 
                      class="form-control"
                      rows="3"
                      [value]="selectedBlock()!.content.subtitle || ''"
                      (input)="updateBlockContent('subtitle', $event)"
                    ></textarea>
                  </div>
                  <div class="form-group">
                    <label>Button Text</label>
                    <input 
                      type="text" 
                      class="form-control"
                      [value]="selectedBlock()!.content.buttonText || ''"
                      (input)="updateBlockContent('buttonText', $event)"
                      placeholder="Call to Action"
                    >
                  </div>
                }
                
                @case ('text') {
                  <div class="form-group">
                    <label>Text Content</label>
                    <textarea 
                      class="form-control"
                      rows="6"
                      [value]="selectedBlock()!.content.text || ''"
                      (input)="updateBlockContent('text', $event)"
                      placeholder="Enter your text here..."
                    ></textarea>
                  </div>
                }
                
                @case ('image') {
                  <div class="form-group">
                    <label>Image URL</label>
                    <input 
                      type="url" 
                      class="form-control"
                      [value]="selectedBlock()!.content.src || ''"
                      (input)="updateBlockContent('src', $event)"
                      placeholder="https://example.com/image.jpg"
                    >
                  </div>
                  <div class="form-group">
                    <label>Alt Text</label>
                    <input 
                      type="text" 
                      class="form-control"
                      [value]="selectedBlock()!.content.alt || ''"
                      (input)="updateBlockContent('alt', $event)"
                      placeholder="Image description"
                    >
                  </div>
                }
                
                @case ('button') {
                  <div class="form-group">
                    <label>Button Text</label>
                    <input 
                      type="text" 
                      class="form-control"
                      [value]="selectedBlock()!.content.text || ''"
                      (input)="updateBlockContent('text', $event)"
                      placeholder="Click me"
                    >
                  </div>
                  <div class="form-group">
                    <label>Link URL</label>
                    <input 
                      type="url" 
                      class="form-control"
                      [value]="selectedBlock()!.content.href || ''"
                      (input)="updateBlockContent('href', $event)"
                      placeholder="https://example.com"
                    >
                  </div>
                }
              }
            </div>
            
            <!-- Style Section -->
            <div class="style-section">
              <h4>Styling</h4>
              
              <div class="form-group">
                <label>Background Color</label>
                <div class="color-input-group">
                  <input 
                    type="color" 
                    class="color-picker"
                    [value]="selectedBlock()!.styles.backgroundColor || '#ffffff'"
                    (input)="updateBlockStyle('backgroundColor', $event)"
                  >
                  <input 
                    type="text" 
                    class="form-control"
                    [value]="selectedBlock()!.styles.backgroundColor || ''"
                    (input)="updateBlockStyle('backgroundColor', $event)"
                    placeholder="#ffffff"
                  >
                </div>
              </div>
              
              <div class="form-group">
                <label>Text Color</label>
                <div class="color-input-group">
                  <input 
                    type="color" 
                    class="color-picker"
                    [value]="selectedBlock()!.styles.textColor || '#333333'"
                    (input)="updateBlockStyle('textColor', $event)"
                  >
                  <input 
                    type="text" 
                    class="form-control"
                    [value]="selectedBlock()!.styles.textColor || ''"
                    (input)="updateBlockStyle('textColor', $event)"
                    placeholder="#333333"
                  >
                </div>
              </div>
              
              <div class="form-group">
                <label>Text Alignment</label>
                <select 
                  class="form-control"
                  [value]="selectedBlock()!.styles.textAlign || 'left'"
                  (change)="updateBlockStyle('textAlign', $event)"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Font Size</label>
                <select 
                  class="form-control"
                  [value]="selectedBlock()!.styles.fontSize || '16px'"
                  (change)="updateBlockStyle('fontSize', $event)"
                >
                  <option value="12px">12px - Small</option>
                  <option value="14px">14px - Normal</option>
                  <option value="16px">16px - Medium</option>
                  <option value="18px">18px - Large</option>
                  <option value="24px">24px - XL</option>
                  <option value="32px">32px - XXL</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Padding</label>
                <select 
                  class="form-control"
                  [value]="selectedBlock()!.styles.padding || '20px'"
                  (change)="updateBlockStyle('padding', $event)"
                >
                  <option value="0px">None</option>
                  <option value="10px">Small</option>
                  <option value="20px">Medium</option>
                  <option value="40px">Large</option>
                  <option value="60px">XL</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Theme Customizer -->
        @if (showThemeCustomizer()) {
          <app-theme-customizer
            [currentTheme]="currentTheme() ?? undefined"
            (themeSelected)="onThemeSelected($event)"
            (themeCustomized)="onThemeCustomized($event)"
            (closeRequested)="toggleThemeCustomizer()"
          ></app-theme-customizer>
        }
      </div>
    </div>
  `,
  styles: [`
    .visual-designer {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #f8fafc;
    }

    /* Toolbar Styles */
    .designer-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 24px;
      background: white;
      border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      z-index: 100;
    }

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .page-info h2 {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
      color: #1e293b;
    }

    .page-url {
      font-size: 12px;
      color: #64748b;
    }

    .device-selector {
      display: flex;
      gap: 4px;
      background: #f1f5f9;
      border-radius: 6px;
      padding: 4px;
    }

    .device-btn {
      padding: 8px 12px;
      border: none;
      background: none;
      border-radius: 4px;
      cursor: pointer;
      color: #64748b;
      transition: all 0.2s;
    }

    .device-btn:hover {
      color: #3b82f6;
      background: white;
    }

    .device-btn.active {
      color: #3b82f6;
      background: white;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    /* Layout Styles */
    .designer-layout {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    /* Component Palette */
    .component-palette {
      width: 280px;
      background: white;
      border-right: 1px solid #e2e8f0;
      overflow-y: auto;
    }

    .palette-header {
      padding: 20px;
      border-bottom: 1px solid #e2e8f0;
    }

    .palette-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .component-category {
      padding: 20px;
    }

    .component-category h4 {
      margin: 0 0 16px 0;
      font-size: 14px;
      font-weight: 500;
      color: #64748b;
      text-transform: uppercase;
    }

    .components-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .component-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px 12px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }

    .component-item:hover {
      border-color: #3b82f6;
      background: #f8fafc;
    }

    .component-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f1f5f9;
      border-radius: 6px;
      color: #64748b;
    }

    .component-item span {
      font-size: 12px;
      font-weight: 500;
      color: #475569;
    }

    /* Design Canvas */
    .design-canvas-container {
      flex: 1;
      overflow: auto;
      background: #f1f5f9;
      padding: 20px;
    }

    .design-canvas {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      margin: 0 auto;
      min-height: 600px;
      transition: all 0.3s;
    }

    .design-canvas.device-desktop {
      max-width: 1200px;
    }

    .design-canvas.device-tablet {
      max-width: 768px;
    }

    .design-canvas.device-mobile {
      max-width: 375px;
    }

    .empty-canvas {
      height: 600px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .empty-state {
      text-align: center;
      color: #64748b;
    }

    .empty-state i {
      font-size: 48px;
      margin-bottom: 16px;
      color: #cbd5e1;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
    }

    /* Design Blocks */
    .design-block {
      position: relative;
      cursor: pointer;
      transition: all 0.2s;
    }

    .design-block:hover {
      box-shadow: 0 0 0 2px #3b82f6;
    }

    .design-block.selected {
      box-shadow: 0 0 0 2px #3b82f6;
    }

    .block-controls {
      position: absolute;
      top: -40px;
      right: 0;
      display: flex;
      gap: 4px;
      background: white;
      border-radius: 6px;
      padding: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      z-index: 10;
    }

    .control-btn {
      padding: 6px 8px;
      border: none;
      background: none;
      border-radius: 4px;
      cursor: pointer;
      color: #64748b;
      font-size: 12px;
      transition: all 0.2s;
    }

    .control-btn:hover {
      background: #f1f5f9;
      color: #3b82f6;
    }

    .control-btn.danger:hover {
      background: #fef2f2;
      color: #ef4444;
    }

    /* Style Panel */
    .style-panel {
      width: 320px;
      background: white;
      border-left: 1px solid #e2e8f0;
      overflow-y: auto;
    }

    .panel-header {
      padding: 20px;
      border-bottom: 1px solid #e2e8f0;
    }

    .panel-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .style-sections {
      padding: 20px;
    }

    .style-section {
      margin-bottom: 32px;
    }

    .style-section h4 {
      margin: 0 0 16px 0;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      margin-bottom: 6px;
      font-size: 13px;
      font-weight: 500;
      color: #374151;
    }

    .form-control {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .color-input-group {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .color-picker {
      width: 40px;
      height: 40px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      cursor: pointer;
      padding: 0;
    }

    /* Button Styles */
    .btn {
      padding: 8px 16px;
      border: 1px solid transparent;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-ghost {
      background: none;
      color: #64748b;
      border-color: transparent;
    }

    .btn-ghost:hover {
      background: #f1f5f9;
      color: #3b82f6;
    }

    .btn-outline {
      background: white;
      color: #64748b;
      border-color: #d1d5db;
    }

    .btn-outline:hover {
      background: #f9fafb;
      border-color: #9ca3af;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    .btn-primary:hover {
      background: #2563eb;
      border-color: #2563eb;
    }

    /* Loading and Error States */
    .loading-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 400px;
      gap: 16px;
      color: #64748b;
    }

    .loading-state i {
      font-size: 32px;
      color: #3b82f6;
    }

    .error-state i {
      font-size: 48px;
      color: #ef4444;
    }

    /* Block Content Styles */
    .block-content {
      min-height: 60px;
    }
  `]
})
export class VisualDesignerComponent implements OnInit {
  // Signals for reactive state
  loading = signal(false);
  error = signal<string | null>(null);
  isSaving = signal(false);
  page = signal<Page | null>(null);
  website = signal<Website | null>(null);
  currentDevice = signal<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  designBlocks = signal<DesignBlock[]>([]);
  selectedBlockId = signal<string | null>(null);
  
  // Theme customization
  showThemeCustomizer = signal(false);
  currentTheme = signal<Theme | null>(null);
  
  selectedBlock = computed(() => {
    const blocks = this.designBlocks();
    const selectedId = this.selectedBlockId();
    return selectedId ? blocks.find(block => block.id === selectedId) || null : null;
  });

  // Route parameters
  websiteId = computed(() => this.route.snapshot.paramMap.get('id'));
  pageId = computed(() => this.route.snapshot.paramMap.get('pageId'));

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private websiteService: WebsiteService,
    private themeService: ThemeService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    console.log('Visual Designer component loaded');
    console.log('Route params:', this.route.snapshot.paramMap);
    console.log('Website ID:', this.route.snapshot.paramMap.get('id'));
    console.log('Page ID:', this.route.snapshot.paramMap.get('pageId'));
    
    this.loadPage();
  }

  async loadPage() {
    const websiteId = this.websiteId();
    const pageId = this.pageId();
    
    if (!websiteId || !pageId) {
      this.error.set('Invalid website or page ID');
      return;
    }

    try {
      this.loading.set(true);
      this.error.set(null);

      const [website, page] = await Promise.all([
        this.websiteService.getWebsite(websiteId),
        this.websiteService.getPage(websiteId, pageId)
      ]);

      this.website.set(website);
      this.page.set(page);

      // Parse existing content into design blocks
      this.parseContentToBlocks(page.content || '');

    } catch (error) {
      console.error('Error loading page:', error);
      this.error.set('Failed to load page. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  parseContentToBlocks(content: string) {
    try {
      if (!content) {
        this.designBlocks.set([]);
        return;
      }

      const parsed = JSON.parse(content);
      if (parsed.blocks && Array.isArray(parsed.blocks)) {
        // Convert existing blocks to design blocks
        const blocks: DesignBlock[] = parsed.blocks.map((block: any, index: number) => ({
          id: `block-${Date.now()}-${index}`,
          type: block.type || 'text',
          content: block.content || {},
          styles: {
            backgroundColor: '#ffffff',
            textColor: '#333333',
            padding: '20px',
            fontSize: '16px',
            textAlign: 'left'
          }
        }));
        this.designBlocks.set(blocks);
      } else {
        // Create a single text block from plain content
        this.designBlocks.set([{
          id: `block-${Date.now()}`,
          type: 'text',
          content: { text: content },
          styles: {
            backgroundColor: '#ffffff',
            textColor: '#333333',
            padding: '20px',
            fontSize: '16px',
            textAlign: 'left'
          }
        }]);
      }
    } catch (error) {
      // Plain text content
      this.designBlocks.set([{
        id: `block-${Date.now()}`,
        type: 'text',
        content: { text: content || 'Start editing your page...' },
        styles: {
          backgroundColor: '#ffffff',
          textColor: '#333333',
          padding: '20px',
          fontSize: '16px',
          textAlign: 'left'
        }
      }]);
    }
  }

  addBlock(type: DesignBlock['type']) {
    const newBlock: DesignBlock = {
      id: `block-${Date.now()}`,
      type,
      content: this.getDefaultContent(type),
      styles: {
        backgroundColor: '#ffffff',
        textColor: '#333333',
        padding: '20px',
        fontSize: '16px',
        textAlign: 'left'
      }
    };

    const currentBlocks = this.designBlocks();
    this.designBlocks.set([...currentBlocks, newBlock]);
    this.selectedBlockId.set(newBlock.id);
  }

  getDefaultContent(type: DesignBlock['type']) {
    switch (type) {
      case 'hero':
        return {
          title: 'Welcome to Our Website',
          subtitle: 'Create amazing experiences with our platform',
          buttonText: 'Get Started'
        };
      case 'text':
        return { text: 'Add your content here...' };
      case 'image':
        return { src: '', alt: 'Image description' };
      case 'button':
        return { text: 'Click me', href: '#' };
      case 'gallery':
        return { images: [] };
      case 'spacer':
        return { height: '40px' };
      case 'columns':
        return { columns: [{ content: 'Column 1' }, { content: 'Column 2' }] };
      default:
        return {};
    }
  }

  selectBlock(blockId: string) {
    this.selectedBlockId.set(blockId);
  }

  updateBlockContent(field: string, event: Event) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const selectedBlock = this.selectedBlock();
    
    if (!selectedBlock) return;

    const blocks = this.designBlocks();
    const updatedBlocks = blocks.map(block => {
      if (block.id === selectedBlock.id) {
        return {
          ...block,
          content: {
            ...block.content,
            [field]: target.value
          }
        };
      }
      return block;
    });

    this.designBlocks.set(updatedBlocks);
  }

  updateBlockStyle(field: string, event: Event) {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const selectedBlock = this.selectedBlock();
    
    if (!selectedBlock) return;

    const blocks = this.designBlocks();
    const updatedBlocks = blocks.map(block => {
      if (block.id === selectedBlock.id) {
        return {
          ...block,
          styles: {
            ...block.styles,
            [field]: target.value
          }
        };
      }
      return block;
    });

    this.designBlocks.set(updatedBlocks);
  }

  renderBlock(block: DesignBlock): SafeHtml {
    let html = '';
    const styles = this.getBlockStyles(block);

    switch (block.type) {
      case 'hero':
        html = `
          <div style="${styles}">
            <h1 style="font-size: 3em; margin-bottom: 20px;">${block.content.title || 'Hero Title'}</h1>
            <p style="font-size: 1.3em; margin-bottom: 30px;">${block.content.subtitle || 'Hero subtitle'}</p>
            ${block.content.buttonText ? `<button style="background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-size: 16px; cursor: pointer;">${block.content.buttonText}</button>` : ''}
          </div>
        `;
        break;
      
      case 'text':
        html = `<div style="${styles}">${block.content.text || 'Add your text here...'}</div>`;
        break;
      
      case 'image':
        html = `
          <div style="${styles}">
            ${block.content.src ? 
              `<img src="${block.content.src}" alt="${block.content.alt || ''}" style="max-width: 100%; height: auto;">` :
              `<div style="background: #f3f4f6; padding: 60px; text-align: center; color: #9ca3af; border: 2px dashed #d1d5db;">
                <i class="fas fa-image" style="font-size: 48px; margin-bottom: 16px;"></i>
                <p>Add an image URL in the settings panel</p>
              </div>`
            }
          </div>
        `;
        break;
      
      case 'button':
        html = `
          <div style="${styles}">
            <a href="${block.content.href || '#'}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              ${block.content.text || 'Click me'}
            </a>
          </div>
        `;
        break;
      
      case 'spacer':
        html = `<div style="height: ${block.content.height || '40px'};"></div>`;
        break;
      
      case 'gallery':
        html = `
          <div style="${styles}">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
              ${block.content.images && block.content.images.length > 0 ? 
                block.content.images.map((img: any) => `
                  <img src="${img.url}" alt="${img.alt || ''}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
                `).join('') :
                `<div style="background: #f3f4f6; padding: 60px; text-align: center; color: #9ca3af; border: 2px dashed #d1d5db; grid-column: 1 / -1;">
                  <i class="fas fa-images" style="font-size: 48px; margin-bottom: 16px;"></i>
                  <p>Gallery - Add images in the settings panel</p>
                </div>`
              }
            </div>
          </div>
        `;
        break;
      
      default:
        html = `<div style="${styles}">Unknown block type</div>`;
    }

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  getBlockStyles(block: DesignBlock): string {
    const styles = block.styles;
    return `
      background-color: ${styles.backgroundColor || '#ffffff'};
      color: ${styles.textColor || '#333333'};
      padding: ${styles.padding || '20px'};
      margin: ${styles.margin || '0'};
      font-size: ${styles.fontSize || '16px'};
      text-align: ${styles.textAlign || 'left'};
      border-radius: ${styles.borderRadius || '0px'};
      min-height: 60px;
    `;
  }

  getBlockTypeName(type: DesignBlock['type']): string {
    const names = {
      hero: 'Hero Section',
      text: 'Text Block',
      image: 'Image',
      button: 'Button',
      gallery: 'Gallery',
      spacer: 'Spacer',
      columns: 'Columns'
    };
    return names[type] || 'Block';
  }

  moveBlockUp(blockId: string) {
    const blocks = this.designBlocks();
    const index = blocks.findIndex(block => block.id === blockId);
    
    if (index > 0) {
      const newBlocks = [...blocks];
      [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
      this.designBlocks.set(newBlocks);
    }
  }

  moveBlockDown(blockId: string) {
    const blocks = this.designBlocks();
    const index = blocks.findIndex(block => block.id === blockId);
    
    if (index < blocks.length - 1) {
      const newBlocks = [...blocks];
      [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
      this.designBlocks.set(newBlocks);
    }
  }

  duplicateBlock(blockId: string) {
    const blocks = this.designBlocks();
    const blockToDuplicate = blocks.find(block => block.id === blockId);
    
    if (blockToDuplicate) {
      const duplicatedBlock: DesignBlock = {
        ...blockToDuplicate,
        id: `block-${Date.now()}`
      };
      
      const index = blocks.findIndex(block => block.id === blockId);
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, duplicatedBlock);
      this.designBlocks.set(newBlocks);
      this.selectedBlockId.set(duplicatedBlock.id);
    }
  }

  deleteBlock(blockId: string) {
    const blocks = this.designBlocks();
    const newBlocks = blocks.filter(block => block.id !== blockId);
    this.designBlocks.set(newBlocks);
    
    if (this.selectedBlockId() === blockId) {
      this.selectedBlockId.set(null);
    }
  }

  setDevice(device: 'desktop' | 'tablet' | 'mobile') {
    this.currentDevice.set(device);
  }

  async savePage() {
    const page = this.page();
    const websiteId = this.websiteId();
    
    if (!page || !websiteId) return;

    try {
      this.isSaving.set(true);
      
      // Convert design blocks back to the expected format
      const content = JSON.stringify({
        blocks: this.designBlocks().map(block => ({
          type: block.type,
          content: block.content,
          styles: block.styles
        }))
      });

      await this.websiteService.updatePage(websiteId, page.id, {
        content: content
      });

      console.log('Page saved successfully');
    } catch (error) {
      console.error('Error saving page:', error);
    } finally {
      this.isSaving.set(false);
    }
  }

  previewPage() {
    const website = this.website();
    const page = this.page();
    
    if (website && page) {
      const previewUrl = `http://localhost:4200/websites/${website.id}/pages/${page.id}/preview`;
      window.open(previewUrl, '_blank');
    }
  }

  goBack() {
    const websiteId = this.websiteId();
    if (websiteId) {
      this.router.navigate(['/websites', websiteId]);
    } else {
      this.router.navigate(['/websites']);
    }
  }

  // Theme customization methods
  toggleThemeCustomizer() {
    this.showThemeCustomizer.set(!this.showThemeCustomizer());
  }

  onThemeSelected(theme: Theme) {
    this.currentTheme.set(theme);
    this.showThemeCustomizer.set(false);
  }

  onThemeCustomized(customization: any) {
    // Apply real-time customizations only to the design canvas, not the entire CMS
    const canvas = document.querySelector('.design-canvas') as HTMLElement;
    if (!canvas) return;
    
    // Apply custom colors
    if (customization.colors) {
      Object.entries(customization.colors).forEach(([key, value]: [string, any]) => {
        canvas.style.setProperty(`--${key}-color`, value);
      });
    }
    
    // Apply custom typography
    if (customization.typography) {
      if (customization.typography.fontFamily) {
        canvas.style.setProperty('--font-family', customization.typography.fontFamily);
      }
      if (customization.typography.fontSize) {
        canvas.style.setProperty('--font-size', customization.typography.fontSize);
      }
      if (customization.typography.lineHeight) {
        canvas.style.setProperty('--line-height', customization.typography.lineHeight);
      }
    }
    
    // Apply custom layout
    if (customization.layout) {
      if (customization.layout.borderRadius) {
        canvas.style.setProperty('--border-radius', customization.layout.borderRadius);
      }
      if (customization.layout.containerWidth) {
        canvas.style.setProperty('--container-width', customization.layout.containerWidth);
      }
    }
  }
}
