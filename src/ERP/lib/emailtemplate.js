/* © 2026 JSM Associates & Innovation. All Rights Reserved. */

/**
 * Beautiful HTML Email Templates for PCL ERP
 * Designed with premium typography, deep shadows, and professional academic themes.
 */

const baseStyles = `
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #1a1a1a;
    line-height: 1.6;
    margin: 0;
    padding: 0;
`;

const containerStyles = `
    max-width: 600px;
    margin: 40px auto;
    background: #ffffff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    border: 1px solid #eaeaea;
`;

const headerStyles = `
    background: #0a0a0a;
    color: #ffffff;
    padding: 30px;
    text-align: center;
`;

const contentStyles = `
    padding: 40px 30px;
    background: #ffffff;
`;

const footerStyles = `
    background: #f8f9fa;
    padding: 20px 30px;
    text-align: center;
    font-size: 12px;
    color: #666666;
    border-top: 1px solid #eaeaea;
`;

const buttonStyles = `
    display: inline-block;
    padding: 12px 24px;
    background-color: #0a0a0a;
    color: #ffffff !important;
    text-decoration: none;
    border-radius: 8px;
    font-weight: bold;
    margin-top: 20px;
    letter-spacing: 0.5px;
`;

export const HTML_EMAIL_TEMPLATES = {
    // 1. CREDENTIALS & ONBOARDING
    FIRST_CREDENTIALS: (params) => `
    <div style="${baseStyles} background-color: #f3f4f6; padding: 20px;">
        <div style="${containerStyles}">
            <div style="${headerStyles}">
                <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px; font-weight: 900;">WELCOME TO JSM</h1>
                <p style="margin: 10px 0 0 0; color: #a1a1aa; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Academic Infrastructure</p>
            </div>
            <div style="${contentStyles}">
                <h2 style="font-size: 20px; margin-top: 0;">Hello ${params.name || 'Student'},</h2>
                <p>Your institutional account has been successfully provisioned. Welcome to our academic community.</p>
                
                <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 30px 0; border: 1px solid #eaeaea;">
                    <p style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666;">Official ERP ID</p>
                    <p style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold;">${params.erp_id}</p>
                    
                    <p style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666;">Temporary Secure Passcode</p>
                    <p style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">${params.password}</p>
                </div>

                <p>For security purposes, you will be required to configure a new personal passcode upon your first login.</p>
                
                <center>
                    <a href="${params.login_url}" style="${buttonStyles}">ACCESS SECURE PORTAL</a>
                </center>
            </div>
            <div style="${footerStyles}">
                &copy; ${new Date().getFullYear()} PCL ERP. Confidential Information.<br/>
                If you did not expect this email, please contact IT Support immediately.
            </div>
        </div>
    </div>
    `,

    // 2. BIRTHDAY WISHES
    HAPPY_BIRTHDAY: (params) => `
    <div style="${baseStyles} background-color: #fdf2f8; padding: 20px;">
        <div style="${containerStyles} border: 2px solid #fbcfe8; box-shadow: 0 20px 40px rgba(244,114,182,0.15);">
            <div style="${headerStyles} background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%); padding: 40px 30px;">
                <h1 style="margin: 0; font-size: 32px; letter-spacing: 2px; font-weight: 900; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">🎉 HAPPY BIRTHDAY! 🎉</h1>
            </div>
            <div style="${contentStyles} text-align: center;">
                <h2 style="font-size: 28px; color: #e11d48; margin-top: 0;">Dear ${params.name},</h2>
                <p style="font-size: 18px; color: #4c1d95; line-height: 1.8;">
                    Wishing you a fantastic birthday filled with joy, success, and brilliant new discoveries! <br/><br/>
                    We are thrilled to have you as part of our academic family and hope this year brings you closer to all your dreams.
                </p>
                
                <div style="font-size: 40px; margin: 30px 0;">🎂 🎈 🎁</div>
                
                <p style="font-style: italic; color: #666;">- The JSM Administration & Faculty Team</p>
            </div>
        </div>
    </div>
    `,

    // 3. PUBLIC ENQUIRIES / SUPPORT
    SUPPORT_ENQUIRY: (params) => `
    <div style="${baseStyles} background-color: #f0f9ff; padding: 20px;">
        <div style="${containerStyles} border-top: 4px solid #0ea5e9;">
            <div style="${contentStyles}">
                <h2 style="font-size: 20px; margin-top: 0; color: #0284c7;">We Received Your Enquiry</h2>
                <p>Hello ${params.name},</p>
                <p>Thank you for reaching out to us. Our admissions and support team has received your message and is currently reviewing it.</p>
                
                <div style="background: #f8fafc; border-left: 4px solid #0ea5e9; padding: 15px 20px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; font-weight: bold; color: #0f172a;">Your Message Reference: #${params.ticket_id || Math.floor(Math.random() * 100000)}</p>
                    <p style="margin: 10px 0 0 0; font-style: italic; color: #475569;">"${params.message_preview}"</p>
                </div>
                
                <p>We typically respond within 24-48 business hours. If your matter is urgent, please call our toll-free support line.</p>
            </div>
            <div style="${footerStyles}">
                JSM Administrative Admissions Support<br/>
                info@prudentiacollegeoflaw.com
            </div>
        </div>
    </div>
    `
};

export const HTML_EXTRA_TEMPLATES = {
    APPLICATION_RECEIVED: (params) => `
    <div style="font-family: 'Inter', sans-serif; background-color: #f3f4f6; padding: 20px;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); border: 1px solid #eaeaea;">
            <div style="background: #0a0a0a; color: #ffffff; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px; font-weight: 900;">PRUDENTIA COLLEGE OF LAW</h1>
            </div>
            <div style="padding: 40px 30px;">
                <h2 style="font-size: 20px; margin-top: 0;">Application Received</h2>
                <p>Hello ${params.name},</p>
                <p>Thank you for submitting your application. We have officially received it and our committee is currently reviewing your profile.</p>
                
                <div style="background: #f8f9fa; border-left: 4px solid #FFC107; padding: 15px 20px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; font-weight: bold;">Application Type: ${params.type}</p>
                    <p style="margin: 0; font-size: 14px; font-weight: bold;">Ticket ID: ${params.ticket_id}</p>
                </div>
                
                <p>If we require any further documentation, we will reach out to you directly on this email.</p>
            </div>
        </div>
    </div>
    `,
    TICKET_REPLY: (params) => `
    <div style="font-family: 'Inter', sans-serif; background-color: #f3f4f6; padding: 20px;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); border: 1px solid #eaeaea;">
            <div style="background: #0a0a0a; color: #ffffff; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px; font-weight: 900;">PRUDENTIA SUPPORT</h1>
            </div>
            <div style="padding: 40px 30px;">
                <h2 style="font-size: 20px; margin-top: 0;">Update on Ticket #${params.ticket_id}</h2>
                
                <div style="background: #f8f9fa; border-left: 4px solid #FFC107; padding: 15px 20px; margin: 20px 0;">
                    <p style="margin: 0; font-style: italic;">"${params.admin_reply}"</p>
                </div>
                
                <p>If you have any further questions, you can reply directly to this thread or reach out to our administration office.</p>
            </div>
        </div>
    </div>
    `,
    ERP_LOGIN_OTP: (params) => {
        const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'long' });
        
        // Generate random mock IP/Device for the "in-depth security details" feel
        const mockIP = Math.floor(Math.random() * 255) + "." + Math.floor(Math.random() * 255) + ".x.x";
        
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Prudentia Security Verification</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #070707; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #ffffff;">
            
            <!-- PREHEADER TEXT (Invisible in email body, visible in inbox preview) -->
            <div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; line-height: 1px; color: #070707; opacity: 0;">
                Your secure access passcode for the Prudentia ERP Portal is ${params.otp}. This code expires in 10 minutes.
                &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
            </div>

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #070707; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #0d0d0d; border-radius: 20px; border: 1px solid #222222; overflow: hidden; box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8);">
                            
                            <!-- LUXURY HEADER -->
                            <tr>
                                <td style="padding: 45px 40px 40px 40px; text-align: center; background: #0a0a0a; background-image: radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%); border-bottom: 1px solid #1f1f1f;">
                                    <div style="margin-bottom: 15px;">
                                        <img src="data:image/png;base64,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" alt="Prudentia College Logo" style="height: 65px; width: auto; display: block; margin: 0 auto; filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.3));" />
                                    </div>
                                    <h1 style="margin: 0; color: #ffffff; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; letter-spacing: 5px; text-transform: uppercase; font-weight: normal;">
                                        Prudentia
                                    </h1>
                                    <p style="margin: 10px 0 0 0; color: #d4af37; font-family: 'Courier New', Courier, monospace; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; font-weight: bold;">
                                        College of Law
                                    </p>
                                </td>
                            </tr>

                            <!-- GOLD ACCENT LINE -->
                            <tr>
                                <td style="height: 2px; background: linear-gradient(90deg, #0d0d0d, #d4af37, #0d0d0d);"></td>
                            </tr>

                            <!-- MAIN CONTENT -->
                            <tr>
                                <td style="padding: 45px 40px;">
                                    <h2 style="margin: 0 0 15px 0; color: #ffffff; font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: normal; letter-spacing: 0.5px;">Authorization Required</h2>
                                    <p style="margin: 0 0 30px 0; color: #a1a1aa; font-size: 14px; line-height: 1.8;">
                                        A request has been initiated to access your secure <strong>ERP Portal</strong> account. To verify your identity and authorize this session, please utilize the cryptographic passcode generated below.
                                    </p>
                                    
                                    <!-- OTP DISPLAY -->
                                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin: 35px 0;">
                                        <tr>
                                            <td align="center" style="background-color: #121212; border: 1px solid #2a2a2a; border-radius: 16px; padding: 35px 20px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);">
                                                <p style="margin: 0 0 15px 0; color: #666666; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; font-weight: bold;">Secure One-Time Passcode</p>
                                                <div style="font-family: 'Courier New', Courier, monospace; font-size: 48px; font-weight: 900; letter-spacing: 12px; color: #d4af37; text-shadow: 0 0 20px rgba(212, 175, 55, 0.3); margin-left: 12px;">${params.otp}</div>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- DETAILED SECURITY INFO -->
                                    <h3 style="margin: 0 0 15px 0; color: #ffffff; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #222222; padding-bottom: 10px; font-family: 'Courier New', Courier, monospace;">Diagnostic & Security Details</h3>
                                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 30px; background: #121212; border-radius: 12px; padding: 20px; border: 1px solid #1a1a1a;">
                                        <tr>
                                            <td style="padding: 8px 0; color: #666666; font-size: 12px; width: 130px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Target Identity</td>
                                            <td style="padding: 8px 0; color: #ffffff; font-size: 13px; font-weight: 500;">${params.to_email}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; color: #666666; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Timestamp (IST)</td>
                                            <td style="padding: 8px 0; color: #a1a1aa; font-size: 13px; font-weight: 500;">${timestamp}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; color: #666666; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Network IP</td>
                                            <td style="padding: 8px 0; color: #a1a1aa; font-size: 13px; font-family: 'Courier New', Courier, monospace;">${mockIP}</td>
                                        </tr>
                                    </table>

                                    <p style="margin: 0; color: #666666; font-size: 12px; line-height: 1.6;">
                                        This verification code will securely expire in exactly <strong>10 minutes</strong>. If you did not initiate this access request, your credentials may be compromised. Please disregard this transmission or contact the JSM Network Security Team immediately.
                                    </p>
                                </td>
                            </tr>

                            <!-- LUXURY FOOTER -->
                            <tr>
                                <td style="background-color: #0a0a0a; padding: 35px 40px; text-align: center; border-top: 1px solid #1f1f1f;">
                                    <p style="margin: 0 0 12px 0; color: #444444; font-size: 10px; line-height: 1.8; letter-spacing: 1.5px; text-transform: uppercase;">
                                        &copy; ${new Date().getFullYear()} JSM Associates & Innovation.<br/>
                                        Exclusive IT Infrastructure Partner
                                    </p>
                                    <p style="margin: 0; color: #d4af37; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; font-weight: bold; opacity: 0.7;">
                                        CONFIDENTIAL &bull; INTERNAL USE ONLY
                                    </p>
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `;
    }
};
Object.assign(HTML_EMAIL_TEMPLATES, HTML_EXTRA_TEMPLATES);
