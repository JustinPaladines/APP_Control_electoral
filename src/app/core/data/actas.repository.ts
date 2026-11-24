import { Injectable, inject } from '@angular/core';

import { SUPABASE_CLIENT } from './supabase.client';

import {
  Acta,
  ActaCompleta,
  Candidatura,
  Dignidad,
  NuevaActa,
  ResultadoActa
} from '../models/acta.model';

@Injectable({
  providedIn: 'root'
})
export class ActasRepository {

  private readonly supabase = inject(SUPABASE_CLIENT);

  // Consultar las candidaturas de una dignidad.
  async listarCandidaturas(
    dignidad: Dignidad
  ): Promise<Candidatura[]> {

    const { data, error } = await this.supabase
      .from('candidaturas')
      .select(`
        id,
        organizacion_id,
        dignidad,
        nombre_candidato,
        apellidos_candidato,
        organizacion:organizaciones (
          id,
          nombre,
          siglas,
          logo_url
        )
      `)
      .eq('dignidad', dignidad)
      .order('organizacion_id', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []) as unknown as Candidatura[];
  }

  // Consultar una acta registrada.
  async obtenerActa(
    jrvId: number,
    dignidad: Dignidad
  ): Promise<ActaCompleta | null> {

    const { data: acta, error } = await this.supabase
      .from('actas')
      .select('*')
      .eq('jrv_id', jrvId)
      .eq('dignidad', dignidad)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!acta) {
      return null;
    }

    const { data: resultados, error: errorResultados } =
      await this.supabase
        .from('acta_resultados')
        .select('candidatura_id, cantidad_votos')
        .eq('acta_id', acta.id);

    if (errorResultados) {
      throw errorResultados;
    }

    return {
      acta: acta as Acta,
      resultados: (resultados ?? []) as ResultadoActa[]
    };
  }

  // Guardar el acta y sus resultados.
  async guardarActa(datos: NuevaActa): Promise<number> {

    const { data, error } = await this.supabase.rpc(
      'guardar_acta',
      {
        p_jrv_id: datos.jrv_id,
        p_dignidad: datos.dignidad,
        p_total_sufragantes: datos.total_sufragantes,
        p_votos_nulos: datos.votos_nulos,
        p_votos_blancos: datos.votos_blancos,
        p_resultados: datos.resultados
      }
    );

    if (error) {
      throw error;
    }

    return Number(data);
  }

  // Consultar las actas visibles según el rol.
  async listarActas(): Promise<Acta[]> {

    const { data, error } = await this.supabase
      .from('actas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []) as Acta[];
  }
}