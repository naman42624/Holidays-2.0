import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}
declare class TourPackageController {
    getAllTourPackages(req: AuthenticatedRequest, res: Response): Promise<void>;
    getTourPackageById(req: AuthenticatedRequest, res: Response): Promise<void>;
    createTourPackage(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateTourPackage(req: AuthenticatedRequest, res: Response): Promise<void>;
    deleteTourPackage(req: AuthenticatedRequest, res: Response): Promise<void>;
    togglePublishStatus(req: AuthenticatedRequest, res: Response): Promise<void>;
    searchTourPackages(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export declare const tourPackageController: TourPackageController;
export declare const tourPackageValidation: import("express-validator").ValidationChain[];
export {};
//# sourceMappingURL=tourPackage.controller.d.ts.map