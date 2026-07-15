// ==========================================
// TEMPLATES REPOSITORY
// ==========================================
// EmailJS requires you to map these keys in your EmailJS dashboard template.
// E.g., Your template in EmailJS should look like:
// Subject: {{subject}}
// Hello, {{message_body}}

export const EMAIL_TEMPLATES = {
    ONBOARDING: (params) => ({
        subject: `Welcome to PCL ERP - Your Official Credentials`,
        message_body: `Welcome to the PCL Academic Infrastructure.\n\nYour institutional account has been successfully provisioned.\n\nOfficial ID: ${params.erp_id}\nTemporary Password: ${params.password}\n\nPlease log in at ${params.login_url} and set up your Biometric authentication immediately.`,
    }),
    PASSWORD_RESET: (params) => ({
        subject: `PCL ERP - Password Reset Request`,
        message_body: `A password reset was requested for ID: ${params.erp_id}.\n\nYour temporary access code is: ${params.temp_code}\n\nIf you did not request this, please contact the IT Administrator immediately.`,
    }),
    FEE_REMINDER: (params) => ({
        subject: `URGENT: Fee Invoice Generated - PCL ERP`,
        message_body: `Dear Student (${params.erp_id}),\n\nA new fee invoice for ${params.fee_amount} has been generated on your account for ${params.fee_type}.\n\nDue Date: ${params.due_date}\n\nPlease clear your dues via the Finance Ledger portal to avoid late penalties.`,
    }),
    EXAM_RESULT: (params) => ({
        subject: `CONFIDENTIAL: Examination Results Declared`,
        message_body: `Dear Student (${params.erp_id}),\n\nYour examination results for ${params.exam_name} have been published.\n\nPlease log in to your Academic Vault to view your secure marks ledger.`,
    }),
    DISCIPLINARY: (params) => ({
        subject: `NOTICE: Disciplinary Action / Attendance Warning`,
        message_body: `Dear Student (${params.erp_id}),\n\nThis is an official notice regarding your academic standing.\n\nReason: ${params.reason}\n\nYou are required to meet your Faculty Mentor within 48 hours.`,
    }),
    CUSTOM_ANNOUNCEMENT: (params) => ({
        subject: `PCL ERP Notice: ${params.title}`,
        message_body: `${params.announcement_body}\n\n- PCL Administration`,
    })
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

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/send-email`, {
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
        throw error;
    }
};
