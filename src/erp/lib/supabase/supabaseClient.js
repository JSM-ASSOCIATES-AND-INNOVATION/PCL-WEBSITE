import { createClient } from '@supabase/supabase-js';

// 1. Hardcoding the exact keys you provided to bypass any .env loading bugs
const supabaseUrl = 'https://saswiwkahpubgivrtjwy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhc3dpd2thaHB1YmdpdnJ0and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMjQ1ODgsImV4cCI6MjA5MzgwMDU4OH0.tDp34Pnyy3v25D6GBW7RCQVvbwiAxKBCR_8e7cTlHpA';

if (!supabaseAnonKey) {
    console.error("The key is still missing!");
}

// 2. Initialize the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);