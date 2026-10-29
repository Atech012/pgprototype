const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:atechprojects@localhost:5432/peso_guagua_portal',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL Database successfully');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected database error on idle client', err);
    process.exit(-1);
});

module.exports = pool;