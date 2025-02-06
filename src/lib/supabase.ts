import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xhdvjkgasmsaqmchfsjq.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.log('Supabase key not found. Please add your Supabase anon key in the project settings.');
  console.log('You can find your anon key at: https://supabase.com/dashboard/project/_/settings/api');
}

// Use a fallback empty string if key is not available to prevent runtime errors
export const supabase = createClient(supabaseUrl, supabaseKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Add a helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!supabaseKey;
};