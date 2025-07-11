import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { ApiResponse } from '../types/amadeus';
import User from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    userId: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
  };
}

/**
 * JWT Authentication Middleware
 * Verifies the JWT token in the Authorization header
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      const response: ApiResponse = {
        success: false,
        error: 'Access denied. No token provided.'
      };
      res.status(401).json(response);
      return;
    }

    try {
      const decoded = authService.verifyToken(token);
      
      // Fetch full user details from database
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'User not found'
        };
        res.status(403).json(response);
        return;
      }

      req.user = {
        _id: user._id.toString(),
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive
      };
      next();
    } catch (tokenError) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid token'
      };
      res.status(403).json(response);
      return;
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Authentication failed'
    };
    res.status(500).json(response);
  }
};

/**
 * Optional JWT Authentication Middleware
 * Adds user info to request if token is provided, but doesn't require it
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = authService.verifyToken(token);
        
        // Fetch full user details from database
        const user = await User.findById(decoded.userId).select('-password');
        if (user) {
          req.user = {
            _id: user._id.toString(),
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            isActive: user.isActive
          };
        }
      } catch (tokenError) {
        // Token is invalid, but we continue without authentication
        console.log('Invalid token in optional auth, continuing without user info');
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue even if there's an error
  }
};

/**
 * Admin Role Middleware
 * Requires user to be authenticated and have admin role
 */
export const requireAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'Authentication required'
      };
      res.status(401).json(response);
      return;
    }

    // Get user from database to check role
    const user = await authService.getUserProfile(req.user.userId);
    
    if (user.role !== 'admin') {
      const response: ApiResponse = {
        success: false,
        error: 'Admin access required'
      };
      res.status(403).json(response);
      return;
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Access verification failed'
    };
    res.status(500).json(response);
  }
};
