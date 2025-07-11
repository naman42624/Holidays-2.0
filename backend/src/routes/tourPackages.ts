import express from 'express';
import { 
  tourPackageController, 
  tourPackageValidation 
} from '@/controllers/tourPackage.controller';
import { authenticateToken } from '@/middleware/auth';
import { isAdmin, isContentEditor } from '@/middleware/roleAuth';

const router = express.Router();

// Test route to check if router is working
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Tour package router working!' });
});

// Debug logging
console.log('Tour package router created with test route');

// Admin routes - put more specific routes first
/**
 * @route GET /api/tour-packages/admin/all
 * @desc Get all tour packages (published and unpublished)
 * @access Private (Admin)
 */
router.get(
  '/admin/all', 
  authenticateToken, 
  isContentEditor, 
  tourPackageController.getAllTourPackages.bind(tourPackageController)
);

/**
 * @route GET /api/tour-packages/admin/search
 * @desc Search all tour packages (published and unpublished)
 * @access Private (Admin)
 */
router.get(
  '/admin/search', 
  authenticateToken, 
  isContentEditor, 
  tourPackageController.searchTourPackages.bind(tourPackageController)
);

/**
 * @route GET /api/tour-packages/admin/:id
 * @desc Get a specific tour package by ID (published or unpublished)
 * @access Private (Admin)
 */
router.get(
  '/admin/:id', 
  authenticateToken, 
  isContentEditor, 
  tourPackageController.getTourPackageById.bind(tourPackageController)
);

/**
 * @route PATCH /api/tour-packages/:id/toggle-publish
 * @desc Toggle publish status of a tour package
 * @access Private (Admin)
 */
router.patch(
  '/:id/toggle-publish', 
  authenticateToken, 
  isContentEditor, 
  tourPackageController.togglePublishStatus.bind(tourPackageController)
);

// Public routes
/**
 * @route GET /api/tour-packages/search
 * @desc Search published tour packages
 * @access Public
 */
router.get('/search', tourPackageController.searchTourPackages.bind(tourPackageController));

/**
 * @route POST /api/tour-packages
 * @desc Create a new tour package
 * @access Private (Admin)
 */
router.post(
  '/', 
  authenticateToken, 
  isContentEditor, 
  tourPackageValidation,
  tourPackageController.createTourPackage.bind(tourPackageController)
);

/**
 * @route GET /api/tour-packages/:id
 * @desc Get a specific published tour package by ID
 * @access Public
 */
router.get('/:id', tourPackageController.getTourPackageById.bind(tourPackageController));

/**
 * @route PUT /api/tour-packages/:id
 * @desc Update a tour package
 * @access Private (Admin)
 */
router.put(
  '/:id', 
  authenticateToken, 
  isContentEditor, 
  tourPackageValidation,
  tourPackageController.updateTourPackage.bind(tourPackageController)
);

/**
 * @route DELETE /api/tour-packages/:id
 * @desc Delete a tour package
 * @access Private (Admin)
 */
router.delete(
  '/:id', 
  authenticateToken, 
  isContentEditor, 
  tourPackageController.deleteTourPackage.bind(tourPackageController)
);

/**
 * @route GET /api/tour-packages
 * @desc Get all published tour packages
 * @access Public
 */
router.get('/', async (req, res) => {
  console.log('Tour packages root route hit!');
  try {
    await tourPackageController.getAllTourPackages(req, res);
    console.log('Controller executed successfully');
  } catch (error) {
    console.error('Error in tour packages root route:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
