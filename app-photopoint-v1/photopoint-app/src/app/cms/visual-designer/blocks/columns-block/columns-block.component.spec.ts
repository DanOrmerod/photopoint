import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { ColumnsBlockComponent } from './columns-block.component';

describe('ColumnsBlockComponent', () => {
  let component: ColumnsBlockComponent;
  let fixture: ComponentFixture<ColumnsBlockComponent>;
  let mockSanitizer: jasmine.SpyObj<DomSanitizer>;

  beforeEach(async () => {
    const sanitizerSpy = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustHtml']);

    await TestBed.configureTestingModule({
      imports: [ColumnsBlockComponent],
      providers: [
        { provide: DomSanitizer, useValue: sanitizerSpy }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ColumnsBlockComponent);
    component = fixture.componentInstance;
    mockSanitizer = TestBed.inject(DomSanitizer) as jasmine.SpyObj<DomSanitizer>;
    
    // Setup default component inputs
    component.data = {
      id: 'test-columns',
      type: 'columns',
      content: {
        columnCount: 2,
        columns: [
          { content: 'Column 1 content', width: 'auto' },
          { content: 'Column 2 content', width: 'auto' }
        ],
        gap: '16px'
      },
      styles: {}
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get default content when no content is provided', () => {
    component.data.content = undefined;
    const content = component.getContent();
    expect(content).toEqual({ columnCount: 2, columns: [] });
  });

  it('should get content correctly', () => {
    const content = component.getContent();
    expect(content.columnCount).toBe(2);
    expect(content.columns).toHaveSize(2);
    expect(content.gap).toBe('16px');
  });

  it('should emit editingChange when starting editing', () => {
    spyOn(component.editingChange, 'emit');
    component.isPreview = false;
    
    component.startEditing();
    
    expect(component.editingChange.emit).toHaveBeenCalledWith(true);
  });

  it('should not start editing in preview mode', () => {
    spyOn(component.editingChange, 'emit');
    component.isPreview = true;
    
    component.startEditing();
    
    expect(component.editingChange.emit).not.toHaveBeenCalled();
  });

  it('should emit editingChange when finishing editing', () => {
    spyOn(component.editingChange, 'emit');
    
    component.finishEditing();
    
    expect(component.editingChange.emit).toHaveBeenCalledWith(false);
  });

  it('should update column count correctly', () => {
    spyOn(component.contentChange, 'emit');
    const mockEvent = {
      target: { value: '3' }
    } as any;

    component.updateColumnCount(mockEvent);

    expect(component.contentChange.emit).toHaveBeenCalledWith({
      columnCount: 3,
      columns: [
        { content: 'Column 1 content', width: 'auto' },
        { content: 'Column 2 content', width: 'auto' },
        { content: '', width: 'auto' }
      ],
      gap: '16px'
    });
  });

  it('should update gap correctly', () => {
    spyOn(component.contentChange, 'emit');
    const mockEvent = {
      target: { value: '24px' }
    } as any;

    component.updateGap(mockEvent);

    expect(component.contentChange.emit).toHaveBeenCalledWith({
      columnCount: 2,
      columns: [
        { content: 'Column 1 content', width: 'auto' },
        { content: 'Column 2 content', width: 'auto' }
      ],
      gap: '24px'
    });
  });

  it('should update column width correctly', () => {
    spyOn(component.contentChange, 'emit');
    const mockEvent = {
      target: { value: '50%' }
    } as any;

    component.updateColumnWidth(0, mockEvent);

    expect(component.contentChange.emit).toHaveBeenCalledWith({
      columnCount: 2,
      columns: [
        { content: 'Column 1 content', width: '50%' },
        { content: 'Column 2 content', width: 'auto' }
      ],
      gap: '16px'
    });
  });

  it('should update column content correctly', () => {
    spyOn(component.contentChange, 'emit');
    const mockEvent = {
      target: { innerHTML: 'Updated content' }
    } as any;

    component.updateColumnContent(0, mockEvent);

    expect(component.contentChange.emit).toHaveBeenCalledWith({
      columnCount: 2,
      columns: [
        { content: 'Updated content', width: 'auto' },
        { content: 'Column 2 content', width: 'auto' }
      ],
      gap: '16px'
    });
  });

  it('should sanitize HTML content', () => {
    const testContent = '<p>Test content</p>';
    const sanitizedContent = 'SANITIZED_CONTENT';
    mockSanitizer.bypassSecurityTrustHtml.and.returnValue(sanitizedContent as any);

    const result = component.getSafeHtml(testContent);

    expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(testContent);
    expect(result).toBe(sanitizedContent);
  });

  it('should start column content edit when not in preview mode', () => {
    spyOn(component.editingChange, 'emit');
    const mockEvent = {
      stopPropagation: jasmine.createSpy('stopPropagation')
    } as any;
    component.isPreview = false;

    component.startColumnContentEdit(0, mockEvent);

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(component.editingChange.emit).toHaveBeenCalledWith(true);
  });

  it('should not start column content edit in preview mode', () => {
    spyOn(component.editingChange, 'emit');
    const mockEvent = {
      stopPropagation: jasmine.createSpy('stopPropagation')
    } as any;
    component.isPreview = true;

    component.startColumnContentEdit(0, mockEvent);

    expect(component.editingChange.emit).not.toHaveBeenCalled();
  });
});
