import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authService } from '@/services/auth.service';
import { ApiResponse } from '@/types/amadeus';

export class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const response: ApiResponse = {
          success: false,
          error: 'Validation failed',
          message: errors.array().map(err => err.msg).join(', ')
        };
        res.status(400).json(response);
        return;
      }

      const { email, password, firstName, lastName } = req.body;

      const result = await authService.register({
        email,
        password,
        firstName,
        lastName
      });

      const response: ApiResponse = {
        success: true,
        data: {
          user: result.user,
          token: result.token
        },
        message: 'User registered successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Registration error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
      res.status(400).json(response);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const response: ApiResponse = {
          success: false,
          error: 'Validation failed',
          message: errors.array().map(err => err.msg).join(', ')
        };
        res.status(400).json(response);
        return;
      }

      const { email, password } = req.body;

      const result = await authService.login({ email, password });

      const response: ApiResponse = {
        success: true,
        data: {
          user: result.user,
          token: result.token
        },
        message: 'Login successful'
      };

      res.json(response);
    } catch (error) {
      console.error('Login error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
      res.status(401).json(response);
    }
  }

  /**
   * Get user profile
   * GET /api/auth/profile
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const user = await authService.getUserProfile(userId);

      const response: ApiResponse = {
        success: true,
        data: { user },
        message: 'Profile retrieved successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Get profile error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get profile'
      };
      res.status(404).json(response);
    }
  }

  /**
   * Update user profile
   * PUT /api/auth/profile
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const updates = req.body;

      const user = await authService.updateProfile(userId, updates);

      const response: ApiResponse = {
        success: true,
        data: { user },
        message: 'Profile updated successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Update profile error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile'
      };
      res.status(400).json(response);
    }
  }

  /**
   * Change password
   * PUT /api/auth/change-password
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const response: ApiResponse = {
          success: false,
          error: 'Validation failed',
          message: errors.array().map(err => err.msg).join(', ')
        };
        res.status(400).json(response);
        return;
      }

      const userId = (req as any).user.userId;
      const { currentPassword, newPassword } = req.body;

      await authService.changePassword(userId, {
        currentPassword,
        newPassword
      });

      const response: ApiResponse = {
        success: true,
        message: 'Password changed successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Change password error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to change password'
      };
      res.status(400).json(response);
    }
  }

  /**
   * Refresh token
   * POST /api/auth/refresh
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        const response: ApiResponse = {
          success: false,
          error: 'Token is required'
        };
        res.status(400).json(response);
        return;
      }

      const result = await authService.refreshToken(token);

      const response: ApiResponse = {
        success: true,
        data: {
          user: result.user,
          token: result.token
        },
        message: 'Token refreshed successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Refresh token error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refresh token'
      };
      res.status(401).json(response);
    }
  }

  /**
   * Logout user (client-side only)
   * POST /api/auth/logout
   */
  async logout(req: Request, res: Response): Promise<void> {
    const response: ApiResponse = {
      success: true,
      message: 'Logout successful. Please remove the token from client storage.'
    };

    res.json(response);
  }
}

// Validation rules
export const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required')
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

export const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
];

export const authController = new AuthController();
