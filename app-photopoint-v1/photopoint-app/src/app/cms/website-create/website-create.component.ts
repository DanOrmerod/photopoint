import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { WebsiteService } from '../../services/website.service';
import { CreateWebsiteRequest } from '../../models/website.model';
import { TemplateService, Template } from '../../services/template.service';
import { TemplateSelectorComponent } from '../template-selector/template-selector.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-website-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TemplateSelectorComponent],
  template: `
    <div class="create-website-container">
      <div class="header">
        <button class="back-btn" routerLink="/websites">
          <i class="fas fa-arrow-left"></i>
          Back to Websites
        </button>
        <h1>Create New Website</h1>
      </div>

      <div class="form-container">
        <form [formGroup]="websiteForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name">Website Name *</label>
            <input
              type="text"
              id="name"
              formControlName="name"
              placeholder="Enter your website name"
              class="form-control"
              (input)="onNameChange()"
            />
            @if (websiteForm.get('name')?.invalid && websiteForm.get('name')?.touched) {
              <div class="error-message">
                @if (websiteForm.get('name')?.errors?.['required']) {
                  Website name is required
                }
                @if (websiteForm.get('name')?.errors?.['minlength']) {
                  Website name must be at least 2 characters
                }
                @if (websiteForm.get('name')?.errors?.['maxlength']) {
                  Website name cannot exceed 100 characters
                }
              </div>
            }
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              formControlName="description"
              placeholder="Brief description of your website"
              class="form-control"
              rows="3"
            ></textarea>
            @if (websiteForm.get('description')?.invalid && websiteForm.get('description')?.touched) {
              <div class="error-message">
                Description cannot exceed 500 characters
              </div>
            }
          </div>

          <div class="form-group">
            <label for="subdomain">Subdomain *</label>
            <div class="subdomain-input">
              <input
                type="text"
                id="subdomain"
                formControlName="subdomain"
                placeholder="your-site"
                class="form-control"
                (input)="onSubdomainChange()"
              />
              <span class="domain-suffix">.{{ environment.viewerDomain }}</span>
            </div>
            @if (websiteForm.get('subdomain')?.invalid && websiteForm.get('subdomain')?.touched) {
              <div class="error-message">
                @if (websiteForm.get('subdomain')?.errors?.['required']) {
                  Subdomain is required
                }
                @if (websiteForm.get('subdomain')?.errors?.['pattern']) {
                  Subdomain can only contain lowercase letters, numbers, and hyphens
                }
                @if (websiteForm.get('subdomain')?.errors?.['minlength']) {
                  Subdomain must be at least 3 characters
                }
                @if (websiteForm.get('subdomain')?.errors?.['maxlength']) {
                  Subdomain cannot exceed 63 characters
                }
                @if (websiteForm.get('subdomain')?.errors?.['unavailable']) {
                  This subdomain is already taken
                }
              </div>
            }
            <div class="help-text">
              Your website will be available at <strong>{{ getPreviewUrl() }}</strong>
            </div>
          </div>

          <div class="form-group">
            <label for="customDomain">Custom Domain (Optional)</label>
            <input
              type="text"
              id="customDomain"
              formControlName="customDomain"
              placeholder="www.yoursite.com"
              class="form-control"
            />
            @if (websiteForm.get('customDomain')?.invalid && websiteForm.get('customDomain')?.touched) {
              <div class="error-message">
                Please enter a valid domain name
              </div>
            }
            <div class="help-text">
              You can connect your custom domain later in website settings
            </div>
          </div>

          <div class="form-group">
            <label>Choose a Template</label>
            <p class="field-description">
              Start with a professionally designed template that fits your needs. You can customize it later.
            </p>
            
            @if (selectedTemplate()) {
              <div class="selected-template">
                <div class="template-preview-small" [innerHTML]="getTemplatePreview(selectedTemplate()!)"></div>
                <div class="template-info">
                  <h4>{{ selectedTemplate()!.name }}</h4>
                  <p>{{ selectedTemplate()!.description }}</p>
                  <span class="template-category">{{ getCategoryDisplayName(selectedTemplate()!.category) }}</span>
                </div>
                <button type="button" class="btn btn-outline-sm" (click)="showTemplateSelector()">
                  Change Template
                </button>
              </div>
            } @else {
              <div class="template-placeholder">
                <i class="fas fa-palette"></i>
                <p>No template selected</p>
                <button type="button" class="btn btn-primary" (click)="showTemplateSelector()">
                  <i class="fas fa-th-large"></i>
                  Browse Templates
                </button>
              </div>
            }
          </div>

          <div class="form-actions">
            <button
              type="button"
              class="btn btn-outline"
              routerLink="/websites"
              [disabled]="creating()"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="websiteForm.invalid || creating()"
            >
              @if (creating()) {
                <div class="spinner-sm"></div>
                Creating...
              } @else {
                <i class="fas fa-plus"></i>
                Create Website
              }
            </button>
          </div>
        </form>
      </div>

      @if (error()) {
        <div class="error-alert">
          <i class="fas fa-exclamation-triangle"></i>
          <span>{{ error() }}</span>
        </div>
      }

      <!-- Template Selector Overlay -->
      @if (showingTemplateSelector()) {
        <app-template-selector
          (templateSelected)="onTemplateSelected($event)"
          (close)="hideTemplateSelector()"
        ></app-template-selector>
      }
    </div>
  `,
  styleUrl: './website-create.component.scss'
})
export class WebsiteCreateComponent {
  environment = environment;
  websiteForm: FormGroup;
  creating = signal(false);
  error = signal<string | null>(null);
  selectedTemplate = signal<Template | null>(null);
  showingTemplateSelector = signal(false);

  constructor(
    private fb: FormBuilder,
    private websiteService: WebsiteService,
    private templateService: TemplateService,
    private router: Router
  ) {
    this.websiteForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      subdomain: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(63),
        Validators.pattern(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/)
      ]],
      customDomain: ['', [Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/)]],
      template: ['']
    });
  }

  onNameChange() {
    const name = this.websiteForm.get('name')?.value;
    if (name && !this.websiteForm.get('subdomain')?.dirty) {
      const suggestedSubdomain = this.websiteService.generateSubdomainSuggestion(name);
      this.websiteForm.patchValue({ subdomain: suggestedSubdomain });
    }
  }

  onSubdomainChange() {
    const subdomain = this.websiteForm.get('subdomain')?.value;
    if (subdomain) {
      // Mark as dirty to prevent auto-generation from name changes
      this.websiteForm.get('subdomain')?.markAsDirty();
      
      // Basic validation - could add async validator for availability check
      if (this.websiteService.isValidSubdomain(subdomain)) {
        this.websiteForm.get('subdomain')?.setErrors(null);
      }
    }
  }

  getPreviewUrl(): string {
    const subdomain = this.websiteForm.get('subdomain')?.value || 'your-site';
    return `${subdomain}.${environment.viewerDomain}`;
  }

  showTemplateSelector() {
    this.showingTemplateSelector.set(true);
  }

  hideTemplateSelector() {
    this.showingTemplateSelector.set(false);
  }

  onTemplateSelected(template: Template) {
    this.selectedTemplate.set(template);
    this.websiteForm.patchValue({ template: template.id });
    this.hideTemplateSelector();
  }

  getCategoryDisplayName(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
  }

  getTemplatePreview(template: Template): string {
    return this.templateService.generateTemplatePreview(template);
  }

  async onSubmit() {
    if (this.websiteForm.invalid || !this.selectedTemplate()) {
      this.markFormGroupTouched();
      if (!this.selectedTemplate()) {
        this.error.set('Please select a template for your website.');
      }
      return;
    }

    this.creating.set(true);
    this.error.set(null);

    try {
      const formValue = this.websiteForm.value;
      const template = this.selectedTemplate()!;
      
      console.log('Creating website with template:', template);
      console.log('Form value:', formValue);
      
      const websiteData: CreateWebsiteRequest = {
        name: formValue.name,
        description: formValue.description || undefined,
        subdomain: formValue.subdomain,
        customDomain: formValue.customDomain || undefined,
        theme: template.theme.id,
        templateId: template.id
      };

      console.log('Website data:', websiteData);
      console.log('Creating website with template:', template);
      
      const website = await this.websiteService.createWebsite(websiteData);
      console.log('Created website response:', website);
      console.log('Website type:', typeof website);
      console.log('Website ID:', website?.id);
      
      if (!website) {
        throw new Error('Failed to create website - createWebsite returned null/undefined');
      }
      
      if (!website.id) {
        console.error('Website object missing ID:', website);
        throw new Error('Failed to create website - website object missing ID property');
      }
      
      console.log('Successfully created website with ID:', website.id);
      
      // Apply the template to the new website
      if (template) {
        console.log('Applying template:', template.id, 'to website:', website.id);
        await this.templateService.applyTemplate(website.id, template);
      }
      
      // Redirect to the new website's dashboard
      console.log('Navigating to dashboard:', ['/websites', website.id]);
      await this.router.navigate(['/websites', website.id]);
    } catch (error) {
      console.error('Failed to create website:', error);
      this.error.set('Failed to create website. Please try again.');
    } finally {
      this.creating.set(false);
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.websiteForm.controls).forEach(key => {
      const control = this.websiteForm.get(key);
      control?.markAsTouched();
    });
  }
}
