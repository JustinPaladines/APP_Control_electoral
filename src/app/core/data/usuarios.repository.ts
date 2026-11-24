import { Injectable, inject } from '@angular/core';
import { SUPABASE_CLIENT } from './supabase.client';
import { Perfil } from '../models/perfil.model';

export interface NuevoUsuario {
  cedula: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  correo: string;
  rol: 'recinto' | 'veedor';
  recinto_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosRepository {

  private readonly supabase = inject(SUPABASE_CLIENT);

  async listarCoordinadores(): Promise<Perfil[]> {

    const { data, error } = await this.supabase
      .from('perfiles')
      .select('*')
      .eq('rol', 'recinto')
      .order('apellidos', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []) as Perfil[];
  }

  async crear(usuario: NuevoUsuario): Promise<string> {

    const { data, error } = await this.supabase.functions.invoke(
      'crear-usuario',
      {
        body: usuario
      }
    );

    if (error) {
      if (error.context instanceof Response) {
        const respuesta = await error.context.json().catch(() => null);

        if (respuesta?.error) {
          throw new Error(respuesta.error);
        }
      }

      throw error;
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return data?.mensaje ?? 'Usuario registrado correctamente.';
  }
}