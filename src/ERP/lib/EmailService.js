/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import { HTML_EMAIL_TEMPLATES } from './emailtemplate';

export const EMAIL_TEMPLATES = {
    ERP_LOGIN_OTP: (params) => ({
        subject: `Your ERP Login Passcode`,
        message_body: HTML_EMAIL_TEMPLATES.ERP_LOGIN_OTP(params),
    }),
    // Legacy wrappers for backward compatibility if needed, though we prefer HTML
    APPLICATION_RECEIVED: (params) => ({
        subject: `Application Received - Ticket #${params.ticket_id}`,
        message_body: HTML_EMAIL_TEMPLATES.APPLICATION_RECEIVED(params),
    }),
    TICKET_REPLY: (params) => ({
        subject: `Update on Ticket #${params.ticket_id} - Prudentia`,
        message_body: HTML_EMAIL_TEMPLATES.TICKET_REPLY(params),
    }),
    SUPPORT_ENQUIRY: (params) => ({
        subject: `We Received Your Enquiry - Ticket #${params.ticket_id}`,
        message_body: HTML_EMAIL_TEMPLATES.SUPPORT_ENQUIRY(params),
    }),
    ONBOARDING: (params) => ({
        subject: `Welcome to PCL ERP - Your Official Credentials`,
        message_body: HTML_EMAIL_TEMPLATES.FIRST_CREDENTIALS ? HTML_EMAIL_TEMPLATES.FIRST_CREDENTIALS(params) : `Welcome to the JSM Academic Infrastructure...\n\nOfficial ID: ${params.erp_id}\nTemporary Password: ${params.password}`,
    }),
};

// ==========================================
// DISPATCH ENGINE
// ==========================================
export const sendSystemEmail = async (templateKey, params) => {
    try {
        const templateBuilder = EMAIL_TEMPLATES[templateKey];
        if (!templateBuilder) {
            throw new Error(`Invalid email template key: ${templateKey}`);
        }

        const { subject, message_body } = templateBuilder(params);

        const emailEndpoint = (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') 
            ? '/api/send-email' 
            : (import.meta.env.VITE_EMAIL_SERVER_URL || 'http://localhost:3001/send-email');

        const response = await fetch(emailEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to_email: params.to_email,
                subject: subject,
                message_body: message_body
            }),
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to dispatch email via local engine.');
        }

        console.log(`[Email Engine] Dispatched: ${subject} to ${params.to_email}`);
        return true;
    } catch (error) {
        console.error("Email Engine Error:", error);
        throw error;
    }
};
