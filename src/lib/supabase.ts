import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xhdvjkgasmsaqmchfsjq.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('VITE_SUPABASE_ANON_KEY is not set in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey || '');

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!supabaseKey;
};