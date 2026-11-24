export interface Jrv {
  id: number;
  recinto_id: number;
  numero: number;
  estado: string;
}

export interface AsignacionVeedor {
  id: number;
  veedor_id: string;
  jrv_id: number;
  asignado_por: string;
  activa: boolean;
  fecha_asignacion: string;
}