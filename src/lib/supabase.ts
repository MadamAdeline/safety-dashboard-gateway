import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xhdvjkgasmsaqmchfsjq.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

console.log('=== Detailed Supabase Connection Debug ===');
console.log('1. Initialization attempt with URL:', supabaseUrl);
console.log('2. Environment check - Key exists:', !!supabaseKey);
console.log('3. Key format check:', supabaseKey ? `Key starts with: ${supabaseKey.substring(0, 4)}...` : 'No key found');

// Enhanced key validation with detailed logging
const isValidKey = (key: string | undefined): boolean => {
  if (!key) {
    console.error('Validation failed: Supabase key is undefined or empty');
    return false;
  }

  const validationResults = {
    length: key.length,
    startsWithEyJ: key.startsWith('eyJ'),
    hasValidChars: /^[A-Za-z0-9_-]+$/g.test(key),
    isLongEnough: key.length > 50
  };

  console.log('4. Key validation results:', validationResults);

  return validationResults.startsWithEyJ && 
         validationResults.hasValidChars && 
         validationResults.isLongEnough;
};

// Create client with enhanced validation and error handling
let supabaseInstance = null;
try {
  if (!supabaseKey) {
    throw new Error('Initialization failed: Supabase key is missing');
  }

  if (!isValidKey(supabaseKey)) {
    throw new Error('Initialization failed: Invalid Supabase key format');
  }

  supabaseInstance = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      debug: true
    }
  });

  console.log('5. Supabase client created successfully');
  
  // Test connection
  supabaseInstance.from('suppliers').select('count', { count: 'exact', head: true })
    .then(() => console.log('6. Test query successful - Connection verified'))
    .catch(err => console.error('6. Test query failed:', err.message));

} catch (error) {
  console.error('Supabase initialization error:', error);
  throw error;
}

export const supabase = supabaseInstance;

export const isSupabaseConfigured = () => {
  const configured = !!supabase;
  console.log('Supabase configuration check:', configured);
  return configured;
};

export const getSupabaseClient = () => {
  if (!supabase) {
    const error = new Error('Supabase client not initialized. Please check console for detailed logs.');
    console.error(error);
    throw error;
  }
  return supabase;
};