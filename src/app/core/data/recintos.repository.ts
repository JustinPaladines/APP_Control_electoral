
import { Injectable, inject } from '@angular/core';
import { SUPABASE_CLIENT } from './supabase.client';

export interface Recinto {
  id: number;
  nombre: string;
  canton: string;
  parroquia: string;
  cantidad_jrv: number;
  provincia: string;
}

export interface NuevoRecinto {
  nombre: string;
  canton: string;
  parroquia: string;
  provincia: string;
  cantidad_jrv: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecintosRepository {

  private readonly supabase = inject(SUPABASE_CLIENT);

  async listar(): Promise<Recinto[]> {

    const { data, error } = await this.supabase
  .from('recintos')
  .select('id, nombre, canton, parroquia, cantidad_jrv, provincia')
  .order('nombre', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []) as Recinto[];
  }

  async crear(recinto: NuevoRecinto): Promise<Recinto> {
  const { data, error } = await this.supabase
    .from('recintos')
    .insert(recinto)
    .select('id, nombre, canton, parroquia, cantidad_jrv, provincia')
    .single();

  if (error) {
    throw error;
  }

  return data as Recinto;
}

async obtenerPorId(id: number): Promise<Recinto> {

  const { data, error } = await this.supabase
    .from('recintos')
    .select('id, nombre, canton, parroquia, cantidad_jrv, provincia')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data as Recinto;
}
}
