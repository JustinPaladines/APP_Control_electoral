
import type { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { cambiarPasswordGuard } from './core/guards/cambiar-password.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login.page')
        .then(m => m.LoginPage),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.page')
        .then(m => m.HomePage),
  },
  {
  path: 'cambiar-password',
  canActivate: [cambiarPasswordGuard],
  loadComponent: () =>
    import('./pages/auth/cambiar-password/cambiar-password.page')
      .then(m => m.CambiarPasswordPage),
  },
  {
  path: 'recuperar-password',
  loadComponent: () =>
    import('./pages/auth/recuperar-password/recuperar-password.page')
      .then(m => m.RecuperarPasswordPage),
  },
  {
  path: 'restablecer-password',
  loadComponent: () =>
    import('./pages/auth/restablecer-password/restablecer-password.page')
      .then(m => m.RestablecerPasswordPage),
  },
  {
  path: 'provincial',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./pages/provincial/dashboard/dashboard.page')
      .then(m => m.DashboardProvincialPage),
  },
  {
  path: 'provincial/recintos',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./pages/provincial/recintos/recintos.page')
      .then(m => m.RecintosPage),
},
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
