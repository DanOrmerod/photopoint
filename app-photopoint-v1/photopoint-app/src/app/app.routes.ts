import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UploadComponent } from './upload/upload.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { OAuthCallbackComponent } from './components/oauth-callback.component';
import { ProfileComponent } from './profile/profile.component';
import { AccountComponent } from './account/account.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'upload', component: UploadComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'auth/callback', component: OAuthCallbackComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'account', component: AccountComponent },
  { path: 'dashboard', component: HomeComponent }, // Temporary - will create dashboard component later
  { path: 'favorites', component: HomeComponent }, // Temporary - will create favorites component later
  { path: '**', redirectTo: '' }
];
