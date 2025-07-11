"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const flights_1 = __importDefault(require("./flights"));
const locations_1 = __importDefault(require("./locations"));
const hotels_1 = __importDefault(require("./hotels"));
const activities_1 = __importDefault(require("./activities"));
const playground_1 = __importDefault(require("./playground"));
const auth_1 = __importDefault(require("./auth"));
const tourPackages_1 = __importDefault(require("./tourPackages"));
const bookings_1 = __importDefault(require("./bookings"));
const user_routes_1 = require("./user.routes");
const location_service_1 = require("@/services/location.service");
const hotel_service_1 = require("@/services/hotel.service");
const router = (0, express_1.Router)();
console.log('🚀 Loading routes...');
console.log('📦 User routes loaded:', typeof user_routes_1.userRoutes);
router.use('/flights', flights_1.default);
router.use('/locations', locations_1.default);
router.use('/hotels', hotels_1.default);
router.use('/activities', activities_1.default);
router.use('/playground', playground_1.default);
router.use('/auth', auth_1.default);
router.use('/tour-packages', tourPackages_1.default);
router.use('/bookings', bookings_1.default);
router.use('/users', user_routes_1.userRoutes);
console.log('✅ All routes mounted, including user routes at /users and booking routes at /bookings');
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Amadeus Travel Platform API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});
router.get('/stats', (req, res) => {
    try {
        const locationStats = location_service_1.locationService.getCostOptimizationStats();
        const hotelStats = hotel_service_1.hotelService.getCostOptimizationStats();
        res.json({
            success: true,
            message: 'Cost optimization statistics',
            timestamp: new Date().toISOString(),
            stats: {
                location: locationStats,
                hotel: hotelStats,
                summary: {
                    totalRequests: locationStats.totalRequests + hotelStats.totalRequests,
                    totalCacheHits: locationStats.cacheHits + hotelStats.cacheHits,
                    totalSessionCacheSize: locationStats.sessionCacheSize + hotelStats.sessionCacheSize,
                    totalPendingRequests: locationStats.pendingRequests + hotelStats.pendingRequests,
                    overallCacheHitRate: Math.round(((locationStats.cacheHits + hotelStats.cacheHits) /
                        (locationStats.totalRequests + hotelStats.totalRequests + locationStats.cacheHits + hotelStats.cacheHits) * 100) * 100) / 100 || 0
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching cost optimization stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch cost optimization statistics'
        });
    }
});
exports.default = router;
//# sourceMappingURL=index.js.map