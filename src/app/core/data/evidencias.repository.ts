import { Injectable, inject } from '@angular/core';

import { SUPABASE_CLIENT } from './supabase.client';
import { Acta } from '../models/acta.model';

@Injectable({
  providedIn: 'root'
})
export class EvidenciasRepository {

  private readonly supabase = inject(SUPABASE_CLIENT);

  private readonly bucket = 'actas-electorales';

  // Consultar el acta seleccionada.
  async obtenerActa(actaId: number): Promise<Acta> {

    const { data, error } = await this.supabase
      .from('actas')
      .select('*')
      .eq('id', actaId)
      .single();

    if (error) {
      throw error;
    }

    return data as Acta;
  }

  // Subir la fotografía al almacenamiento privado.
  async subirFoto(
    actaId: number,
    archivo: Blob
  ): Promise<string> {

    const extension =
      archivo.type === 'image/png' ? 'png' : 'jpg';

    const ruta =
      `${actaId}/${crypto.randomUUID()}.${extension}`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(ruta, archivo, {
        contentType: archivo.type,
        upsert: false
      });

    if (error) {
      throw error;
    }

    return ruta;
  }

  // Obtener una dirección temporal para visualizar la foto.
  async obtenerFoto(ruta: string): Promise<string> {

    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .createSignedUrl(ruta, 3600);

    if (error) {
      throw error;
    }

    return data.signedUrl;
  }

  // Finalizar el acta mediante la función RPC.
  async finalizarActa(
    actaId: number,
    foto: string,
    latitud: number,
    longitud: number
  ): Promise<void> {

    const { error } = await this.supabase.rpc(
      'finalizar_acta',
      {
        p_acta_id: actaId,
        p_foto_url: foto,
        p_latitud: latitud,
        p_longitud: longitud
      }
    );

    if (error) {
      throw error;
    }
  }
}