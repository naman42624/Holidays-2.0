import { Request, Response } from 'express';
export declare class ActivityController {
    searchActivities(req: Request, res: Response): Promise<void>;
    getActivityDetails(req: Request, res: Response): Promise<void>;
    searchPointsOfInterest(req: Request, res: Response): Promise<void>;
    getPointsOfInterestBySquare(req: Request, res: Response): Promise<void>;
    getPointOfInterestDetails(req: Request, res: Response): Promise<void>;
    getActivityCategories(req: Request, res: Response): Promise<void>;
    filterActivities(req: Request, res: Response): Promise<void>;
}
export declare const activityController: ActivityController;
//# sourceMappingURL=activity.controller.d.ts.map