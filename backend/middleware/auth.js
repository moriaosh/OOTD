// This middleware verifies the JWT token sent in the Authorization header.
const jwt = require('jsonwebtoken');

// Ensure JWT_SECRET is loaded from .env
const JWT_SECRET = process.env.JWT_SECRET; 

const verifyToken = (req, res, next) => {
    // 1. Check for token in headers
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization token is required.' });
    }

    // Expecting the format: Bearer <token>
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token format is invalid.' });
    }

    try {
        // 2. Verify the token using the secret key
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 3. Attach user data to the request object
        req.user = decoded; // Now we can access req.user.id in the controllers!
        
        next(); // Proceed to the next middleware/controller
    } catch (err) {
        // Token is invalid, expired, or corrupted
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

module.exports = {
    verifyToken,
};