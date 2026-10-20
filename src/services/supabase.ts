import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-supabase-public-anon-key')
);

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.info(
    '[EveryGyan Info] Supabase environment variables are using placeholders or not yet configured. The app will utilize local development data with honest status indicators.'
  );
}

// Client instance; initialized with safe fallback to prevent crashes if unconfigured
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://wttiswajotrmmrcwzqdy.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key'
);
