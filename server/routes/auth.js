const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Staff Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ status: 'error', message: 'Please provide both username and password.' });
    }

    try {
        const staffResult = await pool.query('SELECT * FROM staff_users WHERE username = $1', [username]);
        
        if (staffResult.rows.length === 0) {
            return res.status(401).json({ status: 'error', message: 'Invalid username or password.' });
        }

        const staff = staffResult.rows[0];
        const isMatch = await bcrypt.compare(password, staff.password_hash);

        if (!isMatch) {
            return res.status(401).json({ status: 'error', message: 'Invalid username or password.' });
        }

        // Generate JWT Token valid for 8 hours
        const token = jwt.sign(
            { id: staff.id, username: staff.username, role: staff.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            status: 'success',
            message: 'Login successful',
            token,
            staff: {
                id: staff.id,
                username: staff.username,
                full_name: staff.full_name,
                role: staff.role
            }
        });

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ status: 'error', message: 'Internal server error during login.' });
    }
});

module.exports = router;