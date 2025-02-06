import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xhdvjkgasmsaqmchfsjq.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

console.log('=== Supabase Client Initialization Debug ===');
console.log('Supabase URL:', supabaseUrl);
console.log('Key present:', !!supabaseKey);

// Validate key format
const isValidKey = (key: string | undefined): boolean => {
  return !!key && 
    key.startsWith('eyJ') && 
    key.length > 50 && // Supabase keys are typically longer than 50 chars
    /^[A-Za-z0-9_-]+$/g.test(key); // Should only contain these characters
};

if (supabaseKey) {
  console.log('Key validation:', {
    length: supabaseKey.length,
    startsWithEyJ: supabaseKey.startsWith('eyJ'),
    format: /^[A-Za-z0-9_-]+$/g.test(supabaseKey)
  });
} else {
  console.error('Critical: Supabase key not found');
}

// Create client with validation
let supabaseInstance = null;
try {
  if (isValidKey(supabaseKey)) {
    supabaseInstance = createClient(supabaseUrl, supabaseKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        debug: true
      }
    });
    console.log('Supabase client created successfully');
  } else {
    console.error('Invalid Supabase key format');
  }
} catch (error) {
  console.error('Error creating Supabase client:', error);
}

export const supabase = supabaseInstance;

export const isSupabaseConfigured = () => {
  const configured = !!supabase;
  console.log('Supabase configured:', configured);
  return configured;
};

export const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Please ensure your anon key is valid and properly formatted.');
  }
  return supabase;
};