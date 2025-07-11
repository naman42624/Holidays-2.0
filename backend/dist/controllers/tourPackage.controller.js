"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tourPackageValidation = exports.tourPackageController = void 0;
const tourPackage_service_1 = require("@/services/tourPackage.service");
const express_validator_1 = require("express-validator");
class TourPackageController {
    async getAllTourPackages(req, res) {
        try {
            const isAdmin = req.path.startsWith('/admin/');
            const packages = await tourPackage_service_1.tourPackageService.getAllTourPackages(isAdmin);
            const response = {
                success: true,
                data: packages,
            };
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Error getting all tour packages:', error);
            const response = {
                success: false,
                error: 'Error retrieving tour packages',
            };
            res.status(500).json(response);
        }
    }
    async getTourPackageById(req, res) {
        try {
            const isAdmin = req.path.startsWith('/admin/');
            const { id } = req.params;
            const tourPackage = await tourPackage_service_1.tourPackageService.getTourPackageById(id, isAdmin);
            if (!tourPackage) {
                const response = {
                    success: false,
                    error: 'Tour package not found',
                };
                res.status(404).json(response);
                return;
            }
            const response = {
                success: true,
                data: tourPackage,
            };
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Error getting tour package by ID:', error);
            const response = {
                success: false,
                error: 'Error retrieving tour package',
            };
            res.status(500).json(response);
        }
    }
    async createTourPackage(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const response = {
                    success: false,
                    error: errors.array()[0].msg,
                };
                res.status(400).json(response);
                return;
            }
            if (!req.user?.userId) {
                const response = {
                    success: false,
                    error: 'User ID not found',
                };
                res.status(401).json(response);
                return;
            }
            const tourPackage = await tourPackage_service_1.tourPackageService.createTourPackage(req.body, req.user.userId);
            const response = {
                success: true,
                data: tourPackage,
                message: 'Tour package created successfully'
            };
            res.status(201).json(response);
        }
        catch (error) {
            console.error('Error creating tour package:', error);
            const response = {
                success: false,
                error: 'Error creating tour package',
            };
            res.status(500).json(response);
        }
    }
    async updateTourPackage(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const response = {
                    success: false,
                    error: errors.array()[0].msg,
                };
                res.status(400).json(response);
                return;
            }
            const { id } = req.params;
            const tourPackage = await tourPackage_service_1.tourPackageService.updateTourPackage(id, req.body);
            if (!tourPackage) {
                const response = {
                    success: false,
                    error: 'Tour package not found',
                };
                res.status(404).json(response);
                return;
            }
            const response = {
                success: true,
                data: tourPackage,
                message: 'Tour package updated successfully'
            };
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Error updating tour package:', error);
            const response = {
                success: false,
                error: 'Error updating tour package',
            };
            res.status(500).json(response);
        }
    }
    async deleteTourPackage(req, res) {
        try {
            const { id } = req.params;
            const success = await tourPackage_service_1.tourPackageService.deleteTourPackage(id);
            if (!success) {
                const response = {
                    success: false,
                    error: 'Tour package not found',
                };
                res.status(404).json(response);
                return;
            }
            const response = {
                success: true,
                message: 'Tour package deleted successfully'
            };
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Error deleting tour package:', error);
            const response = {
                success: false,
                error: 'Error deleting tour package',
            };
            res.status(500).json(response);
        }
    }
    async togglePublishStatus(req, res) {
        try {
            const { id } = req.params;
            const tourPackage = await tourPackage_service_1.tourPackageService.togglePublishStatus(id);
            if (!tourPackage) {
                const response = {
                    success: false,
                    error: 'Tour package not found',
                };
                res.status(404).json(response);
                return;
            }
            const response = {
                success: true,
                data: tourPackage,
                message: `Tour package ${tourPackage.isPublished ? 'published' : 'unpublished'} successfully`
            };
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Error toggling publish status:', error);
            const response = {
                success: false,
                error: 'Error updating publish status',
            };
            res.status(500).json(response);
        }
    }
    async searchTourPackages(req, res) {
        try {
            const isAdmin = req.path.startsWith('/admin/');
            const { query } = req.query;
            if (!query) {
                const response = {
                    success: false,
                    error: 'Search query is required',
                };
                res.status(400).json(response);
                return;
            }
            const packages = await tourPackage_service_1.tourPackageService.searchTourPackages(query, isAdmin);
            const response = {
                success: true,
                data: packages,
            };
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Error searching tour packages:', error);
            const response = {
                success: false,
                error: 'Error searching tour packages',
            };
            res.status(500).json(response);
        }
    }
}
exports.tourPackageController = new TourPackageController();
exports.tourPackageValidation = [
    (0, express_validator_1.body)('title').notEmpty().withMessage('Title is required')
        .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Description is required')
        .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
    (0, express_validator_1.body)('price').notEmpty().withMessage('Price is required')
        .isNumeric().withMessage('Price must be a number')
        .custom((value) => value >= 0).withMessage('Price cannot be negative'),
    (0, express_validator_1.body)('duration').notEmpty().withMessage('Duration is required'),
    (0, express_validator_1.body)('imageUrl').notEmpty().withMessage('Image URL is required')
        .isURL().withMessage('Image URL must be a valid URL'),
    (0, express_validator_1.body)('activities').optional().isArray().withMessage('Activities must be an array'),
    (0, express_validator_1.body)('activities.*.name').optional().notEmpty().withMessage('Activity name is required'),
    (0, express_validator_1.body)('activities.*.description').optional().notEmpty().withMessage('Activity description is required'),
    (0, express_validator_1.body)('activities.*.duration').optional().notEmpty().withMessage('Activity duration is required'),
    (0, express_validator_1.body)('activities.*.included').optional().isBoolean().withMessage('Activity included must be a boolean'),
];
//# sourceMappingURL=tourPackage.controller.js.map