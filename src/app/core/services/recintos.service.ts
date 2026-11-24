
import { Injectable, inject, signal } from '@angular/core';

import {
  RecintosRepository,
  Recinto,
  NuevoRecinto
} from '../data/recintos.repository';

@Injectable({
  providedIn: 'root'
})
export class RecintosService {

  private readonly repository = inject(RecintosRepository);

  private readonly _recintos = signal<Recinto[]>([]);
  private readonly _cargando = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly recintos = this._recintos.asReadonly();
  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();

  async cargarRecintos(): Promise<void> {

    this._cargando.set(true);
    this._error.set(null);

    try {
      const datos = await this.repository.listar();
      this._recintos.set(datos);

    } catch (error) {
      console.error('Error al consultar recintos:', error);
      this._error.set('No se pudieron cargar los recintos.');

    } finally {
      this._cargando.set(false);
    }
  }

  async crearRecinto(recinto: NuevoRecinto): Promise<boolean> {
  this._cargando.set(true);
  this._error.set(null);

  try {
    await this.repository.crear(recinto);
    await this.cargarRecintos();
    return true;

  } catch (error) {
    console.error('Error al crear recinto:', error);
    this._error.set('No se pudo guardar el recinto.');
    return false;

  } finally {
    this._cargando.set(false);
  }
}
}
