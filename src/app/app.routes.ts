import type { Routes } from '@angular/router';

import { cambiarPasswordGuard } from './core/guards/cambiar-password.guard';
import { provincialGuard } from './core/guards/provincial.guard';
import { recintoGuard } from './core/guards/recinto.guard';
import { veedorGuard } from './core/guards/veedor.guard';

export const routes: Routes = [
  // Autenticación
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.page').then((m) => m.LoginPage),
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
    path: 'confirmar-cuenta',
    loadComponent: () =>
      import('./pages/auth/confirmar-cuenta/confirmar-cuenta.page').then((m) => m.ConfirmarCuentaPage),
  },

  // Coordinador provincial
  {
    path: 'provincial',
    canActivate: [provincialGuard],
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

  // Coordinador de recinto
  {
    path: 'recinto',
    canActivate: [recintoGuard],
    loadComponent: () => import('./pages/recinto/dashboard/dashboard.page').then((m) => m.DashboardRecintoPage),
  },
  {
    path: 'recinto/gestion',
    canActivate: [recintoGuard],
    loadComponent: () => import('./pages/recinto/gestion/gestion.page').then((m) => m.GestionPage),
  },

  // Veedor
  {
    path: 'veedor',
    canActivate: [veedorGuard],
    loadComponent: () => import('./pages/veedor/dashboard/dashboard.page').then((m) => m.DashboardVeedorPage),
  },
  {
    path: 'veedor/acta/:dignidad',
    canActivate: [veedorGuard],
    loadComponent: () => import('./pages/veedor/acta/acta.page').then((m) => m.ActaPage),
  },
  {
  path: 'veedor/evidencias/:id',
  canActivate: [veedorGuard],
  loadComponent: () =>
    import('./pages/veedor/evidencias/evidencias.page')
      .then(m => m.EvidenciasPage)
},
  // Página inicial
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
  {
    path: 'evidencias',
    loadComponent: () => import('./pages/veedor/evidencias/evidencias.page').then((m) => m.EvidenciasPage),
  },
];
