import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WebsiteService {
  constructor(private http: HttpClient) {}

  getPublishedWebsite(siteSlug: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/websites/website/${siteSlug}`);
  }

  getPublishedPage(siteSlug: string, pageSlug: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/websites/website/${siteSlug}/pages/${pageSlug}`);
  }

  // Async alternatives for consistency with main app
  async getPublishedWebsiteAsync(siteSlug: string): Promise<any> {
    return firstValueFrom(this.getPublishedWebsite(siteSlug));
  }

  async getPublishedPageAsync(siteSlug: string, pageSlug: string): Promise<any> {
    return firstValueFrom(this.getPublishedPage(siteSlug, pageSlug));
  }
}
