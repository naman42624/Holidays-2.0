"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const flight_controller_1 = require("@/controllers/flight.controller");
const express_validator_1 = require("express-validator");
const middleware_1 = require("@/middleware");
const router = (0, express_1.Router)();
const flightSearchValidation = [
    (0, express_validator_1.query)('originLocationCode')
        .isString()
        .isLength({ min: 3, max: 3 })
        .withMessage('Origin location code must be 3 characters'),
    (0, express_validator_1.query)('destinationLocationCode')
        .isString()
        .isLength({ min: 3, max: 3 })
        .withMessage('Destination location code must be 3 characters'),
    (0, express_validator_1.query)('departureDate')
        .isISO8601()
        .withMessage('Departure date must be in ISO 8601 format (YYYY-MM-DD)'),
    (0, express_validator_1.query)('returnDate')
        .optional()
        .isISO8601()
        .withMessage('Return date must be in ISO 8601 format (YYYY-MM-DD)'),
    (0, express_validator_1.query)('adults')
        .isInt({ min: 1, max: 9 })
        .withMessage('Adults must be between 1 and 9'),
    (0, express_validator_1.query)('children')
        .optional()
        .isInt({ min: 0, max: 9 })
        .withMessage('Children must be between 0 and 9'),
    (0, express_validator_1.query)('infants')
        .optional()
        .isInt({ min: 0, max: 9 })
        .withMessage('Infants must be between 0 and 9'),
    (0, express_validator_1.query)('max')
        .optional()
        .isInt({ min: 1, max: 250 })
        .withMessage('Max results must be between 1 and 250'),
    (0, express_validator_1.query)('currencyCode')
        .optional()
        .isString()
        .isLength({ min: 3, max: 3 })
        .withMessage('Currency code must be 3 characters'),
    (0, express_validator_1.query)('nonStop')
        .optional()
        .isBoolean()
        .withMessage('Non-stop must be a boolean'),
    (0, express_validator_1.query)('travelClass')
        .optional()
        .isIn(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'])
        .withMessage('Travel class must be one of: ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST'),
];
const flightDestinationsValidation = [
    (0, express_validator_1.query)('origin')
        .isString()
        .isLength({ min: 3, max: 3 })
        .withMessage('Origin must be 3 characters'),
    (0, express_validator_1.query)('departureDate')
        .optional()
        .isISO8601()
        .withMessage('Departure date must be in ISO 8601 format (YYYY-MM-DD)'),
    (0, express_validator_1.query)('oneWay')
        .optional()
        .isBoolean()
        .withMessage('One way must be a boolean'),
    (0, express_validator_1.query)('nonStop')
        .optional()
        .isBoolean()
        .withMessage('Non-stop must be a boolean'),
    (0, express_validator_1.query)('maxPrice')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Max price must be a positive integer'),
];
const flightDatesValidation = [
    (0, express_validator_1.query)('origin')
        .isString()
        .isLength({ min: 3, max: 3 })
        .withMessage('Origin must be 3 characters'),
    (0, express_validator_1.query)('destination')
        .isString()
        .isLength({ min: 3, max: 3 })
        .withMessage('Destination must be 3 characters'),
    (0, express_validator_1.query)('departureDate')
        .optional()
        .isISO8601()
        .withMessage('Departure date must be in ISO 8601 format (YYYY-MM-DD)'),
    (0, express_validator_1.query)('oneWay')
        .optional()
        .isBoolean()
        .withMessage('One way must be a boolean'),
    (0, express_validator_1.query)('nonStop')
        .optional()
        .isBoolean()
        .withMessage('Non-stop must be a boolean'),
    (0, express_validator_1.query)('maxPrice')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Max price must be a positive integer'),
];
const airlineCodesValidation = [
    (0, express_validator_1.query)('codes')
        .isString()
        .custom((value) => {
        const codes = value.split(',');
        return codes.every((code) => code.length === 2);
    })
        .withMessage('Airline codes must be comma-separated 2-character codes'),
];
router.get('/search', flightSearchValidation, middleware_1.handleValidationErrors, flight_controller_1.flightController.searchFlights);
router.post('/price', flight_controller_1.flightController.priceFlights);
router.get('/destinations', flightDestinationsValidation, middleware_1.handleValidationErrors, flight_controller_1.flightController.getDestinations);
router.get('/dates', flightDatesValidation, middleware_1.handleValidationErrors, flight_controller_1.flightController.getFlightDates);
router.post('/book', flight_controller_1.flightController.bookFlight);
router.get('/airlines', airlineCodesValidation, middleware_1.handleValidationErrors, flight_controller_1.flightController.getAirlines);
exports.default = router;
//# sourceMappingURL=flights.js.map