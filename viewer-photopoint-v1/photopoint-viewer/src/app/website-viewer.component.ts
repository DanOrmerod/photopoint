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
    this.route.paramMap.subscribe(params => {
      const siteSlug = params.get('siteSlug');
      const pageSlug = params.get('pageSlug');
      this.loading = true;
      this.error = null;
      if (siteSlug && pageSlug) {
        this.websiteService.getPublishedPage(siteSlug, pageSlug).subscribe({
          next: (data) => { this.website = data; this.loading = false; },
          error: (err) => { this.error = 'Page not found.'; this.loading = false; }
        });
      } else if (siteSlug) {
        this.websiteService.getPublishedWebsite(siteSlug).subscribe({
          next: (data) => { this.website = data; this.loading = false; },
          error: (err) => { this.error = 'Website not found.'; this.loading = false; }
        });
      } else {
        this.error = 'Invalid URL.';
        this.loading = false;
      }
    });
  }
}
