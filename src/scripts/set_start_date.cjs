require('dotenv').config({ path: '../../.env' });

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setStartDate() {
  const date = new Date();
  date.setDate(date.getDate() - 14); // 2 weeks ago
  const dateStr = date.toISOString().split('T')[0];
  
  // Try to check if it exists
  const { data } = await supabase.from('system_settings').select('id').eq('key', 'academic_start_date').maybeSingle();
  
  if (data) {
    const { error } = await supabase.from('system_settings').update({ value: { date: dateStr } }).eq('key', 'academic_start_date');
    if (error) console.error("Error updating:", error);
    else console.log("Updated existing academic_start_date to", dateStr);
  } else {
    const { error } = await supabase.from('system_settings').insert({
      key: 'academic_start_date',
      value: { date: dateStr }
    });
    if (error) console.error("Error inserting:", error);
    else console.log("Inserted new academic_start_date as", dateStr);
  }
}
setStartDate();
