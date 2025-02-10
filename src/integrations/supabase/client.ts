
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://aejuqvqbcxqsxnlomkwx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_ANON_KEY || '';

console.log('=== Detailed Supabase Connection Debug ===');
console.log('1. Initialization attempt with URL:', SUPABASE_URL);
console.log('2. Environment check - Key exists:', !!SUPABASE_PUBLISHABLE_KEY);

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// Test the connection and log the result
async function testConnection() {
  try {
    const { count, error } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('3. Connection test failed:', error.message);
      console.error('Full error:', error);
      return;
    }
    
    console.log('3. Test query successful - Connection verified');
    console.log('4. Number of suppliers:', count);
  } catch (err) {
    console.error('3. Connection test failed:', err);
  }
}

// Execute the test
testConnection();

export const isSupabaseConfigured = () => {
  return !!SUPABASE_PUBLISHABLE_KEY;
};

export const getSupabaseClient = () => {
  if (!SUPABASE_PUBLISHABLE_KEY) {
    console.warn('Supabase client not initialized - some features may be unavailable');
    return null;
  }
  return supabase;
};
