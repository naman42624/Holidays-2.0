import { Router } from 'express';
import { 
  authController, 
  registerValidation, 
  loginValidation, 
  changePasswordValidation 
} from '@/controllers/auth.controller';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', registerValidation, authController.register.bind(authController));

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and get token
 * @access Public
 */
router.post('/login', loginValidation, authController.login.bind(authController));

/**
 * @route GET /api/auth/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile', authenticateToken, authController.getProfile.bind(authController));

/**
 * @route PUT /api/auth/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile', authenticateToken, authController.updateProfile.bind(authController));

/**
 * @route PUT /api/auth/change-password
 * @desc Change user password
 * @access Private
 */
router.put('/change-password', authenticateToken, changePasswordValidation, authController.changePassword.bind(authController));

/**
 * @route POST /api/auth/refresh
 * @desc Refresh JWT token
 * @access Public
 */
router.post('/refresh', authController.refreshToken.bind(authController));

/**
 * @route POST /api/auth/logout
 * @desc Logout user (client-side token removal)
 * @access Public
 */
router.post('/logout', authController.logout.bind(authController));

export default router;
