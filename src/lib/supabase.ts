import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xhdvjkgasmsaqmchfsjq.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

console.log('Initializing Supabase client...');
console.log('Supabase URL:', supabaseUrl);
console.log('Key length:', supabaseKey?.length);
console.log('Key starts with:', supabaseKey?.substring(0, 4));

if (!supabaseKey) {
  console.error('Supabase key not found in either VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY');
  console.log('Please add your Supabase anon key using the form provided in the chat');
}

// Create the client with detailed error logging
export const supabase = createClient(supabaseUrl, supabaseKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Add a helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!supabaseKey && supabaseKey.startsWith('eyJ');
};