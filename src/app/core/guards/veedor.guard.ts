import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const veedorGuard: CanActivateFn = async () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.restaurarSesion();

  const perfil = authService.perfil();

  if (!perfil || perfil.rol !== 'veedor') {
    return router.createUrlTree(['/login']);
  }

  if (perfil.debe_cambiar_clave) {
    return router.createUrlTree(['/cambiar-password']);
  }

  return true;
};