import mongoose, { Document } from 'mongoose';
export interface IBookingPassenger {
    title: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: 'male' | 'female' | 'other';
    nationality: string;
    passportNumber?: string;
    passportExpiry?: Date;
    email?: string;
    phone?: string;
}
export interface IBookingContact {
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
}
export interface IBookingExtras {
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
}
export interface IFlightBooking extends Document {
    _id: mongoose.Types.ObjectId;
    bookingId: string;
    userId?: mongoose.Types.ObjectId;
    type: 'flight';
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    flightData: {
        origin: string;
        destination: string;
        departureDate: Date;
        returnDate?: Date;
        flightOffers: any[];
        airline: string;
        flightNumber: string;
        duration: string;
        stops: number;
    };
    passengers: IBookingPassenger[];
    contact: IBookingContact;
    pricing: {
        basePrice: number;
        taxes: number;
        totalPrice: number;
        currency: string;
        extrasPrice?: number;
        finalPrice: number;
    };
    extras?: IBookingExtras;
    bookingDate: Date;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    paymentMethod?: string;
    confirmationNumber?: string;
    specialRequests?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IHotelBooking extends Document {
    _id: mongoose.Types.ObjectId;
    bookingId: string;
    userId?: mongoose.Types.ObjectId;
    type: 'hotel';
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    hotelData: {
        hotelId: string;
        name: string;
        address: {
            street: string;
            city: string;
            country: string;
            postalCode: string;
        };
        checkIn: Date;
        checkOut: Date;
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
    contact: IBookingContact;
    pricing: {
        basePrice: number;
        taxes: number;
        totalPrice: number;
        currency: string;
        finalPrice: number;
    };
    bookingDate: Date;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    paymentMethod?: string;
    confirmationNumber?: string;
    specialRequests?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const FlightBooking: mongoose.Model<IFlightBooking, {}, {}, {}, mongoose.Document<unknown, {}, IFlightBooking, {}> & IFlightBooking & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export declare const HotelBooking: mongoose.Model<IHotelBooking, {}, {}, {}, mongoose.Document<unknown, {}, IHotelBooking, {}> & IHotelBooking & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Booking.d.ts.map