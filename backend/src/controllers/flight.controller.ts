import { Request, Response } from 'express';
import { flightService } from '@/services/flight.service';
import { FlightSearchParams } from '@/types/amadeus';
import { ApiResponse } from '@/types/amadeus';

export class FlightController {
  /**
   * Search for flight offers
   * GET /api/flights/search
   */
  async searchFlights(req: Request, res: Response): Promise<void> {
    try {
      const {
        originLocationCode,
        destinationLocationCode,
        departureDate,
        returnDate,
        adults,
        children,
        infants,
        max,
        currencyCode,
        nonStop,
        travelClass,
        oneWay,
      } = req.query;

      console.log('Flight search request received:', {
        originLocationCode,
        destinationLocationCode,
        departureDate,
        adults,
        returnDate,
        children,
        infants,
        max,
        currencyCode,
        travelClass,
        oneWay
      });

      // Validate required parameters
      if (!originLocationCode || !destinationLocationCode || !departureDate || !adults) {
        const response: ApiResponse = {
          success: false,
          error: 'Missing required parameters: originLocationCode, destinationLocationCode, departureDate, adults',
        };
        res.status(400).json(response);
        return;
      }

      const searchParams: FlightSearchParams = {
        originLocationCode: originLocationCode as string,
        destinationLocationCode: destinationLocationCode as string,
        departureDate: departureDate as string,
        adults: parseInt(adults as string),
        ...(returnDate && { returnDate: returnDate as string }),
        ...(children && { children: parseInt(children as string) }),
        ...(infants && { infants: parseInt(infants as string) }),
        ...(max && { max: parseInt(max as string) }),
        currencyCode: 'INR', // Always use INR
        ...(nonStop && { nonStop: nonStop === 'true' }),
        ...(travelClass && { travelClass: travelClass as any }),
        ...(oneWay && { oneWay: oneWay === 'true' }),
      };

      try {
        const result = await flightService.searchFlightOffers(searchParams);
        console.log('Flight search result:', JSON.stringify(result, null, 2));
        // Transform the data for frontend consumption
        const transformedFlights = flightService.transformFlightOffers(result.data);
        console.log('Transformed flight offers:', transformedFlights.length, 'offers ready for frontend');
        console.log('Sample transformed flight offer:', JSON.stringify(transformedFlights[0], null, 2));
        console.log('Flight search successful:', {
          originalCount: result.data.length,
          transformedCount: transformedFlights.length,
          sampleFlight: transformedFlights[0]
        });

        const response: ApiResponse = {
          success: true,
          data: transformedFlights,
          meta: {
            total: result.meta?.count,
            hasMore: transformedFlights.length === (searchParams.max || 10),
            dictionaries: result.dictionaries,
          },
        };

        res.json(response);
      } catch (amadeusError) {
        console.error('Amadeus API error:', amadeusError);
        
        // Handle errors properly without mock data fallback
        const response: ApiResponse = {
          success: false,
          error: amadeusError instanceof Error ? amadeusError.message : 'Flight search failed',
        };
        
        res.status(400).json(response);
      }
    } catch (error) {
      console.error('Flight search error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search flights',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get confirmed pricing for flight offers
   * POST /api/flights/price
   */
  async priceFlights(req: Request, res: Response): Promise<void> {
    try {
      const { flightOffers } = req.body;

      if (!flightOffers || !Array.isArray(flightOffers) || flightOffers.length === 0) {
        const response: ApiResponse = {
          success: false,
          error: 'Flight offers are required',
        };
        res.status(400).json(response);
        return;
      }

      const result = await flightService.priceFlightOffers(flightOffers);

      const response: ApiResponse = {
        success: true,
        data: result.data,
      };

      res.json(response);
    } catch (error) {
      console.error('Flight pricing error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to price flights',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get flight destinations for inspiration
   * GET /api/flights/destinations
   */
  async getDestinations(req: Request, res: Response): Promise<void> {
    try {
      const {
        origin,
        departureDate,
        oneWay,
        duration,
        nonStop,
        maxPrice,
        viewBy,
      } = req.query;

      if (!origin) {
        const response: ApiResponse = {
          success: false,
          error: 'Origin is required',
        };
        res.status(400).json(response);
        return;
      }

      const params = {
        origin: origin as string,
        ...(departureDate && { departureDate: departureDate as string }),
        ...(oneWay && { oneWay: oneWay === 'true' }),
        ...(duration && { duration: duration as string }),
        ...(nonStop && { nonStop: nonStop === 'true' }),
        ...(maxPrice && { maxPrice: parseInt(maxPrice as string) }),
        ...(viewBy && { viewBy: viewBy as string }),
      };

      const result = await flightService.getFlightDestinations(params);

      const response: ApiResponse = {
        success: true,
        data: result.data,
        meta: result.meta,
      };

      res.json(response);
    } catch (error) {
      console.error('Flight destinations error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get destinations',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get cheapest flight dates
   * GET /api/flights/dates
   */
  async getFlightDates(req: Request, res: Response): Promise<void> {
    try {
      const {
        origin,
        destination,
        departureDate,
        oneWay,
        duration,
        nonStop,
        maxPrice,
      } = req.query;

      if (!origin || !destination) {
        const response: ApiResponse = {
          success: false,
          error: 'Origin and destination are required',
        };
        res.status(400).json(response);
        return;
      }

      const params = {
        origin: origin as string,
        destination: destination as string,
        ...(departureDate && { departureDate: departureDate as string }),
        ...(oneWay && { oneWay: oneWay === 'true' }),
        ...(duration && { duration: duration as string }),
        ...(nonStop && { nonStop: nonStop === 'true' }),
        ...(maxPrice && { maxPrice: parseInt(maxPrice as string) }),
      };

      const result = await flightService.getFlightDates(params);

      const response: ApiResponse = {
        success: true,
        data: result.data,
        meta: result.meta,
      };

      res.json(response);
    } catch (error) {
      console.error('Flight dates error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get flight dates',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Create flight booking
   * POST /api/flights/book
   */
  async bookFlight(req: Request, res: Response): Promise<void> {
    try {
      const bookingData = req.body;

      if (!bookingData.flightOffers || !bookingData.travelers) {
        const response: ApiResponse = {
          success: false,
          error: 'Flight offers and travelers are required',
        };
        res.status(400).json(response);
        return;
      }

      const result = await flightService.createFlightOrder(bookingData);

      const response: ApiResponse = {
        success: true,
        data: result.data,
        message: 'Flight booked successfully',
      };

      res.json(response);
    } catch (error) {
      console.error('Flight booking error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to book flight',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get airline information
   * GET /api/flights/airlines
   */
  async getAirlines(req: Request, res: Response): Promise<void> {
    try {
      const { codes } = req.query;

      if (!codes) {
        const response: ApiResponse = {
          success: false,
          error: 'Airline codes are required',
        };
        res.status(400).json(response);
        return;
      }

      const airlineCodes = (codes as string).split(',');
      const result = await flightService.getAirlineInfo(airlineCodes);

      const response: ApiResponse = {
        success: true,
        data: result.data,
      };

      res.json(response);
    } catch (error) {
      console.error('Airlines info error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get airline information',
      };
      res.status(500).json(response);
    }
  }
}

export const flightController = new FlightController();
