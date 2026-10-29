const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Professional Email Layout Wrapper (Mimicking official notification templates)
function wrapEmailHtml(contentHtml) {
    return `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px 0; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            
            <!-- HEADER BRANDING -->
            <div style="background-color: #0B1F3B; padding: 25px 30px; text-align: left; border-bottom: 4px solid #059669;">
                <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 0.5px;">PESO GUAGUA PORTAL</h1>
                <p style="color: #94a3b8; margin: 5px 0 0; font-size: 12px;">Public Employment Service Office - Municipality of Guagua</p>
            </div>

            <!-- MAIN CONTENT BODY -->
            <div style="padding: 30px; color: #334155; font-size: 14px; line-height: 1.6;">
                ${contentHtml}
            </div>

            <!-- DARK FOOTER SECTION -->
            <div style="background-color: #0B1F3B; color: #94a3b8; padding: 20px 30px; font-size: 11px; border-top: 1px solid #1e293b;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="text-align: left; vertical-align: top;">
                            <p style="margin: 0; font-weight: bold; color: #ffffff;">Public Employment Service Office</p>
                            <p style="margin: 3px 0 0;">Municipal Hall of Guagua, Pampanga</p>
                        </td>
                        <td style="text-align: right; vertical-align: top;">
                            <p style="margin: 0; font-weight: bold; color: #ffffff;">Contact Support</p>
                            <p style="margin: 3px 0 0;">Email: <a href="mailto:support@pesoguagua.gov.ph" style="color: #34d399; text-decoration: none;">support@pesoguagua.gov.ph</a></p>
                        </td>
                    </tr>
                </table>
            </div>

        </div>
    </div>`;
}

// 1. Core Status Email Function (Used by Job Portal ATS & Events)
async function sendStatusEmail(toEmail, subject, rawBodyContent) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️ Email credentials not configured. Skipping email send.');
        return;
    }

    try {
        const formattedHtml = wrapEmailHtml(rawBodyContent);

        await transporter.sendMail({
            from: `"PESO Guagua Portal" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: subject,
            text: rawBodyContent.replace(/<[^>]*>?/gm, ''), // Plain text fallback
            html: formattedHtml
        });
        console.log(`✅ Professional template email successfully sent to ${toEmail}`);
    } catch (err) {
        console.error('❌ Failed to send email:', err.message);
    }
}

// 2. Specialized Helper for Event Confirmation Notifications
async function sendEventConfirmationEmail(toEmail, fullName, eventTitle, eventDate, eventLocation, govIdType) {
    const subject = `PESO Guagua: Attendance Confirmed - ${eventTitle}`;
    const formattedDate = new Date(eventDate).toLocaleString();

    const rawBodyContent = `
        <p style="margin-top: 0;">Dear <strong>${fullName}</strong>,</p>
        <p>We are pleased to inform you that your pre-registration for <strong>${eventTitle}</strong> has been officially <span style="color: #059669; font-weight: bold;">VERIFIED & CONFIRMED</span>.</p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <h4 style="margin: 0 0 10px 0; color: #0B1F3B;">Event Details & Entrance Pass:</h4>
            <p style="margin: 4px 0;"><strong>📅 Schedule:</strong> ${formattedDate}</p>
            <p style="margin: 4px 0;"><strong>📍 Location:</strong> ${eventLocation}</p>
            <p style="margin: 4px 0;"><strong>🪪 Identity Verification:</strong> ${govIdType} (Verified)</p>
        </div>

        <p>Please present a digital copy or printout of this confirmation along with your physical ID upon entering the venue.</p>
        <p style="margin-bottom: 0;">Warm regards,<br><strong>PESO Guagua Event Operations Team</strong></p>
    `;

    return sendStatusEmail(toEmail, subject, rawBodyContent);
}

module.exports = { 
    sendStatusEmail,
    sendEventConfirmationEmail
};