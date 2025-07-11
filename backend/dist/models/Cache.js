"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachedActivity = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CachedLocationSchema = new mongoose_1.Schema({
    keyword: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    searchParams: {
        type: mongoose_1.Schema.Types.Mixed,
        required: true,
    },
    data: {
        type: mongoose_1.Schema.Types.Mixed,
        required: true,
    },
    meta: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
}, {
    timestamps: true,
});
CachedLocationSchema.index({ keyword: 1, searchParams: 1 });
CachedLocationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
exports.default = mongoose_1.default.model('CachedLocation', CachedLocationSchema);
const CachedActivitySchema = new mongoose_1.Schema({
    locationKey: {
        type: String,
        required: true,
    },
    searchParams: {
        type: mongoose_1.Schema.Types.Mixed,
        required: true,
    },
    data: {
        type: mongoose_1.Schema.Types.Mixed,
        required: true,
    },
    meta: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 12 * 60 * 60 * 1000),
    },
}, {
    timestamps: true,
});
CachedActivitySchema.index({ locationKey: 1, searchParams: 1 });
CachedActivitySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
exports.CachedActivity = mongoose_1.default.model('CachedActivity', CachedActivitySchema);
//# sourceMappingURL=Cache.js.map