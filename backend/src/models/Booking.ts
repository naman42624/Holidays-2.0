import mongoose, { Document, Schema } from 'mongoose';

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
  
  // Flight details
  flightData: {
    origin: string;
    destination: string;
    departureDate: Date;
    returnDate?: Date;
    flightOffers: any[]; // Store the complete flight offer data
    airline: string;
    flightNumber: string;
    duration: string;
    stops: number;
  };
  
  // Passenger information
  passengers: IBookingPassenger[];
  contact: IBookingContact;
  
  // Pricing
  pricing: {
    basePrice: number;
    taxes: number;
    totalPrice: number;
    currency: string;
    extrasPrice?: number;
    finalPrice: number;
  };
  
  // Extras
  extras?: IBookingExtras;
  
  // Booking details
  bookingDate: Date;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  confirmationNumber?: string;
  
  // Special requests
  specialRequests?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface IHotelBooking extends Document {
  _id: mongoose.Types.ObjectId;
  bookingId: string;
  userId?: mongoose.Types.ObjectId;
  type: 'hotel';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  
  // Hotel details
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
  
  // Guest information
  guests: Array<{
    title: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    isMainGuest: boolean;
  }>;
  contact: IBookingContact;
  
  // Pricing
  pricing: {
    basePrice: number;
    taxes: number;
    totalPrice: number;
    currency: string;
    finalPrice: number;
  };
  
  // Booking details
  bookingDate: Date;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  confirmationNumber?: string;
  
  // Special requests
  specialRequests?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

const BookingPassengerSchema = new Schema<IBookingPassenger>({
  title: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  nationality: { type: String, required: true },
  passportNumber: { type: String },
  passportExpiry: { type: Date },
  email: { type: String },
  phone: { type: String },
});

const BookingContactSchema = new Schema<IBookingContact>({
  title: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  alternatePhone: { type: String },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
});

const FlightBookingSchema = new Schema<IFlightBooking>(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      default: () => `FLT${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Allow guest bookings
    },
    type: {
      type: String,
      default: 'flight',
      immutable: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    flightData: {
      origin: { type: String, required: true },
      destination: { type: String, required: true },
      departureDate: { type: Date, required: true },
      returnDate: { type: Date },
      flightOffers: [{ type: Schema.Types.Mixed }],
      airline: { type: String, required: true },
      flightNumber: { type: String, required: true },
      duration: { type: String, required: true },
      stops: { type: Number, required: true },
    },
    passengers: [BookingPassengerSchema],
    contact: BookingContactSchema,
    pricing: {
      basePrice: { type: Number, required: true },
      taxes: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
      currency: { type: String, required: true, default: 'USD' },
      extrasPrice: { type: Number, default: 0 },
      finalPrice: { type: Number, required: true },
    },
    extras: {
      seats: [{
        passengerId: { type: String, required: true },
        seatNumber: { type: String, required: true },
        price: { type: Number, required: true },
      }],
      meals: [{
        passengerId: { type: String, required: true },
        mealType: { type: String, required: true },
        price: { type: Number, required: true },
      }],
      baggage: [{
        passengerId: { type: String, required: true },
        weight: { type: Number, required: true },
        price: { type: Number, required: true },
      }],
    },
    bookingDate: { type: Date, default: Date.now },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: { type: String },
    confirmationNumber: { type: String },
    specialRequests: { type: String },
  },
  {
    timestamps: true,
  }
);

const HotelBookingSchema = new Schema<IHotelBooking>(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      default: () => `HTL${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Allow guest bookings
    },
    type: {
      type: String,
      default: 'hotel',
      immutable: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    hotelData: {
      hotelId: { type: String, required: true },
      name: { type: String, required: true },
      address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        country: { type: String, required: true },
        postalCode: { type: String, required: true },
      },
      checkIn: { type: Date, required: true },
      checkOut: { type: Date, required: true },
      nights: { type: Number, required: true },
      rooms: [{
        roomType: { type: String, required: true },
        roomName: { type: String, required: true },
        guests: { type: Number, required: true },
        price: { type: Number, required: true },
      }],
    },
    guests: [{
      title: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String },
      phone: { type: String },
      isMainGuest: { type: Boolean, default: false },
    }],
    contact: BookingContactSchema,
    pricing: {
      basePrice: { type: Number, required: true },
      taxes: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
      currency: { type: String, required: true, default: 'USD' },
      finalPrice: { type: Number, required: true },
    },
    bookingDate: { type: Date, default: Date.now },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: { type: String },
    confirmationNumber: { type: String },
    specialRequests: { type: String },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better performance
FlightBookingSchema.index({ bookingId: 1 });
FlightBookingSchema.index({ userId: 1 });
FlightBookingSchema.index({ status: 1 });
FlightBookingSchema.index({ bookingDate: -1 });
FlightBookingSchema.index({ 'contact.email': 1 });

HotelBookingSchema.index({ bookingId: 1 });
HotelBookingSchema.index({ userId: 1 });
HotelBookingSchema.index({ status: 1 });
HotelBookingSchema.index({ bookingDate: -1 });
HotelBookingSchema.index({ 'contact.email': 1 });

export const FlightBooking = mongoose.model<IFlightBooking>('FlightBooking', FlightBookingSchema);
export const HotelBooking = mongoose.model<IHotelBooking>('HotelBooking', HotelBookingSchema);
