"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locationController = exports.LocationController = void 0;
const location_service_1 = require("@/services/location.service");
class LocationController {
    async searchLocations(req, res) {
        try {
            const { keyword, subType, countryCode, view, sort, limit, offset, } = req.query;
            if (!keyword) {
                const response = {
                    success: false,
                    error: 'Keyword is required',
                };
                res.status(400).json(response);
                return;
            }
            const params = {
                keyword: keyword,
                ...(subType && { subType: subType }),
                ...(countryCode && { countryCode: countryCode }),
                ...(view && { view: view }),
                ...(sort && { sort: sort }),
                page: {
                    ...(limit && { limit: parseInt(limit) }),
                    ...(offset && { offset: parseInt(offset) }),
                },
            };
            const result = await location_service_1.locationService.searchLocations(params);
            const transformedLocations = location_service_1.locationService.transformLocations(result.data);
            const response = {
                success: true,
                data: transformedLocations,
                meta: result.meta,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Location search error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to search locations',
            };
            res.status(500).json(response);
        }
    }
    async getLocationDetails(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                const response = {
                    success: false,
                    error: 'Location ID is required',
                };
                res.status(400).json(response);
                return;
            }
            const result = await location_service_1.locationService.getLocationDetails(id);
            const transformedLocation = location_service_1.locationService.transformLocations([result.data])[0];
            const response = {
                success: true,
                data: transformedLocation,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Location details error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get location details',
            };
            res.status(500).json(response);
        }
    }
    async getAirportsByCity(req, res) {
        try {
            const { cityCode } = req.params;
            if (!cityCode) {
                const response = {
                    success: false,
                    error: 'City code is required',
                };
                res.status(400).json(response);
                return;
            }
            const result = await location_service_1.locationService.getAirportsByCity(cityCode);
            const transformedAirports = location_service_1.locationService.transformLocations(result.data);
            const response = {
                success: true,
                data: transformedAirports,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Airports by city error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get airports',
            };
            res.status(500).json(response);
        }
    }
    async getNearbyAirports(req, res) {
        try {
            const { latitude, longitude, radius } = req.query;
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
            };
            const result = await location_service_1.locationService.getNearbyAirports(params);
            const transformedAirports = location_service_1.locationService.transformLocations(result.data);
            const response = {
                success: true,
                data: transformedAirports,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Nearby airports error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get nearby airports',
            };
            res.status(500).json(response);
        }
    }
    async getPopularDestinations(req, res) {
        try {
            const { origin, period, max } = req.query;
            const params = {
                ...(origin && { origin: origin }),
                ...(period && { period: period }),
                ...(max && { max: parseInt(max) }),
            };
            const result = await location_service_1.locationService.getPopularDestinations(params);
            const response = {
                success: true,
                data: result.data,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Popular destinations error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get popular destinations',
            };
            res.status(500).json(response);
        }
    }
    async getAirportInfo(req, res) {
        try {
            const { code } = req.params;
            if (!code) {
                const response = {
                    success: false,
                    error: 'Airport code is required',
                };
                res.status(400).json(response);
                return;
            }
            const result = await location_service_1.locationService.getAirportInfo(code);
            const response = {
                success: true,
                data: result.data,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Airport info error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get airport information',
            };
            res.status(500).json(response);
        }
    }
}
exports.LocationController = LocationController;
exports.locationController = new LocationController();
//# sourceMappingURL=location.controller.js.map