import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function responder(datos: object, estado = 200) {
  return new Response(JSON.stringify(datos), {
    status: estado,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}

// Valida la cédula ecuatoriana
function validarCedula(cedula: string): boolean {
  if (!/^\d{10}$/.test(cedula)) {
    return false;
  }

  const provincia = Number(cedula.substring(0, 2));

  if (provincia < 1 || provincia > 24) {
    return false;
  }

  if (Number(cedula[2]) > 5) {
    return false;
  }

  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let numero = Number(cedula[i]);

    if (i % 2 === 0) {
      numero *= 2;

      if (numero > 9) {
        numero -= 9;
      }
    }

    suma += numero;
  }

  const verificador = (10 - (suma % 10)) % 10;

  return verificador === Number(cedula[9]);
}

Deno.serve(async (req) => {

  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  if (req.method !== 'POST') {
    return responder({
      error: 'Método no permitido'
    }, 405);
  }

  try {

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verifica la sesión del usuario que realiza la solicitud
    const token = req.headers
      .get('Authorization')
      ?.replace(/^Bearer\s+/i, '');

    if (!token) {
      return responder({
        error: 'Sesión no válida'
      }, 401);
    }

    const { data: sesion, error: errorSesion } =
      await supabase.auth.getUser(token);

    if (errorSesion || !sesion.user) {
      return responder({
        error: 'Usuario no autenticado'
      }, 401);
    }

    // Consulta el perfil del usuario autenticado
    const { data: creador, error: errorPerfil } =
      await supabase
        .from('perfiles')
        .select('rol, recinto_id, debe_cambiar_clave')
        .eq('id', sesion.user.id)
        .single();

    if (errorPerfil || !creador) {
      return responder({
        error: 'Perfil no encontrado'
      }, 403);
    }

    if (creador.debe_cambiar_clave) {
      return responder({
        error: 'Debe cambiar su contraseña inicial'
      }, 403);
    }

    const datos = await req.json();

    const cedula = String(datos.cedula ?? '').trim();
    const nombres = String(datos.nombres ?? '').trim();
    const apellidos = String(datos.apellidos ?? '').trim();
    const telefono = String(datos.telefono ?? '').trim();
    const correo = String(datos.correo ?? '').trim().toLowerCase();
    const rol = datos.rol;
    const recinto_id = Number(datos.recinto_id);

    // Valida los permisos según el rol
    const permitido =
      (creador.rol === 'provincial' && rol === 'recinto') ||
      (creador.rol === 'recinto' && rol === 'veedor');

    if (!permitido) {
      return responder({
        error: 'No tiene permisos para crear este usuario'
      }, 403);
    }

    if (
      creador.rol === 'recinto' &&
      creador.recinto_id !== recinto_id
    ) {
      return responder({
        error: 'Solo puede registrar veedores de su recinto'
      }, 403);
    }

    // Valida los datos ingresados
    if (!validarCedula(cedula)) {
      return responder({
        error: 'La cédula ingresada no es válida'
      }, 400);
    }

    if (!nombres || !apellidos) {
      return responder({
        error: 'Los nombres y apellidos son obligatorios'
      }, 400);
    }

    if (!/^\d{10}$/.test(telefono)) {
      return responder({
        error: 'El teléfono debe contener 10 dígitos'
      }, 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return responder({
        error: 'El correo electrónico no es válido'
      }, 400);
    }

    if (!Number.isInteger(recinto_id) || recinto_id <= 0) {
      return responder({
        error: 'Debe seleccionar un recinto'
      }, 400);
    }

    // Comprueba que el recinto exista
    const { data: recinto, error: errorRecinto } =
      await supabase
        .from('recintos')
        .select('id')
        .eq('id', recinto_id)
        .single();

    if (errorRecinto || !recinto) {
      return responder({
        error: 'El recinto no existe'
      }, 400);
    }

    // Comprueba que la cédula no esté registrada
    const { data: existente, error: errorConsulta } =
      await supabase
        .from('perfiles')
        .select('id')
        .eq('cedula', cedula)
        .maybeSingle();

    if (errorConsulta) {
      throw errorConsulta;
    }

    if (existente) {
      return responder({
        error: 'La cédula ya está registrada'
      }, 409);
    }

    // Comprueba si el recinto ya tiene coordinador
    if (rol === 'recinto') {

      const { data: coordinador, error: errorCoordinador } =
        await supabase
          .from('perfiles')
          .select('id')
          .eq('recinto_id', recinto_id)
          .eq('rol', 'recinto')
          .maybeSingle();

      if (errorCoordinador) {
        throw errorCoordinador;
      }

      if (coordinador) {
        return responder({
          error: 'El recinto ya tiene un coordinador asignado'
        }, 409);
      }
    }

    // Crea la cuenta con contraseña inicial
    const { data: cuenta, error: errorCuenta } =
      await supabase.auth.admin.createUser({
        email: correo,
        password: 'Ecuador2026',
        email_confirm: false
      });

    if (errorCuenta || !cuenta.user) {
      return responder({
        error: 'No se pudo crear la cuenta de usuario'
      }, 400);
    }

    // Registra el perfil en la base de datos
    const { error: errorRegistro } =
      await supabase
        .from('perfiles')
        .insert({
          id: cuenta.user.id,
          cedula,
          nombres,
          apellidos,
          telefono,
          correo,
          rol,
          recinto_id,
          debe_cambiar_clave: true
        });

    if (errorRegistro) {

      // Elimina la cuenta si no se pudo registrar el perfil
      await supabase.auth.admin.deleteUser(cuenta.user.id);

      console.error(errorRegistro);

      return responder({
        error: 'No se pudo registrar el perfil'
      }, 500);
    }

    return responder({
      mensaje: 'Usuario registrado correctamente',
      usuario_id: cuenta.user.id
    }, 201);

  } catch (error) {

    console.error(error);

    // Envía el correo de confirmación de la cuenta
  const clienteCorreo = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { error: errorCorreo } = await clienteCorreo.auth.resend({
      type: 'signup',
      email: correo
    });

    if (errorCorreo) {
      console.error('Error al enviar correo:', errorCorreo);

      return responder({
        mensaje: 'Usuario registrado, pero no se pudo enviar el correo',
        usuario_id: cuenta.user.id,
        correo_enviado: false
      }, 201);
    }

    return responder({
      mensaje: 'Usuario registrado correctamente',
      usuario_id: cuenta.user.id,
      correo_enviado: true
    }, 201);
  }


});