require('dotenv').config({ path: '../../.env' });

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: t } = await supabase.from('timetable').select('*').limit(1);
  const { data: s } = await supabase.from('subjects').select('*').limit(1);
  console.log("Timetable schema:", Object.keys(t[0] || {}));
  console.log("Subjects schema:", Object.keys(s[0] || {}));
}
check();
