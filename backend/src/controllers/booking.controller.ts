import { Request, Response } from 'express';
import { bookingService, CreateFlightBookingRequest, CreateHotelBookingRequest } from '@/services/booking.service';
import { ApiResponse } from '@/types/amadeus';

class BookingController {
  /**
   * Create a new flight booking
   * POST /api/bookings/flight
   */
  async createFlightBooking(req: Request, res: Response): Promise<void> {
    try {
      const bookingRequest: CreateFlightBookingRequest = req.body;

      // Validate required fields
      if (!bookingRequest.flightData || !bookingRequest.passengers || !bookingRequest.contact || !bookingRequest.pricing) {
        const response: ApiResponse = {
          success: false,
          error: 'Missing required booking information',
        };
        res.status(400).json(response);
        return;
      }

      // Validate passengers
      if (!Array.isArray(bookingRequest.passengers) || bookingRequest.passengers.length === 0) {
        const response: ApiResponse = {
          success: false,
          error: 'At least one passenger is required',
        };
        res.status(400).json(response);
        return;
      }

      // Validate contact information
      if (!bookingRequest.contact.email || !bookingRequest.contact.phone || !bookingRequest.contact.firstName || !bookingRequest.contact.lastName) {
        const response: ApiResponse = {
          success: false,
          error: 'Complete contact information is required',
        };
        res.status(400).json(response);
        return;
      }

      const booking = await bookingService.createFlightBooking(bookingRequest);

      const response: ApiResponse = {
        success: true,
        data: booking,
        message: 'Flight booking created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Flight booking creation error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create flight booking',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Create a new hotel booking
   * POST /api/bookings/hotel
   */
  async createHotelBooking(req: Request, res: Response): Promise<void> {
    try {
      const bookingRequest: CreateHotelBookingRequest = req.body;

      // Validate required fields
      if (!bookingRequest.hotelData || !bookingRequest.guests || !bookingRequest.contact || !bookingRequest.pricing) {
        const response: ApiResponse = {
          success: false,
          error: 'Missing required booking information',
        };
        res.status(400).json(response);
        return;
      }

      // Validate guests
      if (!Array.isArray(bookingRequest.guests) || bookingRequest.guests.length === 0) {
        const response: ApiResponse = {
          success: false,
          error: 'At least one guest is required',
        };
        res.status(400).json(response);
        return;
      }

      // Validate contact information
      if (!bookingRequest.contact.email || !bookingRequest.contact.phone || !bookingRequest.contact.firstName || !bookingRequest.contact.lastName) {
        const response: ApiResponse = {
          success: false,
          error: 'Complete contact information is required',
        };
        res.status(400).json(response);
        return;
      }

      const booking = await bookingService.createHotelBooking(bookingRequest);

      const response: ApiResponse = {
        success: true,
        data: booking,
        message: 'Hotel booking created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Hotel booking creation error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create hotel booking',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get booking by ID
   * GET /api/bookings/:bookingId
   */
  async getBooking(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId } = req.params;

      if (!bookingId) {
        const response: ApiResponse = {
          success: false,
          error: 'Booking ID is required',
        };
        res.status(400).json(response);
        return;
      }

      const booking = await bookingService.getBookingById(bookingId);

      if (!booking) {
        const response: ApiResponse = {
          success: false,
          error: 'Booking not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: booking,
      };

      res.json(response);
    } catch (error) {
      console.error('Get booking error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get booking',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get user bookings
   * GET /api/bookings/user/:userId
   */
  async getUserBookings(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: 'User ID is required',
        };
        res.status(400).json(response);
        return;
      }

      const bookings = await bookingService.getUserBookings(userId);

      const response: ApiResponse = {
        success: true,
        data: bookings,
      };

      res.json(response);
    } catch (error) {
      console.error('Get user bookings error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user bookings',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get all bookings for admin
   * GET /api/bookings/admin/all
   */
  async getAllBookings(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20, status, type } = req.query;

      const result = await bookingService.getAllBookings(
        parseInt(page as string),
        parseInt(limit as string),
        status as string,
        type as 'flight' | 'hotel'
      );

      const response: ApiResponse = {
        success: true,
        data: result.bookings,
        meta: {
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
        },
      };

      res.json(response);
    } catch (error) {
      console.error('Get all bookings error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get bookings',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Update booking status
   * PUT /api/bookings/:bookingId/status
   */
  async updateBookingStatus(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId } = req.params;
      const { status } = req.body;

      if (!bookingId || !status) {
        const response: ApiResponse = {
          success: false,
          error: 'Booking ID and status are required',
        };
        res.status(400).json(response);
        return;
      }

      const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
      if (!validStatuses.includes(status)) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid status. Must be one of: pending, confirmed, cancelled, completed',
        };
        res.status(400).json(response);
        return;
      }

      const booking = await bookingService.updateBookingStatus(bookingId, status);

      if (!booking) {
        const response: ApiResponse = {
          success: false,
          error: 'Booking not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: booking,
        message: 'Booking status updated successfully',
      };

      res.json(response);
    } catch (error) {
      console.error('Update booking status error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update booking status',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Update payment status
   * PUT /api/bookings/:bookingId/payment
   */
  async updatePaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId } = req.params;
      const { paymentStatus, paymentMethod } = req.body;

      if (!bookingId || !paymentStatus) {
        const response: ApiResponse = {
          success: false,
          error: 'Booking ID and payment status are required',
        };
        res.status(400).json(response);
        return;
      }

      const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid payment status. Must be one of: pending, paid, failed, refunded',
        };
        res.status(400).json(response);
        return;
      }

      const booking = await bookingService.updatePaymentStatus(bookingId, paymentStatus, paymentMethod);

      if (!booking) {
        const response: ApiResponse = {
          success: false,
          error: 'Booking not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: booking,
        message: 'Payment status updated successfully',
      };

      res.json(response);
    } catch (error) {
      console.error('Update payment status error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update payment status',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get booking statistics
   * GET /api/bookings/admin/stats
   */
  async getBookingStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await bookingService.getBookingStats();

      const response: ApiResponse = {
        success: true,
        data: stats,
      };

      res.json(response);
    } catch (error) {
      console.error('Get booking stats error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get booking statistics',
      };
      res.status(500).json(response);
    }
  }
}

export const bookingController = new BookingController();
