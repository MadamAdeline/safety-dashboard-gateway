import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xhdvjkgasmsaqmchfsjq.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

console.log('=== Supabase Client Initialization Debug ===');
console.log('Supabase URL:', supabaseUrl);
console.log('Key present:', !!supabaseKey);
if (supabaseKey) {
  console.log('Key length:', supabaseKey.length);
  console.log('Key starts with:', supabaseKey.substring(0, 4));
  console.log('Key ends with:', supabaseKey.slice(-3));
  console.log('Full key value:', supabaseKey); // Temporary for debugging
}

if (!supabaseKey) {
  console.error('Critical: Supabase key not found. Please ensure the key is properly set.');
}

// Create client with additional options for debugging
export const supabase = supabaseKey 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        debug: true
      },
      global: {
        headers: {
          'x-client-info': 'lovable-app'
        }
      }
    })
  : null;

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  const configured = !!supabaseKey && supabaseKey.startsWith('eyJ');
  console.log('Supabase configured:', configured);
  return configured;
};

// Helper function to get the client safely
export const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Please check console for detailed logs.');
  }
  return supabase;
};