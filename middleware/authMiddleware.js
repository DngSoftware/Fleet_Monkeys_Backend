const jwt = require('jsonwebtoken');
const User = require('../models/authModel');

// Hardcoded JWT secret (not recommended for production)
const JWT_SECRET = '8d9f7e2b4c5a1d3f9e7b2a4c8d5e1f3g9h2j4k6m8n1p3q5r7t9v';

module.exports = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      message: 'Authorization header missing or invalid',
      solution: 'Include Authorization header with format: Bearer <token>'
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ 
      message: 'Token missing from Authorization header',
      solution: 'Ensure token follows Bearer scheme: Bearer <token>'
    });
  }

  try {
    // Check if token is blacklisted
    const isBlacklisted = await User.isTokenBlacklisted(token);
    console.log('Checking if token is blacklisted:', token);
    console.log('Is token blacklisted?', isBlacklisted);
    if (isBlacklisted) {
      return res.status(401).json({ 
        message: 'Token has been invalidated (logged out)',
        solution: 'Please log in again to obtain a new token'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fetch the role name using the RoleID from the token
    const role = await User.getRoleById(decoded.role);
    if (!role) {
      return res.status(401).json({
        message: 'Role not found for the user',
        solution: 'Ensure the user’s role exists in the database'
      });
    }

    req.user = { 
      personId: decoded.personId, 
      roleId: decoded.role,
      role: role.RoleName
    };
    
    next();
  } catch (err) {
    return res.status(401).json({ 
      message: 'Invalid or expired token',
      error: err.message 
    });
  }
};