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

  // 🌐 Public pages
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },

  // 🔐 Protected app shell
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'upload', component: UploadComponent },
      { path: 'dashboard', component: Dashboard },
      { path: 'risk', component: RiskAnalysis },
      { path: 'trends', component: Trends },
      { path: 'recommendations', component: Recommendations }
    ]
  },

  // fallback
  { path: '**', redirectTo: '' }
];