export type Dignidad = 'alcaldia' | 'prefectura';

export interface Organizacion {
  id: number;
  nombre: string;
  siglas: string | null;
  logo_url: string | null;
}

export interface Candidatura {
  id: number;
  organizacion_id: number;
  dignidad: Dignidad;
  nombre_candidato: string;
  apellidos_candidato: string;
  organizacion: Organizacion;
}

export interface Acta {
  id: number;
  jrv_id: number;
  dignidad: Dignidad;
  total_sufragantes: number;
  votos_nulos: number;
  votos_blancos: number;
  foto_url: string | null;
  latitud: number | null;
  longitud: number | null;
  estado: string;
  registrado_por: string;
  modificado_por: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResultadoActa {
  candidatura_id: number;
  cantidad_votos: number;
}

export interface ActaCompleta {
  acta: Acta;
  resultados: ResultadoActa[];
}

export interface NuevaActa {
  jrv_id: number;
  dignidad: Dignidad;
  total_sufragantes: number;
  votos_nulos: number;
  votos_blancos: number;
  resultados: ResultadoActa[];
}