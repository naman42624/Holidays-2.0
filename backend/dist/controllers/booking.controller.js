"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingController = void 0;
const booking_service_1 = require("@/services/booking.service");
class BookingController {
    async createFlightBooking(req, res) {
        try {
            const bookingRequest = req.body;
            if (!bookingRequest.flightData || !bookingRequest.passengers || !bookingRequest.contact || !bookingRequest.pricing) {
                const response = {
                    success: false,
                    error: 'Missing required booking information',
                };
                res.status(400).json(response);
                return;
            }
            if (!Array.isArray(bookingRequest.passengers) || bookingRequest.passengers.length === 0) {
                const response = {
                    success: false,
                    error: 'At least one passenger is required',
                };
                res.status(400).json(response);
                return;
            }
            if (!bookingRequest.contact.email || !bookingRequest.contact.phone || !bookingRequest.contact.firstName || !bookingRequest.contact.lastName) {
                const response = {
                    success: false,
                    error: 'Complete contact information is required',
                };
                res.status(400).json(response);
                return;
            }
            const booking = await booking_service_1.bookingService.createFlightBooking(bookingRequest);
            const response = {
                success: true,
                data: booking,
                message: 'Flight booking created successfully',
            };
            res.status(201).json(response);
        }
        catch (error) {
            console.error('Flight booking creation error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create flight booking',
            };
            res.status(500).json(response);
        }
    }
    async createHotelBooking(req, res) {
        try {
            const bookingRequest = req.body;
            if (!bookingRequest.hotelData || !bookingRequest.guests || !bookingRequest.contact || !bookingRequest.pricing) {
                const response = {
                    success: false,
                    error: 'Missing required booking information',
                };
                res.status(400).json(response);
                return;
            }
            if (!Array.isArray(bookingRequest.guests) || bookingRequest.guests.length === 0) {
                const response = {
                    success: false,
                    error: 'At least one guest is required',
                };
                res.status(400).json(response);
                return;
            }
            if (!bookingRequest.contact.email || !bookingRequest.contact.phone || !bookingRequest.contact.firstName || !bookingRequest.contact.lastName) {
                const response = {
                    success: false,
                    error: 'Complete contact information is required',
                };
                res.status(400).json(response);
                return;
            }
            const booking = await booking_service_1.bookingService.createHotelBooking(bookingRequest);
            const response = {
                success: true,
                data: booking,
                message: 'Hotel booking created successfully',
            };
            res.status(201).json(response);
        }
        catch (error) {
            console.error('Hotel booking creation error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create hotel booking',
            };
            res.status(500).json(response);
        }
    }
    async getBooking(req, res) {
        try {
            const { bookingId } = req.params;
            if (!bookingId) {
                const response = {
                    success: false,
                    error: 'Booking ID is required',
                };
                res.status(400).json(response);
                return;
            }
            const booking = await booking_service_1.bookingService.getBookingById(bookingId);
            if (!booking) {
                const response = {
                    success: false,
                    error: 'Booking not found',
                };
                res.status(404).json(response);
                return;
            }
            const response = {
                success: true,
                data: booking,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Get booking error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get booking',
            };
            res.status(500).json(response);
        }
    }
    async getUserBookings(req, res) {
        try {
            const { userId } = req.params;
            if (!userId) {
                const response = {
                    success: false,
                    error: 'User ID is required',
                };
                res.status(400).json(response);
                return;
            }
            const bookings = await booking_service_1.bookingService.getUserBookings(userId);
            const response = {
                success: true,
                data: bookings,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Get user bookings error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get user bookings',
            };
            res.status(500).json(response);
        }
    }
    async getAllBookings(req, res) {
        try {
            const { page = 1, limit = 20, status, type } = req.query;
            const result = await booking_service_1.bookingService.getAllBookings(parseInt(page), parseInt(limit), status, type);
            const response = {
                success: true,
                data: result.bookings,
                meta: {
                    page: result.page,
                    totalPages: result.totalPages,
                    total: result.total,
                },
            };
            res.json(response);
        }
        catch (error) {
            console.error('Get all bookings error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get bookings',
            };
            res.status(500).json(response);
        }
    }
    async updateBookingStatus(req, res) {
        try {
            const { bookingId } = req.params;
            const { status } = req.body;
            if (!bookingId || !status) {
                const response = {
                    success: false,
                    error: 'Booking ID and status are required',
                };
                res.status(400).json(response);
                return;
            }
            const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
            if (!validStatuses.includes(status)) {
                const response = {
                    success: false,
                    error: 'Invalid status. Must be one of: pending, confirmed, cancelled, completed',
                };
                res.status(400).json(response);
                return;
            }
            const booking = await booking_service_1.bookingService.updateBookingStatus(bookingId, status);
            if (!booking) {
                const response = {
                    success: false,
                    error: 'Booking not found',
                };
                res.status(404).json(response);
                return;
            }
            const response = {
                success: true,
                data: booking,
                message: 'Booking status updated successfully',
            };
            res.json(response);
        }
        catch (error) {
            console.error('Update booking status error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update booking status',
            };
            res.status(500).json(response);
        }
    }
    async updatePaymentStatus(req, res) {
        try {
            const { bookingId } = req.params;
            const { paymentStatus, paymentMethod } = req.body;
            if (!bookingId || !paymentStatus) {
                const response = {
                    success: false,
                    error: 'Booking ID and payment status are required',
                };
                res.status(400).json(response);
                return;
            }
            const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
            if (!validPaymentStatuses.includes(paymentStatus)) {
                const response = {
                    success: false,
                    error: 'Invalid payment status. Must be one of: pending, paid, failed, refunded',
                };
                res.status(400).json(response);
                return;
            }
            const booking = await booking_service_1.bookingService.updatePaymentStatus(bookingId, paymentStatus, paymentMethod);
            if (!booking) {
                const response = {
                    success: false,
                    error: 'Booking not found',
                };
                res.status(404).json(response);
                return;
            }
            const response = {
                success: true,
                data: booking,
                message: 'Payment status updated successfully',
            };
            res.json(response);
        }
        catch (error) {
            console.error('Update payment status error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update payment status',
            };
            res.status(500).json(response);
        }
    }
    async getBookingStats(req, res) {
        try {
            const stats = await booking_service_1.bookingService.getBookingStats();
            const response = {
                success: true,
                data: stats,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Get booking stats error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get booking statistics',
            };
            res.status(500).json(response);
        }
    }
}
exports.bookingController = new BookingController();
//# sourceMappingURL=booking.controller.js.map