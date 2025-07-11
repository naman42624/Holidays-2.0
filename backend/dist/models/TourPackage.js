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
exports.TourPackage = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ActivitySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Activity name is required'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Activity description is required'],
    },
    duration: {
        type: String,
        required: [true, 'Activity duration is required'],
    },
    included: {
        type: Boolean,
        default: true,
    },
});
const TourPackageSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Tour package title is required'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Tour package description is required'],
        maxlength: [5000, 'Description cannot be more than 5000 characters'],
    },
    price: {
        type: Number,
        required: [true, 'Tour package price is required'],
        min: [0, 'Price cannot be negative'],
    },
    duration: {
        type: String,
        required: [true, 'Tour package duration is required'],
        trim: true,
    },
    imageUrl: {
        type: String,
        required: [true, 'Tour package image URL is required'],
    },
    activities: {
        type: [ActivitySchema],
        default: [],
    },
    isPublished: {
        type: Boolean,
        default: false,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
TourPackageSchema.index({ title: 'text', description: 'text' });
exports.TourPackage = mongoose_1.default.model('TourPackage', TourPackageSchema);
//# sourceMappingURL=TourPackage.js.map