import { ITourPackage } from '@/models/TourPackage';
declare class TourPackageService {
    getAllTourPackages(isAdmin?: boolean): Promise<ITourPackage[]>;
    getTourPackageById(id: string, isAdmin?: boolean): Promise<ITourPackage | null>;
    createTourPackage(packageData: Partial<ITourPackage>, userId: string): Promise<ITourPackage>;
    updateTourPackage(id: string, packageData: Partial<ITourPackage>): Promise<ITourPackage | null>;
    deleteTourPackage(id: string): Promise<boolean>;
    togglePublishStatus(id: string): Promise<ITourPackage | null>;
    searchTourPackages(query: string, isAdmin?: boolean): Promise<ITourPackage[]>;
}
export declare const tourPackageService: TourPackageService;
export {};
//# sourceMappingURL=tourPackage.service.d.ts.map