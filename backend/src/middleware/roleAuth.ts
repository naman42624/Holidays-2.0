import { Request, Response, NextFunction } from 'express';
import User from '@/models/User';
import { ApiResponse } from '@/types/amadeus';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

/**
 * Middleware to check if the user has admin role
 * This middleware should be used after authenticateToken
 */
export const isAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'Access denied. Authentication required.'
      };
      res.status(401).json(response);
      return;
    }

    const user = await User.findById(req.user.userId);

    if (!user || !['admin', 'super-admin', 'website-editor'].includes(user.role)) {
      const response: ApiResponse = {
        success: false,
        error: 'Access denied. Admin privileges required.'
      };
      res.status(403).json(response);
      return;
    }

    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Internal server error'
    };
    res.status(500).json(response);
  }
};

/**
 * Middleware to check if the user has super-admin role
 * This middleware should be used after authenticateToken
 */
export const isSuperAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'Access denied. Authentication required.'
      };
      res.status(401).json(response);
      return;
    }

    const user = await User.findById(req.user.userId);

    if (!user || user.role !== 'super-admin') {
      const response: ApiResponse = {
        success: false,
        error: 'Access denied. Super admin privileges required.'
      };
      res.status(403).json(response);
      return;
    }

    next();
  } catch (error) {
    console.error('Super admin authorization error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Internal server error'
    };
    res.status(500).json(response);
  }
};

/**
 * Middleware to check if user is content editor or higher
 * This middleware should be used after authenticateToken
 */
export const isContentEditor = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'Access denied. Authentication required.'
      };
      res.status(401).json(response);
      return;
    }

    const user = await User.findById(req.user.userId);

    if (!user || !['website-editor', 'admin', 'super-admin'].includes(user.role)) {
      const response: ApiResponse = {
        success: false,
        error: 'Access denied. Content editor privileges required.'
      };
      res.status(403).json(response);
      return;
    }

    next();
  } catch (error) {
    console.error('Content editor authorization error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Internal server error'
    };
    res.status(500).json(response);
  }
};
