import type { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { cambiarPasswordGuard } from './core/guards/cambiar-password.guard';
import { provincialGuard } from './core/guards/provincial.guard';
import { recintoGuard } from './core/guards/recinto.guard';
import { veedorGuard } from './core/guards/veedor.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'cambiar-password',
    canActivate: [cambiarPasswordGuard],
    loadComponent: () =>
      import('./pages/auth/cambiar-password/cambiar-password.page').then((m) => m.CambiarPasswordPage),
  },
  {
    path: 'recuperar-password',
    loadComponent: () =>
      import('./pages/auth/recuperar-password/recuperar-password.page').then((m) => m.RecuperarPasswordPage),
  },
  {
    path: 'restablecer-password',
    loadComponent: () =>
      import('./pages/auth/restablecer-password/restablecer-password.page').then((m) => m.RestablecerPasswordPage),
  },
  {
    path: 'provincial',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/provincial/dashboard/dashboard.page').then((m) => m.DashboardProvincialPage),
  },
  {
    path: 'provincial/recintos',
    canActivate: [provincialGuard],
    loadComponent: () => import('./pages/provincial/recintos/recintos.page').then((m) => m.RecintosPage),
  },
  {
    path: 'provincial/coordinadores',
    canActivate: [provincialGuard],
    loadComponent: () => import('./pages/provincial/coordinadores/coordinadores.page').then((m) => m.CoordinadoresPage),
  },
  {
    path: 'confirmar-cuenta',
    loadComponent: () =>
      import('./pages/auth/confirmar-cuenta/confirmar-cuenta.page').then((m) => m.ConfirmarCuentaPage),
  },
  {
  path: 'recinto/gestion',
  canActivate: [recintoGuard],
  loadComponent: () =>
    import('./pages/recinto/gestion/gestion.page')
      .then(m => m.GestionPage)
},
{
  path: 'veedor',
  canActivate: [veedorGuard],
  loadComponent: () =>
    import('./pages/veedor/dashboard/dashboard.page')
      .then(m => m.DashboardVeedorPage)
},
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'recinto',
    canActivate: [recintoGuard],
    loadComponent: () => import('./pages/recinto/dashboard/dashboard.page').then((m) => m.DashboardRecintoPage),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
  {
    path: 'coordinadores',
    loadComponent: () => import('./pages/provincial/coordinadores/coordinadores.page').then((m) => m.CoordinadoresPage),
  },
  {
    path: 'gestion',
    loadComponent: () => import('./pages/recinto/gestion/gestion.page').then((m) => m.GestionPage),
  },
];
