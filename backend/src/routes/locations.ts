import { Router } from 'express';
import { locationController } from '@/controllers/location.controller';
import { query, param } from 'express-validator';
import { handleValidationErrors } from '@/middleware';

const router = Router();

/**
 * Location search validation rules
 */
const locationSearchValidation = [
  query('keyword')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Keyword must be between 1 and 50 characters'),
  query('subType')
    .optional()
    .isString()
    .withMessage('SubType must be a string'),
  query('countryCode')
    .optional()
    .isString()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country code must be 2 characters'),
  query('view')
    .optional()
    .isIn(['FULL', 'LIGHT'])
    .withMessage('View must be either FULL or LIGHT'),
  query('sort')
    .optional()
    .isIn(['analytics.travelers.score', 'relevance'])
    .withMessage('Sort must be either analytics.travelers.score or relevance'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Limit must be between 1 and 20'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
];

/**
 * Location ID validation rules
 */
const locationIdValidation = [
  param('id')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Location ID is required'),
];

/**
 * City code validation rules
 */
const cityCodeValidation = [
  param('cityCode')
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage('City code must be 3 characters'),
];

/**
 * Airport code validation rules
 */
const airportCodeValidation = [
  param('code')
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage('Airport code must be 3 characters'),
];

/**
 * Nearby airports validation rules
 */
const nearbyAirportsValidation = [
  query('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('radius')
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage('Radius must be between 1 and 500 km'),
];

/**
 * Popular destinations validation rules
 */
const popularDestinationsValidation = [
  query('origin')
    .optional()
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage('Origin must be 3 characters'),
  query('period')
    .optional()
    .isString()
    .withMessage('Period must be a string'),
  query('max')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Max must be between 1 and 50'),
];

// Routes
router.get('/search', locationSearchValidation, handleValidationErrors, locationController.searchLocations);
router.get('/airports-by-city/:cityCode', cityCodeValidation, handleValidationErrors, locationController.getAirportsByCity);
router.get('/nearby-airports', nearbyAirportsValidation, handleValidationErrors, locationController.getNearbyAirports);
router.get('/popular-destinations', popularDestinationsValidation, handleValidationErrors, locationController.getPopularDestinations);
router.get('/airport/:code', airportCodeValidation, handleValidationErrors, locationController.getAirportInfo);
router.get('/:id', locationIdValidation, handleValidationErrors, locationController.getLocationDetails);

export default router;
