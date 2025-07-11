import { Request, Response } from 'express';
import { hotelService } from '@/services/hotel.service';
import { ApiResponse } from '@/types/amadeus';

export class HotelController {
  /**
   * Handle errors and return appropriate API responses
   */
  private handleError(error: unknown, operation: string, res: Response): void {
    console.error(`Error in ${operation}:`, error);

    let statusCode = 500;
    let errorMessage = 'An unexpected error occurred';

    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for specific error types
      if (errorMessage.includes('timeout') || errorMessage.includes('Request timed out')) {
        statusCode = 504; // Gateway Timeout
        errorMessage = `The request timed out while ${operation}. Please try again later.`;
      } else if (errorMessage.includes('Network error')) {
        statusCode = 503; // Service Unavailable
        errorMessage = `Service unavailable while ${operation}. Please try again later.`;
      } else if (errorMessage.includes('Not found') || errorMessage.includes('Could not find')) {
        statusCode = 404;
      } else if (errorMessage.includes('Invalid request') || errorMessage.includes('Missing required')) {
        statusCode = 400;
      } else if (errorMessage.includes('Authentication') || errorMessage.includes('Unauthorized')) {
        statusCode = 401;
      } else if (errorMessage.includes('Rate limit')) {
        statusCode = 429;
      }
    }

    const response: ApiResponse = {
      success: false,
      error: errorMessage,
      message: `Failed to ${operation}`,
    };

    res.status(statusCode).json(response);
  }

  /**
   * Search for hotels by city
   * GET /api/hotels/search
   */
  async searchHotels(req: Request, res: Response): Promise<void> {
    try {
      const {
        cityCode,
        checkInDate,
        checkOutDate,
        adults,
        children,
        radius,
        radiusUnit,
        hotelSource,
        ratings,
        priceRange,
        currency,
        paymentPolicy,
        boardType,
      } = req.query;

      if (!cityCode || !checkInDate || !checkOutDate || !adults) {
        const response: ApiResponse = {
          success: false,
          error: 'Missing required parameters: cityCode, checkInDate, checkOutDate, adults',
        };
        res.status(400).json(response);
        return;
      }

      console.log('Hotel search request received:', {
        cityCode,
        checkInDate, 
        checkOutDate,
        adults,
        children
      });

      const params = {
        cityCode: cityCode as string,
        checkInDate: checkInDate as string,
        checkOutDate: checkOutDate as string,
        adults: parseInt(adults as string),
        ...(children && { children: parseInt(children as string) }),
        ...(radius && { radius: parseInt(radius as string) }),
        ...(radiusUnit && { radiusUnit: radiusUnit as 'KM' | 'MILE' }),
        ...(hotelSource && { hotelSource: hotelSource as string }),
        ...(ratings && { ratings: (ratings as string).split(',').map(r => parseInt(r)) }),
        ...(priceRange && { priceRange: priceRange as string }),
        // Note: currency not needed for hotel location search, only for hotel offers
        ...(paymentPolicy && { paymentPolicy: paymentPolicy as string }),
        ...(boardType && { boardType: boardType as string }),
      };

      try {
        const result = await hotelService.searchHotelsByCity(params);
        
        // Transform the data for frontend consumption
        const transformedHotels = hotelService.transformHotels(result.data);

        console.log('Hotel search successful:', {
          originalCount: result.data.length,
          transformedCount: transformedHotels.length
        });

        const response: ApiResponse = {
          success: true,
          data: transformedHotels,
          meta: result.meta,
        };

        res.json(response);
      } catch (hotelError) {
        // Handle errors properly without mock data fallback
        this.handleError(hotelError, 'search for hotels', res);
      }
    } catch (error) {
      this.handleError(error, 'search for hotels', res);
    }
  }

  /**
   * Search for hotels by location coordinates
   * GET /api/hotels/search-by-location
   */
  async searchHotelsByLocation(req: Request, res: Response): Promise<void> {
    try {
      const {
        latitude,
        longitude,
        checkInDate,
        checkOutDate,
        adults,
        radius,
        radiusUnit,
      } = req.query;

      if (!latitude || !longitude || !checkInDate || !checkOutDate || !adults) {
        const response: ApiResponse = {
          success: false,
          error: 'Missing required parameters: latitude, longitude, checkInDate, checkOutDate, adults',
        };
        res.status(400).json(response);
        return;
      }

      const params = {
        latitude: parseFloat(latitude as string),
        longitude: parseFloat(longitude as string),
        checkInDate: checkInDate as string,
        checkOutDate: checkOutDate as string,
        adults: parseInt(adults as string),
        ...(radius && { radius: parseInt(radius as string) }),
        ...(radiusUnit && { radiusUnit: radiusUnit as 'KM' | 'MILE' }),
      };

      try {
        const result = await hotelService.searchHotelsByGeocode(params);
        
        // Transform the data for frontend consumption
        const transformedHotels = hotelService.transformHotels(result.data);

        const response: ApiResponse = {
          success: true,
          data: transformedHotels,
          meta: result.meta,
        };

        res.json(response);
      } catch (hotelError) {
        // For development/testing - return mock data if API fails
        if (process.env.NODE_ENV !== 'production' && process.env.USE_MOCK_DATA === 'true') {
          console.log('Using mock hotel data for development');
          
          const mockHotels = [
            {
              id: 'mock-hotel-loc-1',
              name: 'Sample Location Hotel',
              rating: 4,
              address: {
                lines: ['Near coordinates'],
                cityName: 'Nearby City',
                countryCode: 'IN'
              },
              location: {
                latitude: parseFloat(latitude as string),
                longitude: parseFloat(longitude as string)
              },
              offers: [
                {
                  id: 'mock-offer-1',
                  checkInDate: checkInDate,
                  checkOutDate: checkOutDate,
                  roomQuantity: 1,
                  price: {
                    currency: 'INR',
                    total: '6000'
                  }
                }
              ]
            }
          ];

          const response: ApiResponse = {
            success: true,
            data: mockHotels,
            meta: {
              total: 1,
              mock: true,
            },
          };

          res.json(response);
        } else {
          // In production, properly handle the error
          this.handleError(hotelError, 'search for hotels by location', res);
        }
      }
    } catch (error) {
      this.handleError(error, 'search for hotels by location', res);
    }
  }

  /**
   * Get hotel offers with pricing
   * GET /api/hotels/offers
   */
  async getHotelOffers(req: Request, res: Response): Promise<void> {
    try {
      const {
        hotelIds,
        adults,
        checkInDate,
        checkOutDate,
        countryOfResidence,
        roomQuantity,
        priceRange,
        currency,
        paymentPolicy,
        boardType,
      } = req.query;

      if (!hotelIds || !adults || !checkInDate || !checkOutDate) {
        const response: ApiResponse = {
          success: false,
          error: 'Missing required parameters: hotelIds, adults, checkInDate, checkOutDate',
        };
        res.status(400).json(response);
        return;
      }

      const params = {
        hotelIds: (hotelIds as string).split(','),
        adults: parseInt(adults as string),
        checkInDate: checkInDate as string,
        checkOutDate: checkOutDate as string,
        ...(countryOfResidence && { countryOfResidence: countryOfResidence as string }),
        ...(roomQuantity && { roomQuantity: parseInt(roomQuantity as string) }),
        ...(priceRange && { priceRange: priceRange as string }),
        ...(currency && { currency: currency as string }),
        ...(paymentPolicy && { paymentPolicy: paymentPolicy as string }),
        ...(boardType && { boardType: boardType as string }),
      };

      const result = await hotelService.getHotelOffers(params);
      
      // Transform the data for frontend consumption
      const transformedOffers = hotelService.transformHotelOffers(result.data);

      const response: ApiResponse = {
        success: true,
        data: transformedOffers,
      };

      res.json(response);
    } catch (error) {
      console.error('Hotel offers error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get hotel offers',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get detailed hotel offer
   * GET /api/hotels/offers/:offerId
   */
  async getHotelOffer(req: Request, res: Response): Promise<void> {
    try {
      const { offerId } = req.params;
      const { lang } = req.query;

      if (!offerId) {
        const response: ApiResponse = {
          success: false,
          error: 'Offer ID is required',
        };
        res.status(400).json(response);
        return;
      }

      const result = await hotelService.getHotelOffer(offerId, lang as string);

      const response: ApiResponse = {
        success: true,
        data: result.data,
      };

      res.json(response);
    } catch (error) {
      console.error('Hotel offer details error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get hotel offer details',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Book a hotel
   * POST /api/hotels/book
   */
  async bookHotel(req: Request, res: Response): Promise<void> {
    try {
      const bookingData = req.body;

      if (!bookingData.data || !bookingData.data.hotelOffers || !bookingData.data.guests) {
        const response: ApiResponse = {
          success: false,
          error: 'Hotel offers and guests are required',
        };
        res.status(400).json(response);
        return;
      }

      const result = await hotelService.bookHotel(bookingData);

      const response: ApiResponse = {
        success: true,
        data: result.data,
        message: 'Hotel booked successfully',
      };

      res.json(response);
    } catch (error) {
      console.error('Hotel booking error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to book hotel',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get hotel ratings and reviews
   * GET /api/hotels/ratings
   */
  async getHotelRatings(req: Request, res: Response): Promise<void> {
    try {
      const { hotelIds } = req.query;

      if (!hotelIds) {
        const response: ApiResponse = {
          success: false,
          error: 'Hotel IDs are required',
        };
        res.status(400).json(response);
        return;
      }

      const params = {
        hotelIds: (hotelIds as string).split(','),
      };

      const result = await hotelService.getHotelRatings(params);

      const response: ApiResponse = {
        success: true,
        data: result.data,
      };

      res.json(response);
    } catch (error) {
      console.error('Hotel ratings error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get hotel ratings',
      };
      res.status(500).json(response);
    }
  }
}

export const hotelController = new HotelController();
