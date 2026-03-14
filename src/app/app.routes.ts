import { Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login';
import { Register } from './auth/register/register';

import { LandingComponent } from './landing/landing/landing';

import { Dashboard } from './dashboard/dashboard';
import { UploadComponent } from './upload/upload';
import { RiskAnalysis } from './risk-analysis/risk-analysis';
import { Trends } from './trends/trends';
import { Recommendations } from './recommendations/recommendations';

import { MainLayoutComponent } from './layout/main-layout/main-layout';

import { authGuard } from './guards/auth-guard';


export const routes: Routes = [

  /* PUBLIC ROUTES */

  { path: '', component: LandingComponent },

  { path: 'login', component: LoginComponent },

  { path: 'register', component: Register },


  /* PROTECTED ROUTES */

  {
    path: 'app',
    component: MainLayoutComponent,
    canActivateChild: [authGuard],
    children: [

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      { path: 'dashboard', component: Dashboard },

      { path: 'upload', component: UploadComponent },

      { path: 'risk', component: RiskAnalysis },

      { path: 'trends', component: Trends },

      { path: 'recommendations', component: Recommendations }

    ]
  },


  /* FALLBACK */

  { path: '**', redirectTo: '' }

];