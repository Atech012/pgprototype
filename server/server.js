const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Enable CORS for frontend requests
// Allow both your local environment and your live Vercel frontend
app.use(cors({
    origin: ['http://localhost:3000', 'https://pesoprototype.vercel.app'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files (resumes and company forms)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/events', require('./routes/events'));
app.use('/api/email-templates', require('./routes/emailTemplates')); // <-- Moved up here!

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running live on port ${PORT}`);
    
});