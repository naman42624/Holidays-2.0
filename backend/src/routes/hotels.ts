import { Router, Request, Response } from 'express';
import { hotelController } from '@/controllers/hotel.controller';
import { query, param } from 'express-validator';
import { handleValidationErrors } from '@/middleware';

const router = Router();

/**
 * Hotel search validation rules
 */
const hotelSearchValidation = [
  query('cityCode')
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage('City code must be 3 characters'),
  query('checkInDate')
    .isISO8601()
    .withMessage('Check-in date must be in ISO 8601 format (YYYY-MM-DD)'),
  query('checkOutDate')
    .isISO8601()
    .withMessage('Check-out date must be in ISO 8601 format (YYYY-MM-DD)'),
  query('adults')
    .isInt({ min: 1, max: 9 })
    .withMessage('Adults must be between 1 and 9'),
  query('children')
    .optional()
    .isInt({ min: 0, max: 9 })
    .withMessage('Children must be between 0 and 9'),
  query('radius')
    .optional()
    .isInt({ min: 1, max: 300 })
    .withMessage('Radius must be between 1 and 300'),
  query('radiusUnit')
    .optional()
    .isIn(['KM', 'MILE'])
    .withMessage('Radius unit must be either KM or MILE'),
  query('ratings')
    .optional()
    .custom((value) => {
      const ratings = value.split(',');
      return ratings.every((rating: string) => {
        const r = parseInt(rating);
        return r >= 1 && r <= 5;
      });
    })
    .withMessage('Ratings must be comma-separated values between 1 and 5'),
  query('currency')
    .optional()
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency code must be 3 characters'),
];

/**
 * Hotel search by location validation rules
 */
const hotelSearchByLocationValidation = [
  query('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('checkInDate')
    .isISO8601()
    .withMessage('Check-in date must be in ISO 8601 format (YYYY-MM-DD)'),
  query('checkOutDate')
    .isISO8601()
    .withMessage('Check-out date must be in ISO 8601 format (YYYY-MM-DD)'),
  query('adults')
    .isInt({ min: 1, max: 9 })
    .withMessage('Adults must be between 1 and 9'),
  query('radius')
    .optional()
    .isInt({ min: 1, max: 300 })
    .withMessage('Radius must be between 1 and 300'),
  query('radiusUnit')
    .optional()
    .isIn(['KM', 'MILE'])
    .withMessage('Radius unit must be either KM or MILE'),
];

/**
 * Hotel offers validation rules
 */
const hotelOffersValidation = [
  query('hotelIds')
    .isString()
    .custom((value) => {
      const ids = value.split(',');
      return ids.length > 0 && ids.every((id: string) => id.trim().length > 0);
    })
    .withMessage('Hotel IDs must be comma-separated non-empty strings'),
  query('adults')
    .isInt({ min: 1, max: 9 })
    .withMessage('Adults must be between 1 and 9'),
  query('checkInDate')
    .isISO8601()
    .withMessage('Check-in date must be in ISO 8601 format (YYYY-MM-DD)'),
  query('checkOutDate')
    .isISO8601()
    .withMessage('Check-out date must be in ISO 8601 format (YYYY-MM-DD)'),
  query('countryOfResidence')
    .optional()
    .isString()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country of residence must be 2 characters'),
  query('roomQuantity')
    .optional()
    .isInt({ min: 1, max: 9 })
    .withMessage('Room quantity must be between 1 and 9'),
  query('currency')
    .optional()
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency code must be 3 characters'),
];

/**
 * Hotel offer details validation rules
 */
const hotelOfferDetailsValidation = [
  param('offerId')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Offer ID is required'),
  query('lang')
    .optional()
    .isString()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language code must be between 2 and 5 characters'),
];

/**
 * Hotel ratings validation rules
 */
const hotelRatingsValidation = [
  query('hotelIds')
    .isString()
    .custom((value) => {
      const ids = value.split(',');
      return ids.length > 0 && ids.every((id: string) => id.trim().length > 0);
    })
    .withMessage('Hotel IDs must be comma-separated non-empty strings'),
];

// Routes
router.get('/search', hotelSearchValidation, handleValidationErrors, (req: Request, res: Response) => hotelController.searchHotels(req, res));
router.get('/search-by-location', hotelSearchByLocationValidation, handleValidationErrors, (req: Request, res: Response) => hotelController.searchHotelsByLocation(req, res));
router.get('/offers', hotelOffersValidation, handleValidationErrors, (req: Request, res: Response) => hotelController.getHotelOffers(req, res));
router.get('/offers/:offerId', hotelOfferDetailsValidation, handleValidationErrors, (req: Request, res: Response) => hotelController.getHotelOffer(req, res));
router.post('/book', (req: Request, res: Response) => hotelController.bookHotel(req, res));
router.get('/ratings', hotelRatingsValidation, handleValidationErrors, (req: Request, res: Response) => hotelController.getHotelRatings(req, res));

export default router;
