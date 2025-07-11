"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.userRoutes = router;
router.use(auth_1.authenticateToken);
router.get('/', user_controller_1.userController.getAllUsers);
router.get('/stats', user_controller_1.userController.getUserStats);
router.get('/:id', user_controller_1.userController.getUserById);
router.patch('/:id', [
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('firstName').optional().isLength({ min: 1 }).withMessage('First name is required'),
    (0, express_validator_1.body)('lastName').optional().isLength({ min: 1 }).withMessage('Last name is required'),
    (0, express_validator_1.body)('role').optional().isIn(['user', 'website-editor', 'super-admin']).withMessage('Invalid role'),
    (0, express_validator_1.body)('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
], user_controller_1.userController.updateUser);
router.delete('/:id', user_controller_1.userController.deleteUser);
router.post('/:id/reset-password', user_controller_1.userController.resetUserPassword);
router.post('/', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('firstName').isLength({ min: 1 }).withMessage('First name is required'),
    (0, express_validator_1.body)('lastName').isLength({ min: 1 }).withMessage('Last name is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('role').optional().isIn(['user', 'website-editor', 'super-admin']).withMessage('Invalid role'),
], user_controller_1.userController.createUser);
//# sourceMappingURL=user.routes.js.map