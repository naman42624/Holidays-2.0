import { Router } from 'express';
import { bookingController } from '@/controllers/booking.controller';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '@/middleware';

const router = Router();

/**
 * Flight booking validation rules
 */
const createFlightBookingValidation = [
  body('flightData')
    .isObject()
    .withMessage('Flight data is required'),
  body('flightData.origin')
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage('Origin must be a 3-character airport code'),
  body('flightData.destination')
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage('Destination must be a 3-character airport code'),
  body('flightData.departureDate')
    .isISO8601()
    .withMessage('Departure date must be in ISO 8601 format'),
  body('flightData.airline')
    .isString()
    .notEmpty()
    .withMessage('Airline is required'),
  body('flightData.flightNumber')
    .isString()
    .notEmpty()
    .withMessage('Flight number is required'),
  body('passengers')
    .isArray({ min: 1 })
    .withMessage('At least one passenger is required'),
  body('passengers.*.firstName')
    .isString()
    .notEmpty()
    .withMessage('Passenger first name is required'),
  body('passengers.*.lastName')
    .isString()
    .notEmpty()
    .withMessage('Passenger last name is required'),
  body('passengers.*.dateOfBirth')
    .isISO8601()
    .withMessage('Passenger date of birth must be in ISO 8601 format'),
  body('passengers.*.gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Passenger gender must be male, female, or other'),
  body('passengers.*.nationality')
    .isString()
    .notEmpty()
    .withMessage('Passenger nationality is required'),
  body('contact.firstName')
    .isString()
    .notEmpty()
    .withMessage('Contact first name is required'),
  body('contact.lastName')
    .isString()
    .notEmpty()
    .withMessage('Contact last name is required'),
  body('contact.email')
    .isEmail()
    .withMessage('Valid contact email is required'),
  body('contact.phone')
    .isString()
    .notEmpty()
    .withMessage('Contact phone is required'),
  body('contact.address.street')
    .isString()
    .notEmpty()
    .withMessage('Contact street address is required'),
  body('contact.address.city')
    .isString()
    .notEmpty()
    .withMessage('Contact city is required'),
  body('contact.address.country')
    .isString()
    .notEmpty()
    .withMessage('Contact country is required'),
  body('contact.address.postalCode')
    .isString()
    .notEmpty()
    .withMessage('Contact postal code is required'),
  body('pricing.basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('pricing.taxes')
    .isFloat({ min: 0 })
    .withMessage('Taxes must be a positive number'),
  body('pricing.totalPrice')
    .isFloat({ min: 0 })
    .withMessage('Total price must be a positive number'),
  body('pricing.finalPrice')
    .isFloat({ min: 0 })
    .withMessage('Final price must be a positive number'),
  body('pricing.currency')
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-character code'),
];

/**
 * Hotel booking validation rules
 */
const createHotelBookingValidation = [
  body('hotelData')
    .isObject()
    .withMessage('Hotel data is required'),
  body('hotelData.hotelId')
    .isString()
    .notEmpty()
    .withMessage('Hotel ID is required'),
  body('hotelData.name')
    .isString()
    .notEmpty()
    .withMessage('Hotel name is required'),
  body('hotelData.checkIn')
    .isISO8601()
    .withMessage('Check-in date must be in ISO 8601 format'),
  body('hotelData.checkOut')
    .isISO8601()
    .withMessage('Check-out date must be in ISO 8601 format'),
  body('hotelData.nights')
    .isInt({ min: 1 })
    .withMessage('Number of nights must be at least 1'),
  body('hotelData.rooms')
    .isArray({ min: 1 })
    .withMessage('At least one room is required'),
  body('guests')
    .isArray({ min: 1 })
    .withMessage('At least one guest is required'),
  body('guests.*.firstName')
    .isString()
    .notEmpty()
    .withMessage('Guest first name is required'),
  body('guests.*.lastName')
    .isString()
    .notEmpty()
    .withMessage('Guest last name is required'),
  body('contact.firstName')
    .isString()
    .notEmpty()
    .withMessage('Contact first name is required'),
  body('contact.lastName')
    .isString()
    .notEmpty()
    .withMessage('Contact last name is required'),
  body('contact.email')
    .isEmail()
    .withMessage('Valid contact email is required'),
  body('contact.phone')
    .isString()
    .notEmpty()
    .withMessage('Contact phone is required'),
  body('contact.address.street')
    .isString()
    .notEmpty()
    .withMessage('Contact street address is required'),
  body('contact.address.city')
    .isString()
    .notEmpty()
    .withMessage('Contact city is required'),
  body('contact.address.country')
    .isString()
    .notEmpty()
    .withMessage('Contact country is required'),
  body('contact.address.postalCode')
    .isString()
    .notEmpty()
    .withMessage('Contact postal code is required'),
  body('pricing.basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('pricing.taxes')
    .isFloat({ min: 0 })
    .withMessage('Taxes must be a positive number'),
  body('pricing.totalPrice')
    .isFloat({ min: 0 })
    .withMessage('Total price must be a positive number'),
  body('pricing.finalPrice')
    .isFloat({ min: 0 })
    .withMessage('Final price must be a positive number'),
  body('pricing.currency')
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-character code'),
];

/**
 * Booking ID validation
 */
const bookingIdValidation = [
  param('bookingId')
    .isString()
    .notEmpty()
    .withMessage('Booking ID is required'),
];

/**
 * User ID validation
 */
const userIdValidation = [
  param('userId')
    .isMongoId()
    .withMessage('Valid user ID is required'),
];

/**
 * Status update validation
 */
const statusUpdateValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
    .withMessage('Status must be one of: pending, confirmed, cancelled, completed'),
];

/**
 * Payment status update validation
 */
const paymentStatusUpdateValidation = [
  body('paymentStatus')
    .isIn(['pending', 'paid', 'failed', 'refunded'])
    .withMessage('Payment status must be one of: pending, paid, failed, refunded'),
  body('paymentMethod')
    .optional()
    .isString()
    .withMessage('Payment method must be a string'),
];

/**
 * Admin query validation
 */
const adminQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
    .withMessage('Status must be one of: pending, confirmed, cancelled, completed'),
  query('type')
    .optional()
    .isIn(['flight', 'hotel'])
    .withMessage('Type must be either flight or hotel'),
];

// Booking creation routes
router.post('/flight', createFlightBookingValidation, handleValidationErrors, bookingController.createFlightBooking);
router.post('/hotel', createHotelBookingValidation, handleValidationErrors, bookingController.createHotelBooking);

// Booking retrieval routes
router.get('/:bookingId', bookingIdValidation, handleValidationErrors, bookingController.getBooking);
router.get('/user/:userId', userIdValidation, handleValidationErrors, bookingController.getUserBookings);

// Admin routes
router.get('/admin/all', adminQueryValidation, handleValidationErrors, bookingController.getAllBookings);
router.get('/admin/stats', bookingController.getBookingStats);

// Booking update routes
router.put('/:bookingId/status', bookingIdValidation.concat(statusUpdateValidation), handleValidationErrors, bookingController.updateBookingStatus);
router.put('/:bookingId/payment', bookingIdValidation.concat(paymentStatusUpdateValidation), handleValidationErrors, bookingController.updatePaymentStatus);

export default router;
