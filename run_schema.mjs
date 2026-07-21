import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
    const query_text = fs.readFileSync('/Users/JSM/.gemini/antigravity/brain/92d5d2cc-0f6d-4d37-b22b-d13084f666fb/password_reset_schema.sql', 'utf8');
    const { data, error } = await supabase.rpc('admin_exec_sql', { query_text });
    if (error) {
        console.error("RPC Error:", error);
    } else {
        console.log("Success:", data);
    }
}
main();
