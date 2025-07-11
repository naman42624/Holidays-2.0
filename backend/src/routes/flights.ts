import { Router } from 'express';
import { flightController } from '@/controllers/flight.controller';
import { query } from 'express-validator';
import { handleValidationErrors } from '@/middleware';

const router = Router();

/**
 * Flight search validation rules
 */
const flightSearchValidation = [
  query('originLocationCode')
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage('Origin location code must be 3 characters'),
  query('destinationLocationCode')
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage('Destination location code must be 3 characters'),
  query('departureDate')
    .isISO8601()
    .withMessage('Departure date must be in ISO 8601 format (YYYY-MM-DD)'),
  query('returnDate')
    .optional()
    .isISO8601()
    .withMessage('Return date must be in ISO 8601 format (YYYY-MM-DD)'),
  query('adults')
    .isInt({ min: 1, max: 9 })
    .withMessage('Adults must be between 1 and 9'),
  query('children')
    .optional()
    .isInt({ min: 0, max: 9 })
    .withMessage('Children must be between 0 and 9'),
  query('infants')
    .optional()
    .isInt({ min: 0, max: 9 })
    .withMessage('Infants must be between 0 and 9'),
  query('max')
    .optional()
    .isInt({ min: 1, max: 250 })
    .withMessage('Max results must be between 1 and 250'),
  query('currencyCode')
    .optional()
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency code must be 3 characters'),
  query('nonStop')
    .optional()
    .isBoolean()
    .withMessage('Non-stop must be a boolean'),
  query('travelClass')
    .optional()
    .isIn(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'])
    .withMessage('Travel class must be one of: ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST'),
];

/**
 * Flight destinations validation rules
 */
const flightDestinationsValidation = [
  query('origin')
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage('Origin must be 3 characters'),
  query('departureDate')
    .optional()
    .isISO8601()
    .withMessage('Departure date must be in ISO 8601 format (YYYY-MM-DD)'),
  query('oneWay')
    .optional()
    .isBoolean()
    .withMessage('One way must be a boolean'),
  query('nonStop')
    .optional()
    .isBoolean()
    .withMessage('Non-stop must be a boolean'),
  query('maxPrice')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max price must be a positive integer'),
];

/**
 * Flight dates validation rules
 */
const flightDatesValidation = [
  query('origin')
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage('Origin must be 3 characters'),
  query('destination')
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage('Destination must be 3 characters'),
  query('departureDate')
    .optional()
    .isISO8601()
    .withMessage('Departure date must be in ISO 8601 format (YYYY-MM-DD)'),
  query('oneWay')
    .optional()
    .isBoolean()
    .withMessage('One way must be a boolean'),
  query('nonStop')
    .optional()
    .isBoolean()
    .withMessage('Non-stop must be a boolean'),
  query('maxPrice')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max price must be a positive integer'),
];

/**
 * Airline codes validation rules
 */
const airlineCodesValidation = [
  query('codes')
    .isString()
    .custom((value) => {
      const codes = value.split(',');
      return codes.every((code: string) => code.length === 2);
    })
    .withMessage('Airline codes must be comma-separated 2-character codes'),
];

// Routes
router.get('/search', flightSearchValidation, handleValidationErrors, flightController.searchFlights);
router.post('/price', flightController.priceFlights);
router.get('/destinations', flightDestinationsValidation, handleValidationErrors, flightController.getDestinations);
router.get('/dates', flightDatesValidation, handleValidationErrors, flightController.getFlightDates);
router.post('/book', flightController.bookFlight);
router.get('/airlines', airlineCodesValidation, handleValidationErrors, flightController.getAirlines);

export default router;
