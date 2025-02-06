import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xhdvjkgasmsaqmchfsjq.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

console.log('=== Detailed Supabase Connection Debug ===');
console.log('1. Initialization attempt with URL:', supabaseUrl);
console.log('2. Environment check - Key exists:', !!supabaseKey);

let supabaseInstance = null;

try {
  if (!supabaseKey) {
    console.warn('No Supabase key found - some features will be limited');
    // Don't throw, allow the app to continue with limited functionality
  } else {
    console.log('3. Creating Supabase client with provided key');
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        debug: true
      }
    });

    // Test connection only if we have a key
    supabaseInstance?.from('suppliers')
      .select('count', { count: 'exact', head: true })
      .then(() => console.log('4. Test query successful - Connection verified'))
      .catch(err => console.warn('4. Test query warning:', err.message));
  }
} catch (error) {
  console.error('Supabase initialization error:', error);
  // Don't throw, allow the app to continue with limited functionality
}

export const supabase = supabaseInstance;

export const isSupabaseConfigured = () => {
  const configured = !!supabase;
  console.log('Supabase configuration status:', configured);
  return configured;
};

export const getSupabaseClient = () => {
  if (!supabase) {
    console.warn('Supabase client not initialized - some features may be unavailable');
    return null;
  }
  return supabase;
};