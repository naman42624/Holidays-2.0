import { Router } from 'express';
import { activityController } from '@/controllers/activity.controller';
import { query, param } from 'express-validator';
import { handleValidationErrors } from '@/middleware';

const router = Router();

/**
 * Activity search validation rules
 */
const activitySearchValidation = [
  query('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('radius')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('Radius must be between 1 and 200 km'),
  query('north')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('North boundary must be between -90 and 90'),
  query('west')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('West boundary must be between -180 and 180'),
  query('south')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('South boundary must be between -90 and 90'),
  query('east')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('East boundary must be between -180 and 180'),
];

/**
 * Activity ID validation rules
 */
const activityIdValidation = [
  param('id')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Activity ID is required'),
];

/**
 * Points of interest search validation rules
 */
const poiSearchValidation = [
  query('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('radius')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('Radius must be between 1 and 200 km'),
  query('categories')
    .optional()
    .isString()
    .withMessage('Categories must be a comma-separated string'),
];

/**
 * Points of interest by square validation rules
 */
const poiBySquareValidation = [
  query('north')
    .isFloat({ min: -90, max: 90 })
    .withMessage('North boundary must be between -90 and 90'),
  query('west')
    .isFloat({ min: -180, max: 180 })
    .withMessage('West boundary must be between -180 and 180'),
  query('south')
    .isFloat({ min: -90, max: 90 })
    .withMessage('South boundary must be between -90 and 90'),
  query('east')
    .isFloat({ min: -180, max: 180 })
    .withMessage('East boundary must be between -180 and 180'),
  query('categories')
    .optional()
    .isString()
    .withMessage('Categories must be a comma-separated string'),
];

/**
 * Point of interest ID validation rules
 */
const poiIdValidation = [
  param('id')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Point of interest ID is required'),
];

// Routes
router.get('/search', activitySearchValidation, handleValidationErrors, activityController.searchActivities);
router.get('/categories', activityController.getActivityCategories);
router.get('/points-of-interest', poiSearchValidation, handleValidationErrors, activityController.searchPointsOfInterest);
router.get('/points-of-interest-by-square', poiBySquareValidation, handleValidationErrors, activityController.getPointsOfInterestBySquare);
router.get('/points-of-interest/:id', poiIdValidation, handleValidationErrors, activityController.getPointOfInterestDetails);
router.post('/filter', activityController.filterActivities);
router.get('/:id', activityIdValidation, handleValidationErrors, activityController.getActivityDetails);

export default router;
