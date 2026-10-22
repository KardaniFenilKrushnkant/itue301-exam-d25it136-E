const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'driveeasy_super_secret_jwt_key_2026';

/**
 * authGuard Middleware
 * Validates the Bearer token in the Authorization header.
 * Returns 401 if missing or invalid.
 */
const authGuard = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No Bearer token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.customer = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
      error: err.message
    });
  }
};

module.exports = authGuard;
