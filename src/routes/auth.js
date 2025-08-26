const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateLogin, validateRegister, redirectIfAuthenticated } = require('../middlewares/validators');
const { requireAuth } = require('../middlewares/auth');

// Show login page
router.get('/login', redirectIfAuthenticated, authController.showLogin);

// Handle login
router.post('/login', redirectIfAuthenticated, validateLogin, authController.login);

// Show register page
router.get('/register', redirectIfAuthenticated, authController.showRegister);

// Handle registration
router.post('/register', redirectIfAuthenticated, validateRegister, authController.register);

// Handle logout
router.post('/logout', requireAuth, authController.logout);

// Show profile page
router.get('/profile', requireAuth, authController.showProfile);

// Update profile
router.post('/profile', requireAuth, authController.updateProfile);

// Change password
router.post('/change-password', requireAuth, authController.changePassword);

module.exports = router;
