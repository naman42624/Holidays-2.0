import { TourPackage, ITourPackage } from '@/models/TourPackage';
import mongoose from 'mongoose';

class TourPackageService {
  /**
   * Get all tour packages
   */
  async getAllTourPackages(isAdmin: boolean = false): Promise<ITourPackage[]> {
    const query = isAdmin ? {} : { isPublished: true };
    return TourPackage.find(query).sort({ createdAt: -1 });
  }

  /**
   * Get tour package by ID
   */
  async getTourPackageById(id: string, isAdmin: boolean = false): Promise<ITourPackage | null> {
    const query = isAdmin 
      ? { _id: id } 
      : { _id: id, isPublished: true };
      
    return TourPackage.findOne(query);
  }

  /**
   * Create new tour package
   */
  async createTourPackage(packageData: Partial<ITourPackage>, userId: string): Promise<ITourPackage> {
    const tourPackage = new TourPackage({
      ...packageData,
      createdBy: new mongoose.Types.ObjectId(userId),
    });
    
    return tourPackage.save();
  }

  /**
   * Update tour package
   */
  async updateTourPackage(
    id: string, 
    packageData: Partial<ITourPackage>, 
  ): Promise<ITourPackage | null> {
    return TourPackage.findByIdAndUpdate(
      id,
      { $set: packageData },
      { new: true, runValidators: true }
    );
  }

  /**
   * Delete tour package
   */
  async deleteTourPackage(id: string): Promise<boolean> {
    const result = await TourPackage.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * Toggle tour package publish status
   */
  async togglePublishStatus(id: string): Promise<ITourPackage | null> {
    const tourPackage = await TourPackage.findById(id);
    if (!tourPackage) return null;
    
    tourPackage.isPublished = !tourPackage.isPublished;
    return tourPackage.save();
  }

  /**
   * Search tour packages
   */
  async searchTourPackages(query: string, isAdmin: boolean = false): Promise<ITourPackage[]> {
    const searchQuery = isAdmin 
      ? { $text: { $search: query } } 
      : { $text: { $search: query }, isPublished: true };
      
    return TourPackage.find(searchQuery).sort({ score: { $meta: "textScore" } });
  }
}

export const tourPackageService = new TourPackageService();
