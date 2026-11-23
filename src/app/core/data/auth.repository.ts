
import { Injectable, inject } from '@angular/core';
import type { Session, User } from '@supabase/supabase-js';

import { SUPABASE_CLIENT } from './supabase.client';
import type { Perfil } from '../models/perfil.model';

// Estructura de la respuesta de nuestra Edge Function.
interface LoginCedulaResponse {
  session: Session;
  user: User;
}

// Resultado completo del inicio de sesión.
export interface ResultadoLogin {
  session: Session;
  user: User;
  perfil: Perfil;
}

@Injectable({
  providedIn: 'root'
})
export class AuthRepository {

  private readonly supabase = inject(SUPABASE_CLIENT);

  // Iniciar sesión utilizando la cédula.
  async iniciarSesion(
    cedula: string,
    password: string
  ): Promise<ResultadoLogin> {

    // Invocar la Edge Function.
    const { data, error } =
      await this.supabase.functions.invoke<LoginCedulaResponse>(
        'login-cedula',
        {
          body: {
            cedula,
            password
          }
        }
      );

    if (error) {
      throw error;
    }

    if (!data?.session) {
      throw new Error('No se recibió una sesión válida.');
    }

    // Registrar la sesión recibida en el cliente de Angular.
    const { data: authData, error: authError } =
      await this.supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      });

    if (authError || !authData.user || !authData.session) {
      throw authError ?? new Error('No se pudo establecer la sesión.');
    }

    // Obtener el perfil del usuario autenticado.
    const { data: perfil, error: perfilError } =
      await this.supabase
        .from('perfiles')
        .select(`
          id,
          cedula,
          nombres,
          apellidos,
          telefono,
          correo,
          rol,
          recinto_id,
          debe_cambiar_clave,
          created_at
        `)
        .eq('id', authData.user.id)
        .single();

    if (perfilError || !perfil) {

      // Evitar mantener una sesión sin perfil válido.
      await this.supabase.auth.signOut();

      throw perfilError ?? new Error('No se encontró el perfil.');
    }

    return {
      session: authData.session,
      user: authData.user,
      perfil: perfil as Perfil
    };
  }

  // Cerrar la sesión del usuario.
  async cerrarSesion(): Promise<void> {

    const { error } = await this.supabase.auth.signOut();

    if (error) {
      throw error;
    }
  }


  // Cambiar la contraseña inicial y actualizar el perfil.
  async cambiarClaveInicial(
    nuevaPassword: string
  ): Promise<void> {

    // Actualizar la contraseña en Supabase Auth.
    const { error: passwordError } =
      await this.supabase.auth.updateUser({
        password: nuevaPassword
      });

    if (passwordError) {
      throw passwordError;
    }

    // Obtener el usuario autenticado.
    const { data: userData, error: userError } =
      await this.supabase.auth.getUser();

    if (userError || !userData.user) {
      throw userError ?? new Error('Usuario no autenticado.');
    }

    // Desactivar el cambio obligatorio.
    const { error: perfilError } =
      await this.supabase
        .from('perfiles')
        .update({ debe_cambiar_clave: false })
        .eq('id', userData.user.id);

    if (perfilError) {
      throw perfilError;
    }
  }


  // Recuperar el perfil de la sesión guardada.
  async obtenerPerfilActual(): Promise<Perfil | null> {

    const { data: userData, error: userError } =
      await this.supabase.auth.getUser();

    if (userError || !userData.user) {
      return null;
    }

    const { data: perfil, error: perfilError } =
      await this.supabase
        .from('perfiles')
        .select(`
          id,
          cedula,
          nombres,
          apellidos,
          telefono,
          correo,
          rol,
          recinto_id,
          debe_cambiar_clave,
          created_at
        `)
        .eq('id', userData.user.id)
        .single();

    if (perfilError || !perfil) {
      return null;
    }

    return perfil as Perfil;
  }

  // Solicitar recuperación de contraseña.
async recuperarPassword(correo: string): Promise<void> {

  const { error } = await this.supabase.auth.resetPasswordForEmail(
    correo,
    {
      redirectTo: `${window.location.origin}/restablecer-password`
    }
  );

  if (error) {
    throw error;
  }
}
// Actualizar la contraseña del usuario autenticado.
async restablecerPassword(nuevaPassword: string): Promise<void> {
  const { error } = await this.supabase.auth.updateUser({
    password: nuevaPassword
  });

  if (error) {
    throw error;
  }
}

}
