const User = require('../models/User');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    req.session.flash = {
      type: 'error',
      message: 'Please log in to access this page.'
    };
    return res.redirect('/auth/login');
  }
  next();
};

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  if (!req.session.userId) {
    req.session.flash = {
      type: 'error',
      message: 'Please log in to access this page.'
    };
    return res.redirect('/auth/login');
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user || user.role !== 'admin') {
      req.session.flash = {
        type: 'error',
        message: 'Access denied. Admin privileges required.'
      };
      return res.redirect('/');
    }
    req.user = user;
    next();
  } catch (error) {
    req.session.flash = {
      type: 'error',
      message: 'Authentication error. Please try again.'
    };
    return res.redirect('/auth/login');
  }
};

// Middleware to load user data for all routes
const loadUser = async (req, res, next) => {
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (user) {
        req.user = user;
        res.locals.user = user.toPublicJSON();
      } else {
        // User not found, clear session
        req.session.destroy();
      }
    } catch (error) {
      console.error('Error loading user:', error);
      req.session.destroy();
    }
  }
  next();
};

// Middleware to redirect authenticated users away from auth pages
const redirectIfAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return res.redirect('/');
  }
  next();
};

module.exports = {
  requireAuth,
  requireAdmin,
  loadUser,
  redirectIfAuthenticated,
};
