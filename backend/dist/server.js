"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("@/routes"));
const middleware_1 = require("@/middleware");
const database_1 = __importDefault(require("@/config/database"));
const location_service_1 = require("@/services/location.service");
const hotel_service_1 = require("@/services/hotel.service");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8000;
app.set('trust proxy', 1);
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
app.use((0, helmet_1.default)());
app.use(middleware_1.securityHeaders);
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(middleware_1.requestLogger);
const allowedOrigins = process.env.FRONTEND_URLS
    ? process.env.FRONTEND_URLS.split(',').map(url => url.trim())
    : ['http://localhost:3000'];
const isOriginAllowed = (origin) => {
    return allowedOrigins.some(allowed => {
        if (allowed === origin)
            return true;
        if (allowed.includes('*.')) {
            const pattern = allowed.replace(/\*/g, '.*');
            const regex = new RegExp(`^${pattern}$`);
            return regex.test(origin);
        }
        return false;
    });
};
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (isOriginAllowed(origin)) {
            callback(null, true);
        }
        else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', routes_1.default);
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Amadeus Travel Platform API',
        version: '1.0.0',
        documentation: '/api/health',
        endpoints: {
            flights: '/api/flights',
            locations: '/api/locations',
            hotels: '/api/hotels',
            activities: '/api/activities',
            auth: '/api/auth',
            playground: '/api/playground',
            tourPackages: '/api/tour-packages',
        },
    });
});
app.use(middleware_1.notFoundHandler);
app.use(middleware_1.errorHandler);
const startServer = async () => {
    try {
        await (0, database_1.default)();
        console.log('💰 Initializing cost optimization features...');
        location_service_1.locationService.initializeCostOptimizations();
        hotel_service_1.hotelService.initializeCostOptimizations();
        location_service_1.locationService.schedulePopularDestinationsRefresh();
        const server = app.listen(PORT, () => {
            console.log(`🚀 Amadeus Travel Platform API server running on port ${PORT}`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/api/health`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            if (process.env.NODE_ENV === 'development') {
                console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
            }
        });
        process.on('SIGTERM', () => {
            console.log('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                console.log('Server closed.');
                process.exit(0);
            });
        });
        process.on('SIGINT', () => {
            console.log('SIGINT received. Shutting down gracefully...');
            server.close(() => {
                console.log('Server closed.');
                process.exit(0);
            });
        });
        return server;
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map