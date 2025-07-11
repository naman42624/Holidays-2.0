"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_controller_1 = require("@/controllers/booking.controller");
const express_validator_1 = require("express-validator");
const middleware_1 = require("@/middleware");
const router = (0, express_1.Router)();
const createFlightBookingValidation = [
    (0, express_validator_1.body)('flightData')
        .isObject()
        .withMessage('Flight data is required'),
    (0, express_validator_1.body)('flightData.origin')
        .isString()
        .isLength({ min: 3, max: 3 })
        .withMessage('Origin must be a 3-character airport code'),
    (0, express_validator_1.body)('flightData.destination')
        .isString()
        .isLength({ min: 3, max: 3 })
        .withMessage('Destination must be a 3-character airport code'),
    (0, express_validator_1.body)('flightData.departureDate')
        .isISO8601()
        .withMessage('Departure date must be in ISO 8601 format'),
    (0, express_validator_1.body)('flightData.airline')
        .isString()
        .notEmpty()
        .withMessage('Airline is required'),
    (0, express_validator_1.body)('flightData.flightNumber')
        .isString()
        .notEmpty()
        .withMessage('Flight number is required'),
    (0, express_validator_1.body)('passengers')
        .isArray({ min: 1 })
        .withMessage('At least one passenger is required'),
    (0, express_validator_1.body)('passengers.*.firstName')
        .isString()
        .notEmpty()
        .withMessage('Passenger first name is required'),
    (0, express_validator_1.body)('passengers.*.lastName')
        .isString()
        .notEmpty()
        .withMessage('Passenger last name is required'),
    (0, express_validator_1.body)('passengers.*.dateOfBirth')
        .isISO8601()
        .withMessage('Passenger date of birth must be in ISO 8601 format'),
    (0, express_validator_1.body)('passengers.*.gender')
        .isIn(['male', 'female', 'other'])
        .withMessage('Passenger gender must be male, female, or other'),
    (0, express_validator_1.body)('passengers.*.nationality')
        .isString()
        .notEmpty()
        .withMessage('Passenger nationality is required'),
    (0, express_validator_1.body)('contact.firstName')
        .isString()
        .notEmpty()
        .withMessage('Contact first name is required'),
    (0, express_validator_1.body)('contact.lastName')
        .isString()
        .notEmpty()
        .withMessage('Contact last name is required'),
    (0, express_validator_1.body)('contact.email')
        .isEmail()
        .withMessage('Valid contact email is required'),
    (0, express_validator_1.body)('contact.phone')
        .isString()
        .notEmpty()
        .withMessage('Contact phone is required'),
    (0, express_validator_1.body)('contact.address.street')
        .isString()
        .notEmpty()
        .withMessage('Contact street address is required'),
    (0, express_validator_1.body)('contact.address.city')
        .isString()
        .notEmpty()
        .withMessage('Contact city is required'),
    (0, express_validator_1.body)('contact.address.country')
        .isString()
        .notEmpty()
        .withMessage('Contact country is required'),
    (0, express_validator_1.body)('contact.address.postalCode')
        .isString()
        .notEmpty()
        .withMessage('Contact postal code is required'),
    (0, express_validator_1.body)('pricing.basePrice')
        .isFloat({ min: 0 })
        .withMessage('Base price must be a positive number'),
    (0, express_validator_1.body)('pricing.taxes')
        .isFloat({ min: 0 })
        .withMessage('Taxes must be a positive number'),
    (0, express_validator_1.body)('pricing.totalPrice')
        .isFloat({ min: 0 })
        .withMessage('Total price must be a positive number'),
    (0, express_validator_1.body)('pricing.finalPrice')
        .isFloat({ min: 0 })
        .withMessage('Final price must be a positive number'),
    (0, express_validator_1.body)('pricing.currency')
        .isString()
        .isLength({ min: 3, max: 3 })
        .withMessage('Currency must be a 3-character code'),
];
const createHotelBookingValidation = [
    (0, express_validator_1.body)('hotelData')
        .isObject()
        .withMessage('Hotel data is required'),
    (0, express_validator_1.body)('hotelData.hotelId')
        .isString()
        .notEmpty()
        .withMessage('Hotel ID is required'),
    (0, express_validator_1.body)('hotelData.name')
        .isString()
        .notEmpty()
        .withMessage('Hotel name is required'),
    (0, express_validator_1.body)('hotelData.checkIn')
        .isISO8601()
        .withMessage('Check-in date must be in ISO 8601 format'),
    (0, express_validator_1.body)('hotelData.checkOut')
        .isISO8601()
        .withMessage('Check-out date must be in ISO 8601 format'),
    (0, express_validator_1.body)('hotelData.nights')
        .isInt({ min: 1 })
        .withMessage('Number of nights must be at least 1'),
    (0, express_validator_1.body)('hotelData.rooms')
        .isArray({ min: 1 })
        .withMessage('At least one room is required'),
    (0, express_validator_1.body)('guests')
        .isArray({ min: 1 })
        .withMessage('At least one guest is required'),
    (0, express_validator_1.body)('guests.*.firstName')
        .isString()
        .notEmpty()
        .withMessage('Guest first name is required'),
    (0, express_validator_1.body)('guests.*.lastName')
        .isString()
        .notEmpty()
        .withMessage('Guest last name is required'),
    (0, express_validator_1.body)('contact.firstName')
        .isString()
        .notEmpty()
        .withMessage('Contact first name is required'),
    (0, express_validator_1.body)('contact.lastName')
        .isString()
        .notEmpty()
        .withMessage('Contact last name is required'),
    (0, express_validator_1.body)('contact.email')
        .isEmail()
        .withMessage('Valid contact email is required'),
    (0, express_validator_1.body)('contact.phone')
        .isString()
        .notEmpty()
        .withMessage('Contact phone is required'),
    (0, express_validator_1.body)('contact.address.street')
        .isString()
        .notEmpty()
        .withMessage('Contact street address is required'),
    (0, express_validator_1.body)('contact.address.city')
        .isString()
        .notEmpty()
        .withMessage('Contact city is required'),
    (0, express_validator_1.body)('contact.address.country')
        .isString()
        .notEmpty()
        .withMessage('Contact country is required'),
    (0, express_validator_1.body)('contact.address.postalCode')
        .isString()
        .notEmpty()
        .withMessage('Contact postal code is required'),
    (0, express_validator_1.body)('pricing.basePrice')
        .isFloat({ min: 0 })
        .withMessage('Base price must be a positive number'),
    (0, express_validator_1.body)('pricing.taxes')
        .isFloat({ min: 0 })
        .withMessage('Taxes must be a positive number'),
    (0, express_validator_1.body)('pricing.totalPrice')
        .isFloat({ min: 0 })
        .withMessage('Total price must be a positive number'),
    (0, express_validator_1.body)('pricing.finalPrice')
        .isFloat({ min: 0 })
        .withMessage('Final price must be a positive number'),
    (0, express_validator_1.body)('pricing.currency')
        .isString()
        .isLength({ min: 3, max: 3 })
        .withMessage('Currency must be a 3-character code'),
];
const bookingIdValidation = [
    (0, express_validator_1.param)('bookingId')
        .isString()
        .notEmpty()
        .withMessage('Booking ID is required'),
];
const userIdValidation = [
    (0, express_validator_1.param)('userId')
        .isMongoId()
        .withMessage('Valid user ID is required'),
];
const statusUpdateValidation = [
    (0, express_validator_1.body)('status')
        .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
        .withMessage('Status must be one of: pending, confirmed, cancelled, completed'),
];
const paymentStatusUpdateValidation = [
    (0, express_validator_1.body)('paymentStatus')
        .isIn(['pending', 'paid', 'failed', 'refunded'])
        .withMessage('Payment status must be one of: pending, paid, failed, refunded'),
    (0, express_validator_1.body)('paymentMethod')
        .optional()
        .isString()
        .withMessage('Payment method must be a string'),
];
const adminQueryValidation = [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('status')
        .optional()
        .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
        .withMessage('Status must be one of: pending, confirmed, cancelled, completed'),
    (0, express_validator_1.query)('type')
        .optional()
        .isIn(['flight', 'hotel'])
        .withMessage('Type must be either flight or hotel'),
];
router.post('/flight', createFlightBookingValidation, middleware_1.handleValidationErrors, booking_controller_1.bookingController.createFlightBooking);
router.post('/hotel', createHotelBookingValidation, middleware_1.handleValidationErrors, booking_controller_1.bookingController.createHotelBooking);
router.get('/:bookingId', bookingIdValidation, middleware_1.handleValidationErrors, booking_controller_1.bookingController.getBooking);
router.get('/user/:userId', userIdValidation, middleware_1.handleValidationErrors, booking_controller_1.bookingController.getUserBookings);
router.get('/admin/all', adminQueryValidation, middleware_1.handleValidationErrors, booking_controller_1.bookingController.getAllBookings);
router.get('/admin/stats', booking_controller_1.bookingController.getBookingStats);
router.put('/:bookingId/status', bookingIdValidation.concat(statusUpdateValidation), middleware_1.handleValidationErrors, booking_controller_1.bookingController.updateBookingStatus);
router.put('/:bookingId/payment', bookingIdValidation.concat(paymentStatusUpdateValidation), middleware_1.handleValidationErrors, booking_controller_1.bookingController.updatePaymentStatus);
exports.default = router;
//# sourceMappingURL=bookings.js.map