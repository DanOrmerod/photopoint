import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { VisualDesignerComponent } from './visual-designer.component';
import { WebsiteService } from '../../services/website.service';
import { ThemeService } from '../../services/theme.service';

describe('VisualDesignerComponent', () => {
  let component: VisualDesignerComponent;
  let fixture: ComponentFixture<VisualDesignerComponent>;
  let mockWebsiteService: jasmine.SpyObj<WebsiteService>;
  let mockThemeService: jasmine.SpyObj<ThemeService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockWebsite = {
    id: '1',
    name: 'Test Website',
    description: 'Test Description',
    subdomain: 'test',
    status: 'draft' as const,
    theme: 'default',
    accountId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockPage = {
    id: '1',
    websiteId: '1',
    title: 'Test Page',
    slug: 'test-page',
    content: '[]',
    isHomePage: false,
    isPublished: false,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    mockWebsiteService = jasmine.createSpyObj('WebsiteService', ['getWebsite', 'getPage', 'updatePage']);
    mockThemeService = jasmine.createSpyObj('ThemeService', ['getThemes', 'getThemeById', 'applyTheme']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [VisualDesignerComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: WebsiteService, useValue: mockWebsiteService },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VisualDesignerComponent);
    component = fixture.componentInstance;

    // Setup default mock returns
    mockWebsiteService.getWebsite.and.returnValue(Promise.resolve(mockWebsite));
    mockWebsiteService.getPage.and.returnValue(Promise.resolve(mockPage));
    mockWebsiteService.updatePage.and.returnValue(Promise.resolve(mockPage));
    mockThemeService.getThemes.and.returnValue([{
      id: 'default',
      name: 'Default Theme',
      description: 'Default theme',
      category: 'business' as const,
      preview: {
        primaryColor: '#000',
        secondaryColor: '#666',
        backgroundColor: '#fff',
        textColor: '#000',
        accentColor: '#007bff'
      },
      styles: {
        typography: {
          fontFamily: 'Arial',
          fontSize: '16px',
          lineHeight: '1.5',
          headingWeight: '600',
          bodyWeight: '400'
        },
        colors: {
          primary: '#000',
          secondary: '#666',
          accent: '#007bff',
          background: '#fff',
          surface: '#f8f9fa',
          text: '#000',
          textLight: '#666',
          border: '#dee2e6',
          success: '#28a745',
          warning: '#ffc107',
          error: '#dc3545'
        },
        layout: {
          containerWidth: '1200px',
          borderRadius: '4px',
          shadows: {
            small: '0 1px 3px rgba(0,0,0,0.1)',
            medium: '0 4px 6px rgba(0,0,0,0.1)',
            large: '0 10px 15px rgba(0,0,0,0.1)'
          },
          spacing: {
            xs: '0.25rem',
            sm: '0.5rem',
            md: '1rem',
            lg: '1.5rem',
            xl: '3rem',
            xxl: '4rem'
          }
        },
        components: {
          button: {
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            fontWeight: '400',
            textTransform: 'none'
          },
          card: {
            padding: '1rem',
            borderRadius: '4px',
            shadow: '0 1px 3px rgba(0,0,0,0.1)',
            background: '#fff'
          }
        }
      },
      cssVariables: {
        '--primary-color': '#000',
        '--background-color': '#fff'
      }
    }]);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load page data on init', async () => {
    await component.loadPage();
    
    expect(mockWebsiteService.getWebsite).toHaveBeenCalledWith('1');
    expect(mockWebsiteService.getPage).toHaveBeenCalledWith('1', '1');
    expect(component.website()).toEqual(mockWebsite);
    expect(component.page()).toEqual(mockPage);
  });

  it('should parse blocks from page content', async () => {
    const pageWithBlocks = {
      ...mockPage,
      content: '[{"id": "1", "type": "text", "content": {"text": "Hello World"}}]'
    };
    mockWebsiteService.getPage.and.returnValue(Promise.resolve(pageWithBlocks));
    
    await component.loadPage();
    
    expect(component.designBlocks().length).toBe(1);
    expect(component.designBlocks()[0].type).toBe('text');
  });

  it('should handle empty page content', async () => {
    const pageWithEmptyContent = {
      ...mockPage,
      content: ''
    };
    mockWebsiteService.getPage.and.returnValue(Promise.resolve(pageWithEmptyContent));
    
    await component.loadPage();
    
    expect(component.designBlocks().length).toBe(0);
  });

  it('should toggle preview mode', () => {
    expect(component.isPreview()).toBe(false);
    
    component.setPreview(true);
    expect(component.isPreview()).toBe(true);
    
    component.setPreview(false);
    expect(component.isPreview()).toBe(false);
  });

  it('should select blocks', () => {
    const blockId = 'test-block';
    
    component.selectBlock(blockId);
    expect(component.selectedBlockId()).toBe(blockId);
  });

  it('should start block editing', () => {
    const blockId = 'test-block';
    
    component.startBlockEdit(blockId);
    expect(component.editingBlockId()).toBe(blockId);
  });

  it('should handle drag operations', () => {
    const componentType = 'text';
    
    // Test isDragging signal directly
    component.isDragging.set(true);
    expect(component.isDragging()).toBe(true);
    
    component.draggedComponentType.set(componentType);
    expect(component.draggedComponentType()).toBe(componentType);
    
    // Test reset
    component.isDragging.set(false);
    component.draggedComponentType.set(null);
    expect(component.isDragging()).toBe(false);
    expect(component.draggedComponentType()).toBe(null);
  });

  it('should add new blocks', () => {
    const initialBlocksLength = component.designBlocks().length;
    
    component.addBlockAtIndex('text', 0);
    
    expect(component.designBlocks().length).toBe(initialBlocksLength + 1);
    expect(component.designBlocks()[0].type).toBe('text');
  });

  it('should update block content', () => {
    // First add a block
    component.addBlockAtIndex('text', 0);
    const blockId = component.designBlocks()[0].id;
    const newContent = { text: 'Updated text' };
    
    component.updateBlockContent(blockId, newContent);
    
    const updatedBlock = component.designBlocks().find(b => b.id === blockId);
    expect(updatedBlock?.content).toEqual(newContent);
  });

  it('should delete blocks', () => {
    // First add a block
    component.addBlockAtIndex('text', 0);
    const blockId = component.designBlocks()[0].id;
    const initialLength = component.designBlocks().length;
    
    component.deleteBlock(blockId);
    
    expect(component.designBlocks().length).toBe(initialLength - 1);
    expect(component.selectedBlockId()).toBe(null);
    expect(component.editingBlockId()).toBe(null);
  });

  it('should move blocks up', () => {
    // Add two blocks
    component.addBlockAtIndex('text', 0);
    component.addBlockAtIndex('hero', 1);
    
    const firstBlockId = component.designBlocks()[0].id;
    const secondBlockId = component.designBlocks()[1].id;
    
    component.moveBlockUp(secondBlockId);
    
    expect(component.designBlocks()[0].id).toBe(secondBlockId);
    expect(component.designBlocks()[1].id).toBe(firstBlockId);
  });

  it('should move blocks down', () => {
    // Add two blocks
    component.addBlockAtIndex('text', 0);
    component.addBlockAtIndex('hero', 1);
    
    const firstBlockId = component.designBlocks()[0].id;
    const secondBlockId = component.designBlocks()[1].id;
    
    component.moveBlockDown(firstBlockId);
    
    expect(component.designBlocks()[0].id).toBe(secondBlockId);
    expect(component.designBlocks()[1].id).toBe(firstBlockId);
  });

  // Note: duplicateBlock functionality not yet implemented
  // it('should duplicate blocks', () => {
  //   // Add a block
  //   component.addBlockAtIndex('text', 0);
  //   const originalBlockId = component.designBlocks()[0].id;
  //   const initialLength = component.designBlocks().length;
  //   
  //   component.duplicateBlock(originalBlockId);
  //   
  //   expect(component.designBlocks().length).toBe(initialLength + 1);
  //   expect(component.designBlocks()[1].type).toBe('text');
  //   expect(component.designBlocks()[1].id).not.toBe(originalBlockId);
  // });

  it('should save page', async () => {
    const blocks = [{ id: '1', type: 'text', content: { text: 'Test' } }];
    component.designBlocks.set(blocks as any);
    
    await component.savePage();
    
    expect(mockWebsiteService.updatePage).toHaveBeenCalledWith(
      '1', 
      '1', 
      { content: JSON.stringify({ blocks: blocks }) }
    );
  });

  it('should navigate back to pages', () => {
    component.goBack();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/websites', '1']);
  });

  it('should open preview window', () => {
    spyOn(window, 'open');
    
    component.openPreviewWindow();
    
    expect(window.open).toHaveBeenCalledWith(
      '/websites/1/pages/1/preview', 
      '_blank', 
      'width=1200,height=800,scrollbars=yes,resizable=yes'
    );
  });

  it('should switch device views', () => {
    expect(component.selectedDevice()).toBe('desktop');
    
    component.selectedDevice.set('tablet');
    expect(component.selectedDevice()).toBe('tablet');
    
    component.selectedDevice.set('mobile');
    expect(component.selectedDevice()).toBe('mobile');
  });

  it('should handle drag over events', () => {
    const mockEvent = new DragEvent('dragover');
    const mockDataTransfer = {
      dropEffect: 'copy'
    };
    Object.defineProperty(mockEvent, 'dataTransfer', { value: mockDataTransfer, writable: true });
    spyOn(mockEvent, 'preventDefault');
    
    component.onDragOver(mockEvent);
    
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it('should handle drop events', () => {
    const mockEvent = new DragEvent('drop');
    const mockDataTransfer = {
      getData: jasmine.createSpy('getData').and.returnValue('text')
    };
    Object.defineProperty(mockEvent, 'dataTransfer', { value: mockDataTransfer });
    spyOn(mockEvent, 'preventDefault');
    
    component.isDragging.set(true);
    component.draggedComponentType.set('text');
    
    component.onDrop(mockEvent, 0);
    
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(component.designBlocks().length).toBe(1);
    expect(component.designBlocks()[0].type).toBe('text');
  });
});
