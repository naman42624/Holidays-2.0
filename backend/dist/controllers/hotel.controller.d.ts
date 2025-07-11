import { Request, Response } from 'express';
export declare class HotelController {
    private handleError;
    searchHotels(req: Request, res: Response): Promise<void>;
    searchHotelsByLocation(req: Request, res: Response): Promise<void>;
    getHotelOffers(req: Request, res: Response): Promise<void>;
    getHotelOffer(req: Request, res: Response): Promise<void>;
    bookHotel(req: Request, res: Response): Promise<void>;
    getHotelRatings(req: Request, res: Response): Promise<void>;
}
export declare const hotelController: HotelController;
//# sourceMappingURL=hotel.controller.d.ts.map