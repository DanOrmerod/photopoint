import { ComponentFixture, TestBed } from '@angular/core/testing';
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
    ownerId: 'user1',
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
    mockThemeService = jasmine.createSpyObj('ThemeService', ['getCurrentTheme']);
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
    mockThemeService.getCurrentTheme.and.returnValue(of({ name: 'default', colors: {} }));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load page data on init', async () => {
    await component.ngOnInit();
    
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
    const mockEvent = new DragEvent('dragstart');
    const componentType = 'text';
    
    component.onDragStart(mockEvent, componentType);
    expect(component.isDragging()).toBe(true);
    expect(component.draggedComponentType()).toBe(componentType);
    
    component.onDragEnd();
    expect(component.isDragging()).toBe(false);
    expect(component.draggedComponentType()).toBe(null);
  });

  it('should add new blocks', () => {
    const initialBlocksLength = component.designBlocks().length;
    
    component.addBlock('text', 0);
    
    expect(component.designBlocks().length).toBe(initialBlocksLength + 1);
    expect(component.designBlocks()[0].type).toBe('text');
  });

  it('should update block content', () => {
    // First add a block
    component.addBlock('text', 0);
    const blockId = component.designBlocks()[0].id;
    const newContent = { text: 'Updated text' };
    
    component.updateBlockContent(blockId, newContent);
    
    const updatedBlock = component.designBlocks().find(b => b.id === blockId);
    expect(updatedBlock?.content).toEqual(newContent);
  });

  it('should delete blocks', () => {
    // First add a block
    component.addBlock('text', 0);
    const blockId = component.designBlocks()[0].id;
    const initialLength = component.designBlocks().length;
    
    component.deleteBlock(blockId);
    
    expect(component.designBlocks().length).toBe(initialLength - 1);
    expect(component.selectedBlockId()).toBe(null);
    expect(component.editingBlockId()).toBe(null);
  });

  it('should move blocks up', () => {
    // Add two blocks
    component.addBlock('text', 0);
    component.addBlock('hero', 1);
    
    const firstBlockId = component.designBlocks()[0].id;
    const secondBlockId = component.designBlocks()[1].id;
    
    component.moveBlockUp(secondBlockId);
    
    expect(component.designBlocks()[0].id).toBe(secondBlockId);
    expect(component.designBlocks()[1].id).toBe(firstBlockId);
  });

  it('should move blocks down', () => {
    // Add two blocks
    component.addBlock('text', 0);
    component.addBlock('hero', 1);
    
    const firstBlockId = component.designBlocks()[0].id;
    const secondBlockId = component.designBlocks()[1].id;
    
    component.moveBlockDown(firstBlockId);
    
    expect(component.designBlocks()[0].id).toBe(secondBlockId);
    expect(component.designBlocks()[1].id).toBe(firstBlockId);
  });

  it('should duplicate blocks', () => {
    // Add a block
    component.addBlock('text', 0);
    const originalBlockId = component.designBlocks()[0].id;
    const initialLength = component.designBlocks().length;
    
    component.duplicateBlock(originalBlockId);
    
    expect(component.designBlocks().length).toBe(initialLength + 1);
    expect(component.designBlocks()[1].type).toBe('text');
    expect(component.designBlocks()[1].id).not.toBe(originalBlockId);
  });

  it('should save page', async () => {
    const blocks = [{ id: '1', type: 'text', content: { text: 'Test' } }];
    component.designBlocks.set(blocks as any);
    
    await component.savePage();
    
    expect(mockWebsiteService.updatePage).toHaveBeenCalledWith(
      '1', 
      '1', 
      { content: JSON.stringify(blocks) }
    );
  });

  it('should navigate back to pages', () => {
    component.goBack();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/cms/websites', '1', 'pages']);
  });

  it('should open preview window', () => {
    spyOn(window, 'open');
    
    component.openPreviewWindow();
    
    expect(window.open).toHaveBeenCalledWith(
      '/preview/1/1', 
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
