const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const multer = require('multer');
const path = require('path');
const { sendStatusEmail } = require('../utils/emailService');

// Configure Multer for Government ID uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'govid-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// ==========================================
// PUBLIC ROUTES
// ==========================================

// 1. Get Active Events (with optional category & search filters)
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = 'SELECT * FROM peso_events WHERE is_active = TRUE';
        const params = [];

        if (category && category !== 'All') {
            params.push(category);
            query += ` AND category = $${params.length}`;
        }

        if (search) {
            params.push(`%${search}%`);
            query += ` AND (title ILIKE $${params.length} OR location ILIKE $${params.length})`;
        }

        query += ' ORDER BY event_date ASC';

        const result = await pool.query(query, params);
        res.json({ status: 'success', events: result.rows });
    } catch (err) {
        console.error('Error fetching events:', err.message);
        res.status(500).json({ status: 'error', message: 'Failed to fetch events' });
    }
});

// 2. Public Citizen Pre-Registration Form
router.post('/:id/register', upload.single('gov_id'), async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, email, phone, gov_id_type } = req.body;
        const gov_id_path = req.file ? req.file.filename : null;

        if (!full_name || !email || !phone || !gov_id_path) {
            return res.status(400).json({ status: 'error', message: 'All registration fields and Government ID are required.' });
        }

        const insertQuery = `
            INSERT INTO event_registrations (event_id, full_name, email, phone, gov_id_type, gov_id_path, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'Pending Verification')
            RETURNING *;
        `;
        const result = await pool.query(insertQuery, [id, full_name, email, phone, gov_id_type, gov_id_path]);

        res.json({ status: 'success', registration: result.rows[0] });
    } catch (err) {
        console.error('Error registering for event:', err.message);
        res.status(500).json({ status: 'error', message: 'Failed to complete pre-registration' });
    }
});

// ==========================================
// ADMIN GUI CRUD & ATTENDANCE ROUTES
// ==========================================

// 3. Admin: Fetch All Events (Active & Inactive)
router.get('/admin/all', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM peso_events ORDER BY created_at DESC');
        res.json({ status: 'success', events: result.rows });
    } catch (err) {
        console.error('Error fetching all events for admin:', err.message);
        res.status(500).json({ status: 'error', message: 'Failed to fetch events' });
    }
});

// 4. Admin: Create New Event
router.post('/admin/create', async (req, res) => {
    try {
        const { title, category, event_date, location, description, max_attendees, speakers, guest_of_honor, benefits } = req.body;

        const insertQuery = `
            INSERT INTO peso_events (title, category, event_date, location, description, max_attendees, speakers, guest_of_honor, benefits, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE)
            RETURNING *;
        `;
        const values = [title, category, event_date, location, description, max_attendees || 100, speakers, guest_of_honor, benefits];
        const result = await pool.query(insertQuery, values);

        res.json({ status: 'success', event: result.rows[0] });
    } catch (err) {
        console.error('Error creating event:', err.message);
        res.status(500).json({ status: 'error', message: 'Failed to create event' });
    }
});

// 5. Admin: Update Existing Event
router.put('/admin/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, event_date, location, description, max_attendees, speakers, guest_of_honor, benefits, is_active } = req.body;

        const updateQuery = `
            UPDATE peso_events
            SET title = $1, category = $2, event_date = $3, location = $4, description = $5,
                max_attendees = $6, speakers = $7, guest_of_honor = $8, benefits = $9, is_active = $10
            WHERE id = $11
            RETURNING *;
        `;
        const values = [title, category, event_date, location, description, max_attendees, speakers, guest_of_honor, benefits, is_active, id];
        const result = await pool.query(updateQuery, values);

        res.json({ status: 'success', event: result.rows[0] });
    } catch (err) {
        console.error('Error updating event:', err.message);
        res.status(500).json({ status: 'error', message: 'Failed to update event' });
    }
});

// 6. Admin: Delete Event
router.delete('/admin/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM peso_events WHERE id = $1', [id]);
        res.json({ status: 'success', message: 'Event deleted successfully' });
    } catch (err) {
        console.error('Error deleting event:', err.message);
        res.status(500).json({ status: 'error', message: 'Failed to delete event' });
    }
});

// 7. Admin: Get Event Registrations & Attendee List
router.get('/admin/registrations', async (req, res) => {
    try {
        const query = `
            SELECT er.*, pe.title AS event_title, pe.event_date 
            FROM event_registrations er
            JOIN peso_events pe ON er.event_id = pe.id
            ORDER BY er.registered_at DESC;
        `;
        const result = await pool.query(query);
        res.json({ status: 'success', registrations: result.rows });
    } catch (err) {
        console.error('Error fetching event registrations:', err.message);
        res.status(500).json({ status: 'error', message: 'Failed to fetch registrations' });
    }
});

// 8. Admin: Update Attendee Status with Template Customization & Audit Trail (Non-Repudiation)
router.patch('/admin/registrations/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, subject, body_content, admin_user } = req.body;

        // 1. Update status in database and record audit verifier (`verified_by`) for non-repudiation
        const updateQuery = `
            UPDATE event_registrations er
            SET status = $1, verified_by = $2, updated_at = CURRENT_TIMESTAMP
            FROM peso_events pe
            WHERE er.id = $3 AND er.event_id = pe.id
            RETURNING er.*, pe.title AS event_title, pe.event_date, pe.location;
        `;
        const result = await pool.query(updateQuery, [status, admin_user || 'Admin Staff', id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Registration not found' });
        }

        const registration = result.rows[0];

        // 2. Send customizable professional email notice when status is finalized
        if (status === 'Confirmed Attendance' || status === 'Rejected') {
            try {
                const emailSubject = subject || `PESO Guagua: Status Update - ${registration.event_title}`;
                const emailBody = body_content || `Dear ${registration.full_name},\n\nYour registration status for "${registration.event_title}" has been updated to: ${status}.`;

                await sendStatusEmail(registration.email, emailSubject, emailBody);
                console.log(`🛡️ Audit Trail [Non-Repudiation]: Status '${status}' for Registration ID ${id} verified and processed by [${admin_user || 'Admin Staff'}]`);
            } catch (emailErr) {
                console.error('Failed to send automated confirmation email:', emailErr.message);
            }
        }

        res.json({ status: 'success', registration });
    } catch (err) {
        console.error('Error updating registration status:', err.message);
        res.status(500).json({ status: 'error', message: 'Failed to update attendee status' });
    }
});

module.exports = router;