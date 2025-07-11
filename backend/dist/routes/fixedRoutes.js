"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Fixed route working!' });
});
router.get('/', (req, res) => {
    res.json({ success: true, message: 'Root fixed route working!', data: [] });
});
exports.default = router;
//# sourceMappingURL=fixedRoutes.js.map