import { Router } from 'express';
import { playgroundController } from '@/controllers/playground.controller';

const router = Router();

/**
 * @route GET /api/playground
 * @desc Get playground information and available endpoints
 * @access Public
 */
router.get('/', playgroundController.getPlaygroundData.bind(playgroundController));

/**
 * @route GET /api/playground/test
 * @desc Get sample test data for API endpoints
 * @query type - Type of data to return (flight, location, hotel, activity, or all)
 * @access Public
 */
router.get('/test', playgroundController.getTestData.bind(playgroundController));

/**
 * @route POST /api/playground/live-test
 * @desc Test live API endpoints with real Amadeus data
 * @body endpoint - The endpoint to test
 * @body useDefaults - Whether to use default parameters
 * @body params - Custom parameters (if useDefaults is false)
 * @access Public
 */
router.post('/live-test', playgroundController.liveTest.bind(playgroundController));

export default router;
