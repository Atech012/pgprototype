const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all active job postings with their associated requirement files (Public)
router.get('/', async (req, res) => {
    try {
        const jobsResult = await pool.query('SELECT * FROM job_postings ORDER BY created_at DESC');
        const jobs = jobsResult.rows;

        for (let job of jobs) {
            const reqsResult = await pool.query('SELECT title, file_path FROM job_requirements WHERE job_id = $1', [job.id]);
            job.requirements_files = reqsResult.rows;
        }

        res.json({ status: 'success', count: jobs.length, jobs });
    } catch (err) {
        console.error('Error fetching jobs:', err.message);
        res.status(500).json({ status: 'error', message: 'Failed to retrieve jobs.' });
    }
});

// Post a new job vacancy with multiple requirement documents & title banners (Staff/Admin Protected)
router.post('/', verifyToken, upload.array('requirement_files'), async (req, res) => {
    const { title, company_name, location, job_type, salary_range, description, requirements, requirement_titles } = req.body;

    if (!title || !company_name || !location || !description) {
        return res.status(400).json({ status: 'error', message: 'Please provide all required job fields.' });
    }

    try {
        const newJob = await pool.query(
            `INSERT INTO job_postings (title, company_name, location, job_type, salary_range, description, requirements) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [title, company_name, location, job_type, salary_range, description, requirements]
        );

        const jobId = newJob.rows[0].id;

        if (req.files && req.files.length > 0) {
            let titles = [];
            if (requirement_titles) {
                titles = Array.isArray(requirement_titles) ? requirement_titles : [requirement_titles];
            }

            for (let i = 0; i < req.files.length; i++) {
                const fileTitle = titles[i] || `Required Document ${i + 1}`;
                const filePath = `/uploads/${req.files[i].filename}`;
                await pool.query(
                    `INSERT INTO job_requirements (job_id, title, file_path) VALUES ($1, $2, $3)`,
                    [jobId, fileTitle, filePath]
                );
            }
        }

        res.status(201).json({
            status: 'success',
            message: 'Job vacancy and document banners posted successfully!',
            job: newJob.rows[0]
        });
    } catch (err) {
        console.error('Error creating job:', err.message);
        res.status(500).json({ status: 'error', message: 'Failed to create job posting.' });
    }
});

module.exports = router;