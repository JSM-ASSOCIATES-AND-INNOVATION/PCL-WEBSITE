// ==========================================
// TEMPLATES REPOSITORY
// ==========================================
// EmailJS requires you to map these keys in your EmailJS dashboard template.
// E.g., Your template in EmailJS should look like:
// Subject: {{subject}}
// Hello, {{message_body}}

export const EMAIL_TEMPLATES = {
    ONBOARDING: (params) => ({
        subject: `Welcome to JSM ERP - Your Official Credentials`,
        message_body: `Welcome to the JSM Academic Infrastructure.\n\nYour institutional account has been successfully provisioned.\n\nOfficial ID: ${params.erp_id}\nTemporary Password: ${params.password}\n\nPlease log in at ${params.login_url} and set up your Biometric authentication immediately.`,
    }),
    PASSWORD_RESET: (params) => ({
        subject: `JSM ERP - Password Reset Request`,
        message_body: `A password reset was requested for ID: ${params.erp_id}.\n\nYour temporary access code is: ${params.temp_code}\n\nIf you did not request this, please contact the IT Administrator immediately.`,
    }),
    FEE_REMINDER: (params) => ({
        subject: `URGENT: Fee Invoice Generated - JSM ERP`,
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
        subject: `JSM ERP Notice: ${params.title}`,
        message_body: `${params.announcement_body}\n\n- JSM Administration`,
    }),
    BLOG_ACCEPTED: (params) => ({
        subject: `Congratulations! Your Blog Post has been Published`,
        message_body: `Dear ${params.author_name},\n\nWe are thrilled to inform you that your blog post titled "${params.title}" has been reviewed and APPROVED by the Editorial Board.\n\nIt is now live on the JSM website! You can view and share it using the following link:\n${params.post_url}\n\nThank you for your valuable contribution to our academic community.\n\n- Website Administration`,
    }),
    BLOG_REJECTED: (params) => ({
        subject: `Update regarding your Blog Post Submission`,
        message_body: `Dear ${params.author_name},\n\nThank you for submitting your blog post titled "${params.title}".\n\nAfter careful review, the Editorial Board has decided not to publish this piece at this time. ${params.feedback ? `\n\nFeedback: ${params.feedback}` : ''}\n\nWe appreciate your effort and encourage you to submit future articles.\n\n- Website Administration`,
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

        const response = await fetch('http://localhost:3001/send-email', {
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
