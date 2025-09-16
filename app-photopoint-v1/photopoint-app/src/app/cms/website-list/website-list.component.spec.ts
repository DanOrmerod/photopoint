import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { WebsiteListComponent } from './website-list.component';
import { WebsiteService } from '../../services/website.service';

describe('WebsiteListComponent', () => {
  let component: WebsiteListComponent;
  let fixture: ComponentFixture<WebsiteListComponent>;
  let mockWebsiteService: jasmine.SpyObj<WebsiteService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('WebsiteService', ['getWebsites', 'deleteWebsite']);
    spy.getWebsites.and.returnValue(Promise.resolve([]));

    await TestBed.configureTestingModule({
      imports: [WebsiteListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: WebsiteService, useValue: spy }
      ]
    })
    .compileComponents();

    mockWebsiteService = TestBed.inject(WebsiteService) as jasmine.SpyObj<WebsiteService>;
    fixture = TestBed.createComponent(WebsiteListComponent);
    component = fixture.componentInstance;
    
    // Don't stub loadWebsites for the specific test that needs to test it
    // spyOn(component, 'loadWebsites').and.stub();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load websites on init', async () => {
    // Reset any previous calls that might have happened during component creation
    mockWebsiteService.getWebsites.calls.reset();
    
    // Set up the mock return value
    mockWebsiteService.getWebsites.and.returnValue(Promise.resolve([
      { id: '1', name: 'Test Website', subdomain: 'test' } as any
    ]));
    
    // Call the method directly
    await component.loadWebsites();
    
    // Verify the service was called
    expect(mockWebsiteService.getWebsites).toHaveBeenCalled();
    expect(component.websites().length).toBe(1);
  });

  it('should show empty state when no websites', async () => {
    // Explicitly set all signal states to ensure proper conditions
    component.websites.set([]);
    component.loading.set(false);
    component.error.set(null);
    
    // Force multiple change detection cycles
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')).toBeTruthy();
  });
});
