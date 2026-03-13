import { Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login';
import { Dashboard } from './dashboard/dashboard';
import { RiskAnalysis } from './risk-analysis/risk-analysis';
import { Trends } from './trends/trends';
import { Recommendations } from './recommendations/recommendations';
import { LandingComponent } from './landing/landing/landing';
import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { authGuard } from './guards/auth-guard';
import { UploadComponent } from './upload/upload';

export const routes: Routes = [

  /* PUBLIC ROUTES */

  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },

  /* PROTECTED APP ROUTES */

  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      { path: 'dashboard', component: Dashboard },
      { path: 'upload', component: UploadComponent },
      { path: 'risk', component: RiskAnalysis },
      { path: 'trends', component: Trends },
      { path: 'recommendations', component: Recommendations }

    ]
  },

  /* FALLBACK ROUTE */

  { path: '**', redirectTo: '' }

];