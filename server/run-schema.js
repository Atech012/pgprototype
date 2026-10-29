const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function runSchema() {
    try {
        console.log('⏳ Connecting to PostgreSQL and executing full PESO Portal schema migration...');

        await pool.query(`
            -- ==========================================
            -- 1. BASE ATS & STAFF TABLES
            -- ==========================================
            CREATE TABLE IF NOT EXISTS staff_users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(150) NOT NULL,
                role VARCHAR(50) DEFAULT 'staff',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS applicants (
                id SERIAL PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                middle_name VARCHAR(100),
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                phone VARCHAR(50) NOT NULL,
                birthdate DATE,
                address TEXT,
                gender VARCHAR(20),
                civil_status VARCHAR(30),
                cover_letter TEXT,
                resume_path VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS job_postings (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                company_name VARCHAR(255) NOT NULL,
                location VARCHAR(255) NOT NULL,
                job_type VARCHAR(50) NOT NULL,
                salary_range VARCHAR(100),
                description TEXT NOT NULL,
                requirements TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS job_requirements (
                id SERIAL PRIMARY KEY,
                job_id INT REFERENCES job_postings(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                file_path VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS job_applications (
                id SERIAL PRIMARY KEY,
                job_id INT REFERENCES job_postings(id) ON DELETE CASCADE,
                applicant_id INT REFERENCES applicants(id) ON DELETE CASCADE,
                status VARCHAR(50) DEFAULT 'Pending',
                verified_by VARCHAR(100),
                cover_letter TEXT,
                resume_path VARCHAR(255),
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Safe rebuild of applicant_documents
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'applicant_documents' AND column_name = 'applicant_id'
                ) THEN
                    DROP TABLE applicant_documents CASCADE;
                END IF;
            END $$;

            CREATE TABLE IF NOT EXISTS applicant_documents (
                id SERIAL PRIMARY KEY,
                application_id INT REFERENCES job_applications(id) ON DELETE CASCADE,
                requirement_title VARCHAR(255) NOT NULL,
                file_path VARCHAR(255) NOT NULL,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS applicant_work_history (
                id SERIAL PRIMARY KEY,
                applicant_id INT REFERENCES applicants(id) ON DELETE CASCADE,
                job_title VARCHAR(150) NOT NULL,
                company VARCHAR(150) NOT NULL,
                start_date DATE,
                end_date DATE,
                description TEXT
            );

            CREATE TABLE IF NOT EXISTS applicant_skills (
                id SERIAL PRIMARY KEY,
                applicant_id INT REFERENCES applicants(id) ON DELETE CASCADE,
                skill_name VARCHAR(100) NOT NULL,
                proficiency_level VARCHAR(50)
            );

            -- ==========================================
            -- 2. PORTAL EXPANSION TABLES (Programs, Events, Media)
            -- ==========================================
            CREATE TABLE IF NOT EXISTS peso_programs (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                description TEXT NOT NULL,
                eligibility_criteria TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS program_documents (
                id SERIAL PRIMARY KEY,
                program_id INT REFERENCES peso_programs(id) ON DELETE CASCADE,
                document_title VARCHAR(255) NOT NULL,
                file_path VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS peso_events (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                category VARCHAR(100) DEFAULT 'Municipal Activity',
                event_date TIMESTAMP NOT NULL,
                location VARCHAR(255) NOT NULL,
                description TEXT,
                max_attendees INT DEFAULT 100,
                speakers TEXT,
                guest_of_honor TEXT,
                benefits TEXT,
                banner_image_path VARCHAR(255),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS event_registrations (
                id SERIAL PRIMARY KEY,
                event_id INT REFERENCES peso_events(id) ON DELETE CASCADE,
                applicant_id INT REFERENCES applicants(id) ON DELETE CASCADE,
                full_name VARCHAR(150),
                email VARCHAR(150),
                phone VARCHAR(50),
                gov_id_type VARCHAR(100),
                gov_id_path VARCHAR(255),
                status VARCHAR(50) DEFAULT 'Pending Verification',
                verified_by VARCHAR(100),
                registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS peso_announcements (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                category VARCHAR(50) DEFAULT 'General',
                image_path VARCHAR(255),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- ==========================================
            -- 3. EMAIL TEMPLATES & SEEDING
            -- ==========================================
            CREATE TABLE IF NOT EXISTS email_templates (
                id SERIAL PRIMARY KEY,
                status_key VARCHAR(50) UNIQUE NOT NULL, 
                template_name VARCHAR(100) NOT NULL,
                subject VARCHAR(255) NOT NULL,
                body_content TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            INSERT INTO email_templates (status_key, template_name, subject, body_content) VALUES
            ('Pending', 'Pending Application Notification', 'PESO Guagua: Application Received - Pending List', '
<p>Dear <strong>{{applicant_name}}</strong>,</p>
<p>Your job application for <strong>{{position_title}}</strong> has been successfully received and is confirmed to be in our Pending review queue.</p>
<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin: 20px 0;">
    <p style="margin: 0 0 10px; font-weight: bold; color: #0B1F3B; font-size: 13px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Application Summary</p>
    <table style="width: 100%; font-size: 13px; color: #475569; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; font-weight: bold; width: 30%;">Position:</td><td style="padding: 6px 0; color: #1e293b;">{{position_title}}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold;">Current Status:</td><td style="padding: 6px 0; color: #d97706; font-weight: bold;">Pending Review</td></tr>
    </table>
</div>
<p>Please wait for further notice from our office or the hiring partner company regarding the status of your documents.</p>
<p style="margin-top: 30px; font-size: 13px; color: #64748b;">Thank you,<br><strong>PESO Guagua Team</strong></p>'),

            ('Reviewing', 'Application Under Review Notification', 'PESO Guagua: Application Under Review', '
<p>Dear <strong>{{applicant_name}}</strong>,</p>
<p>Good news! Your application for <strong>{{position_title}}</strong> is currently undergoing formal review by our screening committee.</p>
<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin: 20px 0;">
    <p style="margin: 0 0 10px; font-weight: bold; color: #0B1F3B; font-size: 13px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Application Summary</p>
    <table style="width: 100%; font-size: 13px; color: #475569; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; font-weight: bold; width: 30%;">Position:</td><td style="padding: 6px 0; color: #1e293b;">{{position_title}}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold;">Current Status:</td><td style="padding: 6px 0; color: #2563eb; font-weight: bold;">Under Review</td></tr>
    </table>
</div>
<p>We will notify you soon regarding subsequent evaluation steps or interview schedules.</p>
<p style="margin-top: 30px; font-size: 13px; color: #64748b;">Thank you,<br><strong>PESO Guagua Team</strong></p>'),

            ('Scheduled Interview', 'Interview Invitation Notification', 'PESO Guagua: Interview Invitation - {{position_title}}', '
<p>Dear <strong>{{applicant_name}}</strong>,</p>
<p>Congratulations! You have been scheduled for an interview for the position of <strong>{{position_title}}</strong>.</p>
<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin: 20px 0;">
    <p style="margin: 0 0 10px; font-weight: bold; color: #0B1F3B; font-size: 13px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Interview Appointment Details</p>
    <table style="width: 100%; font-size: 13px; color: #475569; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; font-weight: bold; width: 30%;">Position:</td><td style="padding: 6px 0; color: #1e293b;">{{position_title}}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold;">Status:</td><td style="padding: 6px 0; color: #7c3aed; font-weight: bold;">Scheduled Interview</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold; vertical-align: top;">Details:</td><td style="padding: 6px 0; color: #1e293b;">- <strong>What:</strong> Job Interview & Assessment<br>- <strong>When:</strong> [Insert Date and Time here]<br>- <strong>Where:</strong> PESO Office, Municipal Hall of Guagua</td></tr>
    </table>
</div>
<p>Please confirm your attendance by replying to this notice. Bring your valid identification cards and supporting credentials.</p>
<p style="margin-top: 30px; font-size: 13px; color: #64748b;">Best regards,<br><strong>PESO Guagua Team</strong></p>'),

            ('Hired', 'Job Offer / Hired Notification', 'PESO Guagua: Congratulations! Job Offer Extended', '
<p>Dear <strong>{{applicant_name}}</strong>,</p>
<p>Congratulations! We are thrilled to inform you that you have been selected and hired for the position of <strong>{{position_title}}</strong>. Welcome aboard!</p>
<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin: 20px 0;">
    <p style="margin: 0 0 10px; font-weight: bold; color: #0B1F3B; font-size: 13px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Employment Offer Details</p>
    <table style="width: 100%; font-size: 13px; color: #475569; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; font-weight: bold; width: 30%;">Position:</td><td style="padding: 6px 0; color: #1e293b;">{{position_title}}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold;">Status:</td><td style="padding: 6px 0; color: #059669; font-weight: bold;">Hired / Offer Extended</td></tr>
    </table>
</div>
<p>Please stand by for instructions regarding your onboarding requirements and orientation schedule.</p>
<p style="margin-top: 30px; font-size: 13px; color: #64748b;">Warm regards,<br><strong>PESO Guagua Team</strong></p>'),

            ('Rejected', 'Application Status Update Notification', 'PESO Guagua: Application Status Update', '
<p>Dear <strong>{{applicant_name}}</strong>,</p>
<p>Thank you for your interest in the <strong>{{position_title}}</strong> position at PESO Guagua.</p>
<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin: 20px 0;">
    <p style="margin: 0 0 10px; font-weight: bold; color: #0B1F3B; font-size: 13px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Application Summary</p>
    <table style="width: 100%; font-size: 13px; color: #475569; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; font-weight: bold; width: 30%;">Position:</td><td style="padding: 6px 0; color: #1e293b;">{{position_title}}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold;">Status:</td><td style="padding: 6px 0; color: #dc2626; font-weight: bold;">Closed / Not Moving Forward</td></tr>
    </table>
</div>
<p>After careful review of qualifications across applicants, we regret to inform you that we will not be moving forward with your application at this time.</p>
<p style="margin-top: 30px; font-size: 13px; color: #64748b;">Sincerely,<br><strong>PESO Guagua Team</strong></p>'),

            ('Event Confirmed', 'Event Attendance Confirmed', 'PESO Guagua: Attendance Confirmed - {{event_title}}', '
<p>Dear <strong>{{applicant_name}}</strong>,</p>
<p>Your attendance for <strong>"{{event_title}}"</strong> has been officially VERIFIED & CONFIRMED.</p>
<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin: 20px 0;">
    <p style="margin: 0 0 10px; font-weight: bold; color: #0B1F3B; font-size: 13px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Event Pass Details</p>
    <table style="width: 100%; font-size: 13px; color: #475569; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; font-weight: bold; width: 30%;">Schedule:</td><td style="padding: 6px 0; color: #1e293b;">{{event_date}}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold;">Venue:</td><td style="padding: 6px 0; color: #1e293b;">{{event_location}}</td></tr>
    </table>
</div>
<p>Please present this notification and your valid ID upon entry.</p>
<p style="margin-top: 30px; font-size: 13px; color: #64748b;">Best regards,<br><strong>PESO Guagua Team</strong></p>')
            ON CONFLICT (status_key) DO NOTHING;

            -- ==========================================
            -- 4. PERFORMANCE INDEXES & ALTER FALLBACKS
            -- ==========================================
            CREATE INDEX IF NOT EXISTS idx_job_applications_applicant ON job_applications(applicant_id);
            CREATE INDEX IF NOT EXISTS idx_job_applications_job ON job_applications(job_id);
            CREATE INDEX IF NOT EXISTS idx_applicants_email ON applicants(email);
            CREATE INDEX IF NOT EXISTS idx_job_requirements_job ON job_requirements(job_id);
            CREATE INDEX IF NOT EXISTS idx_applicant_documents_app ON applicant_documents(application_id);

            ALTER TABLE applicants ADD COLUMN IF NOT EXISTS cover_letter TEXT;
            ALTER TABLE applicants ADD COLUMN IF NOT EXISTS resume_path VARCHAR(255);
            ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS verified_by VARCHAR(100);
            ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS cover_letter TEXT;
            ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS resume_path VARCHAR(255);
            ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
            ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS verified_by VARCHAR(100);
            ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

            -- ==========================================
            -- 5. DEMO EVENTS SEEDING
            -- ==========================================
            INSERT INTO peso_events (title, category, event_date, location, description, max_attendees, is_active)
            SELECT 'Guagua Mayor’s Job Summit 2026', 'Job Summit', '2026-06-15 08:00:00', 'Guagua Municipal Gymnasium', 'Annual municipal job fair featuring over 40 local and overseas recruitment agencies offering thousands of vacancies.', 250, TRUE
            WHERE NOT EXISTS (SELECT 1 FROM peso_events WHERE title = 'Guagua Mayor’s Job Summit 2026');

            INSERT INTO peso_events (title, category, event_date, location, description, max_attendees, is_active)
            SELECT 'Barangay Employment & Livelihood Assembly', 'Barangay Assembly', '2026-06-22 09:00:00', 'Barangay Hall Covered Court, Plaza', 'Community orientation on local livelihood assistance, TUPAD programs, and skills training grants available for residents.', 100, TRUE
            WHERE NOT EXISTS (SELECT 1 FROM peso_events WHERE title = 'Barangay Employment & Livelihood Assembly');

            INSERT INTO peso_events (title, category, event_date, location, description, max_attendees, is_active)
            SELECT 'National Certificate II (NC II) Skills Training Orientation', 'Skills Training', '2026-07-05 13:00:00', 'PESO Training Center, Municipal Compound', 'Free technical-vocational scholarship briefing in partnership with TESDA for Guagua youth and displaced workers.', 75, TRUE
            WHERE NOT EXISTS (SELECT 1 FROM peso_events WHERE title = 'National Certificate II (NC II) Skills Training Orientation');
        `);

        console.log('✅ Full PESO Portal schema executed, synchronized, and demo events seeded successfully!');
    } catch (err) {
        console.error('❌ Error executing schema:', err.message);
    } finally {
        pool.end();
    }
}

runSchema();