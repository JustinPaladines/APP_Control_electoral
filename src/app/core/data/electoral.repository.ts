import { Injectable, inject } from '@angular/core';
import { SUPABASE_CLIENT } from './supabase.client';

import { Jrv, AsignacionVeedor } from '../models/electoral.model';
import { Perfil } from '../models/perfil.model';

@Injectable({
  providedIn: 'root'
})
export class ElectoralRepository {

  private readonly supabase = inject(SUPABASE_CLIENT);

  // Consultar las juntas permitidas para el usuario.
  async listarJuntas(): Promise<Jrv[]> {

    const { data, error } = await this.supabase
      .from('jrv')
      .select('*')
      .order('numero', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []) as Jrv[];
  }

  // Generar las juntas del recinto.
  async generarJuntas(): Promise<void> {

    const { error } = await this.supabase.rpc('generar_jrv');

    if (error) {
      throw error;
    }
  }

  // Consultar los veedores del recinto.
  async listarVeedores(recintoId: number): Promise<Perfil[]> {

    const { data, error } = await this.supabase
      .from('perfiles')
      .select('*')
      .eq('rol', 'veedor')
      .eq('recinto_id', recintoId)
      .order('apellidos', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []) as Perfil[];
  }

  // Consultar las asignaciones activas.
  async listarAsignaciones(): Promise<AsignacionVeedor[]> {

    const { data, error } = await this.supabase
      .from('asignaciones_veedor')
      .select('*')
      .eq('activa', true);

    if (error) {
      throw error;
    }

    return (data ?? []) as AsignacionVeedor[];
  }

  // Asignar o reasignar un veedor.
  async asignarVeedor(
    veedorId: string,
    jrvId: number
  ): Promise<void> {

    const { error } = await this.supabase.rpc(
      'asignar_veedor',
      {
        p_veedor_id: veedorId,
        p_jrv_id: jrvId
      }
    );

    if (error) {
      throw error;
    }
  }

  // Retirar una asignación activa.
  async retirarAsignacion(veedorId: string): Promise<void> {

    const { error } = await this.supabase.rpc(
      'retirar_asignacion',
      {
        p_veedor_id: veedorId
      }
    );

    if (error) {
      throw error;
    }
  }
}