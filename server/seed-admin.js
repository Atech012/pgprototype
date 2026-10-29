const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function seedAdmin() {
    try {
        const username = 'admin_guagua';
        const rawPassword = 'SecurePassword123!';
        const fullName = 'PESO Municipal Administrator';
        const role = 'admin';

        // Check if admin already exists
        const existing = await pool.query('SELECT id FROM staff_users WHERE username = $1', [username]);
        if (existing.rows.length > 0) {
            console.log('⚠️ Admin user already exists in the database.');
            process.exit(0);
        }

        // Hash password securely
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(rawPassword, salt);

        // Insert into database
        await pool.query(
            `INSERT INTO staff_users (username, password_hash, full_name, role) 
             VALUES ($1, $2, $3, $4)`,
            [username, passwordHash, fullName, role]
        );

        console.log('✅ Success! Admin account created.');
        console.log(`👤 Username: ${username}`);
        console.log(`🔑 Password: ${rawPassword}`);

    } catch (err) {
        console.error('❌ Error seeding admin user:', err.message);
    } finally {
        await pool.end();
    }
}

seedAdmin();