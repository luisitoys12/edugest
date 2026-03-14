/**
 * EduGest - Cliente Supabase
 *
 * Este archivo configura el cliente de Supabase para uso en produccion.
 * Para activarlo:
 *   1. Copia .env.example -> .env con tus credenciales de Supabase
 *   2. Importa `supabase` donde necesites hacer queries directas
 *   3. Para auth: usa supabase.auth.signIn / signOut
 *
 * En modo desarrollo (sin credenciales), el sistema usa el storage en memoria.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;
