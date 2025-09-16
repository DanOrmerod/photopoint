import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WebsiteService } from '../../services/website.service';
import { ThemeService, Theme } from '../../services/theme.service';
import { AuthService } from '../../auth/auth.service';
import { Page, Website } from '../../services/website.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// Import all block components
import {
  TextBlockComponent,
  HeroBlockComponent,
  ImageBlockComponent,
  ButtonBlockComponent,
  ColumnsBlockComponent,
  SpacerBlockComponent,
  BaseBlockData
} from './blocks';

export interface DesignBlock extends BaseBlockData {
  id: string;
  type: 'text' | 'hero' | 'image' | 'button' | 'columns' | 'spacer';
  content?: any;
  styles?: {
    padding?: string;
    margin?: string;
    backgroundColor?: string;
    textColor?: string;
    [key: string]: any;
  };
}

interface ComponentType {
  type: DesignBlock['type'];
  name: string;
  icon: string;
}

@Component({
  selector: 'app-visual-designer',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    ReactiveFormsModule, 
    TextBlockComponent,
    HeroBlockComponent,
    ImageBlockComponent,
    ButtonBlockComponent,
    ColumnsBlockComponent,
    SpacerBlockComponent
  ],
  templateUrl: './visual-designer.component.html',
  styleUrls: ['./visual-designer.component.scss']
})
export class VisualDesignerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private websiteService = inject(WebsiteService);
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);

  // Signals
  website = signal<Website | null>(null);
  page = signal<Page | null>(null);
  designBlocks = signal<DesignBlock[]>([]);
  selectedBlockId = signal<string | null>(null);
  editingBlockId = signal<string | null>(null);
  isPreview = signal(false);
  selectedDevice = signal<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // Component panel state
  showComponentsPanel = signal(false);
  
  // Error state
  loadingError = signal<string | null>(null);
  
  // Drag and drop
  isDragging = signal(false);
  draggedComponentType = signal<DesignBlock['type'] | null>(null);
  dropZoneVisible = computed(() => this.isDragging());

  // Available components
  availableComponents: ComponentType[] = [
    { type: 'text', name: 'Text', icon: 'fas fa-font' },
    { type: 'hero', name: 'Hero', icon: 'fas fa-star' },
    { type: 'image', name: 'Image', icon: 'fas fa-image' },
    { type: 'button', name: 'Button', icon: 'fas fa-mouse-pointer' },
    { type: 'columns', name: 'Columns', icon: 'fas fa-columns' },
    { type: 'spacer', name: 'Spacer', icon: 'fas fa-arrows-alt-v' }
  ];

  ngOnInit() {
    this.loadPage();
    
    // Listen for global drag events to support nested components
    document.addEventListener('dragstart', (event) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('component-item')) {
        this.isDragging.set(true);
      }
    });
    
    document.addEventListener('dragend', () => {
      this.isDragging.set(false);
      this.draggedComponentType.set(null);
    });
  }

  async loadPage() {
    // Get route parameters - using 'id' for website as per route configuration
    const websiteId = this.route.snapshot.paramMap.get('id');
    const pageId = this.route.snapshot.paramMap.get('pageId');

    if (!websiteId || !pageId) {
        this.loadingError.set('Missing required route parameters');
        return;
    }

    try {
      // Clear any previous errors
      this.loadingError.set(null);
      
      // Load website and page data
      const website = await this.websiteService.getWebsite(websiteId);
      this.website.set(website);

      const page = await this.websiteService.getPage(websiteId, pageId);
      this.page.set(page);

      // Parse blocks from page content
      let blocks: DesignBlock[] = [];
      
      if (page.content) {
        try {
          // Handle different content formats
          if (typeof page.content === 'string') {
            const parsedContent = JSON.parse(page.content);
            
            if (parsedContent.blocks && Array.isArray(parsedContent.blocks)) {
              blocks = parsedContent.blocks.map((block: any, index: number) => {
                if (!block.id) {
                  block.id = `block-${Date.now()}-${index}`;
                }
                return block;
              });
            } else if (Array.isArray(parsedContent)) {
              blocks = parsedContent.map((block: any, index: number) => {
                if (!block.id) {
                  block.id = `block-${Date.now()}-${index}`;
                }
                return block;
              });
            }
          } else if (Array.isArray(page.content)) {
            blocks = page.content;
          } else if (typeof page.content === 'object' && page.content !== null) {
            const contentObj = page.content as any;
            blocks = contentObj.blocks || contentObj.content || [page.content];
          }
        } catch (e) {
          console.error('Error parsing page content:', e);
          blocks = [];
        }
      }
      
      this.designBlocks.set(blocks || []);
      
    } catch (error) {
      console.error('Error loading page data:', error);
      this.loadingError.set('Failed to load page data');
    }
  }

  // Navigation
  goBack() {
    const websiteId = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['/websites', websiteId]);
  }

  setPreview(preview: boolean) {
    this.isPreview.set(preview);
    if (preview) {
      this.editingBlockId.set(null);
      this.selectedBlockId.set(null);
    }
  }

  openPreviewWindow() {
    const websiteId = this.route.snapshot.paramMap.get('id');
    const pageId = this.route.snapshot.paramMap.get('pageId');
    
    if (websiteId && pageId) {
      // Use the correct preview route format based on cms.routes.ts
      const previewUrl = `/websites/${websiteId}/pages/${pageId}/preview`;
      window.open(previewUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    }
  }

  // Component panel methods
  toggleComponentsPanel() {
    this.showComponentsPanel.set(!this.showComponentsPanel());
  }

  closeComponentsPanel() {
    this.showComponentsPanel.set(false);
  }

  addComponentToCanvas(type: DesignBlock['type']) {
    this.addBlockAtIndex(type);
    this.closeComponentsPanel();
  }

  // Block management
  selectBlock(blockId: string, event?: Event) {
    if (this.editingBlockId()) {
      return;
    }
    
    if (event) {
      event.stopPropagation();
    }
    
    this.selectedBlockId.set(blockId);
  }

  startBlockEdit(blockId: string) {
    this.editingBlockId.set(blockId);
  }

  onBlockEditingChange(blockId: string, isEditing: boolean) {
    if (isEditing) {
      this.editingBlockId.set(blockId);
    } else {
      this.editingBlockId.set(null);
      this.selectedBlockId.set(null);
    }
  }

  updateBlockContent(blockId: string, content: any) {
    const blocks = [...this.designBlocks()];
    const blockIndex = blocks.findIndex(b => b.id === blockId);
    
    if (blockIndex !== -1) {
      blocks[blockIndex] = {
        ...blocks[blockIndex],
        content
      };
      this.designBlocks.set(blocks);
    }
  }

  // Drag and drop
  onDragStart(event: DragEvent, componentType: DesignBlock['type']) {
    if (!event.dataTransfer) return;
    
    // Set drag data in multiple formats for compatibility
    event.dataTransfer.setData('text/plain', componentType);
    event.dataTransfer.setData('application/x-component-type', componentType);
    event.dataTransfer.setData('application/json', JSON.stringify({ type: componentType }));
    event.dataTransfer.effectAllowed = 'copy';
    
    // Update drag state
    this.draggedComponentType.set(componentType);
    this.isDragging.set(true);
    
    console.log('Visual Designer - Drag started:', componentType, 'Data set:', {
      'text/plain': componentType,
      'application/x-component-type': componentType,
      'application/json': JSON.stringify({ type: componentType })
    });
  }

  onDragEnd() {
    console.log('Drag ended'); // Debug log
    this.isDragging.set(false);
    this.draggedComponentType.set(null);
    
    // Don't auto-close panel - let user decide when to close it
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';
  }

  onDrop(event: DragEvent, insertIndex?: number) {
    event.preventDefault();
    event.stopPropagation();
    
    // Try multiple ways to get the component type
    let componentType = event.dataTransfer?.getData('text/plain') as DesignBlock['type'];
    
    if (!componentType) {
      try {
        const dragData = event.dataTransfer?.getData('application/json');
        if (dragData) {
          const parsed = JSON.parse(dragData);
          componentType = parsed.type;
        }
      } catch (e) {
        console.error('Error parsing drag data:', e);
      }
    }
    
    console.log('Drop event:', { componentType, insertIndex }); // Debug log
    
    if (componentType) {
      this.addBlockAtIndex(componentType, insertIndex);
      console.log('Block added successfully'); // Debug log
    } else {
      console.error('No component type found in drop event');
    }
    
    this.isDragging.set(false);
    this.draggedComponentType.set(null);
  }

  addBlockAtIndex(type: DesignBlock['type'], index?: number) {
    const newBlock: DesignBlock = {
      id: Date.now().toString(),
      type,
      content: this.getDefaultContent(type),
      styles: {
        padding: '16px',
        margin: '0',
        backgroundColor: 'transparent',
        textColor: '#000000'
      }
    };
    
    const blocks = [...this.designBlocks()];
    if (index !== undefined) {
      blocks.splice(index, 0, newBlock);
    } else {
      blocks.push(newBlock);
    }
    this.designBlocks.set(blocks);
  }

  getDefaultContent(type: DesignBlock['type']) {
    switch (type) {
      case 'text':
        return '<p>Click to edit this text</p>';
      case 'hero':
        return {
          title: 'Hero Title',
          subtitle: 'Hero subtitle goes here',
          buttonText: 'Call to Action',
          buttonUrl: '#',
          backgroundImage: ''
        };
      case 'image':
        return {
          src: 'https://via.placeholder.com/600x400',
          alt: 'Placeholder image',
          width: '100%',
          height: 'auto',
          alignment: 'center'
        };
      case 'button':
        return {
          text: 'Click me',
          url: '#',
          style: 'primary',
          size: 'medium',
          alignment: 'center'
        };
      case 'columns':
        return {
          columnCount: 2,
          columns: [
            { content: '', width: 'auto' },
            { content: '', width: 'auto' }
          ],
          gap: '16px'
        };
      case 'spacer':
        return { height: '40px' };
      default:
        return {};
    }
  }

  // Block actions
  moveBlockUp(blockId: string) {
    const blocks = [...this.designBlocks()];
    const index = blocks.findIndex(b => b.id === blockId);
    
    if (index > 0) {
      [blocks[index], blocks[index - 1]] = [blocks[index - 1], blocks[index]];
      this.designBlocks.set(blocks);
    }
  }

  moveBlockDown(blockId: string) {
    const blocks = [...this.designBlocks()];
    const index = blocks.findIndex(b => b.id === blockId);
    
    if (index < blocks.length - 1) {
      [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
      this.designBlocks.set(blocks);
    }
  }

  duplicateBlock(blockId: string) {
    const blocks = [...this.designBlocks()];
    const blockIndex = blocks.findIndex(b => b.id === blockId);
    
    if (blockIndex !== -1) {
      const originalBlock = blocks[blockIndex];
      const duplicatedBlock: DesignBlock = {
        ...originalBlock,
        id: Date.now().toString()
      };
      
      blocks.splice(blockIndex + 1, 0, duplicatedBlock);
      this.designBlocks.set(blocks);
    }
  }

  deleteBlock(blockId: string) {
    const blocks = this.designBlocks().filter((b: DesignBlock) => b.id !== blockId);
    this.designBlocks.set(blocks);
    
    if (this.selectedBlockId() === blockId) {
      this.selectedBlockId.set(null);
    }
    if (this.editingBlockId() === blockId) {
      this.editingBlockId.set(null);
    }
  }

  // Save
  async savePage() {
    const websiteId = this.route.snapshot.paramMap.get('id');
    const pageId = this.route.snapshot.paramMap.get('pageId');
    
    if (!websiteId || !pageId) {
      this.loadingError.set('Missing route parameters for save operation');
      return;
    }

    try {
      // Clear any previous errors
      this.loadingError.set(null);
      
      // Serialize blocks with proper structure
      const pageContent = {
        blocks: this.designBlocks()
      };
      
      await this.websiteService.updatePage(websiteId, pageId, { 
        content: JSON.stringify(pageContent)
      });
      
      // Could add a success notification here
    } catch (error) {
      console.error('Error saving page:', error);
      this.loadingError.set('Failed to save page');
    }
  }
}
