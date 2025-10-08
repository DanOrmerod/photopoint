import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { WebsiteService } from '../../services/website.service';
import { TemplateService } from '../../services/template.service';
import { CreateWebsiteRequest, Template } from '../../models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-website-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './website-create.component.html',
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
    if (this.websiteForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.creating.set(true);
    this.error.set(null);

    try {
      const formValue = this.websiteForm.value;
      const template = this.selectedTemplate();
      
      console.log('Creating website with template:', template);
      console.log('Form value:', formValue);
      
      const websiteData: CreateWebsiteRequest = {
        name: formValue.name,
        description: formValue.description || undefined,
        subdomain: formValue.subdomain,
        customDomain: formValue.customDomain || undefined,
        theme: template?.theme?.id || 'default',
        templateId: template?.id
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
