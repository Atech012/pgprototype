const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

if (!process.env.DATABASE_URL) {
    console.error('❌ CRITICAL: DATABASE_URL environment variable is missing!');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Supabase requires SSL
    }
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL Database successfully');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected database error on idle client', err);
    process.exit(-1);
});

module.exports = pool;