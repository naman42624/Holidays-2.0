"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isContentEditor = exports.isSuperAdmin = exports.isAdmin = void 0;
const User_1 = __importDefault(require("@/models/User"));
const isAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            const response = {
                success: false,
                error: 'Access denied. Authentication required.'
            };
            res.status(401).json(response);
            return;
        }
        const user = await User_1.default.findById(req.user.userId);
        if (!user || !['admin', 'super-admin', 'website-editor'].includes(user.role)) {
            const response = {
                success: false,
                error: 'Access denied. Admin privileges required.'
            };
            res.status(403).json(response);
            return;
        }
        next();
    }
    catch (error) {
        console.error('Admin authorization error:', error);
        const response = {
            success: false,
            error: 'Internal server error'
        };
        res.status(500).json(response);
    }
};
exports.isAdmin = isAdmin;
const isSuperAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            const response = {
                success: false,
                error: 'Access denied. Authentication required.'
            };
            res.status(401).json(response);
            return;
        }
        const user = await User_1.default.findById(req.user.userId);
        if (!user || user.role !== 'super-admin') {
            const response = {
                success: false,
                error: 'Access denied. Super admin privileges required.'
            };
            res.status(403).json(response);
            return;
        }
        next();
    }
    catch (error) {
        console.error('Super admin authorization error:', error);
        const response = {
            success: false,
            error: 'Internal server error'
        };
        res.status(500).json(response);
    }
};
exports.isSuperAdmin = isSuperAdmin;
const isContentEditor = async (req, res, next) => {
    try {
        if (!req.user) {
            const response = {
                success: false,
                error: 'Access denied. Authentication required.'
            };
            res.status(401).json(response);
            return;
        }
        const user = await User_1.default.findById(req.user.userId);
        if (!user || !['website-editor', 'admin', 'super-admin'].includes(user.role)) {
            const response = {
                success: false,
                error: 'Access denied. Content editor privileges required.'
            };
            res.status(403).json(response);
            return;
        }
        next();
    }
    catch (error) {
        console.error('Content editor authorization error:', error);
        const response = {
            success: false,
            error: 'Internal server error'
        };
        res.status(500).json(response);
    }
};
exports.isContentEditor = isContentEditor;
//# sourceMappingURL=roleAuth.js.map