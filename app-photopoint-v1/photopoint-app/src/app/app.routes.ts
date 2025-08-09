import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'upload', component: HomeComponent }, // Temporary - will create upload component later
  { path: 'favorites', component: HomeComponent }, // Temporary - will create favorites component later
  { path: '**', redirectTo: '' }
];
