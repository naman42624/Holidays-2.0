"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const activity_controller_1 = require("@/controllers/activity.controller");
const express_validator_1 = require("express-validator");
const middleware_1 = require("@/middleware");
const router = (0, express_1.Router)();
const activitySearchValidation = [
    (0, express_validator_1.query)('latitude')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    (0, express_validator_1.query)('longitude')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
    (0, express_validator_1.query)('radius')
        .optional()
        .isInt({ min: 1, max: 200 })
        .withMessage('Radius must be between 1 and 200 km'),
    (0, express_validator_1.query)('north')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('North boundary must be between -90 and 90'),
    (0, express_validator_1.query)('west')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('West boundary must be between -180 and 180'),
    (0, express_validator_1.query)('south')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('South boundary must be between -90 and 90'),
    (0, express_validator_1.query)('east')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('East boundary must be between -180 and 180'),
];
const activityIdValidation = [
    (0, express_validator_1.param)('id')
        .isString()
        .isLength({ min: 1 })
        .withMessage('Activity ID is required'),
];
const poiSearchValidation = [
    (0, express_validator_1.query)('latitude')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    (0, express_validator_1.query)('longitude')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
    (0, express_validator_1.query)('radius')
        .optional()
        .isInt({ min: 1, max: 200 })
        .withMessage('Radius must be between 1 and 200 km'),
    (0, express_validator_1.query)('categories')
        .optional()
        .isString()
        .withMessage('Categories must be a comma-separated string'),
];
const poiBySquareValidation = [
    (0, express_validator_1.query)('north')
        .isFloat({ min: -90, max: 90 })
        .withMessage('North boundary must be between -90 and 90'),
    (0, express_validator_1.query)('west')
        .isFloat({ min: -180, max: 180 })
        .withMessage('West boundary must be between -180 and 180'),
    (0, express_validator_1.query)('south')
        .isFloat({ min: -90, max: 90 })
        .withMessage('South boundary must be between -90 and 90'),
    (0, express_validator_1.query)('east')
        .isFloat({ min: -180, max: 180 })
        .withMessage('East boundary must be between -180 and 180'),
    (0, express_validator_1.query)('categories')
        .optional()
        .isString()
        .withMessage('Categories must be a comma-separated string'),
];
const poiIdValidation = [
    (0, express_validator_1.param)('id')
        .isString()
        .isLength({ min: 1 })
        .withMessage('Point of interest ID is required'),
];
router.get('/search', activitySearchValidation, middleware_1.handleValidationErrors, activity_controller_1.activityController.searchActivities);
router.get('/categories', activity_controller_1.activityController.getActivityCategories);
router.get('/points-of-interest', poiSearchValidation, middleware_1.handleValidationErrors, activity_controller_1.activityController.searchPointsOfInterest);
router.get('/points-of-interest-by-square', poiBySquareValidation, middleware_1.handleValidationErrors, activity_controller_1.activityController.getPointsOfInterestBySquare);
router.get('/points-of-interest/:id', poiIdValidation, middleware_1.handleValidationErrors, activity_controller_1.activityController.getPointOfInterestDetails);
router.post('/filter', activity_controller_1.activityController.filterActivities);
router.get('/:id', activityIdValidation, middleware_1.handleValidationErrors, activity_controller_1.activityController.getActivityDetails);
exports.default = router;
//# sourceMappingURL=activities.js.map