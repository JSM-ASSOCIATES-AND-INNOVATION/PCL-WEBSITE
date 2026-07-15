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

// Existing users pulled from DB
const TEST_STUDENT_ID = 'a5dd1c90-37bc-4f49-b2d8-3f015651db4f';
// eslint-disable-next-line no-unused-vars
const _TEST_FACULTY_ID = 'f17d271e-a787-43d8-8a06-2d122f2299c7';
const TEST_ADMIN_ID = 'cf66e1cf-c275-42e5-9cc6-a17111276439';

async function main() {
    try {
        console.log("Seeding Database...");

        // 1. Clean up previous test data
        await runSQL(`
            DELETE FROM admin_notices WHERE title LIKE 'TEST_%';
            DELETE FROM admin_events WHERE title LIKE 'TEST_%';
            DELETE FROM helpdesk_tickets WHERE subject LIKE 'TEST_%';
        `);
        console.log("Cleaned up old test data.");

        // 2. Insert Notices
        await runSQL(`
            INSERT INTO admin_notices (title, content, target_audience, created_by, status)
            VALUES 
            ('TEST_NOTICE: Holiday Announcement', 'The college will remain closed on Friday for testing purposes.', 'all', '${TEST_ADMIN_ID}', 'published'),
            ('TEST_NOTICE: Assignment Deadline', 'Final deadline for Legal Methods is extended.', 'students', '${TEST_ADMIN_ID}', 'published');
        `);
        console.log("Notices inserted.");

        // 3. Insert Events
        await runSQL(`
            INSERT INTO admin_events (title, date, description, type, target_audience, created_by)
            VALUES 
            ('TEST_EVENT: Annual Moot Court', '2026-12-01', 'National level moot court competition.', 'academic', 'all', '${TEST_ADMIN_ID}');
        `);
        console.log("Events inserted.");

        // 4. Insert Helpdesk Ticket
        try {
            await runSQL(`
                INSERT INTO helpdesk_tickets (ticket_id, user_id, subject, description, status, admin_reply)
                VALUES 
                ('TEST-TKT-123', '${TEST_STUDENT_ID}', 'TEST_SUBJECT: Portal Access Issue', 'Cannot access my course materials for Legal Methods.', 'open', 'Awaiting Support Team Review');
            `);
            console.log("Helpdesk ticket inserted.");
        } catch(e) {
            console.log("Warning: Helpdesk schema differs.", e.message);
        }

        // 5. Insert Attendance
        try {
            await runSQL(`
                INSERT INTO attendance (student_id, date, status, type)
                VALUES 
                ('${TEST_STUDENT_ID}', CURRENT_DATE, 'present', 'lecture'),
                ('${TEST_STUDENT_ID}', CURRENT_DATE - INTERVAL '1 day', 'absent', 'lecture');
            `);
            console.log("Attendance inserted.");
        } catch(e) {
            console.log("Warning: Attendance schema differs.", e.message);
        }

        // 6. Insert Admissions Application
        try {
            await runSQL(`
                INSERT INTO admissions_applications (id, applicant_name, applicant_email, course_applied, status)
                VALUES 
                ('00000000-0000-0000-0000-000000000009', 'TEST_APPLICANT', 'test_applicant@example.com', 'BALLB', 'pending');
            `);
            console.log("Admissions App inserted.");
        } catch(e) {
            console.log("Warning: Admissions schema differs.", e.message);
        }

        console.log("Database Seeding Complete! 🚀");
        
    } catch (e) {
        console.error("Fatal Seeding Error:", e.message);
    }
}

main();
