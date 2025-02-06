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

// Only create the client if we have a valid key
export const supabase = supabaseKey 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Add a helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!supabaseKey && supabaseKey.startsWith('eyJ');
};

// Helper function to get the client safely
export const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Please add your Supabase anon key.');
  }
  return supabase;
};