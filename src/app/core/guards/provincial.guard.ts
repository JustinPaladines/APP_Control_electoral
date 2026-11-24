import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const provincialGuard: CanActivateFn = async () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.restaurarSesion();

  if (
    authService.perfil()?.rol === 'provincial' &&
    !authService.perfil()?.debe_cambiar_clave
  ) {
    return true;
  }

  return router.createUrlTree(['/login']);
};