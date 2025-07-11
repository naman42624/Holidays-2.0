"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.optionalAuth = exports.authenticateToken = void 0;
const auth_service_1 = require("../services/auth.service");
const User_1 = __importDefault(require("../models/User"));
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            const response = {
                success: false,
                error: 'Access denied. No token provided.'
            };
            res.status(401).json(response);
            return;
        }
        try {
            const decoded = auth_service_1.authService.verifyToken(token);
            const user = await User_1.default.findById(decoded.userId).select('-password');
            if (!user) {
                const response = {
                    success: false,
                    error: 'User not found'
                };
                res.status(403).json(response);
                return;
            }
            req.user = {
                _id: user._id.toString(),
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                isActive: user.isActive
            };
            next();
        }
        catch (tokenError) {
            const response = {
                success: false,
                error: 'Invalid token'
            };
            res.status(403).json(response);
            return;
        }
    }
    catch (error) {
        console.error('Authentication middleware error:', error);
        const response = {
            success: false,
            error: 'Authentication failed'
        };
        res.status(500).json(response);
    }
};
exports.authenticateToken = authenticateToken;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            try {
                const decoded = auth_service_1.authService.verifyToken(token);
                const user = await User_1.default.findById(decoded.userId).select('-password');
                if (user) {
                    req.user = {
                        _id: user._id.toString(),
                        userId: user._id.toString(),
                        email: user.email,
                        role: user.role,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        isActive: user.isActive
                    };
                }
            }
            catch (tokenError) {
                console.log('Invalid token in optional auth, continuing without user info');
            }
        }
        next();
    }
    catch (error) {
        console.error('Optional auth middleware error:', error);
        next();
    }
};
exports.optionalAuth = optionalAuth;
const requireAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            const response = {
                success: false,
                error: 'Authentication required'
            };
            res.status(401).json(response);
            return;
        }
        const user = await auth_service_1.authService.getUserProfile(req.user.userId);
        if (user.role !== 'admin') {
            const response = {
                success: false,
                error: 'Admin access required'
            };
            res.status(403).json(response);
            return;
        }
        next();
    }
    catch (error) {
        console.error('Admin middleware error:', error);
        const response = {
            success: false,
            error: 'Access verification failed'
        };
        res.status(500).json(response);
    }
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=auth.js.map