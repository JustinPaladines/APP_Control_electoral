import { InjectionToken, Provider } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

// Token que permite inyectar el cliente de Supabase.
export const SUPABASE_CLIENT =
new InjectionToken<SupabaseClient>('SUPABASE_CLIENT');

// Proveedor centralizado de la conexión.
export function provideSupabase(): Provider {
    return {
        provide: SUPABASE_CLIENT,
        useFactory: () => createClient(
        environment.supabaseUrl,
        environment.supabaseKey
        )
    };
}
