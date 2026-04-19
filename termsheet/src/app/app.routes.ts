import { Routes } from '@angular/router';
import { DealsPageComponent } from './deals/deals-page.component';
import { LoginPageComponent } from './login/login-page.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'deals', component: DealsPageComponent },
  // should be uncommented when testing auth guard functionality
  // { path: 'deals', component: DealsPageComponent, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'deals' },
  { path: '**', redirectTo: 'deals' },
];
