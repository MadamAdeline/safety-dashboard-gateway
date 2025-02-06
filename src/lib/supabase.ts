import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xhdvjkgasmsaqmchfsjq.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Initializing Supabase client...');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase key status:', supabaseKey ? 'Present' : 'Missing');

if (!supabaseKey) {
  console.error('Supabase key not found. Please add your Supabase anon key in the project settings.');
  console.log('You can find your anon key at: https://supabase.com/dashboard/project/_/settings/api');
  console.log('The key should start with "eyJ" and be about 160 characters long.');
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