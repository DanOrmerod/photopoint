import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextBlockComponent } from './text-block.component';

describe('TextBlockComponent', () => {
  let component: TextBlockComponent;
  let fixture: ComponentFixture<TextBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextBlockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TextBlockComponent);
    component = fixture.componentInstance;
    component.data = { id: '1', type: 'text', content: 'Test content' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display content', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.text-content')).toBeTruthy();
  });

  it('should start editing on double click', () => {
    spyOn(component.editingChange, 'emit');
    component.startEditing();
    expect(component.editingChange.emit).toHaveBeenCalledWith(true);
  });
});
