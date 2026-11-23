
import { Injectable, inject, signal } from '@angular/core';

import {
  RecintosRepository,
  Recinto
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
}
