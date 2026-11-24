import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const recintoGuard: CanActivateFn = async () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.restaurarSesion();

  const perfil = authService.perfil();

  if (
    perfil?.rol === 'recinto' &&
    !perfil.debe_cambiar_clave
  ) {
    return true;
  }

  return router.createUrlTree(['/login']);
};