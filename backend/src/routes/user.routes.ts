import { Router } from 'express';
import { body } from 'express-validator';
import { userController } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all user routes
router.use(authenticateToken);

/**
 * @route   GET /api/users
 * @desc    Get all users (super-admin only)
 * @access  Private (Super Admin)
 */
router.get('/', userController.getAllUsers);

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics (admin only)
 * @access  Private (Admin)
 */
router.get('/stats', userController.getUserStats);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Self or Admin)
 */
router.get('/:id', userController.getUserById);

/**
 * @route   PATCH /api/users/:id
 * @desc    Update user
 * @access  Private (Self or Admin)
 */
router.patch('/:id', [
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('firstName').optional().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').optional().isLength({ min: 1 }).withMessage('Last name is required'),
  body('role').optional().isIn(['user', 'website-editor', 'super-admin']).withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
], userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete (deactivate) user
 * @access  Private (Super Admin)
 */
router.delete('/:id', userController.deleteUser);

/**
 * @route   POST /api/users/:id/reset-password
 * @desc    Reset user password
 * @access  Private (Super Admin)
 */
router.post('/:id/reset-password', userController.resetUserPassword);

/**
 * @route   POST /api/users
 * @desc    Create a new user (super-admin only)
 * @access  Private (Super Admin)
 */
router.post('/', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('firstName').isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').isLength({ min: 1 }).withMessage('Last name is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['user', 'website-editor', 'super-admin']).withMessage('Invalid role'),
], userController.createUser);

export { router as userRoutes };
