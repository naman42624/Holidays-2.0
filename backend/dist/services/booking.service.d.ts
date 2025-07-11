import { IFlightBooking, IHotelBooking } from '@/models/Booking';
export interface CreateFlightBookingRequest {
    flightData: {
        origin: string;
        destination: string;
        departureDate: string;
        returnDate?: string;
        flightOffers: any[];
        airline: string;
        flightNumber: string;
        duration: string;
        stops: number;
    };
    passengers: Array<{
        title: string;
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        gender: 'male' | 'female' | 'other';
        nationality: string;
        passportNumber?: string;
        passportExpiry?: string;
        email?: string;
        phone?: string;
    }>;
    contact: {
        title: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        alternatePhone?: string;
        address: {
            street: string;
            city: string;
            country: string;
            postalCode: string;
        };
    };
    pricing: {
        basePrice: number;
        taxes: number;
        totalPrice: number;
        currency: string;
        extrasPrice?: number;
        finalPrice: number;
    };
    extras?: {
        seats?: Array<{
            passengerId: string;
            seatNumber: string;
            price: number;
        }>;
        meals?: Array<{
            passengerId: string;
            mealType: string;
            price: number;
        }>;
        baggage?: Array<{
            passengerId: string;
            weight: number;
            price: number;
        }>;
    };
    specialRequests?: string;
    userId?: string;
}
export interface CreateHotelBookingRequest {
    hotelData: {
        hotelId: string;
        name: string;
        address: {
            street: string;
            city: string;
            country: string;
            postalCode: string;
        };
        checkIn: string;
        checkOut: string;
        nights: number;
        rooms: Array<{
            roomType: string;
            roomName: string;
            guests: number;
            price: number;
        }>;
    };
    guests: Array<{
        title: string;
        firstName: string;
        lastName: string;
        email?: string;
        phone?: string;
        isMainGuest: boolean;
    }>;
    contact: {
        title: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        alternatePhone?: string;
        address: {
            street: string;
            city: string;
            country: string;
            postalCode: string;
        };
    };
    pricing: {
        basePrice: number;
        taxes: number;
        totalPrice: number;
        currency: string;
        finalPrice: number;
    };
    specialRequests?: string;
    userId?: string;
}
declare class BookingService {
    createFlightBooking(bookingRequest: CreateFlightBookingRequest): Promise<IFlightBooking>;
    createHotelBooking(bookingRequest: CreateHotelBookingRequest): Promise<IHotelBooking>;
    private createGuestUser;
    getBookingById(bookingId: string): Promise<IFlightBooking | IHotelBooking | null>;
    getUserBookings(userId: string): Promise<Array<IFlightBooking | IHotelBooking>>;
    getAllBookings(page?: number, limit?: number, status?: string, type?: 'flight' | 'hotel'): Promise<{
        bookings: Array<IFlightBooking | IHotelBooking>;
        total: number;
        page: number;
        totalPages: number;
    }>;
    updateBookingStatus(bookingId: string, status: string): Promise<IFlightBooking | IHotelBooking | null>;
    updatePaymentStatus(bookingId: string, paymentStatus: string, paymentMethod?: string): Promise<IFlightBooking | IHotelBooking | null>;
    getBookingStats(): Promise<{
        totalBookings: number;
        flightBookings: number;
        hotelBookings: number;
        pendingBookings: number;
        confirmedBookings: number;
        totalRevenue: number;
        recentBookings: Array<IFlightBooking | IHotelBooking>;
    }>;
}
export declare const bookingService: BookingService;
export {};
//# sourceMappingURL=booking.service.d.ts.map