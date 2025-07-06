const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// JWT secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const authController = {
    // Register new user
    register: async (req, res) => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { email, password, firstName, lastName, role, phoneNumber } = req.body;

            // Create new user in database
            const newUser = await User.create({
                email,
                password,
                firstName,
                lastName,
                role: role || 'patient',
                phoneNumber
            });

            // Generate JWT token
            const token = jwt.sign(
                { 
                    userId: newUser.id, 
                    email: newUser.email, 
                    role: newUser.role 
                },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            // Remove password from response
            const userResponse = { ...newUser.toJSON() };

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: userResponse,
                    token
                }
            });

        } catch (error) {
            console.error('Registration error:', error);
            
            // Handle specific errors
            if (error.message === 'User with this email already exists') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            
            res.status(500).json({
                success: false,
                message: 'Internal server error during registration'
            });
        }
    },

    // Login user
    login: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { email, password } = req.body;

            // Find user in database
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Check if user is active
            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Account is deactivated. Please contact support.'
                });
            }

            // Check password
            const isPasswordValid = await user.verifyPassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Update last login
            await user.updateLastLogin();

            // Generate JWT token
            const token = jwt.sign(
                { 
                    userId: user.id, 
                    email: user.email, 
                    role: user.role 
                },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            // Remove password from response
            const userResponse = { ...user.toJSON() };

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: userResponse,
                    token
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during login'
            });
        }
    },

    // Logout user
    logout: (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    },

    // Verify token
    verifyToken: async (req, res) => {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded.userId);

            if (!user || !user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found or inactive'
                });
            }

            const userResponse = { ...user.toJSON() };

            res.status(200).json({
                success: true,
                user: userResponse
            });

        } catch (error) {
            res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    },

    // Get user profile
    getProfile: async (req, res) => {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded.userId);

            if (!user || !user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found or inactive'
                });
            }

            const userResponse = { ...user.toJSON() };

            res.status(200).json({
                success: true,
                data: userResponse
            });

        } catch (error) {
            res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    },

    // Refresh token
    refreshToken: async (req, res) => {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded.userId);

            if (!user || !user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found or inactive'
                });
            }

            const newToken = jwt.sign(
                { 
                    userId: decoded.userId, 
                    email: decoded.email, 
                    role: decoded.role 
                },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            res.status(200).json({
                success: true,
                token: newToken
            });

        } catch (error) {
            res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    },

    // Forgot password (placeholder)
    forgotPassword: (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Password reset instructions sent to email'
        });
    },

    // Reset password (placeholder)
    resetPassword: (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });
    }
};

module.exports = authController;
