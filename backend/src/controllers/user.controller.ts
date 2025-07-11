import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';
import { ApiResponse } from '../types/amadeus';
import { AuthenticatedRequest } from '../middleware/auth';

export class UserController {
  /**
   * Get all users (admin only)
   * GET /api/users
   */
  async getAllUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Check if user is super-admin
      if (req.user?.role !== 'super-admin') {
        const response: ApiResponse = {
          success: false,
          error: 'Access denied. Super admin privileges required.'
        };
        res.status(403).json(response);
        return;
      }

      const users = await User.find({})
        .select('-password')
        .sort({ createdAt: -1 });

      const response: ApiResponse = {
        success: true,
        data: users,
        message: 'Users retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get users error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve users'
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Check if user is admin or requesting their own data
      if (req.user?.role !== 'super-admin' && req.user?._id.toString() !== id) {
        const response: ApiResponse = {
          success: false,
          error: 'Access denied. You can only view your own profile.'
        };
        res.status(403).json(response);
        return;
      }

      const user = await User.findById(id).select('-password');

      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'User not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get user error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve user'
      };
      res.status(500).json(response);
    }
  }

  /**
   * Update user
   * PATCH /api/users/:id
   */
  async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Check validation errors
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

      // Check permissions
      const isSuperAdmin = req.user?.role === 'super-admin';
      const isOwnProfile = req.user?._id.toString() === id;

      if (!isSuperAdmin && !isOwnProfile) {
        const response: ApiResponse = {
          success: false,
          error: 'Access denied. You can only update your own profile.'
        };
        res.status(403).json(response);
        return;
      }

      // Restrict role changes to super-admins only
      if (updates.role && !isSuperAdmin) {
        const response: ApiResponse = {
          success: false,
          error: 'Access denied. Only super-admins can change user roles.'
        };
        res.status(403).json(response);
        return;
      }

      // Prevent users from deactivating themselves
      if (updates.isActive === false && isOwnProfile && !isSuperAdmin) {
        const response: ApiResponse = {
          success: false,
          error: 'You cannot deactivate your own account.'
        };
        res.status(400).json(response);
        return;
      }

      // Remove sensitive fields from updates
      delete updates.password;
      delete updates._id;

      const user = await User.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'User not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User updated successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Update user error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user'
      };
      res.status(500).json(response);
    }
  }

  /**
   * Delete user (soft delete by deactivating)
   * DELETE /api/users/:id
   */
  async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Only super-admins can delete users
      if (req.user?.role !== 'super-admin') {
        const response: ApiResponse = {
          success: false,
          error: 'Access denied. Super admin privileges required.'
        };
        res.status(403).json(response);
        return;
      }

      // Prevent super-admin from deleting themselves
      if (req.user._id.toString() === id) {
        const response: ApiResponse = {
          success: false,
          error: 'You cannot delete your own account.'
        };
        res.status(400).json(response);
        return;
      }

      const user = await User.findByIdAndUpdate(
        id,
        { isActive: false, updatedAt: new Date() },
        { new: true }
      ).select('-password');

      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'User not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User deactivated successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Delete user error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete user'
      };
      res.status(500).json(response);
    }
  }

  /**
   * Reset user password (admin only)
   * POST /api/users/:id/reset-password
   */
  async resetUserPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Only super-admins can reset passwords
      if (req.user?.role !== 'super-admin') {
        const response: ApiResponse = {
          success: false,
          error: 'Access denied. Super admin privileges required.'
        };
        res.status(403).json(response);
        return;
      }

      const user = await User.findById(id);

      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'User not found'
        };
        res.status(404).json(response);
        return;
      }

      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
      
      // Hash and save the new password
      user.password = tempPassword;
      await user.save();

      const response: ApiResponse = {
        success: true,
        data: {
          tempPassword,
          email: user.email
        },
        message: 'Password reset successfully. User should change this password immediately.'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Reset password error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reset password'
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get user statistics (admin only)
   * GET /api/users/stats
   */
  async getUserStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Check if user is admin
      if (!['super-admin', 'admin'].includes(req.user?.role || '')) {
        const response: ApiResponse = {
          success: false,
          error: 'Access denied. Admin privileges required.'
        };
        res.status(403).json(response);
        return;
      }

      const [
        totalUsers,
        activeUsers,
        superAdmins,
        websiteEditors,
        regularUsers
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ role: 'super-admin' }),
        User.countDocuments({ role: 'website-editor' }),
        User.countDocuments({ role: 'user' })
      ]);

      const stats = {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        superAdmins,
        websiteEditors,
        regularUsers
      };

      const response: ApiResponse = {
        success: true,
        data: stats,
        message: 'User statistics retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get user stats error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve user statistics'
      };
      res.status(500).json(response);
    }
  }

  /**
   * Create a new user (admin only)
   * POST /api/users
   */
  async createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Check if user is super-admin
      if (req.user?.role !== 'super-admin') {
        const response: ApiResponse = {
          success: false,
          error: 'Access denied. Super admin privileges required.'
        };
        res.status(403).json(response);
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const response: ApiResponse = {
          success: false,
          error: errors.array()[0].msg
        };
        res.status(400).json(response);
        return;
      }

      const { email, firstName, lastName, role, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        const response: ApiResponse = {
          success: false,
          error: 'User with this email already exists'
        };
        res.status(409).json(response);
        return;
      }

      // Create new user
      const user = new User({
        email,
        firstName,
        lastName,
        role: role || 'user',
        password,
        isActive: true
      });

      await user.save();

      // Return user without password
      const userResponse = user.toObject();
      const { password: _, ...userWithoutPassword } = userResponse;

      const response: ApiResponse = {
        success: true,
        data: userWithoutPassword,
        message: 'User created successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Create user error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user'
      };
      res.status(500).json(response);
    }
  }
}

export const userController = new UserController();
