import { Request, Response } from 'express';
import { activityService } from '@/services/activity.service';
import { ApiResponse } from '@/types/amadeus';

export class ActivityController {
  /**
   * Search for activities and tours
   * GET /api/activities/search
   */
  async searchActivities(req: Request, res: Response): Promise<void> {
    try {
      const {
        latitude,
        longitude,
        radius,
        north,
        west,
        south,
        east,
      } = req.query;

      // Validate parameters - either lat/lng or bounding box required
      if ((!latitude || !longitude) && (!north || !west || !south || !east)) {
        const response: ApiResponse = {
          success: false,
          error: 'Either latitude/longitude or bounding box (north, west, south, east) is required',
        };
        res.status(400).json(response);
        return;
      }

      const params: any = {};

      if (latitude && longitude) {
        params.latitude = parseFloat(latitude as string);
        params.longitude = parseFloat(longitude as string);
        if (radius) {
          params.radius = parseInt(radius as string);
        }
      } else if (north && west && south && east) {
        params.north = parseFloat(north as string);
        params.west = parseFloat(west as string);
        params.south = parseFloat(south as string);
        params.east = parseFloat(east as string);
      }

      const result = await activityService.searchActivities(params);
      
      // Transform the data for frontend consumption
      const transformedActivities = activityService.transformActivities(result.data);

      const response: ApiResponse = {
        success: true,
        data: transformedActivities,
        meta: result.meta,
      };

      res.json(response);
    } catch (error) {
      console.error('Activity search error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search activities',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get activity details
   * GET /api/activities/:id
   */
  async getActivityDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: 'Activity ID is required',
        };
        res.status(400).json(response);
        return;
      }

      const result = await activityService.getActivityDetails(id);
      
      // Transform the data for frontend consumption
      const transformedActivity = activityService.transformActivities([result.data])[0];

      const response: ApiResponse = {
        success: true,
        data: transformedActivity,
      };

      res.json(response);
    } catch (error) {
      console.error('Activity details error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get activity details',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Search for points of interest
   * GET /api/activities/points-of-interest
   */
  async searchPointsOfInterest(req: Request, res: Response): Promise<void> {
    try {
      const {
        latitude,
        longitude,
        radius,
        categories,
      } = req.query;

      if (!latitude || !longitude) {
        const response: ApiResponse = {
          success: false,
          error: 'Latitude and longitude are required',
        };
        res.status(400).json(response);
        return;
      }

      const params = {
        latitude: parseFloat(latitude as string),
        longitude: parseFloat(longitude as string),
        ...(radius && { radius: parseInt(radius as string) }),
        ...(categories && { categories: (categories as string).split(',') }),
      };

      const result = await activityService.searchPointsOfInterest(params);
      
      // Transform the data for frontend consumption
      const transformedPOIs = activityService.transformPointsOfInterest(result.data);

      const response: ApiResponse = {
        success: true,
        data: transformedPOIs,
        meta: result.meta,
      };

      res.json(response);
    } catch (error) {
      console.error('Points of interest search error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search points of interest',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Search for points of interest by square area
   * GET /api/activities/points-of-interest-by-square
   */
  async getPointsOfInterestBySquare(req: Request, res: Response): Promise<void> {
    try {
      const {
        north,
        west,
        south,
        east,
        categories,
      } = req.query;

      if (!north || !west || !south || !east) {
        const response: ApiResponse = {
          success: false,
          error: 'Bounding box coordinates (north, west, south, east) are required',
        };
        res.status(400).json(response);
        return;
      }

      const params = {
        north: parseFloat(north as string),
        west: parseFloat(west as string),
        south: parseFloat(south as string),
        east: parseFloat(east as string),
        ...(categories && { categories: (categories as string).split(',') }),
      };

      const result = await activityService.getPointsOfInterestBySquare(params);
      
      // Transform the data for frontend consumption
      const transformedPOIs = activityService.transformPointsOfInterest(result.data);

      const response: ApiResponse = {
        success: true,
        data: transformedPOIs,
        meta: result.meta,
      };

      res.json(response);
    } catch (error) {
      console.error('Points of interest by square error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search points of interest',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get point of interest details
   * GET /api/activities/points-of-interest/:id
   */
  async getPointOfInterestDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: 'Point of interest ID is required',
        };
        res.status(400).json(response);
        return;
      }

      const result = await activityService.getPointOfInterestDetails(id);

      const response: ApiResponse = {
        success: true,
        data: result.data,
      };

      res.json(response);
    } catch (error) {
      console.error('Point of interest details error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get point of interest details',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get activity categories
   * GET /api/activities/categories
   */
  async getActivityCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = activityService.getActivityCategories();

      const response: ApiResponse = {
        success: true,
        data: categories,
      };

      res.json(response);
    } catch (error) {
      console.error('Activity categories error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get activity categories',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Filter activities with custom criteria
   * POST /api/activities/filter
   */
  async filterActivities(req: Request, res: Response): Promise<void> {
    try {
      const { activities, filters } = req.body;

      if (!activities || !Array.isArray(activities)) {
        const response: ApiResponse = {
          success: false,
          error: 'Activities array is required',
        };
        res.status(400).json(response);
        return;
      }

      const filteredActivities = activityService.filterActivities(activities, filters || {});

      const response: ApiResponse = {
        success: true,
        data: filteredActivities,
        meta: {
          total: filteredActivities.length,
        },
      };

      res.json(response);
    } catch (error) {
      console.error('Activity filtering error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to filter activities',
      };
      res.status(500).json(response);
    }
  }
}

export const activityController = new ActivityController();
