"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hotel_controller_1 = require("@/controllers/hotel.controller");
const express_validator_1 = require("express-validator");
const middleware_1 = require("@/middleware");
const router = (0, express_1.Router)();
const hotelSearchValidation = [
    (0, express_validator_1.query)('cityCode')
        .isString()
        .isLength({ min: 3, max: 3 })
        .withMessage('City code must be 3 characters'),
    (0, express_validator_1.query)('checkInDate')
        .isISO8601()
        .withMessage('Check-in date must be in ISO 8601 format (YYYY-MM-DD)'),
    (0, express_validator_1.query)('checkOutDate')
        .isISO8601()
        .withMessage('Check-out date must be in ISO 8601 format (YYYY-MM-DD)'),
    (0, express_validator_1.query)('adults')
        .isInt({ min: 1, max: 9 })
        .withMessage('Adults must be between 1 and 9'),
    (0, express_validator_1.query)('children')
        .optional()
        .isInt({ min: 0, max: 9 })
        .withMessage('Children must be between 0 and 9'),
    (0, express_validator_1.query)('radius')
        .optional()
        .isInt({ min: 1, max: 300 })
        .withMessage('Radius must be between 1 and 300'),
    (0, express_validator_1.query)('radiusUnit')
        .optional()
        .isIn(['KM', 'MILE'])
        .withMessage('Radius unit must be either KM or MILE'),
    (0, express_validator_1.query)('ratings')
        .optional()
        .custom((value) => {
        const ratings = value.split(',');
        return ratings.every((rating) => {
            const r = parseInt(rating);
            return r >= 1 && r <= 5;
        });
    })
        .withMessage('Ratings must be comma-separated values between 1 and 5'),
    (0, express_validator_1.query)('currency')
        .optional()
        .isString()
        .isLength({ min: 3, max: 3 })
        .withMessage('Currency code must be 3 characters'),
];
const hotelSearchByLocationValidation = [
    (0, express_validator_1.query)('latitude')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    (0, express_validator_1.query)('longitude')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
    (0, express_validator_1.query)('checkInDate')
        .isISO8601()
        .withMessage('Check-in date must be in ISO 8601 format (YYYY-MM-DD)'),
    (0, express_validator_1.query)('checkOutDate')
        .isISO8601()
        .withMessage('Check-out date must be in ISO 8601 format (YYYY-MM-DD)'),
    (0, express_validator_1.query)('adults')
        .isInt({ min: 1, max: 9 })
        .withMessage('Adults must be between 1 and 9'),
    (0, express_validator_1.query)('radius')
        .optional()
        .isInt({ min: 1, max: 300 })
        .withMessage('Radius must be between 1 and 300'),
    (0, express_validator_1.query)('radiusUnit')
        .optional()
        .isIn(['KM', 'MILE'])
        .withMessage('Radius unit must be either KM or MILE'),
];
const hotelOffersValidation = [
    (0, express_validator_1.query)('hotelIds')
        .isString()
        .custom((value) => {
        const ids = value.split(',');
        return ids.length > 0 && ids.every((id) => id.trim().length > 0);
    })
        .withMessage('Hotel IDs must be comma-separated non-empty strings'),
    (0, express_validator_1.query)('adults')
        .isInt({ min: 1, max: 9 })
        .withMessage('Adults must be between 1 and 9'),
    (0, express_validator_1.query)('checkInDate')
        .isISO8601()
        .withMessage('Check-in date must be in ISO 8601 format (YYYY-MM-DD)'),
    (0, express_validator_1.query)('checkOutDate')
        .isISO8601()
        .withMessage('Check-out date must be in ISO 8601 format (YYYY-MM-DD)'),
    (0, express_validator_1.query)('countryOfResidence')
        .optional()
        .isString()
        .isLength({ min: 2, max: 2 })
        .withMessage('Country of residence must be 2 characters'),
    (0, express_validator_1.query)('roomQuantity')
        .optional()
        .isInt({ min: 1, max: 9 })
        .withMessage('Room quantity must be between 1 and 9'),
    (0, express_validator_1.query)('currency')
        .optional()
        .isString()
        .isLength({ min: 3, max: 3 })
        .withMessage('Currency code must be 3 characters'),
];
const hotelOfferDetailsValidation = [
    (0, express_validator_1.param)('offerId')
        .isString()
        .isLength({ min: 1 })
        .withMessage('Offer ID is required'),
    (0, express_validator_1.query)('lang')
        .optional()
        .isString()
        .isLength({ min: 2, max: 5 })
        .withMessage('Language code must be between 2 and 5 characters'),
];
const hotelRatingsValidation = [
    (0, express_validator_1.query)('hotelIds')
        .isString()
        .custom((value) => {
        const ids = value.split(',');
        return ids.length > 0 && ids.every((id) => id.trim().length > 0);
    })
        .withMessage('Hotel IDs must be comma-separated non-empty strings'),
];
router.get('/search', hotelSearchValidation, middleware_1.handleValidationErrors, (req, res) => hotel_controller_1.hotelController.searchHotels(req, res));
router.get('/search-by-location', hotelSearchByLocationValidation, middleware_1.handleValidationErrors, (req, res) => hotel_controller_1.hotelController.searchHotelsByLocation(req, res));
router.get('/offers', hotelOffersValidation, middleware_1.handleValidationErrors, (req, res) => hotel_controller_1.hotelController.getHotelOffers(req, res));
router.get('/offers/:offerId', hotelOfferDetailsValidation, middleware_1.handleValidationErrors, (req, res) => hotel_controller_1.hotelController.getHotelOffer(req, res));
router.post('/book', (req, res) => hotel_controller_1.hotelController.bookHotel(req, res));
router.get('/ratings', hotelRatingsValidation, middleware_1.handleValidationErrors, (req, res) => hotel_controller_1.hotelController.getHotelRatings(req, res));
exports.default = router;
//# sourceMappingURL=hotels.js.map