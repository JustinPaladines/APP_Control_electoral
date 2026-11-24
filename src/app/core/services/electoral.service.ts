import { Injectable, inject, signal, computed } from '@angular/core';

import { ElectoralRepository } from '../data/electoral.repository';
import { AuthService } from './auth.service';

import { Jrv, AsignacionVeedor } from '../models/electoral.model';
import { Perfil } from '../models/perfil.model';

@Injectable({
  providedIn: 'root'
})
export class ElectoralService {

  private readonly repository = inject(ElectoralRepository);
  private readonly authService = inject(AuthService);

  private readonly _juntas = signal<Jrv[]>([]);
  private readonly _veedores = signal<Perfil[]>([]);
  private readonly _asignaciones = signal<AsignacionVeedor[]>([]);

  private readonly _cargando = signal(false);
  private readonly _error = signal('');
  private readonly _exito = signal('');

  readonly juntas = this._juntas.asReadonly();
  readonly veedores = this._veedores.asReadonly();
  readonly asignaciones = this._asignaciones.asReadonly();

  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();
  readonly exito = this._exito.asReadonly();

  readonly totalJuntas = computed(() => this._juntas().length);

  readonly totalVeedores = computed(() => this._veedores().length);

  readonly totalAsignadas = computed(
    () => this._asignaciones().length
  );

  readonly totalDisponibles = computed(
    () => this.totalJuntas() - this.totalAsignadas()
  );

  // Consultar los datos del coordinador.
  private async consultarRecinto(): Promise<void> {

    const recintoId = this.authService.perfil()?.recinto_id;

    if (!recintoId) {
      throw new Error('No existe un recinto asignado.');
    }

    const [juntas, veedores, asignaciones] = await Promise.all([
      this.repository.listarJuntas(),
      this.repository.listarVeedores(recintoId),
      this.repository.listarAsignaciones()
    ]);

    this._juntas.set(juntas);
    this._veedores.set(veedores);
    this._asignaciones.set(asignaciones);
  }

  // Ejecutar operaciones con estados de carga y error.
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

  async cargarRecinto(): Promise<boolean> {

    this._juntas.set([]);
    this._veedores.set([]);
    this._asignaciones.set([]);

    return this.ejecutar(async () => {
      await this.consultarRecinto();
    });
  }

  async generarJuntas(): Promise<boolean> {

    return this.ejecutar(async () => {

      await this.repository.generarJuntas();
      await this.consultarRecinto();

    }, 'Juntas generadas correctamente.');
  }

  async asignarVeedor(
    veedorId: string,
    jrvId: number
  ): Promise<boolean> {

    return this.ejecutar(async () => {

      await this.repository.asignarVeedor(veedorId, jrvId);
      await this.consultarRecinto();

    }, 'Asignación guardada correctamente.');
  }

  async retirarAsignacion(veedorId: string): Promise<boolean> {

    return this.ejecutar(async () => {

      await this.repository.retirarAsignacion(veedorId);
      await this.consultarRecinto();

    }, 'Asignación retirada correctamente.');
  }

  // Consultar únicamente la junta asignada al veedor.
  async cargarMiJunta(): Promise<boolean> {

    this._juntas.set([]);
    this._veedores.set([]);
    this._asignaciones.set([]);

    return this.ejecutar(async () => {

      const perfil = this.authService.perfil();

      if (!perfil || perfil.rol !== 'veedor') {
        throw new Error('Usuario no autorizado.');
      }

      const [juntas, asignaciones] = await Promise.all([
        this.repository.listarJuntas(),
        this.repository.listarAsignaciones()
      ]);

      const propias = asignaciones.filter(
        a => a.veedor_id === perfil.id && a.activa
      );

      this._asignaciones.set(propias);

      this._juntas.set(
        juntas.filter(j => propias.some(a => a.jrv_id === j.id))
      );
    });
  }
}