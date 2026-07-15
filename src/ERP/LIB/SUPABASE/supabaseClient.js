/*
 * Copyright (c) 2026 JSM Associates and Innovation. All rights reserved.
 * 
 * This code is the exclusive property of JSM Associates and Innovation.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import { createClient } from '@supabase/supabase-js';

// 1. Initializing from ENV
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        "⚠️ Supabase Initialization Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing! " +
        "Ensure your .env file is properly configured at the root of the project."
    );
}

// 2. Initialize the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);