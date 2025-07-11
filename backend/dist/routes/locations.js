"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const location_controller_1 = require("@/controllers/location.controller");
const express_validator_1 = require("express-validator");
const middleware_1 = require("@/middleware");
const router = (0, express_1.Router)();
const locationSearchValidation = [
    (0, express_validator_1.query)('keyword')
        .isString()
        .isLength({ min: 1, max: 50 })
        .withMessage('Keyword must be between 1 and 50 characters'),
    (0, express_validator_1.query)('subType')
        .optional()
        .isString()
        .withMessage('SubType must be a string'),
    (0, express_validator_1.query)('countryCode')
        .optional()
        .isString()
        .isLength({ min: 2, max: 2 })
        .withMessage('Country code must be 2 characters'),
    (0, express_validator_1.query)('view')
        .optional()
        .isIn(['FULL', 'LIGHT'])
        .withMessage('View must be either FULL or LIGHT'),
    (0, express_validator_1.query)('sort')
        .optional()
        .isIn(['analytics.travelers.score', 'relevance'])
        .withMessage('Sort must be either analytics.travelers.score or relevance'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 20 })
        .withMessage('Limit must be between 1 and 20'),
    (0, express_validator_1.query)('offset')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Offset must be a non-negative integer'),
];
const locationIdValidation = [
    (0, express_validator_1.param)('id')
        .isString()
        .isLength({ min: 1 })
        .withMessage('Location ID is required'),
];
const cityCodeValidation = [
    (0, express_validator_1.param)('cityCode')
        .isString()
        .isLength({ min: 3, max: 3 })
        .withMessage('City code must be 3 characters'),
];
const airportCodeValidation = [
    (0, express_validator_1.param)('code')
        .isString()
        .isLength({ min: 3, max: 3 })
        .withMessage('Airport code must be 3 characters'),
];
const nearbyAirportsValidation = [
    (0, express_validator_1.query)('latitude')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    (0, express_validator_1.query)('longitude')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
    (0, express_validator_1.query)('radius')
        .optional()
        .isInt({ min: 1, max: 500 })
        .withMessage('Radius must be between 1 and 500 km'),
];
const popularDestinationsValidation = [
    (0, express_validator_1.query)('origin')
        .optional()
        .isString()
        .isLength({ min: 3, max: 3 })
        .withMessage('Origin must be 3 characters'),
    (0, express_validator_1.query)('period')
        .optional()
        .isString()
        .withMessage('Period must be a string'),
    (0, express_validator_1.query)('max')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Max must be between 1 and 50'),
];
router.get('/search', locationSearchValidation, middleware_1.handleValidationErrors, location_controller_1.locationController.searchLocations);
router.get('/airports-by-city/:cityCode', cityCodeValidation, middleware_1.handleValidationErrors, location_controller_1.locationController.getAirportsByCity);
router.get('/nearby-airports', nearbyAirportsValidation, middleware_1.handleValidationErrors, location_controller_1.locationController.getNearbyAirports);
router.get('/popular-destinations', popularDestinationsValidation, middleware_1.handleValidationErrors, location_controller_1.locationController.getPopularDestinations);
router.get('/airport/:code', airportCodeValidation, middleware_1.handleValidationErrors, location_controller_1.locationController.getAirportInfo);
router.get('/:id', locationIdValidation, middleware_1.handleValidationErrors, location_controller_1.locationController.getLocationDetails);
exports.default = router;
//# sourceMappingURL=locations.js.map