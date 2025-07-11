"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
class UserController {
    async getAllUsers(req, res) {
        try {
            if (req.user?.role !== 'super-admin') {
                const response = {
                    success: false,
                    error: 'Access denied. Super admin privileges required.'
                };
                res.status(403).json(response);
                return;
            }
            const users = await User_1.default.find({})
                .select('-password')
                .sort({ createdAt: -1 });
            const response = {
                success: true,
                data: users,
                message: 'Users retrieved successfully'
            };
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Get users error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to retrieve users'
            };
            res.status(500).json(response);
        }
    }
    async getUserById(req, res) {
        try {
            const { id } = req.params;
            if (req.user?.role !== 'super-admin' && req.user?._id.toString() !== id) {
                const response = {
                    success: false,
                    error: 'Access denied. You can only view your own profile.'
                };
                res.status(403).json(response);
                return;
            }
            const user = await User_1.default.findById(id).select('-password');
            if (!user) {
                const response = {
                    success: false,
                    error: 'User not found'
                };
                res.status(404).json(response);
                return;
            }
            const response = {
                success: true,
                data: user,
                message: 'User retrieved successfully'
            };
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Get user error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to retrieve user'
            };
            res.status(500).json(response);
        }
    }
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;
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
            const isSuperAdmin = req.user?.role === 'super-admin';
            const isOwnProfile = req.user?._id.toString() === id;
            if (!isSuperAdmin && !isOwnProfile) {
                const response = {
                    success: false,
                    error: 'Access denied. You can only update your own profile.'
                };
                res.status(403).json(response);
                return;
            }
            if (updates.role && !isSuperAdmin) {
                const response = {
                    success: false,
                    error: 'Access denied. Only super-admins can change user roles.'
                };
                res.status(403).json(response);
                return;
            }
            if (updates.isActive === false && isOwnProfile && !isSuperAdmin) {
                const response = {
                    success: false,
                    error: 'You cannot deactivate your own account.'
                };
                res.status(400).json(response);
                return;
            }
            delete updates.password;
            delete updates._id;
            const user = await User_1.default.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true, runValidators: true }).select('-password');
            if (!user) {
                const response = {
                    success: false,
                    error: 'User not found'
                };
                res.status(404).json(response);
                return;
            }
            const response = {
                success: true,
                data: user,
                message: 'User updated successfully'
            };
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Update user error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update user'
            };
            res.status(500).json(response);
        }
    }
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            if (req.user?.role !== 'super-admin') {
                const response = {
                    success: false,
                    error: 'Access denied. Super admin privileges required.'
                };
                res.status(403).json(response);
                return;
            }
            if (req.user._id.toString() === id) {
                const response = {
                    success: false,
                    error: 'You cannot delete your own account.'
                };
                res.status(400).json(response);
                return;
            }
            const user = await User_1.default.findByIdAndUpdate(id, { isActive: false, updatedAt: new Date() }, { new: true }).select('-password');
            if (!user) {
                const response = {
                    success: false,
                    error: 'User not found'
                };
                res.status(404).json(response);
                return;
            }
            const response = {
                success: true,
                data: user,
                message: 'User deactivated successfully'
            };
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Delete user error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete user'
            };
            res.status(500).json(response);
        }
    }
    async resetUserPassword(req, res) {
        try {
            const { id } = req.params;
            if (req.user?.role !== 'super-admin') {
                const response = {
                    success: false,
                    error: 'Access denied. Super admin privileges required.'
                };
                res.status(403).json(response);
                return;
            }
            const user = await User_1.default.findById(id);
            if (!user) {
                const response = {
                    success: false,
                    error: 'User not found'
                };
                res.status(404).json(response);
                return;
            }
            const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
            user.password = tempPassword;
            await user.save();
            const response = {
                success: true,
                data: {
                    tempPassword,
                    email: user.email
                },
                message: 'Password reset successfully. User should change this password immediately.'
            };
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Reset password error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to reset password'
            };
            res.status(500).json(response);
        }
    }
    async getUserStats(req, res) {
        try {
            if (!['super-admin', 'admin'].includes(req.user?.role || '')) {
                const response = {
                    success: false,
                    error: 'Access denied. Admin privileges required.'
                };
                res.status(403).json(response);
                return;
            }
            const [totalUsers, activeUsers, superAdmins, websiteEditors, regularUsers] = await Promise.all([
                User_1.default.countDocuments(),
                User_1.default.countDocuments({ isActive: true }),
                User_1.default.countDocuments({ role: 'super-admin' }),
                User_1.default.countDocuments({ role: 'website-editor' }),
                User_1.default.countDocuments({ role: 'user' })
            ]);
            const stats = {
                totalUsers,
                activeUsers,
                inactiveUsers: totalUsers - activeUsers,
                superAdmins,
                websiteEditors,
                regularUsers
            };
            const response = {
                success: true,
                data: stats,
                message: 'User statistics retrieved successfully'
            };
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Get user stats error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to retrieve user statistics'
            };
            res.status(500).json(response);
        }
    }
    async createUser(req, res) {
        try {
            if (req.user?.role !== 'super-admin') {
                const response = {
                    success: false,
                    error: 'Access denied. Super admin privileges required.'
                };
                res.status(403).json(response);
                return;
            }
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const response = {
                    success: false,
                    error: errors.array()[0].msg
                };
                res.status(400).json(response);
                return;
            }
            const { email, firstName, lastName, role, password } = req.body;
            const existingUser = await User_1.default.findOne({ email });
            if (existingUser) {
                const response = {
                    success: false,
                    error: 'User with this email already exists'
                };
                res.status(409).json(response);
                return;
            }
            const user = new User_1.default({
                email,
                firstName,
                lastName,
                role: role || 'user',
                password,
                isActive: true
            });
            await user.save();
            const userResponse = user.toObject();
            const { password: _, ...userWithoutPassword } = userResponse;
            const response = {
                success: true,
                data: userWithoutPassword,
                message: 'User created successfully'
            };
            res.status(201).json(response);
        }
        catch (error) {
            console.error('Create user error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create user'
            };
            res.status(500).json(response);
        }
    }
}
exports.UserController = UserController;
exports.userController = new UserController();
//# sourceMappingURL=user.controller.js.map