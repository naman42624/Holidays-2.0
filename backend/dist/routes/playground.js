"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const playground_controller_1 = require("@/controllers/playground.controller");
const router = (0, express_1.Router)();
router.get('/', playground_controller_1.playgroundController.getPlaygroundData.bind(playground_controller_1.playgroundController));
router.get('/test', playground_controller_1.playgroundController.getTestData.bind(playground_controller_1.playgroundController));
router.post('/live-test', playground_controller_1.playgroundController.liveTest.bind(playground_controller_1.playgroundController));
exports.default = router;
//# sourceMappingURL=playground.js.map