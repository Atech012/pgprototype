const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Fixed path to match your config structure

// 1. Fetch all email templates (Admin Protected)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM email_templates ORDER BY id ASC');
        res.json({ status: 'success', templates: result.rows });
    } catch (err) {
        console.error('Failed to fetch email templates:', err);
        res.status(500).json({ status: 'error', message: 'Failed to load email templates.' });
    }
});

// 2. Update a specific email template by status_key (Admin Protected)
router.put('/:status_key', async (req, res) => {
    const { status_key } = req.params;
    const { subject, body_content, template_name } = req.body;

    try {
        const query = `
            UPDATE email_templates 
            SET subject = $1, body_content = $2, template_name = $3, updated_at = CURRENT_TIMESTAMP
            WHERE status_key = $4
            RETURNING *;
        `;
        const values = [subject, body_content, template_name, status_key];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Template not found.' });
        }

        res.json({ 
            status: 'success', 
            message: 'Email template successfully updated!', 
            template: result.rows[0] 
        });
    } catch (err) {
        console.error('Failed to update email template:', err);
        res.status(500).json({ status: 'error', message: 'Failed to update email template.' });
    }
});

module.exports = router;