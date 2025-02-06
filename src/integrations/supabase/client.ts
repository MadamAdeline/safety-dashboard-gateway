import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://xhdvjkgasmsaqmchfsjq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoZHZqa2dhc21zYXFtY2hmc2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4MTI1MDcsImV4cCI6MjA1NDM4ODUwN30.hWnhkJLTGgAX4GarYQqlloSlAfpgwaI1LdajqTjsYAo";

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

// Test the connection and properly handle the Promise chain
const testConnection = async () => {
  try {
    await supabase.from('suppliers')
      .select('count', { count: 'exact', head: true });
    console.log('3. Test query successful - Connection verified');
  } catch (err) {
    console.error('3. Connection test failed:', err.message);
    console.error('Full error:', err);
  }
};

// Execute the test
void testConnection();

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