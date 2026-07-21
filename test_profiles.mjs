import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
    const { data, error } = await supabase.rpc('admin_exec_sql', {
        query_text: `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles';`
    });
    console.log(data);
}
main();
