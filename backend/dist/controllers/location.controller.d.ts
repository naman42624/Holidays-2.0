import { Request, Response } from 'express';
export declare class LocationController {
    searchLocations(req: Request, res: Response): Promise<void>;
    getLocationDetails(req: Request, res: Response): Promise<void>;
    getAirportsByCity(req: Request, res: Response): Promise<void>;
    getNearbyAirports(req: Request, res: Response): Promise<void>;
    getPopularDestinations(req: Request, res: Response): Promise<void>;
    getAirportInfo(req: Request, res: Response): Promise<void>;
}
export declare const locationController: LocationController;
//# sourceMappingURL=location.controller.d.ts.map