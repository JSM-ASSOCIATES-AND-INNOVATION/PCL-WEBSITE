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
        console.log("Commencing Production Wipe...");

        // Wipe operational tables to give the client a clean slate
        const tablesToTruncate = [
            'admin_notices',
            'admin_events',
            'helpdesk_tickets',
            'attendance',
            'admissions_applications',
            'fee_invoices',
            'fee_transactions',
            'assignments',
            'assignment_submissions',
            'leave_applications',
            'leave_requests',
            'grievances',
            'student_marks'
        ];

        for (const table of tablesToTruncate) {
            try {
                await runSQL(`TRUNCATE TABLE ${table} CASCADE;`);
                console.log(`[Wiped] ${table}`);
            } catch (e) {
                console.log(`[Skipped/Error] ${table}:`, e.message);
            }
        }

        console.log("Production Wipe Complete! 🧹");
        console.log("Note: `profiles` and core accounts were preserved so the client can log in.");
        
    } catch (e) {
        console.error("Fatal Wiping Error:", e.message);
    }
}

main();
