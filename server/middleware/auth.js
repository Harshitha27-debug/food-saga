const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getIsConnected } = require('../config/db');

// In-memory store for fallback/demo mode
const mockUsers = [];

const verifyFirebaseToken = async (idToken) => {
  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    const data = await response.json();
    if (data.error_description || data.error) {
      // Fallback: check if it is a local mock token (for demo logins)
      return null;
    }
    return {
      uid: data.sub,
      email: data.email,
      name: data.name || data.email.split('@')[0],
      picture: data.picture || ''
    };
  } catch (error) {
    console.error('Firebase Token Verification failed:', error.message);
    return null;
  }
};

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // 1. First, attempt to verify as a Firebase ID token
      const firebaseUser = await verifyFirebaseToken(token);

      if (firebaseUser) {
        if (getIsConnected()) {
          // Sync with MongoDB
          let dbUser = await User.findOne({ email: firebaseUser.email });
          if (!dbUser) {
            dbUser = await User.create({
              name: firebaseUser.name,
              email: firebaseUser.email,
              password: 'firebase_auth_sync_placeholder_pwd',
              profilePicture: firebaseUser.picture,
              role: firebaseUser.email.includes('admin') ? 'admin' : 'user',
              streak: 1,
              badges: ['Kitchen Novice', 'First Steps']
            });
          }
          req.user = dbUser;
        } else {
          // Demo fallback with in-memory store
          let mockUser = mockUsers.find(u => u.email === firebaseUser.email);
          if (!mockUser) {
            mockUser = {
              id: firebaseUser.uid,
              _id: firebaseUser.uid,
              name: firebaseUser.name,
              email: firebaseUser.email,
              role: firebaseUser.email.includes('admin') ? 'admin' : 'user',
              streak: 2,
              badges: ['Kitchen Novice', 'First Steps'],
              achievements: [{ title: 'Signed Up!', description: 'Welcome to Food Saga', unlockedAt: new Date() }]
            };
            mockUsers.push(mockUser);
          }
          req.user = mockUser;
        }
        return next();
      }

      // 2. If not a Firebase token, fallback to standard custom JWT verification (useful for local fast pass developer logins)
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'food_saga_super_secret');
      
      if (getIsConnected()) {
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        req.user = mockUsers.find(u => u.id === decoded.id) || decoded;
      }

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }

      next();
    } catch (error) {
      console.error('Authorization middleware error:', error.message);
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
