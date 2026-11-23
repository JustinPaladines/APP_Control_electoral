
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Configuración de CORS.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Respuesta uniforme para errores.
function errorResponse(message: string, status: number) {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    },
  );
}

// Función principal de autenticación.
Deno.serve(async (req: Request) => {

  // Gestionar solicitudes CORS.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return errorResponse("Método no permitido", 405);
  }

  try {
    // Obtener las variables proporcionadas por Supabase.
    const supabaseUrl = Deno.env.get("SUPABASE_URL");

    const publishableKeys = JSON.parse(
      Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") || "{}"
    );

    const secretKeys = JSON.parse(
      Deno.env.get("SUPABASE_SECRET_KEYS") || "{}"
    );

    const anonKey = publishableKeys.default;
    const secretKey = secretKeys.default;

    if (!supabaseUrl || !anonKey || !secretKey) {
      console.error("Configuración de Supabase incompleta");
      return errorResponse("Error interno del servidor", 500);
    }

    // Leer y validar los datos recibidos.
    const body = await req.json();
    const { cedula, password } = body;

    if (
      typeof cedula !== "string" ||
      !/^\d{10}$/.test(cedula) ||
      typeof password !== "string" ||
      password.length === 0
    ) {
      return errorResponse("Datos de acceso inválidos", 400);
    }

    // Cliente administrativo para consultar el perfil.
    const adminClient = createClient(
      supabaseUrl,
      secretKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    // Buscar el correo asociado a la cédula.
    const { data: perfil, error: perfilError } =
      await adminClient
        .from("perfiles")
        .select("correo")
        .eq("cedula", cedula)
        .maybeSingle();

    if (perfilError) {
      console.error("Error consultando perfil:", perfilError);
      return errorResponse("No se pudo completar el acceso", 500);
    }

    if (!perfil) {
      return errorResponse("Credenciales incorrectas", 401);
    }

    // Cliente público para autenticar mediante Supabase Auth.
    const authClient = createClient(
      supabaseUrl,
      anonKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    // Supabase verifica la contraseña y genera la sesión.
    const { data, error } =
      await authClient.auth.signInWithPassword({
        email: perfil.correo,
        password,
      });

    if (error || !data.session) {
      return errorResponse("Credenciales incorrectas", 401);
    }

    // Devolver los datos necesarios para establecer la sesión.
    return new Response(
      JSON.stringify({
        session: data.session,
        user: data.user,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );

  } catch (error) {
    console.error("Error interno en login-cedula:", error);

    return errorResponse("Error interno del servidor", 500);
  }
});
