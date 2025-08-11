
import { Routes } from '@angular/router';
import { WebsiteViewerComponent } from './website-viewer.component';

export const routes: Routes = [
  {
    path: ':pageSlug',
    component: WebsiteViewerComponent
  },
  {
    path: '',
    component: WebsiteViewerComponent
  }
];
