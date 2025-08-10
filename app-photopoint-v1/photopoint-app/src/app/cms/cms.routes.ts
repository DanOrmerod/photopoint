import { Routes } from '@angular/router';
import { WebsiteListComponent } from './website-list/website-list.component';
import { WebsiteCreateComponent } from './website-create/website-create.component';
import { WebsiteEditComponent } from './website-edit/website-edit.component';
import { WebsiteDashboardComponent } from './website-dashboard/website-dashboard.component';
import { PageEditorComponent } from './page-editor/page-editor.component';
import { ContentBlockEditorComponent } from './content-block-editor/content-block-editor.component';
import { PagePreviewComponent } from './page-preview/page-preview.component';
import { VisualDesignerComponent } from './visual-designer/visual-designer.component';
import { AuthGuard } from '../auth/auth.guard';

export const cmsRoutes: Routes = [
  {
    path: 'websites',
    canActivate: [AuthGuard],
    children: [
      { path: '', component: WebsiteListComponent },
      { path: 'create', component: WebsiteCreateComponent },
      { path: ':id', component: WebsiteDashboardComponent },
      { path: ':id/edit', component: WebsiteEditComponent },
      { path: ':id/pages/:pageId/edit', component: PageEditorComponent },
      { path: ':id/pages/:pageId/design', component: VisualDesignerComponent },
      { path: ':id/pages/:pageId/blocks/:blockId/edit', component: ContentBlockEditorComponent }
    ]
  },
  // Preview route without auth guard to avoid redirect issues in new window
  {
    path: 'websites/:id/pages/:pageId/preview',
    component: PagePreviewComponent
  }
];
