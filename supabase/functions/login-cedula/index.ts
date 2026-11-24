import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Generar una respuesta uniforme.
function responder(datos: object, estado = 200) {
  return new Response(JSON.stringify(datos), {
    status: estado,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}

Deno.serve(async (req: Request) => {

  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  if (req.method !== 'POST') {
    return responder({ error: 'Método no permitido' }, 405);
  }

  try {

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.error('Configuración de Supabase incompleta');

      return responder({
        error: 'Error interno del servidor'
      }, 500);
    }

    const { cedula, password } = await req.json();

    // Validar los datos recibidos.
    if (
      typeof cedula !== 'string' ||
      !/^\d{10}$/.test(cedula) ||
      typeof password !== 'string' ||
      password.length === 0
    ) {
      return responder({
        error: 'Datos de acceso inválidos'
      }, 400);
    }

    // Cliente administrativo.
    const adminClient = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    // Buscar el perfil mediante la cédula.
    const { data: perfil, error: perfilError } =
      await adminClient
        .from('perfiles')
        .select('id, correo')
        .eq('cedula', cedula)
        .maybeSingle();

    if (perfilError) {
      console.error('Error consultando perfil:', perfilError);

      return responder({
        error: 'No se pudo completar el acceso'
      }, 500);
    }

    if (!perfil) {
      console.error('Perfil no encontrado');

      return responder({
        error: 'Credenciales incorrectas'
      }, 401);
    }

    // Obtener la cuenta de Authentication.
    const { data: cuenta, error: errorCuenta } =
      await adminClient.auth.admin.getUserById(perfil.id);

    if (errorCuenta || !cuenta.user?.email) {
      console.error('Error consultando cuenta:', errorCuenta);

      return responder({
        error: 'Credenciales incorrectas'
      }, 401);
    }

    // Cliente público para autenticar al usuario.
    const authClient = createClient(
      supabaseUrl,
      anonKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    // Verificar las credenciales.
    const { data, error } =
      await authClient.auth.signInWithPassword({
        email: cuenta.user.email,
        password: password
      });

    if (error || !data.session) {

      console.error('Resultado de autenticación:', {
        version: 'login-v2',
        codigo: error?.code,
        mensaje: error?.message,
        correosCoinciden: perfil.correo === cuenta.user.email,
        correoConfirmado: !!cuenta.user.email_confirmed_at
      });

      return responder({
        error: 'Credenciales incorrectas'
      }, 401);
    }

    console.log('Autenticación correcta - login-v2');

    return responder({
      session: data.session,
      user: data.user
    });

  } catch (error) {

    console.error('Error interno:', error);

    return responder({
      error: 'Error interno del servidor'
    }, 500);
  }
});