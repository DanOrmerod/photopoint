import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WebsiteService {
  constructor(private http: HttpClient) {}

  getPublishedWebsite(siteSlug: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/websites/website/${siteSlug}`);
  }

  getPublishedPage(siteSlug: string, pageSlug: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/websites/website/${siteSlug}/pages/${pageSlug}`);
  }
}
