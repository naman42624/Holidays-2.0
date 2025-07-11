import { Router } from 'express';
import flightRoutes from './flights';
import locationRoutes from './locations';
import hotelRoutes from './hotels';
import activityRoutes from './activities';
import playgroundRoutes from './playground';
import authRoutes from './auth';
import tourPackageRoutes from './tourPackages';
import bookingRoutes from './bookings';
import { userRoutes } from './user.routes';

import { locationService } from '@/services/location.service';
import { hotelService } from '@/services/hotel.service';

const router = Router();

console.log('🚀 Loading routes...');
console.log('📦 User routes loaded:', typeof userRoutes);

// Mount route modules
router.use('/flights', flightRoutes);
router.use('/locations', locationRoutes);
router.use('/hotels', hotelRoutes);
router.use('/activities', activityRoutes);
router.use('/playground', playgroundRoutes);
router.use('/auth', authRoutes);
router.use('/tour-packages', tourPackageRoutes);
router.use('/bookings', bookingRoutes);
router.use('/users', userRoutes);

console.log('✅ All routes mounted, including user routes at /users and booking routes at /bookings');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Amadeus Travel Platform API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Cost optimization stats endpoint
router.get('/stats', (req, res) => {
  try {
    const locationStats = locationService.getCostOptimizationStats();
    const hotelStats = hotelService.getCostOptimizationStats();
    
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
          overallCacheHitRate: Math.round(
            ((locationStats.cacheHits + hotelStats.cacheHits) / 
             (locationStats.totalRequests + hotelStats.totalRequests + locationStats.cacheHits + hotelStats.cacheHits) * 100) * 100
          ) / 100 || 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching cost optimization stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cost optimization statistics'
    });
  }
});

export default router;
