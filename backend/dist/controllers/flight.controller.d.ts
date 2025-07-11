import { Request, Response } from 'express';
export declare class FlightController {
    searchFlights(req: Request, res: Response): Promise<void>;
    priceFlights(req: Request, res: Response): Promise<void>;
    getDestinations(req: Request, res: Response): Promise<void>;
    getFlightDates(req: Request, res: Response): Promise<void>;
    bookFlight(req: Request, res: Response): Promise<void>;
    getAirlines(req: Request, res: Response): Promise<void>;
}
export declare const flightController: FlightController;
//# sourceMappingURL=flight.controller.d.ts.map