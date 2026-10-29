const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { sendStatusEmail } = require('../utils/emailService');

// GET template preview for status change modal
router.get('/email-template/:statusKey', verifyToken, async (req, res) => {
    const { statusKey } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM email_templates WHERE status_key = $1',
            [statusKey]
        );
        if (result.rows.length > 0) {
            res.json({ status: 'success', template: result.rows[0] });
        } else {
            res.status(404).json({ status: 'error', message: 'Template not found' });
        }
    } catch (err) {
        console.error('Error fetching template for modal:', err.message);
        res.status(500).json({ status: 'error', message: 'Database query error.' });
    }
});

// Submit job application with requirement banner files
router.post('/apply', upload.any(), async (req, res) => {
    const { job_id, first_name, middle_name, last_name, email, phone, address, cover_letter } = req.body;

    if (!job_id || !first_name || !last_name || !email || !phone || !address) {
        return res.status(400).json({ status: 'error', message: 'Please fill in all required applicant fields.' });
    }

    try {
        let applicantResult = await pool.query('SELECT id FROM applicants WHERE email = $1', [email]);
        let applicantId;

        if (applicantResult.rows.length > 0) {
            applicantId = applicantResult.rows[0].id;
            await pool.query(
                `UPDATE applicants SET first_name = $1, middle_name = $2, last_name = $3, phone = $4, address = $5, cover_letter = $6 WHERE id = $7`,
                [first_name, middle_name, last_name, phone, address, cover_letter, applicantId]
            );
        } else {
            const newApplicant = await pool.query(
                `INSERT INTO applicants (first_name, middle_name, last_name, email, phone, address, cover_letter) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
                [first_name, middle_name, last_name, email, phone, address, cover_letter]
            );
            applicantId = newApplicant.rows[0].id;
        }

        const appResult = await pool.query(
            `INSERT INTO job_applications (job_id, applicant_id, status, cover_letter) 
             VALUES ($1, $2, 'Pending', $3) RETURNING id`,
            [job_id, applicantId, cover_letter]
        );
        const applicationId = appResult.rows[0].id;

        if (req.files && req.files.length > 0) {
            for (let file of req.files) {
                if (file.fieldname.startsWith('req_file_')) {
                    const reqTitle = file.fieldname.replace('req_file_', '').replace(/_/g, ' ');
                    const filePath = `/uploads/${file.filename}`;
                    await pool.query(
                        `INSERT INTO applicant_documents (application_id, requirement_title, file_path) VALUES ($1, $2, $3)`,
                        [applicationId, reqTitle, filePath]
                    );
                }
            }
        }

        // Fetch job title for template variable replacement
        const jobRes = await pool.query('SELECT title FROM job_postings WHERE id = $1', [job_id]);
        const jobTitle = jobRes.rows.length > 0 ? jobRes.rows[0].title : 'Position';

        // Fetch 'Pending' email template from DB
        const templateRes = await pool.query('SELECT * FROM email_templates WHERE status_key = $1', ['Pending']);
        
        let subject = `PESO Guagua: Application Received - Pending Review`;
        let message = `Dear ${first_name},\n\nYour job application has been successfully submitted and is confirmed to be in our Pending list. Please wait for further notice from our office or the hiring partner company.\n\nThank you,\nPESO Guagua Team`;

        if (templateRes.rows.length > 0) {
            subject = templateRes.rows[0].subject.replace(/{{position_title}}/g, jobTitle);
            message = templateRes.rows[0].body_content
                .replace(/{{applicant_name}}/g, first_name)
                .replace(/{{position_title}}/g, jobTitle);
        }

        await sendStatusEmail(email, subject, message);

        res.status(201).json({ status: 'success', message: 'Application submitted successfully!' });
    } catch (err) {
        console.error('Error submitting application:', err.message);
        res.status(500).json({ status: 'error', message: 'Server error during application submission.' });
    }
});

// Fetch all applications with category filtering
router.get('/all', verifyToken, async (req, res) => {
    const { category } = req.query;
    try {
        let query = `
            SELECT ja.id AS application_id, ja.status, ja.applied_at, 
                   a.first_name, a.middle_name, a.last_name, a.email, a.phone, a.address, a.cover_letter,
                   jp.title AS job_title, jp.company_name, jp.id AS job_id
            FROM job_applications ja
            JOIN applicants a ON ja.applicant_id = a.id
            JOIN job_postings jp ON ja.job_id = jp.id
        `;
        
        if (category === 'Municipal') {
            query += ` WHERE LOWER(jp.company_name) LIKE '%municipal%' OR LOWER(jp.company_name) LIKE '%guagua%'`;
        } else if (category === 'Private') {
            query += ` WHERE LOWER(jp.company_name) NOT LIKE '%municipal%' AND LOWER(jp.company_name) NOT LIKE '%guagua%'`;
        }
        query += ` ORDER BY ja.applied_at DESC`;

        const result = await pool.query(query);
        const applications = result.rows;

        for (let app of applications) {
            const docsRes = await pool.query('SELECT requirement_title, file_path FROM applicant_documents WHERE application_id = $1', [app.application_id]);
            app.uploaded_requirements = docsRes.rows;
        }

        res.json({ status: 'success', applications });
    } catch (err) {
        console.error('Error fetching applications:', err.message);
        res.status(500).json({ status: 'error', message: 'Failed to retrieve applications.' });
    }
});

// Update application status and send customized notification email
router.patch('/:id/status', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { status, emailMessage, emailSubject } = req.body;
    try {
        // Update status in DB
        await pool.query('UPDATE job_applications SET status = $1 WHERE id = $2', [status, id]);

        // Fetch applicant email and name
        const appRes = await pool.query(
            `SELECT a.email, a.first_name, jp.title AS job_title FROM job_applications ja JOIN applicants a ON ja.applicant_id = a.id JOIN job_postings jp ON ja.job_id = jp.id WHERE ja.id = $1`,
            [id]
        );

        if (appRes.rows.length > 0) {
            const { email, first_name, job_title } = appRes.rows[0];

            let subject = emailSubject;
            let message = emailMessage;

            // If subject or message were not manually overridden in modal, pull template from database
            if (!subject || !message) {
                const templateRes = await pool.query('SELECT * FROM email_templates WHERE status_key = $1', [status]);
                if (templateRes.rows.length > 0) {
                    subject = templateRes.rows[0].subject.replace(/{{position_title}}/g, job_title);
                    message = templateRes.rows[0].body_content
                        .replace(/{{applicant_name}}/g, first_name)
                        .replace(/{{position_title}}/g, job_title);
                } else {
                    subject = `PESO Guagua: Application Update for ${job_title}`;
                    message = `Dear ${first_name},\n\nYour application status has been updated to: ${status}.`;
                }
            }
            
            await sendStatusEmail(email, subject, message);
        }

        res.json({ status: 'success', message: 'Status updated and notification email sent successfully.' });
    } catch (err) {
        console.error('Error updating status and sending email:', err.message);
        res.status(500).json({ status: 'error', message: 'Failed to update status.' });
    }
});

module.exports = router;