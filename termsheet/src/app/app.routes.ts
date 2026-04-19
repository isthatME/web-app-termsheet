import { Routes } from '@angular/router';
import { DealsPageComponent } from './pages/deals/deals-page.component';
import { LoginPageComponent } from './pages/login/login-page.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'deals', component: DealsPageComponent, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'deals' },
  { path: '**', redirectTo: 'deals' },
];
