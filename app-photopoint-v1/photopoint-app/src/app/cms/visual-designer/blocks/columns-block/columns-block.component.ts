import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseBlockData, BaseBlockComponent } from '../base-block.interface';

// Import all block components for nested rendering
import { TextBlockComponent } from '../text-block/text-block.component';
import { HeroBlockComponent } from '../hero-block/hero-block.component';
import { ImageBlockComponent } from '../image-block/image-block.component';
import { ButtonBlockComponent } from '../button-block/button-block.component';
import { SpacerBlockComponent } from '../spacer-block/spacer-block.component';

export interface DesignBlock {
  id: string;
  type: 'text' | 'hero' | 'image' | 'button' | 'spacer';
  content: any;
  styles: any;
}

interface ColumnData {
  content: string; // Legacy text content
  width?: string;
  blocks?: DesignBlock[]; // New nested blocks support
}

interface ColumnsContent {
  columnCount: number;
  columns: ColumnData[];
  gap?: string;
}

@Component({
  selector: 'app-columns-block',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    TextBlockComponent,
    HeroBlockComponent,
    ImageBlockComponent,
    ButtonBlockComponent,
    SpacerBlockComponent
  ],
  templateUrl: './columns-block.component.html',
  styleUrls: ['./columns-block.component.scss']
})
export class ColumnsBlockComponent implements BaseBlockComponent {
  @Input() data!: BaseBlockData;
  @Input() isEditing = false;
  @Input() isSelected = false;
  @Input() isPreview = false;
  
  @Output() contentChange = new EventEmitter<any>();
  @Output() editingChange = new EventEmitter<boolean>();

  // Drag and drop state
  isDragging = false;
  draggedComponentType: string | null = null;
  dragOverColumnIndex: number | null = null;
  
  // Nested block editing state
  editingNestedBlockId: string | null = null;

  constructor(private sanitizer: DomSanitizer) {
    // Listen for global drag events
    document.addEventListener('dragstart', () => {
      this.isDragging = true;
    });
    
    document.addEventListener('dragend', () => {
      this.isDragging = false;
      this.draggedComponentType = null;
      this.dragOverColumnIndex = null;
    });
  }

  getContent(): ColumnsContent {
    const content = this.data.content || { columnCount: 2, columns: [] };
    
    // Defensive programming: ensure columns array exists and fix any corrupted data
    if (!content.columns) {
      content.columns = [];
    }
    
    // Fix any columns that might have objects in their content field
    content.columns = content.columns.map((column: ColumnData) => {
      if (typeof column.content === 'object' && column.content !== null) {
        console.warn('Found object in column.content, clearing it:', column.content);
        return { ...column, content: '' };
      }
      return column;
    });
    
    return content;
  }

  getSafeHtml(content: string): SafeHtml {
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

  startColumnContentEdit(columnIndex: number, event: Event) {
    if (!this.isPreview) {
      event.stopPropagation();
      // Could emit a specific event for column editing if needed
      this.editingChange.emit(true);
    }
  }

  updateColumnCount(event: Event) {
    const newCount = parseInt((event.target as HTMLSelectElement).value);
    const content = this.getContent();
    const newColumns: ColumnData[] = [];
    
    for (let i = 0; i < newCount; i++) {
      newColumns.push(content.columns?.[i] || { content: '', width: 'auto' });
    }
    
    this.contentChange.emit({
      ...content,
      columnCount: newCount,
      columns: newColumns
    });
  }

  updateGap(event: Event) {
    const gap = (event.target as HTMLSelectElement).value;
    this.contentChange.emit({
      ...this.getContent(),
      gap
    });
  }

  updateColumnWidth(columnIndex: number, event: Event) {
    const width = (event.target as HTMLInputElement).value;
    const content = this.getContent();
    const columns = [...content.columns];
    
    if (columns[columnIndex]) {
      columns[columnIndex] = { ...columns[columnIndex], width };
      this.contentChange.emit({
        ...content,
        columns
      });
    }
  }

  updateColumnContent(columnIndex: number, event: Event) {
    const target = event.target as HTMLElement;
    const newContent = target.innerHTML;
    const content = this.getContent();
    const columns = [...content.columns];
    
    if (columns[columnIndex]) {
      columns[columnIndex] = { ...columns[columnIndex], content: newContent };
      this.contentChange.emit({
        ...content,
        columns
      });
    }
  }

  // Drag and drop methods for nested blocks
  onDragOver(event: DragEvent, columnIndex: number) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverColumnIndex = columnIndex;
  }

  onDragLeave(event: DragEvent) {
    // Only clear if we're leaving the column entirely
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      this.dragOverColumnIndex = null;
    }
  }

  onDrop(event: DragEvent, columnIndex: number, blockIndex?: number) {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Columns Block - Drop event received:', { columnIndex, blockIndex });
    console.log('Columns Block - Available data types:', event.dataTransfer?.types);
    
    // Try multiple data formats to get the component type
    let componentType: string | null = null;
    
    // Try custom format first
    componentType = event.dataTransfer?.getData('application/x-component-type') || null;
    console.log('Columns Block - Custom format data:', componentType);
    
    // Fall back to text/plain
    if (!componentType) {
      componentType = event.dataTransfer?.getData('text/plain') || null;
      console.log('Columns Block - Text/plain data:', componentType);
    }
    
    // Try JSON format as last resort
    if (!componentType) {
      try {
        const jsonData = event.dataTransfer?.getData('application/json');
        console.log('Columns Block - JSON data raw:', jsonData);
        if (jsonData) {
          const data = JSON.parse(jsonData);
          componentType = data.type;
          console.log('Columns Block - JSON data parsed:', data);
        }
      } catch (e) {
        console.error('Columns Block - Failed to parse JSON drag data:', e);
      }
    }
    
    console.log('Columns Block - Final component type:', componentType);
    
    if (componentType && this.isValidComponentType(componentType)) {
      console.log('Columns Block - Adding valid component:', componentType);
      this.addBlockToColumn(componentType as DesignBlock['type'], columnIndex, blockIndex);
    } else {
      console.error('Columns Block - Invalid or missing component type:', componentType);
      console.error('Columns Block - Available drag data:', {
        types: event.dataTransfer?.types,
        textPlain: event.dataTransfer?.getData('text/plain'),
        json: event.dataTransfer?.getData('application/json')
      });
    }
    
    this.dragOverColumnIndex = null;
  }

  private isValidComponentType(type: string): type is DesignBlock['type'] {
    return ['text', 'hero', 'image', 'button', 'spacer'].includes(type);
  }

  addBlockToColumn(type: DesignBlock['type'], columnIndex: number, insertIndex?: number) {
    console.log('Adding block to column:', type, columnIndex, insertIndex); // Debug log
    
    const newBlock: DesignBlock = {
      id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
      type,
      content: this.getDefaultContent(type),
      styles: {
        padding: '8px',
        margin: '4px 0',
        backgroundColor: 'transparent',
        textColor: '#000000'
      }
    };
    
    console.log('Created new block:', newBlock); // Debug log
    
    const content = this.getContent();
    const columns = [...content.columns];
    
    // Ensure we have enough columns
    while (columns.length <= columnIndex) {
      columns.push({ content: '', blocks: [] });
    }
    
    // Ensure column exists and has blocks array
    if (!columns[columnIndex]) {
      columns[columnIndex] = { content: '', blocks: [] };
    }
    if (!columns[columnIndex].blocks) {
      columns[columnIndex].blocks = [];
    }
    
    // Clear legacy content when adding blocks
    if (columns[columnIndex].content) {
      columns[columnIndex].content = '';
    }
    
    const blocks = [...columns[columnIndex].blocks!];
    if (insertIndex !== undefined) {
      blocks.splice(insertIndex, 0, newBlock);
    } else {
      blocks.push(newBlock);
    }
    
    columns[columnIndex].blocks = blocks;
    
    const newContent = {
      ...content,
      columns
    };
    
    console.log('Emitting new content:', newContent); // Debug log
    
    this.contentChange.emit(newContent);
  }

  getDefaultContent(type: DesignBlock['type']): any {
    switch (type) {
      case 'text':
        return '<p>Enter your text here</p>'; // Text block expects HTML content directly
      case 'hero':
        return { 
          title: 'Hero Title',
          subtitle: 'Hero subtitle text',
          backgroundImage: '',
          alignment: 'center'
        };
      case 'image':
        return { 
          src: '',
          alt: 'Image description',
          width: '100%',
          height: 'auto'
        };
      case 'button':
        return {
          text: 'Click me',
          url: '#',
          style: 'primary'
        };
      case 'spacer':
        return { height: '20px' };
      default:
        return {};
    }
  }

  updateNestedBlockContent(columnIndex: number, blockId: string, newContent: any) {
    const content = this.getContent();
    const columns = [...content.columns];
    
    if (columns[columnIndex]?.blocks) {
      const blocks = [...columns[columnIndex].blocks!];
      const blockIndex = blocks.findIndex(b => b.id === blockId);
      
      if (blockIndex >= 0) {
        blocks[blockIndex] = { ...blocks[blockIndex], content: newContent };
        columns[columnIndex].blocks = blocks;
        
        this.contentChange.emit({
          ...content,
          columns
        });
      }
    }
  }

  deleteNestedBlock(columnIndex: number, blockId: string) {
    const content = this.getContent();
    const columns = [...content.columns];
    
    if (columns[columnIndex]?.blocks) {
      const blocks = columns[columnIndex].blocks!.filter(b => b.id !== blockId);
      columns[columnIndex].blocks = blocks;
      
      this.contentChange.emit({
        ...content,
        columns
      });
    }
  }

  // Nested block editing methods
  startNestedBlockEdit(blockId: string) {
    this.editingNestedBlockId = blockId;
  }

  finishNestedBlockEdit() {
    this.editingNestedBlockId = null;
  }

  onNestedBlockEditingChange(blockId: string, isEditing: boolean) {
    if (isEditing) {
      this.editingNestedBlockId = blockId;
    } else {
      this.editingNestedBlockId = null;
    }
  }
}
