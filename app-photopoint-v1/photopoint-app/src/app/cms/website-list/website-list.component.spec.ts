import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { WebsiteListComponent } from './website-list.component';
import { WebsiteService } from '../../services/website.service';

describe('WebsiteListComponent', () => {
  let component: WebsiteListComponent;
  let fixture: ComponentFixture<WebsiteListComponent>;
  let mockWebsiteService: jasmine.SpyObj<WebsiteService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('WebsiteService', ['getWebsites', 'deleteWebsite']);

    await TestBed.configureTestingModule({
      imports: [WebsiteListComponent, RouterTestingModule],
      providers: [
        { provide: WebsiteService, useValue: spy }
      ]
    })
    .compileComponents();

    mockWebsiteService = TestBed.inject(WebsiteService) as jasmine.SpyObj<WebsiteService>;
    fixture = TestBed.createComponent(WebsiteListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load websites on init', () => {
    mockWebsiteService.getWebsites.and.returnValue(Promise.resolve([]));
    component.ngOnInit();
    expect(mockWebsiteService.getWebsites).toHaveBeenCalled();
  });

  it('should show empty state when no websites', () => {
    component.websites.set([]);
    component.loading.set(false);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')).toBeTruthy();
  });
});
