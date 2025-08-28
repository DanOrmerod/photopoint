import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { WebsiteCreateComponent } from './website-create.component';
import { WebsiteService } from '../../services/website.service';
import { TemplateService } from '../../services/template.service';

describe('WebsiteCreateComponent', () => {
  let component: WebsiteCreateComponent;
  let fixture: ComponentFixture<WebsiteCreateComponent>;
  let mockWebsiteService: jasmine.SpyObj<WebsiteService>;
  let mockTemplateService: jasmine.SpyObj<TemplateService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const websiteServiceSpy = jasmine.createSpyObj('WebsiteService', ['createWebsite', 'checkSubdomainAvailability']);
    const templateServiceSpy = jasmine.createSpyObj('TemplateService', ['getTemplates']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [WebsiteCreateComponent, ReactiveFormsModule],
      providers: [
        { provide: WebsiteService, useValue: websiteServiceSpy },
        { provide: TemplateService, useValue: templateServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WebsiteCreateComponent);
    component = fixture.componentInstance;
    mockWebsiteService = TestBed.inject(WebsiteService) as jasmine.SpyObj<WebsiteService>;
    mockTemplateService = TestBed.inject(TemplateService) as jasmine.SpyObj<TemplateService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Setup default mock returns
    mockTemplateService.getTemplates.and.returnValue(of([]));
    mockWebsiteService.checkSubdomainAvailability.and.returnValue(of(true));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with a form', () => {
    expect(component.websiteForm).toBeDefined();
    expect(component.websiteForm.get('name')).toBeDefined();
    expect(component.websiteForm.get('description')).toBeDefined();
    expect(component.websiteForm.get('subdomain')).toBeDefined();
    expect(component.websiteForm.get('customDomain')).toBeDefined();
  });

  it('should require name field', () => {
    const nameControl = component.websiteForm.get('name');
    expect(nameControl?.hasError('required')).toBeTruthy();
    
    nameControl?.setValue('Test Website');
    expect(nameControl?.hasError('required')).toBeFalsy();
  });

  it('should require subdomain field', () => {
    const subdomainControl = component.websiteForm.get('subdomain');
    expect(subdomainControl?.hasError('required')).toBeTruthy();
    
    subdomainControl?.setValue('test-site');
    expect(subdomainControl?.hasError('required')).toBeFalsy();
  });

  it('should validate subdomain format', () => {
    const subdomainControl = component.websiteForm.get('subdomain');
    
    subdomainControl?.setValue('invalid_subdomain');
    expect(subdomainControl?.hasError('pattern')).toBeTruthy();
    
    subdomainControl?.setValue('valid-subdomain');
    expect(subdomainControl?.hasError('pattern')).toBeFalsy();
  });

  it('should show template selector', () => {
    expect(component.showingTemplateSelector()).toBeFalsy();
    
    component.showTemplateSelector();
    expect(component.showingTemplateSelector()).toBeTruthy();
  });

  it('should hide template selector', () => {
    component.showTemplateSelector();
    expect(component.showingTemplateSelector()).toBeTruthy();
    
    component.hideTemplateSelector();
    expect(component.showingTemplateSelector()).toBeFalsy();
  });

  it('should handle template selection', () => {
    const mockTemplate = {
      id: '1',
      name: 'Test Template',
      description: 'Test Description',
      category: 'business',
      preview: 'preview-content',
      isActive: true
    };

    component.onTemplateSelected(mockTemplate);
    expect(component.selectedTemplate()).toEqual(mockTemplate);
    expect(component.showingTemplateSelector()).toBeFalsy();
  });

  it('should generate preview URL', () => {
    component.websiteForm.get('subdomain')?.setValue('test-site');
    const previewUrl = component.getPreviewUrl();
    expect(previewUrl).toContain('test-site');
  });

  it('should validate form before submission', () => {
    spyOn(component, 'onSubmit').and.callThrough();
    
    // Form should be invalid initially
    expect(component.websiteForm.valid).toBeFalsy();
    
    // Fill required fields
    component.websiteForm.patchValue({
      name: 'Test Website',
      subdomain: 'test-site'
    });
    
    expect(component.websiteForm.valid).toBeTruthy();
  });

  it('should create website on valid form submission', () => {
    mockWebsiteService.createWebsite.and.returnValue(of({
      id: '1',
      name: 'Test Website',
      subdomain: 'test-site',
      description: '',
      customDomain: null,
      templateId: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    component.websiteForm.patchValue({
      name: 'Test Website',
      subdomain: 'test-site'
    });

    component.onSubmit();

    expect(mockWebsiteService.createWebsite).toHaveBeenCalled();
  });
});
