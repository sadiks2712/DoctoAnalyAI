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

  // Landing page
  { path: '', component: LandingComponent },

  // Login page
  { path: 'login', component: LoginComponent },

  // Protected app layout
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [

      { path: 'landing', component: LandingComponent },
      { path: 'upload', component: UploadComponent },
      { path: 'dashboard', component: Dashboard },
      { path: 'risk', component: RiskAnalysis },
      { path: 'trends', component: Trends },

      // ✅ Recommendation page
      { path: 'recommendations', component: Recommendations }

    ]
  },

  // Fallback
  { path: '**', redirectTo: '' }

];