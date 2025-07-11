"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.securityHeaders = exports.requestLogger = exports.errorHandler = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const response = {
            success: false,
            error: 'Validation failed',
            data: errors.array(),
        };
        res.status(400).json(response);
        return;
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
const errorHandler = (error, req, res, next) => {
    console.error('Global error handler:', error);
    if (error.name === 'AmadeusAPIError') {
        const response = {
            success: false,
            error: error.message,
        };
        res.status(400).json(response);
        return;
    }
    if (error.message.includes('timeout')) {
        const response = {
            success: false,
            error: 'Request timeout - please try again',
        };
        res.status(408).json(response);
        return;
    }
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        const response = {
            success: false,
            error: 'Service temporarily unavailable',
        };
        res.status(503).json(response);
        return;
    }
    const response = {
        success: false,
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : error.message,
    };
    res.status(500).json(response);
};
exports.errorHandler = errorHandler;
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
    if (Object.keys(req.query).length > 0) {
        console.log('Query params:', req.query);
    }
    next();
};
exports.requestLogger = requestLogger;
const securityHeaders = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
};
exports.securityHeaders = securityHeaders;
const notFoundHandler = (req, res) => {
    const response = {
        success: false,
        error: `Route ${req.method} ${req.originalUrl} not found`,
    };
    res.status(404).json(response);
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=index.js.map