const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getIsConnected } = require('../config/db');

// In-memory user store for demo mode
const mockUsers = [];

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'food_saga_super_secret');

      if (getIsConnected()) {
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        // Mock user lookup
        req.user = mockUsers.find(u => u.id === decoded.id) || decoded;
      }

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user ? req.user.role : 'guest'} is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize, mockUsers };
