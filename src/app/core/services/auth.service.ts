
import { Injectable, inject, signal, computed } from '@angular/core';
import { AuthRepository } from '../data/auth.repository';
import type { Perfil } from '../models/perfil.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Repositorio encargado de comunicarse con Supabase.
  private readonly authRepository = inject(AuthRepository);

  // Estados privados de autenticación.
  private readonly _perfil = signal<Perfil | null>(null);
  private readonly _cargando = signal(false);
  private readonly _error = signal<string | null>(null);

  // Signals de solo lectura para los demás componentes.
  readonly perfil = this._perfil.asReadonly();
  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();

  // Estado calculado de autenticación.
  readonly autenticado = computed(() => this._perfil() !== null);

  // Rol del usuario autenticado.
  readonly rol = computed(() => this._perfil()?.rol ?? null);


  private readonly _sesionVerificada = signal(false);

    readonly sesionVerificada = this._sesionVerificada.asReadonly();

  // Iniciar sesión utilizando la cédula.
  async iniciarSesion(
    cedula: string,
    password: string
  ): Promise<boolean> {

    this._cargando.set(true);
    this._error.set(null);

    try {

      const resultado = await this.authRepository.iniciarSesion(
        cedula,
        password
      );

      // Guardar el perfil del usuario autenticado.
      this._perfil.set(resultado.perfil);

      return true;

    } catch (error) {

      console.error('Error de autenticación:', error);

      this._error.set(
        'No se pudo iniciar sesión. Verifica tus credenciales.'
      );

      return false;

    } finally {

      // Finalizar el estado de carga.
      this._cargando.set(false);

    }
  }

  // Cerrar sesión.
  async cerrarSesion(): Promise<void> {

    this._cargando.set(true);
    this._error.set(null);

    try {

      await this.authRepository.cerrarSesion();

      this._perfil.set(null);

    } catch (error) {

      console.error('Error al cerrar sesión:', error);

      this._error.set('No se pudo cerrar la sesión.');

      throw error;

    } finally {

      this._cargando.set(false);

    }
  }

  // Limpiar los mensajes de error.
  limpiarError(): void {
    this._error.set(null);
  }


  async cambiarClaveInicial(
    nuevaPassword: string
  ): Promise<boolean> {

    this._cargando.set(true);
    this._error.set(null);

    try {

      await this.authRepository.cambiarClaveInicial(nuevaPassword);

      // Actualizar el estado local del perfil.
      const perfilActual = this._perfil();

      if (perfilActual) {
        this._perfil.set({
          ...perfilActual,
          debe_cambiar_clave: false
        });
      }

      return true;

    } catch (error) {

      console.error('Error al cambiar contraseña:', error);

      this._error.set(
        'No se pudo actualizar la contraseña.'
      );

      return false;

    } finally {

      this._cargando.set(false);

    }
  }


  // Recuperar la sesión al iniciar la aplicación.
  async restaurarSesion(): Promise<void> {

    if (this._sesionVerificada()) {
      return;
    }

    this._cargando.set(true);

    try {

      const perfil =
        await this.authRepository.obtenerPerfilActual();

      this._perfil.set(perfil);

    } catch (error) {

      console.error('Error al recuperar la sesión:', error);
      this._perfil.set(null);

    } finally {

      this._cargando.set(false);
      this._sesionVerificada.set(true);

    }
  }

  // Solicitar recuperación de contraseña.
async recuperarPassword(correo: string): Promise<boolean> {

  this._cargando.set(true);
  this._error.set(null);

  try {
    await this.authRepository.recuperarPassword(correo);
    return true;

  } catch (error) {
    console.error('Error al recuperar contraseña:', error);
    this._error.set('No se pudo enviar el correo de recuperación.');
    return false;

  } finally {
    this._cargando.set(false);
  }
}

async restablecerPassword(nuevaPassword: string): Promise<boolean> {
  this._cargando.set(true);
  this._error.set(null);

  try {
    await this.authRepository.restablecerPassword(nuevaPassword);
    return true;

  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    this._error.set('No se pudo actualizar la contraseña.');
    return false;

  } finally {
    this._cargando.set(false);
  }
}

}
