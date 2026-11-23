
export type RolUsuario = 'provincial' | 'recinto' | 'veedor';

export interface Perfil {

    id: string;

    cedula: string;

    nombres: string;

    apellidos: string;

    telefono: string;

    correo: string;

    rol: RolUsuario;

    recinto_id: number | null;

    debe_cambiar_clave: boolean;

    created_at: string;

}
