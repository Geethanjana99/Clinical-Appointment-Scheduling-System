const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validation');

// Register endpoint
router.post('/register', validateRegistration, authController.register);

// Login endpoint
router.post('/login', validateLogin, authController.login);

// Logout endpoint
router.post('/logout', authController.logout);

// Verify token endpoint
router.get('/verify', authController.verifyToken);

// Get user profile endpoint
router.get('/profile', authController.getProfile);

// Refresh token endpoint
router.post('/refresh', authController.refreshToken);

// Password reset endpoints
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
