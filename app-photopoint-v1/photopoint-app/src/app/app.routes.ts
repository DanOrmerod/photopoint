import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { GalleryComponent } from './gallery/gallery.component';
import { UploadComponent } from './upload/upload.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { OAuthCallbackComponent } from './components/oauth-callback.component';
import { ProfileComponent } from './profile/profile.component';
import { AccountComponent } from './account/account.component';
import { WebsiteListComponent } from './cms/website-list/website-list.component';
import { WebsiteCreateComponent } from './cms/website-create/website-create.component';
import { WebsiteEditComponent } from './cms/website-edit/website-edit.component';
import { WebsiteDashboardComponent } from './cms/website-dashboard/website-dashboard.component';
import { PageEditorComponent } from './cms/page-editor/page-editor.component';
import { ContentBlockEditorComponent } from './cms/content-block-editor/content-block-editor.component';
import { PagePreviewComponent } from './cms/page-preview/page-preview.component';
import { VisualDesignerComponent } from './cms/visual-designer/visual-designer.component';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', component: GalleryComponent },
  { path: 'home', component: HomeComponent }, // Keep HomeComponent for websites overview
  { path: 'upload', component: UploadComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'auth/callback', component: OAuthCallbackComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'account', component: AccountComponent },
  
  // CMS Routes
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
  
  // Preview route without auth guard to avoid redirect issues
  {
    path: 'websites/:id/pages/:pageId/preview',
    component: PagePreviewComponent
  },
  
  { path: 'dashboard', component: HomeComponent }, // Temporary - will create dashboard component later
  { path: 'favorites', component: HomeComponent }, // Temporary - will create favorites component later
  { path: '**', redirectTo: '' }
];
