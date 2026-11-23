
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
}
