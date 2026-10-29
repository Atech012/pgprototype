const API_URL = 'http://localhost:5000/api';

// Fetch all active job listings (Public)
export async function fetchJobs() {
    try {
        const res = await fetch(`${API_URL}/jobs`);
        const data = await res.json();
        return data.jobs || [];
    } catch (err) {
        console.error('Failed to fetch jobs:', err);
        return [];
    }
}

// Post a new job vacancy with requirement file (Staff/Admin Protected)
export async function createJob(formData, token) {
    try {
        const res = await fetch(`${API_URL}/jobs`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        return await res.json();
    } catch (err) {
        console.error('Failed to create job posting:', err);
        return { status: 'error', message: 'Failed to post job vacancy.' };
    }
}

// Submit job application with resume file upload (Public)
export async function submitApplication(formData) {
    try {
        const res = await fetch(`${API_URL}/applications/apply`, {
            method: 'POST',
            body: formData,
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Failed to submit application:', err);
        return { status: 'error', message: 'Network error occurred.' };
    }
}

// Staff Login (Protected Access)
export async function staffLogin(username, password) {
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Login error:', err);
        return { status: 'error', message: 'Failed to connect to authentication server.' };
    }
}

// Fetch applications for a specific job (Staff/Admin Protected)
export async function fetchJobApplications(jobId, token) {
    try {
        const res = await fetch(`${API_URL}/applications/job/${jobId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        return data.applications || [];
    } catch (err) {
        console.error('Failed to fetch applications:', err);
        return [];
    }
}

// Update application status with custom email templates (Staff/Admin Protected)
export async function updateApplicationStatus(appId, status, token, emailSubject = '', emailMessage = '') {
    try {
        const res = await fetch(`${API_URL}/applications/${appId}/status`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ status, emailSubject, emailMessage })
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Failed to update status:', err);
        return { status: 'error', message: 'Failed to update status.' };
    }
}

// Fetch all applications with category filtering (Staff/Admin Protected)
export async function fetchAllApplications(category, token) {
    try {
        const res = await fetch(`${API_URL}/applications/all?category=${category}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        return data.applications || [];
    } catch (err) {
        console.error('Failed to fetch applications:', err);
        return [];
    }
}