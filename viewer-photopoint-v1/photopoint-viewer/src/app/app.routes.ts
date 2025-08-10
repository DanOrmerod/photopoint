
import { Routes } from '@angular/router';
import { WebsiteViewerComponent } from './website-viewer.component';

export const routes: Routes = [
	{
		path: ':siteSlug',
		component: WebsiteViewerComponent
	},
	{
		path: ':siteSlug/:pageSlug',
		component: WebsiteViewerComponent
	},
	{
		path: '',
		redirectTo: 'home',
		pathMatch: 'full'
	}
];
