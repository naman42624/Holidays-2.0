"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tourPackage_controller_1 = require("@/controllers/tourPackage.controller");
const auth_1 = require("@/middleware/auth");
const roleAuth_1 = require("@/middleware/roleAuth");
const router = express_1.default.Router();
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Tour package router working!' });
});
console.log('Tour package router created with test route');
router.get('/admin/all', auth_1.authenticateToken, roleAuth_1.isContentEditor, tourPackage_controller_1.tourPackageController.getAllTourPackages.bind(tourPackage_controller_1.tourPackageController));
router.get('/admin/search', auth_1.authenticateToken, roleAuth_1.isContentEditor, tourPackage_controller_1.tourPackageController.searchTourPackages.bind(tourPackage_controller_1.tourPackageController));
router.get('/admin/:id', auth_1.authenticateToken, roleAuth_1.isContentEditor, tourPackage_controller_1.tourPackageController.getTourPackageById.bind(tourPackage_controller_1.tourPackageController));
router.patch('/:id/toggle-publish', auth_1.authenticateToken, roleAuth_1.isContentEditor, tourPackage_controller_1.tourPackageController.togglePublishStatus.bind(tourPackage_controller_1.tourPackageController));
router.get('/search', tourPackage_controller_1.tourPackageController.searchTourPackages.bind(tourPackage_controller_1.tourPackageController));
router.post('/', auth_1.authenticateToken, roleAuth_1.isContentEditor, tourPackage_controller_1.tourPackageValidation, tourPackage_controller_1.tourPackageController.createTourPackage.bind(tourPackage_controller_1.tourPackageController));
router.get('/:id', tourPackage_controller_1.tourPackageController.getTourPackageById.bind(tourPackage_controller_1.tourPackageController));
router.put('/:id', auth_1.authenticateToken, roleAuth_1.isContentEditor, tourPackage_controller_1.tourPackageValidation, tourPackage_controller_1.tourPackageController.updateTourPackage.bind(tourPackage_controller_1.tourPackageController));
router.delete('/:id', auth_1.authenticateToken, roleAuth_1.isContentEditor, tourPackage_controller_1.tourPackageController.deleteTourPackage.bind(tourPackage_controller_1.tourPackageController));
router.get('/', async (req, res) => {
    console.log('Tour packages root route hit!');
    try {
        await tourPackage_controller_1.tourPackageController.getAllTourPackages(req, res);
        console.log('Controller executed successfully');
    }
    catch (error) {
        console.error('Error in tour packages root route:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=tourPackages.js.map