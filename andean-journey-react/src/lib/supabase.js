import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        '[Supabase] Faltan variables de entorno.\n' +
        'Crea el archivo .env.local con:\n' +
        '  VITE_SUPABASE_URL=https://tu-proyecto.supabase.co\n' +
        '  VITE_SUPABASE_ANON_KEY=eyJ...'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Persistir sesión en localStorage para que sobreviva a refrescos de página
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
    },
});
