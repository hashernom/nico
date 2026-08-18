import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error(
        '⚠️ Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ' +
        'Revisá .env.local (local) o las variables de entorno en Vercel (producción).'
    );
}

// Esta clave es pública a propósito: solo permite lo que habilitan las
// políticas RLS (leer todo, escribir únicamente con sesión iniciada).
export const supabase = createClient(url, key);
