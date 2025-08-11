import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WebsiteService } from './website.service';

@Component({
  selector: 'app-website-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="loading">Loading...</ng-container>
    <ng-container *ngIf="error">{{ error }}</ng-container>
    <ng-container *ngIf="!loading && !error && website">
      <h1>{{ website.title }}</h1>
      <div [innerHTML]="website.html"></div>
    </ng-container>
  `
})
export class WebsiteViewerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private websiteService = inject(WebsiteService);
  website: any = null;
  loading = true;
  error: string | null = null;

  ngOnInit() {
    // Extract domain from current URL
    const domain = this.extractDomainFromUrl();
    
    this.route.paramMap.subscribe(params => {
      const pageSlug = params.get('pageSlug') || params.get('siteSlug'); // Handle both route patterns
      this.loading = true;
      this.error = null;
      
      if (pageSlug && pageSlug !== 'home') {
        // Load specific page
        this.websiteService.getPublishedPage(domain, pageSlug).subscribe({
          next: (data) => { this.website = data; this.loading = false; },
          error: (err) => { this.error = 'Page not found.'; this.loading = false; }
        });
      } else {
        // Load home page or website
        this.websiteService.getPublishedWebsite(domain).subscribe({
          next: (data) => { this.website = data; this.loading = false; },
          error: (err) => { this.error = 'Website not found.'; this.loading = false; }
        });
      }
    });
  }

  private extractDomainFromUrl(): string {
    const hostname = window.location.hostname;
    
    // For local development: extract subdomain from examplename.localhost
    if (hostname.includes('.localhost')) {
      return hostname.split('.')[0];
    }
    
    // For production: check if it's a photopoint.studio subdomain
    if (hostname.includes('.photopoint.studio')) {
      return hostname.split('.')[0];
    }
    
    // For custom domains: use the full hostname
    return hostname;
  }
}
