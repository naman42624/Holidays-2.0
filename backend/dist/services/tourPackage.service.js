"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tourPackageService = void 0;
const TourPackage_1 = require("@/models/TourPackage");
const mongoose_1 = __importDefault(require("mongoose"));
class TourPackageService {
    async getAllTourPackages(isAdmin = false) {
        const query = isAdmin ? {} : { isPublished: true };
        return TourPackage_1.TourPackage.find(query).sort({ createdAt: -1 });
    }
    async getTourPackageById(id, isAdmin = false) {
        const query = isAdmin
            ? { _id: id }
            : { _id: id, isPublished: true };
        return TourPackage_1.TourPackage.findOne(query);
    }
    async createTourPackage(packageData, userId) {
        const tourPackage = new TourPackage_1.TourPackage({
            ...packageData,
            createdBy: new mongoose_1.default.Types.ObjectId(userId),
        });
        return tourPackage.save();
    }
    async updateTourPackage(id, packageData) {
        return TourPackage_1.TourPackage.findByIdAndUpdate(id, { $set: packageData }, { new: true, runValidators: true });
    }
    async deleteTourPackage(id) {
        const result = await TourPackage_1.TourPackage.findByIdAndDelete(id);
        return !!result;
    }
    async togglePublishStatus(id) {
        const tourPackage = await TourPackage_1.TourPackage.findById(id);
        if (!tourPackage)
            return null;
        tourPackage.isPublished = !tourPackage.isPublished;
        return tourPackage.save();
    }
    async searchTourPackages(query, isAdmin = false) {
        const searchQuery = isAdmin
            ? { $text: { $search: query } }
            : { $text: { $search: query }, isPublished: true };
        return TourPackage_1.TourPackage.find(searchQuery).sort({ score: { $meta: "textScore" } });
    }
}
exports.tourPackageService = new TourPackageService();
//# sourceMappingURL=tourPackage.service.js.map