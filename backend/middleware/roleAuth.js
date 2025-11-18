const jwt = require('jsonwebtoken');

// Middleware to check if user has required role
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }
        
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            req.user = decoded;
            
            // Check if user has required role
            if (!decoded.role) {
                return res.status(403).json({ message: 'Forbidden: No role assigned' });
            }
            
            // Admin has access to everything
            if (decoded.role === 'admin') {
                return next();
            }
            
            // Check if user's role is in allowed roles
            if (!allowedRoles.includes(decoded.role)) {
                return res.status(403).json({ 
                    message: `Forbidden: Required role(s): ${allowedRoles.join(', ')}. Your role: ${decoded.role}` 
                });
            }
            
            next();
        } catch (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    };
};

// Middleware to check if user is authenticated (any role)
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = {
    requireRole,
    requireAuth
};




