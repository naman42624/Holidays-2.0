import { Request, Response } from 'express';
import { ApiResponse } from '@/types/amadeus';
import { tourPackageService } from '@/services/tourPackage.service';
import { body, validationResult } from 'express-validator';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

class TourPackageController {
  /**
   * Get all tour packages
   */
  async getAllTourPackages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const isAdmin = req.path.startsWith('/admin/');
      const packages = await tourPackageService.getAllTourPackages(isAdmin);
      
      const response: ApiResponse = {
        success: true,
        data: packages,
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error getting all tour packages:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Error retrieving tour packages',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get tour package by ID
   */
  async getTourPackageById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const isAdmin = req.path.startsWith('/admin/');
      const { id } = req.params;
      const tourPackage = await tourPackageService.getTourPackageById(id, isAdmin);
      
      if (!tourPackage) {
        const response: ApiResponse = {
          success: false,
          error: 'Tour package not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: tourPackage,
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error getting tour package by ID:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Error retrieving tour package',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Create tour package
   */
  async createTourPackage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const response: ApiResponse = {
          success: false,
          error: errors.array()[0].msg,
        };
        res.status(400).json(response);
        return;
      }

      if (!req.user?.userId) {
        const response: ApiResponse = {
          success: false,
          error: 'User ID not found',
        };
        res.status(401).json(response);
        return;
      }

      const tourPackage = await tourPackageService.createTourPackage(
        req.body,
        req.user.userId
      );

      const response: ApiResponse = {
        success: true,
        data: tourPackage,
        message: 'Tour package created successfully'
      };
      
      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating tour package:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Error creating tour package',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Update tour package
   */
  async updateTourPackage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const response: ApiResponse = {
          success: false,
          error: errors.array()[0].msg,
        };
        res.status(400).json(response);
        return;
      }

      const { id } = req.params;
      const tourPackage = await tourPackageService.updateTourPackage(id, req.body);
      
      if (!tourPackage) {
        const response: ApiResponse = {
          success: false,
          error: 'Tour package not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: tourPackage,
        message: 'Tour package updated successfully'
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error updating tour package:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Error updating tour package',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Delete tour package
   */
  async deleteTourPackage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await tourPackageService.deleteTourPackage(id);
      
      if (!success) {
        const response: ApiResponse = {
          success: false,
          error: 'Tour package not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Tour package deleted successfully'
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error deleting tour package:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Error deleting tour package',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Toggle tour package publish status
   */
  async togglePublishStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tourPackage = await tourPackageService.togglePublishStatus(id);
      
      if (!tourPackage) {
        const response: ApiResponse = {
          success: false,
          error: 'Tour package not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: tourPackage,
        message: `Tour package ${tourPackage.isPublished ? 'published' : 'unpublished'} successfully`
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error toggling publish status:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Error updating publish status',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Search tour packages
   */
  async searchTourPackages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const isAdmin = req.path.startsWith('/admin/');
      const { query } = req.query as { query: string };
      
      if (!query) {
        const response: ApiResponse = {
          success: false,
          error: 'Search query is required',
        };
        res.status(400).json(response);
        return;
      }

      const packages = await tourPackageService.searchTourPackages(query, isAdmin);
      
      const response: ApiResponse = {
        success: true,
        data: packages,
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error searching tour packages:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Error searching tour packages',
      };
      res.status(500).json(response);
    }
  }
}

export const tourPackageController = new TourPackageController();

export const tourPackageValidation = [
  body('title').notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('description').notEmpty().withMessage('Description is required')
    .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
  body('price').notEmpty().withMessage('Price is required')
    .isNumeric().withMessage('Price must be a number')
    .custom((value) => value >= 0).withMessage('Price cannot be negative'),
  body('duration').notEmpty().withMessage('Duration is required'),
  body('imageUrl').notEmpty().withMessage('Image URL is required')
    .isURL().withMessage('Image URL must be a valid URL'),
  body('activities').optional().isArray().withMessage('Activities must be an array'),
  body('activities.*.name').optional().notEmpty().withMessage('Activity name is required'),
  body('activities.*.description').optional().notEmpty().withMessage('Activity description is required'),
  body('activities.*.duration').optional().notEmpty().withMessage('Activity duration is required'),
  body('activities.*.included').optional().isBoolean().withMessage('Activity included must be a boolean'),
];
