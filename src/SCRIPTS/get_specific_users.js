/*
 * Copyright (c) 2026 JSM Associates and Innovation. All rights reserved.
 * 
 * This code is the exclusive property of JSM Associates and Innovation.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

// eslint-disable-next-line no-unused-vars
import 'dotenv/config'; // Loads from .env

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
        const data = await runSQL(`
            SELECT id, erp_id, full_name, role 
            FROM profiles 
            WHERE erp_id IN ('ADM0001', 'FAC0001', '21BBL7020');
        `);
        console.log("Users:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error:", e.message);
    }
}

main();
