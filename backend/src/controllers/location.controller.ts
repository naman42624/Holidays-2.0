import { Request, Response } from 'express';
import { locationService } from '@/services/location.service';
import { ApiResponse } from '@/types/amadeus';

export class LocationController {
  /**
   * Search for locations (airports, cities)
   * GET /api/locations/search
   */
  async searchLocations(req: Request, res: Response): Promise<void> {
    try {
      const {
        keyword,
        subType,
        countryCode,
        view,
        sort,
        limit,
        offset,
      } = req.query;

      if (!keyword) {
        const response: ApiResponse = {
          success: false,
          error: 'Keyword is required',
        };
        res.status(400).json(response);
        return;
      }

      const params = {
        keyword: keyword as string,
        ...(subType && { subType: subType as string }),
        ...(countryCode && { countryCode: countryCode as string }),
        ...(view && { view: view as string }),
        ...(sort && { sort: sort as string }),
        page: {
          ...(limit && { limit: parseInt(limit as string) }),
          ...(offset && { offset: parseInt(offset as string) }),
        },
      };

      const result = await locationService.searchLocations(params);
      
      // Transform the data for frontend consumption
      const transformedLocations = locationService.transformLocations(result.data);

      const response: ApiResponse = {
        success: true,
        data: transformedLocations,
        meta: result.meta,
      };

      res.json(response);
    } catch (error) {
      console.error('Location search error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search locations',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get location details
   * GET /api/locations/:id
   */
  async getLocationDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: 'Location ID is required',
        };
        res.status(400).json(response);
        return;
      }

      const result = await locationService.getLocationDetails(id);
      
      // Transform the data for frontend consumption
      const transformedLocation = locationService.transformLocations([result.data])[0];

      const response: ApiResponse = {
        success: true,
        data: transformedLocation,
      };

      res.json(response);
    } catch (error) {
      console.error('Location details error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get location details',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get airports by city
   * GET /api/locations/airports-by-city/:cityCode
   */
  async getAirportsByCity(req: Request, res: Response): Promise<void> {
    try {
      const { cityCode } = req.params;

      if (!cityCode) {
        const response: ApiResponse = {
          success: false,
          error: 'City code is required',
        };
        res.status(400).json(response);
        return;
      }

      const result = await locationService.getAirportsByCity(cityCode);
      
      // Transform the data for frontend consumption
      const transformedAirports = locationService.transformLocations(result.data);

      const response: ApiResponse = {
        success: true,
        data: transformedAirports,
      };

      res.json(response);
    } catch (error) {
      console.error('Airports by city error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get airports',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get nearby airports
   * GET /api/locations/nearby-airports
   */
  async getNearbyAirports(req: Request, res: Response): Promise<void> {
    try {
      const { latitude, longitude, radius } = req.query;

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
      };

      const result = await locationService.getNearbyAirports(params);
      
      // Transform the data for frontend consumption
      const transformedAirports = locationService.transformLocations(result.data);

      const response: ApiResponse = {
        success: true,
        data: transformedAirports,
      };

      res.json(response);
    } catch (error) {
      console.error('Nearby airports error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get nearby airports',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get popular destinations
   * GET /api/locations/popular-destinations
   */
  async getPopularDestinations(req: Request, res: Response): Promise<void> {
    try {
      const { origin, period, max } = req.query;

      const params = {
        ...(origin && { origin: origin as string }),
        ...(period && { period: period as string }),
        ...(max && { max: parseInt(max as string) }),
      };

      const result = await locationService.getPopularDestinations(params);

      const response: ApiResponse = {
        success: true,
        data: result.data,
      };

      res.json(response);
    } catch (error) {
      console.error('Popular destinations error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get popular destinations',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get airport information
   * GET /api/locations/airport/:code
   */
  async getAirportInfo(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;

      if (!code) {
        const response: ApiResponse = {
          success: false,
          error: 'Airport code is required',
        };
        res.status(400).json(response);
        return;
      }

      const result = await locationService.getAirportInfo(code);

      const response: ApiResponse = {
        success: true,
        data: result.data,
      };

      res.json(response);
    } catch (error) {
      console.error('Airport info error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get airport information',
      };
      res.status(500).json(response);
    }
  }
}

export const locationController = new LocationController();
