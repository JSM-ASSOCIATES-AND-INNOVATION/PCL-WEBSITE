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

const TEST_STUDENT_ID = 'a5dd1c90-37bc-4f49-b2d8-3f015651db4f';
// eslint-disable-next-line no-unused-vars
const _TEST_FACULTY_ID = 'f17d271e-a787-43d8-8a06-2d122f2299c7';
const TEST_ADMIN_ID = 'cf66e1cf-c275-42e5-9cc6-a17111276439';

async function main() {
    console.log("Seeding Database...");

    // 1. Insert Notices
    try {
        await runSQL(`
            INSERT INTO admin_notices (notice_id, title, category, target_audience, priority, content, author_name, author_id, is_public)
            VALUES 
            ('NOT-003', 'DUMMY_NOTICE: Exam Schedule Released', 'Academic', 'Students', 'High', 'The end-semester exam schedule is now live.', 'Admin Swaroop', '${TEST_ADMIN_ID}', true);
        `);
        console.log("Notices inserted.");
    } catch (e) { console.error("Notice error:", e.message); }

    // 2. Insert Events
    try {
        await runSQL(`
            INSERT INTO admin_events (title, description, event_date, location, is_public, author_id, author_name)
            VALUES 
            ('DUMMY_EVENT: Annual Moot Court', 'National level moot court competition.', '2026-12-01', 'Auditorium', true, '${TEST_ADMIN_ID}', 'Admin Swaroop');
        `);
        console.log("Events inserted.");
    } catch (e) { console.error("Event error:", e.message); }

    // 3. Insert Helpdesk Ticket
    try {
        await runSQL(`
            INSERT INTO helpdesk_tickets (ticket_id, user_id, subject, category, description, priority, status, admin_reply)
            VALUES 
            ('TKT-998', '${TEST_STUDENT_ID}', 'DUMMY_SUBJECT: Library Fine Issue', 'Accounts', 'I have a library fine that I already paid.', 'Medium', 'Open', 'Will check with library staff.');
        `);
        console.log("Helpdesk ticket inserted.");
    } catch (e) { console.error("Helpdesk error:", e.message); }

    // 4. Insert Attendance
    try {
        await runSQL(`
            INSERT INTO attendance (class_id, student_id, status)
            VALUES 
            ('00000000-0000-0000-0000-000000000000', '${TEST_STUDENT_ID}', 'present'),
            ('00000000-0000-0000-0000-000000000000', '${TEST_STUDENT_ID}', 'absent');
        `);
        console.log("Attendance inserted.");
    } catch (e) { console.error("Attendance error:", e.message); }

    // 5. Insert Admissions Application
    try {
        await runSQL(`
            INSERT INTO admissions_applications (name, email, phone, program, status)
            VALUES 
            ('DUMMY_APPLICANT', 'dummy@example.com', '1234567890', 'BALLB', 'pending');
        `);
        console.log("Admissions App inserted.");
    } catch (e) { console.error("Admissions error:", e.message); }

    // 6. Insert Fee Invoice
    try {
        await runSQL(`
            INSERT INTO fee_invoices (student_id, title, type, amount, due_date, status)
            VALUES 
            ('${TEST_STUDENT_ID}', 'DUMMY_FEE: Semester 1 Tuition', 'Tuition', 20000.00, '2026-10-01', 'Pending');
        `);
        console.log("Fee Invoice inserted.");
    } catch (e) { console.error("Fee Invoice error:", e.message); }

    console.log("Admin Data Seeding Complete! 🚀");
}

main();
