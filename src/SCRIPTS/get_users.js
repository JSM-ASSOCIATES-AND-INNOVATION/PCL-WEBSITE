/*
 * Copyright (c) 2026 JSM Associates and Innovation. All rights reserved.
 * 
 * This code is the exclusive property of JSM Associates and Innovation.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import 'dotenv/config'; // Loads from ../../.env
// eslint-disable-next-line no-unused-vars
const _url = process.env.VITE_SUPABASE_URL;
const ref = 'saswiwkahpubgivrtjwy';
const token = process.env.VITE_SUPABASE_MANAGEMENT_TOKEN;

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
        const data = await runSQL(`SELECT id, email, role FROM profiles LIMIT 10;`);
        console.log("Existing users:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error:", e.message);
    }
}

main();
