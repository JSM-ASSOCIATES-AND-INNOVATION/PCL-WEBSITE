require('dotenv').config({ path: '../../.env' });

const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    envVars[key.trim()] = values.join('=').trim();
  }
});

// eslint-disable-next-line no-unused-vars
const _url = process.env.VITE_SUPABASE_URL;
const ref = 'saswiwkahpubgivrtjwy';
const token = envVars['VITE_SUPABASE_MANAGEMENT_TOKEN'];

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
    return data;
}

async function main() {
    try {
        console.log("Migrating attendance schema...");
        
        // 1. Add date column if it doesn't exist
        await runSQL(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='date') THEN
                    ALTER TABLE attendance ADD COLUMN date DATE NOT NULL DEFAULT CURRENT_DATE;
                END IF;
            END $$;
        `);
        console.log("Date column added.");

        // 2. Drop existing unique constraints that might conflict (if any). The only unique constraint should be on id right now, but let's make sure.
        
        // 3. Add unique constraint on (class_id, student_id, date)
        await runSQL(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'attendance_class_student_date_key'
                ) THEN
                    ALTER TABLE attendance ADD CONSTRAINT attendance_class_student_date_key UNIQUE (class_id, student_id, date);
                END IF;
            END $$;
        `);
        console.log("Unique constraint added.");
        
    } catch (e) {
        console.error("Migration Error:", e);
    }
}

main();
