import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpacerBlockComponent } from './spacer-block.component';

describe('SpacerBlockComponent', () => {
  let component: SpacerBlockComponent;
  let fixture: ComponentFixture<SpacerBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpacerBlockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpacerBlockComponent);
    component = fixture.componentInstance;
    
    // Setup default component inputs
    component.data = {
      id: 'test-spacer',
      type: 'spacer',
      content: {
        height: '40px'
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
    expect(content).toEqual({});
  });

  it('should get content correctly', () => {
    const content = component.getContent();
    expect(content.height).toBe('40px');
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

  it('should update height correctly', () => {
    spyOn(component.contentChange, 'emit');
    const mockEvent = {
      target: { value: '80px' }
    } as any;

    component.updateHeight(mockEvent);

    expect(component.contentChange.emit).toHaveBeenCalledWith({
      height: '80px'
    });
  });

  it('should preserve existing content when updating height', () => {
    component.data.content = {
      height: '40px'
    };
    
    spyOn(component.contentChange, 'emit');
    const mockEvent = {
      target: { value: '60px' }
    } as any;

    component.updateHeight(mockEvent);

    expect(component.contentChange.emit).toHaveBeenCalledWith({
      height: '60px'
    });
  });

  it('should render spacer with correct height', () => {
    fixture.detectChanges();
    
    const spacerContent = fixture.debugElement.nativeElement.querySelector('.spacer-content');
    expect(spacerContent).toBeTruthy();
  });

  it('should show editing interface when isEditing is true', () => {
    component.isEditing = true;
    fixture.detectChanges();
    
    const editor = fixture.debugElement.nativeElement.querySelector('.inline-spacer-editor');
    expect(editor).toBeTruthy();
    
    const heightInput = fixture.debugElement.nativeElement.querySelector('input[type="text"]');
    expect(heightInput).toBeTruthy();
    expect(heightInput.value).toBe('40px');
  });

  it('should show spacer indicator when not editing', () => {
    component.isEditing = false;
    fixture.detectChanges();
    
    const indicator = fixture.debugElement.nativeElement.querySelector('.spacer-indicator');
    expect(indicator).toBeTruthy();
    expect(indicator.textContent).toContain('Spacer (40px)');
  });
});
