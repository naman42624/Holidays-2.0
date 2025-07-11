"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityController = exports.ActivityController = void 0;
const activity_service_1 = require("@/services/activity.service");
class ActivityController {
    async searchActivities(req, res) {
        try {
            const { latitude, longitude, radius, north, west, south, east, } = req.query;
            if ((!latitude || !longitude) && (!north || !west || !south || !east)) {
                const response = {
                    success: false,
                    error: 'Either latitude/longitude or bounding box (north, west, south, east) is required',
                };
                res.status(400).json(response);
                return;
            }
            const params = {};
            if (latitude && longitude) {
                params.latitude = parseFloat(latitude);
                params.longitude = parseFloat(longitude);
                if (radius) {
                    params.radius = parseInt(radius);
                }
            }
            else if (north && west && south && east) {
                params.north = parseFloat(north);
                params.west = parseFloat(west);
                params.south = parseFloat(south);
                params.east = parseFloat(east);
            }
            const result = await activity_service_1.activityService.searchActivities(params);
            const transformedActivities = activity_service_1.activityService.transformActivities(result.data);
            const response = {
                success: true,
                data: transformedActivities,
                meta: result.meta,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Activity search error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to search activities',
            };
            res.status(500).json(response);
        }
    }
    async getActivityDetails(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                const response = {
                    success: false,
                    error: 'Activity ID is required',
                };
                res.status(400).json(response);
                return;
            }
            const result = await activity_service_1.activityService.getActivityDetails(id);
            const transformedActivity = activity_service_1.activityService.transformActivities([result.data])[0];
            const response = {
                success: true,
                data: transformedActivity,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Activity details error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get activity details',
            };
            res.status(500).json(response);
        }
    }
    async searchPointsOfInterest(req, res) {
        try {
            const { latitude, longitude, radius, categories, } = req.query;
            if (!latitude || !longitude) {
                const response = {
                    success: false,
                    error: 'Latitude and longitude are required',
                };
                res.status(400).json(response);
                return;
            }
            const params = {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                ...(radius && { radius: parseInt(radius) }),
                ...(categories && { categories: categories.split(',') }),
            };
            const result = await activity_service_1.activityService.searchPointsOfInterest(params);
            const transformedPOIs = activity_service_1.activityService.transformPointsOfInterest(result.data);
            const response = {
                success: true,
                data: transformedPOIs,
                meta: result.meta,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Points of interest search error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to search points of interest',
            };
            res.status(500).json(response);
        }
    }
    async getPointsOfInterestBySquare(req, res) {
        try {
            const { north, west, south, east, categories, } = req.query;
            if (!north || !west || !south || !east) {
                const response = {
                    success: false,
                    error: 'Bounding box coordinates (north, west, south, east) are required',
                };
                res.status(400).json(response);
                return;
            }
            const params = {
                north: parseFloat(north),
                west: parseFloat(west),
                south: parseFloat(south),
                east: parseFloat(east),
                ...(categories && { categories: categories.split(',') }),
            };
            const result = await activity_service_1.activityService.getPointsOfInterestBySquare(params);
            const transformedPOIs = activity_service_1.activityService.transformPointsOfInterest(result.data);
            const response = {
                success: true,
                data: transformedPOIs,
                meta: result.meta,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Points of interest by square error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to search points of interest',
            };
            res.status(500).json(response);
        }
    }
    async getPointOfInterestDetails(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                const response = {
                    success: false,
                    error: 'Point of interest ID is required',
                };
                res.status(400).json(response);
                return;
            }
            const result = await activity_service_1.activityService.getPointOfInterestDetails(id);
            const response = {
                success: true,
                data: result.data,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Point of interest details error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get point of interest details',
            };
            res.status(500).json(response);
        }
    }
    async getActivityCategories(req, res) {
        try {
            const categories = activity_service_1.activityService.getActivityCategories();
            const response = {
                success: true,
                data: categories,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Activity categories error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get activity categories',
            };
            res.status(500).json(response);
        }
    }
    async filterActivities(req, res) {
        try {
            const { activities, filters } = req.body;
            if (!activities || !Array.isArray(activities)) {
                const response = {
                    success: false,
                    error: 'Activities array is required',
                };
                res.status(400).json(response);
                return;
            }
            const filteredActivities = activity_service_1.activityService.filterActivities(activities, filters || {});
            const response = {
                success: true,
                data: filteredActivities,
                meta: {
                    total: filteredActivities.length,
                },
            };
            res.json(response);
        }
        catch (error) {
            console.error('Activity filtering error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to filter activities',
            };
            res.status(500).json(response);
        }
    }
}
exports.ActivityController = ActivityController;
exports.activityController = new ActivityController();
//# sourceMappingURL=activity.controller.js.map