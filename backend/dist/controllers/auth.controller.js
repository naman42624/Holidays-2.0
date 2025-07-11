"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.changePasswordValidation = exports.loginValidation = exports.registerValidation = exports.AuthController = void 0;
const express_validator_1 = require("express-validator");
const auth_service_1 = require("@/services/auth.service");
class AuthController {
    async register(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const response = {
                    success: false,
                    error: 'Validation failed',
                    message: errors.array().map(err => err.msg).join(', ')
                };
                res.status(400).json(response);
                return;
            }
            const { email, password, firstName, lastName } = req.body;
            const result = await auth_service_1.authService.register({
                email,
                password,
                firstName,
                lastName
            });
            const response = {
                success: true,
                data: {
                    user: result.user,
                    token: result.token
                },
                message: 'User registered successfully'
            };
            res.status(201).json(response);
        }
        catch (error) {
            console.error('Registration error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Registration failed'
            };
            res.status(400).json(response);
        }
    }
    async login(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const response = {
                    success: false,
                    error: 'Validation failed',
                    message: errors.array().map(err => err.msg).join(', ')
                };
                res.status(400).json(response);
                return;
            }
            const { email, password } = req.body;
            const result = await auth_service_1.authService.login({ email, password });
            const response = {
                success: true,
                data: {
                    user: result.user,
                    token: result.token
                },
                message: 'Login successful'
            };
            res.json(response);
        }
        catch (error) {
            console.error('Login error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Login failed'
            };
            res.status(401).json(response);
        }
    }
    async getProfile(req, res) {
        try {
            const userId = req.user.userId;
            const user = await auth_service_1.authService.getUserProfile(userId);
            const response = {
                success: true,
                data: { user },
                message: 'Profile retrieved successfully'
            };
            res.json(response);
        }
        catch (error) {
            console.error('Get profile error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get profile'
            };
            res.status(404).json(response);
        }
    }
    async updateProfile(req, res) {
        try {
            const userId = req.user.userId;
            const updates = req.body;
            const user = await auth_service_1.authService.updateProfile(userId, updates);
            const response = {
                success: true,
                data: { user },
                message: 'Profile updated successfully'
            };
            res.json(response);
        }
        catch (error) {
            console.error('Update profile error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update profile'
            };
            res.status(400).json(response);
        }
    }
    async changePassword(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const response = {
                    success: false,
                    error: 'Validation failed',
                    message: errors.array().map(err => err.msg).join(', ')
                };
                res.status(400).json(response);
                return;
            }
            const userId = req.user.userId;
            const { currentPassword, newPassword } = req.body;
            await auth_service_1.authService.changePassword(userId, {
                currentPassword,
                newPassword
            });
            const response = {
                success: true,
                message: 'Password changed successfully'
            };
            res.json(response);
        }
        catch (error) {
            console.error('Change password error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to change password'
            };
            res.status(400).json(response);
        }
    }
    async refreshToken(req, res) {
        try {
            const { token } = req.body;
            if (!token) {
                const response = {
                    success: false,
                    error: 'Token is required'
                };
                res.status(400).json(response);
                return;
            }
            const result = await auth_service_1.authService.refreshToken(token);
            const response = {
                success: true,
                data: {
                    user: result.user,
                    token: result.token
                },
                message: 'Token refreshed successfully'
            };
            res.json(response);
        }
        catch (error) {
            console.error('Refresh token error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to refresh token'
            };
            res.status(401).json(response);
        }
    }
    async logout(req, res) {
        const response = {
            success: true,
            message: 'Logout successful. Please remove the token from client storage.'
        };
        res.json(response);
    }
}
exports.AuthController = AuthController;
exports.registerValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    (0, express_validator_1.body)('firstName').trim().notEmpty().withMessage('First name is required'),
    (0, express_validator_1.body)('lastName').trim().notEmpty().withMessage('Last name is required')
];
exports.loginValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required')
];
exports.changePasswordValidation = [
    (0, express_validator_1.body)('currentPassword').notEmpty().withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
];
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map