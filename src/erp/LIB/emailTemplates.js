import emailjs from '@emailjs/browser';

// IMPORTANT: Initialize EmailJS with your Public Key
// emailjs.init("YOUR_PUBLIC_KEY");

export const EMAIL_TEMPLATES = {
    WELCOME_CREDENTIALS: 'template_welcome_creds', // Replace with actual template ID
    // Add more templates here if needed
};

export const EMAIL_SERVICE_ID = 'service_erp_pcl'; // Replace with actual service ID

// Centralized tracking for the 200/month limit
const TRACKING_KEY = 'pcl_erp_email_count';
const MONTH_KEY = 'pcl_erp_email_month';

export const getEmailStats = () => {
    const currentMonth = new Date().getMonth();
    const storedMonth = parseInt(localStorage.getItem(MONTH_KEY));
    let count = parseInt(localStorage.getItem(TRACKING_KEY)) || 0;

    // Reset if a new month has started
    if (storedMonth !== currentMonth) {
        count = 0;
        localStorage.setItem(MONTH_KEY, currentMonth);
        localStorage.setItem(TRACKING_KEY, 0);
    }

    return { count, limit: 200, remaining: 200 - count };
};

export const sendBatchCredentials = async (studentDataList) => {
    let { count, limit } = getEmailStats();
    let sentCount = 0;
    let failedList = [];

    for (const student of studentDataList) {
        if (count >= limit) {
            console.warn("Monthly EmailJS Limit (200) Reached! Halting dispatch.");
            break;
        }

        try {
            // Replace with your actual emailjs.send call when keys are ready
            // Example:
            // await emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATES.WELCOME_CREDENTIALS, {
            //     to_email: student.email,
            //     to_name: student.name,
            //     erp_id: student.erp_id,
            //     password: student.password,
            //     batch: student.batch
            // });

            // Simulating network request for now
            await new Promise(resolve => setTimeout(resolve, 500));
            
            console.log(`[EmailJS] Successfully sent to ${student.email}`);
            count++;
            sentCount++;
        } catch (error) {
            console.error(`[EmailJS] Failed to send to ${student.email}`, error);
            failedList.push(student.email);
        }
    }

    // Update localStorage tracking
    localStorage.setItem(TRACKING_KEY, count);

    return {
        success: true,
        sentCount,
        failedList,
        limitReached: count >= limit
    };
};
