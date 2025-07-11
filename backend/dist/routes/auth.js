"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("@/controllers/auth.controller");
const auth_1 = require("@/middleware/auth");
const router = (0, express_1.Router)();
router.post('/register', auth_controller_1.registerValidation, auth_controller_1.authController.register.bind(auth_controller_1.authController));
router.post('/login', auth_controller_1.loginValidation, auth_controller_1.authController.login.bind(auth_controller_1.authController));
router.get('/profile', auth_1.authenticateToken, auth_controller_1.authController.getProfile.bind(auth_controller_1.authController));
router.put('/profile', auth_1.authenticateToken, auth_controller_1.authController.updateProfile.bind(auth_controller_1.authController));
router.put('/change-password', auth_1.authenticateToken, auth_controller_1.changePasswordValidation, auth_controller_1.authController.changePassword.bind(auth_controller_1.authController));
router.post('/refresh', auth_controller_1.authController.refreshToken.bind(auth_controller_1.authController));
router.post('/logout', auth_controller_1.authController.logout.bind(auth_controller_1.authController));
exports.default = router;
//# sourceMappingURL=auth.js.map