const token = 'YOUR_SUPABASE_TOKEN';
const ref = 'saswiwkahpubgivrtjwy';
async function runSQL(query) {
    const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error);
    console.log(JSON.stringify(data, null, 2));
}
runSQL("SELECT pol.polname, pol.polcmd, pol.polqual, pol.polwithcheck FROM pg_policy pol JOIN pg_class tbl ON pol.polrelid = tbl.oid WHERE tbl.relname = 'attendance';");
