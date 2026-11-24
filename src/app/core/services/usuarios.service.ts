import { Injectable, inject, signal } from '@angular/core';

import {
  UsuariosRepository,
  NuevoUsuario
} from '../data/usuarios.repository';

import { Perfil } from '../models/perfil.model';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private readonly repository = inject(UsuariosRepository);

  private readonly _coordinadores = signal<Perfil[]>([]);
  private readonly _cargando = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _exito = signal<string | null>(null);

  readonly coordinadores = this._coordinadores.asReadonly();
  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();
  readonly exito = this._exito.asReadonly();

  async cargarCoordinadores(): Promise<void> {

    this._cargando.set(true);
    this._error.set(null);

    try {
      const coordinadores =
        await this.repository.listarCoordinadores();

      this._coordinadores.set(coordinadores);

    } catch (error) {
      console.error(error);
      this._error.set('No se pudieron cargar los coordinadores.');

    } finally {
      this._cargando.set(false);
    }
  }

  async crearUsuario(usuario: NuevoUsuario): Promise<boolean> {

    this._cargando.set(true);
    this._error.set(null);
    this._exito.set(null);

    try {

      const mensaje = await this.repository.crear(usuario);

      if (usuario.rol === 'recinto') {
        await this.cargarCoordinadores();
      }

      this._exito.set(mensaje);

      return true;

    } catch (error) {

      console.error(error);

      this._error.set(
        error instanceof Error
          ? error.message
          : 'No se pudo registrar el usuario.'
      );

      return false;

    } finally {
      this._cargando.set(false);
    }
  }
}