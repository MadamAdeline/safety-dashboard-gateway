import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://xhdvjkgasmsaqmchfsjq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoZHZqa2dhc21zYXFtY2hmc2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4MTI1MDcsImV4cCI6MjA1NDM4ODUwN30.hWnhkJLTGgAX4GarYQqlloSlAfpgwaI1LdajqTjsYAo";

console.log('=== Detailed Supabase Connection Debug ===');
console.log('1. Initialization attempt with URL:', SUPABASE_URL);
console.log('2. Environment check - Key exists:', !!SUPABASE_PUBLISHABLE_KEY);

let supabaseInstance = null;

try {
  if (!SUPABASE_PUBLISHABLE_KEY) {
    console.warn('No Supabase key found - some features will be limited');
    // Don't throw, allow the app to continue with limited functionality
  } else {
    console.log('3. Creating Supabase client with provided key');
    supabaseInstance = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    // Test connection only if we have a key
    supabaseInstance?.auth.getSession()
      .then(({ data, error }) => {
        if (error) {
          console.error('4. Connection error:', error);
        } else {
          console.log('4. Connection successful');
        }
      })
      .catch(err => console.error('4. Unexpected error:', err));
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