import { Request, Response } from 'express';
declare class BookingController {
    createFlightBooking(req: Request, res: Response): Promise<void>;
    createHotelBooking(req: Request, res: Response): Promise<void>;
    getBooking(req: Request, res: Response): Promise<void>;
    getUserBookings(req: Request, res: Response): Promise<void>;
    getAllBookings(req: Request, res: Response): Promise<void>;
    updateBookingStatus(req: Request, res: Response): Promise<void>;
    updatePaymentStatus(req: Request, res: Response): Promise<void>;
    getBookingStats(req: Request, res: Response): Promise<void>;
}
export declare const bookingController: BookingController;
export {};
//# sourceMappingURL=booking.controller.d.ts.map