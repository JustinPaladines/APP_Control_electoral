
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const cambiarPasswordGuard: CanActivateFn = async () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.restaurarSesion();

  if (!authService.autenticado()) {
    return router.createUrlTree(['/login']);
  }

  if (!authService.perfil()?.debe_cambiar_clave) {
    return router.createUrlTree(['/home']);
  }

  return true;
};
