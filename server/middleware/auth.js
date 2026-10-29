const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Contains staff id, role, etc.
        next();
    } catch (err) {
        return res.status(403).json({ status: 'error', message: 'Invalid or expired token.' });
    }
}

function verifyAdmin(req, res, next) {
    verifyToken(req, res, () => {
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ status: 'error', message: 'Access denied. Admin privileges required.' });
        }
    });
}

module.exports = {
    verifyToken,
    verifyAdmin
};