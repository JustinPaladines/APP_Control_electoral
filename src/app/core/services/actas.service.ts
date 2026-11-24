import { Injectable, inject, signal } from '@angular/core';

import { ActasRepository } from '../data/actas.repository';

import {
  Acta,
  ActaCompleta,
  Candidatura,
  Dignidad,
  NuevaActa
} from '../models/acta.model';

@Injectable({
  providedIn: 'root'
})
export class ActasService {

  private readonly repository = inject(ActasRepository);

  private readonly _candidaturas = signal<Candidatura[]>([]);
  private readonly _actaActual = signal<ActaCompleta | null>(null);
  private readonly _actas = signal<Acta[]>([]);

  private readonly _cargando = signal(false);
  private readonly _error = signal('');
  private readonly _exito = signal('');

  readonly candidaturas = this._candidaturas.asReadonly();
  readonly actaActual = this._actaActual.asReadonly();
  readonly actas = this._actas.asReadonly();

  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();
  readonly exito = this._exito.asReadonly();

  // Controlar los estados de cada operación.
  private async ejecutar(
    operacion: () => Promise<void>,
    mensaje = ''
  ): Promise<boolean> {

    if (this._cargando()) {
      return false;
    }

    this._cargando.set(true);
    this._error.set('');
    this._exito.set('');

    try {

      await operacion();

      this._exito.set(mensaje);

      return true;

    } catch (error) {

      console.error(error);

      const detalle = error as { message?: string };

      this._error.set(
        detalle?.message ?? 'No se pudo completar la operación.'
      );

      return false;

    } finally {

      this._cargando.set(false);
    }
  }

  // Cargar candidatos y resultados existentes.
  async cargarFormulario(
    jrvId: number,
    dignidad: Dignidad
  ): Promise<boolean> {

    this._candidaturas.set([]);
    this._actaActual.set(null);

    return this.ejecutar(async () => {

      const [candidaturas, acta] = await Promise.all([
        this.repository.listarCandidaturas(dignidad),
        this.repository.obtenerActa(jrvId, dignidad)
      ]);

      if (
        candidaturas.length !== 5 ||
        new Set(
          candidaturas.map(c => c.organizacion_id)
        ).size !== 5
      ) {
        throw new Error(
          'Deben existir cinco candidaturas de organizaciones diferentes.'
        );
      }

      this._candidaturas.set(candidaturas);
      this._actaActual.set(acta);
    });
  }

  // Validar y guardar los resultados.
  async guardarActa(datos: NuevaActa): Promise<boolean> {

    return this.ejecutar(async () => {

      const cantidades = [
        datos.total_sufragantes,
        datos.votos_nulos,
        datos.votos_blancos,
        ...datos.resultados.map(r => r.cantidad_votos)
      ];

      if (cantidades.some(
        valor => !Number.isInteger(valor) || valor < 0
      )) {
        throw new Error(
          'Los votos deben ser números enteros no negativos.'
        );
      }

      if (datos.resultados.length !== 5) {
        throw new Error('Debe registrar las cinco candidaturas.');
      }

      const totalVotos = datos.resultados.reduce(
        (total, resultado) => total + resultado.cantidad_votos,
        0
      );

      const totalCalculado =
        totalVotos +
        datos.votos_nulos +
        datos.votos_blancos;

      if (totalCalculado !== datos.total_sufragantes) {
        throw new Error(
          'La suma de votos no coincide con el total de sufragantes.'
        );
      }

      await this.repository.guardarActa(datos);

      const acta = await this.repository.obtenerActa(
        datos.jrv_id,
        datos.dignidad
      );

      this._actaActual.set(acta);

    }, 'Acta guardada correctamente.');
  }

  // Consultar las actas disponibles.
  async cargarActas(): Promise<boolean> {

    this._actas.set([]);

    return this.ejecutar(async () => {

      const actas = await this.repository.listarActas();

      this._actas.set(actas);
    });
  }
}